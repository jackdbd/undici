const { makePluginOptions } = require('../lib/schemas.cjs')

describe('pluginOptions', () => {
  let pluginOptions
  beforeAll(async () => {
    pluginOptions = await makePluginOptions()
  })

  it('can be an empty object', async () => {
    const { error, value } = pluginOptions.validate({})

    expect(error).not.toBeDefined()
    expect(value).toBeDefined()
  })

  it('has the expected defaults', async () => {
    const { value } = pluginOptions.validate({})
    const {
      allowDeprecatedDirectives,
      directives,
      excludePatterns,
      globPatterns,
      globPatternsDetach,
      includePatterns,
      jsonRecap,
      reportOnly
    } = value

    expect(allowDeprecatedDirectives).toBe(false)
    expect(directives).toMatchObject({})
    expect(excludePatterns).toMatchObject([])
    expect(globPatterns).toMatchObject(['/', '/*/'])
    expect(globPatternsDetach).toMatchObject([])
    expect(includePatterns).toMatchObject(['/**/**.html'])
    expect(jsonRecap).toBe(false)
    expect(reportOnly).toBe(false)
  })
})
