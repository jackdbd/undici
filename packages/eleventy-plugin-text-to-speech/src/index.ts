import makeDebug from 'debug'
import type { EleventyConfig } from '@panoply/11ty'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { PREFIX, TRANSFORM_NAME } from './constants.js'
import { plugin_options as options_schema } from './schemas.js'
import { makeHtmlToAudio } from './transforms.js'
import type { AudioEncoding } from './types.js'

const debug = makeDebug('eleventy-plugin-text-to-speech/index')

export interface Options {
  audioEncoding?: AudioEncoding
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

  const { audioEncoding, regexPattern, voice } =
    result.value as Required<Options>

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

  const client = new TextToSpeechClient({ keyFilename })

  eleventyConfig.addTransform(
    TRANSFORM_NAME,
    makeHtmlToAudio({
      audioEncoding,
      client,
      eleventyConfig,
      regexPattern,
      voice
    })
  )
}
