import { chromium, Browser } from 'playwright-core'
import chromiumPkg from '@sparticuz/chromium'

export type Extracted = {
  title?: string
  metaDescription?: string
  canonical?: string
  robotsMeta?: string
  lang?: string
  viewport?: string
  h1Count: number
  h2Count: number
  ogTagsPresent: boolean
  twitterTagsPresent: boolean
  linksCount: number
  imagesCount: number
  imagesWithAlt: number
  hasSchemaLD: boolean
}

export async function fetchAndExtract(url: string): Promise<Extracted> {
  // Launch fresh browser for each request to avoid stale instance issues
  // In serverless, browser instances can get closed between requests
  const executablePath = await chromiumPkg.executablePath()

  const browser = await chromium.launch({
    args: chromiumPkg.args,
    executablePath,
    headless: true,
  })

  try {
    const context = await browser.newContext()
    const page = await context.newPage()
    // Navigate to URL with faster wait strategy
    // 'load' waits for page load event, not for all network activity
    // This is MUCH faster than 'networkidle' (seconds vs minutes)
    await page.goto(url, {
      waitUntil: 'load',
      timeout: 15000
    })

    // Extract ALL data in a single page.evaluate() call for maximum speed
    // This reduces 15+ browser round-trips to just 1
    const extracted = await page.evaluate(() => {
      // Title
      const title = document.title || ''

      // Meta description (case-insensitive)
      const metaDesc = document.querySelector('meta[name="description" i]') ||
                       document.querySelector('meta[name="Description" i]')
      const metaDescription = metaDesc?.getAttribute('content') || null

      // Canonical URL (case-insensitive)
      const canonicalLink = document.querySelector('link[rel="canonical" i]') ||
                            document.querySelector('link[rel="Canonical" i]')
      const canonical = canonicalLink?.getAttribute('href') || null

      // Robots meta
      const robotsTag = document.querySelector('meta[name="robots"]')
      const robotsMeta = robotsTag?.getAttribute('content') || null

      // Lang attribute
      const lang = document.documentElement.getAttribute('lang') || null

      // Viewport
      const viewportTag = document.querySelector('meta[name="viewport"]')
      const viewport = viewportTag?.getAttribute('content') || null

      // Heading counts
      const h1Count = document.querySelectorAll('h1').length
      const h2Count = document.querySelectorAll('h2').length

      // Social meta tags
      const ogTagsPresent = document.querySelectorAll('meta[property^="og:"]').length > 0
      const twitterTagsPresent = document.querySelectorAll('meta[name^="twitter:"]').length > 0

      // Links count
      const linksCount = document.querySelectorAll('a[href]').length

      // Images - count total and those with alt text in one pass
      const allImages = document.querySelectorAll('img')
      const imagesCount = allImages.length
      let imagesWithAlt = 0
      allImages.forEach(img => {
        const alt = img.getAttribute('alt')
        if (alt && alt.trim().length > 0) {
          imagesWithAlt++
        }
      })

      // Schema.org JSON-LD
      const hasSchemaLD = document.querySelectorAll('script[type="application/ld+json"]').length > 0

      return {
        title,
        metaDescription,
        canonical,
        robotsMeta,
        lang,
        viewport,
        h1Count,
        h2Count,
        ogTagsPresent,
        twitterTagsPresent,
        linksCount,
        imagesCount,
        imagesWithAlt,
        hasSchemaLD,
      }
    })

    return {
      title: extracted.title || undefined,
      metaDescription: extracted.metaDescription || undefined,
      canonical: extracted.canonical || undefined,
      robotsMeta: extracted.robotsMeta || undefined,
      lang: extracted.lang || undefined,
      viewport: extracted.viewport || undefined,
      h1Count: extracted.h1Count,
      h2Count: extracted.h2Count,
      ogTagsPresent: extracted.ogTagsPresent,
      twitterTagsPresent: extracted.twitterTagsPresent,
      linksCount: extracted.linksCount,
      imagesCount: extracted.imagesCount,
      imagesWithAlt: extracted.imagesWithAlt,
      hasSchemaLD: extracted.hasSchemaLD,
    }
  } finally {
    // Always close browser after each request
    await browser.close().catch(() => {
      // Ignore errors if browser already closed
    })
  }
}
