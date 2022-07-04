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
