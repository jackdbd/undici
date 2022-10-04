/**
 * Entry point for the documentation of eleventy-plugin-ensure-env-vars.
 *
 * @packageDocumentation
 */
import makeDebug from 'debug'
import { ensureEnvVars as fn } from './lib.js'
import { pluginOptions as optionsSchema } from './schemas.js'
import type { Options } from './schemas.js'
import type { EleventyConfig } from '@panoply/11ty'

const NAMESPACE = `eleventy-plugin-ensure-env-vars`

const debug = makeDebug(NAMESPACE)

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
    throw new Error(`[${NAMESPACE}] ${error.message}`)
  }

  const config = {} as Required<Options>
  Object.assign(config, value)

  eleventyConfig.on('eleventy.before', () => {
    const errors = fn(config.envVars)
    if (errors.length > 0) {
      throw new Error(`[${NAMESPACE}] ${errors.join('; ')}`)
    }
  })
  debug('attached `eleventy.before` event handler')
}
