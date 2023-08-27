export const NAMESPACE = 'eleventy-plugin-webmention'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DEFAULT_BLACKLISTED = [] as any[]

export const DEFAULT_CACHE_DIRECTORY = '.cache-webmentions'

export const DEFAULT_CACHE_DURATION = '3600s'

export const DEFAULT_CACHE_VERBOSE = false

// https://github.com/apostrophecms/sanitize-html#default-options
export const DEFAULT_SANITIZE_OPTIONS = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p'],
  allowedAttributes: {
    a: ['href']
  }
}

export const DEFAULT_PAGE = 0

export const DEFAULT_PER_PAGE = 100
