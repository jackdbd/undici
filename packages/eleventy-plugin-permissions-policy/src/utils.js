// import type { Directive } from './schemas.js'

/**
 * Converts a Feature-Policy directive to a string.
 * @param {Directive} d
 */
export const featurePolicyDirectiveMapper = (d) => {
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
 * @param {Directive} d
 */
export const permissionsPolicyDirectiveMapper = (d) => {
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
