import makeDebug from 'debug'
import Joi from 'joi'
import type { EleventyConfig } from '@panoply/11ty'
import { DEFAULT, PREFIX } from './constants.js'
import { telegram_chat_id, telegram_token, telegram_text } from './schemas.js'
import { sendMessage } from './send-message.js'
import type { SendMessageConfig } from './send-message.js'
import type { ChatId } from './types.js'

const debug = makeDebug('eleventy-telegram-plugin/index')

const makeEleventyEventHandler = (
  _eleventyConfig: EleventyConfig,
  config: SendMessageConfig
) => {
  // partial application, to obtain a niladic function
  return sendMessage.bind(null, config)
}

export interface Options {
  chatId: ChatId
  token: string
  textBeforeBuild: string
  textAfterBuild: string
}

const options_schema = Joi.object().keys({
  chatId: telegram_chat_id.required(),
  token: telegram_token.required(),
  textBeforeBuild: Joi.alternatives().conditional('textAfterBuild', {
    is: Joi.exist(),
    then: telegram_text.optional(),
    otherwise: telegram_text.optional()
  }),
  textAfterBuild: Joi.alternatives().conditional('textBeforeBuild', {
    is: Joi.exist(),
    then: telegram_text.optional(),
    otherwise: telegram_text.default(DEFAULT.TEXT_AFTER_BUILD)
  })
})

export const telegramPlugin = (
  eleventyConfig: EleventyConfig,
  options: Options
) => {
  const result = options_schema.validate(options)
  if (result.error) {
    const message = `${PREFIX} invalid configuration: ${result.error.message}`
    throw new Error(message)
  }

  const { chatId, token, textBeforeBuild, textAfterBuild } =
    result.value as Required<Options>

  // https://www.11ty.dev/docs/events/#event-arguments
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
