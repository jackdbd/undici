import Joi from 'joi'
import { DEFAULT } from './constants.js'

export const plugin_options = Joi.object().keys({
  audioAssetsDir: Joi.string().min(1),

  audioEncoding: Joi.string()
    .valid(
      'ALAW',
      'AUDIO_ENCODING_UNSPECIFIED',
      'LINEAR16',
      'MP3',
      'MULAW',
      'OGG_OPUS'
    )
    .default(DEFAULT.audioEncoding),

  audioHost: Joi.string().min(1),

  // TODO: better validation for the bucket name
  // https://cloud.google.com/storage/docs/naming-buckets
  cloudStorageBucket: Joi.string().min(1),

  cssSelector: Joi.string().min(1),

  keyFilename: Joi.string().min(1),

  regexPattern: Joi.string().min(1).default(DEFAULT.regexPattern),

  voice: Joi.object()
    .keys({
      languageCode: Joi.string().required(),
      name: Joi.string().min(5).required()
    })
    .default({
      languageCode: DEFAULT.voiceLanguageCode,
      name: DEFAULT.voiceName
    })
})
