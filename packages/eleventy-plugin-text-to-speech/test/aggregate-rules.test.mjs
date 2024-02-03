import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { JSDOM } from 'jsdom'
import { FIXTURES_ROOT } from '@jackdbd/eleventy-test-utils'
import { cloudTextToSpeechClientOptions } from '@jackdbd/eleventy-test-utils'
import { defClient as defGoogleCloudTextToSpeechClient } from '../lib/synthesis/gcp-text-to-speech.js'
import { defClient as defFilesystemClient } from '../lib/hosting/fs.js'
import { aggregateRules } from '../lib/aggregate-rules.js'

describe('aggregateRules', () => {
  const assetBasepath = path.join(FIXTURES_ROOT, 'tmp')

  const filepath = path.join(
    FIXTURES_ROOT,
    'html',
    'page-with-many-texts-to-synthesize.html'
  )

  const html = fs.readFileSync(filepath, 'utf8')
  const dom = new JSDOM(html)

  // not used by this test, I just need to pass it to the function
  const synthesis = defGoogleCloudTextToSpeechClient({
    ...cloudTextToSpeechClientOptions(),
    audioEncoding: 'MP3',
    voiceName: 'en-GB-Wavenet-C'
  })

  // not used by this test, I just need to pass it to the function
  const hosting = defFilesystemClient({
    hrefBase: `http://localhost:8090/audio`,
    assetBasepath
  })

  // all rules defined by the user in the Eleventy config file
  const rules = [
    {
      cssSelectors: ['.tts'],
      synthesis,
      hosting
    },
    {
      xPathExpressions: ['//p[contains(., "This is some text that should")]'],
      synthesis,
      hosting
    },
    {
      cssSelectors: ['.tts'],
      xPathExpressions: ['//p[contains(., "This is some text that should")]'],
      synthesis,
      hosting
    }
  ]

  // not used by this test, I just need to pass it to the function
  const regex = new RegExp('does-not-matter')

  it('allows to pass empty arrays for CSS selectors and XPath expressions', () => {
    const res = aggregateRules({ dom, matches: [], rules: [] })

    assert.equal(res.error, undefined)
    assert.notEqual(res.value, undefined)
    const entries = Object.entries(res.value)
    assert.equal(entries.length, 0)
  })

  it(`returns an error when using a match index greater than or equal to the number of rules`, () => {
    const res = aggregateRules({
      dom,
      matches: [{ idx: 3, regex, matched: true }],
      rules
    })

    assert.notEqual(res.error, undefined)
    assert.equal(res.value, undefined)
  })

  it(`allows to combine rules, and deduplicate matches (CSS selector)`, () => {
    const res = aggregateRules({
      dom,
      // rules that actually matched when building the Eleventy site
      matches: [{ idx: 0, regex, matched: true }],
      rules
    })

    assert.equal(res.error, undefined)
    const entries = Object.entries(res.value)
    assert.equal(entries.length, 1)
  })

  it(`allows to combine rules, and deduplicate matches (XPath expression)`, () => {
    const res = aggregateRules({
      dom,
      matches: [{ idx: 1, regex, matched: true }],
      rules
    })

    assert.equal(res.error, undefined)
    const entries = Object.entries(res.value)
    assert.equal(entries.length, 2)
  })

  it(`allows to combine rules, and deduplicate matches (CSS selector and XPath expression)`, () => {
    const res = aggregateRules({
      dom,
      matches: [{ idx: 2, regex, matched: true }],
      rules
    })

    assert.equal(res.error, undefined)

    const arr = Object.values(res.value)

    assert.equal(arr[0].cssSelectors.length, 1)
    assert.equal(arr[0].cssSelectors[0], '.tts')
    assert.equal(arr[0].xPathExpressions.length, 1)
    assert.equal(
      arr[0].xPathExpressions[0],
      '//p[contains(., "This is some text that should")]'
    )

    assert.equal(arr[1].cssSelectors.length, 0)
    assert.equal(arr[1].xPathExpressions.length, 1)
    assert.equal(
      arr[1].xPathExpressions[0],
      '//p[contains(., "This is some text that should")]'
    )
  })
})
