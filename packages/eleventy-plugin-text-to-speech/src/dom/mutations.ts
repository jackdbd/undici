import makeDebug from 'debug'
import { JSDOM } from 'jsdom'
import { z } from 'zod'
import { xpath_expression } from '@jackdbd/zod-schemas/dom'
import { DEBUG_PREFIX } from '../constants.js'
import { href as href_schema } from '../schemas/common.js'
import { validatedResult } from '../validation.js'
import { audio_inner_html } from '../audio-html.js'

const debug = makeDebug(`${DEBUG_PREFIX}:dom:mutations`)

export const schema = z
  .object({
    audioInnerHTML: audio_inner_html,
    dom: z.instanceof(JSDOM),
    expression: xpath_expression,
    hrefs: z.array(href_schema),
    idx: z.number().min(0)
  })
  .describe('XPath expression match config')

export type Config = z.infer<typeof schema>

export const insertAudioPlayerMatchingXPathExpression = (config: Config) => {
  const res = validatedResult(config, schema)
  if (res.error) {
    return { error: res.error }
  }

  const { audioInnerHTML, dom, expression, hrefs, idx } = res.value

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

  const messages: string[] = []
  let discarded = 0
  while (discarded < idx) {
    xPathResult.iterateNext()
    const msg = `already matched ${idx} node/s, so node ${discarded} is discarded`
    messages.push(msg)
    debug(msg)
    discarded++
  }

  const node = xPathResult.iterateNext()
  if (node) {
    messages.push(
      `found match for the XPath expression ${expression} on page ${doc.title}`
    )

    const audio = doc.createElement('audio')
    audio.controls = true
    audio.innerHTML = audioInnerHTML(hrefs)

    if (node.parentNode) {
      if (node.nextSibling) {
        const msg = `matching node has both a parent and a sibling`
        messages.push(msg)
        node.parentNode.insertBefore(audio, node.nextSibling)
      } else {
        const msg = `matching node has a parent but no sibling`
        messages.push(msg)
        node.parentNode.appendChild(audio)
      }
    } else {
      const msg = `matching node has no parent`
      messages.push(msg)
      // maybe try inserting using previousSibling?
    }
  } else {
    messages.push(
      `found no matches for the XPath expression ${expression} on page ${doc.title}`
    )
    if (discarded) {
      messages.push(`after ${discarded} node/s were already discarded`)
      messages.push(`no more audio tags will be injected into the HTML`)
    } else {
      messages.push(`no audio tags will be injected into the HTML`)
    }
  }

  const message = messages.join('; ')
  debug(message)

  return { value: { message } }
}
