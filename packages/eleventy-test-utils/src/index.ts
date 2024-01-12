import path from 'node:path'
import { fileURLToPath } from 'node:url'
// import util from 'node:util'
import { Eleventy } from '@11ty/eleventy'

const __filename = fileURLToPath(import.meta.url)
// const __dirname = util.dirname(__filename)

export const REPO_ROOT = path.join(__filename, '..', '..', '..', '..')
export const ELEVENTY_INPUT = path.join(REPO_ROOT, 'assets', 'html-pages')
export const HEADERS_FILEPATH = path.join(ELEVENTY_INPUT, '_headers')
export const HEADERS_CONTENT = '# Here are my custom HTTP response headers'

// By default, Eleventy listens to an `eleventy.layout` event
export const INITIAL_ELEVENTY_EVENTS_COUNT = 1

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
