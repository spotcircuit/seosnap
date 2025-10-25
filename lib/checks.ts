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
  if (titleLen === 0) {
    notes.title_length_ok = 'Missing title tag - Add a descriptive title to appear in search results'
  } else if (titleLen < 50) {
    notes.title_length_ok = `${titleLen} chars - Too short. Add more keywords (optimal: 50-60 chars)`
  } else if (titleLen > 60) {
    notes.title_length_ok = `${titleLen} chars - Too long. Google may truncate. Shorten to 50-60 chars`
  } else {
    notes.title_length_ok = `${titleLen} chars - Perfect length for search visibility`
  }

  // Meta description check
  const meta_description_ok = descLen >= 120 && descLen <= 160
  if (descLen === 0) {
    notes.meta_description_ok = 'Missing - Add compelling description to improve click-through rates'
  } else if (descLen < 120) {
    notes.meta_description_ok = `${descLen} chars - Too short. Expand to 120-160 chars for better CTR`
  } else if (descLen > 160) {
    notes.meta_description_ok = `${descLen} chars - Too long. Google will truncate. Shorten to 120-160 chars`
  } else {
    notes.meta_description_ok = `${descLen} chars - Perfect length for search snippets`
  }

  // Image alt coverage
  const altCoverage = ex.imagesCount === 0 ? 1 : ex.imagesWithAlt / ex.imagesCount
  const image_alt_coverage = ex.imagesCount === 0 ? true : altCoverage >= 0.8
  if (ex.imagesCount === 0) {
    notes.image_alt_coverage = 'No images found on page'
  } else if (image_alt_coverage) {
    notes.image_alt_coverage = `${ex.imagesWithAlt}/${ex.imagesCount} images (${Math.round(altCoverage * 100)}%) - Good for accessibility & SEO`
  } else {
    notes.image_alt_coverage = `${ex.imagesWithAlt}/${ex.imagesCount} images (${Math.round(altCoverage * 100)}%) - Add alt text for accessibility`
  }

  // H1 count
  const single_h1 = ex.h1Count === 1
  if (ex.h1Count === 0) {
    notes.single_h1 = 'No H1 found - Add a main heading for page topic clarity'
  } else if (ex.h1Count > 1) {
    notes.single_h1 = `Found ${ex.h1Count} H1 tags - Use only 1 H1 per page for better SEO structure`
  } else {
    notes.single_h1 = 'Perfect - One H1 clearly defines page topic'
  }

  // Canonical URL validation
  let canonical_present = false
  if (ex.canonical) {
    // Check if canonical is an absolute URL
    const isAbsolute = ex.canonical.startsWith('http://') || ex.canonical.startsWith('https://')

    if (!isAbsolute) {
      notes.canonical_present = `Relative URL: ${ex.canonical} - Use absolute URLs to prevent duplicate content`
      canonical_present = false
    } else {
      canonical_present = true

      // Check if it matches the requested URL (normalize trailing slashes)
      if (requestedUrl) {
        const normalizeUrl = (url: string) => url.replace(/\/$/, '').toLowerCase()
        const normalizedCanonical = normalizeUrl(ex.canonical)
        const normalizedRequested = normalizeUrl(requestedUrl)

        if (normalizedCanonical !== normalizedRequested) {
          notes.canonical_present = `Points to: ${ex.canonical} - May indicate preferred URL version`
        } else {
          notes.canonical_present = `${ex.canonical} - Correctly set to prevent duplicate content`
        }
      } else {
        notes.canonical_present = `${ex.canonical} - Helps search engines identify preferred URL`
      }
    }
  } else {
    notes.canonical_present = 'Missing - Add canonical URL to prevent duplicate content issues'
  }

  // Robots meta tag check
  const robots_allows_index = !ex.robotsMeta || !ex.robotsMeta.toLowerCase().includes('noindex')
  if (!ex.robotsMeta) {
    notes.robots_allows_index = 'No robots meta tag - Page will be indexed by default'
  } else if (robots_allows_index) {
    notes.robots_allows_index = `${ex.robotsMeta} - Page allows search engine indexing`
  } else {
    notes.robots_allows_index = `${ex.robotsMeta} - Page blocked from search engines`
  }

  // Open Graph check
  if (ex.ogTagsPresent) {
    notes.og_present = 'Present - Good for social media sharing on Facebook, LinkedIn'
  } else {
    notes.og_present = 'Missing - Add Open Graph tags for better social media previews'
  }

  // Twitter Cards check
  if (ex.twitterTagsPresent) {
    notes.twitter_present = 'Present - Optimized for Twitter/X sharing'
  } else {
    notes.twitter_present = 'Missing - Add Twitter Card tags for better X/Twitter previews'
  }

  // Schema markup check
  if (ex.hasSchemaLD) {
    notes.schema_present = 'Present - Structured data helps search engines understand content'
  } else {
    notes.schema_present = 'Missing - Add schema markup for rich snippets in search results'
  }

  return {
    title_length_ok,
    meta_description_ok,
    canonical_present,
    robots_allows_index,
    single_h1,
    image_alt_coverage,
    og_present: ex.ogTagsPresent,
    twitter_present: ex.twitterTagsPresent,
    schema_present: ex.hasSchemaLD,
    notes,
  }
}
