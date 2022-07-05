const Eleventy = require('@11ty/eleventy/src/Eleventy')
const { telegramPlugin } = require('../lib/index.js')

describe('telegramPlugin', () => {
  let chatId
  let token
  beforeAll(() => {
    const parsed = JSON.parse(process.env.TELEGRAM)
    chatId = parsed.chat_id
    token = parsed.token
  })

  let eleventyConfig
  beforeEach(() => {
    const eleventy = new Eleventy()
    eleventyConfig = eleventy.eleventyConfig.userConfig
  })

  it('throws when `chatId` is not provided', () => {
    const userConfig = {}

    expect(() => {
      telegramPlugin(eleventyConfig, userConfig)
    }).toThrowError('"chatId" is required')
  })

  it('throws when `token` is not provided', () => {
    const userConfig = { chatId }

    expect(() => {
      telegramPlugin(eleventyConfig, userConfig)
    }).toThrowError('"token" is required')
  })

  it('adds one `eleventy.after` event handler by default', () => {
    const userConfig = { chatId, token }

    expect(eleventyConfig.events._events['eleventy.before']).not.toBeDefined()
    expect(eleventyConfig.events._events['eleventy.after']).not.toBeDefined()

    telegramPlugin(eleventyConfig, userConfig)

    expect(eleventyConfig.events._eventsCount).toBe(1)
    expect(eleventyConfig.events._events['eleventy.before']).not.toBeDefined()
    expect(eleventyConfig.events._events['eleventy.after']).toBeDefined()
  })

  it('allows `textBeforeBuild` to be `undefined`', () => {
    const userConfig = {
      chatId,
      token,
      textBeforeBuild: undefined
    }

    expect(() => {
      telegramPlugin(eleventyConfig, userConfig)
    }).not.toThrow()
  })

  it('adds only one `eleventy.after` event handler when `textBeforeBuild` is undefined', () => {
    const userConfig = {
      chatId,
      token,
      textBeforeBuild: undefined
    }

    expect(eleventyConfig.events._events['eleventy.before']).not.toBeDefined()
    expect(eleventyConfig.events._events['eleventy.after']).not.toBeDefined()

    telegramPlugin(eleventyConfig, userConfig)

    expect(eleventyConfig.events._eventsCount).toBe(1)
    expect(eleventyConfig.events._events['eleventy.before']).not.toBeDefined()
    expect(eleventyConfig.events._events['eleventy.after']).toBeDefined()
  })

  it('adds only one `eleventy.before` event handler when `textAfterBuild` is undefined', () => {
    const userConfig = {
      chatId,
      token,
      textBeforeBuild: '<b>start</b> 11ty site build'
    }

    expect(eleventyConfig.events._events['eleventy.before']).not.toBeDefined()
    expect(eleventyConfig.events._events['eleventy.after']).not.toBeDefined()

    telegramPlugin(eleventyConfig, userConfig)

    expect(eleventyConfig.events._eventsCount).toBe(1)
    expect(eleventyConfig.events._events['eleventy.before']).toBeDefined()
    expect(eleventyConfig.events._events['eleventy.after']).not.toBeDefined()
  })
})
