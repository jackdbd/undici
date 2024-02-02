'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.rule = exports.css_selectors = void 0
var zod_1 = require('zod')
var zod_schemas_1 = require('@jackdbd/zod-schemas')
var dom_1 = require('@jackdbd/zod-schemas/dom')
var constants_js_1 = require('../constants.js')
var audio_html_js_1 = require('../audio-html.js')
var schemas_js_1 = require('../hosting/schemas.js')
var schemas_js_2 = require('../synthesis/schemas.js')
exports.css_selectors = zod_1.z
  .array(dom_1.css_selector)
  .refine(zod_schemas_1.isUnique, {
    message: 'Must be an array of unique CSS selectors'
  })
var xpath_expressions = zod_1.z
  .array(dom_1.xpath_expression)
  .refine(zod_schemas_1.isUnique, {
    message: 'Must be an array of unique XPath expressions'
  })
/**
 * Zod schema for rule.
 */
exports.rule = zod_1.z
  .object({
    audioInnerHTML: audio_html_js_1.audio_inner_html
      .optional()
      .describe(
        'Function that returns some HTML from the list of hrefs where the generated audio assets are hosted.'
      ),
    cssSelectors: exports.css_selectors
      .default(constants_js_1.DEFAULT_CSS_SELECTORS)
      .describe('CSS selectors to find matches in a HTML document'),
    hosting: schemas_js_1.hosting.describe(
      'Client that provides hosting capabilities'
    ),
    regex: zod_1.z
      .instanceof(RegExp)
      .default(constants_js_1.DEFAULT_REGEX)
      .describe('RegExp to find matches in the output path'),
    synthesis: schemas_js_2.synthesis.describe(
      'Client that provides Text-to-Speech capabilities'
    ),
    xPathExpressions: xpath_expressions
      .default(constants_js_1.DEFAULT_XPATH_EXPRESSIONS)
      .describe('XPath expressions to find matches in a HTML document')
  })
  .describe(
    'Rule defining which text on a HTML document should be synthesized by the provided text-to-speech client, and where the generated audio asset/s should be hosted.'
  )
