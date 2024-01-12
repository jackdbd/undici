import assert from 'node:assert'
import { describe, it, before, after } from 'node:test'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { audioAssetsFromText } from '../lib/audio-assets-from-text.js'
import { testWriter } from '../lib/test-writer.js'
import { clientLibraryCredentials } from '../lib/utils.js'

describe('audio-assets-from-text.ts', () => {
  const audioEncodings = ['MP3', 'OGG_OPUS']
  const cacheExpiration = '5s'
  const outputPath = '.'
  let textToSpeechClient
  const voice = 'en-GB-Wavenet-C'
  const writer = testWriter()

  before(() => {
    textToSpeechClient = new TextToSpeechClient({
      keyFilename: clientLibraryCredentials({
        what: 'Text-to-Speech client library'
      })
    })
  })

  after(() => {
    // I'm not sure if this is necessary, but I guess it doesn't hurt
    textToSpeechClient.close()
  })

  describe('audioAssetsFromText', () => {
    it('returns an error and no value if passed no argument', async () => {
      const { error, value } = await audioAssetsFromText()

      assert.notEqual(error, undefined)
      assert.equal(value, undefined)
    })

    it('synthesizes the given text into audio files, one for each requested audio encoding', async () => {
      const text = 'this is a test'

      const { error, value } = await audioAssetsFromText({
        audioEncodings,
        cacheExpiration,
        outputPath,
        text,
        textToSpeechClient,
        voice,
        writer
      })

      assert.equal(error, undefined)
      assert.notEqual(value, undefined)

      assert.notEqual(value.contentHash, undefined)
      assert.equal(value.hrefs.length, audioEncodings.length)
      assert.equal(value.error, undefined)
      assert.equal(value.warnings.length, 0)
    })
  })
})
