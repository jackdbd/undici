import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const __filename = fileURLToPath(import.meta.url)

export const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!

export const CLOUD_STORAGE_BUCKET_AUDIO_FILES_NAME =
  'bkt-eleventy-plugin-text-to-speech-audio-files'

export const CLOUD_TEXT_TO_SPEECH_DEFAULT_AUDIO_ENCODING = 'OGG_OPUS'

export const CLOUDFLARE_R2_BUCKET_AUDIO_FILES_NAME =
  'eleventy-plugin-text-to-speech-audio-files'

export const CLOUDFLARE_R2_BUCKET_AUDIO_FILES_CUSTOM_DOMAIN =
  'audio-assets.giacomodebidda.com'

export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!
export const ELEVENLABS_DEFAULT_MODEL_ID = 'eleven_multilingual_v2'
export const ELEVENLABS_DEFAULT_OUTPUT_FORMAT = 'mp3_44100_128'
export const ELEVENLABS_DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'
// export const ELEVENLABS_DEFAULT_VOICE_ID = '29vD33N1CtxCmqQRPOHJ'

// By default, Eleventy listens to an `eleventy.layout` event
export const ELEVENTY_INITIAL_EVENTS_COUNT = 1

export const REPO_ROOT = path.join(__filename, '..', '..', '..', '..')
export const ASSETS_ROOT = path.join(REPO_ROOT, 'assets')
export const ELEVENTY_INPUT = path.join(REPO_ROOT, 'assets', 'html-pages')
export const FIXTURES_ROOT = path.join(REPO_ROOT, 'fixtures')
export const HEADERS_FILEPATH = path.join(ELEVENTY_INPUT, '_headers')
export const HEADERS = ['X-Foo: bar', 'X-Bar: baz']
export const HEADERS_CONTENT = `/*\n  ${HEADERS.join('\n  ')}\n`
export const VERCEL_JSON_FILEPATH = path.join(ELEVENTY_INPUT, 'vercel.json')
