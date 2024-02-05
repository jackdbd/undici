import defDebug from 'debug'
import { JSDOM } from 'jsdom'
import { calculate, compare } from 'specificity'
import { z } from 'zod'
import { transform_name } from '@jackdbd/zod-schemas/eleventy'

import {
  DEBUG_PREFIX,
  DEFAULT_REGEX,
  DEFAULT_TRANSFORM_NAME,
  ERR_PREFIX,
  OK_PREFIX
} from '../constants.js'
import { insertAudioPlayerMatchingXPathExpression } from '../dom/mutations.js'
import { logErrors } from '../log.js'
import { rule } from '../schemas/rule.js'
import { textToAudioAsset } from '../text-to-audio-asset.js'
import { validatedDataOrThrow } from '../validation.js'
import { aggregateRules } from '../aggregate-rules.js'

export const config_schema = z
  .object({
    rules: z.array(rule).min(1),
    transformName: transform_name.default(DEFAULT_TRANSFORM_NAME)
  })
  .describe(`11ty transform ${DEFAULT_TRANSFORM_NAME} config`)

export type Config = z.input<typeof config_schema>

export const injectAudioTagsUnbounded = async (
  config: Config,
  content: string,
  outputPath: string
) => {
  const cfg = validatedDataOrThrow(config, config_schema)

  const transformName = cfg.transformName || DEFAULT_TRANSFORM_NAME
  const debug = defDebug(`${DEBUG_PREFIX}:${transformName}`)

  debug(`11ty transform ${transformName} invoked on ${outputPath}`)

  const matches = cfg.rules
    .map((r, i) => {
      // If we skip validation with zod, regex might be undefined. So we assign
      // the default value now.
      const regex = r.regex || DEFAULT_REGEX
      return regex.test(outputPath)
        ? { idx: i, regex, matched: true }
        : { idx: i, regex, matched: false }
    })
    .filter((d) => d.matched)

  if (matches.length === 0) {
    debug(
      `${outputPath} does NOT match any regex pattern, so the transform ${transformName} will NOT transform it`
    )
    return content
  } else {
    debug(`${matches.length} regex pattern/s match ${outputPath} %O`, {
      regexes: matches.map((m) => m.regex)
    })
  }

  const dom = new JSDOM(content)

  // Step 1: find all CSS selector matches and XPath expression matches, across
  // ALL rules, to find ALL texts of this document that should be synthesized
  // into speech.
  const res = aggregateRules({ dom, rules: cfg.rules, matches })
  if (res.error) {
    throw new Error(`${ERR_PREFIX} ${res.error.message}`)
  }
  const rec = res.value

  const configs = Object.entries(rec).map(([hash, v]) => {
    return {
      hash,
      text: v.text,
      'CSS selectors': v.cssSelectors.length,
      'XPath expressions': v.xPathExpressions.length,
      'synthesis configurations': v.synthesis_configs.length,
      'hosting configurations': v.hosting_configs.length
    }
  })

  debug(
    `${configs.length} audio player/s will be injected in ${outputPath} %O`,
    configs
  )

  // Step 2: wait for ALL audio assets of ONE text to be generated, so we have
  // all hrefs for the audio player corresponding to that text.
  const promises = Object.values(rec).map(async (value) => {
    const {
      audioInnerHTML,
      cssSelectors,
      hosting_configs,
      synthesis_configs,
      text,
      xPathExpressions
    } = value

    const assetsPromises = synthesis_configs.map((synthesis, i) => {
      return textToAudioAsset({
        text,
        synthesis,
        hosting: hosting_configs[i]
      })
    })

    const results = await Promise.all(assetsPromises)

    let cssSelector: string | undefined = undefined
    if (cssSelectors.length === 1) {
      cssSelector = cssSelectors[0]
    } else if (cssSelectors.length > 0) {
      cssSelector = cssSelectors
        .map((selector) => {
          return { selector, specificity: calculate(selector) }
        })
        .sort((a, b) => {
          return compare(a.specificity, b.specificity)
        })[0].selector
    } else {
      cssSelector = undefined
    }

    // Is there a way to establish a priority among the XPath expressions? I mean,
    // between //p[contains(., "Hello")] and //p[contains(., "Hello World")], I
    // would argue the latter is more specific and should take precedence.
    const xPathExpression =
      xPathExpressions.length > 0 ? xPathExpressions[0] : undefined

    const hm = {
      audioInnerHTML,
      text,
      hrefs: [] as string[],
      errors: [] as Error[],
      cssSelector,
      xPathExpression
    }

    results.forEach((res) => {
      if (res.error) {
        hm.errors.push(res.error)
      } else {
        hm.hrefs.push(res.value.href)
      }
    })

    return hm
  })

  const maps = await Promise.all(promises)
  const counter = {} as Record<string, number>

  const doc = dom.window.document

  // Step 3: for each text, inject ONE audio player for that text, with ALL the
  // hrefs corresponding to the audio sources available for that text.
  const errors: Error[] = []
  const successes: string[] = []
  maps.forEach((hm) => {
    const audioInnerHTML = hm.audioInnerHTML
    const expression = hm.xPathExpression
    const hrefs = hm.hrefs

    hm.errors.forEach((err) => errors.push(err))

    // Picking the first matching XPath expression even when there is a matching
    // CSS selector is a somewhat arbitrary decision. I might revisit this
    // decision in the future.
    if (expression) {
      const idx = counter[expression] || 0

      const res = insertAudioPlayerMatchingXPathExpression({
        audioInnerHTML,
        expression,
        dom,
        hrefs,
        idx
      })

      if (idx) {
        counter[expression]++
      } else {
        counter[expression] = 1
      }

      if (res.error) {
        errors.push(res.error)
      }
    }

    if (!hm.xPathExpression && hm.cssSelector) {
      const elements = doc.querySelectorAll(hm.cssSelector)

      if (elements.length === 0) {
        return {
          error: new Error(
            `no elements found matching CSS selector ${hm.cssSelector}`
          )
        }
      }

      const idx = counter[hm.cssSelector]
      let elem: Element
      if (idx) {
        elem = elements[idx]
        counter[hm.cssSelector]++
      } else {
        elem = elements[0]
        counter[hm.cssSelector] = 1
      }

      const position = 'afterend'
      const innerHTML = `<audio controls>${audioInnerHTML(hrefs)}</audio>`
      elem.insertAdjacentHTML(position, innerHTML)
    }

    if (hm.errors.length === 0) {
      successes.push(`inserted all audio players in ${outputPath}`)
    }
  })

  logErrors(errors, outputPath)

  if (successes.length > 0) {
    console.log(`${OK_PREFIX} inserted audio players in ${outputPath}`)
  }

  return dom.serialize()
}
