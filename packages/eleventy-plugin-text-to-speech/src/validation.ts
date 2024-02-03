import makeDebug from 'debug'
import { z } from 'zod'
import { validationError } from './errors.js'
import { DEBUG_PREFIX, ERR_PREFIX } from './constants.js'

const debug = makeDebug(`${DEBUG_PREFIX}:validation`)

export const validatedResult = <T>(data: T, schema: z.ZodType<T>) => {
  if (process.env.SKIP_VALIDATION) {
    debug(`skipped validation (schema: %s)`, schema.description || 'not set')
    return { error: undefined, value: data as T }
  } else {
    const result = schema.safeParse(data)
    if (!result.success) {
      return { error: validationError(result.error), value: undefined }
    }
    return { error: undefined, value: result.data }
  }
}

export const validatedDataOrThrow = <T>(data: T, schema: z.ZodType<T>) => {
  if (process.env.SKIP_VALIDATION) {
    debug(`skipped validation (schema: %s)`, schema.description || 'not set')
    return data as T
  } else {
    const result = schema.safeParse(data)
    if (!result.success) {
      const err = validationError(result.error)
      console.error(`${ERR_PREFIX} ${err.message}`)
      throw err
    }
    return result.data
  }
}
