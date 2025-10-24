'use client'

import { useEffect, useState } from 'react'
import { ReportWithSite } from '@/types'

type HistoryListProps = {
  currentUrl?: string
  onSelectReport: (report: ReportWithSite) => void
  currentReportId?: string
  refreshTrigger?: number
}

export default function HistoryList({
  currentUrl,
  onSelectReport,
  currentReportId,
  refreshTrigger,
}: HistoryListProps) {
  const [reports, setReports] = useState<ReportWithSite[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!currentUrl) {
      setReports([])
      return
    }

    const fetchReports = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/reports?url=${encodeURIComponent(currentUrl)}`
        )
        const data = await response.json()
        setReports(data.reports || [])
      } catch (error) {
        console.error('Failed to fetch reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [currentUrl, refreshTrigger])

  if (!currentUrl) {
    return (
      <div className="bg-slate-800 border border-gray-700 rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">History</h2>
        <p className="text-gray-400 text-sm">
          Run an audit to see history for a URL
        </p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 border border-gray-700 rounded-lg shadow-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">History</h2>

      {loading && (
        <p className="text-gray-400 text-sm">Loading history...</p>
      )}

      {!loading && reports.length === 0 && (
        <p className="text-gray-400 text-sm">No previous reports</p>
      )}

      {!loading && reports.length > 0 && (
        <div className="space-y-2">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => onSelectReport(report)}
              className={`w-full text-left p-3 rounded border-2 hover:bg-slate-700 transition ${
                currentReportId === report.id
                  ? 'border-blue-500 bg-blue-900/30'
                  : 'border-gray-600'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    Score: {report.score}/100
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
                <div
                  className={`text-xl ${
                    report.score >= 76
                      ? 'text-green-400'
                      : report.score >= 51
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                >
                  {report.score >= 76 ? '✅' : report.score >= 51 ? '⚠️' : '❌'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
