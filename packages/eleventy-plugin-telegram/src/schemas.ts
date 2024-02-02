import { z } from 'zod'

export const telegram_bot_token = z
  .string()
  .min(1)
  .describe('Telegram bot token')

/**
 * Telegram text message.
 *
 * @public
 *
 * @remarks
 * The [Telegram sendMessage API](https://core.telegram.org/bots/api#sendmessage)
 * allows text messages of 1-4096 characters (after entities parsing).
 */
export const telegram_text = z
  .string()
  .min(1)
  .max(4096)
  .describe('Text message for a Telegram chat')

export const telegram_chat_id = z
  .union([z.number(), z.string().min(1)])
  .describe('Telegram chat ID')

export const send_message_config = z.object({
  chatId: telegram_chat_id,
  token: telegram_bot_token,
  text: telegram_text
})

/**
 * @internal
 */
export type SendMessageConfig = z.infer<typeof send_message_config>

/**
 * Options for this Eleventy plugin.
 *
 * @public
 */
export const options = z.object({
  /**
   * Telegram chat ID.
   *
   * @remarks
   * The Telegram chat ID is negative for a **group** chat, positive for a
   * **username** chat.
   */
  chatId: telegram_chat_id.optional().describe('Telegram chat ID'),

  /**
   * Telegram bot token.
   *
   * @remarks
   * If you forgot the API token of a Telegram bot you created, you can
   * retrieve it at any time using BotFather. Just go to:
   *
   * ```text
   * BotFather > bot list > API token
   * ```
   */
  token: telegram_bot_token.optional().describe('Telegram bot token'),

  /**
   * Text message to send when Eleventy starts building your site.
   */
  textBeforeBuild: telegram_text
    .optional()
    .describe('Text message to send when Eleventy starts building your site'),

  /**
   * Text message to send when Eleventy finishes building your site.
   */
  textAfterBuild: telegram_text
    .optional()
    .describe('Text message to send when Eleventy finishes building your site')
})

/**
 * Plugin options.
 *
 * @public
 * @interface
 */
export type Options = z.infer<typeof options>
