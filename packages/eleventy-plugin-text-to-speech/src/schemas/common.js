'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.string_or_uint8 =
  exports.output_path =
  exports.href =
  exports.file_extension =
  exports.asset_name =
    void 0
var zod_1 = require('zod')
exports.asset_name = zod_1.z.string().min(1).describe('Name of the audio file')
exports.file_extension = zod_1.z.string().min(1).describe('File extension')
exports.href = zod_1.z.string().min(1).url()
exports.output_path = zod_1.z.string().min(1)
exports.string_or_uint8 = zod_1.z.union([
  zod_1.z.string(),
  zod_1.z.instanceof(Uint8Array)
])
