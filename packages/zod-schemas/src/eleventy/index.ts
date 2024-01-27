import { z } from 'zod'

export const collection_name = z
  .string()
  .min(1)
  .describe('Eleventy collection name')

export const transform_name = z
  .string()
  .min(1)
  .describe('Eleventy transform name')
