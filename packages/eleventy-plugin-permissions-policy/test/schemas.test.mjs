import assert from 'node:assert'
import { describe, it } from 'node:test'
import { options as schema } from '../lib/schemas.js'

describe('options', () => {
  it('can be an empty object', async () => {
    const res = schema.safeParse({})

    assert.equal(res.success, true)
    assert.equal(res.error, undefined)
    assert.notEqual(res.data, undefined)
  })

  it('cannot have a directive with feature `foo`', async () => {
    const res = schema.safeParse({
      directives: [{ feature: 'foo' }]
    })

    assert.equal(res.success, false)
    assert.notEqual(res.error, undefined)
  })

  it('can have a directive with feature `microphone` and no allowlist specified', async () => {
    const res = schema.safeParse({
      directives: [{ feature: 'microphone' }]
    })

    assert.equal(res.success, true)
    assert.equal(res.error, undefined)
    assert.notEqual(res.data, undefined)
  })

  it('can have a directive with feature `microphone` and empty allowlist', async () => {
    const res = schema.safeParse({
      directives: [{ feature: 'microphone', allowlist: [] }]
    })

    assert.equal(res.success, true)
    assert.equal(res.error, undefined)
    assert.notEqual(res.data, undefined)
  })

  it("can have a directive with feature `microphone` and allowlist ['self']", async () => {
    const res = schema.safeParse({
      directives: [{ feature: 'microphone', allowlist: ['self'] }]
    })

    assert.equal(res.success, true)
    assert.equal(res.error, undefined)
    assert.notEqual(res.data, undefined)
  })
})
