'use client'

import { useState } from 'react'
import { ReportWithSite } from '@/types'
import { ChecksResultWithNotes } from '@/types'

type CompareDrawerProps = {
  reports: ReportWithSite[]
  isOpen: boolean
  onClose: () => void
}

export default function CompareDrawer({
  reports,
  isOpen,
  onClose,
}: CompareDrawerProps) {
  const [report1Id, setReport1Id] = useState('')
  const [report2Id, setReport2Id] = useState('')

  if (!isOpen) return null

  const report1 = reports.find((r) => r.id === report1Id)
  const report2 = reports.find((r) => r.id === report2Id)

  const scoreDelta = report1 && report2 ? report2.score - report1.score : 0

  const getChangedChecks = () => {
    if (!report1 || !report2) return []

    const checks1 = report1.checks as ChecksResultWithNotes
    const checks2 = report2.checks as ChecksResultWithNotes

    const changed: Array<{ key: string; before: boolean; after: boolean }> = []

    const keys = Object.keys(checks1).filter((k) => k !== 'notes')

    for (const key of keys) {
      const val1 = checks1[key as keyof ChecksResultWithNotes] as boolean
      const val2 = checks2[key as keyof ChecksResultWithNotes] as boolean

      if (val1 !== val2) {
        changed.push({ key, before: val1, after: val2 })
      }
    }

    return changed
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-gray-700 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 border-b border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Compare Reports</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {reports.length < 2 && (
            <p className="text-gray-400">
              Need at least 2 reports to compare. Run more audits!
            </p>
          )}

          {reports.length >= 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Report
                  </label>
                  <select
                    value={report1Id}
                    onChange={(e) => setReport1Id(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 bg-slate-700 text-white rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select report...</option>
                    {reports.map((report) => (
                      <option key={report.id} value={report.id}>
                        {new Date(report.createdAt).toLocaleString()} - Score:{' '}
                        {report.score}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Second Report
                  </label>
                  <select
                    value={report2Id}
                    onChange={(e) => setReport2Id(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 bg-slate-700 text-white rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select report...</option>
                    {reports.map((report) => (
                      <option key={report.id} value={report.id}>
                        {new Date(report.createdAt).toLocaleString()} - Score:{' '}
                        {report.score}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {report1 && report2 && (
                <div className="space-y-4">
                  <div className="bg-slate-700 border border-gray-600 p-4 rounded">
                    <h3 className="font-bold text-white mb-2">Score Change</h3>
                    <p className="text-2xl text-white">
                      {report1.score} → {report2.score}
                      <span
                        className={`ml-2 text-lg ${
                          scoreDelta > 0
                            ? 'text-green-400'
                            : scoreDelta < 0
                            ? 'text-red-400'
                            : 'text-gray-400'
                        }`}
                      >
                        ({scoreDelta > 0 ? '+' : ''}
                        {scoreDelta})
                      </span>
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-white mb-2">Changed Checks</h3>
                    {getChangedChecks().length === 0 ? (
                      <p className="text-gray-400">No checks changed</p>
                    ) : (
                      <div className="space-y-2">
                        {getChangedChecks().map(({ key, before, after }) => (
                          <div
                            key={key}
                            className={`p-3 rounded border-2 ${
                              after
                                ? 'border-green-600 bg-green-900/30'
                                : 'border-red-600 bg-red-900/30'
                            }`}
                          >
                            <p className="font-medium text-white">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-gray-300">
                              {before ? '✅' : '⚠️'} → {after ? '✅' : '⚠️'}
                              <span className="ml-2">
                                ({after ? 'Improved' : 'Worsened'})
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
