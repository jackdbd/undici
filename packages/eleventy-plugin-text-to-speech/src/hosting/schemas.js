'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.hosting_client =
  exports.hosting =
  exports.write_func =
  exports.write_result =
  exports.write_result_failure =
  exports.write_result_success =
    void 0
var zod_1 = require('zod')
var common_js_1 = require('../schemas/common.js')
/**
 * @internal
 */
exports.write_result_success = zod_1.z.object({
  error: zod_1.z.undefined().optional(),
  value: zod_1.z.object({
    href: common_js_1.href,
    message: zod_1.z.string().min(1)
  })
})
/**
 * @internal
 */
exports.write_result_failure = zod_1.z.object({
  error: zod_1.z.instanceof(Error),
  value: zod_1.z.undefined().optional()
})
/**
 * @internal
 */
exports.write_result = zod_1.z.union([
  exports.write_result_failure,
  exports.write_result_success
])
/**
 * @internal
 */
exports.write_func = zod_1.z
  .function()
  .returns(zod_1.z.promise(exports.write_result))
exports.hosting = zod_1.z.object({
  config: zod_1.z.object({}).passthrough(),
  write: exports.write_func
})
exports.hosting_client = zod_1.z.function().returns(exports.hosting)
