'use client'

import { useState } from 'react'
import { Advice } from '@/types'

type RewriteSuggestionsProps = {
  suggestions: Advice['rewrite_suggestions']
}

export default function RewriteSuggestions({
  suggestions,
}: RewriteSuggestionsProps) {
  const [copiedTitle, setCopiedTitle] = useState(false)
  const [copiedDesc, setCopiedDesc] = useState(false)

  const copyToClipboard = async (text: string, type: 'title' | 'desc') => {
    await navigator.clipboard.writeText(text)
    if (type === 'title') {
      setCopiedTitle(true)
      setTimeout(() => setCopiedTitle(false), 2000)
    } else {
      setCopiedDesc(true)
      setTimeout(() => setCopiedDesc(false), 2000)
    }
  }

  if (!suggestions.title && !suggestions.meta_description) {
    return null
  }

  return (
    <div className="bg-slate-800 border border-gray-700 rounded-lg shadow-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Suggested Rewrites</h2>

      {suggestions.title && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">Title</h3>
            <button
              onClick={() => copyToClipboard(suggestions.title!, 'title')}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors"
            >
              {copiedTitle ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="bg-slate-700 p-3 rounded border border-gray-600">
            <code className="text-sm text-gray-200">{suggestions.title}</code>
          </div>
        </div>
      )}

      {suggestions.meta_description && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">Meta Description</h3>
            <button
              onClick={() =>
                copyToClipboard(suggestions.meta_description!, 'desc')
              }
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors"
            >
              {copiedDesc ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="bg-slate-700 p-3 rounded border border-gray-600">
            <code className="text-sm text-gray-200">{suggestions.meta_description}</code>
          </div>
        </div>
      )}
    </div>
  )
}
