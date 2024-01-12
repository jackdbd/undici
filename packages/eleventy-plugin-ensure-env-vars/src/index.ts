/**
 * Entry point for the documentation of eleventy-plugin-ensure-env-vars.
 *
 * @packageDocumentation
 */
import makeDebug from 'debug'
import { fromZodError } from 'zod-validation-error'
import { ERROR_MESSAGE_PREFIX, ERR_PREFIX } from './constants.js'
import { options as schema } from './schemas.js'
import type { Options, EventArguments } from './schemas.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EleventyConfig = any

const debug = makeDebug(`11ty-plugin:ensure-env-vars`)

/**
 * @public
 */
export const ensureEnvVarsPlugin = (
  eleventyConfig: EleventyConfig,
  options?: Options
) => {
  debug('plugin options (provided by user) %O', options)

  const result = schema.safeParse(options)

  if (!result.success) {
    const err = fromZodError(result.error)
    throw new Error(`${ERR_PREFIX} ${err.toString()}`)
  }

  debug('plugin config (provided by user + defaults) %O', result.data)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const throwIfAnyEnvVarIsMissing = (_args: EventArguments) => {
    result.data.envVars.forEach((k) => {
      if (process.env[k] === undefined) {
        throw new Error(
          `${ERROR_MESSAGE_PREFIX.invalidEnvironment}: environment variable ${k} not set`
        )
      }
    })
    debug(`validated execution environment`)
  }

  eleventyConfig.on('eleventy.before', throwIfAnyEnvVarIsMissing)
  debug('attached `eleventy.before` event handler')
}
