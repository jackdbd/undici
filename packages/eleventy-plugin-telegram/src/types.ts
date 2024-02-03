/**
 * Telegram chat.
 *
 * @public
 * @see [Chat - Telegram Bot API](https://core.telegram.org/bots/api#chat)
 */
export interface Chat {
  description?: string
  first_name?: string
  id: number | string
  last_name?: string
  title?: string
  type: 'private' | 'group' | 'supergroup' | 'channel'
  username?: string
}

/**
 * Telegram user or bot.
 *
 * @public
 * @see [User - Telegram Bot API](https://core.telegram.org/bots/api#user)
 */
export interface User {
  first_name: string
  id: number
  is_bot: boolean
  last_name?: string
  username?: string
}

export interface TelegramAPISendMessageError {
  description: string
  error_code: number
  ok: false
}

export interface TelegramAPISendMessageSuccess {
  ok: true
  result: {
    chat: Chat
    date: number // unix timestamp
    from: User
    message_id: number
    text?: string
  }
}

export type TelegramAPISendMessageResponseBody =
  | TelegramAPISendMessageError
  | TelegramAPISendMessageSuccess

// https://core.telegram.org/bots/api#message
