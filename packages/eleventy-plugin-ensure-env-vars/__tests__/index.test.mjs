import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert'
import Eleventy from '@11ty/eleventy/src/Eleventy.js'
import { ensureEnvVarsPlugin } from '../lib/index.js'

describe('ensureEnvVarsPlugin', () => {
  let eleventyConfig
  beforeEach(() => {
    const eleventy = new Eleventy()
    eleventyConfig = eleventy.eleventyConfig.userConfig
  })

  it('throws when `envVars` is an empty array', () => {
    const userConfig = { envVars: [] }

    assert.throws(
      () => {
        ensureEnvVarsPlugin(eleventyConfig, userConfig)
      },
      {
        message: new RegExp('"envVars" does not contain at least one')
      }
    )
  })

  it('throws when `envVars` does not include NODE_ENV', () => {
    const userConfig = { envVars: ['ELEVENTY_ENV'] }

    assert.throws(
      () => {
        ensureEnvVarsPlugin(eleventyConfig, userConfig)
      },
      { message: new RegExp('"envVars" does not contain at least one') }
    )
  })

  it('adds just one `eleventy.before` event handler and no `eleventy.after` event handler', () => {
    const userConfig = { envVars: ['ELEVENTY_ENV', 'NODE_ENV'] }
    const initial_events_count = 1

    assert.strictEqual(
      eleventyConfig.events._events['eleventy.before'],
      undefined
    )
    assert.strictEqual(
      eleventyConfig.events._events['eleventy.after'],
      undefined
    )

    ensureEnvVarsPlugin(eleventyConfig, userConfig)

    assert.strictEqual(
      eleventyConfig.events._eventsCount,
      initial_events_count + 1
    )
    assert.notEqual(eleventyConfig.events._events['eleventy.before'], undefined)
    assert.strictEqual(
      eleventyConfig.events._events['eleventy.after'],
      undefined
    )
  })

  it('allows an empty user config (i.e. options not set by the user)', () => {
    const userConfig = {}

    assert.doesNotThrow(() => {
      ensureEnvVarsPlugin(eleventyConfig, userConfig)
    })
  })
})
