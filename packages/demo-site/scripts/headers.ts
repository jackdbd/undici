import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import defDebug from 'debug'
import { cspHeader } from '@jackdbd/content-security-policy'
import { DEMO_SITE_ROOT } from '@jackdbd/eleventy-test-utils'
import {
  updateHeaders,
  updateServeJSON,
  updateVercelJSON
} from '@jackdbd/hosting-utils'
import { featurePolicy, permissionsPolicy } from '@jackdbd/permissions-policy'

export const __filename = fileURLToPath(import.meta.url)
const SCRIPT_NAME = path.basename(__filename, '.ts')
const debug = defDebug(`script:${SCRIPT_NAME}`)

const CONFIG_FILES = [
  {
    fname: '_headers',
    desc: 'if you want to deploy the site to Cloudflare Pages'
  },
  {
    fname: 'serve.json',
    desc: 'if you want to serve the site locally, with serve'
  },
  { fname: 'vercel.json', desc: 'if you want to deploy the site to Vercel' }
]

interface UpdatePatch {
  filepath: string
  headerKey: string
  headerValue: string
  sources: string[]
}

interface ConsumerConfig {
  fname: string
  patches: UpdatePatch[]
}

async function* patchConsumer({ patches, fname }: ConsumerConfig) {
  while (patches.length) {
    const patch = patches[0]

    if (fname === '_headers') {
      const { error, value } = await updateHeaders(patch)
      if (error) {
        throw error
      } else {
        debug(value)
      }
    } else if (fname === 'serve.json') {
      const { error, value } = await updateServeJSON(patch)
      if (error) {
        throw error
      } else {
        debug(value)
      }
    } else if (fname === 'vercel.json') {
      const { error, value } = await updateVercelJSON(patch)
      if (error) {
        throw error
      } else {
        debug(value)
      }
    } else {
      throw new Error(`not implemented for ${fname}`)
    }

    yield patches.shift()
  }
}

const main = async () => {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    const strings = ['You must specify one of the following config files:']
    strings.push('\n\n')
    strings.push(CONFIG_FILES.map((c) => `* ${c.fname}, ${c.desc}`).join('\n'))
    throw new Error(strings.join(''))
  }

  const fname = args[0]
  if (!CONFIG_FILES.map((c) => c.fname).includes(fname)) {
    const strings = [`${fname} is not a supported configuration file.`]
    strings.push('\n')
    strings.push(`You must specify one of the following config files`)
    strings.push('\n\n')
    strings.push(CONFIG_FILES.map((c) => `* ${c.fname}, ${c.desc}`).join('\n'))
    throw new Error(strings.join(''))
  }

  const filepath = path.join(DEMO_SITE_ROOT, '_site', fname)
  debug(`updating ${filepath}`)
  if (path.extname(fname) === '.json') {
    fs.writeFileSync(filepath, '{}')
  } else {
    fs.writeFileSync(filepath, '')
  }

  // This works fine for serve.json and vercel.json
  // https://vercel.com/docs/projects/project-configuration#headers
  // const sources = ['/index.html', '/posts/**/*html']

  // The _headers file for Cloudflare Pages is a bit trickier
  // https://developers.cloudflare.com/pages/configuration/headers/
  // attach headers to every resource
  //   const sources = ['/*']
  // attach headers to the home page and ALL posts, but not to the 404.html page
  //   const sources = ['/', '/posts/*']
  // attach header to the home page, the 404 page and a specific post
  const sources = ['/', '/404', '/posts/capybaras-are-cool/']

  if (sources.length == 0) {
    debug(`no sources specified. Early return`)
    return
  }

  const reporting_endpoints = {
    default: `"https://giacomodebidda.uriports.com/reports"`,
    csp: `"https://giacomodebidda.uriports.com/reports"`,
    'permissions-policy': `"https://giacomodebidda.uriports.com/reports"`
  }

  debug(`reports and policy violations will be sent to these endpoints %O`, {
    reporting_endpoints
  })

  const reportingEndpoints = Object.entries(reporting_endpoints)
    .map(([key, value]) => {
      return `${key}=${value}`
    })
    .join(', ')

  const includeFeaturePolicy = true
  const reportOnly = false

  const features = {
    autoplay: ['self'],
    bluetooth: ['*'], // this enables the feature for all origins
    camera: ['self', 'https://trusted-site.example'],
    // 'ch-device-memory': ['none'], // this is invalid in Permissions-Policy
    'ch-device-memory': [], // this disables the feature
    'display-capture': [],
    fullscreen: ['*'],
    gyroscope: [],
    midi: []
  }

  const { error: pp_error, value: pp } = permissionsPolicy({
    features,
    reportingEndpoint: 'default'
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

  // We can set default-src: 'none' and "forget" to set a couple of directives
  // to check that report violations are being generated and sent to the
  // reporting endpoint.
  const directives = {
    'base-uri': ['self'],
    'connect-src': ['https://plausible.io/api/event'],
    'default-src': ['none'],
    // 'font-src': ['self'],
    'img-src': ['self'],
    'media-src': [
      'self',
      //   'storage.googleapis.com',
      'https://audio-assets.giacomodebidda.com/dbf4402a878c75f0a8072e0e2a2c4f5b.mp3'
    ],
    'report-to': ['default'], // try also the csp endpoint
    'script-src': [
      'self',
      'https://plausible.io/js/plausible.js',
      'https://static.cloudflareinsights.com/beacon.min.js'
    ],
    'style-src': ['self']
  }

  const csp = await cspHeader({ directives, patterns: sources })

  const patches: UpdatePatch[] = [
    {
      headerKey: 'Reporting-Endpoints',
      headerValue: reportingEndpoints,
      filepath,
      sources
    },
    {
      headerKey: 'Feature-Policy',
      headerValue: fp,
      filepath,
      sources
    },
    {
      headerKey: 'Permissions-Policy',
      headerValue: pp,
      filepath,
      sources
    },
    {
      headerKey: 'Content-Security-Policy',
      headerValue: csp,
      filepath,
      sources
    }
  ]

  const agen = patchConsumer({ patches, fname })
  // consume the generator
  for await (const result of agen) {
  }
}

await main()
