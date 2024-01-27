import { z } from 'zod'

export const r2_bucket_name = z
  .string()
  .describe('Name of the Cloudflare R2 bucket')

export const custom_domain = z
  .string()
  .min(1)
  .describe('Custom domain to expose a Cloudflare R2 bucket to the public')
