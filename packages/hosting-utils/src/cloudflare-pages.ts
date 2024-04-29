import fs from 'node:fs'
import util from 'node:util'
import defDebug from 'debug'
import lockfile from 'proper-lockfile'
import { parseAllHeaders } from 'netlify-headers-parser'
import { DEBUG_PREFIX, ERR_PREFIX } from './constants.js'

const writeFileAsync = util.promisify(fs.writeFile)

const debug = defDebug(`${DEBUG_PREFIX}:cloudflare-pages`)

export interface Config {
  filepath: string
  headerKey: string
  headerValue: string
  sources: string[]
}

export interface RuleMap {
  [url_pattern: string]: string[]
}

/**
 * Updates an existing `_headers` file.
 *
 * @see [developers.cloudflare.com - Cloudflare Pages Headers](https://developers.cloudflare.com/pages/configuration/headers/)
 */
export const updateHeaders = async (config: Config) => {
  const { filepath, headerKey, headerValue, sources } = config

  if (!fs.existsSync(filepath)) {
    // throw new Error(`${ERR_PREFIX}: ${filepath} does not exist`)
    return { error: new Error(`${ERR_PREFIX}: ${filepath} does not exist`) }
  }

  if (!headerValue) {
    // throw new Error(
    //   `${ERR_PREFIX}: the value of ${headerKey} is an empty string`
    // )
    return {
      error: new Error(
        `${ERR_PREFIX}: the value of ${headerKey} is an empty string`
      )
    }
  }

  const rule_map: RuleMap = {}
  const patternsToProcess = new Set(sources)

  // Multiple callers might try to open the same file in writing mode. To avoid
  // a race condition, we use file locking.
  // If we set retries to 0 and try to acquire a lock on the same file more than
  // once, only the first attempt will succeed. Subsequent attempts will fail.
  const lock_options = { retries: 5 }
  debug(`trying to acquire lock on ${filepath} %O`, lock_options)

  try {
    const release = await lockfile.lock(filepath, lock_options)
    debug(`🔒 acquired lock on ${filepath}. Will attach ${headerKey}`)

    // https://github.com/netlify/build/tree/main/packages/headers-parser
    const { headers: headerObjects, errors } = await parseAllHeaders({
      headersFiles: [filepath]
    } as any)

    if (errors.length > 0) {
      const message = errors.map((err) => err.message).join('; ')
      return { error: new Error(`${ERR_PREFIX}: ${message}`) }
    }

    debug(`found ${headerObjects.length} header rules in ${filepath}`)
    headerObjects.forEach((ho) => {
      debug(`URL pattern: ${ho.for}`)
      const headers: string[] = []
      const i_pattern = sources.findIndex((pattern) => pattern === ho.for)
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

    const rules: string[] = []
    Object.entries(rule_map).forEach(([pattern, headers]) => {
      rules.push(`${pattern}\n  ${headers.join('\n  ')}`)
    })

    await writeFileAsync(filepath, rules.join('\n\n'), 'utf8')

    debug(`🔓 release lock on ${filepath}`)
    await release()
    return { value: `updated ${filepath} with ${headerKey}` }
  } catch (err) {
    return { error: err as Error }
  }
}
