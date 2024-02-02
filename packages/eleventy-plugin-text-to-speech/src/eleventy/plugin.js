'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.config = void 0
var zod_1 = require('zod')
var eleventy_1 = require('@jackdbd/zod-schemas/eleventy')
var constants_js_1 = require('../constants.js')
var rule_js_1 = require('../schemas/rule.js')
/**
 * Config of this Eleventy plugin.
 *
 * @hidden
 */
exports.config = zod_1.z
  .object({
    /**
     * Name of the 11ty collection created by this plugin.
     *
     * @remarks
     * If you register this plugin more than once, you will need to use a
     * different name every time (otherwise 11ty would throw an Error).
     */
    collectionName: eleventy_1.collection_name
      .default(constants_js_1.DEFAULT_COLLECTION_NAME)
      .describe('Name of the 11ty collection defined by this plugin'),
    /**
     * Rules that determine which texts to convert into speech.
     */
    rules: zod_1.z
      .array(rule_js_1.rule)
      .min(1)
      .describe('Rules that determine which texts to convert into speech'),
    /**
     * Name of the 11ty transform created by this plugin.
     *
     * @remarks
     * If you register this plugin more than once, you will need to use a
     * different name every time (11ty would NOT throw an Error, but this plugin
     * will not work as expected).
     */
    transformName: eleventy_1.transform_name
      .default(constants_js_1.DEFAULT_TRANSFORM_NAME)
      .describe('Name of the 11ty transform defined by this plugin')
  })
  .describe('Plugin config')
