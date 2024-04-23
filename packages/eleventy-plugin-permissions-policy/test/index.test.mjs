import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it, beforeEach, afterEach } from 'node:test'
import util from 'node:util'
import {
  _HEADERS_OUTPUT,
  ELEVENTY_INPUT,
  FIXTURES_ROOT,
  VERCEL_JSON_OUTPUT,
  defEleventy,
  headersContent,
  vercelJsonObj,
  waitMs
} from '@jackdbd/eleventy-test-utils'
import { permissionsPolicyPlugin } from '../lib/index.js'

const readFileAsync = util.promisify(fs.readFile)
const copyFileAsync = util.promisify(fs.copyFile)
const unlinkAsync = util.promisify(fs.unlink)

const _HEADERS_INPUT = path.join(FIXTURES_ROOT, 'plain-text', '_headers')
const VERCEL_JSON_INPUT = path.join(FIXTURES_ROOT, 'json', 'vercel.json')

const HOSTING = 'cloudflare-pages'

const CONFIG_JSON_FILEPATH = path.join(
  ELEVENTY_INPUT,
  'eleventy-plugin-permissions-policy-config.json'
)

const DIRECTIVES = [
  { feature: 'autoplay', allowlist: ['*'] },
  { feature: 'geolocation', allowlist: ['self'] },
  {
    feature: 'camera',
    allowlist: ['self', 'https://trusted-site.example']
  },
  { feature: 'fullscreen', allowlist: [] }
]

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

describe('permissionsPolicyPlugin', () => {
  const timeoutMs = 10000

  beforeEach(async () => {
    await cleanup()
  })

  afterEach(async () => {
    await cleanup()
  })

  it('does not create a _headers file when no Permissions-Policy directives are specified', async () => {
    await defEleventy({
      plugin: permissionsPolicyPlugin,
      pluginConfig: { directives: [], hosting: 'cloudflare-pages' },
      dir: { output: ELEVENTY_INPUT }
    })

    assert.equal(fs.existsSync(_HEADERS_OUTPUT), false)
  })

  it('does not create a vercel.json file when no Permissions-Policy directives are specified', async () => {
    await defEleventy({
      plugin: permissionsPolicyPlugin,
      pluginConfig: { directives: [], hosting: 'vercel' },
      dir: { output: ELEVENTY_INPUT }
    })

    assert.equal(fs.existsSync(VERCEL_JSON_OUTPUT), false)
  })

  it('allows an empty user config when a _headers file is available in the output directory', async () => {
    await copyFileAsync(_HEADERS_INPUT, _HEADERS_OUTPUT)

    const eleventy = await defEleventy({
      plugin: permissionsPolicyPlugin,
      // pluginConfig: {},
      dir: { output: ELEVENTY_INPUT }
    })

    assert.equal(eleventy.outputDir, './_site/')
  })

  it('allows an empty user config when vercel.json is available in the output directory', async () => {
    await copyFileAsync(VERCEL_JSON_INPUT, VERCEL_JSON_OUTPUT)

    const eleventy = await defEleventy({
      plugin: permissionsPolicyPlugin,
      // pluginConfig: {},
      dir: { output: ELEVENTY_INPUT }
    })

    assert.equal(eleventy.outputDir, './_site/')
  })

  it('creates a _headers file containing the expected Permissions-Policy and Feature-Policy', async () => {
    await defEleventy({
      plugin: permissionsPolicyPlugin,
      pluginConfig: {
        // https://developer.chrome.com/en/docs/privacy-sandbox/permissions-policy/#migration-from-feature-policy
        directives: DIRECTIVES,
        hosting: HOSTING,
        includeFeaturePolicy: true
      },
      dir: { output: ELEVENTY_INPUT }
    })

    await waitMs(1000)
    const str = await headersContent()
    // console.log('=== _headers ===')
    // console.log(str)

    assert.match(str, /Permissions-Policy:/)
    assert.match(str, /autoplay=\*,/)
    assert.match(
      str,
      new RegExp(`camera=\\(self "https://trusted-site.example"\\),`)
    )
    assert.match(str, /fullscreen=\(\)/)
    assert.match(str, /geolocation=\(self\),/)

    assert.match(str, /Feature-Policy:/)
    assert.match(str, /autoplay \*;/)
    assert.match(
      str,
      new RegExp(`camera 'self' 'https://trusted-site.example';`)
    )
    assert.match(str, /fullscreen 'none'/)
    assert.match(str, /geolocation 'self';/)
  })

  it(`add Permissions-Policy to an existing _headers file`, async () => {
    await copyFileAsync(_HEADERS_INPUT, _HEADERS_OUTPUT)
    const str_before = (await readFileAsync(_HEADERS_OUTPUT)).toString()
    assert.doesNotMatch(str_before, /Permissions-Policy:/)

    await defEleventy({
      plugin: permissionsPolicyPlugin,
      pluginConfig: {
        directives: DIRECTIVES,
        hosting: HOSTING,
        includeFeaturePolicy: true
      },
      dir: { output: ELEVENTY_INPUT }
    })

    const str_after = await headersContent()

    assert.match(str_after, /Permissions-Policy:/)
    // see directives above
    assert.match(str_after, /autoplay=\*,/)
    assert.match(str_after, /geolocation=\(self\),/)
  })

  it(`add Permissions-Policy to an existing vercel.json file`, async () => {
    await copyFileAsync(VERCEL_JSON_INPUT, VERCEL_JSON_OUTPUT)
    const str_before = (await readFileAsync(VERCEL_JSON_OUTPUT)).toString()
    const obj_before = JSON.parse(str_before)
    const arr_before = obj_before.headers.filter((h) => h.source === '/*')
    assert.equal(arr_before.length, 0)

    await defEleventy({
      plugin: permissionsPolicyPlugin,
      pluginConfig: {
        directives: DIRECTIVES,
        hosting: 'vercel',
        includeFeaturePolicy: true
      },
      dir: { output: ELEVENTY_INPUT }
    })

    await waitMs(1000)
    const obj_after = await vercelJsonObj()
    const arr_after = obj_after.headers.filter((h) => h.source === '/*')
    // console.log('=== arr_after[0].headers ===', arr_after[0].headers)
    assert.equal(arr_after.length, 1)
    assert.equal(arr_after[0].headers.length, 2)
    assert.equal(arr_after[0].headers[0].key, 'Permissions-Policy')
    const pp = arr_after[0].headers[0].value
    assert.equal(arr_after[0].headers[1].key, 'Feature-Policy')
    const fp = arr_after[0].headers[1].value

    // see directives above
    assert.match(pp, /autoplay=\*/)
    assert.match(pp, /fullscreen=\(\)/)
    assert.match(pp, /geolocation=\(self\)/)

    assert.match(fp, /autoplay \*/)
    assert.match(fp, /fullscreen 'none'/)
    assert.match(fp, /geolocation 'self'/)
  })

  it('allows an empty user config when a _headers file is available in the output directory', async () => {
    await copyFileAsync(_HEADERS_INPUT, _HEADERS_OUTPUT)

    const eleventy = await defEleventy({
      plugin: permissionsPolicyPlugin,
      // pluginConfig: {},
      dir: { output: ELEVENTY_INPUT }
    })

    assert.equal(eleventy.outputDir, './_site/')
  })

  it('allows an empty user config when vercel.json is available in the output directory', async () => {
    await copyFileAsync(VERCEL_JSON_INPUT, VERCEL_JSON_OUTPUT)

    const eleventy = await defEleventy({
      plugin: permissionsPolicyPlugin,
      // pluginConfig: {},
      dir: { output: ELEVENTY_INPUT }
    })

    assert.equal(eleventy.outputDir, './_site/')
  })

  it('throws an error when no hosting provider config file is available in the output directory (e.g. _headers, vercel.json) and no hosting is specified in the plugin options', () => {
    assert.rejects(() => {
      return defEleventy({
        plugin: permissionsPolicyPlugin,
        dir: { output: ELEVENTY_INPUT }
      })
    })
  })
})
