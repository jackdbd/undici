import { z } from 'zod'

/**
 * @public
 */
export const REQUIRED_ENV_VARS = ['ELEVENTY_ENV', 'NODE_ENV']

/**
 * @public
 */
export const DEFAULT_ENV_VARS = ['DEBUG', 'ELEVENTY_ENV', 'NODE_ENV']

/**
 * Object available in `eleventy.before` and `eleventy.after` event handlers.
 *
 * @public
 * @see [Event Arguments](https://www.11ty.dev/docs/events/#event-arguments)
 */
export interface EventArguments {
  inputDir: string
  dir: { input: string; includes: string; data: string; output: string }
  runMode: 'build' | 'watch' | 'serve'
  outputMode: 'fs' | 'json' | 'ndjson'
  incremental: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results?: any
}

// TODO: what is the maximum length of an environment variable NAME?
// https://devblogs.microsoft.com/oldnewthing/20100203-00/?p=15083
// https://stackoverflow.com/questions/1078031/what-is-the-maximum-size-of-a-linux-environment-variable-value

/**
 * @public
 */
export const envVar = z.string().min(1)

/**
 * @public
 */
export const envVars = z
  .array(envVar)
  .min(1)
  .refine((arr) => {
    return REQUIRED_ENV_VARS.every((required) => arr.includes(required))
  })
  .describe(
    'The environment variables you want to ensure are set when building your Eleventy site'
  )

/**
 * @public
 */
export const options = z
  .optional(
    z.object({
      envVars: z.optional(envVars).default(DEFAULT_ENV_VARS)
    })
  )
  .default({
    envVars: DEFAULT_ENV_VARS
  })

/**
 * @public
 */
export type Options = z.infer<typeof options>
