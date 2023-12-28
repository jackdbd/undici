/**
 * Entry point for the documentation of eleventy-plugin-ensure-env-vars.
 *
 * @packageDocumentation
 */
import makeDebug from 'debug'
// import type { EleventyConfig } from '@11ty/eleventy'
import { DEBUG_PREFIX, ERROR_MESSAGE_PREFIX } from './constants.js'
import { ensureEnvVars as fn } from './lib.js'
import { pluginOptions as optionsSchema } from './schemas.js'
import type { Options } from './schemas.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EleventyConfig = any

const debug = makeDebug(`${DEBUG_PREFIX}`)

/**
 * @public
 */
export const ensureEnvVarsPlugin = (
  eleventyConfig: EleventyConfig,
  options?: Options
) => {
  debug(`options %O`, options)

  const { error, value } = optionsSchema.validate(options, {
    allowUnknown: true,
    stripUnknown: true
  })

  if (error) {
    throw new Error(
      `${ERROR_MESSAGE_PREFIX.invalidConfiguration}: ${error.message}`
    )
  }

  const config = {} as Required<Options>
  Object.assign(config, value)

  eleventyConfig.on('eleventy.before', () => {
    const errors = fn(config.envVars)
    if (errors.length > 0) {
      throw new Error(
        `${ERROR_MESSAGE_PREFIX.invalidEnvironment}: ${errors.join('; ')}`
      )
    }
  })
  debug('attached `eleventy.before` event handler')
}
