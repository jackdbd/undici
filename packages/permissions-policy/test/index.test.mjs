import assert from 'node:assert'
import { describe, it } from 'node:test'
import { featurePolicy, permissionsPolicy } from '../lib/index.js'

describe('Feature-Policy header', () => {
  it('has all expected directives sorted alphabetically', () => {
    const expected = `bluetooth 'none'; camera 'self'; fullscreen *; microphone 'self' https://*.example.com`

    const { value } = featurePolicy({
      features: {
        camera: ['self'],
        bluetooth: [],
        fullscreen: ['*'],
        microphone: ['self', 'https://*.example.com']
      }
    })
    assert.equal(value, expected)

    const { value: actual } = featurePolicy({
      features: {
        microphone: ['self', 'https://*.example.com'],
        bluetooth: [],
        fullscreen: ['*'],
        camera: ['self']
      }
    })
    assert.equal(actual, expected)
  })

  it('does not allow features that are not defined by this library, and returns an error message mentioning the offending feature, and the SKIP_VALIDATION environment variable', () => {
    const { error, value } = featurePolicy({
      features: {
        'non-existent-feature': ['self'],
        bluetooth: [],
        fullscreen: ['*']
      }
    })
    assert.equal(value, undefined)
    assert.match(error.message, /non-existent-feature/)
    assert.match(error.message, /SKIP_VALIDATION/)
  })

  it('allows features that are not defined by this library when the SKIP_VALIDATION environment variable is set to 1', () => {
    process.env.SKIP_VALIDATION = 1

    const { error, value } = featurePolicy({
      features: {
        'non-existent-feature': ['self'],
        bluetooth: [],
        fullscreen: ['*']
      }
    })
    assert.equal(error, undefined)
    assert.equal(
      value,
      `bluetooth 'none'; fullscreen *; non-existent-feature 'self'`
    )

    process.env.SKIP_VALIDATION = ''
  })
})

describe('Permissions-Policy header', () => {
  it('returns an error when reportingEndpoint is not a string', () => {
    const non_compliant_inputs = [null, true, 3, BigInt(9), Symbol('foo'), {}]

    non_compliant_inputs.forEach((x) => {
      const { error, value } = permissionsPolicy({ reportingEndpoint: x })

      assert.notEqual(error, undefined)
      assert.equal(value, undefined)
    })
  })

  it('has all expected directives sorted alphabetically', () => {
    const expected = `bluetooth=(), camera=(self), fullscreen=*, microphone=(self "https://*.example.com")`

    const { error, value } = permissionsPolicy({
      features: {
        bluetooth: [],
        camera: ['self'],
        fullscreen: ['*'],
        microphone: ['self', 'https://*.example.com']
      }
    })

    assert.equal(value, expected)

    const { value: actual } = permissionsPolicy({
      features: {
        microphone: ['self', 'https://*.example.com'],
        bluetooth: [],
        fullscreen: ['*'],
        camera: ['self']
      }
    })
    assert.equal(actual, expected)
  })

  it('includes all expected directives and the endpoint for the Reporting API if reportingEndpoint is set', () => {
    const { value } = permissionsPolicy({
      features: {
        bluetooth: [],
        camera: ['self'],
        'ch-device-memory': ['self'],
        fullscreen: ['*'],
        geolocation: ['self', 'https://trusted-site.example'],
        microphone: ['self', 'https://*.example.com']
      },
      reportingEndpoint: 'permissions_policy'
    })

    const expected = `bluetooth=(), camera=(self), ch-device-memory=(self), fullscreen=*, geolocation=(self "https://trusted-site.example"), microphone=(self "https://*.example.com"); report-to="permissions_policy"`
    assert.equal(value, expected)
    assert.match(value, /report-to="permissions_policy"/)
  })

  it('does not include the endpoint for the Reporting API if reportingEndpoint is not set', () => {
    const { value } = permissionsPolicy({
      features: {
        bluetooth: [],
        camera: ['self'],
        'ch-device-memory': ['self'],
        fullscreen: ['*'],
        geolocation: ['self', 'https://trusted-site.example'],
        microphone: ['self', 'https://*.example.com']
      }
    })

    const expected = `bluetooth=(), camera=(self), ch-device-memory=(self), fullscreen=*, geolocation=(self "https://trusted-site.example"), microphone=(self "https://*.example.com")`
    assert.equal(value, expected)
    assert.doesNotMatch(value, /report-to="permissions_policy"/)
  })

  it('does not allow features that are not defined by this library, and returns an error message mentioning the offending feature, and the SKIP_VALIDATION environment variable', () => {
    const { error, value } = permissionsPolicy({
      features: {
        'non-existent-feature': ['self'],
        bluetooth: [],
        fullscreen: ['*']
      }
    })
    assert.equal(value, undefined)
    assert.match(error.message, /non-existent-feature/)
    assert.match(error.message, /SKIP_VALIDATION/)
  })

  it('allows features that are not defined by this library when the SKIP_VALIDATION environment variable is set to 1', () => {
    process.env.SKIP_VALIDATION = 1

    const { error, value } = permissionsPolicy({
      features: {
        'non-existent-feature': ['self'],
        bluetooth: [],
        fullscreen: ['*']
      }
    })
    assert.equal(error, undefined)
    assert.equal(
      value,
      `bluetooth=(), fullscreen=*, non-existent-feature=(self)`
    )

    process.env.SKIP_VALIDATION = ''
  })
})
