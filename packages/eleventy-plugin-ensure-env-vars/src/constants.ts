export const OK_PREFIX = '[🕵️ 11ty-plugin-ensure-env-vars]'
export const ERR_PREFIX = '[❌ 11ty-plugin-ensure-env-vars]'

export const DEBUG_PREFIX = '11ty-plugin:ensure-env-vars'

/**
 * @public
 *
 * @see [Eleventy Documentation variables supplied by Eleventy](https://www.11ty.dev/docs/environment-vars/#eleventy-supplied)
 * @see [NODE ENV=production is a lie](https://youtu.be/HMM7GJC5E2o?si=pqINtGh6JUVqUdjt)
 */
export const DEFAULT_ENV_VARS = [
  'ELEVENTY_ROOT',
  'ELEVENTY_SOURCE',
  'ELEVENTY_RUN_MODE'
]
