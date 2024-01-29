import makeDebug from 'debug'
import { makeClient } from '@jackdbd/plausible-client'
import { DEBUG_PREFIX, ERROR_MESSAGE_PREFIX } from './constants.js'
import { options as optionsSchema } from './schemas.js'

const debug = makeDebug(`${DEBUG_PREFIX}`)

const statsBreakdown = async (client, statsOptions) => {
  debug(`options for Plausible /stats endpoint %O`, statsOptions)
  const breakdown = await client.stats.breakdown(statsOptions)
  debug(`breakdown from Plausible /stats endpoint %O`, breakdown)
  return breakdown
}

/**
 * Plugin configuration function.
 */
export const plausiblePlugin = (eleventyConfig, providedOptions) => {
  const { error, value: pluginConfig } = optionsSchema.validate(
    providedOptions,
    {
      allowUnknown: true,
      stripUnknown: true
    }
  )

  if (error) {
    throw new Error(
      `${ERROR_MESSAGE_PREFIX.invalidConfiguration}: ${error.message}`
    )
  }

  const { apiKey, ...safeConfig } = pluginConfig
  debug(`plugin config (Plausible API KEY not shown) %O`, safeConfig)

  const client = makeClient(
    {
      apiKey,
      siteId: pluginConfig.siteId
    },
    {
      directory: pluginConfig.cacheDirectory,
      duration: pluginConfig.cacheDuration,
      verbose: pluginConfig.cacheVerbose
    }
  )

  // https://github.com/jackdbd/calderone/blob/main/packages/plausible-client/src/stats/schemas.ts
  const statsOptions = {
    // filters: '',
    limit: pluginConfig.statsBreakdownLimit,
    metrics: pluginConfig.statsBreakdownMetrics,
    // page: 1,
    period: pluginConfig.statsBreakdownPeriod
    // property: ''
  }

  eleventyConfig.addGlobalData(
    pluginConfig.statsBreakdownGlobalDataKey,
    // Note: I find it a bit surprising, but this async function is invoked
    // before the eleventy.before event handler.
    async () => {
      debug(`fetching statsBreakdown using these options %O`, statsOptions)
      return await statsBreakdown(client, statsOptions)
    }
  )
}
