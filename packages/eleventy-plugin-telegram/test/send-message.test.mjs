import assert from 'node:assert'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { sendMessage } from '../lib/send-message.js'

const __filename = fileURLToPath(import.meta.url)
const FILE_NAME = path.basename(__filename)
const PACKAGE_ROOT = path.join(__filename, '..', '..')
const PACKAGE_NAME = path.basename(PACKAGE_ROOT)

const TEST_MESSAGE = [
  `🧪 <b>Test message</b>`,
  `This is a test message defined in <code>${FILE_NAME}</code>.`,
  `Sent by <code>${PACKAGE_NAME}</code>`
].join('\n\n')

const credentials = () => {
  const parsed = JSON.parse(process.env.TELEGRAM)
  return { chat_id: parsed.chat_id, token: parsed.token }
}

const resetEnvironmentVariables = () => {
  process.env.SIMULATE_API_CALL_FAILURE = ''
  process.env.SIMULATE_API_RESPONSE_PARSING_FAILURE = ''
}

const givenThatTelegramAPIIsDown = () => {
  process.env.SIMULATE_API_CALL_FAILURE = true
}

const givenThatTelegramAPIResponseIsBroken = () => {
  process.env.SIMULATE_API_RESPONSE_PARSING_FAILURE = true
}

describe('sendMessage', () => {
  it('rejects with the expected error message when the Telegram chat_id/token are not provided)', async () => {
    resetEnvironmentVariables()

    await assert.rejects(
      () => {
        return sendMessage({
          chatId: undefined,
          token: undefined,
          text: TEST_MESSAGE
        })
      },
      (err) => {
        assert.match(err.message, /Validation error/)
        return true
      }
    )
  })

  it('delivers a message (valid env vars for Telegram chat_id/token)', async () => {
    resetEnvironmentVariables()

    const { chat_id, token } = credentials()

    const { message, delivered, deliveredAt } = await sendMessage({
      chatId: chat_id,
      token,
      text: TEST_MESSAGE
    })

    assert.equal(delivered, true)
    assert.notEqual(deliveredAt, undefined)
    assert.match(message, /delivered to chat/)
  })

  it('does not error even if Telegram API is down', async () => {
    resetEnvironmentVariables()
    givenThatTelegramAPIIsDown()

    const { chat_id, token } = credentials()

    const { message, delivered, deliveredAt } = await sendMessage({
      chatId: chat_id,
      token,
      text: TEST_MESSAGE
    })

    assert.equal(delivered, false)
    assert.equal(deliveredAt, undefined)
    assert.match(message, /failed to fetch/)
  })

  it('does not error even if Telegram API response is malformed', async () => {
    resetEnvironmentVariables()
    givenThatTelegramAPIResponseIsBroken()

    const { chat_id, token } = credentials()

    const { message, delivered, deliveredAt } = await sendMessage({
      chatId: chat_id,
      token,
      text: TEST_MESSAGE
    })

    assert.equal(delivered, false)
    assert.equal(deliveredAt, undefined)
    assert.match(message, /failed to parse JSON response/)
  })
})
