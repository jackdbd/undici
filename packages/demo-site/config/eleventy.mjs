import path from 'node:path'
import slugify from 'slugify'
import helmet from 'eleventy-plugin-helmet'
import navigation from '@11ty/eleventy-navigation'
import { ensureEnvVarsPlugin } from '@jackdbd/eleventy-plugin-ensure-env-vars'
import { permissionsPolicyPlugin } from '@jackdbd/eleventy-plugin-permissions-policy'
import { telegramPlugin } from '@jackdbd/eleventy-plugin-telegram'
import { textToSpeechPlugin } from '@jackdbd/eleventy-plugin-text-to-speech'
import { defClient as defCloudflareR2Client } from '@jackdbd/eleventy-plugin-text-to-speech/hosting/cloudflare-r2'
import { defClient as defCloudStorageClient } from '@jackdbd/eleventy-plugin-text-to-speech/hosting/cloud-storage'
import { defClient as defFilesystemClient } from '@jackdbd/eleventy-plugin-text-to-speech/hosting/fs'
import { defClient as defGoogleCloudTextToSpeechClient } from '@jackdbd/eleventy-plugin-text-to-speech/synthesis/gcp-text-to-speech'
import {
  CLOUD_STORAGE_BUCKET_AUDIO_FILES_NAME,
  CLOUDFLARE_R2_BUCKET_AUDIO_FILES_CUSTOM_DOMAIN,
  CLOUDFLARE_R2_BUCKET_AUDIO_FILES_NAME,
  CLOUDFLARE_ACCOUNT_ID,
  cloudStorageUploaderClientOptions,
  cloudTextToSpeechClientOptions,
  REPO_ROOT
} from '@jackdbd/eleventy-test-utils'
import { copyright } from '../src/shortcodes/index.js'

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

  eleventyConfig.addPlugin(permissionsPolicyPlugin, {
    directives: [
      { feature: 'autoplay', allowlist: ['*'] },
      { feature: 'geolocation', allowlist: ['self'] },
      {
        feature: 'camera',
        allowlist: ['self', 'https://trusted-site.example']
      },
      { feature: 'fullscreen', allowlist: [] }
    ],
    includeFeaturePolicy: true,
    jsonRecap: true
  })

  const { chat_id: chatId, token } = JSON.parse(process.env.TELEGRAM)
  if (process.env.SKIP_TELEGRAM_MESSAGES === undefined) {
    eleventyConfig.addPlugin(telegramPlugin, {
      chatId,
      token,
      textBeforeBuild: `<i>demo-site</i> build <b>START</b>`,
      textAfterBuild: `<i>demo-site</i> build <b>FINISHED</b>`
    })
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
  //   // environment variables supplied by Eleventy
  //   // https://www.11ty.dev/docs/environment-vars/#eleventy-supplied
  //   ELEVENTY_ROOT: process.env.ELEVENTY_ROOT,
  //   ELEVENTY_SOURCE: process.env.ELEVENTY_SOURCE,
  //   ELEVENTY_RUN_MODE: process.env.ELEVENTY_RUN_MODE,
  //   GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  //   SA_JSON_KEY_STORAGE_UPLOADER: process.env.SA_JSON_KEY_STORAGE_UPLOADER,
  //   SA_JSON_KEY_TEXT_TO_SPEECH: process.env.SA_JSON_KEY_TEXT_TO_SPEECH,
  //   NODE_ENV: process.env.NODE_ENV
  // })

  const ttsOpusEnUS = defGoogleCloudTextToSpeechClient({
    ...cloudTextToSpeechClientOptions(),
    audioEncoding: 'OGG_OPUS',
    voiceName: 'en-US-Standard-J'
  })

  const ttsOpusEnIN = defGoogleCloudTextToSpeechClient({
    ...cloudTextToSpeechClientOptions(),
    audioEncoding: 'OGG_OPUS',
    voiceName: 'en-IN-Neural2-A'
  })

  const ttsMp3EnAU = defGoogleCloudTextToSpeechClient({
    ...cloudTextToSpeechClientOptions(),
    audioEncoding: 'MP3',
    voiceName: 'en-AU-Standard-B'
  })

  const assetBasepath = path.join(
    REPO_ROOT,
    'packages',
    'demo-site',
    '_site',
    'assets',
    'audio'
  )

  const hrefBase = `http://localhost:8090/assets/audio`

  const fsClient = defFilesystemClient({ assetBasepath, hrefBase })

  const { access_key_id: accessKeyId, secret_access_key: secretAccessKey } =
    JSON.parse(process.env.CLOUDFLARE_R2)

  const cloudflareR2 = defCloudflareR2Client({
    accountId: CLOUDFLARE_ACCOUNT_ID,
    accessKeyId,
    secretAccessKey,
    bucketName: CLOUDFLARE_R2_BUCKET_AUDIO_FILES_NAME,
    customDomain: CLOUDFLARE_R2_BUCKET_AUDIO_FILES_CUSTOM_DOMAIN
  })

  const cloudStorage = defCloudStorageClient({
    ...cloudStorageUploaderClientOptions(),
    bucketName: CLOUD_STORAGE_BUCKET_AUDIO_FILES_NAME
  })

  eleventyConfig.addPlugin(textToSpeechPlugin, {
    // If we register this plugin a second time, we have to a different name for
    // the 11ty collection created by this plugin (otherwise 11ty would throw an
    // Error).
    rules: [
      {
        xPathExpressions: [
          '//p[starts-with(., "If you prefer not to litter")]',
          '//p[contains(., "Cultural depictions of lions")]'
        ],
        synthesis: ttsOpusEnUS,
        hosting: fsClient
      },
      {
        cssSelectors: ['div.custom-tts > p:nth-child(2)'],
        synthesis: ttsOpusEnIN,
        hosting: cloudStorage
      },
      {
        cssSelectors: ['div.custom-tts > p:nth-child(2)'],
        synthesis: ttsMp3EnAU,
        hosting: fsClient
      },
      {
        regex: new RegExp('posts\\/.*\\.html$'),
        xPathExpressions: [
          '//p[contains(., "savannas")]',
          '//p[starts-with(., "One of the most")]'
        ],
        synthesis: ttsMp3EnAU,
        hosting: cloudflareR2
      }
    ]
  })

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
