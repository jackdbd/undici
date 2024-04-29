import { Readable } from 'node:stream'
import defDebug from 'debug'
import { z, type ZodTypeAny } from 'zod'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { cloud_text_to_speech, iam } from '@jackdbd/zod-schemas/gcp'
import { DEBUG_PREFIX } from '../constants.js'
import { validatedDataOrThrow } from '../validation.js'

const debug = defDebug(`${DEBUG_PREFIX}:gcp-text-to-speech`)

export const audioExtension = (
  audioEncoding: cloud_text_to_speech.AudioEncoding
) => {
  switch (audioEncoding) {
    case 'ALAW': {
      return 'alaw'
    }
    case 'LINEAR16': {
      return 'l16'
    }
    case 'MP3': {
      return 'mp3'
    }
    case 'MULAW': {
      return 'mulaw'
    }
    case 'OGG_OPUS': {
      return 'opus'
    }
    default: {
      return 'wav'
    }
  }
}

export const synthesis_config = z
  .object({
    /**
     * Encoding for the generated audio file.
     */
    audioEncoding: cloud_text_to_speech.audio_encoding,

    /**
     * Voice to use for text-to-speech synthesis.
     *
     * @see [cloud.google.com - Voices supported by the Speech-to-Text API](https://cloud.google.com/text-to-speech/docs/voices)
     * @see [cloud.google.com - Different voices might have different prices](https://cloud.google.com/text-to-speech/pricing)
     */
    voiceName: cloud_text_to_speech.text
  })
  .describe('Google Cloud Text-to-Speech synthesize config')

export type SynthesisConfig = z.input<typeof synthesis_config>

export const synthesize_config = z
  .object({
    /**
     * Text to synthesize into speech using the Google Cloud Text-to-Speech API.
     *
     * @remarks
     * Character limit for the Google Cloud Text-to-Speech API: 5000 characters
     */
    text: cloud_text_to_speech.text as unknown as ZodTypeAny
  })
  .describe('Google Cloud Text-to-Speech synthesize config')

/**
 * Configuration for the Google Cloud Text-to-Speech API.
 *
 * @see [cloud.google.com - Cloud Text-to-Speech API Reference](https://cloud.google.com/text-to-speech/docs/apis)
 */
export type SynthesizeConfig = z.input<typeof synthesize_config>

/**
 * Synthesizes text into speech using the Google Cloud Text-to-Speech API.
 */
export const synthesize = async (
  client: TextToSpeechClient,
  cfg: SynthesisConfig,
  text: string
) => {
  const { audioEncoding, voiceName } = cfg

  const req = {
    audioConfig: { audioEncoding },
    input: { text },
    voice: { languageCode: voiceName.slice(0, 5), name: voiceName }
  }
  debug(`synthesize %O`, req)

  try {
    const [res] = await client.synthesizeSpeech(req)
    if (!res.audioContent) {
      return {
        error: new Error(`Could not synthesize text: no audioContent.`)
      }
    }
    return { value: Readable.from(res.audioContent) }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return {
      error: new Error(`Could not synthesize text: ${err.message}`)
    }
  }
}

export const auth_options = z.object({
  credentials: iam.client_credentials.optional(),
  keyFilename: iam.service_account_json_key_filepath.optional()
})

export type AuthOptions = z.input<typeof auth_options>

export const client_config = auth_options.merge(synthesis_config)

export type ClientConfig = z.input<typeof client_config>

/**
 * Client for the Google Cloud Text-to-Speech API.
 */
export const defClient = (config: ClientConfig) => {
  const data = validatedDataOrThrow(config, client_config)
  const { audioEncoding, credentials, keyFilename, voiceName } = data

  const client = new TextToSpeechClient({ credentials, keyFilename })

  const extension = audioExtension(audioEncoding)
  debug(
    `text will be synthesized into [hash].${extension} using voice ${voiceName}`
  )

  const synthesizeWithClientAndSynthesisConfig = synthesize.bind(null, client, {
    audioEncoding,
    voiceName
  })

  return {
    config: { audioEncoding, voiceName },
    extension,
    synthesize: synthesizeWithClientAndSynthesisConfig
  }
}
