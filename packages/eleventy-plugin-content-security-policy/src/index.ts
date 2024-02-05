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
  WARN_PREFIX
} from './constants.js'
import { validationError } from './errors.js'
import { options as schema, type Options } from './schemas.js'

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
  //
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
      includePatterns,
      jsonRecap,
      reportOnly
    } = config

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const outdir = (eleventyConfig as any).dir.output
    const headersFilepath = path.join(outdir, '_headers')

    const patterns = [
      ...includePatterns.map((pattern) => `${outdir}${pattern}`),
      ...excludePatterns.map((pattern) => `!${outdir}${pattern}`)
    ]

    debug(
      `will look for inlined JS/CSS in HTML pages matching these patterns %O`,
      patterns
    )

    if (jsonRecap) {
      await writeFileAsync(
        path.join(
          outdir,
          `eleventy-plugin-content-security-policy-config.json`
        ),
        JSON.stringify(config, null, 2)
      )
    }

    const directives = await cspDirectives({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      directives: config.directives as any,
      patterns
    })

    if (!fs.existsSync(headersFilepath)) {
      fs.writeFileSync(headersFilepath, '', { encoding: 'utf8' })
      debug(`${headersFilepath} did not exist, so it was created`)
    }

    const headerKey = reportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy'

    const headerValue = directives.join('; ')

    globPatterns.forEach((pattern) => {
      debug(`add ${headerKey} header for resources matching ${pattern}`)
      fs.appendFileSync(
        headersFilepath,
        `\n${pattern}\n  ${headerKey}: ${headerValue}\n`
      )
    })

    globPatternsDetach.forEach((pattern) => {
      debug(`remove ${headerKey} header for resources matching ${pattern}`)
      fs.appendFileSync(headersFilepath, `\n${pattern}\n  ! ${headerKey}\n`)
    })
  })
}
