import defDebug from 'debug'
import { z } from 'zod'
import { DEBUG_PREFIX } from './constants.js'
import { validationError } from './errors.js'

const debug = defDebug(`${DEBUG_PREFIX}:validation`)

export const validatedResult = <T>(data: T, schema: z.ZodType<T>) => {
  if (process.env.SKIP_VALIDATION) {
    debug(
      `skipped validation (schema: %s)`,
      schema.description || 'description not set'
    )
    return { error: undefined, value: data as T }
  } else {
    const result = schema.safeParse(data)
    if (!result.success) {
      return { error: validationError(result.error), value: undefined }
    }
    return { error: undefined, value: result.data }
  }
}
