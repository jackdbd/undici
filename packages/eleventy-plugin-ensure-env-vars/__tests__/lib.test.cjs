const { ensureEnvVars } = require('../lib/lib.js')

describe('ensureEnvVars', () => {
  it('returns no error when passed an empty array', () => {
    const errors = ensureEnvVars([])

    expect(errors.length).toBe(0)
  })

  it('returns 2 errors when 2 required environment variables are not set', () => {
    expect(process.env.FOO).not.toBeDefined()
    expect(process.env.BAR).not.toBeDefined()

    const errors = ensureEnvVars(['FOO', 'BAR'])

    expect(errors.length).toBe(2)
  })
})
