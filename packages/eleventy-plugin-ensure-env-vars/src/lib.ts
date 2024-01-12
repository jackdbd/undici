import makeDebug from 'debug'
import { DEBUG_PREFIX } from './constants.js'

const debug = makeDebug(`${DEBUG_PREFIX}:lib`)

export const ensureEnvVars = (envVars: string[]) => {
  debug(`checking the presence of ${envVars.length} environment variables`)
  const errors: Error[] = []
  envVars.forEach((k) => {
    if (process.env[k] === undefined) {
      debug(`environment variable ${k} not set`)
      errors.push(new Error(`environment variable ${k} not set`))
    }
  })
  return errors
}
