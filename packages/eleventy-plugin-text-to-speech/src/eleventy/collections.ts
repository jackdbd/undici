import type { CollectionApi } from '@11ty/eleventy'
import makeDebug from 'debug'
import { z } from 'zod'
import { eleventy } from '@jackdbd/zod-schemas'
import { DEBUG_PREFIX, DEFAULT_COLLECTION_NAME } from '../constants.js'
import { rule } from '../schemas/rule.js'
import { validatedDataOrThrow } from '../validation.js'

export const config_schema = z.object({
  rules: z.array(rule).min(1),
  collectionName: eleventy.collection_name.default(DEFAULT_COLLECTION_NAME)
})

export type Config = z.infer<typeof config_schema>

export const templatesWithAudioUnbounded = (
  config: Config,
  collectionApi: CollectionApi
) => {
  const cfg = validatedDataOrThrow(config, config_schema)

  const { rules } = cfg
  const collectionName = cfg.collectionName || DEFAULT_COLLECTION_NAME
  const debug = makeDebug(`${DEBUG_PREFIX}:${collectionName}`)

  const templates = collectionApi.getAll().filter((item) => {
    const idx = rules.findIndex(
      (rule) => rule.regex && rule.regex.test(item.outputPath)
    )
    return idx !== -1
  })
  debug(`${templates.length} templates in 11ty collection ${collectionName}`)
  return templates
}
