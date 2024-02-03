import assert from 'node:assert'
import { describe, it } from 'node:test'
import {
  featurePolicyDirectiveMapper,
  permissionsPolicyDirectiveMapper
} from '../lib/utils.js'

describe('featurePolicyDirectiveMapper', () => {
  it('returns the expected string when allowlist is not defined', async () => {
    const s = featurePolicyDirectiveMapper({
      feature: 'autoplay'
    })

    assert.equal(s, `autoplay 'none'`)
  })

  it('returns the expected string when allowlist is an empty array', async () => {
    const s = featurePolicyDirectiveMapper({
      feature: 'autoplay',
      allowlist: []
    })

    assert.equal(s, `autoplay 'none'`)
  })

  it('returns the expected string when allowlist is the wildcard *', async () => {
    const s = featurePolicyDirectiveMapper({
      feature: 'autoplay',
      allowlist: ['*']
    })

    assert.equal(s, `autoplay *`)
  })

  it('returns the expected string when allowlist has 2 elements', async () => {
    const s = featurePolicyDirectiveMapper({
      feature: 'camera',
      allowlist: ['self', 'https://trusted-site.example']
    })

    assert.equal(s, `camera 'self' 'https://trusted-site.example'`)
  })
})

describe('permissionsPolicyDirectiveMapper', () => {
  it('returns the expected string when allowlist is not defined', async () => {
    const s = permissionsPolicyDirectiveMapper({
      feature: 'autoplay'
    })

    assert.equal(s, `autoplay=()`)
  })

  it('returns the expected string when allowlist is an empty array', async () => {
    const s = permissionsPolicyDirectiveMapper({
      feature: 'autoplay',
      allowlist: []
    })

    assert.equal(s, `autoplay=()`)
  })

  it('returns the expected string when allowlist is the wildcard *', async () => {
    const s = permissionsPolicyDirectiveMapper({
      feature: 'autoplay',
      allowlist: ['*']
    })

    assert.equal(s, `autoplay=*`)
  })

  it('returns the expected string when allowlist has 2 elements', async () => {
    const s = permissionsPolicyDirectiveMapper({
      feature: 'camera',
      allowlist: ['self', 'https://trusted-site.example']
    })

    assert.equal(s, `camera=(self "https://trusted-site.example")`)
  })
})
