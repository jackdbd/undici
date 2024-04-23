import fs from 'node:fs'
import path from 'node:path'
import util from 'node:util'
import defDebug from 'debug'
import lockfile from 'proper-lockfile'
import { DEBUG_PREFIX, ERR_PREFIX } from './constants.js'

const writeFileAsync = util.promisify(fs.writeFile)

const debug = defDebug(`${DEBUG_PREFIX}:vercel`)

export type VercelJSONHeadersEntry = { key: string; value: string }

// https://vercel.com/docs/projects/project-configuration#header-object-definition
export type VercelJSONHeaderObject = {
  source: string
  headers: VercelJSONHeadersEntry[]
  has?: any[]
  missing?: any[]
}

export type VercelJSON = {
  headers: VercelJSONHeaderObject[]
}

export interface Config {
  headerKey: string
  headerValue: string
  outdir: string
  sources: string[]
}

/**
 * Creates or updates a `vercel.json` file.
 *
 * @see [vercel.com - Configuring Projects with vercel.json](https://vercel.com/docs/projects/project-configuration)
 */
export const createOrUpdateVercelJSON = async (config: Config) => {
  const { outdir, headerKey, headerValue, sources } = config

  if (!headerValue) {
    debug(`${headerKey} is empty, so nothing to do`)
    return
  }

  const vercelJsonFilepath = path.join(outdir, 'vercel.json')

  const sourcesToProcess = new Set(sources)

  if (!fs.existsSync(vercelJsonFilepath)) {
    debug(`create empty vercel.json file at ${vercelJsonFilepath}`)
    fs.writeFileSync(vercelJsonFilepath, '{}', { encoding: 'utf8' })
  } else {
    debug(`found existing vercel.json file at ${vercelJsonFilepath}`)
  }

  // Multiple callers might try to open the same file in writing mode. To avoid
  // a race condition, we use file locking.
  // If we set retries to 0 and try to acquire a lock on the same file more than
  // once, only the first attempt will succeed. Subsequent attempts will fail.
  const lock_options = { retries: 5 }
  debug(`trying to acquire lock on ${vercelJsonFilepath} %O`, lock_options)

  lockfile
    .lock(vercelJsonFilepath, lock_options)
    .then(async (release) => {
      debug(
        `🔒 acquired lock on ${vercelJsonFilepath} for attaching/detaching ${headerKey}`
      )

      const str = fs.readFileSync(vercelJsonFilepath, { encoding: 'utf8' })
      const vercelJsonIn = JSON.parse(str) as VercelJSON
      let vercelJsonOut = { headers: [] } as VercelJSON
      vercelJsonOut = { ...vercelJsonIn, headers: [] } as VercelJSON

      if (vercelJsonIn.headers) {
        vercelJsonIn.headers.forEach((ho) => {
          debug(`URL pattern: ${ho.source}`)
          const i_source = sources.findIndex((source) => source === ho.source)
          if (i_source === -1) {
            debug(`  unalter: ${ho.headers.map((h) => h.key).join(', ')}`)
            vercelJsonOut.headers.push({ ...ho })
          } else {
            sourcesToProcess.delete(ho.source)
            const unaltered = ho.headers.filter((h) => h.key !== headerKey)
            debug(`  unalter: ${unaltered.map((h) => h.key).join(', ')}`)
            debug(`  attach: ${headerKey}`)
            vercelJsonOut.headers.push({
              ...ho,
              headers: [...unaltered, { key: headerKey, value: headerValue }]
            })
          }
        })

        for (const source of sourcesToProcess) {
          debug(`URL pattern: ${source}`)
          debug(`  attach: ${headerKey}`)
          vercelJsonOut.headers.push({
            source,
            headers: [{ key: headerKey, value: headerValue }]
          })
        }
      } else {
        sources.forEach((source) => {
          debug(`URL pattern: ${source}`)
          debug(`  attach: ${headerKey}`)
          vercelJsonOut.headers.push({
            source,
            headers: [{ key: headerKey, value: headerValue }]
          })
        })
      }

      await writeFileAsync(
        vercelJsonFilepath,
        JSON.stringify(vercelJsonOut, null, 2),
        {
          encoding: 'utf8'
        }
      )

      debug(
        `🔓 release lock on ${vercelJsonFilepath} for attaching/detaching ${headerKey}`
      )
      return release()
    })
    .catch((err) => {
      // either lock could not be acquired, or releasing it failed
      console.error(err)
      throw new Error(`${ERR_PREFIX}: ${err.message}`)
    })
}
