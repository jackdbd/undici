import { Readable } from 'node:stream'
import { z } from 'zod'
import { file_extension } from '../schemas/common.js'

/**
 * @internal
 */
export const synthesize_result_success = z.object({
  error: z.undefined().optional(),
  value: z.instanceof(Readable)
})

/**
 * @internal
 */
export const synthesize_result_failure = z.object({
  error: z.instanceof(Error),
  value: z.undefined().optional()
})

/**
 * @internal
 */
export const synthesize_result = z.union([
  synthesize_result_failure,
  synthesize_result_success
])

/**
 * Synthesize result.
 *
 * @public
 */
export type SynthesizeResult = z.infer<typeof synthesize_result>

export const text_to_synthesize = z
  .string()
  .min(1)
  .describe('Text to synthesize')

export const synthesize_func = z
  .function()
  .args(text_to_synthesize)
  .returns(z.promise(synthesize_result))

export type Synthesize = z.infer<typeof synthesize_func>

export const synthesis = z.object({
  config: z.object({}).passthrough(),
  extension: file_extension,
  synthesize: synthesize_func
})

export type Synthesis = z.input<typeof synthesis>

export const synthesis_client = z.function().returns(synthesis)
