import assert from 'node:assert'
import { describe, it, before, after } from 'node:test'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { synthesizeSpeech } from '../lib/text-to-speech.js'
import { clientLibraryCredentials } from '../lib/utils.js'

describe('text-to-speech.ts', () => {
  let client
  const voice = { name: 'en-GB-Wavenet-C', languageCode: 'en-GB' }
  //   const voice = { name: 'en-US-Standard-J', languageCode: 'en-US' }

  before(() => {
    client = new TextToSpeechClient({
      keyFilename: clientLibraryCredentials({
        what: 'Text-to-Speech client library'
      })
    })

    // const [response] = await client.listVoices()
    // console.log(`${response.voices.length} voices available`)
    // console.log(response.voices)
  })

  after(() => {
    // I'm not sure if this is necessary, but I guess it doesn't hurt
    client.close()
  })

  describe('synthesizeSpeech', () => {
    it('returns an error and no value if passed no argument', async () => {
      const { error, value } = await synthesizeSpeech()

      assert.notEqual(error, undefined)
      assert.equal(value, undefined)
    })

    it('returns an error and no value if passed an empty argument', async () => {
      const { error, value } = await synthesizeSpeech({})

      assert.notEqual(error, undefined)
      assert.equal(value, undefined)
    })

    it('synthesizes an OGG audio file from the given text', async () => {
      const audioEncoding = 'OGG_OPUS'
      const text = 'this is a test'

      const { error, value: uint8 } = await synthesizeSpeech({
        audioEncoding,
        client,
        text,
        voice
      })

      assert.equal(error, undefined)
      assert.notEqual(uint8, undefined)

      assert.equal(uint8.BYTES_PER_ELEMENT, 1)
      // OGG files are organized into data segments. Each segment is prefixed
      // with an 27 byte header: 4 byte signature (OggS) used to identify the
      // header and storing flags, checksum and other important information.
      // https://www.file-recovery.com/ogg-signature-format.htm
      const ogg = uint8.toString()

      assert.match(ogg, /OggS/)
      assert.match(ogg, /OpusHead/)
      assert.match(ogg, /libopus/)
      // the audio file will for sure be longer than 27 bytes (OGG header length)
      assert(ogg.length > 27)
    })

    it('synthesizes an MP3 audio file from the given text', async () => {
      const audioEncoding = 'MP3'
      const text = 'this is a test'

      const { error, value: uint8 } = await synthesizeSpeech({
        audioEncoding,
        client,
        text,
        voice
      })

      assert.equal(error, undefined)
      assert.notEqual(uint8, undefined)

      assert.equal(uint8.BYTES_PER_ELEMENT, 1)

      // MP3 file consists of a series of frames and each frame has a header at
      // the beginning.
      // https://stackoverflow.com/questions/11360286/detect-if-a-file-is-an-mp3-file
      // https://www.codeproject.com/Articles/8295/MPEG-Audio-Frame-Header
      const mp3 = uint8.toString()

      // https://lame.sourceforge.io/
      assert.match(mp3, /LAME/) // MP3 encoder
      // each frame header is 4 bytes
      assert(mp3.length > 4)
    })
  })
})
