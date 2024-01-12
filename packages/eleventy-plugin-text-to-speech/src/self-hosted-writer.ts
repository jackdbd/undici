import fs from 'node:fs'
import path from 'node:path'
import util from 'node:util'
import makeDebug from 'debug'
import { DEBUG_PREFIX } from './constants.js'
import type { AssetConfig, SelfHostConfig, WriteResult } from './schemas.js'

const debug = makeDebug(`${DEBUG_PREFIX}:self-hosted-writer`)

const writeFile = util.promisify(fs.writeFile)

/**
 * Self-hosts an audio asset.
 *
 * @param param0
 * @returns
 */
export const selfHostedHref = async ({
  assetName,
  buffer,
  hrefBase,
  outputBase
}: SelfHostConfig): Promise<WriteResult> => {
  const filepath = path.join(outputBase, assetName)

  try {
    debug(`try writing ${filepath}`)
    await writeFile(filepath, buffer, { encoding: 'utf8' })
  } catch (err) {
    const error = err as Error
    debug(`could not write ${filepath}: ${error.message}`)
    return { error }
  }

  const href = `${hrefBase}/${assetName}`
  const message = `${assetName} hosted at ${href} (filepath: ${filepath})`
  debug(message)
  return { value: { filepath, href, message } }
}

export interface SelfHostWriter {
  hrefBase: string
  outputBase: string
}

export const selfHostWriter = ({ hrefBase, outputBase }: SelfHostWriter) => {
  return {
    write: async (config: AssetConfig) => {
      return await selfHostedHref({ ...config, hrefBase, outputBase })
    }
  }
}
