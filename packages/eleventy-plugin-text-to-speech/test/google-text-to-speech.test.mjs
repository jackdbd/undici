import assert from 'node:assert'
import { describe, it, before } from 'node:test'
import consumers from 'node:stream/consumers'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { cloudTextToSpeechClientOptions } from '@jackdbd/eleventy-test-utils'
import {
  audioExtension,
  synthesize
} from '../lib/synthesis/gcp-text-to-speech.js'

describe('Google Cloud Text-to-Speech', () => {
  describe('audioExtension', () => {
    it('returns `wav` if passed an `undefined` audio encoding', () => {
      const value = audioExtension()

      assert.equal(value, 'wav')
    })

    it('returns the value `opus` and no error if passed `OGG_OPUS` as the audio encoding', () => {
      const value = audioExtension('OGG_OPUS')

      assert.equal(value, 'opus')
    })
  })

  describe('synthesize', () => {
    const voiceName = 'en-GB-Wavenet-C'

    let tts
    before(() => {
      tts = new TextToSpeechClient(cloudTextToSpeechClientOptions())
    })

    it('synthesizes an OGG audio file from the given text', async () => {
      const audioEncoding = 'OGG_OPUS'
      const config = { audioEncoding, voiceName }
      const text = 'this is a test'

      const { error, value: readable } = await synthesize(tts, config, text)

      assert.equal(error, undefined)

      const buf = await consumers.buffer(readable)

      assert.equal(buf.BYTES_PER_ELEMENT, 1)
      // OGG files are organized into data segments. Each segment is prefixed
      // with an 27 byte header: 4 byte signature (OggS) used to identify the
      // header and storing flags, checksum and other important information.
      // https://www.file-recovery.com/ogg-signature-format.htm
      const ogg = buf.toString()

      assert.match(ogg, /OggS/)
      assert.match(ogg, /OpusHead/)
      assert.match(ogg, /libopus/)
      // the audio file will for sure be longer than 27 bytes (OGG header length)
      assert(ogg.length > 27)
    })

    // This test stopped working. Maybe Google changed MP3 encoder?
    it.skip('synthesizes an MP3 audio file from the given text', async () => {
      const audioEncoding = 'MP3'
      const config = { audioEncoding, voiceName }
      const text = 'this is a test'

      const { error, value: readable } = await synthesize(tts, config, text)

      assert.equal(error, undefined)
      // assert.notEqual(value, undefined)
      // assert.notEqual(value.audioContent, undefined)

      const buf = await consumers.buffer(readable)

      assert.equal(buf.BYTES_PER_ELEMENT, 1)

      // MP3 file consists of a series of frames and each frame has a header at
      // the beginning.
      // https://stackoverflow.com/questions/11360286/detect-if-a-file-is-an-mp3-file
      // https://www.codeproject.com/Articles/8295/MPEG-Audio-Frame-Header
      const mp3 = buf.toString()

      // https://lame.sourceforge.io/
      assert.match(mp3, /LAME/) // MP3 encoder
      // each frame header is 4 bytes
      assert(mp3.length > 4)
    })
  })
})
