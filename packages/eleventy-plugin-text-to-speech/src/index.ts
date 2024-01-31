/**
 * Eleventy plugin that synthesizes **any text** you want, on **any page** of
 * your Eleventy site, using the
 * [Google Cloud Text-to-Speech API](https://cloud.google.com/text-to-speech).
 *
 * You can either self-host the audio assets this plugin generates, or host them
 * on [Cloud Storage](https://cloud.google.com/storage).
 *
 * @packageDocumentation
 */
import makeDebug from 'debug'
import type { EleventyConfig } from '@11ty/eleventy'
import { DEBUG_PREFIX, ERR_PREFIX } from './constants.js'
import { validationError } from './errors.js'
import { templatesWithAudioUnbounded } from './eleventy/collections.js'
import { injectAudioTagsUnbounded } from './eleventy/transforms.js'
import { config as schema } from './eleventy/plugin.js'
import type { Config } from './eleventy/plugin.js'

const debug = makeDebug(`${DEBUG_PREFIX}:index`)

// exports for TypeDoc
export { defaultAudioInnerHTML } from './audio-html.js'
export {
  DEBUG_PREFIX,
  DEFAULT_COLLECTION_NAME,
  DEFAULT_TRANSFORM_NAME
} from './constants.js'
export { config, type Config } from './eleventy/plugin.js'
export type { Write, WriteResult, Hosting } from './hosting/index.js'
export { mediaType } from './media-type.js'
export type { Rule } from './schemas/rule.js'
export type {
  Synthesize,
  SynthesizeResult,
  Synthesis
} from './synthesis/index.js'
export { textToAudioAsset } from './text-to-audio-asset.js'

/**
 * Adds Text-to-Speech functionality to an Eleventy site.
 *
 * @public
 */
export const textToSpeechPlugin = (
  eleventyConfig: EleventyConfig,
  config: Config
) => {
  debug('plugin config (provided by user) %O', config)

  const result = schema.safeParse(config)

  if (!result.success) {
    const err = validationError(result.error)
    console.error(`${ERR_PREFIX} ${err.message}`)
    throw err
  }

  debug('plugin config (provided by user + defaults) %O', result.data)

  const { collectionName, rules, transformName } = result.data

  const templatesWithAudio = templatesWithAudioUnbounded.bind(null, {
    rules,
    collectionName
  })
  eleventyConfig.addCollection(collectionName, templatesWithAudio)
  debug(`11ty collection added: ${collectionName}`)

  const injectAudioTags = injectAudioTagsUnbounded.bind(null, {
    rules,
    transformName
  })
  eleventyConfig.addTransform(transformName, injectAudioTags)
  debug(`11ty transform added: ${transformName}`)
}
