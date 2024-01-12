export const DEBUG_PREFIX = '11ty-plugin:telegram'

export const OK_PREFIX = '[💬 11ty-plugin-telegram]'
export const ERR_PREFIX = '[❌ 11ty-plugin-telegram]'

export const ERROR_MESSAGE_PREFIX = {
  failedToFetchAPI: `${ERR_PREFIX} failed to fetch Telegram API`,
  failedToParseAPIResponse: `${ERR_PREFIX} failed to parse JSON response received from Telegram API`,
  telegramAPIDidNotRespondOk: `${ERR_PREFIX} Telegram API did not respond with OK`
}
