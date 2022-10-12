const { options: options_schema } = require('../lib/schemas.js')

describe('options', () => {
  it('can be an empty object', async () => {
    const { error, value } = options_schema.validate({})

    expect(error).not.toBeDefined()
    expect(value).toBeDefined()
  })

  it('cannot have a directive with feature `foo`', async () => {
    const { error, value } = options_schema.validate({
      directives: [{ feature: 'foo' }]
    })

    expect(error.message).toContain('must be one of')
  })

  it('can have a directive with feature `microphone` and no allowlist specified', async () => {
    const { error, value } = options_schema.validate({
      directives: [{ feature: 'microphone' }]
    })

    expect(error).not.toBeDefined()
    expect(value).toBeDefined()
  })

  it('can have a directive with feature `microphone` and empty allowlist', async () => {
    const { error, value } = options_schema.validate({
      directives: [{ feature: 'microphone', allowlist: [] }]
    })

    expect(error).not.toBeDefined()
    expect(value).toBeDefined()
  })

  it("can have a directive with feature `microphone` and allowlist ['self']", async () => {
    const { error, value } = options_schema.validate({
      directives: [{ feature: 'microphone', allowlist: ['self'] }]
    })

    expect(error).not.toBeDefined()
    expect(value).toBeDefined()
  })
})
