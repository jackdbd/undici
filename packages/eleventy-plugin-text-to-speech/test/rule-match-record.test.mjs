import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { JSDOM } from 'jsdom'
import { FIXTURES_ROOT } from '@jackdbd/eleventy-test-utils'
import { ruleMatchRecord } from '../lib/rule-match-record.js'

describe('ruleMatchRecord', () => {
  const filepath = path.join(
    FIXTURES_ROOT,
    'html',
    'page-with-many-texts-to-synthesize.html'
  )

  const html = fs.readFileSync(filepath, 'utf8')
  const dom = new JSDOM(html)

  it('allows to pass empty arrays for CSS selectors and XPath expressions', () => {
    const res = ruleMatchRecord({ dom, cssSelectors: [], xPathExpressions: [] })

    assert.equal(res.error, undefined)
    assert.notEqual(res.value, undefined)
    const entries = Object.entries(res.value)
    assert.equal(entries.length, 0)
  })

  it(`allows to combine CSS selectors and XPath expressions, and deduplicate matches`, () => {
    const res = ruleMatchRecord({
      dom,
      cssSelectors: ['.tts', '#english-article p', '*[data-language="it"]'],
      // This XPath expression matches 2 texts in the test fixture, but we
      // already counted one of them because it matched the .tts selector
      xPathExpressions: ['//p[contains(., "This is some text that should")]']
    })

    assert.equal(res.error, undefined)
    assert.notEqual(res.value, undefined)
    const entries = Object.entries(res.value)

    assert.equal(entries.length, 11)

    // here mr stands for match record
    // entries.forEach(([hash, mr]) => {
    //   const { text, cssSelectors, xPathExpressions } = mr
    //   console.log(hash, { text, cssSelectors, xPathExpressions })
    // })

    const [hash, mr] = entries.find(([key, value]) => {
      return value.cssSelectors.includes('.tts')
    })

    assert.equal(mr.cssSelectors[0], '.tts')
    assert.equal(
      mr.xPathExpressions[0],
      '//p[contains(., "This is some text that should")]'
    )
  })
})
