import fs from 'node:fs'
import stream from 'node:stream'
import util from 'node:util'
import makeDebug from 'debug'
import path from 'node:path'
import type { Storage } from '@google-cloud/storage'
import type { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { JSDOM } from 'jsdom'
import { htmlToText } from 'html-to-text'
import { PREFIX } from './constants.js'
import { textToSpeech } from './text-to-speech.js'
import { audioBaseFilename, audioExtension, mediaType } from './utils.js'
import type { AudioEncoding } from './types.js'

const writeFile = util.promisify(fs.writeFile)

const debug = makeDebug('eleventy-plugin-text-to-speech/transforms')

interface Config {
  audioAssetsDir: string
  audioEncoding: AudioEncoding
  audioHost: string
  bucketName: string
  client: TextToSpeechClient
  cssSelector: string
  output: string
  regexPattern: string
  storage: Storage
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
  const {
    audioAssetsDir,
    audioEncoding,
    audioHost,
    bucketName,
    client,
    cssSelector,
    output,
    regexPattern,
    storage,
    voice
  } = config

  const extension = audioExtension(audioEncoding)
  debug(`configured to generate ${extension} audio files`)

  const regex = new RegExp(regexPattern)

  return async function makeHtmlToAudio(content: string, outputPath: string) {
    const match = regex.test(outputPath)
    if (!match) {
      debug(
        `${outputPath} does not match regex pattern "${regexPattern}", so it will not be altered`
      )
      return content
    }

    const baseFileNameWithExtension = audioBaseFilename({
      extension,
      output,
      outputPath
    })

    const outputBaseDir = path.basename(output)

    const parentPath = path.join(output, audioAssetsDir)
    if (!fs.existsSync(parentPath)) {
      fs.mkdirSync(parentPath, { recursive: true })
    }

    // https://github.com/html-to-text/node-html-to-text#options
    // TODO: maybe allow the user to specify options for html-to-text? Maybe a
    // subset of the available options?
    const text = htmlToText(content, {
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'ul', options: { itemPrefix: ' * ' } }
      ],
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
      const audioUrl = new URL(
        `${audioHost}/${audioAssetsDir}/${baseFileNameWithExtension}`
      )

      const outputFile = path.join(
        outputBaseDir,
        audioAssetsDir,
        baseFileNameWithExtension
      )

      await writeFile(outputFile, buffer, { encoding: 'utf8' })
      debug(`audio content written to file: ${outputFile}`)

      const bkt = storage.bucket(bucketName)
      const file = bkt.file(baseFileNameWithExtension)

      // a PassThrough stream is a Duplex stream
      const d = new stream.PassThrough()
      d.write(buffer)
      d.end()

      d.pipe(file.createWriteStream()).on('finish', () => {
        debug(`finished writing`)
      })

      const dom = new JSDOM(content)

      // TODO: think about a way to decide where to append the <audio> element
      // in the HTML page. Maybe allow to specify a CSS selector?
      // const body = dom.window.document.querySelector('body')
      const el = dom.window.document.querySelector(cssSelector)
      if (!el) {
        throw new Error(
          `Found no matches for the CSS selector "${cssSelector}" on the page ${outputPath}`
        )
      }

      el.innerHTML = [
        `<p>audio hosted on ${audioHost}</p>`,
        audioTag(audioUrl.href),
        `<p>audio hosted on Cloud Storage</p>`,
        audioTag(file.publicUrl())
      ].join('')

      // el.insertAdjacentHTML(
      //   'afterbegin',
      //   `<p>audio hosted on ${audioHost}</p>${audioTag(audioUrl.href)}`
      // )

      // el.insertAdjacentHTML(
      //   'beforeend',
      //   `<p>audio hosted on Cloud Storage</p>${audioTag(file.publicUrl())}`
      // )

      return dom.serialize()
    }

    throw new Error('unreachable code')
  }
}
