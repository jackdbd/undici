import { z } from 'zod'

export const audio_encoding = z.union([
  z.literal('ALAW'),
  z.literal('AUDIO_ENCODING_UNSPECIFIED'),
  z.literal('LINEAR16'),
  z.literal('MP3'),
  z.literal('MULAW'),
  z.literal('OGG_OPUS')
])

export type AudioEncoding = z.infer<typeof audio_encoding>

export const text = z.string().min(1).max(5000)
  .describe(`Text to synthesize into speech using the Cloud Text-to-Speech API.
`)

export const voice_name = z.string().min(6)
