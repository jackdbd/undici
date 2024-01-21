export {
  defClient as defElevenLabsTextToSpeechClient,
  synthesize as synthesizeUsingElevenLabsTextToSpeech
} from './elevenlabs-text-to-speech.js'
export type { SynthesizeConfig as ElevenLabsTextToSpeechSynthesizeConfig } from './elevenlabs-text-to-speech.js'

export {
  defClient as defGoogleCloudTextToSpeechClient,
  synthesize as synthesizeUsingGoogleCloudTextToSpeech
} from './gcp-text-to-speech.js'
export type { SynthesizeConfig as GoogleCloudTextToSpeechSynthesizeConfig } from './gcp-text-to-speech.js'

export {
  synthesize_func,
  synthesize_result,
  synthesis,
  synthesis_client
} from './schemas.js'
export type { Synthesize, SynthesizeResult, Synthesis } from './schemas.js'
