import { options as options_schema, type Options } from './options.js'
import { validatedResult } from './validation.js'

export type { Allowlist, AllowlistItem } from './allowlist.js'
export { allow_item, allowlist } from './allowlist.js'
export type { Feature } from './feature.js'
export { feature } from './feature.js'
export type { Options } from './options.js'
export { options } from './options.js'

export const permissionsPolicy = (options?: Options) => {
  const result = validatedResult(options, options_schema)
  if (result.error) {
    const detail =
      'If you are trying to configure Permissions-Policy with one or more features not implemented in this library, you can opt out of the schema validation by setting the environment variable `SKIP_VALIDATION` to `1`.'
    const error = new Error(`${result.error.message}. ${detail}`)
    return { error }
  }
  if (!result.value) {
    return { error: new Error(`options not set`) }
  }
  if (!result.value.features) {
    return { error: new Error(`features not set`) }
  }

  const { features, reportingEndpoint } = result.value

  const directives: string[] = []
  Object.entries(features).map(([feature, arr]) => {
    const allowlist =
      arr === undefined || arr.length === 0
        ? ''
        : arr
            .map((s) => {
              return s.includes('http') ? `"${s}"` : s
            })
            .join(' ')

    if (allowlist === '*') {
      directives.push(`${feature}=*`)
    } else {
      directives.push(`${feature}=(${allowlist})`)
    }
  })

  directives.sort()

  const value = reportingEndpoint
    ? `${directives.join(', ')}; report-to="${reportingEndpoint}"`
    : directives.join(', ')

  return { value }
}

export const featurePolicy = (options?: Options) => {
  const result = validatedResult(options, options_schema)
  if (result.error) {
    const detail =
      'If you are trying to configure Feature-Policy with one or more features not implemented in this library, you can opt out of the schema validation by setting the environment variable `SKIP_VALIDATION` to `1`.'
    const error = new Error(`${result.error.message}. ${detail}`)
    return { error }
  }
  if (!result.value) {
    return { error: new Error(`options not set`) }
  }
  if (!result.value.features) {
    return { error: new Error(`features not set`) }
  }

  const { features } = result.value

  const directives: string[] = []
  Object.entries(features).map(([feature, arr]) => {
    const allowlist =
      arr === undefined || arr.length === 0
        ? `'none'`
        : arr
            .map((s) => {
              return s.includes('http') || s === '*' ? s : `'${s}'`
            })
            .join(' ')

    directives.push(`${feature} ${allowlist}`)
  })

  directives.sort()

  // I don't think report-to is available to Feature-Policy
  return { value: directives.join('; ') }
}
