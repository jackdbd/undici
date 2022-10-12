const {
  featurePolicyDirectiveMapper,
  permissionsPolicyDirectiveMapper
} = require('../lib/utils.js')

describe('featurePolicyDirectiveMapper', () => {
  it('returns the expected string when allowlist is the wildcard *', async () => {
    const s = featurePolicyDirectiveMapper({
      feature: 'autoplay',
      allowlist: ['*']
    })

    expect(s).toBe(`autoplay *`)
  })

  it('returns the expected string when allowlist has 2 elements', async () => {
    const s = featurePolicyDirectiveMapper({
      feature: 'camera',
      allowlist: ['self', 'https://trusted-site.example']
    })

    expect(s).toBe(`camera 'self' 'https://trusted-site.example'`)
  })
})

describe('permissionsPolicyDirectiveMapper', () => {
  it('returns the expected string when allowlist is the wildcard *', async () => {
    const s = permissionsPolicyDirectiveMapper({
      feature: 'autoplay',
      allowlist: ['*']
    })

    expect(s).toBe(`autoplay=*`)
  })

  it('returns the expected string when allowlist has 2 elements', async () => {
    const s = permissionsPolicyDirectiveMapper({
      feature: 'camera',
      allowlist: ['self', 'https://trusted-site.example']
    })

    expect(s).toBe(`camera=(self "https://trusted-site.example")`)
  })
})
