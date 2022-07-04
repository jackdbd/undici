import Joi from 'joi'
import phin from 'phin'
import makeDebug from 'debug'
import { PREFIX } from './constants.js'
import { telegram_chat_id, telegram_token, telegram_text } from './schemas.js'
import type {
  ChatId,
  SendMessageResponseBody,
  TelegramAPISendMessageSuccess,
  TelegramAPISendMessageError
} from './types.js'

const debug = makeDebug('eleventy-telegram-plugin/send-message')

export interface SendMessageConfig {
  chatId: ChatId
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
    const response = await phin<SendMessageResponseBody>({
      data: {
        chat_id,
        disable_notification: true,
        disable_web_page_preview: false,
        parse_mode: 'HTML',
        text
      },
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      parse: 'json',
      // https://core.telegram.org/bots/api#sendmessage
      url: `https://api.telegram.org/bot${token}/sendMessage`
    })

    if (!response.body.ok) {
      const b = response.body as TelegramAPISendMessageError
      debug(
        `Telegram message was NOT sent to chat id ${chat_id}. Original Telegram API response: %O`,
        b
      )
      return {
        delivered: false,
        message: `${PREFIX} ${b.description} (error code ${b.error_code})`
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
        message: `${PREFIX} message id ${r.message_id} delivered to chat id ${r.chat.id} (username ${r.chat.username}) by bot ${r.from.first_name}`
      }
    }
  } catch (err: any) {
    debug(`${PREFIX}❌ ${err.message}`)
  }
}
