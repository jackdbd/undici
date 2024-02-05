import defDebug from 'debug'
import type { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { DEBUG_PREFIX, ERR_PREFIX } from './constants.js'

const debug = defDebug(`${DEBUG_PREFIX}:errors`)

export const importError = (err: Error) => {
  const ERR_SUFFIX = `The requested package was imported dynamically because this plugin declares it as a peer dependency. Don't forget to declare the requested package as a direct dependency of your project.`
  return new Error(`${ERR_PREFIX} ${err.toString()} ${ERR_SUFFIX}`)
}

export const validationError = (err: ZodError) => {
  // err.addIssue({
  //   message: 'custom issue added by me',
  //   code: 'custom',
  //   path: ['somewhere', 'there']
  // })
  debug('zod error issues %O', err.issues)
  return new Error(fromZodError(err).toString())
}
