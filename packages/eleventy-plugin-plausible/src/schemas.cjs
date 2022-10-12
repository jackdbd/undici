const Joi = require('joi')

const defaultOptions = {
  cacheDirectory: '.cache-plausible-json-responses',
  cacheDuration: '1d',
  cacheVerbose: false,

  statsBreakdownGlobalDataKey: 'plausibleStatsBreakdown',
  statsBreakdownLimit: 10,
  statsBreakdownMetrics: 'visitors',
  statsBreakdownPeriod: '30d'
}

const options = Joi.object().keys({
  apiKey: Joi.string().required(),

  cacheDirectory: Joi.string().default(defaultOptions.cacheDirectory),

  cacheDuration: Joi.string().default(defaultOptions.cacheDuration),

  cacheVerbose: Joi.boolean().default(defaultOptions.cacheVerbose),

  statsBreakdownGlobalDataKey: Joi.string().default(
    defaultOptions.statsBreakdownGlobalDataKey
  ),

  statsBreakdownLimit: Joi.number()
    .min(1)
    .default(defaultOptions.statsBreakdownLimit),

  statsBreakdownMetrics: Joi.string().default(
    defaultOptions.statsBreakdownMetrics
  ),

  statsBreakdownPeriod: Joi.string().default(
    defaultOptions.statsBreakdownPeriod
  ),

  siteId: Joi.string().required()
})

module.exports = { options, defaultOptions }
