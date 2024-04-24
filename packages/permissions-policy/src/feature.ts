import { z } from 'zod'

/**
 * Browser features that can be controlled with the Permissions-Policy header.
 *
 * @see [developer.mozilla.org - Permissions-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy#directives)
 * @see [techdocs.akamai.com - Permissions-Policy](https://techdocs.akamai.com/property-mgr/docs/permissions-policy)
 * @see [w3c.github.io - Interacting with Permissions for Powerful Features](https://w3c.github.io/permissions/#dfn-powerful-feature)
 */
export const feature = z
  .union([
    z.literal('accelerometer'),
    z.literal('ambient-light-sensor'),
    z.literal('attribution-reporting'),
    z.literal('autoplay'),
    z.literal('battery'),
    z.literal('bluetooth'),
    z.literal('browsing-topics'),
    z.literal('camera'),
    // I have seen Instagram using client hints in the Permissions-Policy header
    // https://mpulp.mobi/2020/05/20/client-hints-and-feature-policies/
    z.literal('ch-device-memory'),
    z.literal('ch-downlink'),
    z.literal('ch-ect'),
    z.literal('ch-rtt'),
    z.literal('ch-save-data'),
    z.literal('ch-ua-arch'),
    z.literal('ch-ua-bitness'),
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
