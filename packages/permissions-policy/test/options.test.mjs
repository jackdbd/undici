import assert from 'node:assert'
import { describe, it } from 'node:test'
import { DEFAULT_FEATURES } from '../lib/options.js'

describe('DEFAULT_FEATURES', () => {
  it('is an empty hash map', () => {
    assert.deepStrictEqual(DEFAULT_FEATURES, {})
  })
})
