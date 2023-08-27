import makeDebug from 'debug'
import EleventyFetch from '@11ty/eleventy-fetch'
import {
  DEFAULT_BLACKLISTED,
  DEFAULT_CACHE_DIRECTORY,
  DEFAULT_CACHE_DURATION,
  DEFAULT_CACHE_VERBOSE,
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  DEFAULT_SANITIZE_OPTIONS,
  NAMESPACE
} from './constants.js'
import { makeResponseToWebmentions } from './utils.js'

const debug = makeDebug(`${NAMESPACE}:webmention.io`)

/* eslint-disable @typescript-eslint/no-explicit-any */

// TODO:
// https://github.com/aaronpk/webmention.io#api
// https://webmention.io/

export const fetchPaginatedWebmentions = async (config: any) => {
  debug(`fetchPaginatedWebmentions %O`, config)
  // https://www.w3.org/wiki/JF2
  const format = 'jf2'
  const endpoint = `https://webmention.io/api/mentions.${format}`

  const {
    cacheDirectory,
    cacheDuration,
    cacheVerbose,
    domain,
    page,
    perPage,
    responseToWebmentions,
    token
  } = config

  const response: any = await EleventyFetch(
    `${endpoint}?domain=${domain}&page=${page}&per-page=${perPage}&token=${token}`,
    {
      directory: cacheDirectory,
      duration: cacheDuration,
      type: 'json',
      verbose: cacheVerbose
    }
  )

  return responseToWebmentions(response)
}

export async function* autoPaginatedWebmentions(options: any) {
  // debug(`async generator for auto pagination %O`, options)
  // TODO: use zod

  const { domain, responseToWebmentions, token } = options

  const cacheDirectory = options?.cacheDirectory || DEFAULT_CACHE_DIRECTORY
  const cacheDuration = options?.cacheDuration || DEFAULT_CACHE_DURATION
  const cacheVerbose = options?.cacheVerbose || DEFAULT_CACHE_VERBOSE

  const perPage = options?.perPage || DEFAULT_PER_PAGE

  const start = options?.page || DEFAULT_PAGE
  let stop = start + 1

  for (let page = start; page <= stop; page++) {
    debug(`autopaginating responses from Webmention.io`, { page, start, stop })
    const webmentions = await fetchPaginatedWebmentions({
      cacheDirectory,
      cacheDuration,
      cacheVerbose,
      domain,
      page,
      perPage,
      responseToWebmentions,
      token
    })

    const { likes, replies, reposts } = webmentions
    const n = likes.length + replies.length + reposts.length

    if (n === 0) {
      debug(
        `stop autopaginating responses Webmention.io because page ${page} returned no webmentions`
      )
      stop = page - 1
    } else {
      debug(
        `keep autopaginating responses from Webmention.io because page ${page} returned ${n} webmentions`
      )
      stop = page + 1
    }

    yield { page, webmentions }
  }
}

/**
 * Creates an API client that fetches webmentions from webmention.io and caches
 * JSON responses locally.
 *
 * You can retrieve:
 *
 * - all webmentions sent to the domain associated with the token (i.e. API key) webmention.io gave you
 * - all webmentions sent to a specific target (e.g. the URL where a blog post
 *   is hosted at)
 *
 * @see https://github.com/aaronpk/webmention.io
 */
export const makeClient = ({
  blacklisted = DEFAULT_BLACKLISTED,
  cacheDirectory = DEFAULT_CACHE_DIRECTORY,
  cacheDuration = DEFAULT_CACHE_DURATION,
  cacheVerbose = DEFAULT_CACHE_VERBOSE,
  sanitizeOptions = DEFAULT_SANITIZE_OPTIONS,
  token
}: any) => {
  // https://www.w3.org/wiki/JF2
  const format = 'jf2'
  const endpoint = `https://webmention.io/api/mentions.${format}`

  const responseToWebmentions = makeResponseToWebmentions({
    blacklisted,
    sanitizeOptions
  })

  // TODO: pagination
  // https://github.com/aaronpk/webmention.io#paging

  const webmentionsSentToDomain = async (domain: string) => {
    //

    const pagination = { page: 0, per_page: 2 }
    debug(`retrieve webmentions sent to ${domain} %O`, pagination)

    const response: any = await EleventyFetch(
      `${endpoint}?domain=${domain}&page=${pagination.page}&per-page=${pagination.per_page}&token=${token}`,
      {
        directory: cacheDirectory,
        duration: cacheDuration,
        type: 'json',
        verbose: cacheVerbose
      }
    )

    const { likes, replies, reposts } = responseToWebmentions(response)

    if (response.children.length) {
      debug(
        `${
          likes.length + replies.length + reposts.length
        } webmentions sent to ${domain} (after blacklisting and HTML sanitization) %o`,
        {
          likes: likes.length,
          replies: replies.length,
          reposts: reposts.length
        }
      )
    }

    return { likes, replies, reposts }
  }

  const webmentionsSentToUrl = async (url: string) => {
    const pagination = { page: 0, per_page: 100 }

    const response: any = await EleventyFetch(
      `${endpoint}?page=${pagination.page}&per-page=${pagination.per_page}&target=${url}&token=${token}`,
      {
        directory: cacheDirectory,
        duration: cacheDuration,
        type: 'json',
        verbose: cacheVerbose
      }
    )

    const { likes, replies, reposts } = responseToWebmentions(response)

    if (response.children.length) {
      debug(
        `${
          likes.length + replies.length + reposts.length
        } webmentions sent to ${url} (after blacklisting and HTML sanitization) %o`,
        {
          likes: likes.length,
          replies: replies.length,
          reposts: reposts.length
        }
      )
    }

    return { likes, replies, reposts }
  }

  return {
    autoPaginatedWebmentions,
    webmentionsSentToDomain,
    webmentionsSentToUrl
  }
}
