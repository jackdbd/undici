import assert from 'node:assert'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import util from 'node:util'
import { describe, it, before, after } from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  cloudStorageUploaderClientOptions,
  cloudTextToSpeechClientOptions,
  defEleventy,
  CLOUD_STORAGE_BUCKET_AUDIO_FILES_NAME,
  CLOUDFLARE_R2_BUCKET_AUDIO_FILES_CUSTOM_DOMAIN,
  CLOUDFLARE_R2_BUCKET_AUDIO_FILES_NAME,
  CLOUDFLARE_ACCOUNT_ID
} from '@jackdbd/eleventy-test-utils'
import { textToSpeechPlugin } from '../lib/index.js'
import { defClient as defGoogleCloudTextToSpeechClient } from '../lib/synthesis/gcp-text-to-speech.js'
import { defClient as defCloudStorageClient } from '../lib/hosting/cloud-storage.js'
import { defClient as defCloudflareR2Client } from '../lib/hosting/cloudflare-r2.js'

const rmP = util.promisify(fs.rm)

const __filename = fileURLToPath(import.meta.url)
const PACKAGE_ROOT = path.join(__filename, '..', '..')
const OUTPUT_DIR = path.join(PACKAGE_ROOT, '_site')

describe('textToSpeechPlugin', () => {
  const transformName = 'plugin-transform-test'

  const ttsOpusEnGB = defGoogleCloudTextToSpeechClient({
    ...cloudTextToSpeechClientOptions(),
    audioEncoding: 'OGG_OPUS',
    voiceName: 'en-GB-Wavenet-C'
  })

  const ttsOpusEnIN = defGoogleCloudTextToSpeechClient({
    ...cloudTextToSpeechClientOptions(),
    audioEncoding: 'OGG_OPUS',
    voiceName: 'en-IN-Neural2-A'
  })

  const cloudStorage = defCloudStorageClient({
    ...cloudStorageUploaderClientOptions(),
    bucketName: CLOUD_STORAGE_BUCKET_AUDIO_FILES_NAME
  })

  const { access_key_id: accessKeyId, secret_access_key: secretAccessKey } =
    JSON.parse(process.env.CLOUDFLARE_R2)

  const cloudflareR2 = defCloudflareR2Client({
    accountId: CLOUDFLARE_ACCOUNT_ID,
    accessKeyId,
    secretAccessKey,
    bucketName: CLOUDFLARE_R2_BUCKET_AUDIO_FILES_NAME,
    customDomain: CLOUDFLARE_R2_BUCKET_AUDIO_FILES_CUSTOM_DOMAIN
  })

  before(async () => {
    if (!fs.existsSync(OUTPUT_DIR)) {
      await fsPromises.mkdir(OUTPUT_DIR)
    }
  })

  after(async () => {
    if (fs.existsSync(OUTPUT_DIR)) {
      await rmP(OUTPUT_DIR, { force: true, recursive: true })
    }
  })

  it('rejects with a validation error mentioning rules, when no options are passed', async () => {
    try {
      await defEleventy({
        plugin: textToSpeechPlugin
      })
    } catch (err) {
      assert.match(
        err.message,
        /Error processing the `textToSpeechPlugin` plugin/
      )
      assert.match(err.originalError.message, /Validation error/)
      assert.match(err.originalError.message, /rules/)
    }
  })

  it('rejects with a validation error mentioning rules, when `rules` is an empty array', async () => {
    try {
      await defEleventy({
        plugin: textToSpeechPlugin,
        pluginConfig: { rules: [] }
      })
    } catch (err) {
      assert.match(
        err.message,
        /Error processing the `textToSpeechPlugin` plugin/
      )
      assert.match(err.originalError.message, /Validation error/)
      assert.match(err.originalError.message, /rules/)
    }
  })

  it('allows one rule', async () => {
    const eleventy = await defEleventy({
      plugin: textToSpeechPlugin,
      pluginConfig: {
        rules: [
          {
            regex: new RegExp('posts\\/.*\\.html$'),
            xPathExpressions: ['//p[contains(., "savannas")]'],
            synthesis: ttsOpusEnGB,
            hosting: cloudStorage
          }
        ],
        transformName
      }
    })

    const userConfig = eleventy.eleventyConfig.userConfig

    assert.equal(userConfig.plugins.length, 1)
    assert.notEqual(userConfig.transforms[transformName], undefined)
  })

  it('allows two rules with different synthesis/hosting clients', async () => {
    const eleventy = await defEleventy({
      plugin: textToSpeechPlugin,
      pluginConfig: {
        rules: [
          {
            regex: new RegExp('posts\\/.*\\.html$'),
            cssSelectors: ['div.custom-tts > p:nth-child(2)'],
            synthesis: ttsOpusEnGB,
            hosting: cloudStorage
          },
          {
            regex: new RegExp('posts\\/.*\\.html$'),
            xPathExpressions: ['//p[contains(., "savannas")]'],
            synthesis: ttsOpusEnIN,
            hosting: cloudflareR2
          }
        ],
        transformName
      }
    })

    const userConfig = eleventy.eleventyConfig.userConfig

    assert.equal(userConfig.plugins.length, 1)
    assert.notEqual(userConfig.transforms[transformName], undefined)
  })
})
