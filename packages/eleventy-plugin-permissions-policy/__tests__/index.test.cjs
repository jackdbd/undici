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

      expect(eleventyConfig.events._events['eleventy.before']).not.toBeDefined()
      expect(eleventyConfig.events._events['eleventy.after']).not.toBeDefined()

      permissionsPolicyPlugin(eleventyConfig, userConfig)

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

      permissionsPolicyPlugin(eleventyConfig, userConfig)
      eleventyConfig.emit('eleventy.after')

      expect(eleventyConfig.events._eventsCount).toBe(1)

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
        directives: [
          { feature: 'fullscreen', allowlist: ['*'] },
          { feature: 'geolocation', allowlist: ['none'] },
          { feature: 'camera', allowlist: ['self'] },
          {
            feature: 'microphone',
            allowlist: ['self', 'https://www.example.com']
          }
        ]
      }

      permissionsPolicyPlugin(eleventyConfig, userConfig)
      eleventyConfig.emit('eleventy.after')

      expect(eleventyConfig.events._eventsCount).toBe(1)

      const timeout = await waitMs(timeoutMs / 4)
      clearTimeout(timeout)

      const buffer = await readFileAsync(HEADERS_FILEPATH)
      const str = buffer.toString()

      expect(str).toContain(HEADERS_CONTENT)
      expect(str).toContain('Permissions-Policy:')
      expect(str).toContain('Feature-Policy:')
      expect(str).toContain(`fullscreen=('*')`)
      expect(str).toContain(`geolocation=('none')`)
      expect(str).toContain(`camera=('self')`)
      expect(str).toContain(`microphone=('self' 'https://www.example.com')`)
    },
    timeoutMs
  )
})
