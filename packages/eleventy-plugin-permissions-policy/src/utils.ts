import fs from 'node:fs'
import defDebug from 'debug'
import { DEBUG_PREFIX } from './constants.js'
import type { Directive } from './schemas.js'

const debug = defDebug(`${DEBUG_PREFIX}:utils`)

/**
 * Converts a Feature-Policy directive to a string.
 *
 * @param {Directive} d
 */
export const featurePolicyDirectiveMapper = (d: Directive) => {
  const allowlist =
    d.allowlist === undefined || d.allowlist.length === 0
      ? `'none'`
      : d.allowlist
          .map((s) => {
            return s === '*' ? s : `'${s}'`
          })
          .join(' ')

  return `${d.feature} ${allowlist}`
}

/**
 * Converts a Permissions-Policy directive to a string.
 *
 * @param {Directive} d
 */
export const permissionsPolicyDirectiveMapper = (d: Directive) => {
  const allowlist =
    d.allowlist === undefined || d.allowlist.length === 0
      ? ''
      : d.allowlist
          .map((s) => {
            return s.includes('http') ? `"${s}"` : s
          })
          .join(' ')

  if (allowlist === '*') {
    return `${d.feature}=*`
  } else {
    return `${d.feature}=(${allowlist})`
  }
}

export const appendToHeadersFile = (
  headerKey: string,
  headerValue: string,
  headersFilepath: string,
  patterns: string[]
) => {
  patterns.forEach((pattern) => {
    debug(`add ${headerKey} header for resources matching ${pattern}`)
    fs.appendFileSync(
      headersFilepath,
      `\n${pattern}\n  ${headerKey}: ${headerValue}\n`
    )
  })
}
