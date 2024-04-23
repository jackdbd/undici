import assert from 'node:assert'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  defEleventy,
  ELEVENTY_INITIAL_EVENTS_COUNT
} from '@jackdbd/eleventy-test-utils'
import { telegramPlugin } from '../lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const FILE_NAME = path.basename(__filename)
const PACKAGE_ROOT = path.join(__filename, '..', '..')
const PACKAGE_NAME = path.basename(PACKAGE_ROOT)

const TEXT_BEFORE_BUILD = [
  `🧪 <b>Test message</b>`,
  `This is a test message for <code>textBeforeBuild</code> defined in <code>${FILE_NAME}</code>.`,
  `Sent by <code>${PACKAGE_NAME}</code>`
].join('\n\n')

const TEXT_AFTER_BUILD = [
  `🧪 <b>Test message</b>`,
  `This is a test message for <code>textAfterBuild</code> defined in <code>${FILE_NAME}</code>.`,
  `Sent by <code>${PACKAGE_NAME}</code>`
].join('\n\n')

const credentials = () => {
  const parsed = JSON.parse(process.env.TELEGRAM)
  return { chat_id: parsed.chat_id, token: parsed.token }
}

const setValidChatId = () => {
  process.env.TELEGRAM_CHAT_ID = credentials().chat_id
}

const setValidToken = () => {
  process.env.TELEGRAM_BOT_TOKEN = credentials().token
}

const setValidEnvironmentVariables = () => {
  const { chat_id, token } = credentials()
  process.env.TELEGRAM_CHAT_ID = chat_id
  process.env.TELEGRAM_BOT_TOKEN = token
}

const setInvalidEnvironmentVariables = () => {
  process.env.TELEGRAM_CHAT_ID = 'invalid-chat-id'
  process.env.TELEGRAM_BOT_TOKEN = 'invalid-bot-token'
}

const setEmptyEnvironmentVariables = () => {
  process.env.TELEGRAM_CHAT_ID = ''
  process.env.TELEGRAM_BOT_TOKEN = ''
}

describe('telegramPlugin', () => {
  it('allows empty user config that registers no event handlers (valid env vars for Telegram chat_id/token)', async () => {
    setValidEnvironmentVariables()
    const eleventy = await defEleventy({
      plugin: telegramPlugin
    })
    const userConfig = eleventy.eleventyConfig.userConfig
    assert.equal(userConfig.plugins.length, 1)
    assert.equal(userConfig.events._eventsCount, ELEVENTY_INITIAL_EVENTS_COUNT)
  })

  it('allows empty user config that registers no event handlers (valid env vars variables for Telegram chat_id/token)', async () => {
    // when Telegram chat_id and token are invalid, no message will be delivered
    // to the Telegram chat, but this plugin will not throw any error (use DEBUG
    // to see the error messages returned by the Telegram API)
    setInvalidEnvironmentVariables()
    const eleventy = await defEleventy({
      plugin: telegramPlugin
    })
    const userConfig = eleventy.eleventyConfig.userConfig
    assert.equal(userConfig.plugins.length, 1)
    assert.equal(userConfig.events._eventsCount, ELEVENTY_INITIAL_EVENTS_COUNT)
  })

  it('rejects with the expected error message when the Telegram bot token is not provided', async () => {
    setEmptyEnvironmentVariables()
    setValidChatId()
    await assert.rejects(
      () => {
        return defEleventy({
          plugin: telegramPlugin,
          pluginConfig: { token: undefined }
        })
      },
      (err) => {
        assert.match(
          err.message,
          /Error processing the `telegramPlugin` plugin/
        )
        assert.match(err.originalError.message, /token not set/)
        return true
      }
    )
  })

  it('rejects with the expected error message when the Telegram Chat ID is not provided', async () => {
    setEmptyEnvironmentVariables()
    setValidToken()
    await assert.rejects(
      () => {
        return defEleventy({
          plugin: telegramPlugin,
          pluginConfig: { chat_id: undefined }
        })
      },
      (err) => {
        assert.match(
          err.message,
          /Error processing the `telegramPlugin` plugin/
        )
        assert.match(err.originalError.message, /Chat ID not set/)
        return true
      }
    )
  })

  it('adds only an `eleventy.before` event handler if only `textBeforeBuild` is set', async () => {
    const { chat_id, token } = credentials()
    const eleventy = await defEleventy({
      plugin: telegramPlugin,
      pluginConfig: {
        chatId: chat_id,
        token,
        textBeforeBuild: TEXT_BEFORE_BUILD
      }
    })
    const userConfig = eleventy.eleventyConfig.userConfig
    assert.equal(
      userConfig.events._eventsCount,
      ELEVENTY_INITIAL_EVENTS_COUNT + 1
    )
  })

  it('adds only an `eleventy.after` event handler if only `textAfterBuild` is set', async () => {
    const { chat_id, token } = credentials()
    const eleventy = await defEleventy({
      plugin: telegramPlugin,
      pluginConfig: {
        chatId: chat_id,
        token,
        textAfterBuild: TEXT_AFTER_BUILD
      }
    })
    const userConfig = eleventy.eleventyConfig.userConfig
    assert.equal(
      userConfig.events._eventsCount,
      ELEVENTY_INITIAL_EVENTS_COUNT + 1
    )
  })
})
