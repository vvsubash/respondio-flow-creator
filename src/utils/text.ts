export function truncate(value: string, max = 80): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length > max ? `${normalized.slice(0, max - 1)}…` : normalized
}

export function fileNameFromUrl(url: string): string {
  const withoutQuery = url.split('?')[0] ?? url
  const segment = withoutQuery.split('/').pop()
  return segment && segment.length > 0 ? segment : 'attachment'
}
