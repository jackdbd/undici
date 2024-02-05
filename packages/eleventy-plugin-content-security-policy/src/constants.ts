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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  directives: {} as any,
  globPatterns: ['/', '/*/'],
  globPatternsDetach: [],
  excludePatterns: [],
  includePatterns: ['/**/**.html'],
  jsonRecap: false,
  reportOnly: false
}
