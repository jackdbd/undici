import stream from 'node:stream'
import makeDebug from 'debug'
import type { Storage } from '@google-cloud/storage'
import { DEBUG_PREFIX } from './constants.js'
import type {
  AssetConfig,
  CloudStorageHostConfig,
  WriteResult
} from './schemas.js'

const debug = makeDebug(`${DEBUG_PREFIX}:cloud-storage-writer`)

/**
 * Hosts an audio asset on Cloud Storage.
 *
 * @param param0
 * @returns
 */
export const cloudStorageHostedHref = ({
  assetName,
  buffer,
  bucketName,
  storage
}: CloudStorageHostConfig): Promise<WriteResult> => {
  const bucket = storage.bucket(bucketName)
  const file = bucket.file(assetName)
  const href = file.publicUrl()
  const uri = file.cloudStorageURI
  debug(`upload ${assetName} to Cloud Storage bucket ${bucketName}`)

  return new Promise((resolve) => {
    // a PassThrough stream is a Duplex stream
    const d = new stream.PassThrough()
    const destination = file.createWriteStream()

    d.write(buffer)
    d.pipe(destination)

    d.on('error', (error) => {
      const message = `could not host ${assetName} at ${href}: ${error.message}`
      debug(message)
      return resolve({ error })
    })

    d.on('end', () => {
      const message = `${assetName} hosted at ${href} (Cloud Storage URI: ${uri})`
      debug(message)

      const value = {
        href,
        message,
        uri
      }

      return resolve({ value })
    })

    d.end()
  })
}

export interface CloudStorageWriter {
  bucketName: string
  storage: Storage
}

export const cloudStorageWriter = ({
  bucketName,
  storage
}: CloudStorageWriter) => {
  return {
    write: async (config: AssetConfig) => {
      return await cloudStorageHostedHref({
        ...config,
        bucketName,
        // FIXME: fix typings
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        storage: storage as any
      })
    }
  }
}
