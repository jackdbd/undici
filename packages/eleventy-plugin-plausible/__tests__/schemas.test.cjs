const {
  defaultOptions,
  options: options_schema
} = require('../lib/schemas.cjs')

describe('options', () => {
  it('requires `apiKey` to be defined', async () => {
    const { error } = options_schema.validate({})

    expect(error.message).toContain('apiKey')
  })

  it('requires `siteId` to be defined', async () => {
    const { error } = options_schema.validate({ apiKey: 'some-api-key' })

    expect(error.message).toContain('siteId')
  })

  it('matches the default options', async () => {
    const apiKey = 'some-api-key'
    const siteId = 'some-site-id'

    const { error, value } = options_schema.validate({ apiKey, siteId })

    expect(error).not.toBeDefined()
    expect(value).toMatchObject({ ...defaultOptions, apiKey, siteId })
  })
})
