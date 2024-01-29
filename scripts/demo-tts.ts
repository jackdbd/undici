import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PrettyError from 'pretty-error'
import {
  cloudStorageUploaderClientOptions,
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_R2_BUCKET_AUDIO_FILES_NAME,
  CLOUDFLARE_R2_BUCKET_AUDIO_FILES_CUSTOM_DOMAIN,
  CLOUD_STORAGE_BUCKET_AUDIO_FILES_NAME,
  cloudTextToSpeechClientOptions,
  ELEVENLABS_API_KEY
} from '@jackdbd/eleventy-test-utils'
import type { WriteResult } from '@jackdbd/eleventy-plugin-text-to-speech'
import { textToAudioAsset } from '@jackdbd/eleventy-plugin-text-to-speech/text-to-audio-asset'
import { defClient as defElevenLabsTextToSpeechClient } from '@jackdbd/eleventy-plugin-text-to-speech/synthesis/elevenlabs-text-to-speech'
import { defClient as defGoogleCloudTextToSpeechClient } from '@jackdbd/eleventy-plugin-text-to-speech/synthesis/gcp-text-to-speech'
import { defClient as defCloudflareR2Client } from '@jackdbd/eleventy-plugin-text-to-speech/hosting/cloudflare-r2'
import { defClient as defCloudStorageClient } from '@jackdbd/eleventy-plugin-text-to-speech/hosting/cloud-storage'
import { defClient as defFilesystemClient } from '@jackdbd/eleventy-plugin-text-to-speech/hosting/fs'

const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.resolve(__filename, '..')
const basename = path.basename(__filename)

const pe = new PrettyError()

const logError = (error: Error) => {
  console.log(pe.render(error))
}

const logWriteResult = (res: WriteResult) => {
  if (res.error) {
    console.log(pe.render(res.error))
  } else {
    console.log(`[demo-tts] ${res.value.message}`)
  }
}

const processOne = async () => {
  const synthesis = defGoogleCloudTextToSpeechClient({
    ...cloudTextToSpeechClientOptions(),
    audioEncoding: 'OGG_OPUS',
    voiceName: 'it-IT-Wavenet-D'
  })

  const hosting = defFilesystemClient({
    hrefBase: `http://localhost:8090/assets/audio`,
    assetBasepath: path.join('assets', 'audio')
  })

  const result = await textToAudioAsset({
    text: `Questo messaggio è stato generato da ${basename}`,
    synthesis,
    hosting
  })

  logWriteResult(result)
}

const pluginDemo = async () => {
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

  const fsClient = defFilesystemClient({
    hrefBase: `http://localhost:8090/assets/audio`,
    assetBasepath: path.join('assets', 'audio')
  })

  const cloudStorage = defCloudStorageClient({
    ...cloudStorageUploaderClientOptions(),
    bucketName: CLOUD_STORAGE_BUCKET_AUDIO_FILES_NAME
  })

  const { access_key_id: accessKeyId, secret_access_key: secretAccessKey } =
    JSON.parse(process.env.CLOUDFLARE_R2!)

  const cloudflareR2 = defCloudflareR2Client({
    accountId: CLOUDFLARE_ACCOUNT_ID,
    accessKeyId,
    secretAccessKey,
    bucketName: CLOUDFLARE_R2_BUCKET_AUDIO_FILES_NAME,
    customDomain: CLOUDFLARE_R2_BUCKET_AUDIO_FILES_CUSTOM_DOMAIN
  })

  const configs = [
    {
      text: `This is some text spoken in british english`,
      synthesis: ttsMp3EnGB,
      hosting: fsClient
    },
    {
      text: `This is some text spoken in indian english`,
      synthesis: ttsOpusEnIN,
      hosting: cloudStorage
    },
    {
      text: `Questo è del testo parlato in italiano`,
      synthesis: ttsMp3It,
      hosting: cloudflareR2
    }
  ]

  const promises = configs.map((cfg) => textToAudioAsset(cfg))

  const results: WriteResult[] = await Promise.all(promises)

  results.forEach((res, i) => {
    console.log(`=== Result ${i + 1}/${results.length} ===`)
    logWriteResult(res)
  })
}

// ========================================================================== //
// await processOne()
await pluginDemo()
