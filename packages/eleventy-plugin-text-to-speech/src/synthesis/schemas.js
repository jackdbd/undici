'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.synthesis_client =
  exports.synthesis =
  exports.synthesize_func =
  exports.text_to_synthesize =
  exports.synthesize_result =
  exports.synthesize_result_failure =
  exports.synthesize_result_success =
    void 0
var node_stream_1 = require('node:stream')
var zod_1 = require('zod')
var common_js_1 = require('../schemas/common.js')
/**
 * @internal
 */
exports.synthesize_result_success = zod_1.z.object({
  error: zod_1.z.undefined().optional(),
  value: zod_1.z.instanceof(node_stream_1.Readable)
})
/**
 * @internal
 */
exports.synthesize_result_failure = zod_1.z.object({
  error: zod_1.z.instanceof(Error),
  value: zod_1.z.undefined().optional()
})
/**
 * @internal
 */
exports.synthesize_result = zod_1.z.union([
  exports.synthesize_result_failure,
  exports.synthesize_result_success
])
exports.text_to_synthesize = zod_1.z
  .string()
  .min(1)
  .describe('Text to synthesize')
exports.synthesize_func = zod_1.z
  .function()
  .args(exports.text_to_synthesize)
  .returns(zod_1.z.promise(exports.synthesize_result))
exports.synthesis = zod_1.z.object({
  config: zod_1.z.object({}).passthrough(),
  extension: common_js_1.file_extension,
  synthesize: exports.synthesize_func
})
exports.synthesis_client = zod_1.z.function().returns(exports.synthesis)
