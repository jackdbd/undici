const fs = require('node:fs')
const path = require('node:path')
const util = require('node:util')
const Eleventy = require('@11ty/eleventy/src/Eleventy')
const { permissionsPolicyPlugin } = require('../lib/index.js')

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)
const unlinkAsync = util.promisify(fs.unlink)

const REPO_ROOT = path.join(__filename, '..', '..', '..', '..')
const OUTPUT_DIR = path.join(REPO_ROOT, 'assets', 'html-pages')
const HEADERS_FILEPATH = path.join(OUTPUT_DIR, '_headers')
const HEADERS_CONTENT = '# Here are my custom HTTP response headers'
const CONFIG_JSON_FILEPATH = path.join(
  OUTPUT_DIR,
  'eleventy-plugin-permissions-policy-config.json'
)

const waitMs = (ms) => {
  let timeout
  return new Promise((resolve) => {
    timeout = setTimeout(() => {
      resolve(timeout)
    }, ms)
  })
}

describe('permissionsPolicyPlugin', () => {
  const timeoutMs = 10000

  let eleventyConfig
  beforeEach(async () => {
    const eleventy = new Eleventy()
    eleventyConfig = eleventy.eleventyConfig.userConfig
    eleventyConfig.dir = {
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
      const initial_events_count = 1

      expect(eleventyConfig.events._events['eleventy.before']).not.toBeDefined()
      expect(eleventyConfig.events._events['eleventy.after']).not.toBeDefined()

      permissionsPolicyPlugin(eleventyConfig, userConfig)

      expect(eleventyConfig.events._eventsCount).toBe(initial_events_count + 1)
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
      const initial_events_count = 1

      permissionsPolicyPlugin(eleventyConfig, userConfig)
      eleventyConfig.emit('eleventy.after')

      expect(eleventyConfig.events._eventsCount).toBe(initial_events_count + 1)

      const timeout = await waitMs(timeoutMs / 4)
      clearTimeout(timeout)

      expect(fs.existsSync(CONFIG_JSON_FILEPATH)).toBeFalsy()

      const buffer = await readFileAsync(HEADERS_FILEPATH)
      const str = buffer.toString()
      expect(str).toContain(HEADERS_CONTENT)
      expect(str).not.toContain('Permissions-Policy:')
      expect(str).not.toContain('Feature-Policy:')
    },
    timeoutMs
  )

  it(
    'config with some directives',
    async () => {
      const userConfig = {
        // https://developer.chrome.com/en/docs/privacy-sandbox/permissions-policy/#migration-from-feature-policy
        directives: [
          { feature: 'autoplay', allowlist: ['*'] },
          { feature: 'geolocation', allowlist: ['self'] },
          {
            feature: 'camera',
            allowlist: ['self', 'https://trusted-site.example']
          },
          { feature: 'fullscreen', allowlist: [] }
        ]
      }
      const initial_events_count = 1

      permissionsPolicyPlugin(eleventyConfig, userConfig)
      eleventyConfig.emit('eleventy.after')

      expect(eleventyConfig.events._eventsCount).toBe(initial_events_count + 1)

      const timeout = await waitMs(timeoutMs / 4)
      clearTimeout(timeout)

      const buffer = await readFileAsync(HEADERS_FILEPATH)
      const str = buffer.toString()

      expect(str).toContain(HEADERS_CONTENT)
      expect(str).toContain('Permissions-Policy:')
      expect(str).toContain('Feature-Policy:')
      expect(str).toContain(`autoplay *;`) // Feature-Policy
      expect(str).toContain(`autoplay=*,`) // Permissions-Policy
      expect(str).toContain(`geolocation 'self';`) // Feature-Policy
      expect(str).toContain(`geolocation=(self),`) // Permissions-Policy
      expect(str).toContain(`camera 'self' 'https://trusted-site.example';`) // Feature-Policy
      expect(str).toContain(`camera=(self "https://trusted-site.example"),`) // Permissions-Policy
      expect(str).toContain(`fullscreen 'none'`) // Feature-Policy
      expect(str).toContain(`fullscreen=()`) // Permissions-Policy
    },
    timeoutMs
  )
})
