declare module '@11ty/eleventy' {
  /**
   * Event names available in Eleventy plugins.
   *
   * @see [Events](https://www.11ty.dev/docs/events/)
   */
  export type EventName =
    | 'eleventy.before'
    | 'eleventy.after'
    | 'eleventy.beforeWatch'

  /**
   * Object available in `eleventy.before` and `eleventy.after` event handlers.
   *
   * @see [Event Arguments](https://www.11ty.dev/docs/events/#event-arguments)
   */
  export interface EventArguments {
    inputDir: string
    dir: { input: string; includes: string; data: string; output: string }
    runMode: 'build' | 'watch' | 'serve'
    outputMode: 'fs' | 'json' | 'ndjson'
    incremental: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    results?: any
  }

  type EventHandler = (arg: EventArguments) => void | Promise<void>

  type TransformHandler = (
    content: string,
    outputPath: string
  ) => string | Promise<string>

  export interface EleventyConfig {
    userConfig: any
    verbose: boolean
    addPlugin(pluginFn: () => void, pluginOptions: Object): Promise<void>
    addTransform(transformName: string, fn: TransformHandler): Promise<void>
    on(eventName: EventName, fn: EventHandler): Promise<void>
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
