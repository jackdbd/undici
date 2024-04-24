import assert from 'node:assert'
import { describe, it } from 'node:test'
import { allowlist } from '../lib/allowlist.js'

describe('allowlist', () => {
  it(`can contain 'self' and multiple origins`, () => {
    const { error, data } = allowlist.safeParse([
      'self',
      'https://example.com',
      'https://another-example.org'
    ])
    assert.equal(error, undefined)
    assert.equal(data[0], 'self')
    assert.equal(data[1], 'https://example.com')
    assert.equal(data[2], 'https://another-example.org')
  })

  it(`cannot contain the same origin more twice`, () => {
    const { error, data } = allowlist.safeParse([
      'https://example.com',
      'https://example.com'
    ])
    assert.notEqual(error, undefined)
    assert.equal(data, undefined)
  })
})
