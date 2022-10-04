const fs = require('node:fs')
const path = require('node:path')
const util = require('node:util')
const makeDebug = require('debug')
const { applyToDefaults } = require('@hapi/hoek')
// https://adamcoster.com/blog/commonjs-and-esm-importexport-compatibility-examples
const cspPromise = import('@jackdbd/content-security-policy')
const { defaultOptions, makePluginOptions } = require('./schemas.cjs')

const NAMESPACE = 'eleventy-plugin-content-security-policy'

const debug = makeDebug(NAMESPACE)

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
const contentSecurityPolicy = (eleventyConfig, providedOptions) => {
  //
  eleventyConfig.on('eleventy.after', async () => {
    const { cspDirectives, validationErrorOrWarnings } = await cspPromise

    const optionsSchema = await makePluginOptions()

    const result = optionsSchema.validate(providedOptions, {
      allowUnknown: true,
      stripUnknown: true
    })

    const pluginConfig = applyToDefaults(defaultOptions, providedOptions)

    const outdir = eleventyConfig.dir.output
    const headersFilepath = path.join(outdir, '_headers')

    const patterns = [
      ...pluginConfig.includePatterns.map((pattern) => `${outdir}${pattern}`),
      ...pluginConfig.excludePatterns.map((pattern) => `!${outdir}${pattern}`)
    ]

    debug(
      `will look for inlined JS/CSS in HTML pages matching these patterns %O`,
      patterns
    )

    if (result.error) {
      const { error, warnings } = validationErrorOrWarnings({
        allowDeprecatedDirectives: pluginConfig.allowDeprecatedDirectives,
        error: result.error
      })
      if (error) {
        throw new Error(`[${NAMESPACE}] ${error.message}`)
      } else {
        warnings.forEach(console.warn)
      }
    }

    const directives = await cspDirectives({
      directives: pluginConfig.directives,
      patterns
    })

    if (!fs.existsSync(headersFilepath)) {
      fs.writeFileSync(headersFilepath, '', { encoding: 'utf8' })
      debug(`${headersFilepath} did not exist, so it was created`)
    }

    // this is useful for troubleshooting the CSP and/or make it easier to
    // consume by other tools (e.g. send a Telegram message containing the
    // current CSP directives)
    await writeFileAsync(
      path.join(outdir, 'eleventy-plugin-csp-config.json'),
      JSON.stringify(pluginConfig, null, 2)
    )

    const headerKey = pluginConfig.reportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy'

    const headerValue = directives.join('; ')

    pluginConfig.globPatterns.forEach((pattern) => {
      debug(`add ${headerKey} header for resources matching ${pattern}`)
      fs.appendFileSync(
        headersFilepath,
        `\n${pattern}\n  ${headerKey}: ${headerValue}\n`
      )
    })

    pluginConfig.globPatternsDetach.forEach((pattern) => {
      debug(`remove ${headerKey} header for resources matching ${pattern}`)
      fs.appendFileSync(headersFilepath, `\n${pattern}\n  ! ${headerKey}\n`)
    })
  })
}

module.exports = { initArguments: {}, configFunction: contentSecurityPolicy }
