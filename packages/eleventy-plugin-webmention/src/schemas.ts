import { z } from 'zod'
import {
  DEFAULT_BLACKLISTED,
  DEFAULT_CACHE_DIRECTORY,
  DEFAULT_CACHE_DURATION,
  DEFAULT_CACHE_VERBOSE,
  DEFAULT_SANITIZE_OPTIONS
} from './constants.js'

export const blacklisted_item = z.object({
  id: z.number().min(1).describe('wm-id of the webmention to blacklist'),
  reason: z
    .string()
    .min(1)
    .describe('reason why this webmention is blacklisted')
})

type BlacklistedItem = z.infer<typeof blacklisted_item>

const sanitize_options_schema = z.object({
  allowedTags: z.array(z.string().min(1)),
  allowedAttributes: z.any()
})

interface SanitizeOptions {
  allowedTags?: string[]
  allowedAttributes?: { [k: string]: string[] }
}

/**
 * @public
 */
export interface PluginOptions {
  blacklisted?: BlacklistedItem[]
  cacheDirectory?: string
  cacheDuration?: string
  cacheVerbose?: boolean
  domain?: string
  sanitizeOptions?: SanitizeOptions
  token?: string
}

export const defaultOptions: PluginOptions = {
  blacklisted: DEFAULT_BLACKLISTED as BlacklistedItem[],
  cacheDirectory: DEFAULT_CACHE_DIRECTORY,
  cacheDuration: DEFAULT_CACHE_DURATION,
  cacheVerbose: DEFAULT_CACHE_VERBOSE,
  domain: undefined,
  sanitizeOptions: DEFAULT_SANITIZE_OPTIONS,
  token: undefined
}

export const pluginOptions = z.object({
  blacklisted: z
    .array(blacklisted_item)
    .default(defaultOptions.blacklisted as BlacklistedItem[]),

  cacheDirectory: z
    .string()
    .min(1)
    .default(defaultOptions.cacheDirectory as string),

  cacheDuration: z.string().default(defaultOptions.cacheDuration as string),

  cacheVerbose: z
    .boolean()
    .optional()
    .default(defaultOptions.cacheVerbose as boolean),

  domain: z
    .string({ required_error: 'You must provide your Webmention.io domain' })
    .min(1)
    .regex(new RegExp('^((?!http?).)(www.)?.*$'), {
      message:
        'Invalid domain. This string should be a domain, without https:// (e.g. example.com, www.example.com)'
    }),

  sanitizeOptions: sanitize_options_schema.default(
    defaultOptions.sanitizeOptions! as Required<SanitizeOptions>
  ),

  token: z
    .string({ required_error: 'You must provide your Webmention.io token' })
    .min(1)
})
