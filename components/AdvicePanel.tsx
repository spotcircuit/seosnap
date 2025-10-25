import { Advice } from '@/types'

type AdvicePanelProps = {
  advice: Advice
}

export default function AdvicePanel({ advice }: AdvicePanelProps) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High':
        return 'bg-red-900/40 text-red-300 border-red-500'
      case 'Medium':
        return 'bg-yellow-900/40 text-yellow-300 border-yellow-500'
      case 'Low':
        return 'bg-blue-900/40 text-blue-300 border-blue-500'
      default:
        return 'bg-gray-700 text-gray-300 border-gray-500'
    }
  }

  const isPositiveIssue = (issue: { issue: string; fix: string }) => {
    const positiveKeywords = ['excellent', 'good', 'strong', 'perfect', 'well done', 'great']
    const issueText = issue.issue.toLowerCase()
    const fixText = issue.fix.toLowerCase()

    // Check if this is a positive item
    const hasPositiveKeyword = positiveKeywords.some(keyword => issueText.includes(keyword))
    const noFixNeeded = fixText.includes('n/a') || fixText.includes('no fix') || fixText.includes('maintain')

    return hasPositiveKeyword || noFixNeeded
  }

  const getIssueStyle = (issue: { issue: string; fix: string; impact: string }) => {
    if (isPositiveIssue(issue)) {
      return 'border-l-4 border-green-500 bg-green-900/20 p-4 rounded'
    }

    // Negative issues - style based on impact
    switch (issue.impact) {
      case 'High':
        return 'border-l-4 border-red-500 bg-red-900/20 p-4 rounded'
      case 'Medium':
        return 'border-l-4 border-yellow-500 bg-yellow-900/20 p-4 rounded'
      case 'Low':
        return 'border-l-4 border-blue-500 bg-blue-900/20 p-4 rounded'
      default:
        return 'border-l-4 border-red-500 bg-red-900/20 p-4 rounded'
    }
  }

  return (
    <div className="bg-slate-800 border border-gray-700 rounded-lg shadow-xl p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">AI-Powered Recommendations</h2>

      {advice.top_issues.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Top Issues</h3>
          <div className="space-y-4">
            {advice.top_issues.map((issue, idx) => (
              <div
                key={idx}
                className={getIssueStyle(issue)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-lg text-white">{issue.issue}</h4>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium border ${getImpactColor(
                      issue.impact
                    )}`}
                  >
                    {issue.impact}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  <strong>Why:</strong> {issue.why}
                </p>
                <p className="text-sm text-gray-300">
                  <strong>Fix:</strong> {issue.fix}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {advice.quick_wins.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Quick Wins</h3>
          <ul className="list-disc list-inside space-y-2">
            {advice.quick_wins.map((win, idx) => (
              <li key={idx} className="text-gray-300">
                {win}
              </li>
            ))}
          </ul>
        </div>
      )}

      {advice.prioritized_actions.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Prioritized Actions</h3>
          <ol className="list-decimal list-inside space-y-2">
            {advice.prioritized_actions.map((action, idx) => (
              <li key={idx} className="text-gray-300">
                {action}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
