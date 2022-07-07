const fs = require('node:fs')
const path = require('node:path')
const slugify = require('slugify')
const navigation = require('@11ty/eleventy-navigation')
const { telegramPlugin } = require('@jackdbd/eleventy-plugin-telegram')
const {
  textToSpeechPlugin
} = require('@jackdbd/eleventy-plugin-text-to-speech')
const helmet = require('eleventy-plugin-helmet')
const shortcodes = require('../src/shortcodes')

// add a dev server as soon as it is available in Eleventy 2.0
// https://www.11ty.dev/docs/watch-serve/

module.exports = function (eleventyConfig) {
  const { chat_id: chatId, token } = JSON.parse(process.env.TELEGRAM)

  // 11ty shortcodes
  // https://www.11ty.dev/docs/shortcodes/
  Object.keys(shortcodes).forEach((name) => {
    eleventyConfig.addShortcode(name, shortcodes[name])
  })

  eleventyConfig.addFilter('slugify', function (str) {
    return slugify(str, {
      lower: true,
      remove: /[*+~.·,()'"`´%!?¿:@]/g,
      replacement: '-'
    })
  })

  eleventyConfig.addFilter('log', (value) => {
    console.log('=== LOG ===', value)
  })

  // https://www.11ty.dev/docs/collections/
  eleventyConfig.addCollection('pages-with-audio', (collectionApi) => {
    // const all_items = collectionApi.getAll()
    const items = collectionApi.getFilteredByGlob([
      '**/pages/*.njk',
      '**/posts/*.md'
    ])
    return items
  })

  eleventyConfig.addPlugin(helmet)
  eleventyConfig.addPlugin(navigation)

  eleventyConfig.addPlugin(telegramPlugin, {
    chatId,
    token,
    textBeforeBuild: `<i>demo-site</i> build <b>START</b>`,
    textAfterBuild: `<i>demo-site</i> build <b>FINISHED</b>`
  })

  // https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables
  console.log('=== ENVIRONMENT ===', {
    CF_PAGES: process.env.CF_PAGES,
    CF_PAGES_BRANCH: process.env.CF_PAGES_BRANCH,
    CF_PAGES_COMMIT_SHA: process.env.CF_PAGES_COMMIT_SHA,
    CF_PAGES_URL: process.env.CF_PAGES_URL,
    ELEVENTY_ENV: process.env.ELEVENTY_ENV,
    NODE_ENV: process.env.NODE_ENV
  })

  let keyFilename
  if (process.env.CF_PAGES) {
    keyFilename = 'sa-storage-uploader.json'
    // on Cloudflare Pages, GOOGLE_APPLICATION_CREDENTIALS is a JSON string, so
    // we need to write it to a file. I think this works automatically on GitHub
    // actions (using a GitHub secret), but I tried and it seems it is not
    // working automatically on Cloudflare Pages.
    fs.writeFile(
      keyFilename,
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      (err) => {
        if (err) {
          console.log(`=== ERROR ===${err.message}`)
        }
      }
    )
  } else {
    // on my laptop, GOOGLE_APPLICATION_CREDENTIALS is a filepath
    keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS
  }

  const audioHost = process.env.CF_PAGES_URL
    ? process.env.CF_PAGES_URL
    : 'http://localhost:8090'

  eleventyConfig.addPlugin(textToSpeechPlugin, {
    audioAssetsDir: 'assets/audio',
    audioEncoding: 'MP3',
    audioHost,
    cloudStorageBucket: 'bkt-eleventy-plugin-text-to-speech-audio-files',
    cssSelector: 'div.audio-demos',
    // regexPattern: '.*/posts/.*.html$',
    keyFilename,
    voice: { languageCode: 'en-GB', name: 'en-GB-Wavenet-C' }
  })

  // Static assets
  eleventyConfig.addPassthroughCopy({
    'src/includes/assets/css': 'assets/css',
    'src/includes/assets/fonts': 'assets/fonts',
    'src/includes/assets/img': 'assets/img',
    'src/includes/assets/js': 'assets/js'
  })

  console.log(
    '=== available 11ty collections for demo-site ===',
    Object.keys(eleventyConfig.collections)
  )

  // https://www.11ty.dev/docs/config/#configuration-options
  return {
    dataTemplateEngine: 'njk',
    dir: {
      data: '_data',
      includes: 'includes',
      input: 'src',
      layouts: 'layouts',
      output: '_site'
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    pathPrefix: '/',
    // https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix
    // pathPrefix: '/packages/demo-site/_site/',
    templateFormats: ['html', 'md', 'njk']
  }
}
