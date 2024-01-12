export const DEBUG_PREFIX = '11ty-plugin:text-to-speech'

export const OK_PREFIX = '[🗣️ 11ty-plugin-text-to-speech]'
export const ERR_PREFIX = '[❌ 11ty-plugin-text-to-speech]'

// export const DEFAULT_CSS_SELECTORS: string[] = []

export const DEFAULT_REGEX = new RegExp('^((?!404).)*\\.html$')

export const DEFAULT_TRANSFORM_NAME = 'inject-audio-tags-into-html'

// https://cloud.google.com/text-to-speech/docs/voices
export const DEFAULT_VOICE_NAME = 'en-US-Standard-J'

// export const DEFAULT_XPATH_EXPRESSIONS: string[] = []

// export const DEFAULT = {
//   // https://cloud.google.com/speech-to-text/docs/encoding#audio-encodings
//   audioEncodings: ['OGG_OPUS', 'MP3'],
//   // https://www.11ty.dev/docs/plugins/fetch/#options
//   cacheExpiration: '365d',
//   collectionName: 'audio-items',
//   rules: [
//     {
//       regex: DEFAULT_REGEX,
//       cssSelectors: ['.text-to-speech'],
//       xPathExpressions: []
//     }
//   ],
//   transformName: 'inject-audio-tags-into-html',
//   voiceName: 'en-US-Standard-J'
// }
