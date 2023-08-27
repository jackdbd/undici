#!/usr/bin/env zx

import 'zx/globals'
import { throwIfNotInvokedFromMonorepoRoot } from './utils.mjs'
import {
  DEFAULT_BLACKLISTED,
  DEFAULT_SANITIZE_OPTIONS
} from '../packages/eleventy-plugin-webmention/lib/constants.js'
import { makeResponseToWebmentions } from '../packages/eleventy-plugin-webmention/lib/utils.js'
import { autoPaginatedWebmentions } from '../packages/eleventy-plugin-webmention/lib/webmention-io.js'

throwIfNotInvokedFromMonorepoRoot(process.env.PWD)

// const client = makeClient({
//   cacheVerbose: true,
//   token: process.env.WEBMENTION_IO_TOKEN
// })

const domain = 'www.giacomodebidda.com'

const responseToWebmentions = makeResponseToWebmentions({
  blacklisted: DEFAULT_BLACKLISTED,
  sanitizeOptions: DEFAULT_SANITIZE_OPTIONS
})

// const webmentions = await client.webmentionsSentToDomain(domain)

const async_gen_with_options = autoPaginatedWebmentions({
  domain,
  // page: 1,
  // perPage: 3,
  responseToWebmentions,
  token: process.env.WEBMENTION_IO_TOKEN
})

let webmentions = []
for await (const v of async_gen_with_options) {
  const { likes, replies, reposts } = v.webmentions
  const n = likes.length + replies.length + reposts.length
  console.log(`page ${v.page}: ${n} webmentions sent to ${domain}`)
  likes.forEach((wm) => webmentions.push(wm))
  replies.forEach((wm) => webmentions.push(wm))
  reposts.forEach((wm) => webmentions.push(wm))
}

console.log(`domain ${domain} received ${webmentions.length} webmentions`)
console.log(webmentions)
