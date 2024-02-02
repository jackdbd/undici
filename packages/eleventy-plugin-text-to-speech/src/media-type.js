'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.mediaType = void 0
/**
 * The `<audio>` tag supports 3 audio formats: MP3 (audio/mpeg), WAV (audio/wav),
 * and OGG (audio/ogg).
 *
 * @see [wikipedia.org - Supported media types in various browsers](https://en.wikipedia.org/wiki/HTML5_audio)
 * @see [stackoverflow.com - HTML5 audio Browsers unable to decode wav file encoded with IMA ADPCM](https://stackoverflow.com/questions/36866611/html5-audio-browsers-unable-to-decode-wav-file-encoded-with-ima-adpcm)
 */
var mediaType = function (ext) {
  switch (ext) {
    case '.flac':
      return { value: 'audio/flac' }
    case '.mp3':
      return { value: 'audio/mpeg' }
    case '.opus':
      return { value: 'audio/ogg' }
    case '.PCM':
    case '.pcm':
    case '.wav':
      return { value: 'audio/wav' }
    default:
      return {
        error: new Error(
          'file extension "'.concat(
            ext,
            '" does not have a matching media type for the <code>audio</code> element'
          )
        )
      }
  }
}
exports.mediaType = mediaType
