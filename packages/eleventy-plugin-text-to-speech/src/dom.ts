import path from 'node:path'
import makeDebug from 'debug'
import { htmlToText } from 'html-to-text'
import type { JSDOM } from 'jsdom'
import { DEBUG_PREFIX } from './constants.js'
import { mediaType } from './utils.js'

const debug = makeDebug(`${DEBUG_PREFIX}:dom`)

interface CssSelectorConfig {
  dom: JSDOM
  selector: string
  shouldThrowWhenNoMatches?: boolean
}

export const cssSelectorMatchesToTexts = ({
  dom,
  selector,
  shouldThrowWhenNoMatches = false
}: CssSelectorConfig) => {
  const texts = [] as string[]

  const elements = dom.window.document.querySelectorAll(selector)

  if (elements.length === 0) {
    const message = `dit NOT find any HTML that matches CSS selector ${selector}`
    if (shouldThrowWhenNoMatches) {
      throw new Error(message)
    } else {
      debug(message)
    }
  }

  elements.forEach((el) => {
    debug(`found HTML that matches CSS selector ${selector}`)
    // el.ariaValueText
    // el.textContent
    // el.outerHTML
    if (el.textContent === el.innerHTML) {
      texts.push(el.textContent)
    } else {
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

interface XPathExpressionConfig {
  dom: JSDOM
  expression: string
  shouldThrowWhenNoMatches?: boolean
}

export const xPathExpressionMatchesToTexts = ({
  dom,
  expression,
  shouldThrowWhenNoMatches = false
}: XPathExpressionConfig) => {
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
    const message = `dit NOT find any HTML that matches XPath expression ${expression} on page ${doc.title}`
    if (shouldThrowWhenNoMatches) {
      throw new Error(message)
    } else {
      debug(message)
    }
  }

  return texts
}

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

interface MatchConfig {
  dom: JSDOM
  hrefs: string[][]
  audioInnerHTML: (hrefs: string[]) => string
}

interface CssSelectorMatchConfig extends MatchConfig {
  cssSelector: string
}

export const insertAudioPlayersMatchingCssSelector = ({
  audioInnerHTML,
  cssSelector,
  dom,
  hrefs
}: CssSelectorMatchConfig) => {
  const doc = dom.window.document
  const elements = doc.querySelectorAll(cssSelector)
  if (elements.length === 0) {
    const message = `found no matches for the CSS selector ${cssSelector} on page ${doc.title}. No audio tags will be injected into the HTML`
    debug(message)
  }

  const position = 'afterend'

  elements.forEach((el, i) => {
    const innerHTML = `<audio controls>${audioInnerHTML(hrefs[i])}</audio>`
    debug(
      `insert player ${position} CSS selector ${cssSelector} match index ${i}`
    )
    el.insertAdjacentHTML(position, innerHTML)
  })
}

interface XPathExpressionMatchConfig extends MatchConfig {
  expression: string
}

export const insertAudioPlayersMatchingXPathExpression = ({
  audioInnerHTML,
  dom,
  expression,
  hrefs
}: XPathExpressionMatchConfig) => {
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
