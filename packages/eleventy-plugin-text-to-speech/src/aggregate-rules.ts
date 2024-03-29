import defDebug from 'debug'
import { JSDOM } from 'jsdom'
import { z } from 'zod'
import {
  DEBUG_PREFIX,
  DEFAULT_CSS_SELECTORS,
  DEFAULT_REGEX,
  DEFAULT_XPATH_EXPRESSIONS
} from './constants.js'
import { audio_inner_html, defaultAudioInnerHTML } from './audio-html.js'
import { hosting } from './hosting/schemas.js'
import { synthesis } from './synthesis/schemas.js'
import { rule } from './schemas/rule.js'
import { validatedResult } from './validation.js'
import { match_object, ruleMatchRecord } from './rule-match-record.js'

const debug = defDebug(`${DEBUG_PREFIX}:aggregate-rules`)

export const match = z.object({
  idx: z.number().min(0),
  regex: z.instanceof(RegExp),
  matched: z.boolean()
})

export const config_schema = z.object({
  dom: z.instanceof(JSDOM),
  matches: z.array(match),
  rules: z.array(rule)
})

export type Config = z.input<typeof config_schema>

const match_value = match_object.merge(
  z.object({
    audioInnerHTML: audio_inner_html,
    synthesis_configs: z.array(synthesis),
    hosting_configs: z.array(hosting)
  })
)

export type MatchValue = z.infer<typeof match_value>

export const match_record = z.record(match_value)

export type MatchRecord = z.infer<typeof match_record>

export const aggregateRules = (config: Config) => {
  const res = validatedResult(config, config_schema)
  if (res.error) {
    return { error: res.error }
  }

  const { dom, matches, rules } = res.value

  if (matches.length > rules.length) {
    return {
      error: new Error(
        `you cannot have more matches (${matches.length}) than rules (${rules.length})`
      )
    }
  }

  const doc = dom.window.document
  const title = doc.title

  const hm: MatchRecord = {}
  const errors: Error[] = []

  matches.forEach((m) => {
    if (m.idx >= rules.length) {
      errors.push(
        new Error(
          `you have only ${rules.length} rules, you cannot use idx=${m.idx} as a match index`
        )
      )
      return
    }
    const rule = rules[m.idx]
    const regex = rule.regex || DEFAULT_REGEX
    const cssSelectors = rule.cssSelectors || DEFAULT_CSS_SELECTORS
    const xPathExpressions = rule.xPathExpressions || DEFAULT_XPATH_EXPRESSIONS

    debug(
      `document '${title}' matched regex ${regex} (rules[${m.idx}] of ${rules.length} rules) %O`,
      {
        regex,
        cssSelectors,
        xPathExpressions
      }
    )

    const res_one = ruleMatchRecord({ dom, cssSelectors, xPathExpressions })

    if (res_one.error) {
      errors.push(res_one.error)
    } else {
      for (const [key, value] of Object.entries(res_one.value)) {
        if (hm[key]) {
          const old_css = hm[key].cssSelectors
          const old_xpath = hm[key].xPathExpressions

          hm[key].cssSelectors = [...old_css, ...value.cssSelectors]
          hm[key].xPathExpressions = [...old_xpath, ...value.xPathExpressions]
          hm[key].hosting_configs.push(rule.hosting)
          hm[key].synthesis_configs.push(rule.synthesis)
        } else {
          hm[key] = {
            ...value,
            audioInnerHTML: rule.audioInnerHTML || defaultAudioInnerHTML,
            synthesis_configs: [rule.synthesis],
            hosting_configs: [rule.hosting]
          }
        }
      }
    }
  })

  if (errors.length > 0) {
    const summary = `Encountered ${errors.length} error/s while processing document '${doc.title}'`
    const details = errors.map((e) => e.message)
    return { error: new Error(`${summary}\n${details.join('\n')}`) }
  }

  return { value: hm }
}
