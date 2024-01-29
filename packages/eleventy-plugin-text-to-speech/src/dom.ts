import path from 'node:path'
import makeDebug from 'debug'
import { htmlToText } from 'html-to-text'
import { JSDOM } from 'jsdom'
import { z } from 'zod'
import { css_selector, xpath_expression } from '@jackdbd/zod-schemas/dom'
import { DEBUG_PREFIX } from './constants.js'
import { mediaType } from './media-type.js'
import { href as href_schema } from './schemas/common.js'
import { validatedDataOrThrow } from './validation.js'

const debug = makeDebug(`${DEBUG_PREFIX}:dom`)

export const css_selector_config = z
  .object({
    dom: z.instanceof(JSDOM),
    selector: css_selector,
    shouldThrowWhenNoMatches: z.boolean()
  })
  .describe('CSS selector config')

export type CssSelectorConfig = z.infer<typeof css_selector_config>

export const cssSelectorMatchesToTexts = (config: CssSelectorConfig) => {
  const cfg = validatedDataOrThrow(config, css_selector_config)

  const { dom, selector, shouldThrowWhenNoMatches } = cfg

  const texts = [] as string[]

  const elements = dom.window.document.querySelectorAll(selector)

  if (elements.length === 0) {
    const message = `did NOT find any HTML that matches CSS selector ${selector}`
    if (shouldThrowWhenNoMatches) {
      throw new Error(message)
    } else {
      debug(message)
    }
  }

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
        `found HTML that matches CSS selector ${selector} (el.textContent !== el.innerHTML)`
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

  return texts
}

export const xpath_expression_config = z
  .object({
    dom: z.instanceof(JSDOM),
    expression: xpath_expression,
    shouldThrowWhenNoMatches: z.boolean()
  })
  .describe('XPath expression config')

export type XPathExpressionConfig = z.infer<typeof xpath_expression_config>

export const xPathExpressionMatchesToTexts = (
  config: XPathExpressionConfig
) => {
  const cfg = validatedDataOrThrow(config, xpath_expression_config)

  const { dom, expression, shouldThrowWhenNoMatches } = cfg

  const doc = dom.window.document

  const texts = [] as string[]

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

  const node = xPathResult.iterateNext()
  if (node) {
    // node.nodeName
    // node.nodeType
    if (node.textContent) {
      debug(
        `found HTML that matches XPath expression ${expression} on page ${doc.title}`
      )
      texts.push(node.textContent)
    }
  } else {
    const message = `did NOT find any HTML that matches XPath expression ${expression} on page ${doc.title}`
    if (shouldThrowWhenNoMatches) {
      throw new Error(message)
    } else {
      debug(message)
    }
  }

  return texts
}

export const audio_inner_html = z
  .function()
  .args(z.array(href_schema))
  .returns(z.string().min(1))

export type AudioInnerHtml = z.infer<typeof audio_inner_html>

export const defaultAudioInnerHTML = (hrefs: string[]) => {
  const aTags: string[] = []
  const sourceTags: string[] = []

  hrefs.forEach((href) => {
    const { error, value } = mediaType(path.extname(href))

    if (error && value) {
      throw new Error(`You can't have both an error and a value`)
    }

    if (error) {
      sourceTags.push(
        `<p>${error.message}. Here is a <a href="${href}">link to the audio</a> instead.</p>`
      )
    }

    if (value) {
      aTags.push(`<a href="${href}" target="_blank">${href}</a>`)
      sourceTags.push(`<source src=${href} type="${value}">`)
    }
  })

  const p = `<p>Your browser doesn't support HTML5 <code>audio</code>. Here are the links to the audio files instead:</p>`
  const ul = `<ul>${aTags.map((a) => `<li>${a}</li>`).join('')}</ul>`
  const fallback = `${p}${ul}`

  return `${sourceTags.join('')}${fallback}`
}

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
  const cfg = validatedDataOrThrow(config, css_selector_match_config)

  const { audioInnerHTML, cssSelector, dom, hrefs } = cfg

  const doc = dom.window.document
  const elements = doc.querySelectorAll(cssSelector)
  if (elements.length === 0) {
    const message = `found no matches for the CSS selector ${cssSelector} on page ${doc.title}. No audio tags will be injected into the HTML`
    debug(message)
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
  const cfg = validatedDataOrThrow(config, xpath_expression_match_config)

  const { audioInnerHTML, dom, expression, hrefs } = cfg

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
}
