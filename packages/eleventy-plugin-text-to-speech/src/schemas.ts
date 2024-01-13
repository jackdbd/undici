import { z } from 'zod'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { Storage } from '@google-cloud/storage'
// import { google } from '@google-cloud/text-to-speech/build/protos/protos.js'
import {
  DEFAULT_REGEX,
  DEFAULT_TRANSFORM_NAME,
  DEFAULT_VOICE_NAME
} from './constants.js'

/**
 * @internal
 */
export const service_account_json_key_filename = z
  .string()
  .min(1)
  // .regex(new RegExp('^.*\\.json$'))
  .describe(
    'filepath to the JSON key representing a Google Cloud Platform service account'
  )

/**
 * Audio encodings
 *
 * @public
 */
export const audio_encoding = z.union([
  z.literal('ALAW'),
  z.literal('AUDIO_ENCODING_UNSPECIFIED'),
  z.literal('LINEAR16'),
  z.literal('MP3'),
  z.literal('MULAW'),
  z.literal('OGG_OPUS')
])

/**
 * Audio encoding
 *
 * @public
 */
export type AudioEncoding = z.infer<typeof audio_encoding>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isUnique = (items: any[]) => new Set(items).size === items.length

export const audio_encodings = z.array(audio_encoding).refine(isUnique, {
  message: 'Must be an array of unique strings'
})

export const audio_self_host = z.object({
  origin: z.string(),
  pathname: z.string()
})

// https://cloud.google.com/storage/docs/naming-buckets
export const cloud_storage_bucket_name = z.string().min(3).max(63)

export const client_email = z.string().min(1).email()

export const private_key = z.string().min(1)

export const credentials = z.object({
  client_email,
  private_key
})

export const gcp_client_options = z.object({
  credentials: credentials.optional(),
  keyFilename: service_account_json_key_filename.optional()
})

export const audio_cloud_storage_host = z.object({
  bucketName: cloud_storage_bucket_name,
  storageClientOptions: gcp_client_options
})

export const audio_host = z.union([audio_self_host, audio_cloud_storage_host])

export const css_selector = z.string().min(1)

export const css_selectors = z.array(css_selector).refine(isUnique, {
  message: 'Must be an array of unique strings'
})

const regex = z.instanceof(RegExp)

const voice_name = z.string().min(6)

const voice_obj = z.object({
  // 5 characters for the language code (e.g. en-US)
  languageCode: z.string().length(5),
  name: voice_name
})

export type VoiceObj = z.infer<typeof voice_obj>

const xpath_expression = z.string().min(1)

const xpath_expressions = z.array(xpath_expression).refine(isUnique, {
  message: 'Must be an array of unique strings'
})

// const rule = Joi.object<Rule>().keys({
//   regex: regex.default(DEFAULT_REGEX),
//   cssSelectors: cssSelectors.default(DEFAULT_CSS_SELECTORS),
//   xPathExpressions: xPathExpressions.default(DEFAULT_XPATH_EXPRESSIONS)
// })

export const rule = z.object({
  regex: regex.default(DEFAULT_REGEX),
  cssSelectors: css_selectors.default([]),
  xPathExpressions: xpath_expressions.default([])
})

/**
 * Rule
 *
 * @public
 */
export type Rule = z.infer<typeof rule>

// https://cloud.google.com/speech-to-text/docs/encoding#audio-encodings
const DEFAULT_AUDIO_ENCODINGS: AudioEncoding[] = ['OGG_OPUS', 'MP3']

// https://www.11ty.dev/docs/plugins/fetch/#options
const DEFAULT_CACHE_EXPIRATION = '365d'

const DEFAULT_COLLECTION_NAME = 'audio-items'

/**
 * Default rules.
 *
 * @public
 */
export const DEFAULT_RULES: Rule[] = [
  {
    regex: DEFAULT_REGEX,
    cssSelectors: ['.text-to-speech'],
    xPathExpressions: []
  }
]

export const text = z.string().min(1).max(5000)
  .describe(`Text to synthesize. The Cloud Text-to-Speech API has a limit of 5000 characters.
`)

/**
 * Schema for the configuration object to use in the `synthesizeSpeech` function.
 *
 * @public
 */
export const synthesize_speech_config = z
  .object({
    audioEncoding: audio_encoding,
    client: z.instanceof(TextToSpeechClient),
    text: text,
    voice: voice_obj
    // voice: z.instanceof(google.cloud.texttospeech.v1.VoiceSelectionParams)
  })
  .describe('configuration object for the `synthesizeSpeech` function')

/**
 * Configuration object for the `synthesizeSpeech` function.
 *
 * @public
 */
export type SynthesizeSpeechConfig = z.infer<typeof synthesize_speech_config>

export const cache_expiration = z.string().min(1)

export const output_path = z.string().min(1)

export const asset_name = z.string().min(1)

export const string_or_uint8 = z.union([z.string(), z.instanceof(Uint8Array)])

export const test_asset_config = z.object({
  assetName: asset_name,
  buffer: string_or_uint8
})

// export type AssetConfig = z.infer<typeof test_asset_config>
export type AssetConfig = z.input<typeof test_asset_config>

export const self_asset_config = z.object({
  assetName: asset_name,
  buffer: string_or_uint8,
  hrefBase: z.string(),
  outputBase: z.string()
})

export type SelfHostConfig = z.infer<typeof self_asset_config>

// export interface SelfHostConfig extends AssetConfig {
//   hrefBase: string
//   outputBase: string
// }

export const cloud_storage_asset_config = z.object({
  assetName: asset_name,
  buffer: string_or_uint8,
  bucketName: z.string(),
  storage: z.instanceof(Storage)
})

export type CloudStorageHostConfig = z.infer<typeof cloud_storage_asset_config>

// export interface CloudStorageHostConfig extends AssetConfig {
//   bucketName: string
//   storage: Storage
// }

export const href = z.string().min(1).url()

export const write_success = z.object({
  filepath: z.string().min(1).optional(),
  href: href,
  message: z.string().min(1),
  uri: z.instanceof(URL).optional()
})

export type WriteSuccess = z.infer<typeof write_success>

export const write_result = z.object({
  error: z.instanceof(Error).optional(),
  value: write_success.optional()
})

export type WriteResult = z.infer<typeof write_result>

export const write = z
  .function()
  .args(
    z.union([test_asset_config, self_asset_config, cloud_storage_asset_config])
  )
  .returns(z.promise(write_result))

export const writer = z.object({
  write: write
})

export type Writer = z.infer<typeof writer>

/**
 * Schema for the configuration object to use in the `audioAssetsFromText` function.
 *
 * @public
 */
export const audio_assets_from_text_config = z.object({
  audioEncodings: audio_encodings,
  cacheExpiration: cache_expiration,
  outputPath: output_path,
  text: text,
  textToSpeechClient: z.instanceof(TextToSpeechClient),
  voice: voice_name,
  writer: writer
})

/**
 * Configuration object for the `audioAssetsFromText` function.
 *
 * @public
 */
export type AudioAssetsFromTextConfig = z.infer<
  typeof audio_assets_from_text_config
>

export const collection_name = z.string().min(1)

export const transform_name = z.string().min(1)

export const audio_inner_html = z
  .function()
  .args(z.array(href))
  .returns(z.string())

export type AudioInnerHTML = z.infer<typeof audio_inner_html>

/**
 * Plugin options schema.
 *
 * @public
 */
export const options = z.object({
  /**
   * List of encodings to use when generating audio assets from text matches.
   *
   * @see [List of audio encodings supported by the Speech-to-Text API](https://cloud.google.com/speech-to-text/docs/encoding#audio-encodings)
   */
  audioEncodings: audio_encodings.default(DEFAULT_AUDIO_ENCODINGS),

  /**
   * Where to host the audio assets. Each audio host should have a matching
   * writer responsible for writing/uploading the assets to the host.
   */
  audioHost: audio_host, // I don't think we can set a default value for this.

  /**
   * Function to use to generate the innerHTML of the `<audio>` tag to inject in
   * the page for each text match.
   */
  audioInnerHTML: audio_inner_html.optional(),

  /**
   * Expiration for the 11ty AssetCache.
   *
   * @see Eleventy AssetCache [options](https://www.11ty.dev/docs/plugins/fetch/#options).
   */
  cacheExpiration: cache_expiration.default(DEFAULT_CACHE_EXPIRATION),

  /**
   * Name of the 11ty collection created by this plugin.
   *
   * @remarks
   * If you register this plugin more than once, you will need to use a
   * different name every time (otherwise 11ty would throw an Error).
   */
  collectionName: collection_name.default(DEFAULT_COLLECTION_NAME),

  /**
   * Rules that determine which texts to convert into speech.
   */
  rules: z.array(rule).default(DEFAULT_RULES),

  /**
   * Client options to initialize the GCP Text-To-Speech client library.
   *
   * These credentials might be different from the ones used to authenticate
   * the Cloud Storage client library.
   *
   * @remarks
   * If no credentials are explicitly provided, every Google Cloud client library
   * will use the GOOGLE_APPLICATION_CREDENTIALS environment variable.
   *
   * @example
   * The credentials can be provided using a filepath to a service account JSON key:
   * ```ts
   * textToSpeechClientOptions = {
   *   keyFilename: 'path/to/service-account-key.json'
   * }
   * ```
   *
   * @example
   * The credentials
   * ```ts
   * textToSpeechClientOptions = {
   *   client_email: "SERVICE-ACCOUNT-EMAIL@GCP-PROJECT-ID.iam.gserviceaccount.com",
   *   private_key: "-----BEGIN PRIVATE KEY-----\n ... \n-----END PRIVATE KEY-----\n"
   * }
   * ```
   */
  textToSpeechClientOptions: gcp_client_options,

  /**
   * Name of the 11ty transform created by this plugin.
   *
   * @remarks
   * If you register this plugin more than once, you will need to use a
   * different name every time (11ty would NOT throw an Error, but this plugin
   * will not work as expected).
   */
  transformName: transform_name.default(DEFAULT_TRANSFORM_NAME),

  /**
   * Voice to use when generating audio assets from text matches.
   *
   * @see [Voices supported by the Speech-to-Text API](https://cloud.google.com/text-to-speech/docs/voices)
   * @see [Different voices might have different prices](https://cloud.google.com/text-to-speech/pricing)
   *
   */
  voice: voice_name.default(DEFAULT_VOICE_NAME)
})

/**
 * Plugin options.
 *
 * @public
 * @interface
 */
export type Options = z.input<typeof options>
