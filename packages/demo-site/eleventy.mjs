import path from 'node:path'
import { fileURLToPath } from 'node:url'
import slugify from 'slugify'
import helmet from 'eleventy-plugin-helmet'
import navigation from '@11ty/eleventy-navigation'
import { ensureEnvVarsPlugin } from '@jackdbd/eleventy-plugin-ensure-env-vars'
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
} from './eleventy-test-utils/index.js'
import { copyright } from './src/shortcodes/index.js'

const __filename = fileURLToPath(import.meta.url)
const FILE_NAME = path.basename(__filename)

export default async function (eleventyConfig) {
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

  const { chat_id: chatId, token } = JSON.parse(process.env.TELEGRAM)
  eleventyConfig.addPlugin(telegramPlugin, {
    chatId,
    token,
    textBeforeBuild: `🕚 <b>Undici demo-site</b>\n\nBuild start.\n\nSent by <code>${FILE_NAME}</code>`,
    textAfterBuild: `🕚 <b>Undici demo-site</b>\n\nBuild finished.\n\nSent by <code>${FILE_NAME}</code>`
  })

  // Static assets
  eleventyConfig.addPassthroughCopy({
    'src/includes/assets/css': 'assets/css',
    'src/includes/assets/fonts': 'assets/fonts',
    'src/includes/assets/img': 'assets/img',
    'src/includes/assets/js': 'assets/js'
  })

  // https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables
  console.log('=== ENVIRONMENT ===', {
    // environment variables set by Cloudflare Pages
    CF_PAGES: process.env.CF_PAGES,
    CF_PAGES_BRANCH: process.env.CF_PAGES_BRANCH,
    CF_PAGES_COMMIT_SHA: process.env.CF_PAGES_COMMIT_SHA,
    CF_PAGES_URL: process.env.CF_PAGES_URL,

    // environment variables set by Eleventy
    // https://www.11ty.dev/docs/environment-vars/#eleventy-supplied
    ELEVENTY_ROOT: process.env.ELEVENTY_ROOT,
    ELEVENTY_SOURCE: process.env.ELEVENTY_SOURCE,
    ELEVENTY_RUN_MODE: process.env.ELEVENTY_RUN_MODE,

    // Google Cloud Platform service accounts
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    SA_JSON_KEY_STORAGE_UPLOADER: process.env.SA_JSON_KEY_STORAGE_UPLOADER,
    SA_JSON_KEY_TEXT_TO_SPEECH: process.env.SA_JSON_KEY_TEXT_TO_SPEECH,

    NODE_ENV: process.env.NODE_ENV,
    NODE_VERSION: process.env.NODE_VERSION
  })

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

  // https://1a7644b7.undici.pages.dev/assets/audio/69c692a30cf426b8ec5e7aa40e478445.opus
  // https://undici.pages.dev/assets/audio/69c692a30cf426b8ec5e7aa40e478445.opus
  // const hrefBase = `http://localhost:8090/assets/audio`
  const hrefBase = `/assets/audio` // this fails because of a Zod schema
  // const hrefBase = `https://undici.pages.dev/assets/audio`

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
