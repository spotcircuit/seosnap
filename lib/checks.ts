export type ChecksResult = {
  title_length_ok: boolean
  meta_description_ok: boolean
  canonical_present: boolean
  robots_allows_index: boolean
  single_h1: boolean
  image_alt_coverage: boolean
  og_present: boolean
  twitter_present: boolean
  schema_present: boolean
}

export type ChecksResultWithNotes = ChecksResult & {
  notes?: Record<string, string>
}

export function runChecks(ex: {
  title?: string
  metaDescription?: string
  canonical?: string
  robotsMeta?: string
  h1Count: number
  imagesCount: number
  imagesWithAlt: number
  ogTagsPresent: boolean
  twitterTagsPresent: boolean
  hasSchemaLD: boolean
}, requestedUrl?: string): ChecksResultWithNotes {
  const titleLen = ex.title?.length || 0
  const descLen = ex.metaDescription?.length || 0

  const notes: Record<string, string> = {}

  // Title length check
  const title_length_ok = titleLen >= 50 && titleLen <= 60
  if (!title_length_ok && titleLen > 0) {
    notes.title_length_ok = `${titleLen} chars (optimal: 50-60)`
  } else if (title_length_ok) {
    notes.title_length_ok = `${titleLen} chars`
  }

  // Meta description check
  const meta_description_ok = descLen >= 120 && descLen <= 160
  if (!meta_description_ok && descLen > 0) {
    notes.meta_description_ok = `${descLen} chars (optimal: 120-160)`
  } else if (meta_description_ok) {
    notes.meta_description_ok = `${descLen} chars`
  }

  // Image alt coverage
  const altCoverage = ex.imagesCount === 0 ? 1 : ex.imagesWithAlt / ex.imagesCount
  const image_alt_coverage = ex.imagesCount === 0 ? true : altCoverage >= 0.8
  if (ex.imagesCount > 0) {
    notes.image_alt_coverage = `${ex.imagesWithAlt}/${ex.imagesCount} images (${Math.round(altCoverage * 100)}%)`
  }

  // H1 count
  const single_h1 = ex.h1Count === 1
  if (!single_h1) {
    notes.single_h1 = `Found ${ex.h1Count} H1 tags (should be 1)`
  }

  // Canonical URL validation
  let canonical_present = false
  if (ex.canonical) {
    // Check if canonical is an absolute URL
    const isAbsolute = ex.canonical.startsWith('http://') || ex.canonical.startsWith('https://')

    if (!isAbsolute) {
      notes.canonical_present = `Relative URL: ${ex.canonical} (should be absolute)`
      canonical_present = false
    } else {
      canonical_present = true

      // Check if it matches the requested URL (normalize trailing slashes)
      if (requestedUrl) {
        const normalizeUrl = (url: string) => url.replace(/\/$/, '').toLowerCase()
        const normalizedCanonical = normalizeUrl(ex.canonical)
        const normalizedRequested = normalizeUrl(requestedUrl)

        if (normalizedCanonical !== normalizedRequested) {
          notes.canonical_present = `Points to: ${ex.canonical}`
        } else {
          notes.canonical_present = ex.canonical
        }
      } else {
        notes.canonical_present = ex.canonical
      }
    }
  } else {
    notes.canonical_present = 'Missing canonical tag'
  }

  return {
    title_length_ok,
    meta_description_ok,
    canonical_present,
    robots_allows_index: !ex.robotsMeta || !ex.robotsMeta.toLowerCase().includes('noindex'),
    single_h1,
    image_alt_coverage,
    og_present: ex.ogTagsPresent,
    twitter_present: ex.twitterTagsPresent,
    schema_present: ex.hasSchemaLD,
    notes,
  }
}
