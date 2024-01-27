import { z } from 'zod'

// https://cloud.google.com/storage/docs/naming-buckets
export const bucket_name = z
  .string()
  .min(3)
  .max(63)
  .describe('Name of the Google Cloud Storage bucket')
