'use client'

type LighthouseData = {
  scores: {
    performance: number
    accessibility: number
    bestPractices: number
    seo: number
    pwa: number
  }
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

type Props = {
  lighthouse: LighthouseData | null
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-400 bg-green-900/30 border border-green-600'
  if (score >= 50) return 'text-yellow-400 bg-yellow-900/30 border border-yellow-600'
  return 'text-red-400 bg-red-900/30 border border-red-600'
}

function formatMetric(value: number | undefined, unit: string = 'ms'): string {
  if (value === undefined) return 'N/A'
  if (unit === 'ms') {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}s`
    }
    return `${Math.round(value)}ms`
  }
  return value.toFixed(3)
}

export default function LighthouseScores({ lighthouse }: Props) {
  if (!lighthouse) {
    return (
      <div className="bg-slate-800 border border-gray-700 rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Lighthouse Metrics</h2>
        <p className="text-gray-400">Lighthouse audit not available for this report.</p>
      </div>
    )
  }

  const { scores, metrics, diagnostics } = lighthouse

  const categories = [
    { name: 'Performance', score: scores.performance, icon: '⚡' },
    { name: 'Accessibility', score: scores.accessibility, icon: '♿' },
    { name: 'Best Practices', score: scores.bestPractices, icon: '✓' },
    { name: 'SEO', score: scores.seo, icon: '🔍' },
    // PWA is not available via PageSpeed Insights API
  ]

  return (
    <div className="bg-slate-800 border border-gray-700 rounded-lg shadow-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Lighthouse Metrics</h2>
        <span className="text-sm text-gray-400">Powered by Google Lighthouse</span>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map(({ name, score, icon }) => (
          <div key={name} className="text-center">
            <div className={`text-3xl font-bold mb-1 px-4 py-3 rounded-lg ${getScoreColor(score)}`}>
              {score}
            </div>
            <div className="text-sm text-gray-300 mt-2">
              <span className="mr-1">{icon}</span>
              {name}
            </div>
          </div>
        ))}
      </div>

      {/* Core Web Vitals */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Core Web Vitals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700/50 border border-gray-600 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">First Contentful Paint</div>
            <div className="text-2xl font-bold text-white">
              {formatMetric(metrics.firstContentfulPaint)}
            </div>
          </div>
          <div className="bg-slate-700/50 border border-gray-600 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Largest Contentful Paint</div>
            <div className="text-2xl font-bold text-white">
              {formatMetric(metrics.largestContentfulPaint)}
            </div>
          </div>
          <div className="bg-slate-700/50 border border-gray-600 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Cumulative Layout Shift</div>
            <div className="text-2xl font-bold text-white">
              {formatMetric(metrics.cumulativeLayoutShift, 'score')}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700/50 border border-gray-600 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Total Blocking Time</div>
            <div className="text-2xl font-bold text-white">
              {formatMetric(metrics.totalBlockingTime)}
            </div>
          </div>
          <div className="bg-slate-700/50 border border-gray-600 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Speed Index</div>
            <div className="text-2xl font-bold text-white">
              {formatMetric(metrics.speedIndex)}
            </div>
          </div>
          <div className="bg-slate-700/50 border border-gray-600 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Time to Interactive</div>
            <div className="text-2xl font-bold text-white">
              {formatMetric(metrics.timeToInteractive)}
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics */}
      {(diagnostics.mainThreadWork || diagnostics.bootupTime || diagnostics.domSize) && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Diagnostics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {diagnostics.mainThreadWork && (
              <div className="bg-slate-700/50 border border-gray-600 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Main Thread Work</div>
                <div className="text-2xl font-bold text-white">
                  {formatMetric(diagnostics.mainThreadWork)}
                </div>
              </div>
            )}
            {diagnostics.bootupTime && (
              <div className="bg-slate-700/50 border border-gray-600 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">JavaScript Bootup</div>
                <div className="text-2xl font-bold text-white">
                  {formatMetric(diagnostics.bootupTime)}
                </div>
              </div>
            )}
            {diagnostics.domSize && (
              <div className="bg-slate-700/50 border border-gray-600 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">DOM Elements</div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(diagnostics.domSize)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
