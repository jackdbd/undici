import path from 'node:path'
import { z } from 'zod'
import { mediaType } from './media-type.js'
import { href as href_schema } from './schemas/common.js'

export const audio_inner_html = z
  .function()
  .args(z.array(href_schema))
  .returns(z.string().min(1))

export type AudioInnerHtml = z.infer<typeof audio_inner_html>

export const defaultAudioInnerHTML = (hrefs: string[]) => {
  const aTags: string[] = []
  const sourceTags: string[] = []

  hrefs.forEach((href) => {
    const { error, value } = mediaType(path.extname(href))

    if (error && value) {
      throw new Error(`You can't have both an error and a value`)
    }

    if (error) {
      sourceTags.push(
        `<p>${error.message}. Here is a <a href="${href}">link to the audio</a> instead.</p>`
      )
    }

    if (value) {
      aTags.push(`<a href="${href}" target="_blank">${href}</a>`)
      sourceTags.push(`<source src=${href} type="${value}">`)
    }
  })

  const p = `<p>Your browser doesn't support HTML5 <code>audio</code>. Here are the links to the audio files instead:</p>`
  const ul = `<ul>${aTags.map((a) => `<li>${a}</li>`).join('')}</ul>`
  const fallback = `${p}${ul}`

  return `${sourceTags.join('')}${fallback}`
}
