import fs from 'node:fs'
import defDebug from 'debug'
import lockfile from 'proper-lockfile'
import { DEBUG_PREFIX, ERR_PREFIX } from './constants.js'
import { defOnAcquiredLock, type Config } from './vercel.js'

const debug = defDebug(`${DEBUG_PREFIX}:serve`)

/**
 * Updates an existing `serve.json` file.
 *
 * @see [serve](https://github.com/vercel/serve)
 * @see [serve-handler options](https://github.com/vercel/serve-handler#options)
 */
export const updateServeJSON = async (config: Config) => {
  const { filepath, headerKey, headerValue, sources } = config

  if (!fs.existsSync(filepath)) {
    return { error: new Error(`${ERR_PREFIX}: ${filepath} does not exist`) }
  }

  if (!headerValue) {
    return {
      error: new Error(
        `${ERR_PREFIX}: the value of ${headerKey} is an empty string`
      )
    }
  }

  const onAcquiredLock = defOnAcquiredLock({
    filepath,
    headerKey,
    headerValue,
    sources
  })

  // Multiple callers might try to open the same file in writing mode. To avoid
  // a race condition, we use file locking.
  // If we set retries to 0 and try to acquire a lock on the same file more than
  // once, only the first attempt will succeed. Subsequent attempts will fail.
  const lock_options = { retries: 5 }
  debug(`trying to acquire lock on ${filepath} %O`, lock_options)
  try {
    const release = await lockfile.lock(filepath, lock_options)
    await onAcquiredLock(release)
    return { value: `updated ${filepath} with ${headerKey}` }
  } catch (err) {
    return { error: err as Error }
  }
}
