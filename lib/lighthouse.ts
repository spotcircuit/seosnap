import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'

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

export async function runLighthouse(url: string): Promise<LighthouseMetrics> {
  let chrome = null

  try {
    // Launch Chrome using chrome-launcher (Lighthouse's recommended approach)
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
      logLevel: 'error'
    })

    // Run Lighthouse with timeout
    const runnerResult = await Promise.race([
      lighthouse(url, {
        port: chrome.port,
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          disabled: false
        },
        logLevel: 'error'
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Lighthouse timeout after 60 seconds')), 60000)
      )
    ]) as any

    if (!runnerResult || !runnerResult.lhr) {
      throw new Error('Lighthouse returned invalid results')
    }

    const { lhr } = runnerResult

    // Extract scores (0-100)
    const scores: LighthouseScores = {
      performance: Math.round((lhr.categories.performance?.score || 0) * 100),
      accessibility: Math.round((lhr.categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((lhr.categories['best-practices']?.score || 0) * 100),
      seo: Math.round((lhr.categories.seo?.score || 0) * 100)
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
    console.error('Lighthouse error:', error)
    throw new Error(
      `Lighthouse audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  } finally {
    if (chrome) {
      try {
        await chrome.kill()
      } catch (err) {
        console.error('Error closing Chrome:', err)
      }
    }
  }
}
