import fs from 'node:fs'
import path from 'node:path'
import writeFileAtomic from 'write-file-atomic'
import defDebug from 'debug'
import { DEBUG_PREFIX, ERR_PREFIX } from './constants.js'
import type { VercelJSON } from './schemas.js'

const debug = defDebug(`${DEBUG_PREFIX}:vercel`)

interface Config {
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
    debug(`${headerKey} is empty, so this plugin has nothing to do`)
    return
  }

  const vercelJsonFilepathIn = path.join(outdir, 'vercel.json')
  const vercelJsonFilepathOut = path.join(outdir, 'vercel.json')

  const sourcesToProcess = new Set(sources)

  let newObj = { headers: [] } as VercelJSON
  if (fs.existsSync(vercelJsonFilepathIn)) {
    const str = fs.readFileSync(vercelJsonFilepathIn, { encoding: 'utf8' })
    const oldObj = JSON.parse(str) as VercelJSON
    newObj = { ...oldObj, headers: [] } as VercelJSON

    if (oldObj.headers) {
      oldObj.headers.forEach((ho) => {
        const i_source = sources.findIndex((source) => source === ho.source)
        if (i_source === -1) {
          debug(
            `copy headers for source ${ho.source} without adding new ones, nor updating existing ones`
          )
          newObj.headers.push({ ...ho })
        } else {
          sourcesToProcess.delete(ho.source)
          newObj.headers.push({
            ...ho,
            headers: [...ho.headers, { key: headerKey, value: headerValue }]
          })
        }
      })

      for (const source of sourcesToProcess) {
        newObj.headers.push({
          source,
          headers: [{ key: headerKey, value: headerValue }]
        })
      }
    } else {
      sources.forEach((source) => {
        debug(`add header ${headerKey} for source ${source}`)
        newObj.headers.push({
          source,
          headers: [{ key: headerKey, value: headerValue }]
        })
      })
    }

    writeFileAtomic(
      vercelJsonFilepathOut,
      JSON.stringify(newObj, null, 2),
      {
        encoding: 'utf8'
      },
      (err) => {
        if (err) {
          throw new Error(`${ERR_PREFIX}: ${err.message}`)
        }
      }
    )
  } else {
    sources.forEach((source) => {
      debug(`add header ${headerKey} for source ${source}`)
      newObj.headers.push({
        source,
        headers: [{ key: headerKey, value: headerValue }]
      })
    })

    writeFileAtomic(
      vercelJsonFilepathOut,
      JSON.stringify(newObj, null, 2),
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
}
