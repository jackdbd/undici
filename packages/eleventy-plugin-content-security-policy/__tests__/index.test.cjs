const fs = require('node:fs')
const path = require('node:path')
const util = require('node:util')
const Eleventy = require('@11ty/eleventy/src/Eleventy')
const plugin = require('../lib/index.cjs')
const policiesPromise = import('@jackdbd/content-security-policy/policies')

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)
const unlinkAsync = util.promisify(fs.unlink)

const REPO_ROOT = path.join(__filename, '..', '..', '..', '..')
const OUTPUT_DIR = path.join(REPO_ROOT, 'assets', 'html-pages')
const HEADERS_FILEPATH = path.join(OUTPUT_DIR, '_headers')
const HEADERS_CONTENT = '# Here are my custom HTTP response headers'
const CONFIG_JSON_FILEPATH = path.join(
  OUTPUT_DIR,
  'eleventy-plugin-content-security-policy-config.json'
)

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
  const timeoutMs = 10000

  // https://content-security-policy.com/examples/
  // https://www.reflectiz.com/blog/8-best-content-security-policies/
  let directives_starter_policy
  let directives_recommended_policy
  beforeAll(async () => {
    const policies = await policiesPromise
    directives_starter_policy = policies.starter_policy
    directives_recommended_policy = policies.recommended_policy
  })

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

    if (fs.existsSync(CONFIG_JSON_FILEPATH)) {
      await unlinkAsync(CONFIG_JSON_FILEPATH)
    }

    if (fs.existsSync(HEADERS_FILEPATH)) {
      await unlinkAsync(HEADERS_FILEPATH)
    }

    await writeFileAsync(HEADERS_FILEPATH, HEADERS_CONTENT)
  })

  afterEach(async () => {
    if (fs.existsSync(CONFIG_JSON_FILEPATH)) {
      await unlinkAsync(CONFIG_JSON_FILEPATH)
    }
    if (fs.existsSync(HEADERS_FILEPATH)) {
      await unlinkAsync(HEADERS_FILEPATH)
    }
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

      eleventyConfig.emit('eleventy.after')
      const timeout = await waitMs(timeoutMs / 4)
      clearTimeout(timeout)
    },
    timeoutMs
  )

  it(
    'default config',
    async () => {
      const userConfig = {}

      plugin.configFunction(eleventyConfig, userConfig)
      eleventyConfig.emit('eleventy.after')

      expect(eleventyConfig.events._eventsCount).toBe(1)

      const timeout = await waitMs(timeoutMs / 4)
      clearTimeout(timeout)

      expect(fs.existsSync(CONFIG_JSON_FILEPATH)).toBeFalsy()

      const buffer = await readFileAsync(HEADERS_FILEPATH)
      const str = buffer.toString()
      expect(str).toContain(HEADERS_CONTENT)
      expect(str).toContain('Content-Security-Policy:')
      expect(str).not.toContain('Content-Security-Policy-Report-Only:')
    },
    timeoutMs
  )

  it(
    'default config with plugin config recap as JSON',
    async () => {
      const userConfig = { jsonRecap: true }

      plugin.configFunction(eleventyConfig, userConfig)
      eleventyConfig.emit('eleventy.after')

      expect(eleventyConfig.events._eventsCount).toBe(1)

      const timeout = await waitMs(timeoutMs / 4)
      clearTimeout(timeout)

      expect(fs.existsSync(CONFIG_JSON_FILEPATH)).toBeTruthy()

      const buffer = await readFileAsync(HEADERS_FILEPATH)
      const str = buffer.toString()
      expect(str).toContain(HEADERS_CONTENT)
      expect(str).toContain('Content-Security-Policy:')
      expect(str).not.toContain('Content-Security-Policy-Report-Only:')
    },
    timeoutMs
  )

  it(
    'config with starter Content-Security-Policy',
    async () => {
      const userConfig = { directives: directives_starter_policy }

      plugin.configFunction(eleventyConfig, userConfig)
      eleventyConfig.emit('eleventy.after')

      expect(eleventyConfig.events._eventsCount).toBe(1)

      const timeout = await waitMs(timeoutMs / 4)
      clearTimeout(timeout)

      const buffer = await readFileAsync(HEADERS_FILEPATH)
      const str = buffer.toString()

      expect(str).toContain(HEADERS_CONTENT)
      expect(str).toContain('Content-Security-Policy:')
      expect(str).not.toContain('Content-Security-Policy-Report-Only:')
      expect(str).toContain(`base-uri 'self'`)
      expect(str).toContain(`connect-src 'self'`)
      expect(str).toContain(`default-src 'none'`)
      expect(str).toContain(`form-action 'self'`)
      expect(str).toContain(`img-src 'self'`)
      expect(str).toContain(`script-src 'self'`)
      expect(str).toContain(`style-src 'self'`)
    },
    timeoutMs
  )

  it(
    'config with recommended Content-Security-Policy',
    async () => {
      const userConfig = { directives: directives_recommended_policy }

      plugin.configFunction(eleventyConfig, userConfig)
      eleventyConfig.emit('eleventy.after')

      expect(eleventyConfig.events._eventsCount).toBe(1)

      const timeout = await waitMs(timeoutMs / 4)
      clearTimeout(timeout)

      const buffer = await readFileAsync(HEADERS_FILEPATH)
      const str = buffer.toString()

      expect(str).toContain(HEADERS_CONTENT)
      expect(str).toContain('Content-Security-Policy:')
      expect(str).not.toContain('Content-Security-Policy-Report-Only:')
      expect(str).toContain(`base-uri 'self'`)
      expect(str).toContain(`connect-src 'self'`)
      expect(str).toContain(`default-src 'none'`)
      expect(str).toContain(`font-src 'self'`)
      expect(str).toContain(`frame-ancestors 'none'`)
      expect(str).toContain(`default-src 'none'`)
      expect(str).toContain(`img-src 'self'`)
      expect(str).toContain(`manifest-src 'self'`)
      expect(str).toContain(`object-src 'none'`)
      expect(str).toContain(`prefetch-src 'self'`)
      expect(str).toContain(`script-src 'self'`)
      expect(str).toContain(`style-src 'self'`)
      expect(str).toContain(`upgrade-insecure-requests`)
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

      const buffer = await readFileAsync(HEADERS_FILEPATH)
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

      const buffer = await readFileAsync(HEADERS_FILEPATH)
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
