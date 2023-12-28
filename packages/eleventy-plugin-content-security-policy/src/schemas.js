import Joi from 'joi'
import { directives as directives_schema } from '@jackdbd/content-security-policy/schemas'

const glob_pattern = Joi.string().min(1)

const glob_patterns = Joi.array().items(glob_pattern)

export const defaultOptions = {
  allowDeprecatedDirectives: false,
  directives: {},
  globPatterns: ['/', '/*/'],
  globPatternsDetach: [],
  excludePatterns: [],
  includePatterns: ['/**/**.html'],
  jsonRecap: false,
  reportOnly: false
}

export const makePluginOptions = async () => {
  const pluginOptions = Joi.object().keys({
    allowDeprecatedDirectives: Joi.boolean().default(
      defaultOptions.allowDeprecatedDirectives
    ),

    directives: directives_schema.default(defaultOptions.directives),

    excludePatterns: glob_patterns.default(defaultOptions.excludePatterns),

    globPatterns: glob_patterns.min(1).default(defaultOptions.globPatterns),

    // https://developers.cloudflare.com/pages/platform/headers/#detach-a-header
    globPatternsDetach: glob_patterns.default(
      defaultOptions.globPatternsDetach
    ),

    includePatterns: glob_patterns
      .min(1)
      .default(defaultOptions.includePatterns),

    jsonRecap: Joi.boolean().default(defaultOptions.jsonRecap),

    reportOnly: Joi.boolean().default(defaultOptions.reportOnly)
  })

  return pluginOptions
}
