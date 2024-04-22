import fs from 'node:fs'
import path from 'node:path'
import util from 'node:util'
import defDebug from 'debug'
import type { EleventyConfig } from '@11ty/eleventy'
import {
  cspDirectives,
  validationErrorOrWarnings
} from '@jackdbd/content-security-policy'
import {
  DEBUG_PREFIX,
  DEFAULT_OPTIONS,
  ERR_PREFIX,
  SUPPORTED_HOSTING_PROVIDERS,
  WARN_PREFIX
} from './constants.js'
import { validationError } from './errors.js'
import { options as schema, type Options } from './schemas.js'
import { createOrUpdateVercelJSON } from './vercel.js'
import { createOrUpdateHeaders } from './cloudflare-pages.js'

// exports for TypeDoc
export { DEFAULT_OPTIONS } from './constants.js'
export type { Options } from './schemas.js'

const debug = defDebug(`${DEBUG_PREFIX}:index`)

const writeFileAsync = util.promisify(fs.writeFile)

/**
 * Plugin configuration function.
 *
 * We give the plugin configuration function a name, so it can be easily spotted
 * in the Eleventy:ErrorHandler debug logs.
 *
 * Hosting providers like Cloudflare Pages and Netlify allow to define custom
 * response headers in a plain text file called _headers. This file must be
 * placed in the publish directory of your site (e.g. usually _site for a
 * Eleventy site).
 *
 * https://developers.cloudflare.com/pages/platform/headers/
 * https://docs.netlify.com/routing/headers/
 */
export const contentSecurityPolicyPlugin = (
  eleventyConfig: EleventyConfig,
  options: Options
) => {
  eleventyConfig.on('eleventy.after', async () => {
    debug('plugin options (provided by the user) %O', options)

    const result = schema.default(DEFAULT_OPTIONS).safeParse(options)

    if (!result.success) {
      const allowDeprecatedDirectives =
        options.allowDeprecatedDirectives ||
        DEFAULT_OPTIONS.allowDeprecatedDirectives

      const { error, warnings } = validationErrorOrWarnings({
        allowDeprecatedDirectives,
        error: result.error
      })

      if (error) {
        throw new Error(`${ERR_PREFIX}: ${error.message}`)
      } else {
        warnings.forEach((w) => {
          console.warn(`${WARN_PREFIX}: ${w}`)
        })
      }

      throw validationError(result.error)
    }

    const config = result.data
    debug('plugin config (provided by the user + defaults) %O', config)

    const {
      excludePatterns,
      globPatterns,
      globPatternsDetach,
      hosting,
      includePatterns,
      jsonRecap,
      reportOnly
    } = config

    if (!hosting) {
      throw new Error(`${ERR_PREFIX}: hosting not set in plugin options`)
    }

    const allowed_hosting = SUPPORTED_HOSTING_PROVIDERS.has(hosting)
    if (!allowed_hosting) {
      throw new Error(
        `${ERR_PREFIX}: ${hosting} is not a supported hosting provider. This plugin supports the following hosting providers: ${[...SUPPORTED_HOSTING_PROVIDERS].join(', ')}`
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const outdir = (eleventyConfig as any).dir.output

    const patterns = [
      ...includePatterns.map((pattern) => `${outdir}${pattern}`),
      ...excludePatterns.map((pattern) => `!${outdir}${pattern}`)
    ]

    debug(
      `will look for inlined JS/CSS in HTML pages matching these patterns %O`,
      patterns
    )

    const directives = await cspDirectives({
      directives: config.directives,
      patterns
    })

    const headerKey = reportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy'

    const headerValue = directives.join('; ')

    if (hosting === 'vercel') {
      // I'm not sure the patterns to use in the vercel.json are the same as
      // the globPatterns used in the _headers file.
      // https://vercel.com/docs/projects/project-configuration#headers
      const sources = globPatterns
      // const sources = ['/(.*)', '/service-worker.js']
      await createOrUpdateVercelJSON({
        headerKey,
        headerValue,
        outdir,
        sources
      })
    } else if (hosting === 'cloudflare-pages' || hosting === 'netlify') {
      // TODO: Cloudflare Pages and Netlify both use a _headers file, but I'm not
      // 100% sure these two files have the exact same syntax.
      await createOrUpdateHeaders({
        globPatterns,
        globPatternsDetach,
        headerKey,
        headerValue,
        outdir
      })
    } else {
      throw new Error(
        `${ERR_PREFIX}: ${hosting} is not a supported hosting provider. This plugin supports the following hosting providers: ${[...SUPPORTED_HOSTING_PROVIDERS].join(', ')}`
      )
    }

    if (jsonRecap) {
      await writeFileAsync(
        path.join(
          outdir,
          `eleventy-plugin-content-security-policy-config.json`
        ),
        JSON.stringify(config, null, 2)
      )
    }
  })
}
