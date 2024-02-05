import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import defDebug from 'debug'
import { z } from 'zod'
import { DEBUG_PREFIX } from '../constants.js'
import type { WriteResult } from './schemas.js'
import { asset_name } from '../schemas/common.js'
import { validatedDataOrThrow, validatedResult } from '../validation.js'

const debug = defDebug(`${DEBUG_PREFIX}:fs`)

export const client_config = z.object({
  /**
   * Base path where the audio asset will be written to the filesystem.
   *
   * @example
   * _site/assets/audio
   */
  assetBasepath: z.string().min(1),

  /**
   * Subpath/subdomain under your control where the generated audio asset will
   * be publicly accessible.
   *
   * @example
   * Subpath: /assets/audio
   *
   * @example
   * Subdomain: https://audio.example.com
   */
  hrefBase: z.string().min(1)
})

export type ClientConfig = z.input<typeof client_config>

export const write_config = z
  .object({
    /**
     * Name of the audio asset to be written to the filesystem.
     */
    assetName: asset_name,

    /**
     * Readable stream containing the audio data to be written to the filesystem.
     */
    readable: z.instanceof(Readable)
  })
  .describe('Filesystem write config')

export type WriteConfig = z.input<typeof write_config>

/**
 * @internal
 */
export const write = (cfg: ClientConfig, config: WriteConfig) => {
  const { assetBasepath, hrefBase } = cfg
  const result = validatedResult(config, write_config)
  if (result.error) {
    return { error: result.error }
  }

  const { assetName, readable } = result.value

  const filepath = path.join(assetBasepath, assetName)
  debug(`write ${filepath}`)

  // The 'w'  flag opens the file for writing, and overwrites the file if it already exists.
  // The 'wx' flag opens the file for writing, but fails if the file already exists.
  const writable = fs.createWriteStream(filepath, { flags: 'w' })

  readable.pipe(writable)

  return new Promise<WriteResult>((resolve) => {
    writable.on('error', (error) => {
      debug(`writable stream errored`)
      // should I destroy the readable stream manually?
      // readable.destroy()
      resolve({ error })
    })

    writable.on('finish', () => {
      debug(`writable stream finished, no more data to flush to ${filepath}`)
      resolve({
        value: {
          message: `asset written to ${filepath}`,
          href: `${hrefBase}/${assetName}`
        }
      })
    })

    // If `autoClose` is set to true (default behavior) on `'error'` or `'finish'`
    // the file descriptor will be closed automatically.
    writable.on('close', () => {
      debug(`writable stream closed, all underlying resources freed`)
    })
  })
}

export const defClient = (config: ClientConfig) => {
  const data = validatedDataOrThrow(config, client_config)

  const { assetBasepath, hrefBase } = data
  debug(
    `audio assets will be written to ${assetBasepath} and hosted at ${hrefBase}`
  )
  if (!fs.existsSync(assetBasepath)) {
    debug(`${assetBasepath} does not exist, creating it`)
    fs.mkdirSync(assetBasepath, { recursive: true })
    debug(`${assetBasepath} created`)
  }

  const writeWithHostingConfig = write.bind(null, { assetBasepath, hrefBase })

  return {
    config: { assetBasepath, hrefBase },
    write: writeWithHostingConfig
  }
}
