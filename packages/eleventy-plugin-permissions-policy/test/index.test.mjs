import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it, beforeEach, afterEach } from 'node:test'
import util from 'node:util'
import {
  makeEleventy,
  ELEVENTY_INPUT,
  HEADERS_FILEPATH,
  HEADERS_CONTENT
} from '@jackdbd/eleventy-test-utils'
import { permissionsPolicyPlugin } from '../lib/index.js'

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)
const unlinkAsync = util.promisify(fs.unlink)

const CONFIG_JSON_FILEPATH = path.join(
  ELEVENTY_INPUT,
  'eleventy-plugin-permissions-policy-config.json'
)

describe('permissionsPolicyPlugin', () => {
  const timeoutMs = 10000

  beforeEach(async () => {
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

  it('adds one `eleventy.after` event handler', async () => {
    const eleventy = await makeEleventy({
      input: undefined,
      output: undefined,
      plugin: permissionsPolicyPlugin,
      pluginConfig: {},
      dir: { output: ELEVENTY_INPUT }
    })

    const userConfig = eleventy.eleventyConfig.userConfig

    assert.equal(userConfig.events._eventsCount, 2)
    assert.equal(userConfig.events._events['eleventy.before'], undefined)
    assert.notEqual(userConfig.events._events['eleventy.after'], undefined)
  })

  it('default config generates neither Feature-Policy not Permissions-Policy header', async () => {
    const eleventy = await makeEleventy({
      input: undefined,
      output: undefined,
      plugin: permissionsPolicyPlugin,
      pluginConfig: {},
      dir: { output: ELEVENTY_INPUT }
    })

    const userConfig = eleventy.eleventyConfig.userConfig

    assert.equal(userConfig.events._eventsCount, 2)

    // const timeout = await waitMs(timeoutMs / 4)
    // clearTimeout(timeout)

    assert.equal(fs.existsSync(CONFIG_JSON_FILEPATH), false)

    const buffer = await readFileAsync(HEADERS_FILEPATH)
    const str = buffer.toString()
    assert.match(str, new RegExp(HEADERS_CONTENT))
    assert.doesNotMatch(str, /Feature-Policy:/)
    assert.doesNotMatch(str, /Permissions-Policy:/)
  })

  it('config with some directives', async () => {
    const eleventy = await makeEleventy({
      input: undefined,
      output: undefined,
      plugin: permissionsPolicyPlugin,
      pluginConfig: {
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
      },
      dir: { output: ELEVENTY_INPUT }
    })

    const userConfig = eleventy.eleventyConfig.userConfig

    assert.equal(userConfig.events._eventsCount, 2)

    // const timeout = await waitMs(timeoutMs / 4)
    // clearTimeout(timeout)

    const buffer = await readFileAsync(HEADERS_FILEPATH)
    const str = buffer.toString()

    assert.match(str, new RegExp(HEADERS_CONTENT))
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
})
