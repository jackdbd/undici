import fs from 'node:fs'
import path from 'node:path'
import util from 'node:util'
import defDebug from 'debug'
import { DEBUG_PREFIX } from './constants.js'
import type { VercelJSON } from './schemas.js'

const debug = defDebug(`${DEBUG_PREFIX}:vercel`)

const writeFileAsync = util.promisify(fs.writeFile)

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

  const vercelJsonFilepath = path.join(outdir, 'vercel.json')
  //   const vercelJsonOut = path.join(outdir, 'vercel.new.json')
  const vercelJsonOut = path.join(outdir, 'vercel.json')

  const sourcesToProcess = new Set(sources)

  let newObj = { headers: [] } as VercelJSON
  if (fs.existsSync(vercelJsonFilepath)) {
    const str = fs.readFileSync(vercelJsonFilepath, { encoding: 'utf8' })
    const oldObj = JSON.parse(str) as VercelJSON
    newObj = { ...oldObj, headers: [] } as VercelJSON

    if (oldObj.headers) {
      oldObj.headers.forEach((ho) => {
        const i_source = sources.findIndex((source) => source === ho.source)
        if (i_source === -1) {
          debug(
            `copy headers from source ${ho.source} without adding new ones, nor updating existing ones`
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

    await writeFileAsync(vercelJsonOut, JSON.stringify(newObj, null, 2), {
      encoding: 'utf8'
    })
  } else {
    sources.forEach((source) => {
      debug(`add header ${headerKey} for source ${source}`)
      newObj.headers.push({
        source,
        headers: [{ key: headerKey, value: headerValue }]
      })
    })

    await writeFileAsync(vercelJsonOut, JSON.stringify(newObj, null, 2), {
      encoding: 'utf8'
    })
  }
}
