const fs = require('node:fs')
const path = require('node:path')
const fsPromises = require('fs/promises')
const Eleventy = require('@11ty/eleventy/src/Eleventy')
const { textToSpeechPlugin } = require('../lib/index.js')

const PACKAGE_ROOT = path.join(__filename, '..', '..')
const OUTPUT_DIR = path.join(PACKAGE_ROOT, '_site')

describe('textToSpeechPlugin', () => {
  beforeAll(async () => {
    if (!fs.existsSync(OUTPUT_DIR)) {
      await fsPromises.mkdir(OUTPUT_DIR)
    }
  })

  afterAll(async () => {
    if (fs.existsSync(OUTPUT_DIR)) {
      await fsPromises.rmdir(OUTPUT_DIR)
    }
  })

  let eleventyConfig
  beforeEach(() => {
    const eleventy = new Eleventy()
    eleventyConfig = eleventy.eleventyConfig.userConfig
  })

  it('throws when passed an `audioEncoding` unsupported by the Cloud Text-to-Speech API', () => {
    const userConfig = {
      audioEncoding: 'foo'
    }

    expect(() => {
      textToSpeechPlugin(eleventyConfig, userConfig)
    }).toThrowError('"audioEncoding" must be one of')
  })

  it('allows `audioEncoding` to be `MP3`', () => {
    const userConfig = {
      audioEncoding: 'MP3'
    }

    eleventyConfig.dir = {
      output: OUTPUT_DIR
    }

    expect(() => {
      textToSpeechPlugin(eleventyConfig, userConfig)
    }).not.toThrow()
  })

  it('allows `audioEncoding` to be `OGG_OPUS`', () => {
    const userConfig = {
      audioEncoding: 'OGG_OPUS'
    }

    eleventyConfig.dir = {
      output: OUTPUT_DIR
    }

    expect(() => {
      textToSpeechPlugin(eleventyConfig, userConfig)
    }).not.toThrow()
  })
})
