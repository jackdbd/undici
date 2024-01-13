import path from 'node:path'
import { fileURLToPath } from 'node:url'
// import util from 'node:util'

const __filename = fileURLToPath(import.meta.url)
// const __dirname = util.dirname(__filename)

export const CLOUD_STORAGE_BUCKET_AUDIO_FILES =
  'bkt-eleventy-plugin-text-to-speech-audio-files'

// By default, Eleventy listens to an `eleventy.layout` event
export const INITIAL_ELEVENTY_EVENTS_COUNT = 1

export const REPO_ROOT = path.join(__filename, '..', '..', '..', '..')
export const ELEVENTY_INPUT = path.join(REPO_ROOT, 'assets', 'html-pages')
export const HEADERS_FILEPATH = path.join(ELEVENTY_INPUT, '_headers')
export const HEADERS_CONTENT = '# Here are my custom HTTP response headers'
