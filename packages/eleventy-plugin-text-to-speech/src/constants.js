'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.DEFAULT_XPATH_EXPRESSIONS =
  exports.DEFAULT_TRANSFORM_NAME =
  exports.DEFAULT_REGEX =
  exports.DEFAULT_CSS_SELECTORS =
  exports.DEFAULT_COLLECTION_NAME =
  exports.OK_PREFIX =
  exports.ERR_PREFIX =
  exports.DEBUG_PREFIX =
    void 0
exports.DEBUG_PREFIX = '11ty-plugin:TTS'
exports.ERR_PREFIX = '[❌ 11ty-plugin-text-to-speech]'
exports.OK_PREFIX = '[🗣️ 11ty-plugin-text-to-speech]'
exports.DEFAULT_COLLECTION_NAME = 'audio-items'
exports.DEFAULT_CSS_SELECTORS = []
exports.DEFAULT_REGEX = new RegExp('^((?!404).)*\\.html$')
exports.DEFAULT_TRANSFORM_NAME = 'inject-audio-tags-into-html'
exports.DEFAULT_XPATH_EXPRESSIONS = []
