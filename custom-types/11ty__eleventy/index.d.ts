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

  export interface EleventyTemplate {
    outputPath: string
  }

  // https://www.11ty.dev/docs/collections/#collection-api-methods
  export interface CollectionApi {
    getAll: () => EleventyTemplate[]
    getAllSorted: () => EleventyTemplate[]
    getFilteredByTag: (tagName: string) => EleventyTemplate[]
    getFilteredByTags: (...args: string[]) => EleventyTemplate[]
    getFilteredByGlob: (glob: any) => EleventyTemplate[]
  }

  type CollectionFn = (collectionApi: CollectionApi) => void

  type DataFn = () => void | Promise<void>

  type TransformFn = (
    content: string,
    outputPath: string
  ) => string | Promise<string>

  export interface EleventyConfig {
    userConfig: any
    verbose: boolean
    addCollection(collectionName: string, fn: CollectionFn): void
    addGlobalData(dataKey: string, fn: DataFn): void
    addPlugin(pluginFn: () => void, pluginOptions: Object): void
    addTransform(transformName: string, fn: TransformFn): void
    on(eventName: EventName, fn: EventHandler): void | Promise<void>
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
