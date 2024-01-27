import { z } from 'zod'

export const account_id = z.string().min(1).describe('Cloudflare account ID')
