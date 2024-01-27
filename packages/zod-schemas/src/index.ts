/**
 * Zod schemas that I reuse across projects.
 *
 * @packageDocumentation
 */
export { isUnique } from './utils.js'

export {
  access_key_id as cloudflare_access_key_id,
  account_id as cloudflare_account_id,
  secret_access_key as cloudflare_secret_access_key,
  custom_domain as cloudflare_custom_domain,
  r2_bucket_name as cloudflare_r2_bucket_name
} from './cloudflare/index.js'

export { css_selector, xpath_expression } from './dom/index.js'

export {
  api_key as elevenlabs_api_key,
  model_id as elevenlabs_model_id,
  output_format as elevenlabs_output_format,
  voice_id as elevenlabs_voice_id,
  text as elevenlabs_text
} from './elevenlabs/index.js'
export type {
  ModelId as ElevenLabsModelId,
  OutputFormat as ElevenLabsOutputFormat
} from './elevenlabs/index.js'

export {
  cloud_storage_bucket_name,
  audio_encoding as cloud_text_to_speech_audio_encoding,
  text as cloud_text_to_speech_text,
  voice_name as cloud_text_to_speech_voice_name,
  service_account_email,
  service_account_json_key_filepath,
  client_email,
  client_credentials,
  google_group_email,
  user_email,
  private_key
} from './gcp/index.js'
export type {
  AudioEncoding as CloudTextToSpeechAudioEncoding,
  ClientCredentials
} from './gcp/index.js'

export {
  collection_name as eleventy_collection_name,
  transform_name as eleventy_transform_name
} from './eleventy/index.js'
export type { ChatId } from './telegram/index.js'

export {
  bot_token as telegram_bot_token,
  chat_id as telegram_chat_id,
  text as telegram_text
} from './telegram/index.js'
