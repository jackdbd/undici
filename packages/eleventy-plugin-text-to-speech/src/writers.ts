import fs from 'node:fs'
import path from 'node:path'
import stream from 'node:stream'
import util from 'node:util'
import makeDebug from 'debug'
import type { Storage } from '@google-cloud/storage'

const debug = makeDebug('eleventy-plugin-text-to-speech/writers')

const writeFile = util.promisify(fs.writeFile)

interface AssetConfig {
  assetName: string
  buffer: string | Uint8Array
}

interface WriteResult {
  filepath?: string
  href: string
  message: string
  uri?: URL
}

export interface Writer {
  write: (config: AssetConfig) => Promise<WriteResult>
}

interface SelfHostConfig extends AssetConfig {
  hrefBase: string
  outputBase: string
}

const selfHostedHref = async ({
  assetName,
  buffer,
  hrefBase,
  outputBase
}: SelfHostConfig): Promise<WriteResult> => {
  const filepath = path.join(outputBase, assetName)
  debug(`write ${filepath}`)
  await writeFile(filepath, buffer, { encoding: 'utf8' })
  const href = `${hrefBase}/${assetName}`
  const message = `${assetName} hosted at ${href} (filepath: ${filepath})`
  debug(message)
  return { filepath, href, message }
}

interface CloudStorageHostConfig extends AssetConfig {
  bucketName: string
  storage: Storage
}

const cloudStorageHostedHref = ({
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

    d.on('end', () => {
      const message = `${assetName} hosted at ${href} (Cloud Storage URI: ${uri})`
      debug(message)

      return resolve({
        href,
        message,
        uri
      })
    })

    d.end()
  })
}

interface SelfHostWriter {
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

interface CloudStorageWriter {
  bucketName: string
  storage: Storage
}

export const cloudStorageWriter = ({
  bucketName,
  storage
}: CloudStorageWriter) => {
  return {
    write: async (config: AssetConfig) => {
      return await cloudStorageHostedHref({ ...config, bucketName, storage })
    }
  }
}
