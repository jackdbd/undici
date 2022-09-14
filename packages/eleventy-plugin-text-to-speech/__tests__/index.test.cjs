const fs = require('node:fs')
const path = require('node:path')
const { promisify } = require('node:util')
const fsPromises = require('fs/promises')
const Eleventy = require('@11ty/eleventy/src/Eleventy')
const { plugin } = require('../lib/index.js')

const rmP = promisify(fs.rm)

const configFunction = plugin.configFunction

const PACKAGE_ROOT = path.join(__filename, '..', '..')
const OUTPUT_DIR = path.join(PACKAGE_ROOT, '_site')

const audioHost = new URL('http://localhost:8090/assets/audio')

describe('Eleventy Text-to-Speech plugin', () => {
  beforeAll(async () => {
    if (!fs.existsSync(OUTPUT_DIR)) {
      await fsPromises.mkdir(OUTPUT_DIR)
    }
  })

  afterAll(async () => {
    if (fs.existsSync(OUTPUT_DIR)) {
      await rmP(OUTPUT_DIR, { force: true, recursive: true })
    }
  })

  let eleventyConfig
  beforeEach(() => {
    const eleventy = new Eleventy()
    eleventyConfig = eleventy.eleventyConfig.userConfig
  })

  it('throws when `audioHost` is `undefined`', () => {
    const userConfig = {
      audioHost: undefined
    }

    expect(() => {
      configFunction(eleventyConfig, userConfig)
    }).toThrowError('"audioHost" is required')
  })

  it('throws when passed an audio encoding unsupported by the Cloud Text-to-Speech API', () => {
    const userConfig = {
      audioEncodings: ['foo']
    }

    expect(() => {
      configFunction(eleventyConfig, userConfig)
    }).toThrowError('must be one of')
  })

  it('allows `MP3` in `audioEncodings`', () => {
    const userConfig = {
      audioEncodings: ['MP3'],
      audioHost
    }

    eleventyConfig.dir = {
      output: OUTPUT_DIR
    }

    expect(() => {
      configFunction(eleventyConfig, userConfig)
    }).not.toThrow()
  })

  it('allows `OGG_OPUS` in `audioEncodings`', () => {
    const userConfig = {
      audioEncodings: ['OGG_OPUS'],
      audioHost
    }

    eleventyConfig.dir = {
      output: OUTPUT_DIR
    }

    expect(() => {
      configFunction(eleventyConfig, userConfig)
    }).not.toThrow()
  })
})
