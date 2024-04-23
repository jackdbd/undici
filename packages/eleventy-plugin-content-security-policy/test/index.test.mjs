import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it, before, beforeEach, afterEach } from 'node:test'
import util from 'node:util'
import {
  defEleventy,
  ELEVENTY_INPUT,
  FIXTURES_ROOT
} from '@jackdbd/eleventy-test-utils'
import {
  starter_policy,
  recommended_policy
} from '@jackdbd/content-security-policy/policies'
import { contentSecurityPolicyPlugin } from '../lib/index.js'

const readFileAsync = util.promisify(fs.readFile)
const copyFileAsync = util.promisify(fs.copyFile)
const unlinkAsync = util.promisify(fs.unlink)

const _HEADERS_INPUT = path.join(FIXTURES_ROOT, 'plain-text', '_headers')
const _HEADERS_OUTPUT = path.join(ELEVENTY_INPUT, '_headers')
const VERCEL_JSON_INPUT = path.join(FIXTURES_ROOT, 'json', 'vercel.json')
const VERCEL_JSON_OUTPUT = path.join(ELEVENTY_INPUT, 'vercel.json')

const HOSTING = 'cloudflare-pages'

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
  if (fs.existsSync(_HEADERS_OUTPUT)) {
    await unlinkAsync(_HEADERS_OUTPUT)
  }

  if (fs.existsSync(VERCEL_JSON_OUTPUT)) {
    await unlinkAsync(VERCEL_JSON_OUTPUT)
  }

  if (fs.existsSync(CONFIG_JSON_FILEPATH)) {
    await unlinkAsync(CONFIG_JSON_FILEPATH)
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
  })

  afterEach(async () => {
    await cleanup()
  })

  it('does not create a _headers file when no Content-Security-Policy directives are specified', async () => {
    await defEleventy({
      plugin: contentSecurityPolicyPlugin,
      pluginConfig: { directives: {}, hosting: 'cloudflare-pages' },
      dir: { output: ELEVENTY_INPUT }
    })

    assert.equal(fs.existsSync(_HEADERS_OUTPUT), false)
  })

  it('does not create a vercel.json file when no Content-Security-Policy directives are specified', async () => {
    await defEleventy({
      plugin: contentSecurityPolicyPlugin,
      pluginConfig: { directives: {}, hosting: 'vercel' },
      dir: { output: ELEVENTY_INPUT }
    })

    assert.equal(fs.existsSync(VERCEL_JSON_OUTPUT), false)
  })

  it(
    'creates a _headers file containing a "starter" Content-Security-Policy',
    async () => {
      await defEleventy({
        plugin: contentSecurityPolicyPlugin,
        pluginConfig: {
          directives: directives_starter_policy,
          hosting: HOSTING
        },
        dir: { output: ELEVENTY_INPUT }
      })

      const buffer = await readFileAsync(_HEADERS_OUTPUT)
      const str = buffer.toString()

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
    'creates a _headers file containing a "recommended" Content-Security-Policy',
    async () => {
      await defEleventy({
        plugin: contentSecurityPolicyPlugin,
        pluginConfig: {
          directives: directives_recommended_policy,
          hosting: HOSTING
        },
        dir: { output: ELEVENTY_INPUT }
      })

      const buffer = await readFileAsync(_HEADERS_OUTPUT)
      const str = buffer.toString()

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
    'creates a _headers file containing the expected Content-Security-Policy',
    async () => {
      await defEleventy({
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

      const buffer = await readFileAsync(_HEADERS_OUTPUT)
      const str = buffer.toString()

      assert.match(str, /Content-Security-Policy:/)
      assert.doesNotMatch(str, /Content-Security-Policy-Report-Only:/)
      // see directives above
      assert.match(str, /base-uri 'self'/)
      assert.match(str, /default-src 'none'/)
    },
    timeoutMs
  )

  it(
    'creates a _headers file containing the expected Content-Security-Policy-Report-Only',
    async () => {
      await defEleventy({
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

      const buffer = await readFileAsync(_HEADERS_OUTPUT)
      const str = buffer.toString()

      assert.doesNotMatch(str, /Content-Security-Policy:/)
      assert.match(str, /Content-Security-Policy-Report-Only:/)
      // see directives above
      assert.match(str, /base-uri 'self'/)
      assert.match(str, /default-src 'none'/)
    },
    timeoutMs
  )

  it(`add Content-Security-Policy to an existing _headers file`, async () => {
    await copyFileAsync(_HEADERS_INPUT, _HEADERS_OUTPUT)
    const str_before = (await readFileAsync(_HEADERS_OUTPUT)).toString()
    assert.doesNotMatch(str_before, /Content-Security-Policy:/)
    assert.doesNotMatch(str_before, /Content-Security-Policy-Report-Only:/)

    await defEleventy({
      plugin: contentSecurityPolicyPlugin,
      pluginConfig: {
        directives,
        hosting: HOSTING,
        globPatterns: ['/*'],
        includePatterns: ['/**/**.html']
      },
      dir: { output: ELEVENTY_INPUT }
    })

    const str_after = (await readFileAsync(_HEADERS_OUTPUT)).toString()

    assert.match(str_after, /Content-Security-Policy:/)
    assert.doesNotMatch(str_after, /Content-Security-Policy-Report-Only:/)
    // see directives above
    assert.match(str_after, /base-uri 'self'/)
    assert.match(str_after, /default-src 'none'/)
  })

  it(`add Content-Security-Policy to an existing vercel.json file`, async () => {
    await copyFileAsync(VERCEL_JSON_INPUT, VERCEL_JSON_OUTPUT)
    const str_before = (await readFileAsync(VERCEL_JSON_OUTPUT)).toString()
    const obj_before = JSON.parse(str_before)
    const arr_before = obj_before.headers.filter((h) => h.source === '/*')
    assert.equal(arr_before.length, 0)

    await defEleventy({
      plugin: contentSecurityPolicyPlugin,
      pluginConfig: {
        directives,
        hosting: 'vercel',
        globPatterns: ['/*'],
        includePatterns: ['/**/**.html']
      },
      dir: { output: ELEVENTY_INPUT }
    })

    const str_after = (await readFileAsync(VERCEL_JSON_OUTPUT)).toString()
    const obj_after = JSON.parse(str_after)
    const arr_after = obj_after.headers.filter((h) => h.source === '/*')
    assert.equal(arr_after.length, 1)
    assert.equal(arr_after[0].headers.length, 1)
    assert.equal(arr_after[0].headers[0].key, 'Content-Security-Policy')
    const csp = arr_after[0].headers[0].value
    // see directives above
    assert.match(csp, /base-uri 'self'/)
    assert.match(csp, /default-src 'none'/)
  })

  it('allows an empty user config when a _headers file is available in the output directory', async () => {
    await copyFileAsync(_HEADERS_INPUT, _HEADERS_OUTPUT)

    const eleventy = await defEleventy({
      plugin: contentSecurityPolicyPlugin,
      // pluginConfig: {},
      dir: { output: ELEVENTY_INPUT }
    })

    assert.equal(eleventy.outputDir, './_site/')
  })

  it('allows an empty user config when vercel.json is available in the output directory', async () => {
    await copyFileAsync(VERCEL_JSON_INPUT, VERCEL_JSON_OUTPUT)

    const eleventy = await defEleventy({
      plugin: contentSecurityPolicyPlugin,
      // pluginConfig: {},
      dir: { output: ELEVENTY_INPUT }
    })

    assert.equal(eleventy.outputDir, './_site/')
  })

  it('throws an error when no hosting provider config file is available in the output directory (e.g. _headers, vercel.json) and no hosting is specified in the plugin options', async () => {
    try {
      await defEleventy({
        plugin: contentSecurityPolicyPlugin,
        pluginConfig: {},
        dir: { output: ELEVENTY_INPUT }
      })
    } catch (err) {
      assert.match(err.message, /hosting not set in plugin options/)
    }
  })
})
