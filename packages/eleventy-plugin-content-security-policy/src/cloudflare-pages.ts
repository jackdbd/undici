import fs from 'node:fs'
import path from 'node:path'
import defDebug from 'debug'
import writeFileAtomic from 'write-file-atomic'
import { parseAllHeaders } from 'netlify-headers-parser'
import { DEBUG_PREFIX, ERR_PREFIX } from './constants.js'

const debug = defDebug(`${DEBUG_PREFIX}:cloudflare-pages`)

interface Config {
  headerKey: string
  headerValue: string
  globPatterns: string[]
  globPatternsDetach: string[]
  outdir: string
}

interface RuleMap {
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
    debug(`${headerKey} is empty, so this plugin has nothing to do`)
    return
  }

  const headersFilepathIn = path.join(outdir, '_headers')
  const headersFilepathOut = path.join(outdir, '_headers')

  const rule_map: RuleMap = {}
  const patternsToProcess = new Set(globPatterns)

  if (fs.existsSync(headersFilepathIn)) {
    debug(`_headers file found at ${headersFilepathIn}. Parsing it now`)
    // https://github.com/netlify/build/tree/main/packages/headers-parser
    const { headers: headerObjects, errors } = await parseAllHeaders({
      headersFiles: [headersFilepathIn]
    } as any)

    if (errors.length > 0) {
      const message = errors.map((err) => err.message).join('; ')
      throw new Error(`${ERR_PREFIX}: ${message}`)
    }

    headerObjects.forEach((ho) => {
      const headers: string[] = []
      const i_pattern = globPatterns.findIndex((pattern) => pattern === ho.for)
      if (i_pattern === -1) {
        debug(
          `copy headers for pattern ${ho.for} without adding new ones, nor updating existing ones`
        )
        Object.entries(ho.values).forEach(([k, v]) => {
          headers.push(`${k}: ${v}`)
        })
      } else {
        debug(`update headers for pattern ${ho.for}`)
        Object.entries(ho.values).forEach(([k, v]) => {
          if (k === headerKey) {
            debug(`update header ${k} in pattern ${ho.for}`)
            headers.push(`${k}: ${headerValue}`)
            patternsToProcess.delete(ho.for)
          } else {
            debug(`copy header ${k} in pattern ${ho.for}`)
            headers.push(`${k}: ${v}`)
          }
        })
      }
      rule_map[ho.for] = headers
    })
  } else {
    debug(`_headers file not found. Creating it now at ${headersFilepathOut}`)
  }

  for (const pattern of patternsToProcess) {
    debug(`add header ${headerKey} for pattern ${pattern}`)
    if (rule_map[pattern]) {
      rule_map[pattern].push(`${headerKey}: ${headerValue}`)
    } else {
      rule_map[pattern] = [`${headerKey}: ${headerValue}`]
    }
  }

  for (const pattern of globPatternsDetach) {
    debug(`detach header ${headerKey} for pattern ${pattern}`)
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

  debug(`header rules %O`, rule_map)

  writeFileAtomic(
    headersFilepathOut,
    rules.join('\n\n'),
    {
      encoding: 'utf8'
    },
    (err) => {
      if (err) {
        throw new Error(`${ERR_PREFIX}: ${err.message}`)
      }
    }
  )
}
