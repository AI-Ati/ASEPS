import { useState, useEffect } from 'react'
import FormulaBlock from './FormulaBlock'

const YEAR_COLORS = [
  'bg-federal-100 border-federal-300 text-federal-700',
  'bg-federal-100 border-federal-300 text-federal-700',
  'bg-ochre-50  border-ochre-300  text-ochre-800',
  'bg-ochre-50  border-ochre-300  text-ochre-800',
  'bg-green-50  border-green-300  text-green-800',
]

function StepCard({ step, index }) {
  const yearIdx = Math.min((step.year || 1) - 1, YEAR_COLORS.length - 1)
  return (
    <div className="flex gap-4">
      {/* Year marker */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-mono font-semibold ${YEAR_COLORS[yearIdx]}`}>
          Y{step.year}
        </div>
        {index >= 0 && <div className="flex-1 w-px bg-parchment-300 mt-2" />}
      </div>

      {/* Step content */}
      <div className={`flex-1 pb-6 pt-1`}>
        <p className="text-sm font-body text-federal-800 leading-relaxed">{step.step}</p>
      </div>
    </div>
  )
}

function PathwayCard({ pathway, isVictoria, isExpanded, onToggle, onNavigate }) {
  return (
    <div className={`card-academic transition-all duration-200 ${isExpanded ? 'ring-2 ring-federal-300' : 'hover:shadow-academic-md'}`}>

      {/* Pathway header */}
      <div className="flex items-start justify-between gap-4 cursor-pointer" onClick={onToggle}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="section-label text-federal-300">{pathway.id}</span>
            {pathway.model_link && (
              <span className="bg-blue-100 text-blue-700 border border-blue-200 text-xs px-2 py-0.5 rounded font-sans">
                {pathway.model_link.split(':')[0]}
              </span>
            )}
          </div>
          <h3 className="font-display text-xl text-federal-900">{pathway.title}</h3>
          {pathway.agency_primary && (
            <p className="text-xs text-federal-500 font-sans mt-1">
              Lead agency: <strong className="text-federal-700">{pathway.agency_primary}</strong>
              {pathway.agency_support?.length > 0 && ` · ${pathway.agency_support.join(', ')}`}
            </p>
          )}
        </div>
        <div className="text-federal-300 text-lg flex-shrink-0" aria-hidden="true">
          {isExpanded ? '▲' : '▼'}
        </div>
      </div>

      {/* Budget envelope */}
      {pathway.budget_envelope && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-sans text-federal-500">Budget envelope:</span>
          <span className="bg-ochre-50 border border-ochre-200 text-ochre-800 text-xs px-2 py-0.5 rounded font-mono font-medium">
            {pathway.budget_envelope}
          </span>
          {pathway.timeline_years && (
            <span className="text-xs text-federal-400 font-sans">{pathway.timeline_years}-year implementation</span>
          )}
        </div>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-6 space-y-6 animate-fade-in">

          {/* Formula */}
          {pathway.formula_latex && (
            <FormulaBlock
              latex={pathway.formula_latex}
              explanation={pathway.formula_explanation}
              evidence={pathway.evidence_success}
              sourceUrl="https://doi.org/10.2307/2118477"
              sourceLabel="Mankiw-Romer-Weil (1992) ↗"
            />
          )}

          {/* Step-by-step workflow */}
          {pathway.steps?.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <p className="section-label">Implementation Workflow</p>
                <div className="flex gap-3 text-xs font-sans">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-federal-200 inline-block" />Y1-Y2</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-ochre-200 inline-block" />Y3-Y4</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-200 inline-block" />Y5</span>
                </div>
              </div>
              <div>
                {pathway.steps.map((step, i) => (
                  <StepCard key={i} step={step} index={i < pathway.steps.length - 1 ? i : -1} />
                ))}
              </div>
            </div>
          )}

          {/* Summary pathway (non-Victoria) */}
          {!isVictoria && pathway.pathways_summary && (
            <div className="bg-federal-50 rounded p-4">
              <p className="section-label mb-2">Key Interventions</p>
              <p className="text-sm text-federal-700 font-body">{pathway.pathways_summary}</p>
            </div>
          )}

          {/* KPIs */}
          {pathway.kpis?.length > 0 && (
            <div className="bg-parchment-50 border border-parchment-300 rounded p-4">
              <p className="section-label mb-3">Key Performance Indicators</p>
              <ul className="space-y-2">
                {pathway.kpis.map((kpi, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-federal-400 mt-0.5 text-xs" aria-hidden="true">◆</span>
                    <span className="text-sm font-body text-federal-700">{kpi}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Evidence of success */}
          {pathway.evidence_success && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="section-label text-green-700 mb-1">Evidence of Success (International Precedent)</p>
              <p className="text-sm text-green-800 font-body leading-relaxed">{pathway.evidence_success}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function PathwayViewer({ stateId, pathwayData, solowData, stateData, selectedIssueId, onIssueSelect }) {
  const [expandedPathwayId, setExpandedPathwayId] = useState(null)
  const [selectedIssueIdx, setSelectedIssueIdx] = useState(0)

  const isVictoria = stateId === 'VIC'
  const issues = pathwayData?.issues || []

  // Jump to selected issue when arriving from diagnosis tab
  useEffect(() => {
    if (selectedIssueId) {
      const idx = issues.findIndex(i => i.id === selectedIssueId)
      if (idx >= 0) setSelectedIssueIdx(idx)
    }
  }, [selectedIssueId])

  if (!pathwayData || issues.length === 0) {
    return (
      <div className="card-academic text-center py-12">
        <p className="text-federal-500 font-sans">No pathway data available for this selection.</p>
      </div>
    )
  }

  const activeIssue = issues[selectedIssueIdx]

  return (
    <div className="animate-fade-in">
      <div className="flex items-baseline gap-4 mb-6 flex-wrap">
        <h2 className="font-display text-display-md text-federal-800">
          Policy Pathways — {stateData?.name}
        </h2>
        {isVictoria && (
          <span className="bg-federal-100 text-federal-700 text-xs px-2 py-1 rounded font-sans border border-federal-200">
            10 issues · Detailed workflows
          </span>
        )}
      </div>

      {/* Methodology */}
      <div className="bg-federal-50 border border-federal-200 rounded p-3 mb-6">
        <p className="text-xs font-sans text-federal-600 leading-relaxed">
          <strong>Pathway methodology:</strong> Each pathway follows a Year 1-5 implementation sequence, 
          grounded in peer-reviewed growth economics (Solow 1956, Mankiw-Romer-Weil 1992, Romer 1990, Lucas 1988) 
          with parameters calibrated from ABS data. All agency assignments and budget envelopes reference official 
          Victorian Budget Papers and government strategy documents. Pathways are educational frameworks — 
          not policy prescriptions.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Issue sidebar */}
        <div className="w-64 flex-shrink-0 space-y-1.5">
          <p className="section-label mb-3">Select Issue</p>
          {issues.map((issue, idx) => (
            <button
              key={issue.id}
              onClick={() => { setSelectedIssueIdx(idx); setExpandedPathwayId(null) }}
              className={`
                w-full text-left px-3 py-2.5 rounded border transition-all duration-150
                ${selectedIssueIdx === idx
                  ? 'bg-federal-600 text-white border-federal-700 shadow-academic'
                  : 'bg-white border-parchment-300 text-federal-700 hover:border-federal-300 hover:bg-federal-50'
                }
              `}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono opacity-60">{issue.id}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-sans font-medium ${
                  selectedIssueIdx === idx
                    ? 'bg-white/20 text-white'
                    : issue.severity === 'critical' ? 'bg-red-100 text-red-700'
                    : issue.severity === 'high' ? 'bg-orange-100 text-orange-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {issue.severity}
                </span>
              </div>
              <p className={`text-sm font-sans mt-0.5 leading-tight ${selectedIssueIdx === idx ? 'font-semibold' : ''}`}>
                {issue.title}
              </p>
            </button>
          ))}
        </div>

        {/* Main pathway content */}
        <div className="flex-1 min-w-0">
          {activeIssue && (
            <>
              {/* Issue header */}
              <div className="card-academic mb-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <span className="section-label">{activeIssue.id}</span>
                    <h3 className="font-display text-2xl text-federal-900 mt-1">{activeIssue.title}</h3>
                    <p className="text-federal-600 mt-2 font-body text-sm leading-relaxed">{activeIssue.headline}</p>
                  </div>
                  {activeIssue.severity_score && (
                    <div className="flex-shrink-0 text-center">
                      <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xl font-mono font-bold ${
                        activeIssue.severity === 'critical' ? 'border-red-400 bg-red-50 text-red-700'
                        : activeIssue.severity === 'high' ? 'border-orange-400 bg-orange-50 text-orange-700'
                        : 'border-amber-400 bg-amber-50 text-amber-700'
                      }`}>
                        {activeIssue.severity_score}
                      </div>
                      <p className="text-xs text-federal-400 font-sans mt-1">severity</p>
                    </div>
                  )}
                </div>

                {/* Data evidence quick view */}
                {activeIssue.data_evidence && (
                  <div className="mt-4 pt-4 border-t border-parchment-300 flex items-center gap-4 flex-wrap">
                    <span className="section-label">Data source:</span>
                    <a href={activeIssue.data_evidence.source_url} target="_blank" rel="noopener noreferrer"
                       className="citation-link">
                      {activeIssue.data_evidence.source} ↗
                    </a>
                  </div>
                )}
              </div>

              {/* Summary pathway for non-Victoria */}
              {!isVictoria && activeIssue.pathways_summary && (
                <div className="card-academic mb-4">
                  <p className="section-label mb-2">Pathway Summary</p>
                  <p className="text-sm font-body text-federal-700 leading-relaxed">{activeIssue.pathways_summary}</p>
                  {activeIssue.source_url && (
                    <a href={activeIssue.source_url} target="_blank" rel="noopener noreferrer" className="citation-link mt-2 inline-block">
                      {activeIssue.source} ↗
                    </a>
                  )}
                </div>
              )}

              {/* Victoria full pathways */}
              {isVictoria && activeIssue.pathways?.map(pathway => (
                <div key={pathway.id} className="mb-4">
                  <PathwayCard
                    pathway={pathway}
                    isVictoria={isVictoria}
                    isExpanded={expandedPathwayId === pathway.id}
                    onToggle={() => setExpandedPathwayId(
                      expandedPathwayId === pathway.id ? null : pathway.id
                    )}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
