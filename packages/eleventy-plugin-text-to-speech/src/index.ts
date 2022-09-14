import fs from 'node:fs'
import path from 'node:path'
import makeDebug from 'debug'
import type { EleventyConfig } from '@panoply/11ty'
import { Storage } from '@google-cloud/storage'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { DEBUG_PREFIX, ERROR_MESSAGE_PREFIX } from './constants.js'
import { defaultAudioInnerHTML } from './dom.js'
import { options as optionsSchema } from './schemas.js'
import { makeInjectAudioTagsIntoHtml } from './transforms.js'
import type {
  AudioEncoding,
  AudioInnerHTML,
  CloudStorageHost,
  Rule
} from './types.js'
export type {
  AudioEncoding,
  AudioInnerHTML,
  CloudStorageHost,
  Rule
} from './types.js'
import { clientLibraryCredentials } from './utils.js'
import { selfHostWriter, cloudStorageWriter } from './writers.js'
import type { Writer } from './writers.js'

export { audioExtension, mediaType } from './utils.js'

const debug = makeDebug(`${DEBUG_PREFIX}/index`)

export interface Options {
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
  audioHost: URL | CloudStorageHost

  /**
   * Function to use to generate the innerHTML of the `<audio>` tag to inject in
   * the page for each text match.
   */
  audioInnerHTML?: AudioInnerHTML

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
const configFunction = (eleventyConfig: EleventyConfig, options: Options) => {
  const result = optionsSchema.validate(options)

  if (result.error) {
    const message = `${ERROR_MESSAGE_PREFIX.invalidConfiguration}: ${result.error.message}`
    throw new Error(message)
  }

  let writer: Writer
  if ('bucketName' in options.audioHost) {
    const bucketName = options.audioHost.bucketName

    const storage = new Storage({
      keyFilename: clientLibraryCredentials({
        what: 'Cloud Storage',
        keyFilename: options.audioHost.keyFilename
      })
    })

    writer = cloudStorageWriter({ bucketName, storage })
    debug(`audio assets will be hosted on Cloud Storage bucket ${bucketName}`)
  } else {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const output = (eleventyConfig as any).dir.output as string
    const { origin, pathname } = options.audioHost

    const hrefBase = `${origin}${pathname}`

    const outputBase = path.join(path.basename(output), pathname)

    if (!fs.existsSync(outputBase)) {
      fs.mkdirSync(outputBase, { recursive: true })
    }

    writer = selfHostWriter({ hrefBase, outputBase })
    debug(
      `audio assets will be hosted at ${hrefBase} (self-hosted at ${outputBase})`
    )
  }

  const {
    audioEncodings,
    cacheExpiration,
    collectionName,
    rules,
    transformName,
    voice
  } = result.value as Required<Options>

  const audioInnerHTML = options.audioInnerHTML
    ? options.audioInnerHTML
    : defaultAudioInnerHTML

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  const cfg = eleventyConfig as any
  const addCollection = cfg.addCollection.bind(eleventyConfig)

  const textToSpeechClient = new TextToSpeechClient({
    keyFilename: clientLibraryCredentials({
      what: 'Text-to-Speech client library',
      keyFilename: result.value.keyFilename
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

export const plugin = {
  initArguments: {},
  configFunction
}
