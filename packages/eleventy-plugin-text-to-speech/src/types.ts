// https://cloud.google.com/text-to-speech/docs/reference/rest/v1/SsmlVoiceGender
export type SsmlGender =
  | 'FEMALE'
  | 'MALE'
  | 'NEUTRAL'
  | 'SSML_VOICE_GENDER_UNSPECIFIED'

// export type AudioInnerHTML = (hrefs: string[]) => string

export type CloudStorageHost = {
  bucketName: string
  keyFilename: string
}
