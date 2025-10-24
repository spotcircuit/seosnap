// Google PageSpeed Insights API integration
// Free alternative to running Lighthouse locally
// Get your API key: https://developers.google.com/speed/docs/insights/v5/get-started

export type LighthouseScores = {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
}

export type LighthouseMetrics = {
  scores: LighthouseScores
  metrics: {
    firstContentfulPaint?: number
    largestContentfulPaint?: number
    totalBlockingTime?: number
    cumulativeLayoutShift?: number
    speedIndex?: number
    timeToInteractive?: number
  }
  diagnostics: {
    mainThreadWork?: number
    bootupTime?: number
    domSize?: number
  }
}

export async function runPageSpeedInsights(url: string): Promise<LighthouseMetrics> {
  const apiKey = process.env.PAGESPEED_API_KEY

  if (!apiKey) {
    throw new Error('PAGESPEED_API_KEY environment variable not set')
  }

  // Build API URL
  const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
  apiUrl.searchParams.set('url', url)
  apiUrl.searchParams.set('key', apiKey)
  apiUrl.searchParams.set('strategy', 'desktop')

  // Add multiple categories - use append instead of set for multiple values
  apiUrl.searchParams.append('category', 'PERFORMANCE')
  apiUrl.searchParams.append('category', 'ACCESSIBILITY')
  apiUrl.searchParams.append('category', 'BEST_PRACTICES')
  apiUrl.searchParams.append('category', 'SEO')

  try {
    console.log('PageSpeed API URL:', apiUrl.toString())

    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`PageSpeed API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const lhr = data.lighthouseResult

    if (!lhr) {
      throw new Error('Invalid PageSpeed API response - missing lighthouseResult')
    }

    // Debug: Log available categories
    console.log('PageSpeed API Categories:', Object.keys(lhr.categories || {}))
    console.log('Performance score:', lhr.categories?.performance?.score)
    console.log('Accessibility score:', lhr.categories?.accessibility?.score)
    console.log('Best-practices score:', lhr.categories?.['best-practices']?.score)
    console.log('SEO score:', lhr.categories?.seo?.score)

    // Extract scores (0-100)
    // Note: PWA category is not available in PageSpeed Insights API
    const scores: LighthouseScores = {
      performance: Math.round((lhr.categories?.performance?.score ?? 0) * 100),
      accessibility: Math.round((lhr.categories?.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((lhr.categories?.['best-practices']?.score ?? 0) * 100),
      seo: Math.round((lhr.categories?.seo?.score ?? 0) * 100)
    }

    // Extract key metrics (in milliseconds)
    const audits = lhr.audits
    const metrics = {
      firstContentfulPaint: audits['first-contentful-paint']?.numericValue,
      largestContentfulPaint: audits['largest-contentful-paint']?.numericValue,
      totalBlockingTime: audits['total-blocking-time']?.numericValue,
      cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue,
      speedIndex: audits['speed-index']?.numericValue,
      timeToInteractive: audits['interactive']?.numericValue
    }

    // Extract diagnostics
    const diagnostics = {
      mainThreadWork: audits['mainthread-work-breakdown']?.numericValue,
      bootupTime: audits['bootup-time']?.numericValue,
      domSize: audits['dom-size']?.numericValue
    }

    return {
      scores,
      metrics,
      diagnostics
    }
  } catch (error) {
    console.error('PageSpeed Insights API error:', error)
    throw new Error(
      `PageSpeed Insights failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
