import makeDebug from 'debug'
import type { TextToSpeechClient } from '@google-cloud/text-to-speech'
import type { google } from '@google-cloud/text-to-speech/build/protos/protos'
import type { AudioEncoding } from './types.js'

const debug = makeDebug('eleventy-plugin-text-to-speech/text-to-speech')

interface Config {
  audioEncoding: AudioEncoding
  client: TextToSpeechClient
  text: string
  voice: google.cloud.texttospeech.v1.IVoiceSelectionParams
}

export const textToSpeech = async ({
  audioEncoding,
  client,
  text,
  voice
}: Config) => {
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
