import makeDebug from 'debug'
import { JSDOM } from 'jsdom'
import { z } from 'zod'
import { css_selector, xpath_expression } from '@jackdbd/zod-schemas/dom'
import { DEBUG_PREFIX } from '../constants.js'
import { href as href_schema } from '../schemas/common.js'
import { validatedResult } from '../validation.js'
import { audio_inner_html } from '../audio-html.js'

const debug = makeDebug(`${DEBUG_PREFIX}:dom:mutations`)

export const css_selector_match_config = z
  .object({
    audioInnerHTML: audio_inner_html,
    cssSelector: css_selector,
    dom: z.instanceof(JSDOM),
    hrefs: z.array(href_schema)
  })
  .describe('CSS selector match config')

export type CssSelectorMatchConfig = z.infer<typeof css_selector_match_config>

export const insertAudioPlayersMatchingCssSelector = (
  config: CssSelectorMatchConfig
) => {
  const res = validatedResult(config, css_selector_match_config)
  if (res.error) {
    return { error: res.error }
  }

  const { audioInnerHTML, cssSelector, dom, hrefs } = res.value

  const doc = dom.window.document
  const elements = doc.querySelectorAll(cssSelector)
  if (elements.length === 0) {
    const message = `found no matches for the CSS selector ${cssSelector} on page ${doc.title}. No audio tags will be injected into the HTML`
    debug(message)
    return { value: { message } }
  }

  const position = 'afterend'

  elements.forEach((el, i) => {
    const innerHTML = `<audio controls>${audioInnerHTML(hrefs)}</audio>`
    debug(`insert audio player ${i + 1}/${elements.length} %O`, {
      'insertAdjacentHTML() position': position,
      'CSS selector': cssSelector,
      innerHTML
    })
    el.insertAdjacentHTML(position, innerHTML)
  })

  return {
    value: {
      message: `found ${elements.length} matches for the CSS selector ${cssSelector} on page ${doc.title}`
    }
  }
}

export const xpath_expression_match_config = z
  .object({
    audioInnerHTML: audio_inner_html,
    dom: z.instanceof(JSDOM),
    expression: xpath_expression,
    hrefs: z.array(z.array(href_schema)) // does this really need to be nested?
  })
  .describe('XPath expression match config')

export type XPathExpressionMatchConfig = z.infer<
  typeof xpath_expression_match_config
>

export const insertAudioPlayersMatchingXPathExpression = (
  config: XPathExpressionMatchConfig
) => {
  const res = validatedResult(config, xpath_expression_match_config)
  if (res.error) {
    return { error: res.error }
  }

  const { audioInnerHTML, dom, expression, hrefs } = res.value

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

  let i = 0
  while (hrefs[i]) {
    const node = xPathResult.iterateNext()
    if (node) {
      const audio = doc.createElement('audio')
      audio.controls = true
      audio.innerHTML = audioInnerHTML(hrefs[i])

      if (node.parentNode) {
        if (node.nextSibling) {
          const message = `node that matches XPath expression ${expression} on page ${doc.title} has both a parent and a sibling`
          debug(message)
          node.parentNode.insertBefore(audio, node.nextSibling)
        } else {
          const message = `node that matches XPath expression ${expression} on page ${doc.title} has a parent but no sibling`
          debug(message)
          node.parentNode.appendChild(audio)
        }
      } else {
        const message = `node that matches XPath expression ${expression} on page ${doc.title} has no parent`
        debug(message)
        // maybe try inserting using previousSibling?
      }
    } else {
      const message = `found no matches for the XPath expression ${expression} on page ${doc.title}. No audio tags will be injected into the HTML`
      debug(message)
    }
    i++
  }

  return {
    value: {
      message: `found ${i} matches for the XPath expression ${expression} on page ${doc.title}`
    }
  }
}
