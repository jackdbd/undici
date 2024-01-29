import { Readable } from 'node:stream'
import makeDebug from 'debug'
import { z } from 'zod'
import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { account, api_token, r2 } from '@jackdbd/zod-schemas/cloudflare'
import { asset_name } from '../schemas/common.js'
import { DEBUG_PREFIX } from '../constants.js'
import { validatedDataOrThrow, validatedResult } from '../validation.js'

const debug = makeDebug(`${DEBUG_PREFIX}:cloudflare-r2`)

export const bucket_config = z.object({
  /**
   * Name of the Cloudflare R2 bucket to upload the audio file to.
   */
  bucketName: r2.bucket_name,

  /**
   * Domain under your control to make your Cloudflare R2 bucket publicly accessible.
   *
   * @see [developers.cloudflare.com - Create public buckets on R2](https://developers.cloudflare.com/r2/buckets/public-buckets/)
   */
  customDomain: r2.custom_domain
})

export type BucketConfig = z.input<typeof bucket_config>

export const write_config = z
  .object({
    /**
     * Name of the audio asset to be uploaded to Cloudflare R2.
     */
    assetName: asset_name,

    /**
     * Readable stream containing the audio data to be uploaded to Cloudflare R2.
     */
    readable: z.instanceof(Readable)
  })
  .describe('Cloudflare R2 write config')

export type WriteConfig = z.input<typeof write_config>

export const write = async (
  s3: S3Client,
  cfg: BucketConfig,
  config: WriteConfig
) => {
  const { bucketName, customDomain } = cfg

  const result = validatedResult(config, write_config)
  if (result.error) {
    return { error: result.error }
  }

  const { assetName, readable } = result.value
  debug(`upload ${assetName} to Cloudflare R2 bucket ${bucketName}`)

  const upload = new Upload({
    client: s3,
    params: { Bucket: bucketName, Key: assetName, Body: readable }
  })

  // use multipart upload instead of PutObjectCommand
  // https://github.com/aws/aws-sdk-js/issues/2961#issuecomment-868352176
  // const command = new PutObjectCommand({ Bucket: bucketName, Key: assetName })
  // const res = await s3.send(command)
  // https://github.com/aws/aws-sdk-js-v3/blob/main/lib/lib-storage/example-code/file-upload.ts

  upload.on('httpUploadProgress', (progress) => {
    debug(`upload progress %O`, progress)
  })

  // There are 2 ways to expose the contents of a R2 bucket directly to the Internet:
  // 1. Expose your bucket as a custom domain under your control.
  // 2. Expose your bucket as a Cloudflare-managed subdomain under https://r2.dev.
  // To configure WAF custom rules, caching, access controls, or bot management
  // for your bucket, you must do so through a custom domain.
  // https://developers.cloudflare.com/r2/buckets/public-buckets/#connect-a-bucket-to-a-custom-domain
  const href = `https://${customDomain}/${assetName}`

  let uri: string
  try {
    const output = await upload.done()
    uri = output.Location! // when is this undefined?
    // https://developers.cloudflare.com/r2/buckets/public-buckets/#managed-public-buckets-through-r2dev
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return { error: err as Error }
  }

  const message = `asset uploaded to ${uri} and publicly accessible at ${href}`
  return { value: { message, href } }
}

export const auth_config = z
  .object({
    accessKeyId: api_token.access_key_id,
    accountId: account.id,
    secretAccessKey: api_token.secret_access_key
  })
  .describe('Cloudflare R2 auth config')

export type AuthConfig = z.input<typeof auth_config>

export const client_config = auth_config
  .merge(bucket_config)
  .describe('Cloudflare R2 client config')

export type ClientConfig = z.input<typeof client_config>

/**
 * Client for Cloudflare R2.
 *
 */
export const defClient = (config: ClientConfig) => {
  const data = validatedDataOrThrow(config, client_config)

  const { accessKeyId, accountId, bucketName, customDomain, secretAccessKey } =
    data

  const region = 'auto'
  debug(
    `audio assets will be written to ${bucketName} (region: ${region}) and hosted at ${customDomain}`
  )

  // https://developers.cloudflare.com/r2/api/s3/tokens/
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`
  const credentials = { accessKeyId, secretAccessKey }

  // https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/
  const s3 = new S3Client({ region, endpoint, credentials })

  const writeWithS3AndBucketConfig = write.bind(null, s3, {
    bucketName,
    customDomain
  })

  return {
    config: { bucketName, customDomain },
    write: writeWithS3AndBucketConfig
  }
}
