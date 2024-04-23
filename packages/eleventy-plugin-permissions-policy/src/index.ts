import fs from 'node:fs'
import path from 'node:path'
import util from 'node:util'
import defDebug from 'debug'
import type { EleventyConfig } from '@11ty/eleventy'
import {
  createOrUpdateHeaders,
  createOrUpdateVercelJSON
} from '@jackdbd/hosting-utils'
import {
  DEBUG_PREFIX,
  ERR_PREFIX,
  SUPPORTED_HOSTING_PROVIDERS
} from './constants.js'
import { validationError } from './errors.js'
import { DEFAULT_OPTIONS, Options, options as schema } from './schemas.js'
import {
  featurePolicyDirectiveMapper,
  permissionsPolicyDirectiveMapper
} from './utils.js'

// exports for TypeDoc
export { DEFAULT_OPTIONS, directive, feature, options } from './schemas.js'
export type { Directive, Options } from './schemas.js'

const debug = defDebug(`${DEBUG_PREFIX}:index`)

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

    // TODO: decide what to do when multiple config files are available (e.g. a
    // vercel.json and a _headers file). Maybe the best approach is to throw an
    // error and ask the user to decide which hosting provider to use (i.e. the
    // user should manually cleanup his deploy directory).

    let hosting_provider_config_files: string[] = []
    if (fs.existsSync(path.join(outdir, '_headers'))) {
      debug(`found _headers file (Cloudflare Pages)`)
      hosting_provider_config_files.push('cloudflare-pages') // or netlify
    }
    if (fs.existsSync(path.join(outdir, 'vercel.json'))) {
      debug(`found vercel.json (Vercel)`)
      hosting_provider_config_files.push('vercel')
    }

    let hosting: string | undefined
    if (hosting_provider_config_files.length > 0) {
      hosting = hosting_provider_config_files[0]
    }

    if (config.hosting) {
      hosting = config.hosting
      debug(`hosting: ${hosting}`)
    }

    if (!hosting) {
      throw new Error(`${ERR_PREFIX}: hosting not set in plugin options`)
    }

    if (hosting === 'vercel') {
      if (directives.length > 0 && patterns.length > 0) {
        await createOrUpdateVercelJSON({
          headerKey: 'Permissions-Policy',
          headerValue: directives
            .map(permissionsPolicyDirectiveMapper)
            .join(', '),
          outdir,
          sources: patterns
        })

        if (includeFeaturePolicy) {
          await createOrUpdateVercelJSON({
            headerKey: 'Feature-Policy',
            headerValue: directives
              .map(featurePolicyDirectiveMapper)
              .join('; '),
            outdir,
            sources: patterns
          })
        }
      }
    } else if (hosting === 'cloudflare-pages' || hosting === 'netlify') {
      if (directives.length > 0 && patterns.length > 0) {
        await createOrUpdateHeaders({
          globPatterns: patterns,
          globPatternsDetach: [],
          headerKey: 'Permissions-Policy',
          headerValue: directives
            .map(permissionsPolicyDirectiveMapper)
            .join(', '),
          outdir
        })

        if (includeFeaturePolicy) {
          await createOrUpdateHeaders({
            globPatterns: patterns,
            globPatternsDetach: [],
            headerKey: 'Feature-Policy',
            headerValue: directives
              .map(featurePolicyDirectiveMapper)
              .join('; '),
            outdir
          })
        }
      }
    } else {
      throw new Error(
        `${ERR_PREFIX}: ${hosting} is not a supported hosting provider. This plugin supports the following hosting providers: ${[...SUPPORTED_HOSTING_PROVIDERS].join(', ')}`
      )
    }

    if (jsonRecap) {
      await writeFileAsync(
        path.join(outdir, `eleventy-plugin-permissions-policy-config.json`),
        JSON.stringify(config, null, 2)
      )
    }
  })
}
