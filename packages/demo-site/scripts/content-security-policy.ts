import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import defDebug from 'debug'
import { DEMO_SITE_ROOT } from '@jackdbd/eleventy-test-utils'
import { updateServeJSON } from '@jackdbd/hosting-utils'
import { cspHeader } from '@jackdbd/content-security-policy'

export const __filename = fileURLToPath(import.meta.url)
const SCRIPT_NAME = path.basename(__filename, '.ts')
const debug = defDebug(`script:${SCRIPT_NAME}`)

interface Config {
  directives: any
  filepath: string
  reportOnly?: boolean
  sources: string[]
}

const main = async (config: Config) => {
  debug(`update ${config.filepath} %O`, config)
  const { directives, filepath, reportOnly, sources } = config

  if (sources.length == 0) {
    debug(`no sources specified. Early return`)
    return
  }

  const cfg = path.basename(filepath)
  const ext = path.extname(filepath)

  if (cfg !== 'serve.json') {
    throw new Error(`${cfg} is not a supported configuration file.`)
  }

  const headerKey = reportOnly
    ? 'Content-Security-Policy-Report-Only'
    : 'Content-Security-Policy'

  const headerValue = await cspHeader({ directives, patterns: sources })

  const { error, value: message } = await updateServeJSON({
    filepath,
    headerKey,
    headerValue,
    sources
  })
  if (error) {
    throw error
  }
  if (message) {
    debug(message)
  }

  const str = fs.readFileSync(filepath, { encoding: 'utf8' })
  console.log(`updated ${filepath}`)
  console.log(str)
}

// use this script to update Content-Security-Policy for the demo site
await main({
  directives: {
    'base-uri': ['self'],
    'default-src': ['none'],
    // 'font-src': ['self'],
    'img-src': ['self'],
    // allow <audio> and <video> hosted on Google Cloud Storage, or self-hosted
    'media-src': ['self', 'storage.googleapis.com'],
    'report-to': ['csp'],
    'script-src': ['self', 'https://plausible.io/js/plausible.js'],
    'style-src': ['self']
  },
  filepath: path.join(DEMO_SITE_ROOT, '_site', 'serve.json'),
  // reportOnly: true,
  sources: ['/404.html', '/index.html']
})

await main({
  directives: {
    'base-uri': ['self'],
    'connect-src': ['https://plausible.io/api/event'],
    'default-src': ['none'],
    'font-src': ['self'],
    'img-src': ['self'],
    'media-src': [
      'self',
      'storage.googleapis.com',
      'https://audio-assets.giacomodebidda.com/dbf4402a878c75f0a8072e0e2a2c4f5b.mp3'
    ],
    'report-to': ['csp'],
    'script-src': ['self', 'https://plausible.io/js/plausible.js'],
    'style-src': ['self']
  },
  filepath: path.join(DEMO_SITE_ROOT, '_site', 'serve.json'),
  // reportOnly: true,
  sources: ['/posts/**/*.html']
})
