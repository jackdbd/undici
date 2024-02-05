import defDebug from 'debug'
import type { EleventyConfig } from '@11ty/eleventy'
import { makeClient } from '@jackdbd/plausible-client'
import { DEBUG_PREFIX, ERR_PREFIX } from './constants.js'
import { validationError } from './errors.js'
import { DEFAULT_OPTIONS, options as schema, type Options } from './schemas.js'

// exports for TypeDoc
export { DEFAULT_OPTIONS, options } from './schemas.js'
export type { Options } from './schemas.js'

const debug = defDebug(`${DEBUG_PREFIX}:index`)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StatsOptions = any

interface Client {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats: { breakdown: (options: StatsOptions) => any }
}

const statsBreakdown = async (client: Client, statsOptions: StatsOptions) => {
  debug(`options for Plausible /stats endpoint %O`, statsOptions)
  const breakdown = await client.stats.breakdown(statsOptions)
  debug(`breakdown from Plausible /stats endpoint %O`, breakdown)
  return breakdown
}

/**
 * Plugin configuration function.
 */
export const plausiblePlugin = (
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

  const { apiKey, ...safeConfig } = config
  debug(`plugin config (Plausible API KEY not shown) %O`, safeConfig)

  if (!apiKey) {
    const message = `${ERR_PREFIX} Plausible API key is required`
    console.error(message)
    throw new Error(message)
  }

  const siteId = config.siteId
  if (!siteId) {
    const message = `${ERR_PREFIX} Plausible site ID is required`
    console.error(message)
    throw new Error(message)
  }

  const client = makeClient(
    { apiKey, siteId },
    {
      directory: config.cacheDirectory,
      duration: config.cacheDuration,
      verbose: config.cacheVerbose
    }
  )

  // https://github.com/jackdbd/calderone/blob/main/packages/plausible-client/src/stats/schemas.ts
  const statsOptions = {
    // filters: '',
    limit: config.statsBreakdownLimit,
    metrics: config.statsBreakdownMetrics,
    // page: 1,
    period: config.statsBreakdownPeriod
    // property: ''
  }

  eleventyConfig.addGlobalData(
    config.statsBreakdownGlobalDataKey,
    // Note: I find it a bit surprising, but this async function is invoked
    // before the eleventy.before event handler.
    async () => {
      debug(`fetching statsBreakdown using these options %O`, statsOptions)
      return await statsBreakdown(client, statsOptions)
    }
  )
}
