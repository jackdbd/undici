import defDebug from 'debug'
import type { ZodError } from 'zod'
// import { fromZodError } from 'zod-validation-error'
import { DEBUG_PREFIX } from './constants.js'

const debug = defDebug(DEBUG_PREFIX)

export const validationError = (err: ZodError) => {
  debug('zod error issues %O', err.issues)
  const issues = err.issues.map(
    (issue) => `${issue.message} at ${issue.path.join('/')}`
  )
  return new Error(issues.join('; '))
  // it seems zod-validation-error and zod disagree on the ZodError type
  // return new Error(fromZodError(err as any).toString())
}
