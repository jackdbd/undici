import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import util from 'node:util'
import { isOnGithub } from '@jackdbd/checks/environment'
import defDebug from 'debug'
import { STATIC_SITE_BUILD_ROOT } from './constants.js'

const readFileAsync = util.promisify(fs.readFile)

const debug = defDebug(`11ty-test-utils`)

export const waitMs = (ms: number) => {
  let timeout: NodeJS.Timeout
  return new Promise((resolve) => {
    timeout = setTimeout(() => {
      resolve(timeout)
    }, ms)
  })
}

export interface CredentialsConfig {
  key: string
  filepath: string
}

export const clientCredentials = ({ key, filepath }: CredentialsConfig) => {
  const val = process.env[key]

  if (isOnGithub(process.env)) {
    console.log(`=== RUNNING ON GIHUB ACTIONS ===`)
    debug(`checking environment variable ${key}`)
    if (!val) {
      throw new Error(`environment variable ${key} not set`)
    }
    const sa = JSON.parse(val)
    const client_email = sa.client_email as string
    const private_key = sa.private_key as string
    return { credentials: { client_email, private_key } }
  } else if (process.env.CF_PAGES) {
    console.log(`=== RUNNING ON CLOUDFLARE PAGES ===`)
    debug(`checking environment variable ${key}`)
    if (!val) {
      throw new Error(`environment variable ${key} not set`)
    }
    const sa = JSON.parse(val)
    const client_email = sa.client_email as string
    const private_key = sa.private_key as string
    return { credentials: { client_email, private_key } }
  } else {
    return { keyFilename: filepath }
  }
}

export const cloudStorageUploaderClientOptions = () => {
  return clientCredentials({
    key: 'SA_JSON_KEY_STORAGE_UPLOADER',
    filepath: '/run/secrets/prj-kitchen-sink/sa-storage-uploader'
  })
}

export const cloudTextToSpeechClientOptions = () => {
  return clientCredentials({
    key: 'SA_JSON_KEY_TEXT_TO_SPEECH',
    // TODO: create a service account JSON key for Text-To-Speech and use that one.
    filepath: '/run/secrets/prj-kitchen-sink/sa-storage-uploader'
  })
}

export const fileContentAfterMs = async (fpath: string, ms: number) => {
  await waitMs(ms)
  const buffer = await readFileAsync(fpath)
  const str = buffer.toString()
  if (path.extname(fpath) === '.json') {
    return JSON.parse(str)
  } else {
    return str
  }
}

// configuration files for several hosting providers
export const HOSTING_FILES = ['_headers', 'serve.json', 'vercel.json']

export const removeHostingFile = (fname: string) => {
  if (fs.existsSync(path.join(STATIC_SITE_BUILD_ROOT, fname))) {
    fs.unlinkSync(path.join(STATIC_SITE_BUILD_ROOT, fname))
  }
}

export const removeAllHostingFiles = () => {
  HOSTING_FILES.forEach(removeHostingFile)
}

export const removeAllButOneHostingFile = (keep: string) => {
  HOSTING_FILES.forEach((fname) => {
    const fpath = path.join(STATIC_SITE_BUILD_ROOT, fname)
    if (fs.existsSync(fpath) && fname !== keep) {
      fs.unlinkSync(fpath)
    }
  })
}

export const writeEmptyHostingFile = (fname: string) => {
  if (path.extname(fname) === '.json') {
    fs.writeFileSync(path.join(STATIC_SITE_BUILD_ROOT, fname), '{}')
  } else {
    fs.writeFileSync(path.join(STATIC_SITE_BUILD_ROOT, fname), '')
  }
}

export const writeAllHostingFiles = () => {
  HOSTING_FILES.forEach(writeEmptyHostingFile)
}

export const assertSingleHostingFileExists = (expected: string) => {
  HOSTING_FILES.forEach((fname) => {
    const fpath = fs.existsSync(path.join(STATIC_SITE_BUILD_ROOT, fname))
    if (fname === expected) {
      assert.equal(
        fpath,
        true,
        `${STATIC_SITE_BUILD_ROOT} should contain ONLY ${expected}`
      )
    } else {
      assert.equal(
        fpath,
        false,
        `${STATIC_SITE_BUILD_ROOT} should contain ONLY ${expected}, not ${fname}`
      )
    }
  })
}
