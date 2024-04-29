import assert from 'node:assert'
import { describe, it } from 'node:test'
import { defEleventy } from '../lib/eleventy.js'

describe('defEleventy', () => {
  it('allows passing no options', async () => {
    const eleventy = await defEleventy()

    assert.notEqual(eleventy, undefined)
  })

  it('allows passing empty options', async () => {
    const eleventy = await defEleventy({})
    const userConfig = eleventy.eleventyConfig.userConfig

    assert.notEqual(eleventy, undefined)
  })

  it('registers no plugins when no plugin is set', async () => {
    const eleventy = await defEleventy({})
    const userConfig = eleventy.eleventyConfig.userConfig

    assert.equal(userConfig.plugins.length, 0)
  })

  it('registers a No-Op plugin', async () => {
    const eleventy = await defEleventy({ plugin: () => {} })
    const userConfig = eleventy.eleventyConfig.userConfig

    assert.equal(userConfig.plugins.length, 1)
  })
})
