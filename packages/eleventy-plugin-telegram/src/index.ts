import defDebug from 'debug'
import { fromZodError } from 'zod-validation-error'
import type { EleventyConfig, EventArguments } from '@11ty/eleventy'
import { DEBUG_PREFIX, ERR_PREFIX } from './constants.js'
import { options as schema } from './schemas.js'
import type { Options, SendMessageConfig } from './schemas.js'
import { sendMessage } from './send-message.js'

// exports for TypeDoc
export type { EleventyConfig } from '@11ty/eleventy'
export type { Options } from './schemas.js'
// export { telegram_text } from './schemas.js'

const debug = defDebug(`${DEBUG_PREFIX}:index`)

/**
 * @internal
 */
const defEleventyEventHandler = (config: SendMessageConfig) => {
  debug(`create Eleventy event handler`)
  return async (arg: EventArguments) => {
    debug(`current Eleventy project directories %o`, arg.dir)
    const { message } = await sendMessage(config)
    debug(message)
  }
}

/**
 * Plugin that sends Telegram messages when Eleventy starts/finishes building
 * your site.
 *
 * @public
 * @param eleventyConfig - {@link EleventyConfig | Eleventy configuration}.
 * @param options - Plugin {@link Options | options}.
 *
 * @remarks
 * The [Telegram sendMessage API](https://core.telegram.org/bots/api#sendmessage)
 * allows text messages of 1-4096 characters (after entities parsing).
 */
export const telegramPlugin = (
  eleventyConfig: EleventyConfig,
  options?: Options
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { token: options_minus_token, ...safe_options } = options || {}
  debug('plugin options provided by user (token not shown) %O', safe_options)

  const result = schema.safeParse(options)

  if (!result.success) {
    const err = fromZodError(result.error)
    throw new Error(`${ERR_PREFIX} ${err.toString()}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { token: config_minus_token, ...safe_config } = result.data
  debug(
    'plugin options provided by user + defaults (token not shown) %O',
    safe_config
  )

  const { textBeforeBuild, textAfterBuild } = result.data
  const chatId = result.data.chatId || process.env.TELEGRAM_CHAT_ID
  const token = result.data.token || process.env.TELEGRAM_BOT_TOKEN

  if (!chatId) {
    throw new Error(`${ERR_PREFIX} Telegram Chat ID not set`)
  }
  if (!token) {
    throw new Error(`${ERR_PREFIX} Telegram bot token not set`)
  }

  if (textBeforeBuild) {
    const onBefore = defEleventyEventHandler({
      chatId,
      text: textBeforeBuild,
      token
    })
    eleventyConfig.on('eleventy.before', onBefore)
    debug('attached `eleventy.before` event handler')
  }

  if (textAfterBuild) {
    const onAfter = defEleventyEventHandler({
      chatId,
      text: textAfterBuild,
      token
    })
    eleventyConfig.on('eleventy.after', onAfter)
    debug('attached `eleventy.after` event handler')
  }
}
