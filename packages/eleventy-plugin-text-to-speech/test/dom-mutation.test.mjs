import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { JSDOM } from 'jsdom'
import {
  insertAudioPlayersMatchingCssSelector,
  insertAudioPlayersMatchingXPathExpression
} from '../lib/dom/mutations.js'
import { FIXTURES_ROOT } from '@jackdbd/eleventy-test-utils'

describe('dom mutations', () => {
  const filepath = path.join(
    FIXTURES_ROOT,
    'html',
    'page-with-many-texts-to-synthesize.html'
  )

  const html = fs.readFileSync(filepath, 'utf8')
  const dom = new JSDOM(html)

  describe('insertAudioPlayersMatchingCssSelector', () => {
    it.todo(`add tests`)
  })

  describe('insertAudioPlayersMatchingXPathExpression', () => {
    it.todo(`add tests`)
  })
})
