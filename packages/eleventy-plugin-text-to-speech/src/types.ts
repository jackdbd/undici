// https://cloud.google.com/speech-to-text/docs/encoding#audio-encodings
// export type AudioEncoding =
//   | 'AMR'
//   | 'AMR_WB'
//   | 'FLAC'
//   | 'LINEAR16'
//   | 'MP3'
//   | 'MULAW'
//   | 'OGG_OPUS'
//   | 'SPEEX_WITH_HEADER_BYTE'
//   | 'WEBM_OPUS'

export type AudioEncoding =
  | 'ALAW'
  | 'AUDIO_ENCODING_UNSPECIFIED'
  | 'LINEAR16'
  | 'MP3'
  | 'MULAW'
  | 'OGG_OPUS'

// https://cloud.google.com/text-to-speech/docs/reference/rest/v1/SsmlVoiceGender
export type SsmlGender =
  | 'FEMALE'
  | 'MALE'
  | 'NEUTRAL'
  | 'SSML_VOICE_GENDER_UNSPECIFIED'
