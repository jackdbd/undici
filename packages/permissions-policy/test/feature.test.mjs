import assert from 'node:assert'
import { describe, it } from 'node:test'
import { feature } from '../lib/feature.js'

describe('feature', () => {
  it('can be accelerometer', () => {
    const { error, data } = feature.safeParse('accelerometer')
    assert.equal(error, undefined)
    assert.equal(data, 'accelerometer')
  })

  it('cannot be non-existent-feature', () => {
    const { error, data } = feature.safeParse('non-existent-feature')
    assert.notEqual(error, undefined)
    assert.equal(data, undefined)
  })
})
