import fs from 'node:fs'
import path from 'node:path'
import util from 'node:util'
import makeDebug from 'debug'
import { applyToDefaults } from '@hapi/hoek'
// import type { EleventyConfig } from '@11ty/eleventy'
import { defaultOptions, options as optionsSchema } from './schemas.js'
// import type { Options } from './schemas.js'
// export type { Directive, Options } from './schemas.js'
import {
  featurePolicyDirectiveMapper,
  permissionsPolicyDirectiveMapper
} from './utils.js'
import { DEBUG_PREFIX, ERROR_MESSAGE_PREFIX } from './constants.js'

// export type EleventyConfig = any

const debug = makeDebug(`${DEBUG_PREFIX}`)

const writeFileAsync = util.promisify(fs.writeFile)

export const appendToHeadersFile = (
  headerKey,
  headerValue,
  headersFilepath,
  patterns
) => {
  patterns.forEach((pattern) => {
    debug(`add ${headerKey} header for resources matching ${pattern}`)
    fs.appendFileSync(
      headersFilepath,
      `\n${pattern}\n  ${headerKey}: ${headerValue}\n`
    )
  })
}

/**
 * Plugin configuration function.
 */
export const permissionsPolicyPlugin = (eleventyConfig, providedOptions) => {
  debug(`options %O`, providedOptions)

  const result = optionsSchema.validate(providedOptions, {
    allowUnknown: true,
    stripUnknown: true
  })

  const pluginConfig = applyToDefaults(defaultOptions, providedOptions)

  if (result.error) {
    throw new Error(
      `${ERROR_MESSAGE_PREFIX.invalidConfiguration}: ${result.error.message}`
    )
  }

  const patterns = [
    ...pluginConfig.includePatterns,
    ...pluginConfig.excludePatterns.map((pattern) => `!${pattern}`)
  ]

  const directives = pluginConfig.directives

  eleventyConfig.on('eleventy.after', async () => {
    // We have to access the output directory only now, in the `eleventy.after`
    // handler. Otherwise it would be the default `_site` directory from the
    // Eleventy TemplateConfig instance..
    const outdir = eleventyConfig.dir.output
    const headersFilepath = path.join(outdir, '_headers')

    if (!fs.existsSync(headersFilepath)) {
      await writeFileAsync(headersFilepath, '', { encoding: 'utf8' })
      debug(`${headersFilepath} did not exist, so it was created`)
    }

    if (pluginConfig.jsonRecap) {
      await writeFileAsync(
        path.join(outdir, `eleventy-plugin-permissions-policy-config.json`),
        JSON.stringify(pluginConfig, null, 2)
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

      if (pluginConfig.includeFeaturePolicy) {
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
