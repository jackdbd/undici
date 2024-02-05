import defDebug from 'debug'
import type { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { DEBUG_PREFIX } from './constants.js'

const debug = defDebug(`${DEBUG_PREFIX}:errors`)

export const validationError = (err: ZodError) => {
  // err.addIssue({
  //   message: 'custom issue added by me',
  //   code: 'custom',
  //   path: ['somewhere', 'there']
  // })
  debug('zod error issues %O', err.issues)
  return new Error(fromZodError(err).toString())
}
