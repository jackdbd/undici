export const DEBUG_PREFIX = '11ty-plugin:csp'

export const ERR_PREFIX = '[❌ 11ty-plugin-content-security-policy]'
export const WARN_PREFIX = '[⚠️ 11ty-plugin-content-security-policy]'
export const OK_PREFIX = '[📝 11ty-plugin-content-security-policy]'

/**
 * Default options for the plugin.
 *
 * @public
 */
export const DEFAULT_OPTIONS = {
  allowDeprecatedDirectives: false,
  // TODO: allowExperimentalDirectives: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  directives: {} as any,
  excludePatterns: [],
  globPatterns: ['/*'],
  globPatternsDetach: [],
  hosting: undefined as string | undefined,
  includePatterns: ['/**/**.html'],
  jsonRecap: false,
  reportOnly: false
}

export const SUPPORTED_HOSTING_PROVIDERS = new Set([
  'cloudflare-pages',
  'netlify',
  'vercel'
])
