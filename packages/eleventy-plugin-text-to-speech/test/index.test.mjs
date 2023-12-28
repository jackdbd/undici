import assert from 'node:assert'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import util from 'node:util'
import { describe, it, before, after } from 'node:test'
import { fileURLToPath } from 'node:url'
import { makeEleventy, ELEVENTY_INPUT } from '@jackdbd/eleventy-test-utils'
import { textToSpeechPlugin } from '../lib/index.js'

const rmP = util.promisify(fs.rm)

const __filename = fileURLToPath(import.meta.url)

const PACKAGE_ROOT = path.join(__filename, '..', '..')
const OUTPUT_DIR = path.join(PACKAGE_ROOT, '_site')

const audioHost = new URL('http://localhost:8090/assets/audio')

describe('Eleventy Text-to-Speech plugin', () => {
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

  it('throws when `audioHost` is `undefined`', async () => {
    await assert.rejects(
      () => {
        return makeEleventy({
          input: undefined,
          output: undefined,
          plugin: textToSpeechPlugin,
          pluginConfig: { audioHost: undefined },
          dir: { output: ELEVENTY_INPUT }
        })
      },
      (err) => {
        assert.match(
          err.message,
          /Error processing the `textToSpeechPlugin` plugin/
        )
        assert.match(err.originalError.message, /"audioHost" is required/)
        return true
      }
    )
  })

  it('throws when passed an audio encoding unsupported by the Cloud Text-to-Speech API', async () => {
    await assert.rejects(
      () => {
        return makeEleventy({
          input: undefined,
          output: undefined,
          plugin: textToSpeechPlugin,
          pluginConfig: { audioEncodings: ['foo'] },
          dir: { output: ELEVENTY_INPUT }
        })
      },
      (err) => {
        assert.match(
          err.message,
          /Error processing the `textToSpeechPlugin` plugin/
        )
        assert.match(err.originalError.message, /must be one of/)
        return true
      }
    )
  })

  it('allows `MP3` in `audioEncodings`', async () => {
    await assert.doesNotReject(() => {
      return makeEleventy({
        input: undefined,
        output: undefined,
        plugin: textToSpeechPlugin,
        pluginConfig: {
          audioEncodings: ['MP3'],
          audioHost
        },
        dir: { output: ELEVENTY_INPUT }
      })
    })
  })

  it('allows `OGG_OPUS` in `audioEncodings`', async () => {
    await assert.doesNotReject(() => {
      return makeEleventy({
        input: undefined,
        output: undefined,
        plugin: textToSpeechPlugin,
        pluginConfig: {
          audioEncodings: ['OGG_OPUS'],
          audioHost
        },
        dir: { output: ELEVENTY_INPUT }
      })
    })
  })
})
