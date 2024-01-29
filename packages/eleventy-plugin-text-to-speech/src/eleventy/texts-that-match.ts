import { createHash } from 'node:crypto'
import makeDebug from 'debug'
import { JSDOM } from 'jsdom'
import { z } from 'zod'
import { dom as dom_namespace } from '@jackdbd/zod-schemas'
import { DEBUG_PREFIX } from '../constants.js'
import { validatedDataOrThrow } from '../validation.js'
import {
  cssSelectorMatchesToTexts,
  xPathExpressionMatchesToTexts
} from '../dom.js'
import { text_to_synthesize } from '../synthesis/schemas.js'

const debug = makeDebug(`${DEBUG_PREFIX}:texts-that-match`)

const css_selector = dom_namespace.css_selector
const xpath_expression = dom_namespace.xpath_expression

const aggregator = z.record(text_to_synthesize)

export type MatchRecord = z.infer<typeof aggregator>

export const config_schema = z.object({
  dom: z.instanceof(JSDOM),
  cssSelectors: z.array(css_selector),
  xPathExpressions: z.array(xpath_expression)
})

type Config = z.infer<typeof config_schema>

export const val = z.object({
  text: text_to_synthesize,
  cssSelectors: z.array(css_selector),
  xPathExpressions: z.array(xpath_expression)
})

export const record = z.record(val)

export type MyRecord = z.infer<typeof record>

export const hashMapForOneRule = (config: Config) => {
  const cfg = validatedDataOrThrow(config, config_schema)

  const { dom, cssSelectors, xPathExpressions } = cfg
  const doc = dom.window.document

  const rec: MyRecord = {}

  const cssMatches = cssSelectors.map((selector) => {
    return {
      selector,
      texts: cssSelectorMatchesToTexts({
        dom,
        selector,
        shouldThrowWhenNoMatches: false
      })
    }
  })
  debug(`${cssMatches.length} CSS selector match/es on document '${doc.title}'`)

  for (const cssMatch of cssMatches) {
    const { selector, texts } = cssMatch
    debug(`CSS selector ${selector} matches ${texts.length} text/s`)
    for (const text of texts) {
      const md5 = createHash('md5')
      const key = md5.update(text).digest('hex')
      if (rec[key]) {
        rec[key].cssSelectors.push(selector)
      } else {
        rec[key] = { text, cssSelectors: [selector], xPathExpressions: [] }
      }
    }
  }

  const xPathMatches = xPathExpressions.map((expression) => {
    return {
      expression,
      texts: xPathExpressionMatchesToTexts({
        dom,
        expression,
        shouldThrowWhenNoMatches: false
      })
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
      if (rec[key]) {
        rec[key].xPathExpressions.push(expression)
      } else {
        rec[key] = { text, cssSelectors: [], xPathExpressions: [expression] }
      }
    }
  }

  return rec
}
