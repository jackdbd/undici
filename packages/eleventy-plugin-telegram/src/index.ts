import makeDebug from 'debug'
import { fromZodError } from 'zod-validation-error'
import { DEBUG_PREFIX, ERR_PREFIX } from './constants.js'
import { options as schema } from './schemas.js'
import type { Options } from './schemas.js'
import { sendMessage } from './send-message.js'
import type { SendMessageConfig } from './send-message.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EleventyConfig = any

const debug = makeDebug(`${DEBUG_PREFIX}:index`)

const makeEleventyEventHandler = (
  _eleventyConfig: EleventyConfig,
  config: SendMessageConfig
) => {
  // partial application
  return sendMessage.bind(null, config)
}

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
  const token = result.data.token || process.env.TELEGRAM_TOKEN

  if (!chatId) {
    throw new Error(`${ERR_PREFIX} Telegram Chat ID not set`)
  }
  if (!token) {
    throw new Error(`${ERR_PREFIX} Telegram bot token not set`)
  }

  if (textBeforeBuild) {
    const onBefore = makeEleventyEventHandler(eleventyConfig, {
      chatId,
      text: textBeforeBuild,
      token
    })
    eleventyConfig.on('eleventy.before', onBefore)
    debug('attached `eleventy.before` event handler')
  }

  if (textAfterBuild) {
    const onAfter = makeEleventyEventHandler(eleventyConfig, {
      chatId,
      text: textAfterBuild,
      token
    })
    eleventyConfig.on('eleventy.after', onAfter)
    debug('attached `eleventy.after` event handler')
  }
}
