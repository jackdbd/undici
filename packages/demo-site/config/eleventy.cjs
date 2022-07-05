const path = require('node:path')
const slugify = require('slugify')
const { telegramPlugin } = require('@jackdbd/eleventy-plugin-telegram')
const {
  textToSpeechPlugin
} = require('@jackdbd/eleventy-plugin-text-to-speech')

const MONOREPO_ROOT = path.join(__filename, '..', '..', '..', '..')
const PACKAGE_ROOT = path.join(MONOREPO_ROOT, 'packages', 'demo-site')
const OUTPUT_DIR = path.join(PACKAGE_ROOT, '_site')

// add a dev server as soon as it is available in Eleventy 2.0
// https://www.11ty.dev/docs/watch-serve/

module.exports = function (eleventyConfig) {
  const { chat_id: chatId, token } = JSON.parse(process.env.TELEGRAM)

  eleventyConfig.addFilter('slugify', function (str) {
    return slugify(str, {
      lower: true,
      remove: /[*+~.·,()'"`´%!?¿:@]/g,
      replacement: '-'
    })
  })

  eleventyConfig.addFilter('log', (value) => {
    console.log('===', value)
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

  eleventyConfig.addPlugin(telegramPlugin, {
    chatId,
    token,
    textBeforeBuild: `<i>demo-site</i> build <b>START</b>`,
    textAfterBuild: `<i>demo-site</i> build <b>FINISHED</b>`
  })

  // const ELEVENTY_ENV = process.env.ELEVENTY_ENV

  eleventyConfig.addPlugin(textToSpeechPlugin, {
    audioEncoding: 'MP3',
    // audioEncoding: 'LINEAR16',
    audioHost: `http://localhost:8090/packages/demo-site/_site`,
    // regexPattern: '.*/posts/.*.html$',
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    voice: { languageCode: 'en-GB', name: 'en-GB-Wavenet-C' }
  })

  // https://www.11ty.dev/docs/config/#configuration-options
  return {
    dataTemplateEngine: 'njk',
    dir: {
      data: '_data',
      includes: 'includes',
      input: 'src',
      layouts: 'layouts',
      output: OUTPUT_DIR
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    // pathPrefix: '/',
    // https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix
    pathPrefix: '/packages/demo-site/_site/',
    templateFormats: ['html', 'md', 'njk']
  }
}
