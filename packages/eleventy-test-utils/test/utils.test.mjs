import assert from 'node:assert'
import { describe, it } from 'node:test'
import { isOnGithub } from '@jackdbd/checks/environment'
import { cloudStorageUploaderClientOptions } from '../lib/utils.js'

describe('cloudStorageUploaderClientOptions', () => {
  it('has credentials defined and keyFilename undefined when running on GitHub Actions or Cloudflare Pages', async () => {
    const { credentials, keyFilename } = cloudStorageUploaderClientOptions()
    if (isOnGithub(process.env) || process.env.CF_PAGES) {
      assert.equal(keyFilename, undefined)
      assert.notEqual(credentials, undefined)
    }
  })

  it('has credentials undefined and keyFilename defined when NOT running on GitHub Actions or Cloudflare Pages', async () => {
    const { credentials, keyFilename } = cloudStorageUploaderClientOptions()
    if (!isOnGithub(process.env) && process.env.CF_PAGES === undefined) {
      assert.notEqual(keyFilename, undefined)
      assert.equal(credentials, undefined)
    }
  })
})
