import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it, before, beforeEach, afterEach } from 'node:test'
import util from 'node:util'
import {
  makeEleventy,
  ELEVENTY_INPUT,
  HEADERS_FILEPATH,
  HEADERS_CONTENT,
  VERCEL_JSON_FILEPATH
} from '@jackdbd/eleventy-test-utils'
import {
  starter_policy,
  recommended_policy
} from '@jackdbd/content-security-policy/policies'
import { contentSecurityPolicyPlugin } from '../lib/index.js'

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)
const unlinkAsync = util.promisify(fs.unlink)

const HOSTING = 'cloudflare-pages'
// const HOSTING = 'vercel'

const CONFIG_JSON_FILEPATH = path.join(
  ELEVENTY_INPUT,
  'eleventy-plugin-content-security-policy-config.json'
)

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

  // allow service workers, web workers and shared web workers hosted on the this origin
  'worker-src': ['self']
}

const cleanup = async () => {
  if (fs.existsSync(CONFIG_JSON_FILEPATH)) {
    await unlinkAsync(CONFIG_JSON_FILEPATH)
  }

  if (fs.existsSync(HEADERS_FILEPATH)) {
    await unlinkAsync(HEADERS_FILEPATH)
  }

  if (fs.existsSync(VERCEL_JSON_FILEPATH)) {
    await unlinkAsync(VERCEL_JSON_FILEPATH)
  }
}

describe('contentSecurityPolicyPlugin', () => {
  const timeoutMs = 10000

  // https://content-security-policy.com/examples/
  // https://www.reflectiz.com/blog/8-best-content-security-policies/
  let directives_starter_policy
  let directives_recommended_policy
  before(async () => {
    directives_starter_policy = starter_policy
    directives_recommended_policy = recommended_policy
  })

  beforeEach(async () => {
    await cleanup()
    await writeFileAsync(HEADERS_FILEPATH, HEADERS_CONTENT)
  })

  afterEach(async () => {
    await cleanup()
  })

  it(
    'default config',
    async () => {
      const eleventy = await makeEleventy({
        input: undefined,
        output: undefined,
        plugin: contentSecurityPolicyPlugin,
        pluginConfig: { hosting: HOSTING },
        dir: { output: ELEVENTY_INPUT }
      })

      // const userConfig = eleventy.eleventyConfig.userConfig

      // const timeout = await waitMs(timeoutMs / 4)
      // clearTimeout(timeout)

      assert.equal(fs.existsSync(CONFIG_JSON_FILEPATH), false)

      const buffer = await readFileAsync(HEADERS_FILEPATH)
      const str = buffer.toString()
      assert.match(str, new RegExp(HEADERS_CONTENT))
      assert.match(str, /Content-Security-Policy:/)
      assert.doesNotMatch(str, /Content-Security-Policy-Report-Only:/)
    },
    timeoutMs
  )

  it(
    'default config with plugin config recap as JSON',
    async () => {
      const eleventy = await makeEleventy({
        input: undefined,
        output: undefined,
        plugin: contentSecurityPolicyPlugin,
        pluginConfig: { hosting: HOSTING, jsonRecap: true },
        dir: { output: ELEVENTY_INPUT }
      })

      const userConfig = eleventy.eleventyConfig.userConfig

      // const timeout = await waitMs(timeoutMs / 4)
      // clearTimeout(timeout)

      assert(fs.existsSync(CONFIG_JSON_FILEPATH))

      const buffer = await readFileAsync(HEADERS_FILEPATH)
      const str = buffer.toString()
      assert.match(str, new RegExp(HEADERS_CONTENT))
      assert.match(str, /Content-Security-Policy:/)
      assert.doesNotMatch(str, /Content-Security-Policy-Report-Only:/)
    },
    timeoutMs
  )

  it(
    'config with starter Content-Security-Policy',
    async () => {
      const eleventy = await makeEleventy({
        input: undefined,
        output: undefined,
        plugin: contentSecurityPolicyPlugin,
        pluginConfig: {
          directives: directives_starter_policy,
          hosting: HOSTING
        },
        dir: { output: ELEVENTY_INPUT }
      })

      const userConfig = eleventy.eleventyConfig.userConfig

      // const timeout = await waitMs(timeoutMs / 4)
      // clearTimeout(timeout)

      const buffer = await readFileAsync(HEADERS_FILEPATH)
      const str = buffer.toString()

      assert.match(str, new RegExp(HEADERS_CONTENT))
      assert.match(str, /Content-Security-Policy:/)
      assert.doesNotMatch(str, /Content-Security-Policy-Report-Only:/)
      assert.match(str, /base-uri 'self'/)
      assert.match(str, /connect-src 'self'/)
      assert.match(str, /default-src 'none'/)
      assert.match(str, /form-action 'self'/)
      assert.match(str, /img-src 'self'/)
      assert.match(str, /script-src 'self'/)
      assert.match(str, /style-src 'self'/)
    },
    timeoutMs
  )

  it(
    'config with recommended Content-Security-Policy',
    async () => {
      const eleventy = await makeEleventy({
        input: undefined,
        output: undefined,
        plugin: contentSecurityPolicyPlugin,
        pluginConfig: {
          directives: directives_recommended_policy,
          hosting: HOSTING
        },
        dir: { output: ELEVENTY_INPUT }
      })

      const userConfig = eleventy.eleventyConfig.userConfig

      // const timeout = await waitMs(timeoutMs / 4)
      // clearTimeout(timeout)

      const buffer = await readFileAsync(HEADERS_FILEPATH)
      const str = buffer.toString()

      assert.match(str, new RegExp(HEADERS_CONTENT))
      assert.match(str, /Content-Security-Policy:/)
      assert.doesNotMatch(str, /Content-Security-Policy-Report-Only:/)
      assert.match(str, /base-uri 'self'/)
      assert.match(str, /connect-src 'self'/)
      assert.match(str, /default-src 'none'/)
      assert.match(str, /font-src 'self'/)
      assert.match(str, /frame-ancestors 'none'/)
      assert.match(str, /form-action 'self'/)
      assert.match(str, /img-src 'self'/)
      assert.match(str, /manifest-src 'self'/)
      assert.match(str, /object-src 'none'/)
      assert.match(str, /script-src 'self'/)
      assert.match(str, /style-src 'self'/)
      assert.match(str, /upgrade-insecure-requests/)
    },
    timeoutMs
  )

  it(
    'config for Content-Security-Policy',
    async () => {
      const eleventy = await makeEleventy({
        input: undefined,
        output: undefined,
        plugin: contentSecurityPolicyPlugin,
        pluginConfig: {
          allowDeprecatedDirectives: true,
          directives,
          globPatternsDetach: ['/*.png'],
          hosting: HOSTING,
          includePatterns: ['/**/**.html'],
          excludePatterns: []
        },
        dir: { output: ELEVENTY_INPUT }
      })

      const userConfig = eleventy.eleventyConfig.userConfig

      // const timeout = await waitMs(timeoutMs / 4)
      // clearTimeout(timeout)

      const buffer = await readFileAsync(HEADERS_FILEPATH)
      const str = buffer.toString()
      assert.match(str, /Content-Security-Policy:/)
      assert.doesNotMatch(str, /Content-Security-Policy-Report-Only:/)
    },
    timeoutMs
  )

  it(
    'config for Content-Security-Policy-Report-Only',
    async () => {
      const eleventy = await makeEleventy({
        input: undefined,
        output: undefined,
        plugin: contentSecurityPolicyPlugin,
        pluginConfig: {
          allowDeprecatedDirectives: true,
          directives,
          globPatternsDetach: ['/*.png'],
          hosting: HOSTING,
          includePatterns: ['/**/**.html'],
          excludePatterns: [],
          reportOnly: true
        },
        dir: { output: ELEVENTY_INPUT }
      })

      const userConfig = eleventy.eleventyConfig.userConfig

      // const timeout = await waitMs(timeoutMs - 1000)
      // clearTimeout(timeout)

      const buffer = await readFileAsync(HEADERS_FILEPATH)
      const str = buffer.toString()
      assert.doesNotMatch(str, /Content-Security-Policy:/)
      assert.match(str, /Content-Security-Policy-Report-Only:/)
    },
    timeoutMs
  )

  it('allows an empty user config (i.e. options not set by the user)', async () => {
    const eleventy = await makeEleventy({
      input: undefined,
      output: undefined,
      plugin: contentSecurityPolicyPlugin,
      pluginConfig: { hosting: HOSTING },
      dir: { output: ELEVENTY_INPUT }
    })

    assert.equal(eleventy.outputDir, './_site/')
    // assert.equal(eleventy.outputDir, ELEVENTY_INPUT)
  })
})
