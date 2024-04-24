import assert from 'node:assert'
import { describe, it } from 'node:test'
import { DEBUG_PREFIX } from '../lib/constants.js'

describe('DEBUG_PREFIX', () => {
  it('is permissions-policy', () => {
    assert.equal(DEBUG_PREFIX, 'permissions-policy')
  })
})
