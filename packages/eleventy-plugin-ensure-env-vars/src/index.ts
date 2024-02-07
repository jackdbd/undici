/**
 * Entry point for the documentation of eleventy-plugin-ensure-env-vars.
 *
 * @packageDocumentation
 */
import defDebug from 'debug'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import type { EleventyConfig } from '@11ty/eleventy'
import { DEBUG_PREFIX, ERR_PREFIX } from './constants.js'
import { options as schema, type Options, env_var } from './schemas.js'

// exports for TypeDoc
export type { EleventyConfig } from '@11ty/eleventy'
export { env_var } from './schemas.js'
export type { Options } from './schemas.js'

const debug = defDebug(`${DEBUG_PREFIX}:index`)

/**
 * Plugin that checks whether the environment variables you specified are set
 * when Eleventy builds your site.
 *
 * @public
 * @param eleventyConfig - {@link EleventyConfig | Eleventy configuration}.
 * @param options - Plugin {@link Options | options}.
 */
export const ensureEnvVarsPlugin = (
  _eleventyConfig: EleventyConfig,
  options?: Options
) => {
  debug('plugin options (provided by user) %O', options)

  const result = schema.safeParse(options)

  if (!result.success) {
    const err = fromZodError(result.error)
    throw new Error(`${ERR_PREFIX} ${err.toString()}`)
  }

  debug('plugin config (provided by user + defaults) %O', result.data)

  const obj = result.data.envVars.reduce((acc, cv) => {
    return { ...acc, [cv]: env_var }
  }, {})

  // inspired by: https://www.jacobparis.com/content/type-safe-env
  const zodEnv = z.object(obj)

  // safeParse() reports ALL issue, while parse() throws at the first issue
  const res = zodEnv.safeParse(process.env)

  let missing_env_vars: string[] = []
  if (!res.success) {
    missing_env_vars = res.error.issues.map((issue) => `${issue.path[0]}`)
  }

  result.data.envVars.forEach((k) => {
    // If a user sets export FOO=undefined in an .envrc file, process.env.FOO
    // will be 'undefined' (a string).
    if (process.env[k] === undefined || process.env[k] === 'undefined') {
      missing_env_vars.push(k)
    }
  })

  if (missing_env_vars.length > 0) {
    const message = `${ERR_PREFIX}: the following required environment variables are set in this environment: ${missing_env_vars.join(', ')}`
    throw new Error(message)
  }

  debug('attached `eleventy.before` event handler')
}
