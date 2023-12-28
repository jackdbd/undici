import Joi from 'joi'

// export interface Directive {
//   feature: string
//   allowlist: string[]
// }

// export interface Options {
//   directives?: Directive[]
//   excludePatterns: string[]
//   includeFeaturePolicy: boolean
//   includePatterns: string[]
//   jsonRecap: boolean
// }

// export const defaultOptions: Required<Options> = {
export const defaultOptions = {
  directives: [],
  excludePatterns: [],
  includeFeaturePolicy: true,
  includePatterns: ['/', '/*/'],
  jsonRecap: false
}

const glob_pattern = Joi.string().min(1)

const glob_patterns = Joi.array().items(glob_pattern)

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy#directives
// https://w3c.github.io/permissions/#dfn-powerful-feature
const feature = Joi.string()
  .valid(
    'accelerometer',
    'ambient-light-sensor',
    'autoplay',
    'battery',
    'browsing-topics',
    'camera',
    'clipboard-read',
    'clipboard-write',
    'conversion-measurement',
    'cross-origin-isolated',
    'display-capture',
    'document-domain',
    'encrypted-media',
    'execution-while-not-rendered',
    'execution-while-out-of-viewport',
    'focus-without-user-activation',
    'fullscreen',
    'gamepad',
    'geolocation',
    'gyroscope',
    'hid',
    'idle-detection',
    'layout-animations',
    'legacy-image-formats',
    'magnetometer',
    'microphone',
    'midi',
    'navigation-override',
    'oversized-images',
    'payment',
    'picture-in-picture',
    'publickey-credentials-get',
    'screen-wake-lock',
    'serial',
    'speaker-selection',
    'sync-script',
    'sync-xhr',
    'trust-token-redemption',
    'unload',
    'unoptimized-images',
    'unsized-media',
    'usb',
    'vertical-scroll',
    'web-share',
    'window-placement',
    'xr-spatial-tracking'
  )
  .description(
    'A policy-controlled feature is an API or behaviour which can be enabled or disabled in a document by referring to it in a permissions policy.'
  )

const origin = Joi.string().pattern(/^https?:\/\/.*$/, {
  name: 'origin'
})

const allow_item = Joi.alternatives().try(
  origin,
  // https://w3c.github.io/webappsec-permissions-policy/#the-special-value
  Joi.valid('*', 'none', 'self', 'src')
)

// https://w3c.github.io/webappsec-permissions-policy/#allowlists
const allowlist = Joi.array().items(allow_item).min(0).unique()

const directive = Joi.object({
  allowlist: allowlist.optional(),
  feature: feature.required()
})

// https://w3c.github.io/webappsec-permissions-policy/#policy-directives
const directives = Joi.array().items(directive).min(0).unique()

// export const options = Joi.object<Options>()
export const options = Joi.object()
  .keys({
    directives: directives
      .default(defaultOptions.directives)
      .description(
        'Directive for the Permissions-Policy header. A directive is an ordered map, mapping policy-controlled features to corresponding allowlists of origins.'
      ),

    excludePatterns: glob_patterns.default(defaultOptions.excludePatterns),

    includeFeaturePolicy: Joi.boolean()
      .default(defaultOptions.includeFeaturePolicy)
      .description('Whether to include the Feature-Policy header.'),

    includePatterns: glob_patterns
      .min(1)
      .default(defaultOptions.includePatterns),

    jsonRecap: Joi.boolean().default(defaultOptions.jsonRecap)
  })
  .default(defaultOptions)
