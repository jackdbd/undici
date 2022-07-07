import makeDebug from 'debug'
import type { EleventyConfig } from '@panoply/11ty'
import { Storage } from '@google-cloud/storage'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { PREFIX, TRANSFORM_NAME } from './constants.js'
import { plugin_options as options_schema } from './schemas.js'
import { makeHtmlToAudio } from './transforms.js'
import type { AudioEncoding } from './types.js'

const debug = makeDebug('eleventy-plugin-text-to-speech/index')

export interface Options {
  audioEncoding?: AudioEncoding
  audioAssetsDir?: string
  audioHost?: string
  cloudStorageBucket?: string
  cssSelector?: string
  keyFilename?: string
  regexPattern?: string
  voice?: {
    languageCode: string
    name: string
  }
}

export const textToSpeechPlugin = (
  eleventyConfig: EleventyConfig,
  options: Options
) => {
  const result = options_schema.validate(options)
  if (result.error) {
    const message = `${PREFIX} invalid configuration: ${result.error.message}`
    throw new Error(message)
  }

  const {
    audioAssetsDir,
    audioEncoding,
    audioHost,
    cloudStorageBucket,
    cssSelector,
    regexPattern,
    voice
  } = result.value as Required<Options>

  let keyFilename = result.value.keyFilename
  if (keyFilename) {
    debug(`initialize TextToSpeechClient with keyFilename`)
  } else {
    debug(
      `initialize TextToSpeechClient with environment variable GOOGLE_APPLICATION_CREDENTIALS`
    )
    keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS
  }

  if (!keyFilename) {
    const message = `${PREFIX} invalid configuration: neither keyFilename nor GOOGLE_APPLICATION_CREDENTIALS are set. Cannot initialize TextToSpeechClient.`
    throw new Error(message)
  }

  // TODO: add an 11ty collection with this plugin

  // console.log('🚀 ~ this', this)
  // console.log('🚀 ~ eleventyConfig', eleventyConfig)

  // const collectionName = 'eleventy-plugin-text-to-speech-pages-with-audio'
  // const globPatterns = ['**/pages/*.njk', '**/posts/*.md']

  // const that = eleventyConfig as any
  // // const addCollection = that.addCollection.bind(eleventyConfig)

  // const cb = function templatesWithAudio(collectionApi: any) {
  //   const templates = collectionApi.getFilteredByGlob(globPatterns)
  //   return templates
  // }

  // // addCollection(collectionName, cb)
  // that.collections[collectionName] = cb
  // eleventyConfig = that

  const client = new TextToSpeechClient({ keyFilename })
  const storage = new Storage({ keyFilename })

  const output = (eleventyConfig as any).dir.output as string

  eleventyConfig.addTransform(
    TRANSFORM_NAME,
    makeHtmlToAudio({
      audioAssetsDir,
      audioEncoding,
      audioHost,
      bucketName: cloudStorageBucket,
      client,
      cssSelector,
      output,
      regexPattern,
      storage,
      voice
    })
  )
}
