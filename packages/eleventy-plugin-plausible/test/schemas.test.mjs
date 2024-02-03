import assert from 'node:assert'
import { describe, it } from 'node:test'
import { DEFAULT_OPTIONS, options as schema } from '../lib/schemas.js'

describe('plugin options', () => {
  it('matches the default options', async () => {
    const apiKey = 'some-api-key'
    const siteId = 'some-site-id'

    const res = schema.safeParse({ apiKey, siteId })

    assert.equal(res.error, undefined)
    assert.deepStrictEqual(res.data, { ...DEFAULT_OPTIONS, apiKey, siteId })
  })
})
