import path from 'node:path'
import PrettyError from 'pretty-error'
import {
  cloudTextToSpeechClientOptions,
  ELEVENLABS_API_KEY
} from '@jackdbd/eleventy-test-utils'
import type { WriteResult } from '@jackdbd/eleventy-plugin-text-to-speech'
import { textToAudioAsset } from '@jackdbd/eleventy-plugin-text-to-speech/text-to-audio-asset'
import { defClient as defElevenLabsTextToSpeechClient } from '../packages/eleventy-plugin-text-to-speech/src/synthesis/elevenlabs-text-to-speech.ts'
import { defClient as defGoogleCloudTextToSpeechClient } from '../packages/eleventy-plugin-text-to-speech/src/synthesis/gcp-text-to-speech.ts'
import { defClient as defFilesystemClient } from '../packages/eleventy-plugin-text-to-speech/src/hosting/fs.ts'

const pe = new PrettyError()

const logWriteResult = (res: WriteResult) => {
  if (res.error) {
    console.log(pe.render(res.error))
  } else {
    console.log(res.value.message)
  }
}

const main = async () => {
  const ttsMp3It = defElevenLabsTextToSpeechClient({
    apiKey: ELEVENLABS_API_KEY,
    modelId: 'eleven_multilingual_v1',
    outputFormat: 'mp3_44100_128',
    voiceId: 'LcfcDJNUP1GQjkzn1xUU' // Emily (premade voice)
  })

  const ttsMp3EnGB = defGoogleCloudTextToSpeechClient({
    ...cloudTextToSpeechClientOptions(),
    audioEncoding: 'MP3',
    voiceName: 'en-GB-Wavenet-C'
  })

  const ttsOpusEnIN = defGoogleCloudTextToSpeechClient({
    ...cloudTextToSpeechClientOptions(),
    audioEncoding: 'OGG_OPUS',
    voiceName: 'en-IN-Neural2-A'
  })

  const hosting = defFilesystemClient({
    hrefBase: `http://localhost:8090/audio`,
    assetBasepath: path.join('fixtures', 'html', 'audio')
  })

  const configs = [
    {
      text: `This is some text spoken in british english`,
      synthesis: ttsMp3EnGB,
      hosting
    },
    {
      text: `This is some text spoken in indian english`,
      synthesis: ttsOpusEnIN,
      hosting
    },
    {
      text: `Questo è del testo parlato in italiano`,
      synthesis: ttsMp3It,
      hosting
    }
  ]

  const promises = configs.map((cfg) => textToAudioAsset(cfg))

  const results = await Promise.all(promises)

  results.forEach((res, i) => {
    console.log(`=== Result ${i + 1}/${results.length} ===`)
    logWriteResult(res)
  })
}

await main()
