import { Readable } from 'node:stream'
import makeDebug from 'debug'
import { z } from 'zod'
import { Storage } from '@google-cloud/storage'
import { gcp } from '@jackdbd/zod-schemas'
import { asset_name } from '../schemas/common.js'
import { DEBUG_PREFIX } from '../constants.js'
import type { WriteResult } from './schemas.js'
import { validatedDataOrThrow, validatedResult } from '../validation.js'

const debug = makeDebug(`${DEBUG_PREFIX}:cloud-storage`)

export const bucket_config = z.object({
  /**
   * Name of the Google Cloud Storage bucket to upload the audio file to.
   */
  bucketName: gcp.cloud_storage_bucket_name
})

export type BucketConfig = z.input<typeof bucket_config>

export const write_config = z
  .object({
    /**
     * Name of the audio asset to be uploaded to Cloud Storage.
     */
    assetName: asset_name,

    /**
     * Readable stream containing the audio data to be uploaded to Cloud Storage.
     */
    readable: z.instanceof(Readable)
  })
  .describe('Cloud Storage write config')

export type WriteConfig = z.input<typeof write_config>

export const write = (
  storage: Storage,
  cfg: BucketConfig,
  config: WriteConfig
) => {
  const { bucketName } = cfg

  const result = validatedResult(config, write_config)
  if (result.error) {
    return { error: result.error }
  }

  const { assetName, readable } = result.value
  debug(`upload ${assetName} to Cloud Storage bucket ${bucketName}`)

  const bucket = storage.bucket(bucketName)
  const file = bucket.file(assetName)
  const href = file.publicUrl()
  const uri = file.cloudStorageURI

  // https://googleapis.dev/nodejs/storage/latest/global.html#UploadOptions
  // https://cloud.google.com/storage/docs/json_api/v1/objects/insert#request_properties_JSON

  // const contentType = 'audio/mpeg'

  // TODO: accept more options to customize metadata, timeout, etc
  const writable = file.createWriteStream({
    // contentType,
    // gzip: true,
    timeout: 10000, // in ms
    // https://cloud.google.com/storage/docs/hashes-etags#validation
    // validation: true,
    // Some metadata fields are editable, some others are not.
    // https://cloud.google.com/storage/docs/metadata#editable
    metadata: {
      // TODO: double check that setting cache-control takes precedence over the
      // caching policy enforced by the bucket storage class.
      // 31536000 seconds = 1 year
      cacheControl: 'public, max-age=31536000'
      // contentType
      // contentLanguage: 'en-US'
    }
  })

  readable.pipe(writable)

  return new Promise<WriteResult>((resolve) => {
    writable.on('error', (error) => {
      debug(`writable stream errored`)
      // should I destroy the readable stream manually?
      // readable.destroy()
      resolve({ error })
    })

    writable.on('finish', () => {
      debug(`writable stream finished, no more data to flush to ${uri}`)
      const message = `asset uploaded to ${uri} and publicly accessible at ${href}`
      resolve({ value: { message, href } })
    })

    writable.on('close', () => {
      debug(`writable stream closed, all underlying resources freed`)
    })
  })
}

export const auth_options = z.object({
  credentials: gcp.client_credentials.optional(),
  keyFilename: gcp.service_account_json_key_filepath.optional()
})

export type AuthOptions = z.input<typeof auth_options>

export const client_config = auth_options.merge(bucket_config)

export type ClientConfig = z.input<typeof client_config>

/**
 * Client for Google Cloud Storage.
 */
export const defClient = (config: ClientConfig) => {
  const data = validatedDataOrThrow(config, client_config)

  const { credentials, keyFilename, bucketName } = data
  debug(`audio assets will be written to ${bucketName}`)

  const storage = new Storage({ credentials, keyFilename })

  const writeWithStorageAndBucketConfig = write.bind(null, storage, {
    bucketName
  })

  return {
    config: { bucketName },
    write: writeWithStorageAndBucketConfig
  }
}
