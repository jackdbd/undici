import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it, beforeEach, afterEach } from 'node:test'
import util from 'node:util'
import {
  FIXTURES_ROOT,
  STATIC_SITE_BUILD_ROOT,
  removeHostingFile,
  fileContentAfterMs,
  writeEmptyHostingFile
} from '@jackdbd/eleventy-test-utils'
import { updateVercelJSON } from '../lib/vercel.js'

const copyFileAsync = util.promisify(fs.copyFile)

const SERVE_JSON_INPUT = path.join(FIXTURES_ROOT, 'json', 'serve.json')
// const VERCEL_JSON_INPUT = path.join(FIXTURES_ROOT, 'json', 'vercel.json')
const SERVE_JSON_OUTPUT = path.join(STATIC_SITE_BUILD_ROOT, 'serve.json')
// const VERCEL_JSON_OUTPUT = path.join(STATIC_SITE_BUILD_ROOT, 'vercel.json')

export const assertHeaderValue = ({
  haystack,
  headerKey,
  headerValue,
  source
}) => {
  const headers = haystack.headers.filter((h) => h.source === source)[0].headers
  const { key, value } = headers.filter((h) => h.key === headerKey)[0]
  assert.equal(key, headerKey)
  assert.equal(value, headerValue)
}

export const assertNotHeader = ({ haystack, source, headerKey }) => {
  if (haystack.headers) {
    const headers_source = haystack.headers.filter((h) => h.source === source)
    const headers = headers_source
      .map((hs) => hs.headers)
      .flat()
      .filter((h) => h.key === headerKey)

    if (headers.length > 0) {
      assert.notEqual(
        headers[0].key,
        headerKey,
        `source ${source} should NOT contain header ${headerKey}`
      )
    }
  }
}

describe('updateVercelJSON (serve.json)', () => {
  beforeEach(() => {
    removeHostingFile('serve.json')
  })

  afterEach(() => {
    removeHostingFile('serve.json')
  })

  it('adds the X-Test header to an existing serve.json, in the matching sources', async () => {
    writeEmptyHostingFile('serve.json')

    const headerKey = 'X-Test'
    const headerValue = `${Math.random() * 10}`
    const filepath = SERVE_JSON_OUTPUT

    const before = await fileContentAfterMs(filepath, 0)
    assertNotHeader({ haystack: before, headerKey, source: '/404.html' })
    assertNotHeader({ haystack: before, headerKey, source: '/index.html' })

    const { error, value } = await updateVercelJSON({
      filepath,
      headerKey,
      headerValue,
      sources: ['/404.html', '/index.html']
    })

    assert.equal(error, undefined)
    assert.notEqual(value, undefined)

    const after = await fileContentAfterMs(filepath, 0)
    assert.notEqual(before, after)
    assertHeaderValue({
      haystack: after,
      headerKey,
      headerValue,
      source: '/404.html'
    })
    assertHeaderValue({
      haystack: after,
      headerKey,
      headerValue,
      source: '/index.html'
    })
  })

  it('replaces an existing header in a serve.json, only in the matching sources', async () => {
    await copyFileAsync(SERVE_JSON_INPUT, SERVE_JSON_OUTPUT)

    const headerKey = 'Cache-Control'
    const filepath = SERVE_JSON_OUTPUT

    const before = await fileContentAfterMs(filepath, 0)
    assertHeaderValue({
      haystack: before,
      headerKey,
      headerValue: 'public, max-age=0, must-revalidate',
      source: '/service-worker.js'
    })
    assertHeaderValue({
      haystack: before,
      headerKey,
      headerValue: 'no-store',
      source: '/index.html'
    })

    const { error, value } = await updateVercelJSON({
      filepath,
      headerKey,
      headerValue: 'public, max-age=604800',
      sources: ['/index.html']
    })

    assert.equal(error, undefined)
    assert.notEqual(value, undefined)

    const after = await fileContentAfterMs(filepath, 0)

    assertHeaderValue({
      haystack: after,
      headerKey,
      headerValue: 'public, max-age=0, must-revalidate',
      source: '/service-worker.js'
    })

    assertHeaderValue({
      haystack: after,
      headerKey,
      headerValue: 'public, max-age=604800',
      source: '/index.html'
    })
  })
})
