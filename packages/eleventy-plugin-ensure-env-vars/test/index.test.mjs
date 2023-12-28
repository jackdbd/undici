import assert from 'node:assert'
import { describe, it } from 'node:test'
import { updatedEleventyConfig } from '@jackdbd/eleventy-test-utils'
import { ensureEnvVarsPlugin } from '../lib/index.js'

describe('ensureEnvVarsPlugin', () => {
  it('throws when `envVars` is an empty array', () => {
    const eleventyConfig = undefined
    const userConfig = { envVars: [] }

    assert.throws(
      () => {
        ensureEnvVarsPlugin(eleventyConfig, userConfig)
      },
      // regex match
      { message: /"envVars" does not contain at least one/ }
    )
  })

  it('throws when `envVars` does not include NODE_ENV', () => {
    const eleventyConfig = undefined
    const userConfig = { envVars: ['ELEVENTY_ENV'] }

    assert.throws(
      () => {
        ensureEnvVarsPlugin(eleventyConfig, userConfig)
      },
      { message: /"envVars" does not contain at least one/ }
    )
  })

  it('adds one `eleventy.before` event handler', async () => {
    const updatedConfig = await updatedEleventyConfig({
      plugin: ensureEnvVarsPlugin,
      pluginConfig: { envVars: ['ELEVENTY_ENV', 'NODE_ENV'] }
    })

    assert.equal(updatedConfig.events._eventsCount, 2)
    assert.notEqual(updatedConfig.events._events['eleventy.before'], undefined)
    assert.equal(updatedConfig.events._events['eleventy.after'], undefined)
  })

  it('allows an empty user config (i.e. options not set by the user)', async () => {
    const updatedConfig = await updatedEleventyConfig({
      plugin: ensureEnvVarsPlugin,
      pluginConfig: {}
    })

    assert.equal(updatedConfig.events._eventsCount, 2)
    assert.notEqual(updatedConfig.events._events['eleventy.before'], undefined)
    assert.equal(updatedConfig.events._events['eleventy.after'], undefined)
  })
})
