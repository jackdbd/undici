const Eleventy = require('@11ty/eleventy/src/Eleventy')
const { ensureEnvVarsPlugin } = require('../lib/index.js')

describe('ensureEnvVarsPlugin', () => {
  let eleventyConfig
  beforeEach(() => {
    const eleventy = new Eleventy()
    eleventyConfig = eleventy.eleventyConfig.userConfig
  })

  it('throws when `envVars` is an empty array', () => {
    const userConfig = { envVars: [] }

    expect(() => {
      ensureEnvVarsPlugin(eleventyConfig, userConfig)
    }).toThrowError('"envVars" does not contain at least one')
  })

  it('throws when `envVars` does not include NODE_ENV', () => {
    const userConfig = { envVars: ['ELEVENTY_ENV'] }

    expect(() => {
      ensureEnvVarsPlugin(eleventyConfig, userConfig)
    }).toThrowError('"envVars" does not contain at least one')
  })

  it('adds one `eleventy.before` event handler', () => {
    const userConfig = { envVars: ['ELEVENTY_ENV', 'NODE_ENV'] }

    expect(eleventyConfig.events._events['eleventy.before']).not.toBeDefined()
    expect(eleventyConfig.events._events['eleventy.after']).not.toBeDefined()

    ensureEnvVarsPlugin(eleventyConfig, userConfig)

    expect(eleventyConfig.events._eventsCount).toBe(1)
    expect(eleventyConfig.events._events['eleventy.before']).toBeDefined()
    expect(eleventyConfig.events._events['eleventy.after']).not.toBeDefined()
  })

  it('allows an empty user config (i.e. options not set by the user)', () => {
    const userConfig = {}

    expect(() => {
      ensureEnvVarsPlugin(eleventyConfig, userConfig)
    }).not.toThrow()
  })
})
