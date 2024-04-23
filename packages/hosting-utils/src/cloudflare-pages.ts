import fs from 'node:fs'
import path from 'node:path'
import util from 'node:util'
import defDebug from 'debug'
import lockfile from 'proper-lockfile'
import { parseAllHeaders } from 'netlify-headers-parser'
import { DEBUG_PREFIX, ERR_PREFIX } from './constants.js'

const writeFileAsync = util.promisify(fs.writeFile)

const debug = defDebug(`${DEBUG_PREFIX}:cloudflare-pages`)

export interface Config {
  headerKey: string
  headerValue: string
  globPatterns: string[]
  globPatternsDetach: string[]
  outdir: string
}

export interface RuleMap {
  [url_pattern: string]: string[]
}

/**
 * Creates or updates a plain text `_headers` file.
 *
 * @see [developers.cloudflare.com - Cloudflare Pages Headers](https://developers.cloudflare.com/pages/configuration/headers/)
 */
export const createOrUpdateHeaders = async (config: Config) => {
  const { outdir, globPatterns, globPatternsDetach, headerKey, headerValue } =
    config

  if (!headerValue) {
    debug(`${headerKey} is empty, so nothing to do`)
    return
  }

  const headersFilepathIn = path.join(outdir, '_headers')
  const headersFilepathOut = path.join(outdir, '_headers')

  const rule_map: RuleMap = {}
  const patternsToProcess = new Set(globPatterns)

  if (!fs.existsSync(headersFilepathOut)) {
    debug(`create empty _headers file at ${headersFilepathOut}`)
    fs.writeFileSync(headersFilepathOut, '', { encoding: 'utf8' })
  } else {
    debug(`found existing _headers file at ${headersFilepathOut}`)
  }

  // Multiple callers might try to open the same file in writing mode. To avoid
  // a race condition, we use file locking.
  // If we set retries to 0 and try to acquire a lock on the same file more than
  // once, only the first attempt will succeed. Subsequent attempts will fail.
  const lock_options = { retries: 5 }
  debug(`trying to acquire lock on ${headersFilepathOut} %O`, lock_options)
  lockfile
    .lock(headersFilepathIn, lock_options)
    .then(async (release) => {
      debug(
        `🔒 acquired lock on ${headersFilepathOut} for attaching/detaching ${headerKey}`
      )

      // https://github.com/netlify/build/tree/main/packages/headers-parser
      const { headers: headerObjects, errors } = await parseAllHeaders({
        headersFiles: [headersFilepathIn]
      } as any)

      if (errors.length > 0) {
        const message = errors.map((err) => err.message).join('; ')
        throw new Error(`${ERR_PREFIX}: ${message}`)
      }

      headerObjects.forEach((ho) => {
        debug(`URL pattern: ${ho.for}`)
        const headers: string[] = []
        const i_pattern = globPatterns.findIndex(
          (pattern) => pattern === ho.for
        )
        if (i_pattern === -1) {
          Object.entries(ho.values).forEach(([k, v]) => {
            debug(`  unalter: ${k}`)
            headers.push(`${k}: ${v}`)
          })
        } else {
          Object.entries(ho.values).forEach(([k, v]) => {
            if (k === headerKey) {
              debug(`  update: ${k}`)
              headers.push(`${k}: ${headerValue}`)
              patternsToProcess.delete(ho.for)
            } else {
              debug(`  unalter: ${k}`)
              headers.push(`${k}: ${v}`)
            }
          })
        }
        rule_map[ho.for] = headers
      })

      for (const pattern of patternsToProcess) {
        debug(`URL pattern: ${pattern}`)
        debug(`  attach: ${headerKey}`)
        if (rule_map[pattern]) {
          rule_map[pattern].push(`${headerKey}: ${headerValue}`)
        } else {
          rule_map[pattern] = [`${headerKey}: ${headerValue}`]
        }
      }

      for (const pattern of globPatternsDetach) {
        debug(`URL pattern: ${pattern}`)
        debug(`  detach: ${headerKey}`)
        if (rule_map[pattern]) {
          rule_map[pattern].push(`! ${headerKey}`)
        } else {
          rule_map[pattern] = [`! ${headerKey}`]
        }
      }

      const rules: string[] = []
      Object.entries(rule_map).forEach(([pattern, headers]) => {
        rules.push(`${pattern}\n  ${headers.join('\n  ')}`)
      })

      await writeFileAsync(headersFilepathOut, rules.join('\n\n'), {
        encoding: 'utf8'
      })

      debug(
        `🔓 release lock on ${headersFilepathOut} for attaching/detaching ${headerKey}`
      )
      return release()
    })
    .catch((err) => {
      // either lock could not be acquired, or releasing it failed
      console.error(err)
      throw new Error(`${ERR_PREFIX}: ${err.message}`)
    })
}
