import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { JSDOM } from 'jsdom'
import {
  cssSelectorMatchesToTexts,
  xPathExpressionMatchesToTexts
} from '../lib/dom/matchers.js'
import { FIXTURES_ROOT } from '@jackdbd/eleventy-test-utils'

describe('dom matchers', () => {
  const filepath = path.join(
    FIXTURES_ROOT,
    'html',
    'page-with-many-texts-to-synthesize.html'
  )

  const html = fs.readFileSync(filepath, 'utf8')
  const dom = new JSDOM(html)

  describe('cssSelectorMatchesToTexts', () => {
    it(`finds all texts that match 'h2' (element selector)`, () => {
      const res = cssSelectorMatchesToTexts({ dom, selector: 'h2' })

      assert.equal(res.error, undefined)
      const arr = res.value
      assert.equal(arr.length, 3)

      assert.equal(arr[0], 'Lorem ipsum')
      assert.equal(arr[1], 'Some article in English')
      assert.equal(arr[2], 'Articolo scritto in Italiano')
    })

    it(`finds all texts that match 'h3' (element selector)`, () => {
      const res = cssSelectorMatchesToTexts({ dom, selector: 'h3' })

      assert.equal(res.error, undefined)
      const arr = res.value
      assert.equal(arr.length, 0)
    })

    it(`finds all texts that match '.tts' (class selector)`, () => {
      const res = cssSelectorMatchesToTexts({ dom, selector: '.tts' })

      assert.equal(res.error, undefined)
      const arr = res.value
      assert.equal(arr.length, 1)

      assert.equal(
        arr[0],
        'This is some text that should be synthesized into speech.'
      )
    })

    it(`finds all texts that match '#english-article ol p' (id + descendant selector)`, () => {
      const res = cssSelectorMatchesToTexts({
        dom,
        selector: '#english-article ol p'
      })

      assert.equal(res.error, undefined)
      const arr = res.value
      assert.equal(arr.length, 2)

      assert.equal(arr[0], 'This is some text spoken in british english.')
      assert.equal(arr[1], 'This is some text spoken in indian english.')
    })

    it(`finds all texts that match '*[data-language="it"]' (universal + data attribute selector)`, () => {
      const res = cssSelectorMatchesToTexts({
        dom,
        selector: '*[data-language="it"]'
      })

      assert.equal(res.error, undefined)
      const arr = res.value
      assert.equal(arr.length, 2)

      assert.equal(arr[0], 'Articolo scritto in Italiano')
      assert.equal(arr[1], 'Questo è del testo parlato in italiano.')
    })
  })

  describe('xPathExpressionMatchesToTexts', () => {
    it(`finds all texts matching XPath expression '//p[contains(., "this paragraph does not exist in this page")]'`, () => {
      const res = xPathExpressionMatchesToTexts({
        dom,
        expression:
          '//p[contains(., "this paragraph does not exist in this page")]'
      })

      assert.equal(res.error, undefined)
      const arr = res.value
      assert.equal(arr.length, 0)
    })

    it(`finds all texts matching XPath expression '//p[contains(., "consectetur adipiscing")]'`, () => {
      const res = xPathExpressionMatchesToTexts({
        dom,
        expression: '//p[contains(., "consectetur adipiscing")]'
      })

      assert.equal(res.error, undefined)
      const arr = res.value
      assert.equal(arr.length, 3)

      // I intentionally left some white spaces in the HTML file. I wrote it like this:
      // <p>
      //   Lorem ipsum...
      // </p>
      assert.equal(
        arr[0],
        '\n        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras nec lobortis quam. Nunc interdum pulvinar odio, quis iaculis nunc aliquam nec. Nulla eleifend consectetur interdum. Phasellus et lacus ipsum. Nam tempor semper enim vitae vehicula. Sed lacinia vestibulum massa. Aliquam porta ultricies arcu convallis elementum. In in aliquet ipsum. Morbi ligula neque, pellentesque in hendrerit consequat, ultricies eu orci. Sed sagittis, libero et semper pellentesque, sapien est finibus purus, non ullamcorper neque nisl vel libero. Nunc commodo molestie congue. Fusce ut tincidunt nisl. Donec auctor felis quis lectus dictum ornare non a nibh. Mauris non nulla vel nisl vestibulum facilisis. Vestibulum vestibulum est sit amet nulla ultricies ultricies. Donec eu enim eu erat tempus gravida quis non velit.\n      '
      )
    })

    it(`finds all texts matching XPath expression '//p[starts-with(., "Lorem ipsum dolor sit amet")]'`, () => {
      const res = xPathExpressionMatchesToTexts({
        dom,
        expression: '//p[starts-with(., "Lorem ipsum dolor sit amet")]'
      })

      assert.equal(res.error, undefined)
      const arr = res.value
      assert.equal(arr.length, 1)

      assert.equal(
        arr[0],
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras nec lobortis quam. Nunc interdum pulvinar odio, quis iaculis nunc aliquam nec. Nulla eleifend consectetur interdum. Phasellus et lacus ipsum. Nam tempor semper enim vitae vehicula. Sed lacinia vestibulum massa. Aliquam porta ultricies arcu convallis elementum. In in aliquet ipsum. Morbi ligula neque, pellentesque in hendrerit consequat, ultricies eu orci. Sed sagittis, libero et semper pellentesque, sapien est finibus purus, non ullamcorper neque nisl vel libero. Nunc commodo molestie congue. Fusce ut tincidunt nisl. Donec auctor felis quis lectus dictum ornare non a nibh. Mauris non nulla vel nisl vestibulum facilisis. Vestibulum vestibulum est sit amet nulla ultricies ultricies. Donec eu enim eu erat tempus gravida quis non velit.'
      )
    })
  })
})
