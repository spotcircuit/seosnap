'use client'

import { useState } from 'react'
import { ReportWithSite } from '@/types'
import { ChecksResultWithNotes, Advice } from '@/types'
import AuditForm from '@/components/AuditForm'
import ScoreBadge from '@/components/ScoreBadge'
import ChecksGrid from '@/components/ChecksGrid'
import AdvicePanel from '@/components/AdvicePanel'
import RewriteSuggestions from '@/components/RewriteSuggestions'
import HistoryList from '@/components/HistoryList'
import CompareDrawer from '@/components/CompareDrawer'
import LighthouseScores from '@/components/LighthouseScores'

export default function Home() {
  const [currentReport, setCurrentReport] = useState<ReportWithSite | null>(
    null
  )
  const [currentUrl, setCurrentUrl] = useState<string>()
  const [compareOpen, setCompareOpen] = useState(false)
  const [historyRefresh, setHistoryRefresh] = useState(0)
  const [allReports, setAllReports] = useState<ReportWithSite[]>([])

  const handleAuditComplete = (report: ReportWithSite) => {
    setCurrentReport(report)
    setCurrentUrl(report.site.url)
    setHistoryRefresh((prev) => prev + 1)
  }

  const handleAuditStart = () => {
    // Optional: Clear current report while loading
  }

  const handleSelectReport = (report: ReportWithSite) => {
    setCurrentReport(report)
  }

  const handleExport = async () => {
    if (!currentReport) return

    try {
      const response = await fetch(`/api/export/${currentReport.id}`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `seo-report-${currentReport.id}.md`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export report')
    }
  }

  const handleOpenCompare = async () => {
    if (!currentUrl) return

    try {
      const response = await fetch(
        `/api/reports?url=${encodeURIComponent(currentUrl)}`
      )
      const data = await response.json()
      setAllReports(data.reports || [])
      setCompareOpen(true)
    } catch (error) {
      console.error('Failed to fetch reports for comparison:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <header className="bg-slate-900 shadow-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src="/SEOSnap.png"
              alt="SEO Snap Logo"
              className="h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 object-cover rounded-full flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SEO Snap
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-300 mt-1 line-clamp-2">
                Comprehensive SEO Audits with AI-Powered Recommendations
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <AuditForm
              onAuditComplete={handleAuditComplete}
              onAuditStart={handleAuditStart}
            />

            {currentReport && (
              <>
                <div className="bg-slate-800 border border-gray-700 rounded-lg shadow-xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl sm:text-2xl font-bold text-white">Audit Results</h2>
                      <p className="text-xs sm:text-sm text-gray-300 mt-1 break-all">
                        {currentReport.site.url}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(currentReport.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <ScoreBadge score={currentReport.score} />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleExport}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm sm:text-base"
                    >
                      Download Markdown
                    </button>
                    <button
                      onClick={handleOpenCompare}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm sm:text-base"
                    >
                      Compare Reports
                    </button>
                  </div>
                </div>

                <ChecksGrid
                  checks={currentReport.checks as ChecksResultWithNotes}
                />

                <LighthouseScores
                  lighthouse={currentReport.lighthouse as any}
                />

                <RewriteSuggestions
                  suggestions={
                    (currentReport.aiAdvice as Advice).rewrite_suggestions
                  }
                />

                <AdvicePanel advice={currentReport.aiAdvice as Advice} />
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <HistoryList
              currentUrl={currentUrl}
              onSelectReport={handleSelectReport}
              currentReportId={currentReport?.id}
              refreshTrigger={historyRefresh}
            />
          </div>
        </div>
      </main>

      <CompareDrawer
        reports={allReports}
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
      />
    </div>
  )
}
