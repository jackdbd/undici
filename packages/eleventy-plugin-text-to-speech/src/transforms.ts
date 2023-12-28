import makeDebug from 'debug'
import type { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { JSDOM } from 'jsdom'
import { DEBUG_PREFIX } from './constants.js'
import {
  cssSelectorMatchesToTexts,
  xPathExpressionMatchesToTexts,
  insertAudioPlayersMatchingCssSelector,
  insertAudioPlayersMatchingXPathExpression
} from './dom.js'
import type { AudioEncoding, AudioInnerHTML, Rule } from './types.js'
import type { Writer } from './writers.js'
import { audioAssetsFromText } from './audio-assets-from-text.js'

const debug = makeDebug(`${DEBUG_PREFIX}:transforms`)

interface InjectIntoDomConfig {
  audioEncodings: AudioEncoding[]
  audioInnerHTML: AudioInnerHTML
  cacheExpiration: string
  dom: JSDOM
  outputPath: string
  textToSpeechClient: TextToSpeechClient
  rule: Rule
  voice: string
  writer: Writer
}

const injectIntoDom = async ({
  audioEncodings,
  audioInnerHTML,
  cacheExpiration,
  dom,
  outputPath,
  rule,
  textToSpeechClient,
  voice,
  writer
}: InjectIntoDomConfig) => {
  const doc = dom.window.document

  const { regex, cssSelectors, xPathExpressions } = rule
  debug(
    `${outputPath} matches regex pattern "${regex.toString()}", so it will be transformed`
  )

  const cssMatches = cssSelectors.map((selector) => {
    return {
      selector,
      texts: cssSelectorMatchesToTexts({ dom, selector })
    }
  })
  debug(
    `found ${cssMatches.length} CSS selector match/es on ${outputPath} (document title: ${doc.title})`
  )

  const cssPromises = cssMatches.map(async (cssMatch) => {
    const assetsPromises = cssMatch.texts.map((text) =>
      audioAssetsFromText({
        audioEncodings,
        cacheExpiration,
        outputPath,
        text,
        textToSpeechClient,
        voice,
        writer
      })
    )
    const results = await Promise.all(assetsPromises)
    return { selector: cssMatch.selector, results }
  })

  const cssResults = await Promise.all(cssPromises)

  cssResults.forEach((cssResult) => {
    const hrefs = cssResult.results.map((res) => res.hrefs)
    insertAudioPlayersMatchingCssSelector({
      audioInnerHTML,
      cssSelector: cssResult.selector,
      dom,
      hrefs
    })
  })
  debug(
    `${cssResults.length} audio tags injected because of CSS selector matches`
  )

  const xPathMatches = xPathExpressions.map((expression) => {
    return {
      expression,
      texts: xPathExpressionMatchesToTexts({ dom, expression })
    }
  })
  debug(
    `found ${xPathMatches.length} XPath expression match/es on ${outputPath} (document title: ${doc.title})`
  )

  const xPathPromises = xPathMatches.map(async (xPathMatch) => {
    const assetsPromises = xPathMatch.texts.map((text) =>
      audioAssetsFromText({
        audioEncodings,
        cacheExpiration,
        outputPath,
        text,
        textToSpeechClient,
        voice,
        writer
      })
    )
    const results = await Promise.all(assetsPromises)
    return { expression: xPathMatch.expression, results }
  })

  const xPathResults = await Promise.all(xPathPromises)

  xPathResults.forEach((xPathResult) => {
    const hrefs = xPathResult.results.map((res) => res.hrefs)
    insertAudioPlayersMatchingXPathExpression({
      audioInnerHTML,
      dom,
      expression: xPathResult.expression,
      hrefs
    })
  })
  debug(
    `${xPathResults.length} audio tags injected because of XPath expression matches`
  )
}

interface Config {
  audioEncodings: AudioEncoding[]
  audioInnerHTML: AudioInnerHTML
  cacheExpiration: string
  rules: Rule[]
  textToSpeechClient: TextToSpeechClient
  transformName: string
  voice: string
  writer: Writer
}

export const makeInjectAudioTagsIntoHtml = (config: Config) => {
  const {
    audioEncodings,
    audioInnerHTML,
    cacheExpiration,
    rules,
    textToSpeechClient,
    transformName,
    voice,
    writer
  } = config

  return async function injectAudioTagsIntoHtml(
    content: string,
    outputPath: string
  ) {
    debug(`transform ${transformName} invoked on ${outputPath}`)

    const indexes = rules
      .map((m, i) => {
        return m.regex.test(outputPath)
          ? { i, matched: true }
          : { i, matched: false }
      })
      .filter((d) => d.matched)
      .map((d) => d.i)

    if (indexes.length === 0) {
      debug(
        `${outputPath} does NOT match any regex pattern, so the transform ${transformName} will NOT transform it`
      )
      return content
    } else {
      debug(`${outputPath} matches ${indexes.length} regex pattern/s`)
    }

    const dom = new JSDOM(content)

    const promises = indexes.map((i) => {
      return injectIntoDom({
        audioEncodings,
        audioInnerHTML,
        cacheExpiration,
        dom,
        outputPath,
        rule: rules[i],
        textToSpeechClient,
        voice,
        writer
      })
    })

    await Promise.all(promises)

    return dom.serialize()
  }
}
