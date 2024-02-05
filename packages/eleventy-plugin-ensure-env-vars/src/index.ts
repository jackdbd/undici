/**
 * Entry point for the documentation of eleventy-plugin-ensure-env-vars.
 *
 * @packageDocumentation
 */
import defDebug from 'debug'
import { fromZodError } from 'zod-validation-error'
import type { EleventyConfig, EventArguments } from '@11ty/eleventy'
import { ERROR_MESSAGE_PREFIX, ERR_PREFIX } from './constants.js'
import { options as schema } from './schemas.js'
import type { Options } from './schemas.js'

// exports for TypeDoc
export type { EleventyConfig } from '@11ty/eleventy'
export { env_var } from './schemas.js'
export type { Options } from './schemas.js'

const debug = defDebug(`11ty-plugin:ensure-env-vars`)

/**
 * Plugin that checks whether the environment variables you specified are set
 * when Eleventy builds your site.
 *
 * @public
 * @param eleventyConfig - {@link EleventyConfig | Eleventy configuration}.
 * @param options - Plugin {@link Options | options}.
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
