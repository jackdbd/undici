import makeDebug from 'debug'
import { Eleventy } from '@11ty/eleventy'
import { isOnGithub } from '@jackdbd/checks/environment'

const debug = makeDebug(`11ty-test-utils`)

export {
  CLOUD_STORAGE_BUCKET_AUDIO_FILES,
  INITIAL_ELEVENTY_EVENTS_COUNT,
  REPO_ROOT,
  ELEVENTY_INPUT,
  HEADERS_CONTENT,
  HEADERS_FILEPATH
} from './constants.js'

export const waitMs = (ms: number) => {
  let timeout: NodeJS.Timeout
  return new Promise((resolve) => {
    timeout = setTimeout(() => {
      resolve(timeout)
    }, ms)
  })
}

export interface Options {
  input?: string
  output?: string
  plugin?: () => void
  pluginConfig?: object
  dir?: { input: string; output: string }
}

export const makeEleventy = async (options?: Options) => {
  const opt = options || {}
  const input = opt.input
  const output = opt.output
  const plugin = opt.plugin
  const pluginConfig = opt.pluginConfig || {}
  const dir = opt.dir || { input: '.', output: '_site' }

  // https://github.com/11ty/eleventy/blob/0eb145db21f7479040041243bb5c9bc5149c3a49/test/I18nPluginTest.js#L82
  const eleventy = new Eleventy(input, output, {
    config: function (eleventyConfig) {
      if (plugin) {
        eleventyConfig.addPlugin(plugin, pluginConfig)
      }
    }
  })

  // We need to initialize the Eleventy configuration manually, otherwise
  // eleventy.eleventyConfig is null
  await eleventy.initializeConfig()

  const userConfig = eleventy.eleventyConfig.userConfig
  // monkey patch the userConfig. I couldn't figure out a better way to do this
  if (dir && dir.input) {
    userConfig.dir.input = dir.input
  }
  if (dir && dir.output) {
    userConfig.dir.output = dir.output
  }

  //   console.log('=== eleventy.rawInput ===', eleventy.rawInput)
  //   console.log('=== eleventy.rawOutput ===', eleventy.rawOutput)
  //   console.log('=== eleventy.inputDir ===', eleventy.inputDir)
  //   console.log('=== eleventy.outputDir ===', eleventy.outputDir)

  // This is a trick to force Eleventy to evaluate all config (i.e. apply the 11ty plugin config)
  await eleventy.toJSON()

  return eleventy
}

// TODO: make variations of this function:
// - one with a valid service account
// - one with a service account that is not authorized to perform the operation

export interface CredentialsConfig {
  key: string
  filepath: string
}

export const clientCredentials = ({ key, filepath }: CredentialsConfig) => {
  const val = process.env[key]

  if (isOnGithub(process.env)) {
    console.log(`=== RUNNING ON GIHUB ACTIONS ===`)
    debug(`checking environment variable ${key}`)
    if (!val) {
      throw new Error(`environment variable ${key} not set`)
    }
    const sa = JSON.parse(val)
    const client_email = sa.client_email as string
    const private_key = sa.private_key as string
    return { credentials: { client_email, private_key } }
  } else if (process.env.CF_PAGES) {
    console.log(`=== RUNNING ON CLOUDFLARE PAGES ===`)
    debug(`checking environment variable ${key}`)
    if (!val) {
      throw new Error(`environment variable ${key} not set`)
    }
    const sa = JSON.parse(val)
    const client_email = sa.client_email as string
    const private_key = sa.private_key as string
    return { credentials: { client_email, private_key } }
  } else {
    return { keyFilename: filepath }
  }
}

export const cloudStorageUploaderClientOptions = () => {
  return clientCredentials({
    key: 'SA_JSON_KEY_STORAGE_UPLOADER',
    filepath: '/run/secrets/prj-kitchen-sink/sa-storage-uploader'
  })
}

export const cloudTextToSpeechClientOptions = () => {
  return clientCredentials({
    key: 'SA_JSON_KEY_TEXT_TO_SPEECH',
    // TODO: create a service account JSON key for Text-To-Speech and use that one.
    filepath: '/run/secrets/prj-kitchen-sink/sa-storage-uploader'
  })
}
