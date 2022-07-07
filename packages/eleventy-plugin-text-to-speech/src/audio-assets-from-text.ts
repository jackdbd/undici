import crypto from 'node:crypto'
import makeDebug from 'debug'
import * as eleventyFetch from '@11ty/eleventy-fetch'
import type { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { DEBUG_PREFIX } from './constants.js'
import { synthesizeSpeech } from './text-to-speech.js'
import type { AudioEncoding } from './types'
import { audioExtension } from './utils.js'
import type { Writer } from './writers.js'

const debug = makeDebug(`${DEBUG_PREFIX}/audio-assets-from-text`)

interface Config {
  audioEncodings: AudioEncoding[]
  cacheExpiration: string
  outputPath: string
  text: string
  textToSpeechClient: TextToSpeechClient
  voice: string
  writer: Writer
}

/**
 * Synthesize a `text` into audio assets using the Cloud Text-to-Speech API.
 *
 * Generate as many audio buffers as the specified `audioEncodings`,
 * using the specified `voice`.
 *
 * Write all generated audio assets using the specified `writer`.
 */
export const audioAssetsFromText = async ({
  audioEncodings,
  cacheExpiration,
  outputPath,
  text,
  textToSpeechClient,
  voice,
  writer
}: Config) => {
  const md5 = crypto.createHash('md5')
  const contentHash = md5.update(text).digest('hex')
  const audioBasename = contentHash

  const languageCode = voice.slice(0, 5)
  const name = voice
  debug(
    `synthesize audio content on ${outputPath} (hash: ${contentHash}) using voice ${voice}`
  )

  const conversionPromises = audioEncodings.map(async (audioEncoding) => {
    const extension = audioExtension(audioEncoding)
    const assetName = `${audioBasename}.${extension}`

    // TODO: use AssetCache when self-hosting, and RemoteAssetCache when hosting
    // on Cloud Storage
    // https://github.com/11ty/eleventy-fetch/blob/master/src/AssetCache.js
    // https://github.com/11ty/eleventy-fetch/blob/master/src/RemoteAssetCache.js
    // https://www.11ty.dev/docs/plugins/fetch/#options
    const AssetCache = (eleventyFetch as any).AssetCache

    const uniqueKey = `${contentHash}_${extension}_${audioEncoding}`
    const cachedAsset = new AssetCache(uniqueKey)

    if (cachedAsset.isCacheValid(cacheExpiration)) {
      debug(
        `cached asset ${uniqueKey} still not expired. Try retrieving it from the cache`
      )
      const buffer = await cachedAsset.getCachedValue()
      // even if the asset was retrieved from the 11ty cache (e.g. .cache/), we
      // still need to write it to the 11ty output directory (e.g. _site/)
      const { href } = await writer.write({ assetName, buffer })
      return { href }
    }

    ////////////////////////////////////////////////////////////////////////////
    // if (audioEncoding === 'MP3') {
    //   const summary = `could not synthesize ${contentHash} as ${audioEncoding}`
    //   const detail = `testing a failure of speech synthesis using MP3 encoding`
    //   throw new Error(`${summary}: ${detail}`)
    // }

    // if (audioEncoding === 'OGG_OPUS') {
    //   const summary = `could not synthesize ${contentHash} as ${audioEncoding}`
    //   const detail = `testing a failure of speech synthesis using OGG_OPUS encoding`
    //   throw new Error(`${summary}: ${detail}`)
    // }
    ////////////////////////////////////////////////////////////////////////////

    const { error, value: buffer } = await synthesizeSpeech({
      audioEncoding,
      client: textToSpeechClient,
      text,
      voice: { languageCode, name }
    })

    if (error) {
      throw new Error(
        `could not synthesize audio content ${contentHash} as ${audioEncoding}: ${error.message}`
      )
    }

    if (buffer) {
      const { href } = await writer.write({ assetName, buffer })

      debug(`try caching asset ${uniqueKey}`)
      await cachedAsset.save(buffer, 'buffer')
      debug(`cached asset ${uniqueKey}`)

      return { href }
    }

    throw new Error(
      'unreachable code: there must be either an error or a value'
    )
  })

  const conversionResults = await Promise.allSettled(conversionPromises)

  const successes: { href: string }[] = []
  const failures: string[] = []

  conversionResults.forEach((res) => {
    if (res.status === 'fulfilled') {
      successes.push({ href: res.value.href })
    } else {
      failures.push(res.reason.message as string)
    }
  })

  const hrefs = successes.map((s) => s.href)

  if (successes.length === conversionResults.length) {
    const message = `all ${
      conversionResults.length
    } requested audio assets for ${audioBasename} were generated (${audioEncodings.join(
      ', '
    )})`
    debug(message)
    return {
      contentHash,
      hrefs,
      warnings: [] as string[]
    }
  } else if (
    successes.length >= 1 &&
    successes.length < conversionResults.length
  ) {
    const message = `${conversionResults.length} requests for ${audioBasename}, but only ${successes.length} were successful`
    debug(message)
    return {
      contentHash,
      hrefs,
      warnings: failures
    }
  } else {
    const message = `cannot synthesize ${audioBasename}: ${failures.join(' ')}`
    debug(message)
    return {
      contentHash,
      error: new Error(message),
      hrefs: [] as string[],
      warnings: [] as string[]
    }
  }
}
