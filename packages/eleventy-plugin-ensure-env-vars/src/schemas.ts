import { z } from 'zod'
import { DEFAULT_ENV_VARS, REQUIRED_ENV_VARS } from './constants.js'

/**
 * Schema for an environment variable name.
 *
 * @public
 *
 * @remarks
 * What is the maximum length of an environment variable NAME?
 *
 * @see [What is the maximum length of an environment variable?](https://devblogs.microsoft.com/oldnewthing/20100203-00/?p=15083)
 * @see [What is the maximum size of a Linux environment variable value?](https://stackoverflow.com/questions/1078031/what-is-the-maximum-size-of-a-linux-environment-variable-value)
 */
export const env_var = z.string().min(1)

export const env_vars = z
  .array(env_var)
  .min(1)
  .refine((arr) => {
    return REQUIRED_ENV_VARS.every((required) => arr.includes(required))
  })
  .describe(
    'Environment variables you want to be set when building your Eleventy site'
  )

export const config = z.object({
  /**
   * Environment variables you want to ensure are set when building your Eleventy site.
   */
  envVars: env_vars.default(DEFAULT_ENV_VARS)
})

/**
 * Options for this Eleventy plugin.
 *
 * @public
 */
export const options = config.default({
  envVars: DEFAULT_ENV_VARS
})

/**
 * Plugin options.
 *
 * @public
 * @interface
 */
export type Options = z.infer<typeof options>
