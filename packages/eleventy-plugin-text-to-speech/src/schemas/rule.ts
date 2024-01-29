import { z } from 'zod'
import { isUnique } from '@jackdbd/zod-schemas'
import { css_selector, xpath_expression } from '@jackdbd/zod-schemas/dom'
import {
  DEFAULT_CSS_SELECTORS,
  DEFAULT_REGEX,
  DEFAULT_XPATH_EXPRESSIONS
} from '../constants.js'
import { audio_inner_html } from '../dom.js'
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
export const rule = z.object({
  audioInnerHTML: audio_inner_html.optional(),
  cssSelectors: css_selectors.default(DEFAULT_CSS_SELECTORS),
  hosting,
  regex: z.instanceof(RegExp).default(DEFAULT_REGEX),
  synthesis,
  xPathExpressions: xpath_expressions.default(DEFAULT_XPATH_EXPRESSIONS)
})

/**
 * Rule defining how text should be synthesized by a text-to-speech client, and
 * where the generated audio asset/s should be hosted.
 *
 * @public
 * @interface
 */
export type Rule = z.infer<typeof rule>