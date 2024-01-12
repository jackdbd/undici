/**
 * Eleventy plugin that synthesizes **any text** you want, on **any page** of
 * your Eleventy site, using the
 * [Google Cloud Text-to-Speech API](https://cloud.google.com/text-to-speech).
 *
 * You can either self-host the audio assets this plugin generates, or host them
 * on [Cloud Storage](https://cloud.google.com/storage).
 *
 * @packageDocumentation
 */
import path from 'node:path'
import makeDebug from 'debug'
import { fromZodError } from 'zod-validation-error'
import type { EleventyConfig } from '@11ty/eleventy'
import { Storage } from '@google-cloud/storage'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { DEBUG_PREFIX, ERR_PREFIX } from './constants.js'
import { defaultAudioInnerHTML } from './dom.js'
import { options as schema } from './schemas.js'
import { makeInjectAudioTagsIntoHtml } from './transforms.js'
import type { AudioEncoding, Options, Rule, Writer } from './schemas.js'
import { clientLibraryCredentials } from './utils.js'
import { cloudStorageWriter } from './cloud-storage-writer.js'
import { selfHostWriter } from './self-hosted-writer.js'

// exports for TypeDoc
export {
  DEBUG_PREFIX,
  DEFAULT_TRANSFORM_NAME,
  DEFAULT_VOICE_NAME
} from './constants.js'
export { defaultAudioInnerHTML } from './dom.js'
export {
  options,
  collection_name,
  cloud_storage_asset_config
} from './schemas.js'
export type { Options, Writer, WriteResult, WriteSuccess } from './schemas.js'
export type { CloudStorageHost } from './types.js'

const debug = makeDebug(`${DEBUG_PREFIX}:index`)

/**
 * Options for this Eleventy plugin.
 *
 * @public
 */
export interface LegacyOptions {
  /**
   * List of encodings to use when generating audio assets from text matches.
   *
   * See here for the audio encodings supported by the Speech-to-Text API:
   * https://cloud.google.com/speech-to-text/docs/encoding#audio-encodings
   */
  audioEncodings?: AudioEncoding[]

  /**
   * Where to host the audio assets. Each audio host should have a matching
   * writer responsible for writing/uploading the assets to the host.
   */
  // audioHost: URL | CloudStorageHost

  /**
   * Function to use to generate the innerHTML of the `<audio>` tag to inject in
   * the page for each text match.
   */
  // audioInnerHTML?: AudioInnerHTML

  /**
   * Expiration for the 11ty AssetCache.
   * https://www.11ty.dev/docs/plugins/fetch/#options
   */
  cacheExpiration?: string

  /**
   * Name of the 11ty collection created by this plugin.
   *
   * Note: if you register this plugin more than once, you will need to use a
   * different name every time (otherwise 11ty would throw an Error).
   */
  collectionName?: string

  /**
   * Absolute filepath to the service account JSON key used to authenticate the
   * Text-to-Speech client library. These credentials might be different from
   * the ones used to authenticate the Cloud Storage client library. If not
   * provided, this plugin will try initializing client libraries using the
   * GOOGLE_APPLICATION_CREDENTIALS environment variable.
   */
  keyFilename?: string

  /**
   * Rules that determine which texts to convert into speech.
   */
  rules: Rule[]

  /**
   * Name of the 11ty transform created by this plugin.
   *
   * Note: if you register this plugin more than once, you will need to use a
   * different name every time (11ty would NOT throw an Error, but this plugin
   * will not work as expected).
   */
  transformName?: string

  /**
   * Voice to use when generating audio assets from text matches.
   *
   * See here for the voices supported by the Speech-to-Text API:
   * https://cloud.google.com/text-to-speech/docs/voices
   *
   * Note: different voices might have different prices:
   * https://cloud.google.com/text-to-speech/pricing
   */
  voice?: string
}

/**
 * Adds Text-to-Speech functionality to an Eleventy site.
 */
export const textToSpeechPlugin = (
  eleventyConfig: EleventyConfig,
  options?: Options
) => {
  debug('plugin options (provided by user) %O', options)

  const result = schema.safeParse(options)

  if (!result.success) {
    const err = fromZodError(result.error)
    throw new Error(`${ERR_PREFIX} ${err.toString()}`)
  }

  debug('plugin config (provided by user + defaults) %O', result.data)

  const {
    audioEncodings,
    cacheExpiration,
    collectionName,
    keyFilename,
    rules,
    transformName,
    voice
  } = result.data

  let writer: Writer
  if ('bucketName' in result.data.audioHost) {
    const bucketName = result.data.audioHost.bucketName

    const storage = new Storage({
      keyFilename: clientLibraryCredentials({
        what: 'Cloud Storage',
        // this might be a different JSON key than the one used for the Text-To-Speech synthesis
        keyFilename: result.data.audioHost.keyFilename
      })
    })

    writer = cloudStorageWriter({ bucketName, storage })
    debug(`audio assets will be hosted on Cloud Storage bucket ${bucketName}`)
  } else {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const output = (eleventyConfig as any).dir.output as string
    const { origin, pathname } = result.data.audioHost
    const hrefBase = `${origin}${pathname}`

    const outputBase = path.join(path.basename(output), pathname)

    writer = selfHostWriter({ hrefBase, outputBase })
    debug(
      `audio assets will be hosted at ${hrefBase} (self-hosted at ${outputBase})`
    )
  }

  const audioInnerHTML = result.data.audioInnerHTML
    ? result.data.audioInnerHTML
    : defaultAudioInnerHTML

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  const cfg = eleventyConfig as any
  const addCollection = cfg.addCollection.bind(eleventyConfig)

  const textToSpeechClient = new TextToSpeechClient({
    keyFilename: clientLibraryCredentials({
      what: 'Text-to-Speech client library',
      keyFilename: keyFilename
    })
  })

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  const cb = function templatesWithAudio(collectionApi: any) {
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    const templates = collectionApi.getAll().filter((item: any) => {
      const idx = rules.findIndex((rule) => rule.regex.test(item.outputPath))
      return idx !== -1
    })
    return templates
  }

  addCollection(collectionName, cb)
  debug(`11ty collection added: ${collectionName}`)

  const injectAudioTagsIntoHtml = makeInjectAudioTagsIntoHtml({
    audioEncodings,
    audioInnerHTML,
    cacheExpiration,
    rules,
    textToSpeechClient,
    transformName,
    voice,
    writer
  })

  eleventyConfig.addTransform(transformName, injectAudioTagsIntoHtml)
}
