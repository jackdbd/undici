const makeDebug = require('debug')
const plausibleClientPromise = import('@jackdbd/plausible-client')
const { options: optionsSchema } = require('./schemas.cjs')

const NAMESPACE = 'eleventy-plugin-plausible'

const debug = makeDebug(NAMESPACE)

const statsBreakdown = async (client, statsOptions) => {
  debug(`options for Plausible /stats endpoint %O`, statsOptions)
  const breakdown = await client.stats.breakdown(statsOptions)
  debug(`breakdown from Plausible /stats endpoint %O`, breakdown)
  return breakdown
}

/**
 * Plugin configuration function.
 */
const plausible = (eleventyConfig, providedOptions) => {
  const { error, value: pluginConfig } = optionsSchema.validate(
    providedOptions,
    {
      allowUnknown: true,
      stripUnknown: true
    }
  )

  if (error) {
    throw new Error(`[${NAMESPACE}] ${error.message}`)
  }

  const { apiKey, ...safeConfig } = pluginConfig
  debug(`plugin config (Plausible API KEY not shown) %O`, safeConfig)

  // eleventyConfig.on('eleventy.before', async () => {
  //   console.log('=== eleventy.before event handler ===')
  // })

  eleventyConfig.addGlobalData(
    pluginConfig.statsBreakdownGlobalDataKey,
    // Note: I find it a bit surprising, but this async function is invoked
    // before the eleventy.before event handler.
    async () => {
      const { makeClient } = await plausibleClientPromise

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

      return await statsBreakdown(client, statsOptions)
    }
  )
}

module.exports = { initArguments: {}, configFunction: plausible }
