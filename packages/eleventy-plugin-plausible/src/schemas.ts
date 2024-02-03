import { z } from 'zod'

export const DEFAULT_OPTIONS = {
  cacheDirectory: '.cache-plausible-json-responses',
  cacheDuration: '1d',
  cacheVerbose: false,
  statsBreakdownGlobalDataKey: 'plausibleStatsBreakdown',
  statsBreakdownLimit: 10,
  statsBreakdownMetrics: 'visitors',
  statsBreakdownPeriod: '30d'
}

export const options = z.object({
  apiKey: z
    .string()
    .min(1)
    .optional()
    .describe('Your Plausible account API key.'),

  cacheDirectory: z
    .string()
    .min(1)
    .default(DEFAULT_OPTIONS.cacheDirectory)
    .describe(
      'Directory where to store JSON responses coming from the Plausible API.'
    ),

  cacheDuration: z
    .string()
    .min(1)
    .default(DEFAULT_OPTIONS.cacheDuration)
    .describe(
      'How long to cache JSON responses for. See details on the [eleventy-fetch documentation](https://www.11ty.dev/docs/plugins/fetch/#change-the-cache-duration).'
    ),

  cacheVerbose: z
    .boolean()
    .default(DEFAULT_OPTIONS.cacheVerbose)
    .describe('Whether to log requested remote URLs to the console.'),

  statsBreakdownGlobalDataKey: z
    .string()
    .min(1)
    .default(DEFAULT_OPTIONS.statsBreakdownGlobalDataKey)
    .describe(
      'Key that this plugin should add to the `eleventyConfig.globalData` object.'
    ),

  statsBreakdownLimit: z
    .number()
    .min(1)
    .default(DEFAULT_OPTIONS.statsBreakdownLimit)
    .describe(
      'Number of results to return from the Plausible `/stats` API endpoint.'
    ),

  statsBreakdownMetrics: z
    .string()
    .min(1)
    .default(DEFAULT_OPTIONS.statsBreakdownMetrics)
    .describe(
      'Comma-separated list of [metrics](https://plausible.io/docs/stats-api#metrics) to return from the Plausible /stats API endpoint. See [here](https://plausible.io/docs/metrics-definitions) for all plausible.io metrics and their definitions.'
    ),

  statsBreakdownPeriod: z
    .string()
    .min(1)
    .default(DEFAULT_OPTIONS.statsBreakdownPeriod)
    .describe(
      'See [Time periods](https://plausible.io/docs/stats-api#time-periods) on the Plausible API docs for details.'
    ),

  siteId: z
    .string()
    .min(1)
    .optional()
    .describe('The domain of your site as configured in Plausible.')
})

export type Options = z.input<typeof options>
