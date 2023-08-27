const Eleventy = require('@11ty/eleventy/src/Eleventy')
const { webmentionPlugin } = require('../lib/index.js')

describe('webmentionPlugin', () => {
  let eleventyConfig
  beforeEach(() => {
    const eleventy = new Eleventy()
    eleventyConfig = eleventy.eleventyConfig.userConfig
  })

  it('throws when `domain` is not defined', () => {
    const userConfig = { domain: undefined }

    expect(() => {
      webmentionPlugin(eleventyConfig, userConfig)
    }).toThrowError('You must provide your Webmention.io domain')
  })

  it('throws when `domain` starts with https://', () => {
    const userConfig = { domain: 'https://example.com' }

    expect(() => {
      webmentionPlugin(eleventyConfig, userConfig)
    }).toThrowError('Invalid domain')
  })

  it('throws when `token` is not defined', () => {
    const userConfig = { domain: 'example.com', token: undefined }

    expect(() => {
      webmentionPlugin(eleventyConfig, userConfig)
    }).toThrowError('You must provide your Webmention.io token')
  })

  it('adds webmentionsSentToDomain to eleventyConfig.globalData', () => {
    expect(eleventyConfig.globalData.webmentionsSentToDomain).not.toBeDefined()

    webmentionPlugin(eleventyConfig, {
      domain: 'example.com',
      token: process.env.WEBMENTION_IO_TOKEN
    })

    expect(eleventyConfig.globalData.webmentionsSentToDomain).toBeDefined()
  })
})
