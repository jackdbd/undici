/**
 * Entry point for the documentation of eleventy-plugin-permissions-policy.
 *
 * @packageDocumentation
 */
import fs from 'node:fs'
import path from 'node:path'
import util from 'node:util'
import makeDebug from 'debug'
import { options as optionsSchema } from './schemas.js'
import type { Directive, Options } from './schemas.js'
export type { Directive, Options } from './schemas.js'
import type { EleventyConfig } from '@panoply/11ty'

const NAMESPACE = `eleventy-plugin-permissions-policy`

const debug = makeDebug(NAMESPACE)

const writeFileAsync = util.promisify(fs.writeFile)

const featurePolicyDirectiveMapper = (d: Directive) => {
  return `${d.feature} ${d.allowlist.map((s) => `'${s}'`).join(' ')}`
}

const permissionsPolicyDirectiveMapper = (d: Directive) => {
  return `${d.feature}=(${d.allowlist.map((s) => `'${s}'`).join(' ')})`
}

const appendToHeadersFile = (
  headerKey: string,
  headerValue: string,
  headersFilepath: string,
  patterns: string[]
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
 *
 * @public
 */
export const permissionsPolicyPlugin = (
  eleventyConfig: EleventyConfig,
  options?: Options
) => {
  debug(`options %O`, options)

  const { error, value: pluginConfig } = optionsSchema.validate(options, {
    allowUnknown: true,
    stripUnknown: true
  })

  if (error) {
    throw new Error(`[${NAMESPACE}] ${error.message}`)
  }

  const outdir = (eleventyConfig as any).dir.output as string
  const headersFilepath = path.join(outdir, '_headers')

  const patterns = [
    ...pluginConfig.includePatterns,
    ...pluginConfig.excludePatterns.map((pattern) => `!${pattern}`)
  ]

  const directives = (pluginConfig as Required<Options>).directives

  eleventyConfig.on('eleventy.after', async () => {
    if (!fs.existsSync(headersFilepath)) {
      await writeFileAsync(headersFilepath, '', { encoding: 'utf8' })
      debug(`${headersFilepath} did not exist, so it was created`)
    }

    if (pluginConfig.jsonRecap) {
      await writeFileAsync(
        path.join(outdir, `${NAMESPACE}-config.json`),
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
