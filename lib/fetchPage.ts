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

let browserInstance: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    // @sparticuz/chromium for Vercel serverless
    const executablePath = await chromiumPkg.executablePath()

    browserInstance = await chromium.launch({
      args: chromiumPkg.args,
      executablePath,
      headless: true, // Always headless in serverless
    })
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

    // Extract metadata with multiple strategies for reliability
    const title = await page.title()

    // Meta description - try multiple selectors (case-insensitive)
    const metaDescription = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="description" i]') ||
                   document.querySelector('meta[name="Description" i]')
      return meta?.getAttribute('content') || null
    }).catch(() => null) || undefined

    // Canonical - try multiple selectors
    const canonical = await page.evaluate(() => {
      const link = document.querySelector('link[rel="canonical" i]') ||
                   document.querySelector('link[rel="Canonical" i]')
      return link?.getAttribute('href') || null
    }).catch(() => null) || undefined

    const robotsMeta = await page.locator('meta[name="robots"]').getAttribute('content').catch(() => null) || undefined
    const lang = await page.locator('html').getAttribute('lang').catch(() => null) || undefined
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content').catch(() => null) || undefined

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
