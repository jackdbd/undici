import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import defDebug from 'debug'
import { DEMO_SITE_ROOT } from '@jackdbd/eleventy-test-utils'
import { updateServeJSON } from '@jackdbd/hosting-utils'
import type { Allowlist, Feature } from '@jackdbd/permissions-policy'
import { featurePolicy, permissionsPolicy } from '@jackdbd/permissions-policy'

export const __filename = fileURLToPath(import.meta.url)
const SCRIPT_NAME = path.basename(__filename, '.ts')
const debug = defDebug(`script:${SCRIPT_NAME}`)

interface Config {
  features: Partial<Record<Feature, Allowlist>>
  filepath: string
  includeFeaturePolicy?: boolean
  reportingEndpoint?: string
  reportOnly?: boolean
  sources: string[]
}

const main = async ({
  features,
  filepath,
  includeFeaturePolicy,
  reportingEndpoint,
  reportOnly,
  sources
}: Config) => {
  debug(`update ${filepath} %O`, {
    features,
    sources,
    includeFeaturePolicy,
    reportingEndpoint,
    reportOnly
  })

  if (sources.length == 0) {
    debug(`no sources specified. Early return`)
    return
  }

  const { error: pp_error, value: pp } = permissionsPolicy({
    features,
    reportingEndpoint
  })

  if (pp_error) {
    throw pp_error
  }

  const { error: fp_error, value: fp } = featurePolicy({
    features
  })

  if (fp_error) {
    throw fp_error
  }

  let fp_key = 'Feature-Policy'
  let pp_key = 'Permissions-Policy'
  if (reportOnly) {
    fp_key = 'Feature-Policy-Report-Only'
    pp_key = 'Permissions-Policy-Report-Only'
  }

  if (includeFeaturePolicy) {
    debug(`matching sources will be served with ${fp_key} and ${pp_key} %O`, {
      sources,
      [fp_key]: fp,
      [pp_key]: pp
    })
  } else {
    debug(`matching sources will be served with ${pp_key} %O`, {
      sources,
      [pp_key]: pp
    })
  }

  const cfg = path.basename(filepath)
  const ext = path.extname(filepath)

  if (!fs.existsSync(filepath)) {
    if (ext === '.json') {
      debug(`${filepath} does not exist. Creating empty JSON file...`)
      fs.writeFileSync(filepath, '{}')
    } else {
      debug(`${filepath} does not exist. Creating empty plain text file...`)
      fs.writeFileSync(filepath, '')
    }
  }

  if (cfg !== 'serve.json') {
    throw new Error(`${cfg} is not a supported configuration file.`)
  }

  const { error: pp_err, value: pp_msg } = await updateServeJSON({
    filepath,
    headerKey: pp_key,
    headerValue: pp,
    sources
  })
  if (pp_err) {
    throw pp_err
  }
  if (pp_msg) {
    debug(pp_msg)
  }

  if (includeFeaturePolicy) {
    const { error: fp_err, value: fp_msg } = await updateServeJSON({
      filepath,
      headerKey: fp_key,
      headerValue: fp,
      sources
    })
    if (fp_err) {
      throw fp_err
    }
    if (fp_msg) {
      debug(fp_msg)
    }
  }

  const str = fs.readFileSync(filepath, { encoding: 'utf8' })
  console.log(`updated ${filepath}`)
  console.log(str)
}

// use this script to update Permissions-Policy and Feature-Policy for the demo site
await main({
  features: {
    autoplay: ['self'],
    bluetooth: ['*'], // this enables the feature for all origins
    camera: ['self', 'https://trusted-site.example'],
    // 'ch-device-memory': ['none'], // this is invalid in Permissions-Policy
    'ch-device-memory': [], // this disables the feature
    'display-capture': [],
    fullscreen: ['*'],
    gyroscope: [],
    midi: []
  },
  filepath: path.join(DEMO_SITE_ROOT, '_site', 'serve.json'),
  includeFeaturePolicy: true,
  sources: ['/404.html', '/index.html', '/posts/**/*.html']
})
