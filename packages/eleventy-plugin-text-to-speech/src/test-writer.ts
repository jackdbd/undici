import makeDebug from 'debug'
import { fromZodError } from 'zod-validation-error'
import { DEBUG_PREFIX } from './constants.js'
import { test_asset_config as schema } from './schemas.js'
import type { AssetConfig, WriteResult } from './schemas.js'

const debug = makeDebug(`${DEBUG_PREFIX}:test-writer`)

/**
 * Dumb writer used in tests.
 *
 * @internal
 */
export const testWriter = () => {
  return {
    write: async (config: AssetConfig): Promise<WriteResult> => {
      const result = schema.safeParse(config)

      if (!result.success) {
        return { error: fromZodError(result.error) }
      }

      const { assetName } = config
      const domain = 'example.com'
      debug(`hosting audio asset ${assetName} on ${domain}`)
      const href = `https://${domain}/audio-assets/${assetName}`

      const value = {
        href,
        message: `audio asset hosted at ${href}`
      }

      return Promise.resolve({ value })
    }
  }
}
