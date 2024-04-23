import assert from 'node:assert'
import { describe, it, before } from 'node:test'
import { options } from '../lib/schemas.js'

describe('schemas', () => {
  describe('contentSecurityPolicyPlugin options', () => {
    it('can be an empty object', async () => {
      const res = options.safeParse()

      assert.equal(res.error, undefined)
      assert.notEqual(res.data, undefined)
    })

    it('has the expected defaults', async () => {
      const res = options.safeParse({})

      assert.equal(res.error, undefined)

      const {
        allowDeprecatedDirectives,
        directives,
        excludePatterns,
        globPatterns,
        globPatternsDetach,
        includePatterns,
        jsonRecap,
        reportOnly
      } = res.data

      assert.equal(allowDeprecatedDirectives, false)
      assert.deepStrictEqual(directives, {})
      assert.deepStrictEqual(excludePatterns, [])
      assert.deepStrictEqual(globPatterns, ['/*'])
      assert.deepStrictEqual(globPatternsDetach, [])
      assert.deepStrictEqual(includePatterns, ['/**/**.html'])
      assert.equal(jsonRecap, false)
      assert.equal(reportOnly, false)
    })
  })
})
