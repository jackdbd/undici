import fs from 'node:fs'
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
  filepath: string
  headerKey: string
  headerValue: string
  sources: string[]
}

type Release = () => Promise<void>

export const defOnAcquiredLock = ({
  filepath,
  headerKey,
  headerValue,
  sources
}: Config) => {
  const sourcesToProcess = new Set(sources)

  const onAcquiredLock = async (release: Release) => {
    debug(`🔒 acquired lock on ${filepath}. Will attach ${headerKey}`)

    const str = fs.readFileSync(filepath, { encoding: 'utf8' })
    const obj_in = JSON.parse(str) as VercelJSON
    const obj_out = { ...obj_in, headers: [] } as VercelJSON

    if (obj_in.headers) {
      obj_in.headers.forEach((ho) => {
        debug(`URL pattern: ${ho.source}`)
        const i_source = sources.findIndex((source) => source === ho.source)
        if (i_source === -1) {
          debug(`  unalter: ${ho.headers.map((h) => h.key).join(', ')}`)
          obj_out.headers.push({ ...ho })
        } else {
          sourcesToProcess.delete(ho.source)
          const unaltered = ho.headers.filter((h) => h.key !== headerKey)
          debug(`  unalter: ${unaltered.map((h) => h.key).join(', ')}`)
          debug(`  attach: ${headerKey}`)
          obj_out.headers.push({
            ...ho,
            headers: [...unaltered, { key: headerKey, value: headerValue }]
          })
        }
      })

      for (const source of sourcesToProcess) {
        debug(`URL pattern: ${source}`)
        debug(`  attach: ${headerKey}`)
        obj_out.headers.push({
          source,
          headers: [{ key: headerKey, value: headerValue }]
        })
      }
    } else {
      sources.forEach((source) => {
        debug(`URL pattern: ${source}`)
        debug(`  attach: ${headerKey}`)
        obj_out.headers.push({
          source,
          headers: [{ key: headerKey, value: headerValue }]
        })
      })
    }

    await writeFileAsync(filepath, JSON.stringify(obj_out, null, 2), {
      encoding: 'utf8'
    })

    debug(`🔓 release lock on ${filepath}`)
    return release()
  }

  return onAcquiredLock
}

/**
 * Updates an existing `vercel.json` file.
 *
 * @see [vercel.com - Configuring Projects with vercel.json](https://vercel.com/docs/projects/project-configuration)
 */
export const updateVercelJSON = async (config: Config) => {
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
