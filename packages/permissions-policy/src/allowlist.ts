import { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isUnique = (items: any[]) => new Set(items).size === items.length

export const origin = z
  .string()
  .url()
  .describe('The feature is allowed for this specific origin')

/**
 * @see [w3c.github.io - Allowlists special value](https://w3c.github.io/webappsec-permissions-policy/#the-special-value)
 */
export const allow_item = z
  .union([z.literal('*'), z.literal('self'), z.literal('src'), origin])
  .describe('An origin or a special value (`*`, `self`, `src`)')

export type AllowlistItem = z.infer<typeof allow_item>

/**
 * @see [w3c.github.io - Allowlists](https://w3c.github.io/webappsec-permissions-policy/#allowlists)
 */
export const allowlist = z
  .array(allow_item)
  .refine(isUnique, {
    message: 'Must be an array of unique strings'
  })
  .describe('A set of origins and/or special values (`*`, `self`, `src`).')

export type Allowlist = z.infer<typeof allowlist>
