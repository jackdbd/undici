import defDebug from 'debug'
import { htmlToText } from 'html-to-text'
import { JSDOM } from 'jsdom'
import { z } from 'zod'
import { css_selector, xpath_expression } from '@jackdbd/zod-schemas/dom'
import { DEBUG_PREFIX } from '../constants.js'
import { validatedResult } from '../validation.js'

const debug = defDebug(`${DEBUG_PREFIX}:dom:matchers`)

export const css_selector_config = z
  .object({
    dom: z.instanceof(JSDOM),
    selector: css_selector
  })
  .describe('CSS selector config')

export type CssSelectorConfig = z.infer<typeof css_selector_config>

/**
 * Finds all texts that match a CSS selector and convert them to plain text if necessary.
 */
export const cssSelectorMatchesToTexts = (config: CssSelectorConfig) => {
  const res = validatedResult(config, css_selector_config)
  if (res.error) {
    return { error: res.error }
  }

  const { dom, selector } = res.value

  const texts = [] as string[]
  const elements = dom.window.document.querySelectorAll(selector)
  elements.forEach((el) => {
    // el.ariaValueText
    // el.textContent
    // el.outerHTML
    if (el.textContent === el.innerHTML) {
      debug(
        `found HTML that matches CSS selector ${selector} (el.textContent === el.innerHTML)`
      )
      texts.push(el.textContent)
    } else {
      debug(
        `found HTML that matches CSS selector ${selector} (el.textContent !== el.innerHTML => will use html-to-text to convert el.innerHTML to plain text)`
      )
      // https://github.com/html-to-text/node-html-to-text#options
      // TODO: maybe allow the user to specify options for html-to-text? Maybe a
      // subset of the available options?
      const text = htmlToText(el.innerHTML, {
        selectors: [
          { selector: 'a', options: { ignoreHref: true } },
          { selector: 'ul', options: { itemPrefix: ' * ' } }
        ],
        wordwrap: false
      })
      texts.push(text)
    }
  })

  return { value: texts }
}

export const xpath_expression_config = z
  .object({
    dom: z.instanceof(JSDOM),
    expression: xpath_expression
  })
  .describe('XPath expression config')

export type XPathExpressionConfig = z.infer<typeof xpath_expression_config>

/**
 * Finds all texts that match an XPath expression.
 */
export const xPathExpressionMatchesToTexts = (
  config: XPathExpressionConfig
) => {
  const res = validatedResult(config, xpath_expression_config)
  if (res.error) {
    return { error: res.error }
  }

  const { dom, expression } = res.value

  const doc = dom.window.document
  const contextNode = doc
  const resolver = null

  // https://github.com/jsdom/jsdom/blob/04f6c13f4a4d387c7fc979b8f62c6f68d8a0c639/lib/jsdom/level3/xpath.js#L1765
  const xPathResultType = dom.window.XPathResult.ANY_TYPE

  debug(`evalutate XPath expression ${expression} on page ${doc.title}`)
  const xPathResult = doc.evaluate(
    expression,
    contextNode,
    resolver,
    xPathResultType,
    null
  )

  const texts = [] as string[]
  let node = null
  while ((node = xPathResult.iterateNext())) {
    // node.nodeName
    // node.nodeType
    if (node.textContent) {
      debug(
        `found HTML that matches XPath expression ${expression} on page ${doc.title}`
      )
      texts.push(node.textContent)
    }
  }

  return { value: texts }
}
