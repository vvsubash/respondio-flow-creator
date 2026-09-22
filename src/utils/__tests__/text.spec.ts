import { describe, expect, it } from 'vitest'
import { fileNameFromUrl, truncate } from '@/utils/text'

describe('truncate', () => {
  it('collapses whitespace and leaves short text alone', () => {
    expect(truncate('Hello   there\n\nagain')).toBe('Hello there again')
  })

  it('cuts long text to an ellipsis at the limit', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcd…')
  })
})

describe('fileNameFromUrl', () => {
  it('takes the last segment without the query string', () => {
    expect(fileNameFromUrl('https://example.com/a/b/photo.jpg?hmac=x')).toBe('photo.jpg')
  })

  it('falls back when there is no segment', () => {
    expect(fileNameFromUrl('https://example.com/')).toBe('attachment')
  })
})
