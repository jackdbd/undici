import assert from 'node:assert'
import { describe, it } from 'node:test'
import { makeEleventy } from '@jackdbd/eleventy-test-utils'
import { ensureEnvVarsPlugin } from '../lib/index.js'

describe('ensureEnvVarsPlugin', () => {
  it('rejects with the expected error message when `envVars` is an empty array', async () => {
    await assert.rejects(
      () => {
        return makeEleventy({
          plugin: ensureEnvVarsPlugin,
          pluginConfig: { envVars: [] }
        })
      },
      (err) => {
        assert.match(
          err.message,
          /Error processing the `ensureEnvVarsPlugin` plugin/
        )
        assert.match(err.originalError.message, /Validation error/)
        assert.match(err.originalError.message, /at least 1 element/)
        return true
      }
    )
  })

  it('rejects with the expected error message when `envVars` does not include NODE_ENV', async () => {
    await assert.rejects(
      () => {
        return makeEleventy({
          plugin: ensureEnvVarsPlugin,
          pluginConfig: { envVars: ['ELEVENTY_ENV'] }
        })
      },
      (err) => {
        assert.match(
          err.message,
          /Error processing the `ensureEnvVarsPlugin` plugin/
        )
        assert.match(err.originalError.message, /Validation error/)
        assert.match(err.originalError.message, /Invalid input/)
        return true
      }
    )
  })

  it('allows an empty user config (i.e. this plugin will use a default config)', async () => {
    const eleventy = await makeEleventy({
      plugin: ensureEnvVarsPlugin
    })

    const userConfig = eleventy.eleventyConfig.userConfig

    assert.equal(userConfig.plugins.length, 1)
    assert.equal(userConfig.events._events['eleventy.before'].length, 1)
    assert.equal(userConfig.events._events['eleventy.after'], undefined)
  })

  it('adds one `eleventy.before` event handler', async () => {
    const eleventy = await makeEleventy({
      plugin: ensureEnvVarsPlugin,
      pluginConfig: { envVars: ['ELEVENTY_ENV', 'NODE_ENV'] }
    })

    const userConfig = eleventy.eleventyConfig.userConfig

    assert.equal(userConfig.plugins.length, 1)
    assert.equal(userConfig.events._events['eleventy.before'].length, 1)
    assert.equal(userConfig.events._events['eleventy.after'], undefined)
  })
})
