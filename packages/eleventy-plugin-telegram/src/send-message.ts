import Joi from 'joi'
import makeDebug from 'debug'
import { DEBUG_PREFIX, ERROR_MESSAGE_PREFIX, OK_PREFIX } from './constants.js'
import { telegram_chat_id, telegram_token, telegram_text } from './schemas.js'
import type {
  TelegramAPISendMessageSuccess,
  TelegramAPISendMessageError
} from './types.js'

const debug = makeDebug(`${DEBUG_PREFIX}:send-message`)

export interface SendMessageConfig {
  chatId: number | string
  token: string
  text: string
}

const config_schema = Joi.object().keys({
  chatId: telegram_chat_id.required(),
  token: telegram_token.required(),
  text: telegram_text.required()
})

export const sendMessage = async (config: SendMessageConfig) => {
  const result = config_schema.validate(config)
  if (result.error) {
    throw new Error(`${result.error.message}`)
  }

  const { chatId: chat_id, token, text } = config

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id,
          disable_notification: true,
          disable_web_page_preview: false,
          parse_mode: 'HTML',
          text
        })
      }
    )

    const response = await res.json()

    if (!response.body.ok) {
      const b = response.body as TelegramAPISendMessageError
      debug(
        `Telegram message was NOT sent to chat id ${chat_id}. Original Telegram API response: %O`,
        b
      )
      return {
        delivered: false,
        message: `${ERROR_MESSAGE_PREFIX.telegramAPIDidNotRespondOk}: ${b.description} (error code ${b.error_code})`
      }
    } else {
      const b = response.body as TelegramAPISendMessageSuccess
      debug(
        `Telegram message delivered to chat id ${chat_id}. Original Telegram API response: %O`,
        b
      )
      const r = b.result
      return {
        delivered: true,
        deliveredAt: new Date(r.date * 1000).toISOString(),
        message: `${OK_PREFIX} message id ${r.message_id} delivered to chat id ${r.chat.id} (username ${r.chat.username}) by bot ${r.from.first_name}`
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    debug(`${ERROR_MESSAGE_PREFIX.couldNotCallTelegramAPI}: ${err.message}`)
  }
}
