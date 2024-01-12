import makeDebug from 'debug'
import { fromZodError } from 'zod-validation-error'
import { DEBUG_PREFIX } from './constants.js'
import { synthesize_speech_config as schema } from './schemas.js'
import type { SynthesizeSpeechConfig } from './schemas.js'

const debug = makeDebug(`${DEBUG_PREFIX}:text-to-speech`)

/**
 * Synthesizes some text using the Cloud Text-to-Speech API.
 *
 * @internal
 * @param config - configuration object
 * @returns a result object that contains either `error` or `value`
 *
 * @remarks
 * The Cloud Text-to-Speech API has a [limit of 5000 characters](https://cloud.google.com/text-to-speech/quotas).
 */
export const synthesizeSpeech = async (config: SynthesizeSpeechConfig) => {
  const result = schema.safeParse(config)

  if (!result.success) {
    return { error: fromZodError(result.error) }
  }

  const { audioEncoding, client, text, voice } = result.data

  const request = {
    audioConfig: { audioEncoding },
    input: { text },
    voice
  }

  debug(`try converting text => ${audioEncoding} using this voice: %O`, voice)
  try {
    const [response] = await client.synthesizeSpeech(request)
    if (response.audioContent) {
      return { value: response.audioContent }
    } else {
      return {
        error: new Error(
          `the call to the Cloud Text-to-Speech API was succesfull but there is no audio content`
        )
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return { error: new Error(err.message) }
  }
}
