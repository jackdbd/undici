import { z } from 'zod'

export const api_key = z
  .string()
  .min(1)
  .default(process.env.ELEVENLABS_API_KEY || '')
  .describe('API key for the ElevenLabs Text-to-Speech API')

export const model_id = z
  .union([
    z.literal('eleven_english_sts_v2'),
    z.literal('eleven_monolingual_v1'),
    z.literal('eleven_multilingual_v1'),
    z.literal('eleven_multilingual_v2'),
    z.literal('eleven_turbo_v2')
  ])
  .describe('Model supported by the ElevenLabs Text-to-Speech API')

export type ModelId = z.infer<typeof model_id>

/**
 * Output formats supported by the ElevenLabs Text-to-Speech API.
 *
 * @see https://help.elevenlabs.io/hc/en-us/articles/15754340124305-What-audio-formats-do-you-support
 * @see https://github.com/elevenlabs/elevenlabs-python/blob/main/API.md
 */
export const output_format = z
  .union([
    z.literal('mp3_44100_64'),
    z.literal('mp3_44100_96'),
    z.literal('mp3_44100_128'),
    z.literal('mp3_44100_192'),
    z.literal('pcm_16000'),
    z.literal('pcm_22050'),
    z.literal('pcm_24000'),
    z.literal('pcm_44100'),
    z.literal('ulaw_8000')
  ])
  .describe('Output format supported by the ElevenLabs Text-to-Speech API')

export type OutputFormat = z.infer<typeof output_format>

export const voice_id = z
  .string()
  .min(1)
  .describe('Voice for the ElevenLabs Text-to-Speech API')

export const text = z.string().min(1).max(5000)
  .describe(`Text to synthesize into speech using the ElevenLabs Text-to-Speech API.
`)
