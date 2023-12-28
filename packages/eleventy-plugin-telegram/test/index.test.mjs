import assert from 'node:assert'
import { describe, it, before } from 'node:test'
import { updatedEleventyConfig } from '@jackdbd/eleventy-test-utils'
import { telegramPlugin } from '../lib/index.js'

describe('telegramPlugin', () => {
  let chatId
  let token
  before(() => {
    const parsed = JSON.parse(process.env.TELEGRAM)
    chatId = parsed.chat_id
    token = parsed.token
  })

  it('throws when `chatId` is not provided', () => {
    const eleventyConfig = undefined
    const userConfig = {}

    assert.throws(
      () => {
        telegramPlugin(eleventyConfig, userConfig)
      },
      { message: /"chatId" is required/ }
    )
  })

  it.only('throws when `token` is not provided', () => {
    const eleventyConfig = undefined
    const userConfig = { chatId }

    assert.throws(
      () => {
        telegramPlugin(eleventyConfig, userConfig)
      },
      { message: /"token" is required/ }
    )
  })

  it('adds one `eleventy.after` event handler by default', async () => {
    const updatedConfig = await updatedEleventyConfig({
      plugin: telegramPlugin,
      pluginConfig: { chatId, token }
    })

    assert.equal(updatedConfig.events._eventsCount, 2)
    assert.equal(updatedConfig.events._events['eleventy.before'], undefined)
    assert.notEqual(updatedConfig.events._events['eleventy.after'], undefined)
  })

  it('allows `textBeforeBuild` to be `undefined`', () => {
    assert.doesNotReject(() => {
      return updatedEleventyConfig({
        plugin: telegramPlugin,
        pluginConfig: {
          chatId,
          token,
          textBeforeBuild: undefined
        }
      })
    })
  })

  it('adds only one `eleventy.after` event handler when `textBeforeBuild` is undefined', async () => {
    const updatedConfig = await updatedEleventyConfig({
      plugin: telegramPlugin,
      pluginConfig: {
        chatId,
        token,
        textBeforeBuild: undefined
      }
    })

    assert.equal(updatedConfig.events._eventsCount, 2)
    assert.equal(updatedConfig.events._events['eleventy.before'], undefined)
    assert.notEqual(updatedConfig.events._events['eleventy.after'], undefined)
  })

  it('adds only one `eleventy.before` event handler when `textAfterBuild` is undefined', async () => {
    const updatedConfig = await updatedEleventyConfig({
      plugin: telegramPlugin,
      pluginConfig: {
        chatId,
        token,
        textBeforeBuild: '<b>start</b> 11ty site build'
      }
    })

    assert.equal(updatedConfig.events._eventsCount, 2)
    assert.notEqual(updatedConfig.events._events['eleventy.before'], undefined)
    assert.equal(updatedConfig.events._events['eleventy.after'], undefined)
  })
})
