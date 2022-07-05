import fs from 'node:fs'
import util from 'node:util'
import makeDebug from 'debug'
import path from 'node:path'
import type { EleventyConfig } from '@panoply/11ty'
import type { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { JSDOM } from 'jsdom'
import { htmlToText } from 'html-to-text'
import { PREFIX } from './constants.js'
import { textToSpeech } from './text-to-speech.js'
import { mediaType } from './utils.js'
import type { AudioEncoding } from './types.js'

const writeFile = util.promisify(fs.writeFile)

const debug = makeDebug('eleventy-plugin-text-to-speech/transforms')

interface Config {
  audioEncoding: AudioEncoding
  client: TextToSpeechClient
  eleventyConfig: EleventyConfig
  regexPattern: string
  voice: {
    languageCode: string
    name: string
  }
}

/**
 * Creates an <audio> element to inject in the HTML page.
 *
 * Browser support for the <audio> element
 * https://caniuse.com/?search=audio
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
 *
 * Supported media types in various browsers
 * https://en.wikipedia.org/wiki/HTML5_audio
 */
const audioTag = (href: string) => {
  const { error, value } = mediaType(path.extname(href))

  if (error) {
    return `<p>${error.message}. Here is a <a href="${href}">link to the audio</a> instead.</p>`
  }

  if (value) {
    return `
  <audio controls>
    <source src=${href} type="${value}">
    <p>Your browser doesn't support HTML5 <code>audio</code>. Here is a <a href="${href}">link to the audio</a> instead.</p>
  </audio>`
  }

  throw new Error('unreachable code')
}

export const makeHtmlToAudio = (config: Config) => {
  const { audioEncoding, client, eleventyConfig, regexPattern, voice } = config

  // the <audio> tag supports 3 audio formats: MP3 (audio/mpeg), WAV (audio/wav),
  // and OGG (audio/ogg).
  // https://stackoverflow.com/questions/36866611/html5-audio-browsers-unable-to-decode-wav-file-encoded-with-ima-adpcm
  let extension = ''
  switch (audioEncoding) {
    case 'ALAW': {
      extension = 'alaw'
      break
    }
    case 'LINEAR16': {
      extension = 'l16'
      break
    }
    case 'MP3': {
      extension = 'mp3'
      break
    }
    case 'MULAW': {
      extension = 'mulaw'
      break
    }
    case 'OGG_OPUS': {
      extension = 'opus'
      break
    }
    default: {
      extension = 'wav'
    }
  }
  debug(`configured to generate ${extension} audio files`)

  const outputSplits = (eleventyConfig as any).dir.output.split(path.sep)
  // TODO: remove this
  console.log(`${PREFIX} outputSplits`, outputSplits)
  const outputDir = outputSplits[outputSplits.length - 1]

  const regex = new RegExp(regexPattern)

  return async function makeHtmlToAudio(content: string, outputPath: string) {
    const match = regex.test(outputPath)
    if (!match) {
      debug(
        `${outputPath} does not match regex pattern "${regexPattern}", so it will not be altered`
      )
      return content
    }

    const splits = outputPath.split(path.sep)
    const idx = splits.findIndex((s) => s === outputDir)

    const audioHost = `http://localhost:8090/packages/demo-site/${outputDir}`

    let outputFile = ''
    let audioUrl: URL
    if (splits.length - 2 === idx) {
      const [filename] = splits.splice(splits.length - 1)
      const baseFileName = path.parse(filename).name
      outputFile = path.join(outputDir, `${baseFileName}.${extension}`)
      audioUrl = new URL(`${audioHost}/${baseFileName}.${extension}`)
    } else {
      const [parentDir, baseFileName] = splits.splice(splits.length - 3)

      const parentPath = path.join(outputDir, parentDir)
      if (!fs.existsSync(parentPath)) {
        fs.mkdirSync(parentPath)
      }

      outputFile = path.join(
        outputDir,
        parentDir,
        `${baseFileName}.${extension}`
      )

      audioUrl = new URL(
        `${audioHost}/${parentDir}/${baseFileName}.${extension}`
      )
    }

    // https://github.com/html-to-text/node-html-to-text#options
    // TODO: maybe allow the user to specify options for html-to-text? Maybe a
    // subset of the available options?
    const text = htmlToText(content, {
      selectors: [{ selector: 'a', options: { ignoreHref: true } }],
      wordwrap: false
    })

    const { error, value: buffer } = await textToSpeech({
      audioEncoding,
      client,
      text,
      voice: { languageCode: voice.languageCode, name: voice.name }
    })

    if (error) {
      console.error(
        `${PREFIX} could not convert text into speech: ${error.message}`
      )
      return content
    }

    if (buffer) {
      await writeFile(outputFile, buffer, { encoding: 'utf8' })
      debug(`Audio content written to file: ${outputFile}`)

      const dom = new JSDOM(content)
      // TODO: think about a way to decide where to append the <audio> element
      // in the HTML page. Maybe allow to specify a CSS selector?
      // const body = dom.window.document.querySelector('body')
      const h1 = dom.window.document.querySelector('h1')
      if (!h1) {
        throw new Error(
          `the HTML page ${outputPath} does not have a h1 element`
        )
      }

      h1.insertAdjacentHTML('afterend', audioTag(audioUrl.href))

      return dom.serialize()
    }

    throw new Error('unreachable code')
  }
}
