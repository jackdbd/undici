import assert from 'node:assert'
import { describe, it, before } from 'node:test'
import { makePluginOptions } from '../lib/schemas.js'

describe('contentSecurityPolicyPlugin options', () => {
  let pluginOptions
  before(async () => {
    pluginOptions = await makePluginOptions()
  })

  it('can be an empty object', async () => {
    const { error, value } = pluginOptions.validate({})

    assert.equal(error, undefined)
    assert.notEqual(value, undefined)
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

    assert.equal(allowDeprecatedDirectives, false)
    assert.deepStrictEqual(directives, {})
    assert.deepStrictEqual(excludePatterns, [])
    assert.deepStrictEqual(globPatterns, ['/', '/*/'])
    assert.deepStrictEqual(globPatternsDetach, [])
    assert.deepStrictEqual(includePatterns, ['/**/**.html'])
    assert.equal(jsonRecap, false)
    assert.equal(reportOnly, false)
  })
})
