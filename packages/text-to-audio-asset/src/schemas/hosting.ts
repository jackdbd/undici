import { z } from 'zod'
import { href } from './common.js'

/**
 * @internal
 */
export const write_result_success = z.object({
  error: z.undefined().optional(),
  value: z.object({
    href: href,
    message: z.string().min(1)
  })
})

/**
 * @internal
 */
export const write_result_failure = z.object({
  error: z.instanceof(Error),
  value: z.undefined().optional()
})

/**
 * @internal
 */
export const write_result = z.union([
  write_result_failure,
  write_result_success
])

/**
 * Write result.
 *
 * @public
 */
export type WriteResult = z.infer<typeof write_result>

/**
 * @internal
 */
export const write_func = z.function().returns(z.promise(write_result))

/**
 * Write function.
 *
 * @public
 */
export type Write = z.infer<typeof write_func>

export const hosting = z.object({
  config: z.object({}).passthrough(),
  write: write_func
})

export type Hosting = z.input<typeof hosting>

export const hosting_client = z.function().returns(hosting)
