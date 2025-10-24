import { ChecksResultWithNotes } from '@/types'

type ChecksGridProps = {
  checks: ChecksResultWithNotes
}

const CHECK_LABELS: Record<string, string> = {
  title_length_ok: 'Title Length',
  meta_description_ok: 'Meta Description',
  canonical_present: 'Canonical URL',
  robots_allows_index: 'Indexable',
  single_h1: 'Single H1',
  image_alt_coverage: 'Image Alt Text',
  og_present: 'Open Graph',
  twitter_present: 'Twitter Cards',
  schema_present: 'Schema Markup',
}

export default function ChecksGrid({ checks }: ChecksGridProps) {
  return (
    <div className="bg-slate-800 border border-gray-700 rounded-lg shadow-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Technical Checks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(CHECK_LABELS).map(([key, label]) => {
          const passed = checks[key as keyof ChecksResultWithNotes] as boolean
          const note = checks.notes?.[key]

          return (
            <div
              key={key}
              className={`p-4 rounded border-2 ${
                passed
                  ? 'border-green-600 bg-green-900/30'
                  : 'border-red-600 bg-red-900/30'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-2xl">{passed ? '✅' : '⚠️'}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-white">{label}</h3>
                  {note && (
                    <p className="text-xs text-gray-300 mt-1">{note}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
