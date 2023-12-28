import assert from 'node:assert'
import { describe, it } from 'node:test'
import { ensureEnvVars } from '../lib/lib.js'

describe('ensureEnvVars', () => {
  it('returns no error when passed an empty array', () => {
    const errors = ensureEnvVars([])

    assert.equal(errors.length, 0)
  })

  it('returns 2 errors when 2 required environment variables are not set', () => {
    assert.equal(process.env.FOO, undefined)
    assert.equal(process.env.BAR, undefined)

    const errors = ensureEnvVars(['FOO', 'BAR'])

    assert.equal(errors.length, 2)
  })
})
