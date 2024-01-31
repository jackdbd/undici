import { createHash } from 'node:crypto'
import makeDebug from 'debug'
import { JSDOM } from 'jsdom'
import { z } from 'zod'
import { css_selector, xpath_expression } from '@jackdbd/zod-schemas/dom'
import { DEBUG_PREFIX } from './constants.js'
import {
  cssSelectorMatchesToTexts,
  xPathExpressionMatchesToTexts
} from './dom/matchers.js'
import { text_to_synthesize } from './synthesis/schemas.js'
import { validatedResult } from './validation.js'

const debug = makeDebug(`${DEBUG_PREFIX}:rule-match-record`)

export const match_object = z.object({
  /**
   * The text that matched one or more CSS selector or one or more XPath expression.
   */
  text: text_to_synthesize,

  /**
   * All the CSS selectors that matched the text.
   */
  cssSelectors: z.array(css_selector),

  /**
   * All the XPath expressions that matched the text.
   */
  xPathExpressions: z.array(xpath_expression)
})

export const rule_match_record = z.record(match_object)

export type RuleMatchRecord = z.infer<typeof rule_match_record>

interface CssMatch {
  selector: string
  texts: string[]
}

interface XPathMatch {
  expression: string
  texts: string[]
}

export const config_schema = z.object({
  dom: z.instanceof(JSDOM),
  cssSelectors: z.array(css_selector),
  xPathExpressions: z.array(xpath_expression)
})

type Config = z.infer<typeof config_schema>

/**
 * Creates a rule match record, namely a hash map where all the keys are content
 * hashes of the matched texts, and the values are those texts that match one or
 * more CSS selectors, or one or more XPath expressions.
 */
export const ruleMatchRecord = (config: Config) => {
  const res = validatedResult(config, config_schema)
  if (res.error) {
    return { error: res.error }
  }

  const { dom, cssSelectors, xPathExpressions } = res.value

  const doc = dom.window.document

  const rec: RuleMatchRecord = {}
  const errors: Error[] = []

  const cssMatches: CssMatch[] = []
  cssSelectors.forEach((selector) => {
    const res = cssSelectorMatchesToTexts({ dom, selector })
    if (res.error) {
      errors.push(res.error)
    } else {
      cssMatches.push({ selector, texts: res.value })
    }
  })
  debug(`${cssMatches.length} CSS selector match/es on document '${doc.title}'`)

  for (const cssMatch of cssMatches) {
    const { selector, texts } = cssMatch
    debug(`CSS selector ${selector} matches ${texts.length} text/s`)
    for (const text of texts) {
      const md5 = createHash('md5')
      const key = md5.update(text).digest('hex')
      if (rec[key] && !rec[key].cssSelectors.includes(selector)) {
        rec[key].cssSelectors.push(selector)
      } else {
        rec[key] = { text, cssSelectors: [selector], xPathExpressions: [] }
      }
    }
  }

  const xPathMatches: XPathMatch[] = []
  xPathExpressions.forEach((expression) => {
    const res = xPathExpressionMatchesToTexts({ dom, expression })
    if (res.error) {
      errors.push(res.error)
    } else {
      xPathMatches.push({ expression, texts: res.value })
    }
  })
  debug(
    `${xPathMatches.length} XPath expression match/es on document title: ${doc.title})`
  )

  for (const xPathMatch of xPathMatches) {
    const { expression, texts } = xPathMatch
    debug(`XPath expression ${expression} matches ${texts.length} text/s`)
    for (const text of texts) {
      const md5 = createHash('md5')
      const key = md5.update(text).digest('hex')
      if (rec[key] && !rec[key].xPathExpressions.includes(expression)) {
        rec[key].xPathExpressions.push(expression)
      } else {
        rec[key] = { text, cssSelectors: [], xPathExpressions: [expression] }
      }
    }
  }

  if (errors.length > 0) {
    const summary = `Encountered ${errors.length} error/s while processing document '${doc.title}'`
    const details = errors.map((e) => e.message)
    return { error: new Error(`${summary}\n${details.join('\n')}`) }
  }

  return { value: rec }
}
