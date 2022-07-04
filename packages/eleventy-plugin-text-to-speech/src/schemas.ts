import Joi from 'joi'
import { DEFAULT } from './constants.js'

export const plugin_options = Joi.object().keys({
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
