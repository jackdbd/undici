import { z } from 'zod'
import { isUnique } from '@jackdbd/zod-schemas'
import { css_selector, xpath_expression } from '@jackdbd/zod-schemas/dom'
import {
  DEFAULT_CSS_SELECTORS,
  DEFAULT_REGEX,
  DEFAULT_XPATH_EXPRESSIONS
} from '../constants.js'
import { audio_inner_html } from '../audio-html.js'
import { hosting } from '../hosting/schemas.js'
import { synthesis } from '../synthesis/schemas.js'

export const css_selectors = z.array(css_selector).refine(isUnique, {
  message: 'Must be an array of unique CSS selectors'
})

const xpath_expressions = z.array(xpath_expression).refine(isUnique, {
  message: 'Must be an array of unique XPath expressions'
})

/**
 * Zod schema for rule.
 */
export const rule = z
  .object({
    audioInnerHTML: audio_inner_html
      .optional()
      .describe(
        `Function that returns some HTML from the list of hrefs where the generated audio assets are hosted.`
      ),

    cssSelectors: css_selectors
      .default(DEFAULT_CSS_SELECTORS)
      .describe('CSS selectors to find matches in a HTML document'),

    hosting: hosting.describe('Client that provides hosting capabilities'),

    regex: z
      .instanceof(RegExp)
      .default(DEFAULT_REGEX)
      .describe('RegExp to find matches in the output path'),

    synthesis: synthesis.describe(
      'Client that provides Text-to-Speech capabilities'
    ),

    xPathExpressions: xpath_expressions
      .default(DEFAULT_XPATH_EXPRESSIONS)
      .describe('XPath expressions to find matches in a HTML document')
  })
  .describe(
    `Rule defining which text on a HTML document should be synthesized by the provided text-to-speech client, and where the generated audio asset/s should be hosted.`
  )

/**
 * Rule defining how text should be synthesized by a text-to-speech client, and
 * where the generated audio asset/s should be hosted.
 *
 * @public
 * @interface
 */
export type Rule = z.infer<typeof rule>
