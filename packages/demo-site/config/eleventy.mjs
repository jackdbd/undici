import fs from 'node:fs'
import slugify from 'slugify'
import helmet from 'eleventy-plugin-helmet'
import navigation from '@11ty/eleventy-navigation'
import { ensureEnvVarsPlugin } from '@jackdbd/eleventy-plugin-ensure-env-vars'
// import { plausiblePlugin } from '@jackdbd/eleventy-plugin-plausible'
import { telegramPlugin } from '@jackdbd/eleventy-plugin-telegram'
import { textToSpeechPlugin } from '@jackdbd/eleventy-plugin-text-to-speech'
import { copyright } from '../src/shortcodes/index.js'

// add a dev server as soon as it is available in Eleventy 2.0
// https://www.11ty.dev/docs/watch-serve/

export default function (eleventyConfig) {
  // 11ty shortcodes
  // https://www.11ty.dev/docs/shortcodes/
  eleventyConfig.addShortcode('copyright', copyright)

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

  eleventyConfig.addPlugin(helmet)

  eleventyConfig.addPlugin(navigation)

  eleventyConfig.addPlugin(ensureEnvVarsPlugin)

  // const { api_key: apiKey, site_id: siteId } = JSON.parse(process.env.PLAUSIBLE)
  // eleventyConfig.addPlugin(plausiblePlugin, { apiKey, siteId })

  const { chat_id: chatId, token } = JSON.parse(process.env.TELEGRAM)
  if (process.env.SKIP_TELEGRAM_MESSAGES === undefined) {
    eleventyConfig.addPlugin(telegramPlugin, {
      chatId,
      token,
      textBeforeBuild: `<i>demo-site</i> build <b>START</b>`,
      textAfterBuild: `<i>demo-site</i> build <b>FINISHED</b>`
    })
  }

  let keyFilename
  if (process.env.CF_PAGES) {
    keyFilename = 'credentials.json'
    // on Cloudflare Pages, I set GCP_CREDENTIALS_JSON as a JSON string.
    fs.writeFileSync(keyFilename, process.env.GCP_CREDENTIALS_JSON)

    // I also have to set GOOGLE_APPLICATION_CREDENTIALS as a filepath because
    // when the eleventy-text-to-speech-plugin is registered without passing
    // `keyFilename`, it uses the environment variable
    // GOOGLE_APPLICATION_CREDENTIALS. That plugin expects
    // GOOGLE_APPLICATION_CREDENTIALS to be a filepath (as it should always be).
    process.env.GOOGLE_APPLICATION_CREDENTIALS = keyFilename
  } else {
    // on my laptop, GOOGLE_APPLICATION_CREDENTIALS is a filepath
    keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS
  }

  // Static assets
  eleventyConfig.addPassthroughCopy({
    'src/includes/assets/css': 'assets/css',
    'src/includes/assets/fonts': 'assets/fonts',
    'src/includes/assets/img': 'assets/img',
    'src/includes/assets/js': 'assets/js'
  })

  // https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables
  // console.log('=== ENVIRONMENT ===', {
  //   CF_PAGES: process.env.CF_PAGES,
  //   CF_PAGES_BRANCH: process.env.CF_PAGES_BRANCH,
  //   CF_PAGES_COMMIT_SHA: process.env.CF_PAGES_COMMIT_SHA,
  //   CF_PAGES_URL: process.env.CF_PAGES_URL,
  //   ELEVENTY_ENV: process.env.ELEVENTY_ENV,
  //   // GCP_CREDENTIALS_JSON: process.env.GCP_CREDENTIALS_JSON,
  //   GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  //   NODE_ENV: process.env.NODE_ENV
  // })

  // default configuration
  eleventyConfig.addPlugin(textToSpeechPlugin, {
    audioHost: process.env.CF_PAGES_URL
      ? new URL(`${process.env.CF_PAGES_URL}/assets/audio`)
      : new URL('http://localhost:8090/assets/audio')
  })

  // TODO: fix the text-to-speech plugin and re-enable
  if (false) {
    // host these audio files on Cloud Storage, and use a non-default voice
    eleventyConfig.addPlugin(textToSpeechPlugin, {
      audioHost: {
        bucketName: 'bkt-eleventy-plugin-text-to-speech-audio-files',
        keyFilename
      },
      // we are registering the plugin a second time, so we can't use the default
      // name for the 11ty collection created by this plugin (11ty would throw an
      // Error)
      collectionName: 'audio-items-cloud-storage',
      keyFilename,
      rules: [
        {
          xPathExpressions: [
            '//p[starts-with(., "If you prefer not to litter")]'
          ]
        },
        {
          cssSelectors: ['div.custom-tts > p:nth-child(2)']
        },
        {
          regex: new RegExp('posts\\/.*\\.html$'),
          xPathExpressions: [
            '//p[contains(., "savannas")]',
            '//p[starts-with(., "One of the most")]'
          ]
        }
      ],
      // we are registering the plugin a second time, so we can't use the default
      // name for the 11ty transform created by this plugin (11ty would NOT throw
      // an Error, but the plugin would not work as expected)
      transformName: 'inject-audio-tags-into-html-cloud-storage',
      voice: 'en-GB-Wavenet-C'
    })
  }

  // Static assets
  eleventyConfig.addPassthroughCopy({
    'src/includes/assets/css': 'assets/css',
    'src/includes/assets/fonts': 'assets/fonts',
    'src/includes/assets/img': 'assets/img',
    'src/includes/assets/js': 'assets/js'
  })

  // --- Eleventy dev server configuration ---------------------------------- //
  // https://www.11ty.dev/docs/dev-server/
  eleventyConfig.setServerOptions({
    liveReload: true,
    domDiff: true,
    port: 8080
  })

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
