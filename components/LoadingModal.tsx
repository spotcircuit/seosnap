'use client'

import { useEffect, useState } from 'react'

type Props = {
  isOpen: boolean
  stage?: string // Not used anymore, kept for compatibility
}

export default function LoadingModal({ isOpen }: Props) {
  const [dots, setDots] = useState('')

  // Animate dots for "Analyzing..." effect
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-bounce">
            🔍
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Analyzing Your Website{dots}
          </h2>
          <div className="text-sm text-gray-600 leading-relaxed space-y-2">
            <p>• Crawling with headless browser (Playwright)</p>
            <p>• Running Google Lighthouse performance tests</p>
            <p>• Validating SEO best practices</p>
            <p>• Generating AI recommendations (GPT-5 Nano)</p>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            This typically takes 60-120 seconds
          </p>
        </div>

        {/* Indeterminate Progress Bar */}
        <div className="relative mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-indeterminate"></div>
          </div>
        </div>

        {/* Spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%);
            width: 30%;
          }
          50% {
            width: 50%;
          }
          100% {
            transform: translateX(400%);
            width: 30%;
          }
        }
        .animate-indeterminate {
          animation: indeterminate 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
