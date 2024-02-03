'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.defaultAudioInnerHTML = exports.audio_inner_html = void 0
var node_path_1 = require('node:path')
var zod_1 = require('zod')
var media_type_js_1 = require('./media-type.js')
var common_js_1 = require('./schemas/common.js')
exports.audio_inner_html = zod_1.z
  .function()
  .args(zod_1.z.array(common_js_1.href))
  .returns(zod_1.z.string().min(1))
var defaultAudioInnerHTML = function (hrefs) {
  var aTags = []
  var sourceTags = []
  hrefs.forEach(function (href) {
    var _a = (0, media_type_js_1.mediaType)(node_path_1.default.extname(href)),
      error = _a.error,
      value = _a.value
    if (error && value) {
      throw new Error("You can't have both an error and a value")
    }
    if (error) {
      sourceTags.push(
        '<p>'
          .concat(error.message, '. Here is a <a href="')
          .concat(href, '">link to the audio</a> instead.</p>')
      )
    }
    if (value) {
      aTags.push(
        '<a href="'.concat(href, '" target="_blank">').concat(href, '</a>')
      )
      sourceTags.push(
        '<source src='.concat(href, ' type="').concat(value, '">')
      )
    }
  })
  var p =
    "<p>Your browser doesn't support HTML5 <code>audio</code>. Here are the links to the audio files instead:</p>"
  var ul = '<ul>'.concat(
    aTags
      .map(function (a) {
        return '<li>'.concat(a, '</li>')
      })
      .join(''),
    '</ul>'
  )
  var fallback = ''.concat(p).concat(ul)
  return ''.concat(sourceTags.join('')).concat(fallback)
}
exports.defaultAudioInnerHTML = defaultAudioInnerHTML
