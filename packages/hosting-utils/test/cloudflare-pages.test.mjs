import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it, beforeEach, afterEach } from 'node:test'
import util from 'node:util'
import {
  _HEADERS_OUTPUT,
  FIXTURES_ROOT,
  fileContentAfterMs,
  removeHostingFile,
  writeEmptyHostingFile
} from '@jackdbd/eleventy-test-utils'
import { updateHeaders } from '../lib/cloudflare-pages.js'

const copyFileAsync = util.promisify(fs.copyFile)

const _HEADERS_INPUT = path.join(FIXTURES_ROOT, 'plain-text', '_headers')

describe('updateHeaders (_headers)', () => {
  beforeEach(() => {
    removeHostingFile('_headers')
  })

  afterEach(() => {
    removeHostingFile('_headers')
  })

  it('adds the X-Test header to an existing _headers, in the matching sources', async () => {
    writeEmptyHostingFile('_headers')

    const headerKey = 'X-Test'
    const headerValue = `${Math.random() * 10}`
    const filepath = _HEADERS_OUTPUT

    const before = await fileContentAfterMs(filepath, 0)

    const { error, value } = await updateHeaders({
      filepath,
      headerKey,
      headerValue,
      sources: ['/404.html', '/index.html']
    })

    assert.equal(error, undefined)
    assert.notEqual(value, undefined)

    const after = await fileContentAfterMs(filepath, 0)
    assert.notEqual(before, after)
  })
})
