import fs from 'node:fs'
import path from 'node:path'
import util from 'node:util'
import defDebug from 'debug'
import { parseAllHeaders } from 'netlify-headers-parser'
import { DEBUG_PREFIX, ERR_PREFIX } from './constants.js'

const debug = defDebug(`${DEBUG_PREFIX}:cloudflare-pages`)

const writeFileAsync = util.promisify(fs.writeFile)

interface Config {
  headerKey: string
  headerValue: string
  globPatterns: string[]
  globPatternsDetach: string[]
  outdir: string
}

/**
 * Creates or updates a plain text `_headers` file.
 *
 * @see [developers.cloudflare.com - Cloudflare Pages Headers](https://developers.cloudflare.com/pages/configuration/headers/)
 */
export const createOrUpdateHeaders = async (config: Config) => {
  const { outdir, globPatterns, globPatternsDetach, headerKey, headerValue } =
    config

  const headersFilepath = path.join(outdir, '_headers')
  //   const headersOut = path.join(outdir, '_headers.new')
  const headersOut = path.join(outdir, '_headers')

  const rules: string[] = []
  const patternsToProcess = new Set(globPatterns)

  if (fs.existsSync(headersFilepath)) {
    debug(`parse existing file ${headersFilepath}`)
    const { headers: headerObjects, errors } = await parseAllHeaders({
      headersFiles: [headersFilepath]
    } as any)

    if (errors.length > 0) {
      const message = errors.map((err) => err.message).join('; ')
      throw new Error(`${ERR_PREFIX}: ${message}`)
    }

    headerObjects.forEach((ho) => {
      const i_pattern = globPatterns.findIndex((pattern) => pattern === ho.for)
      let headers: string[] = []
      if (i_pattern === -1) {
        debug(
          `copy headers from pattern ${ho.for} without adding new ones, nor updating existing ones`
        )
        headers = Object.entries(ho.values).map(([k, v]) => `${k}: ${v}`)
      } else {
        debug(`update headers for pattern ${ho.for}`)
        patternsToProcess.delete(ho.for)
        Object.entries(ho.values).forEach(([k, v]) => {
          if (k === headerKey) {
            debug(`update header ${k} in pattern ${ho.for}`)
            headers.push(`${k}: ${headerValue}`)
          } else {
            debug(`copy header ${k} in pattern ${ho.for}`)
            headers.push(`${k}: ${v}`)
          }
        })
      }
      rules.push(`${ho.for}\n  ${headers.join('\n  ')}`)
    })
  }

  for (const pattern of patternsToProcess) {
    debug(`add header for pattern ${pattern}`)
    rules.push(`${pattern}\n  ${headerKey}: ${headerValue}`)
  }

  for (const pattern of globPatternsDetach) {
    debug(`detach header for pattern ${pattern}`)
    rules.push(`${pattern}\n  ! ${headerKey}`)
  }

  await writeFileAsync(headersOut, rules.join('\n\n'), { encoding: 'utf8' })
}
