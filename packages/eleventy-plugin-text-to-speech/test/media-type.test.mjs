import assert from 'node:assert'
import { describe, it } from 'node:test'
import { mediaType } from '../lib/media-type.js'

describe('mediaType', () => {
  it('returns an error and no value if passed an `undefined` media type', () => {
    const { error, value } = mediaType()

    assert.notEqual(error, undefined)
    assert.equal(value, undefined)
  })

  it('returns an error and no value if passed an unsupported media type', () => {
    const { error, value } = mediaType('unsupported')

    assert.notEqual(error, undefined)
    assert.equal(value, undefined)
  })

  it('returns the value `audio/mpeg` and no error if passed `.mp3` as the media type', () => {
    const { error, value } = mediaType('.mp3')

    assert.equal(error, undefined)
    assert.equal(value, 'audio/mpeg')
  })

  it('returns the value `audio/ogg` and no error if passed `.opus` as the media type', () => {
    const { error, value } = mediaType('.opus')

    assert.equal(error, undefined)
    assert.equal(value, 'audio/ogg')
  })
})
