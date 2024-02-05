import defDebug from 'debug'
import { fromZodError } from 'zod-validation-error'
import {
  DEBUG_PREFIX,
  ERROR_MESSAGE_PREFIX,
  OK_PREFIX,
  ERR_PREFIX
} from './constants.js'
import { send_message_config as schema } from './schemas.js'
import type { SendMessageConfig } from './schemas.js'
import type { TelegramAPISendMessageResponseBody } from './types.js'

const debug = defDebug(`${DEBUG_PREFIX}:send-message`)

/**
 * @internal
 */
export const sendMessage = async (config: SendMessageConfig) => {
  debug('validating sendMessage config')
  const result = schema.safeParse(config)

  if (!result.success) {
    const err = fromZodError(result.error)
    throw new Error(`${ERR_PREFIX} ${err.toString()}`)
  }

  debug('validated sendMessage config')

  const { chatId: chat_id, token, text } = result.data

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let res: any // how to import the Response type/interface?
  try {
    if (process.env.SIMULATE_API_CALL_FAILURE) {
      throw new Error('SIMULATE_API_CALL_FAILURE')
    }
    res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        disable_notification: true,
        disable_web_page_preview: false,
        parse_mode: 'HTML',
        text
      })
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const message = `${ERROR_MESSAGE_PREFIX.failedToFetchAPI}: ${err.message}`
    debug(message)
    return { delivered: false, message }
  }

  let body: TelegramAPISendMessageResponseBody

  try {
    if (process.env.SIMULATE_API_RESPONSE_PARSING_FAILURE) {
      throw new Error('SIMULATE_API_RESPONSE_PARSING_FAILURE')
    }
    body = await res.json()

    if (!body.ok) {
      debug(
        `Telegram message was NOT sent to chat id ${chat_id}. Original Telegram API response: %O`,
        body
      )
      return {
        delivered: false,
        message: `${ERROR_MESSAGE_PREFIX.telegramAPIDidNotRespondOk}: ${body.description} (error code ${body.error_code})`
      }
    } else {
      debug(
        `Telegram message delivered to chat id ${chat_id}. Original Telegram API response: %O`,
        body
      )
      const r = body.result
      return {
        // We assume our message was delivered, but we can't be 100% sure about it.
        // We called the Telegram API and got an HTTP 200 back. This means that
        // Telegram sent the message to our chat. But we don't actually know if
        // Telegram managed to deliver the message.
        delivered: true,
        deliveredAt: new Date(r.date * 1000).toISOString(),
        message: `${OK_PREFIX} message id ${r.message_id} delivered to chat id ${r.chat.id} (username ${r.chat.username}) by bot ${r.from.first_name}`
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const message = `${ERROR_MESSAGE_PREFIX.failedToParseAPIResponse}: ${err.message}`
    debug(message)
    return { delivered: false, message }
  }
}
