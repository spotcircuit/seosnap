type ScoreBadgeProps = {
  score: number
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  const getColor = () => {
    if (score >= 76) return 'bg-green-500'
    if (score >= 51) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getTextColor = () => {
    if (score >= 76) return 'text-green-700'
    if (score >= 51) return 'text-yellow-700'
    return 'text-red-700'
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-32 h-32 rounded-full ${getColor()} flex items-center justify-center text-white text-4xl font-bold shadow-lg`}
      >
        {score}
      </div>
      <p className={`mt-2 text-sm font-medium ${getTextColor()}`}>
        {score >= 76 && 'Excellent'}
        {score >= 51 && score < 76 && 'Good'}
        {score < 51 && 'Needs Improvement'}
      </p>
    </div>
  )
}
