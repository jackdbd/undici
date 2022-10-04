const Joi = require('joi')
const cspSchemasPromise = import('@jackdbd/content-security-policy/schemas')

const glob_pattern = Joi.string().min(1)

const glob_patterns = Joi.array().items(glob_pattern)

const defaultOptions = {
  allowDeprecatedDirectives: false,
  directives: {},
  globPatterns: ['/', '/*/'],
  globPatternsDetach: [],
  excludePatterns: [],
  includePatterns: ['/**/**.html'],
  jsonRecap: false,
  reportOnly: false
}

const makePluginOptions = async () => {
  const { directives: directives_schema } = await cspSchemasPromise

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

module.exports = { defaultOptions, makePluginOptions }
