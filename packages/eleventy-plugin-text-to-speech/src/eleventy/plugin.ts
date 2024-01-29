import { z } from 'zod'
import { collection_name, transform_name } from '@jackdbd/zod-schemas/eleventy'
import {
  DEFAULT_TRANSFORM_NAME,
  DEFAULT_COLLECTION_NAME
} from '../constants.js'
import { rule } from '../schemas/rule.js'

/**
 * Config of this Eleventy plugin.
 *
 * @hidden
 */
export const config = z.object({
  /**
   * Name of the 11ty collection created by this plugin.
   *
   * @remarks
   * If you register this plugin more than once, you will need to use a
   * different name every time (otherwise 11ty would throw an Error).
   */
  collectionName: collection_name.default(DEFAULT_COLLECTION_NAME),

  /**
   * Rules that determine which texts to convert into speech.
   */
  rules: z.array(rule).min(1),

  /**
   * Name of the 11ty transform created by this plugin.
   *
   * @remarks
   * If you register this plugin more than once, you will need to use a
   * different name every time (11ty would NOT throw an Error, but this plugin
   * will not work as expected).
   */
  transformName: transform_name.default(DEFAULT_TRANSFORM_NAME)
})

/**
 * Configuration for this Eleventy plugin.
 *
 * @public
 * @interface
 */
export type Config = z.input<typeof config>
