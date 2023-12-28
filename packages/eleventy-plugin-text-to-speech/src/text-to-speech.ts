import makeDebug from 'debug'
import type { TextToSpeechClient } from '@google-cloud/text-to-speech'
import type { google } from '@google-cloud/text-to-speech/build/protos/protos.js'
import { DEBUG_PREFIX } from './constants.js'
import type { AudioEncoding } from './types.js'

const debug = makeDebug(`${DEBUG_PREFIX}:text-to-speech`)

interface SynthesizeSpeechConfig {
  audioEncoding: AudioEncoding
  client: TextToSpeechClient
  text: string
  voice: google.cloud.texttospeech.v1.IVoiceSelectionParams
}

export const synthesizeSpeech = async ({
  audioEncoding,
  client,
  text,
  voice
}: SynthesizeSpeechConfig) => {
  const request = {
    audioConfig: { audioEncoding },
    input: { text },
    voice
  }

  // the Cloud Text-to-Speech API has a limit of 5000 characters

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

interface ListVoicesConfig {
  client: TextToSpeechClient
  languageCode?: string
}

// https://cloud.google.com/text-to-speech/docs/voices
export const listVoices = async ({
  client,
  languageCode
}: ListVoicesConfig) => {
  const [result] = await client.listVoices({ languageCode })
  return result.voices
}
