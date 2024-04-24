import { z } from 'zod'
import { allowlist, type Allowlist } from './allowlist.js'
import { feature } from './feature.js'
import type { Feature } from './feature.js'

export const DEFAULT_FEATURES = {} as Partial<Record<Feature, Allowlist>>

export const options = z
  .object({
    features: z
      .record(feature, allowlist)
      .default(DEFAULT_FEATURES)
      .describe(
        'Hash map for configuring `Permissions-Policy`. Each entry has a [directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy#directives) as the key, and an [allowlist](https://developer.mozilla.org/en-US/docs/Web/HTTP/Permissions_Policy#allowlists) as the value.'
      ),

    reportingEndpoint: z
      .string()
      .optional()
      .describe(
        'Endpoint for the [Reporting API](https://developer.mozilla.org/en-US/docs/Web/API/Reporting_API). Violations of `Permissions-Policy` (or `Permissions-Policy-Report-Only`) will be sent here.'
      )
  })
  .describe('Options for configuring `Permissions-Policy`')

export type Options = z.input<typeof options>
