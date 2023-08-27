const { makeClient } = require('../lib/webmention-io.js')

describe('makeClient', () => {
  const config = {
    blacklisted: [],
    cacheDirectory: '.cache-webmentions',
    cacheDuration: '3600s',
    cacheVerbose: false,
    sanitizeOptions: {},
    token: process.env.WEBMENTION_IO_TOKEN
  }

  let client
  beforeAll(async () => {
    client = makeClient(config)
  })

  it('returns no webmentions when domain is example.com', async () => {
    const domain = 'example.com'

    const webmentions = await client.webmentionsSentToDomain(domain)

    expect(webmentions.likes.length).toBe(0)
    expect(webmentions.replies.length).toBe(0)
    expect(webmentions.reposts.length).toBe(0)
  })

  it('returns some webmentions when domain is www.giacomodebidda.com', async () => {
    const domain = 'www.giacomodebidda.com'

    const webmentions = await client.webmentionsSentToDomain(domain)

    expect(webmentions.likes.length).toBeGreaterThan(0)
    expect(webmentions.replies.length).toBeGreaterThan(0)
    expect(webmentions.reposts.length).toBeGreaterThan(0)
  })
})
