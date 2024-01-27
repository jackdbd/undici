import { z } from 'zod'

export const access_key_id = z
  .string()
  .min(1)
  .describe('Cloudflare API token access key ID')

export const secret_access_key = z
  .string()
  .min(1)
  .describe('Cloudflare API token secret access key')
