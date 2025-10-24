'use client'

type Props = {
  isOpen: boolean
  stage: 'fetching' | 'checking' | 'lighthouse' | 'ai' | 'saving'
}

const stages = {
  fetching: {
    title: 'Fetching Page',
    description: 'Analyzing page structure and metadata...',
    icon: '🌐',
    progress: 20
  },
  checking: {
    title: 'Running SEO Checks',
    description: 'Validating 9 technical SEO requirements...',
    icon: '✅',
    progress: 40
  },
  lighthouse: {
    title: 'Google Lighthouse Analysis',
    description: 'Measuring performance, accessibility, and best practices...',
    icon: '⚡',
    progress: 60
  },
  ai: {
    title: 'AI Analysis',
    description: 'GPT-5 Nano generating personalized recommendations...',
    icon: '🤖',
    progress: 80
  },
  saving: {
    title: 'Saving Report',
    description: 'Finalizing your SEO audit report...',
    icon: '💾',
    progress: 95
  }
}

export default function LoadingModal({ isOpen, stage }: Props) {
  if (!isOpen) return null

  const currentStage = stages[stage]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fadeIn">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-bounce">
            {currentStage.icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentStage.title}
          </h2>
          <p className="text-gray-600">
            {currentStage.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative mb-6">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${currentStage.progress}%` }}
            />
          </div>
          <div className="text-right text-sm text-gray-500 mt-2">
            {currentStage.progress}% Complete
          </div>
        </div>

        {/* Stage Indicators */}
        <div className="flex justify-between text-xs text-gray-400 mb-4">
          <div className={stage === 'fetching' ? 'text-blue-600 font-semibold' : ''}>Fetch</div>
          <div className={stage === 'checking' ? 'text-blue-600 font-semibold' : ''}>Check</div>
          <div className={stage === 'lighthouse' ? 'text-blue-600 font-semibold' : ''}>Lighthouse</div>
          <div className={stage === 'ai' ? 'text-blue-600 font-semibold' : ''}>AI</div>
          <div className={stage === 'saving' ? 'text-blue-600 font-semibold' : ''}>Save</div>
        </div>

        {/* Spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  )
}
