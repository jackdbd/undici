import assert from 'node:assert'
import { describe, it } from 'node:test'
import { makeEleventy, INITIAL_ELEVENTY_EVENTS_COUNT } from '../lib/index.js'

describe('makeEleventy', () => {
  it('allows passing no options', async () => {
    const eleventy = await makeEleventy()

    assert.notEqual(eleventy, undefined)
  })

  it('allows passing empty options', async () => {
    const eleventy = await makeEleventy({})
    // const userConfig = eleventy.eleventyConfig.userConfig

    assert.notEqual(eleventy, undefined)
  })

  it('registers no plugins when no plugin is set', async () => {
    const eleventy = await makeEleventy({})
    const userConfig = eleventy.eleventyConfig.userConfig

    assert.equal(userConfig.plugins.length, 0)
    assert.equal(userConfig.events._eventsCount, INITIAL_ELEVENTY_EVENTS_COUNT)
  })

  it('registers a No-Op plugin', async () => {
    const eleventy = await makeEleventy({ plugin: () => {} })
    const userConfig = eleventy.eleventyConfig.userConfig

    assert.equal(userConfig.plugins.length, 1)
    assert.equal(userConfig.events._eventsCount, INITIAL_ELEVENTY_EVENTS_COUNT)
  })
})
