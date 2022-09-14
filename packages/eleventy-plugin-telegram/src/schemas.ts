import Joi from 'joi'

const TAG = 'telegram'

export const telegram_chat_id = Joi.alternatives()
  .try(Joi.number(), Joi.string().min(1))
  .description('Telegram chat id')
  .tag(TAG)
  .note(
    `The Telegram chat ID is negative for a group chat, positive for a username chat`
  )

export const telegram_token = Joi.string()
  .min(1)
  .description('Telegram bot token')
  .tag(TAG)

// https://core.telegram.org/bots/api#sendmessage
export const telegram_text = Joi.string()
  .min(1)
  .max(4096)
  .description('text message for a Telegram chat')
  .tag(TAG)
  .note(
    'The Telegram sendMessage API allows text messages of 1-4096 characters after entities parsing'
  )
