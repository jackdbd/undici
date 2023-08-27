const { isRepost, isTwitterUrl } = require('../lib/utils.js')

describe('isRepost', () => {
  it('is true when entry["wm-property"] is "repost-of"', () => {
    expect(isRepost({ 'wm-property': 'repost-of' })).toBeTruthy()
  })

  it('is false when entry["wm-property"] is "in-reply-to"', () => {
    expect(isRepost({ 'wm-property': 'in-reply-to' })).toBeFalsy()
  })

  it('is false when entry["wm-property"] is "mention-of"', () => {
    expect(isRepost({ 'wm-property': 'mention-of' })).toBeFalsy()
  })

  it('is false when entry["wm-property"] is "like-of"', () => {
    expect(isRepost({ 'wm-property': 'like-of' })).toBeFalsy()
  })
})

describe('isTwitterUrl', () => {
  it('is true when the string is a tweet URL', () => {
    expect(
      isTwitterUrl('https://twitter.com/tunetheweb/status/1661699095025664004')
    ).toBeTruthy()
  })
})
