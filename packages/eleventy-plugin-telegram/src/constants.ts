export const DEBUG_PREFIX = '11ty-plugin:telegram'

export const OK_PREFIX = '[💬 11ty-plugin-telegram]'
const ERR_PREFIX = '[❌ 11ty-plugin-telegram]'

export const ERROR_MESSAGE_PREFIX = {
  invalidConfiguration: `${ERR_PREFIX} INVALID CONFIGURATION`,
  couldNotCallTelegramAPI: `${ERR_PREFIX} COULD NOT CALL TELEGRAM API`,
  telegramAPIDidNotRespondOk: `${ERR_PREFIX} TELEGRAM API DID NOT RESPOND OK`
}

export const DEFAULT = {
  TEXT_BEFORE_BUILD: `🏎️ 11ty has <b>started</b> building the site`,
  TEXT_AFTER_BUILD: `🏁 11ty has <b>finished</b> building the site`
}
