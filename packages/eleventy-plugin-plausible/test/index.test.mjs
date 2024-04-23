import assert from 'node:assert'
import { describe, it, before } from 'node:test'
import { defEleventy, ELEVENTY_INPUT } from '@jackdbd/eleventy-test-utils'
import { DEFAULT_OPTIONS } from '../lib/schemas.js'
import { plausiblePlugin } from '../lib/index.js'

describe('plugin', () => {
  const timeoutMs = 10000

  let apiKey
  let siteId
  before(() => {
    const parsed = JSON.parse(process.env.PLAUSIBLE)
    apiKey = parsed.api_key
    siteId = parsed.site_id
  })

  // I am no longer using Plausible, so I don't have a valid API key.
  // Re-enable this test if I have a valid Plausible Analytics account.
  it.skip(
    'adds the expected `eleventy.globalData` as an async function',
    async () => {
      const eleventy = await defEleventy({
        plugin: plausiblePlugin,
        pluginConfig: { apiKey, siteId },
        dir: { output: ELEVENTY_INPUT }
      })

      const userConfig = eleventy.eleventyConfig.userConfig

      const {
        statsBreakdownGlobalDataKey,
        statsBreakdownLimit,
        statsBreakdownMetrics
      } = DEFAULT_OPTIONS

      assert.notEqual(
        eleventyConfig.globalData[statsBreakdownGlobalDataKey],
        undefined
      )

      // const fn = eleventyConfig.globalData[statsBreakdownGlobalDataKey]

      // const breakdown = await fn()

      // expect(breakdown.length).toBeLessThanOrEqual(statsBreakdownLimit)
      // breakdown.forEach((d) => {
      //   expect(d.page).toBeDefined()
      //   expect(d[statsBreakdownMetrics]).toBeDefined()
      // })
    },
    timeoutMs
  )
})
