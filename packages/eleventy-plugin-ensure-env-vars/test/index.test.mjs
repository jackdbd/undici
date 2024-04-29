import assert from 'node:assert'
import { describe, it } from 'node:test'
import { defEleventy } from '@jackdbd/eleventy-test-utils'
import { ensureEnvVarsPlugin } from '../lib/index.js'

describe('ensureEnvVarsPlugin', () => {
  it('allows zero config', async () => {
    const eleventy = await defEleventy({ plugin: ensureEnvVarsPlugin })

    const userConfig = eleventy.eleventyConfig.userConfig

    assert.equal(userConfig.plugins.length, 1)
  })

  it('adds neither a `eleventy.before` nor a `eleventy.after` event handler', async () => {
    const eleventy = await defEleventy({ plugin: ensureEnvVarsPlugin })

    const userConfig = eleventy.eleventyConfig.userConfig

    assert.equal(userConfig.plugins.length, 1)
    assert.equal(userConfig.events._events['eleventy.before'], undefined)
    assert.equal(userConfig.events._events['eleventy.after'], undefined)
  })

  it('rejects with the expected error message when `envVars` is an empty array', async () => {
    await assert.rejects(
      () => {
        return defEleventy({
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

  it('rejects with the expected error message when the environment lacks the required `envVars`', async () => {
    delete process.env.FOO
    process.env.BAR = undefined
    process.env.BAZ = 'undefined'

    await assert.rejects(
      () => {
        return defEleventy({
          plugin: ensureEnvVarsPlugin,
          pluginConfig: { envVars: ['FOO', 'BAR', 'BAZ'] }
        })
      },
      (err) => {
        assert.match(
          err.message,
          /Error processing the `ensureEnvVarsPlugin` plugin/
        )
        assert.match(err.originalError.message, /FOO/)
        assert.match(err.originalError.message, /BAR/)
        assert.match(err.originalError.message, /BAZ/)
        return true
      }
    )
  })
})
