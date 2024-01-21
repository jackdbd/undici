import { createHash } from 'node:crypto'
import { z } from 'zod'
import { validatedResult } from './validation.js'
import { hosting } from './hosting/schemas.js'
import { synthesis, text_to_synthesize } from './synthesis/schemas.js'

export const text_to_audio_asset_config = z
  .object({
    text: text_to_synthesize,
    synthesis,
    hosting
  })
  .describe('Text to audio asset config')

export type Config = z.input<typeof text_to_audio_asset_config>

/**
 * Synthesizes some text into a readable stream representing the speech. Then it
 * generates an audio asset from that speech.
 *
 * @param config
 * @returns
 */
export const textToAudioAsset = async (config: Config) => {
  const result = validatedResult(config, text_to_audio_asset_config)
  if (result.error) {
    return { error: result.error }
  }

  // TODO: make this function an async transducer?

  const { text, hosting, synthesis } = result.value

  const s_res = await synthesis.synthesize(text)
  if (s_res.error) {
    return { error: s_res.error }
  }

  const readable = s_res.value

  // should I make configurable the code that computes the asset name?
  const md5 = createHash('md5')
  const contents = [
    text,
    JSON.stringify(synthesis.config),
    JSON.stringify(hosting.config)
  ]
  const contentHash = md5.update(contents.join('_')).digest('hex')

  const assetName = `${contentHash}.${synthesis.extension}`

  // TODO: add caching here?
  // use AssetCache when self-hosting, and RemoteAssetCache when hosting
  // on Cloud Storage
  // https://github.com/11ty/eleventy-fetch/blob/master/src/AssetCache.js
  // https://github.com/11ty/eleventy-fetch/blob/master/src/RemoteAssetCache.js
  // https://www.11ty.dev/docs/plugins/fetch/#options
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const AssetCache = (eleventyFetch as any).AssetCache

  // const uniqueKey = `${contentHash}_${extension}_${audioEncoding}`
  // const cachedAsset = new AssetCache(uniqueKey)

  // if (cachedAsset.isCacheValid(cacheExpiration)) {
  //   debug(
  //     `cached asset ${uniqueKey} still not expired. Try retrieving it from the cache`
  //   )
  //   const buffer = await cachedAsset.getCachedValue()
  // even if the asset was retrieved from the 11ty cache (e.g. .cache/), we
  // still need to write it to the 11ty output directory (e.g. _site/)

  const w_res = await hosting.write({ assetName, readable })
  if (w_res.error) {
    if (!readable.closed) {
      // should I destroy the readable stream manually?
      readable.destroy()
    }
    return { error: w_res.error }
  }

  if (!readable.closed) {
    // should I destroy the readable stream manually?
    readable.destroy()
  }

  return { value: w_res.value }
}
