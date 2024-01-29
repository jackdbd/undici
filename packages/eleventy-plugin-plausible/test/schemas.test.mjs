import assert from 'node:assert'
import { describe, it } from 'node:test'
import { defaultOptions, options as options_schema } from '../lib/schemas.js'

describe('options', () => {
  it('requires `apiKey` to be defined', async () => {
    const { error } = options_schema.validate({})

    assert.match(error.message, /apiKey/)
  })

  it('requires `siteId` to be defined', async () => {
    const { error } = options_schema.validate({ apiKey: 'some-api-key' })

    assert.match(error.message, /siteId/)
  })

  it('matches the default options', async () => {
    const apiKey = 'some-api-key'
    const siteId = 'some-site-id'

    const { error, value } = options_schema.validate({ apiKey, siteId })

    assert.equal(error, undefined)
    assert.deepStrictEqual(value, { ...defaultOptions, apiKey, siteId })
  })
})
