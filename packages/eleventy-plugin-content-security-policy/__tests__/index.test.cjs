const fs = require('node:fs')
const path = require('node:path')
const util = require('node:util')
const Eleventy = require('@11ty/eleventy/src/Eleventy')
const plugin = require('../lib/index.cjs')

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)
const unlinkAsync = util.promisify(fs.unlink)

const REPO_ROOT = path.join(__filename, '..', '..', '..', '..')
const OUTPUT_DIR = path.join(REPO_ROOT, 'assets', 'html-pages')

const waitMs = (ms) => {
  let timeout
  return new Promise((resolve) => {
    timeout = setTimeout(() => {
      resolve(timeout)
    }, ms)
  })
}

const directives = {
  'base-uri': ['self'],

  'default-src': ['none'],

  'font-src': ['self'],

  // allow loading images hosted on GitHub, Cloudinary
  'img-src': [
    'self',
    'github.com',
    'raw.githubusercontent.com',
    'res.cloudinary.com'
  ],

  // allow scripts hosted on this origin, on plausible.io (analytics),
  // cloudflareinsights.com (analytics), unpkg.com (preact)
  'script-src-elem': [
    'self',
    'https://plausible.io/js/plausible.js',
    'https://static.cloudflareinsights.com/beacon.min.js',
    'https://unpkg.com/htm/preact/standalone.module.js'
  ],

  // allow CSS hosted on this origin, and inline styles that match a sha256
  // hash automatically computed at build time by this 11ty plugin.
  // See also here for the pros and cons of 'unsafe-inline'
  // https://stackoverflow.com/questions/30653698/csp-style-src-unsafe-inline-is-it-worth-it
  'style-src-elem': ['self', 'sha256'],

  'upgrade-insecure-requests': true,

  // allow service workers, workers and shared workers hosted on the this origin
  'worker-src': ['self']
}

describe('plugin', () => {
  const headersFilepath = path.join(OUTPUT_DIR, '_headers')
  const timeoutMs = 10000

  let eleventyConfig
  beforeEach(async () => {
    const eleventy = new Eleventy()
    eleventyConfig = eleventy.eleventyConfig.userConfig
    eleventyConfig.dir = {
      // data: '_data',
      // includes: 'includes',
      // input: 'src',
      // layouts: 'layouts'
      output: OUTPUT_DIR
    }

    if (fs.existsSync(headersFilepath)) {
      await unlinkAsync(headersFilepath)
    }

    await writeFileAsync(
      headersFilepath,
      '# Here are my custom HTTP response headers'
    )
  })

  afterEach(async () => {
    await unlinkAsync(headersFilepath)
  })

  it(
    'adds one `eleventy.after` event handler',
    async () => {
      const userConfig = {}

      expect(eleventyConfig.events._events['eleventy.before']).not.toBeDefined()
      expect(eleventyConfig.events._events['eleventy.after']).not.toBeDefined()

      plugin.configFunction(eleventyConfig, userConfig)

      expect(eleventyConfig.events._eventsCount).toBe(1)
      expect(eleventyConfig.events._events['eleventy.before']).not.toBeDefined()
      expect(eleventyConfig.events._events['eleventy.after']).toBeDefined()
      expect(eleventyConfig.emit('eleventy.after'))

      const timeout = await waitMs(timeoutMs / 4)
      clearTimeout(timeout)
    },
    timeoutMs
  )

  it(
    'config for Content-Security-Policy',
    async () => {
      const userConfig = {
        allowDeprecatedDirectives: true,
        directives,
        globPatternsDetach: ['/*.png'],
        includePatterns: ['/**/**.html'],
        excludePatterns: []
      }

      expect(eleventyConfig.events._events['eleventy.before']).not.toBeDefined()
      expect(eleventyConfig.events._events['eleventy.after']).not.toBeDefined()

      plugin.configFunction(eleventyConfig, userConfig)
      eleventyConfig.emit('eleventy.after')

      expect(eleventyConfig.events._eventsCount).toBe(1)

      const timeout = await waitMs(timeoutMs / 4)
      clearTimeout(timeout)

      const buffer = await readFileAsync(headersFilepath)
      const str = buffer.toString()
      expect(str).toContain('Content-Security-Policy:')
      expect(str).not.toContain('Content-Security-Policy-Report-Only:')
    },
    timeoutMs
  )

  it(
    'config for Content-Security-Policy-Report-Only',
    async () => {
      const userConfig = {
        allowDeprecatedDirectives: true,
        directives,
        globPatternsDetach: ['/*.png'],
        includePatterns: ['/**/**.html'],
        excludePatterns: [],
        reportOnly: true
      }

      expect(eleventyConfig.events._events['eleventy.before']).not.toBeDefined()
      expect(eleventyConfig.events._events['eleventy.after']).not.toBeDefined()

      plugin.configFunction(eleventyConfig, userConfig)
      eleventyConfig.emit('eleventy.after')

      expect(eleventyConfig.events._eventsCount).toBe(1)

      const timeout = await waitMs(timeoutMs - 1000)
      clearTimeout(timeout)

      const buffer = await readFileAsync(headersFilepath)
      const str = buffer.toString()
      expect(str).not.toContain('Content-Security-Policy:')
      expect(str).toContain('Content-Security-Policy-Report-Only:')
    },
    timeoutMs
  )

  it('allows an empty user config (i.e. options not set by the user)', () => {
    const userConfig = {}

    expect(() => {
      plugin.configFunction(eleventyConfig, userConfig)
    }).not.toThrow()
  })
})
