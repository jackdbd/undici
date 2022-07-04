import Joi from 'joi'

export const telegram_chat_id = Joi.alternatives().try(
  Joi.number(), // it's negative for a group chat, positive for a username chat
  Joi.string().min(1)
)

export const telegram_token = Joi.string().min(1)

export const telegram_text = Joi.string().min(1).max(4096)
