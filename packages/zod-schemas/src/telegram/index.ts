import { z } from 'zod'

export const bot_token = z.string().min(1).describe('Telegram bot token')

export const chat_id = z
  .union([z.number(), z.string().min(1)])
  .describe('Telegram chat ID')

export type ChatId = z.infer<typeof chat_id>

export const text = z
  .string()
  .min(1)
  .max(4096)
  .describe('Text message for a Telegram chat')
