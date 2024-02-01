import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it, before, after } from 'node:test'
import { JSDOM } from 'jsdom'
import { FIXTURES_ROOT } from '@jackdbd/eleventy-test-utils'
import { cloudTextToSpeechClientOptions } from '@jackdbd/eleventy-test-utils'
import { defClient as defGoogleCloudTextToSpeechClient } from '../lib/synthesis/gcp-text-to-speech.js'
import { defClient as defFilesystemClient } from '../lib/hosting/fs.js'
import { injectAudioTagsUnbounded } from '../lib/eleventy/transforms.js'

const TMP_DIR = path.join(FIXTURES_ROOT, 'tmp')

const audioElements = (html) => {
  const dom = new JSDOM(html)
  const doc = dom.window.document
  return doc.querySelectorAll('audio')
}

describe('injectAudioTagsUnbounded', () => {
  const assetBasepath = path.join(FIXTURES_ROOT, 'tmp')
  const regex = new RegExp('^((?!404).)*\\.html$')

  const filename = 'page-with-many-texts-to-synthesize'
  const filepath = path.join(FIXTURES_ROOT, 'html', `${filename}.html`)
  const original_html = fs.readFileSync(filepath, 'utf8')
  const original_dom = new JSDOM(original_html)
  const original_doc = original_dom.window.document
  const original_audio_elements = original_doc.querySelectorAll('audio')

  // This is used in the transform, but since the transform is not called by
  // Eleventy, the file is not actually written to disk.
  const outputPath = path.join(
    FIXTURES_ROOT,
    'html',
    `${filename}.transformed.html`
  )

  const synthesis = defGoogleCloudTextToSpeechClient({
    ...cloudTextToSpeechClientOptions(),
    audioEncoding: 'MP3',
    voiceName: 'en-GB-Wavenet-C'
  })

  const hosting = defFilesystemClient({
    hrefBase: `http://localhost:8090/audio`,
    assetBasepath
  })

  // all rules defined by the user in the Eleventy config file
  const rules = [
    { regex, cssSelectors: ['h2'], synthesis, hosting },
    {
      regex,
      cssSelectors: ['.tts'],
      synthesis,
      hosting
    },
    {
      regex,
      xPathExpressions: ['//p[contains(., "This is some text that should")]'],
      synthesis,
      hosting
    },
    {
      regex,
      cssSelectors: ['.tts'],
      xPathExpressions: ['//p[contains(., "This is some text that should")]'],
      synthesis,
      hosting
    }
  ]

  before(() => {
    console.log('⚙️ === before: test suite setup ===')
    if (!fs.existsSync(TMP_DIR)) {
      fs.mkdirSync(TMP_DIR)
    }
  })

  after(() => {
    console.log('🧹 === after: test suite cleanup ===')
    if (fs.existsSync(TMP_DIR)) {
      fs.rmSync(TMP_DIR, { force: true, recursive: true })
    }
  })

  it(`inserts 3 <audio> elements when there are 3 <h2> elements`, async () => {
    const rules = [{ regex, cssSelectors: ['h2'], synthesis, hosting }]

    const html = await injectAudioTagsUnbounded(
      { rules },
      original_html,
      outputPath
    )

    assert.notEqual(html, undefined)
    assert.notEqual(html, original_html)

    assert.equal(original_audio_elements.length, 0)
    const nodes = audioElements(html)
    assert.equal(nodes.length, 3)
  })

  it(`inserts 1 <audio> element when there is 1 element that matches the CSS selector '.tts'`, async () => {
    const rules = [
      {
        regex,
        cssSelectors: ['.tts'],
        synthesis,
        hosting
      }
    ]

    const html = await injectAudioTagsUnbounded(
      { rules },
      original_html,
      outputPath
    )

    assert.notEqual(html, undefined)
    assert.notEqual(html, original_html)

    assert.equal(original_audio_elements.length, 0)
    const nodes = audioElements(html)
    assert.equal(nodes.length, 1)
  })

  it(`allows to use different combinations of rules, and deduplicate matches`, async () => {
    const rule_css = {
      regex,
      cssSelectors: ['.tts'],
      synthesis,
      hosting
    }

    const rule_xpath = {
      regex,
      xPathExpressions: ['//p[contains(., "This is some text that should")]'],
      synthesis,
      hosting
    }

    const rule_one_css_and_rule_two_xpath = [
      // This first rule, when applied to the test fixture used in this test,
      // matches one of the two elements matched by the XPath expression used in
      // the second rule. Namely we can omit it.
      rule_css,
      rule_xpath
    ]

    const rule_css_and_xpath_combined = [
      {
        regex,
        cssSelectors: ['.tts'],
        xPathExpressions: ['//p[contains(., "This is some text that should")]'],
        synthesis,
        hosting
      }
    ]

    const html_just_rule_css = await injectAudioTagsUnbounded(
      { rules: [rule_css] },
      original_html,
      outputPath
    )

    const html_rule_one_css_and_rule_two_xpath = await injectAudioTagsUnbounded(
      { rules: rule_one_css_and_rule_two_xpath },
      original_html,
      outputPath
    )

    const html_just_rule_xpath = await injectAudioTagsUnbounded(
      { rules: [rule_xpath] },
      original_html,
      outputPath
    )

    const html_rule_css_and_xpath_combined = await injectAudioTagsUnbounded(
      { rules: rule_css_and_xpath_combined },
      original_html,
      outputPath
    )

    const nodes_a = audioElements(html_just_rule_css)
    const nodes_b = audioElements(html_just_rule_xpath)
    const nodes_c = audioElements(html_rule_one_css_and_rule_two_xpath)
    const nodes_d = audioElements(html_rule_css_and_xpath_combined)

    assert.equal(nodes_a.length, 1)
    assert.equal(nodes_b.length, 2)
    assert.equal(nodes_c.length, 2)
    assert.equal(nodes_d.length, 2)
  })
})
