const { makePluginOptions } = require('../lib/schemas.cjs')

describe('makePluginOptions', () => {
  let pluginOptions
  beforeAll(async () => {
    pluginOptions = await makePluginOptions()
  })

  it('returns pluginOptions', async () => {
    expect(pluginOptions).toBeDefined()
  })
})
