import { Eleventy } from '@11ty/eleventy'

export interface Options {
  input?: string
  output?: string
  plugin?: () => void
  pluginConfig?: object
  dir?: { input: string; output: string }
}

/**
 * Creates an Eleventy instance, initializes it, adds the provided plugin.
 *
 * @param options
 * @returns The Eleventy instance.
 */
export const defEleventy = async (options?: Options) => {
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

  // This is a trick to force Eleventy to evaluate all config (i.e. apply the
  // 11ty plugin config)
  await eleventy.toJSON()

  return eleventy
}
