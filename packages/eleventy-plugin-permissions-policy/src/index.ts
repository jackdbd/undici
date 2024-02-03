import fs from 'node:fs'
import path from 'node:path'
import util from 'node:util'
import makeDebug from 'debug'
import type { EleventyConfig } from '@11ty/eleventy'
import { DEBUG_PREFIX, ERR_PREFIX } from './constants.js'
import { validationError } from './errors.js'
import { DEFAULT_OPTIONS, Options, options as schema } from './schemas.js'
import {
  appendToHeadersFile,
  featurePolicyDirectiveMapper,
  permissionsPolicyDirectiveMapper
} from './utils.js'

// exports for TypeDoc
export { DEFAULT_OPTIONS, directive, feature, options } from './schemas.js'
export type { Directive, Options } from './schemas.js'

const debug = makeDebug(`${DEBUG_PREFIX}:index`)

const writeFileAsync = util.promisify(fs.writeFile)

/**
 * Plugin configuration function.
 */
export const permissionsPolicyPlugin = (
  eleventyConfig: EleventyConfig,
  options: Options
) => {
  debug('plugin options (provided by the user) %O', options)

  const result = schema.default(DEFAULT_OPTIONS).safeParse(options)

  if (!result.success) {
    const err = validationError(result.error)
    console.error(`${ERR_PREFIX} ${err.message}`)
    throw err
  }

  const config = result.data
  debug('plugin config (provided by the user + defaults) %O', config)

  const {
    directives,
    excludePatterns,
    includeFeaturePolicy,
    includePatterns,
    jsonRecap
  } = config

  const patterns = [
    ...includePatterns,
    ...excludePatterns.map((pattern) => `!${pattern}`)
  ]

  eleventyConfig.on('eleventy.after', async () => {
    // We have to access the output directory only now, in the `eleventy.after`
    // handler. Otherwise it would be the default `_site` directory from the
    // Eleventy TemplateConfig instance.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const outdir = (eleventyConfig as any).dir.output
    const headersFilepath = path.join(outdir, '_headers')

    if (!fs.existsSync(headersFilepath)) {
      await writeFileAsync(headersFilepath, '', { encoding: 'utf8' })
      debug(`${headersFilepath} did not exist, so it was created`)
    }

    if (jsonRecap) {
      await writeFileAsync(
        path.join(outdir, `eleventy-plugin-permissions-policy-config.json`),
        JSON.stringify(config, null, 2)
      )
    }

    if (directives.length > 0 && patterns.length > 0) {
      const headerValue = directives
        .map(permissionsPolicyDirectiveMapper)
        .join(', ')

      appendToHeadersFile(
        'Permissions-Policy',
        headerValue,
        headersFilepath,
        patterns
      )

      if (includeFeaturePolicy) {
        const headerValue = directives
          .map(featurePolicyDirectiveMapper)
          .join('; ')

        appendToHeadersFile(
          'Feature-Policy',
          headerValue,
          headersFilepath,
          patterns
        )
      }
    }
  })
}
