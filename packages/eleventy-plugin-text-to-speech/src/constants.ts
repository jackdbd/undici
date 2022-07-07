export const DEBUG_PREFIX = 'eleventy-plugin-text-to-speech'

export const ERROR_MESSAGE_PREFIX = {
  invalidConfiguration: '[🗣️ 11ty-plugin-text-to-speech] INVALID CONFIGURATION'
}

export const DEFAULT_CSS_SELECTORS: string[] = []

export const DEFAULT_REGEX = new RegExp('^((?!404).)*\\.html$')

export const DEFAULT_XPATH_EXPRESSIONS: string[] = []

export const DEFAULT = {
  // https://cloud.google.com/speech-to-text/docs/encoding#audio-encodings
  audioEncodings: ['OGG_OPUS', 'MP3'],
  // https://www.11ty.dev/docs/plugins/fetch/#options
  cacheExpiration: '365d',
  collectionName: 'audio-items',
  rules: [
    {
      regex: DEFAULT_REGEX,
      cssSelectors: ['.text-to-speech'],
      xPathExpressions: []
    }
  ],
  transformName: 'inject-audio-tags-into-html',
  // https://cloud.google.com/text-to-speech/docs/voices
  voiceName: 'en-US-Standard-J'
}
