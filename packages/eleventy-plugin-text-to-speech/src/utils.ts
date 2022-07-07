import makeDebug from 'debug'
import { DEBUG_PREFIX, ERROR_MESSAGE_PREFIX } from './constants.js'
import type { AudioEncoding } from './types.js'

const debug = makeDebug(`${DEBUG_PREFIX}/utils`)

export const audioExtension = (audioEncoding: AudioEncoding) => {
  switch (audioEncoding) {
    case 'ALAW': {
      return 'alaw'
    }
    case 'LINEAR16': {
      return 'l16'
    }
    case 'MP3': {
      return 'mp3'
    }
    case 'MULAW': {
      return 'mulaw'
    }
    case 'OGG_OPUS': {
      return 'opus'
    }
    default: {
      return 'wav'
    }
  }
}

/**
 * The <audio> tag supports 3 audio formats: MP3 (audio/mpeg), WAV (audio/wav), and OGG (audio/ogg).
 * https://stackoverflow.com/questions/36866611/html5-audio-browsers-unable-to-decode-wav-file-encoded-with-ima-adpcm
 *
 * Supported media types in various browsers:
 * https://en.wikipedia.org/wiki/HTML5_audio
 */
export const mediaType = (ext: string) => {
  switch (ext) {
    case '.mp3': {
      return { value: 'audio/mpeg' }
    }
    case '.opus': {
      return { value: 'audio/ogg' }
    }
    case '.wav': {
      return { value: 'audio/wav' }
    }
    default: {
      return {
        error: new Error(
          `file extension "${ext}" does not have a matching media type for the <code>audio</code> element`
        )
      }
    }
  }
}

interface CredentialsConfig {
  keyFilename?: string
  what: string
}

export const clientLibraryCredentials = ({
  keyFilename,
  what
}: CredentialsConfig) => {
  let credentials: string | undefined = undefined

  if (keyFilename) {
    debug(`initialize ${what} using keyFilename`)
    credentials = keyFilename
  } else {
    debug(
      `initialize ${what} using environment variable GOOGLE_APPLICATION_CREDENTIALS`
    )
    credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS
  }

  if (!credentials) {
    const message = `${ERROR_MESSAGE_PREFIX.invalidConfiguration}: neither keyFilename nor GOOGLE_APPLICATION_CREDENTIALS are set. Cannot initialize ${what}.`
    throw new Error(message)
  }

  return credentials
}
