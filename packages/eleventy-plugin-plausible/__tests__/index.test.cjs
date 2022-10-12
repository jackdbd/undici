const path = require('node:path')
const Eleventy = require('@11ty/eleventy/src/Eleventy')
const { defaultOptions } = require('../lib/schemas.cjs')
const plugin = require('../lib/index.cjs')

const waitMs = (ms) => {
  let timeout
  return new Promise((resolve) => {
    timeout = setTimeout(() => {
      resolve(timeout)
    }, ms)
  })
}

describe('plugin', () => {
  const timeoutMs = 10000

  let apiKey
  let siteId
  beforeAll(() => {
    const parsed = JSON.parse(process.env.PLAUSIBLE)
    apiKey = parsed.api_key
    siteId = parsed.site_id
  })

  let eleventyConfig
  beforeEach(async () => {
    const eleventy = new Eleventy()
    eleventyConfig = eleventy.eleventyConfig.userConfig
  })

  it(
    'adds the expected `eleventy.globalData` as an async function',
    async () => {
      const userConfig = { apiKey, siteId }

      plugin.configFunction(eleventyConfig, userConfig)

      eleventyConfig.emit('eleventy.before')
      const timeout = await waitMs(timeoutMs / 4)
      clearTimeout(timeout)

      const {
        statsBreakdownGlobalDataKey,
        statsBreakdownLimit,
        statsBreakdownMetrics
      } = defaultOptions

      expect(
        eleventyConfig.globalData[statsBreakdownGlobalDataKey]
      ).toBeDefined()
      const fn = eleventyConfig.globalData[statsBreakdownGlobalDataKey]

      const breakdown = await fn()

      expect(breakdown.length).toBeLessThanOrEqual(statsBreakdownLimit)
      breakdown.forEach((d) => {
        expect(d.page).toBeDefined()
        expect(d[statsBreakdownMetrics]).toBeDefined()
      })
    },
    timeoutMs
  )
})
