import { Readable } from 'node:stream'
import defDebug from 'debug'
import { z } from 'zod'
import { elevenlabs } from '@jackdbd/zod-schemas'
import { DEBUG_PREFIX } from '../constants.js'
import { mediaType } from '../media-type.js'
import { validatedDataOrThrow } from '../validation.js'

const debug = defDebug(`${DEBUG_PREFIX}:elevenlabs-text-to-speech`)

export const audioExtension = (outputFormat: elevenlabs.OutputFormat) => {
  switch (outputFormat) {
    case 'mp3_44100_64':
    case 'mp3_44100_96':
    case 'mp3_44100_128':
    case 'mp3_44100_192':
      return 'mp3'

    // https://en.wikipedia.org/wiki/Pulse-code_modulation
    case 'pcm_16000':
    case 'pcm_22050':
    case 'pcm_24000':
    case 'pcm_44100':
      return 'pcm'

    // https://en.wikipedia.org/wiki/%CE%9C-law_algorithm
    // https://en.wikipedia.org/wiki/FLAC
    case 'ulaw_8000':
      return 'flac' // or mulaw?

    default:
      return 'mp3'
  }
}

export const DEFAULT_VOICE_SETTINGS = {
  similarity_boost: 0.5,
  stability: 0.5,
  style: 1,
  use_speaker_boost: true
}

export const synthesis_config = z
  .object({
    /**
     * Models supported by the ElevenLabs Text-to-Speech API.
     *
     * @see https://elevenlabs.io/docs/api-reference/get-models
     */
    modelId: elevenlabs.model_id,

    outputFormat: elevenlabs.output_format,

    /**
     * Voices supported by the ElevenLabs Text-to-Speech API.
     *
     * @see https://elevenlabs.io/docs/api-reference/get-voices
     */
    voiceId: elevenlabs.voice_id,

    voiceSettings: z.any().default(DEFAULT_VOICE_SETTINGS)
  })
  .describe('ElevenLabs synthesis config')

export type SynthesisConfig = z.input<typeof synthesis_config>

export const synthesize_config = z
  .object({
    /**
     * Text to synthesize into speech using the ElevenLabs Text-to-Speech API.
     *
     * @remarks
     * Character limit for the ElevenLabs Text-to-Speech API:
     * - 2500 for unsubscribed users
     * - 5000 for subscribed users
     * @see [elevenlabs.io - Pricing](https://elevenlabs.io/pricing)
     */
    text: elevenlabs.text
  })
  .describe('ElevenLabs synthesize config')

/**
 * Configuration for the ElevenLabs Text-to-Speech API.
 *
 * @see [elevenlabs.io - Text to speech API Reference](https://elevenlabs.io/docs/api-reference/text-to-speech)
 */
export type SynthesizeConfig = z.input<typeof synthesize_config>

/**
 * Synthesizes text into speech using the ElevenLabs Text-to-Speech API.
 *
 * @public
 */
export const synthesize = async (
  apiKey: string,
  cfg: SynthesisConfig,
  text: string
) => {
  const { modelId, outputFormat, voiceId, voiceSettings } = cfg

  const reqBody = {
    model_id: modelId,
    output_format: outputFormat,
    // pronunciation_dictionary_locators: [
    //   { pronunciation_dictionary_id: '<string>', version_id: '<string>' }
    // ],
    text,
    voice_settings: voiceSettings
  }

  const ext = `.${audioExtension(outputFormat)}`

  const reqInit = {
    method: 'POST',
    headers: {
      Accept: mediaType(ext).value,
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    } as HeadersInit,
    body: JSON.stringify(reqBody)
  }

  const apiEndpoint = 'https://api.elevenlabs.io/v1/text-to-speech'
  let response: Response
  try {
    response = await fetch(`${apiEndpoint}/${voiceId}`, reqInit)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return {
      error: new Error(
        `Could not synthesize text: failed to fetch: ${err.message}`
      )
    }
  }

  if (!response.body) {
    return {
      error: new Error(`Could not synthesize text: no body`)
    }
  }

  if (response.status !== 200) {
    return {
      error: new Error(`Could not synthesize text: ${response.statusText}`)
    }
  }

  const readable = Readable.from(response.body as unknown as Readable)

  readable.on('error', (error) => {
    debug(`readable stream errored`)
    return { error }
  })

  readable.on('end', () => {
    debug(`readable stream ended, no more data to be consumed from`)
  })

  readable.on('close', async () => {
    debug(`readable stream closed, all underlying resources freed`)
  })

  return { value: readable }
}

export const auth_options = z.object({
  apiKey: elevenlabs.api_key.optional()
})

export type AuthOptions = z.input<typeof auth_options>

export const client_config = auth_options.merge(synthesis_config)

export type ClientConfig = z.input<typeof client_config>

/**
 * Client for the ElevenLabs Text-to-Speech API.
 */
export const defClient = (config: ClientConfig) => {
  const data = validatedDataOrThrow(config, client_config)
  const { modelId, outputFormat, voiceId } = data
  const apiKey = data.apiKey || process.env.ELEVENLABS_API_KEY || ''
  const voiceSettings = data.voiceSettings || DEFAULT_VOICE_SETTINGS

  const extension = audioExtension(data.outputFormat)
  debug(
    `text will be synthesized into [hash].${extension} using model ${modelId}, voice ${voiceId}, voice settings %O`,
    voiceSettings
  )

  const synthesizeWithApiKeyAndSynthesisConfig = synthesize.bind(null, apiKey, {
    modelId,
    outputFormat,
    voiceId,
    voiceSettings
  })

  return {
    config: { modelId, outputFormat, voiceId },
    extension,
    synthesize: synthesizeWithApiKeyAndSynthesisConfig
  }
}
