'use client'

import { useState } from 'react'
import { ReportWithSite } from '@/types'
import LoadingModal from './LoadingModal'

type AuditFormProps = {
  onAuditComplete: (report: ReportWithSite) => void
  onAuditStart: () => void
}

type LoadingStage = 'fetching' | 'checking' | 'lighthouse' | 'ai' | 'saving'

export default function AuditForm({
  onAuditComplete,
  onAuditStart,
}: AuditFormProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('fetching')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    onAuditStart()

    try {
      setLoadingStage('fetching')

      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to audit URL')
      }

      onAuditComplete(data.report)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LoadingModal isOpen={loading} stage={loadingStage} />

      <div className="bg-slate-800 border border-gray-700 rounded-xl shadow-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="url"
              className="block text-lg font-semibold text-white mb-3"
            >
              🔍 Enter URL to Audit
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              disabled={loading}
              className="w-full px-5 py-4 text-lg border-2 border-gray-600 bg-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-600 disabled:text-gray-400 transition-all placeholder-gray-400"
            />
            <p className="text-sm text-gray-400 mt-2">
              Get instant SEO analysis with Lighthouse metrics and AI-powered recommendations
            </p>
          </div>

          {error && (
            <div className="bg-red-900 border-l-4 border-red-500 text-red-200 px-4 py-3 rounded shadow-sm">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? 'Analyzing...' : '🚀 Analyze Website'}
          </button>
        </form>
      </div>
    </>
  )
}
