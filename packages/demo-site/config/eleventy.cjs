const path = require('node:path')
const { telegramPlugin } = require('@jackdbd/eleventy-telegram-plugin')

const ROOT = path.join(__filename, '..', '..')
const OUTPUT_DIR = path.join(ROOT, '_site')

// add a dev server as soon as it is available in Eleventy 2.0
// https://www.11ty.dev/docs/watch-serve/

module.exports = function (eleventyConfig) {
  const { chat_id: chatId, token } = JSON.parse(process.env.TELEGRAM)

  eleventyConfig.addPlugin(telegramPlugin, {
    chatId,
    token,
    textBeforeBuild: `<i>demo-site</i> build <b>START</b>`
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
    pathPrefix: '/',
    templateFormats: ['html', 'md', 'njk']
  }
}
