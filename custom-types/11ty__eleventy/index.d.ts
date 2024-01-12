declare module '@11ty/eleventy' {
  type TransformFn = (content: string, outputPath: string) => Promise<string>
  export interface EleventyConfig {
    userConfig: any
    verbose: boolean
    addPlugin(pluginFn: () => void, pluginOptions: Object): Promise<void>
    addTransform(name: string, fn: TransformFn): Promise<void>
  }

  interface Options {
    config?: (eleventyConfig: EleventyConfig) => void
  }

  class Eleventy {
    constructor(
      input?: string,
      output?: string,
      options?: Options,
      eleventyConfig?: EleventyConfig | null
    )

    init(): Promise<void>
    initializeConfig(): Promise<void>
    toJSON(): Promise<void>

    eleventyConfig: EleventyConfig
    rawInput?: string
    rawOutput?: string
    inputDir: string
    outputDir: string
  }

  export { Eleventy }
  export default Eleventy
}
