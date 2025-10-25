'use client'

import { useEffect, useState } from 'react'

type Props = {
  isOpen: boolean
  stage: 'fetching' | 'checking' | 'lighthouse' | 'ai' | 'saving'
}

const stages = {
  fetching: {
    title: 'Crawling Website',
    description: 'Launching headless browser, rendering JavaScript, extracting HTML structure and metadata...',
    icon: '🌐',
  },
  checking: {
    title: 'Analyzing SEO',
    description: 'Validating title length, meta description, canonical URLs, heading structure, image alt text...',
    icon: '✅',
  },
  lighthouse: {
    title: 'Running Google Lighthouse',
    description: 'Measuring Core Web Vitals (LCP, FCP, CLS), performance metrics, accessibility, best practices...',
    icon: '⚡',
  },
  ai: {
    title: 'Generating AI Recommendations',
    description: 'GPT-5 Nano analyzing 100+ data points to create personalized action plan...',
    icon: '🤖',
  },
  saving: {
    title: 'Saving Report',
    description: 'Writing audit results to database...',
    icon: '💾',
  }
}

export default function LoadingModal({ isOpen, stage }: Props) {
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

  const currentStage = stages[stage]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-bounce">
            {currentStage.icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentStage.title}{dots}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {currentStage.description}
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
