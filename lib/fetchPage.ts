import { chromium, Browser } from 'playwright'

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

let browserInstance: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await chromium.launch({ headless: true })
  }
  return browserInstance
}

export async function fetchAndExtract(url: string): Promise<Extracted> {
  const browser = await getBrowser()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Navigate to URL with timeout
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    // Extract metadata with short timeouts for optional elements
    const title = await page.title()
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content', { timeout: 2000 }).catch(() => null) || undefined
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href', { timeout: 2000 }).catch(() => null) || undefined
    const robotsMeta = await page.locator('meta[name="robots"]').getAttribute('content', { timeout: 2000 }).catch(() => null) || undefined
    const lang = await page.locator('html').getAttribute('lang', { timeout: 2000 }).catch(() => null) || undefined
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content', { timeout: 2000 }).catch(() => null) || undefined

    // Count headings
    const h1Count = await page.locator('h1').count()
    const h2Count = await page.locator('h2').count()

    // Check for social meta tags
    const ogTagsPresent = await page.locator('meta[property^="og:"]').count() > 0
    const twitterTagsPresent = await page.locator('meta[name^="twitter:"]').count() > 0

    // Count links and images
    const linksCount = await page.locator('a[href]').count()
    const imagesCount = await page.locator('img').count()

    // Count images with alt text
    const images = await page.locator('img').all()
    let imagesWithAlt = 0
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      if (alt && alt.trim().length > 0) {
        imagesWithAlt++
      }
    }

    // Check for schema.org JSON-LD
    const hasSchemaLD = await page.locator('script[type="application/ld+json"]').count() > 0

    return {
      title: title || undefined,
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
  } finally {
    await context.close()
  }
}

// Cleanup function to close browser when needed
export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close()
    browserInstance = null
  }
}
