import { describe, it } from 'node:test'
import assert from 'node:assert'
import { ensureEnvVars } from '../lib/lib.js'

describe('ensureEnvVars', () => {
  it('returns no error when passed an empty array', () => {
    const errors = ensureEnvVars([])
    assert.strictEqual(errors.length, 0)
  })

  it('returns 2 errors when 2 required environment variables are not set', () => {
    assert.strictEqual(process.env.FOO, undefined)
    assert.strictEqual(process.env.BAR, undefined)

    const errors = ensureEnvVars(['FOO', 'BAR'])

    assert.strictEqual(errors.length, 2)
  })
})
