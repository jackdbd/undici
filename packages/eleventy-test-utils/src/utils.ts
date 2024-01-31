import { isOnGithub } from '@jackdbd/checks/environment'
import makeDebug from 'debug'
import { z } from 'zod'

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defaultZodValue = (value: any) => {
  if (value instanceof z.ZodDefault) {
    return value._def.defaultValue()
  } else {
    return undefined
  }
}

export const arrFromZodSchema = <S extends z.AnyZodObject>(schema: S) => {
  const arr = Object.entries(schema.shape).map(([key, value]) => {
    // console.log('🚀 ~ arr ~ key, value:', key, value)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = value as any

    let description: string = ''
    if (val instanceof z.ZodArray) {
      //   console.log('=== ZodArray ===', val)
      const minLength = val._def.minLength ? `${val._def.minLength.value}` : 0
      const maxLength = val._def.maxLength ? `${val._def.maxLength.value}` : '∞'
      if (val._def.type instanceof z.ZodObject) {
        // console.log('=== ZodObject ===', val._def.type)
        if (val.description) {
          description = `${val.description} (${minLength} to ${maxLength} elements)`
        } else {
          const desc = val._def.type.description
            ? `Array of ${minLength} to ${maxLength} elements of: ${val._def.type.description}`
            : `Array of ${minLength} to ${maxLength} elements`
          description = desc
        }
      } else {
        description = val.description || ''
      }
    } else {
      description = val.description || ''
    }
    return { key, default: defaultZodValue(value), description }
  })

  return arr
}

/**
 * Creates a markdown table from a Zod schema.
 *
 * @see [github.com - Retrieve default values from schema](https://github.com/colinhacks/zod/discussions/1953)
 */
export const markdownTableFromZodSchema = <S extends z.AnyZodObject>(
  schema: S
) => {
  const header = [`| Key | Default | Description |`, `|---|---|---|`]

  const arr = arrFromZodSchema(schema)

  const rows = arr.map((d) => {
    let defaultVal = ''
    if (d.default && d.default.length === 0) {
      defaultVal = '[]'
    } else {
      defaultVal = d.default || ''
    }
    return `| ${d.key} | ${defaultVal} | ${d.description || ''} |`
  })

  return [...header, ...rows].join('\n')
}
