const SEVERITY_BG = {
  critical: 'bg-red-500 text-white',
  high:     'bg-orange-400 text-white',
  medium:   'bg-amber-300 text-federal-900',
  low:      'bg-green-300 text-federal-900',
}

const SEVERITY_BORDER = {
  critical: 'border-red-600',
  high:     'border-orange-500',
  medium:   'border-amber-400',
  low:      'border-green-400',
}

export default function IssueHeatmap({ issues, selectedId, onSelect }) {
  if (!issues?.length) return null

  return (
    <div className="card-academic mb-6">
      <p className="section-label mb-3">Issue Severity Heatmap</p>
      <div className="grid grid-cols-5 gap-2">
        {issues.map(issue => (
          <button
            key={issue.id}
            onClick={() => onSelect(issue.id)}
            className={`
              rounded border-2 p-2.5 text-left transition-all duration-150
              ${SEVERITY_BG[issue.severity] || 'bg-parchment-200 text-federal-800'}
              ${SEVERITY_BORDER[issue.severity] || 'border-parchment-400'}
              ${selectedId === issue.id ? 'ring-2 ring-offset-2 ring-federal-500 scale-105' : 'hover:scale-102 hover:shadow-academic-md'}
            `}
            aria-label={`${issue.title} — Severity: ${issue.severity} (${issue.severity_score}/10)`}
          >
            <p className="text-xs font-mono opacity-75 mb-0.5">{issue.id}</p>
            <p className="text-xs font-sans font-semibold leading-tight line-clamp-2">{issue.title}</p>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs font-mono font-bold opacity-90">{issue.severity_score}/10</span>
              {issue.pathways?.length > 0 && (
                <span className="text-xs opacity-75">{issue.pathways.length}P</span>
              )}
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-federal-400 font-sans mt-2">
        Click an issue to expand details. 'P' = number of policy pathways. Colour = severity level.
      </p>
    </div>
  )
}
