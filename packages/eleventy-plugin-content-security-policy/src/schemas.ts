import Joi from 'joi'
import { directives as directives_schema } from '@jackdbd/content-security-policy/schemas'

const glob_pattern = Joi.string().min(1)

const glob_patterns = Joi.array().items(glob_pattern)

export interface Options {
  allowDeprecatedDirectives: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  directives: any
  globPatterns: string[]
  globPatternsDetach: string[]
  excludePatterns: string[]
  includePatterns: string[]
  jsonRecap: boolean
  reportOnly: boolean
}

/**
 * Default options for the plugin.
 *
 * @public
 */
export const DEFAULT_OPTIONS: Options = {
  allowDeprecatedDirectives: false,
  directives: {},
  globPatterns: ['/', '/*/'],
  globPatternsDetach: [],
  excludePatterns: [],
  includePatterns: ['/**/**.html'],
  jsonRecap: false,
  reportOnly: false
}

// TODO: why is this async? I can't remember
export const makePluginOptions = async () => {
  const pluginOptions = Joi.object().keys({
    allowDeprecatedDirectives: Joi.boolean().default(
      DEFAULT_OPTIONS.allowDeprecatedDirectives
    ),

    directives: directives_schema.default(DEFAULT_OPTIONS.directives),

    excludePatterns: glob_patterns.default(DEFAULT_OPTIONS.excludePatterns),

    globPatterns: glob_patterns.min(1).default(DEFAULT_OPTIONS.globPatterns),

    // https://developers.cloudflare.com/pages/platform/headers/#detach-a-header
    globPatternsDetach: glob_patterns.default(
      DEFAULT_OPTIONS.globPatternsDetach
    ),

    includePatterns: glob_patterns
      .min(1)
      .default(DEFAULT_OPTIONS.includePatterns),

    jsonRecap: Joi.boolean().default(DEFAULT_OPTIONS.jsonRecap),

    reportOnly: Joi.boolean().default(DEFAULT_OPTIONS.reportOnly)
  })

  return pluginOptions
}
