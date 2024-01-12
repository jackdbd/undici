export const DEBUG_PREFIX = '11ty-plugin:ensure-env-vars'

export const OK_PREFIX = '[🕵️ 11ty-plugin-ensure-env-vars]'
const ERR_PREFIX = '[❌ 11ty-plugin-ensure-env-vars]'

export const ERROR_MESSAGE_PREFIX = {
  invalidConfiguration: `${ERR_PREFIX} INVALID CONFIGURATION`,
  invalidEnvironment: `${ERR_PREFIX} INVALID ENVIRONMENT`
}
