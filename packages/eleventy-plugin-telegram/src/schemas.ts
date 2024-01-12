import { z } from 'zod'

/**
 * Telegram bot token.
 */
export const telegram_token = z.string().min(1).describe('Telegram bot token')

/**
 * Telegram text message.
 */
export const telegram_text = z
  .string()
  .min(1)
  .max(4096)
  .describe('text message for a Telegram chat')

// Joi allowed to tags schemas with schema.tag(TAG). Not sure if there is anything similar in zod.
// Joi allowed to add notes to a schema with schema.note(). Not sure if there is anything similar in zod.
// .note('The Telegram sendMessage API allows text messages of 1-4096 characters after entities parsing')

/**
 * Telegram chat ID
 *
 * The Telegram chat ID is negative for a group chat, positive for a username chat.
 */
export const telegram_chat_id = z
  .union([z.number(), z.string().min(1)])
  .describe('Telegram chat ID')

export const send_message_config = z.object({
  chatId: telegram_chat_id,
  token: telegram_token,
  text: telegram_text
})

/**
 * Plugin options.
 *
 * @public
 */
export const options = z
  .optional(
    z.object({
      chatId: telegram_chat_id.optional(),
      token: telegram_token.optional(),
      textBeforeBuild: telegram_text.optional(),
      textAfterBuild: telegram_text.optional()
    })
  )
  .default({})

/**
 * @public
 */
export type Options = z.infer<typeof options>
