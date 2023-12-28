import assert from 'node:assert'
import { describe, it } from 'node:test'
import { options as options_schema } from '../lib/schemas.js'

describe('options', () => {
  it('can be an empty object', async () => {
    const { error, value } = options_schema.validate({})

    assert.equal(error, undefined)
    assert.notEqual(value, undefined)
  })

  it('cannot have a directive with feature `foo`', async () => {
    const { error, value } = options_schema.validate({
      directives: [{ feature: 'foo' }]
    })

    assert.match(error.message, /must be one of/)
  })

  it('can have a directive with feature `microphone` and no allowlist specified', async () => {
    const { error, value } = options_schema.validate({
      directives: [{ feature: 'microphone' }]
    })

    assert.equal(error, undefined)
    assert.notEqual(value, undefined)
  })

  it('can have a directive with feature `microphone` and empty allowlist', async () => {
    const { error, value } = options_schema.validate({
      directives: [{ feature: 'microphone', allowlist: [] }]
    })

    assert.equal(error, undefined)
    assert.notEqual(value, undefined)
  })

  it("can have a directive with feature `microphone` and allowlist ['self']", async () => {
    const { error, value } = options_schema.validate({
      directives: [{ feature: 'microphone', allowlist: ['self'] }]
    })

    assert.equal(error, undefined)
    assert.notEqual(value, undefined)
  })
})
