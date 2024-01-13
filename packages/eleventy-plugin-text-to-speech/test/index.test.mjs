import assert from 'node:assert'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import util from 'node:util'
import { describe, it, before, after } from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  makeEleventy,
  cloudStorageUploaderClientOptions,
  cloudTextToSpeechClientOptions,
  CLOUD_STORAGE_BUCKET_AUDIO_FILES
} from '@jackdbd/eleventy-test-utils'
import { textToSpeechPlugin } from '../lib/index.js'

const rmP = util.promisify(fs.rm)

const __filename = fileURLToPath(import.meta.url)

const PACKAGE_ROOT = path.join(__filename, '..', '..')
const OUTPUT_DIR = path.join(PACKAGE_ROOT, '_site')

// TODO: double check what is correct. Write at least one test that self-hosts 1-2 audio assets
// const audioHost = new URL('http://localhost:8090/assets/audio')
// const origin = 'http://localhost:8090'
// const pathname = '/assets/audio'
// const selfHost = { origin, pathname }

describe('index.ts', () => {
  const storageClientOptions = cloudStorageUploaderClientOptions()
  const textToSpeechClientOptions = cloudTextToSpeechClientOptions()
  const transformName = 'plugin-transform-test'

  describe('textToSpeechPlugin', () => {
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

    it('rejects with a validation error mentioning audioHost, when no options are passed', async () => {
      await assert.rejects(
        () => {
          return makeEleventy({
            input: undefined,
            output: undefined,
            plugin: textToSpeechPlugin
          })
        },
        (err) => {
          assert.match(
            err.message,
            /Error processing the `textToSpeechPlugin` plugin/
          )
          assert.match(err.originalError.message, /Validation error/)
          assert.match(err.originalError.message, /audioHost/)
          return true
        }
      )
    })

    it('rejects with a validation error mentioning audioHost, when `audioHost` is `undefined`', async () => {
      await assert.rejects(
        () => {
          return makeEleventy({
            input: undefined,
            output: undefined,
            plugin: textToSpeechPlugin,
            pluginConfig: { audioHost: undefined }
          })
        },
        (err) => {
          assert.match(
            err.message,
            /Error processing the `textToSpeechPlugin` plugin/
          )
          assert.match(err.originalError.message, /Validation error/)
          assert.match(err.originalError.message, /audioHost/)
          return true
        }
      )
    })

    it('rejects with a validation error mentioning audioEncodings, when passed an audio encoding unsupported by the Cloud Text-to-Speech API', async () => {
      await assert.rejects(
        () => {
          return makeEleventy({
            input: undefined,
            output: undefined,
            plugin: textToSpeechPlugin,
            pluginConfig: { audioEncodings: ['foo'] }
          })
        },
        (err) => {
          assert.match(
            err.message,
            /Error processing the `textToSpeechPlugin` plugin/
          )
          assert.match(err.originalError.message, /Validation error/)
          assert.match(err.originalError.message, /audioEncodings/)
          return true
        }
      )
    })

    it('allows `MP3` in `audioEncodings`', async () => {
      const eleventy = await makeEleventy({
        input: undefined,
        output: undefined,
        plugin: textToSpeechPlugin,
        pluginConfig: {
          audioEncodings: ['MP3'],
          audioHost: {
            bucketName: CLOUD_STORAGE_BUCKET_AUDIO_FILES,
            storageClientOptions
          },
          textToSpeechClientOptions,
          transformName
        }
      })

      const userConfig = eleventy.eleventyConfig.userConfig

      assert.equal(userConfig.plugins.length, 1)
      assert.notEqual(userConfig.transforms[transformName], undefined)
    })

    it('allows `OGG_OPUS` in `audioEncodings`', async () => {
      const eleventy = await makeEleventy({
        input: undefined,
        output: undefined,
        plugin: textToSpeechPlugin,
        pluginConfig: {
          audioEncodings: ['OGG_OPUS'],
          audioHost: {
            bucketName: CLOUD_STORAGE_BUCKET_AUDIO_FILES,
            storageClientOptions
          },
          textToSpeechClientOptions,
          transformName
        }
      })

      const userConfig = eleventy.eleventyConfig.userConfig

      assert.equal(userConfig.plugins.length, 1)
      assert.notEqual(userConfig.transforms[transformName], undefined)
    })
  })
})
