import { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isUnique = (items: any[]) => new Set(items).size === items.length

const glob_pattern = z.string().min(1)

const glob_patterns = z.array(glob_pattern)

/**
 * Directive available in the Permissions-Policy header.
 *
 * @see [developer.mozilla.org - Permissions-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy#directives)
 * @see [w3c.github.io - Interacting with Permissions for Powerful Features](https://w3c.github.io/permissions/#dfn-powerful-feature)
 */
export const feature = z
  .union([
    z.literal('accelerometer'),
    z.literal('ambient-light-sensor'),
    z.literal('autoplay'),
    z.literal('battery'),
    z.literal('browsing-topics'),
    z.literal('camera'),
    z.literal('clipboard-read'),
    z.literal('clipboard-write'),
    z.literal('conversion-measurement'),
    z.literal('cross-origin-isolated'),
    z.literal('display-capture'),
    z.literal('document-domain'),
    z.literal('encrypted-media'),
    z.literal('execution-while-not-rendered'),
    z.literal('execution-while-out-of-viewport'),
    z.literal('focus-without-user-activation'),
    z.literal('fullscreen'),
    z.literal('gamepad'),
    z.literal('geolocation'),
    z.literal('gyroscope'),
    z.literal('hid'),
    z.literal('idle-detection'),
    z.literal('layout-animations'),
    z.literal('legacy-image-formats'),
    z.literal('magnetometer'),
    z.literal('microphone'),
    z.literal('midi'),
    z.literal('navigation-override'),
    z.literal('oversized-images'),
    z.literal('payment'),
    z.literal('picture-in-picture'),
    z.literal('publickey-credentials-get'),
    z.literal('screen-wake-lock'),
    z.literal('serial'),
    z.literal('speaker-selection'),
    z.literal('sync-script'),
    z.literal('sync-xhr'),
    z.literal('trust-token-redemption'),
    z.literal('unload'),
    z.literal('unoptimized-images'),
    z.literal('unsized-media'),
    z.literal('usb'),
    z.literal('vertical-scroll'),
    z.literal('web-share'),
    z.literal('window-placement'),
    z.literal('xr-spatial-tracking')
  ])
  .describe(
    'A policy-controlled feature is an API or behaviour which can be enabled or disabled in a document by referring to it in a permissions policy.'
  )

export type Feature = z.infer<typeof feature>

export const origin = z.string().url()

/**
 * @see [w3c.github.io - Allowlists special value](https://w3c.github.io/webappsec-permissions-policy/#the-special-value)
 */
export const allow_item = z
  .union([
    z.literal('*'),
    z.literal('none'),
    z.literal('self'),
    z.literal('src'),
    origin
  ])
  .describe('An origin or a special value (`*`, `none`, `self`, `src`)')

export type AllowlistItem = z.infer<typeof allow_item>

/**
 * @see [w3c.github.io - Allowlists](https://w3c.github.io/webappsec-permissions-policy/#allowlists)
 */
export const allowlist = z
  .array(allow_item)
  .refine(isUnique, {
    message: 'Must be an array of unique strings'
  })
  .describe(
    'A set of origins and/or special values (`*`, `none`, `self`, `src`).'
  )

export type Allowlist = z.infer<typeof allowlist>

export const directive = z
  .object({
    allowlist: allowlist.optional(),
    feature: feature
  })
  .describe(
    `Directive for the Permissions-Policy header. A directive is an ordered map, mapping policy-controlled features to corresponding allowlists of origins.`
  )

export type Directive = z.infer<typeof directive>

/**
 * @see [w3c.github.io - Policy directives](https://w3c.github.io/webappsec-permissions-policy/#policy-directives)
 */
export const directives = z.array(directive).refine(isUnique, {
  message: 'Must be an array of unique Permissions-Policy directives'
})

/**
 * Default options for the plugin.
 *
 * @public
 */
export const DEFAULT_OPTIONS = {
  directives: [] as Directive[],
  excludePatterns: [] as string[],
  hosting: undefined as string | undefined,
  includeFeaturePolicy: true,
  includePatterns: ['/*'],
  jsonRecap: false
}

/**
 * Zod schema for the options of this Eleventy plugin.
 *
 * @public
 */
export const options = z.object({
  /**
   * Array of unique Permissions-Policy directives.
   */
  directives: directives
    .default(DEFAULT_OPTIONS.directives)
    .describe(
      'Permissions-Policy [directives](https://w3c.github.io/webappsec-permissions-policy/#policy-directives).'
    ),

  excludePatterns: glob_patterns
    .default(DEFAULT_OPTIONS.excludePatterns)
    .describe(
      'Files that match these patterns will **not** be served with the Permissions-Policy header (nor with the Feature-Policy header, if generated).'
    ),

  hosting: z.string().optional(),

  /**
   * Whether to include the Feature-Policy header or not.
   */
  includeFeaturePolicy: z
    .boolean()
    .default(DEFAULT_OPTIONS.includeFeaturePolicy)
    .describe('Whether to generate also a Feature-Policy header.'),

  includePatterns: glob_patterns
    .default(DEFAULT_OPTIONS.includePatterns)
    .describe(
      'Files that match these patterns will be served with the Permissions-Policy header (and also with the Feature-Policy header, if generated).'
    ),

  /**
   * Whether to generate a JSON file (useful for troubleshooting).
   */
  jsonRecap: z.boolean().default(DEFAULT_OPTIONS.jsonRecap)
})

/**
 * Options for this Eleventy plugin.
 *
 * @public
 */
export type Options = z.input<typeof options>

export type VercelJSONHeadersEntry = { key: string; value: string }

// https://vercel.com/docs/projects/project-configuration#header-object-definition
export type VercelJSONHeaderObject = {
  source: string
  headers: VercelJSONHeadersEntry[]
  has?: any[]
  missing?: any[]
}

export type VercelJSON = {
  headers: VercelJSONHeaderObject[]
}
