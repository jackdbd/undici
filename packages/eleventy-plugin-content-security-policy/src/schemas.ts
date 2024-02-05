import { z } from 'zod'
import { directives as directives_schema } from '@jackdbd/content-security-policy/schemas'
import { DEFAULT_OPTIONS } from './constants.js'

const glob_pattern = z.string().min(1)

const glob_patterns = z.array(glob_pattern)

export const config = z
  .object({
    allowDeprecatedDirectives: z
      .boolean()
      .default(DEFAULT_OPTIONS.allowDeprecatedDirectives)
      .describe(
        'Whether to allow deprecated directives in your Content-Security-Policy (or Content-Security-Policy-Report-Only) header.'
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

    jsonRecap: z.boolean().default(DEFAULT_OPTIONS.jsonRecap),

    reportOnly: z.boolean().default(DEFAULT_OPTIONS.reportOnly)
  })
  .describe('Options for eleventy-plugin-content-security-policy')

/**
 * Options for this Eleventy plugin.
 *
 * @public
 */
export const options = config.default(DEFAULT_OPTIONS)

/**
 * Plugin options.
 *
 * @public
 * @interface
 */
export type Options = z.infer<typeof options>
