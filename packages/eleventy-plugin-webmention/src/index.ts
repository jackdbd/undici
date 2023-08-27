/**
 * Entry point for the documentation of eleventy-plugin-webmention.
 *
 * @packageDocumentation
 */
// import type { UserConfig } from '@11ty/eleventy'
// export type { UserConfig } from '@11ty/eleventy'
import makeDebug from 'debug'
import { fromZodError } from 'zod-validation-error'
import { NAMESPACE } from './constants.js'
import { pluginOptions } from './schemas.js'
import type { PluginOptions } from './schemas.js'
import { isTwitterUrl, sanitizeWebmentionAuthor } from './utils.js'
import { makeClient } from './webmention-io.js'

const debug = makeDebug(`${NAMESPACE}:index`)

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @public
 */
export const webmentionPlugin = (
  eleventyConfig: any, // UserConfig,
  providedOptions?: PluginOptions
) => {
  debug(`provided options %O`, providedOptions)

  const result = pluginOptions.safeParse(providedOptions)

  if (!result.success) {
    const err = fromZodError(result.error)
    throw new Error(`${NAMESPACE} ${err.message}`)
  }

  const config = {} as Required<PluginOptions>
  Object.assign(config, result.data)

  const {
    blacklisted,
    cacheDirectory,
    cacheDuration,
    cacheVerbose,
    domain,
    sanitizeOptions,
    token
  } = config

  debug(`cache responses from Webmention.io %O`, {
    cacheDirectory,
    cacheDuration
  })

  const webmentionsIo = makeClient({
    blacklisted,
    cacheDirectory,
    cacheDuration,
    cacheVerbose,
    sanitizeOptions,
    token
  })

  eleventyConfig.addGlobalData('webmentionsSentToDomain', async () => {
    const webmentions = await webmentionsIo.webmentionsSentToDomain(domain)
    debug(
      `added global data 'webmentionsSentToDomain' to eleventy data cascade`
    )
    return webmentions
  })

  eleventyConfig.addFilter('isTwitterUrl', isTwitterUrl)

  eleventyConfig.addFilter('sanitizeWebmentionAuthor', sanitizeWebmentionAuthor)

  eleventyConfig.addAsyncFilter(
    'webmentionsSentToRelativePath',
    async (relative_path: string) => {
      const url = new URL(relative_path, `https://${domain}`)
      return await webmentionsIo.webmentionsSentToUrl(url.href)
    }
  )
}
