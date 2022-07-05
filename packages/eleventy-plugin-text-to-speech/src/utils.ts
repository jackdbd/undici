import path from 'node:path'
import type { AudioEncoding } from './types.js'

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
 * the <audio> tag supports 3 audio formats: MP3 (audio/mpeg), WAV (audio/wav), and OGG (audio/ogg).
 *
 * https://stackoverflow.com/questions/36866611/html5-audio-browsers-unable-to-decode-wav-file-encoded-with-ima-adpcm
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

interface Config {
  extension: string
  output: string
  outputPath: string
}

export const audioBaseFilename = ({
  extension,
  output,
  outputPath
}: Config) => {
  const splits = outputPath.split(path.sep)

  const outputBaseDir = path.basename(output)

  const [parent, child] = splits.splice(splits.length - 2)

  if (parent === outputBaseDir) {
    return `${path.parse(child).name}.${extension}`
  } else {
    return `${path.parse(parent).name}.${extension}`
  }
}
