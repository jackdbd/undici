import Joi from 'joi'
import {
  DEFAULT,
  DEFAULT_CSS_SELECTORS,
  DEFAULT_REGEX,
  DEFAULT_XPATH_EXPRESSIONS
} from './constants.js'
import type { Rule } from './types.js'

const serviceAccountJsonKeyFilename = Joi.string()
  .min(1)
  .pattern(new RegExp('^.*\\.json$'))

const audioEncoding = Joi.string().valid(
  'ALAW',
  'AUDIO_ENCODING_UNSPECIFIED',
  'LINEAR16',
  'MP3',
  'MULAW',
  'OGG_OPUS'
)
const audioEncodings = Joi.array().items(audioEncoding).unique()

const audioSelfHost = Joi.object<URL>().instance(URL)

// https://cloud.google.com/storage/docs/naming-buckets
const cloudStorageBucketName = Joi.string().min(3).max(63)

const audioCloudStorageHost = Joi.object().keys({
  bucketName: cloudStorageBucketName.required(),
  keyFilename: serviceAccountJsonKeyFilename
})

const audioHost = Joi.alternatives().try(audioSelfHost, audioCloudStorageHost)

const cssSelector = Joi.string().min(1)
const cssSelectors = Joi.array().items(cssSelector).unique()

const regex = Joi.object<RegExp>().instance(RegExp)

// 5 characters for the language code (e.g. en-US)
const voice = Joi.string().min(6)

const xPathExpression = Joi.string().min(1)
const xPathExpressions = Joi.array().items(xPathExpression).unique()

const rule = Joi.object<Rule>().keys({
  regex: regex.default(DEFAULT_REGEX),
  cssSelectors: cssSelectors.default(DEFAULT_CSS_SELECTORS),
  xPathExpressions: xPathExpressions.default(DEFAULT_XPATH_EXPRESSIONS)
})

export const options = Joi.object().keys({
  audioEncodings: audioEncodings.default(DEFAULT.audioEncodings),

  audioHost: audioHost.required(),

  cacheExpiration: Joi.string().min(1).default(DEFAULT.cacheExpiration),

  collectionName: Joi.string().min(1).default(DEFAULT.collectionName),

  keyFilename: serviceAccountJsonKeyFilename,

  rules: Joi.array().items(rule).default(DEFAULT.rules),

  transformName: Joi.string().min(1).default(DEFAULT.transformName),

  voice: voice.default(DEFAULT.voiceName)
})
