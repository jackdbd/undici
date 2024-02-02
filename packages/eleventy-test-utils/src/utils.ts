import { isOnGithub } from '@jackdbd/checks/environment'
import makeDebug from 'debug'

const debug = makeDebug(`11ty-test-utils`)

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
