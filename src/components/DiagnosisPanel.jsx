import { useState } from 'react'
import FormulaBlock from './FormulaBlock'
import IssueHeatmap from './IssueHeatmap'

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', classes: 'severity-critical', bar: 'bg-red-600', score: [8, 10] },
  high:     { label: 'High',     classes: 'severity-high',     bar: 'bg-orange-500', score: [6, 8] },
  medium:   { label: 'Medium',   classes: 'severity-medium',   bar: 'bg-amber-500', score: [4, 6] },
  low:      { label: 'Low',      classes: 'severity-low',      bar: 'bg-green-500', score: [1, 4] },
}

function SeverityBadge({ severity }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-sans font-semibold border ${cfg.classes}`}>
      {cfg.label}
    </span>
  )
}

function SeverityBar({ score }) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-parchment-300 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${score >= 8 ? 'bg-red-500' : score >= 6 ? 'bg-orange-500' : 'bg-amber-500'}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className="text-xs font-mono text-federal-500">{score}/10</span>
    </div>
  )
}

function IssueCard({ issue, isVictoria, onClick, isExpanded }) {
  return (
    <div
      className={`card-academic cursor-pointer transition-all duration-200 hover:shadow-academic-md
        ${isExpanded ? 'ring-2 ring-federal-400' : ''}
        border-l-4 ${
          issue.severity === 'critical' ? 'border-l-red-500' :
          issue.severity === 'high' ? 'border-l-orange-500' :
          'border-l-amber-400'
        }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-expanded={isExpanded}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="section-label text-federal-300">{issue.id}</span>
            <SeverityBadge severity={issue.severity} />
          </div>
          <h3 className="font-display text-lg text-federal-900 leading-tight">{issue.title}</h3>
          <p className="text-sm text-federal-600 mt-1.5 font-body leading-relaxed">{issue.headline}</p>
          {issue.severity_score && <SeverityBar score={issue.severity_score} />}
        </div>
        <div className="flex-shrink-0 text-federal-300 text-lg" aria-hidden="true">
          {isExpanded ? '▲' : '▼'}
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-parchment-300 space-y-4 animate-fade-in">

          {/* Data evidence */}
          {issue.data_evidence && (
            <div className="bg-parchment-50 rounded p-4">
              <p className="section-label mb-2">Evidence (Official Data)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(issue.data_evidence)
                  .filter(([k]) => !['source', 'source_url', 'abs_table'].includes(k))
                  .map(([k, v]) => (
                    <div key={k} className="bg-white border border-parchment-300 rounded p-2">
                      <p className="text-xs text-federal-400 font-sans capitalize">{k.replace(/_/g, ' ')}</p>
                      <p className="text-sm font-mono font-medium text-federal-800 mt-0.5">{v}</p>
                    </div>
                  ))}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-federal-400 font-sans">Source:</span>
                <a href={issue.data_evidence.source_url} target="_blank" rel="noopener noreferrer"
                   className="citation-link">
                  {issue.data_evidence.source} ↗
                </a>
                {issue.data_evidence.abs_table && (
                  <span className="text-xs text-federal-400 font-sans">· {issue.data_evidence.abs_table}</span>
                )}
              </div>
            </div>
          )}

          {/* Root cause */}
          {issue.root_cause && (
            <div>
              <p className="section-label mb-1">Root Cause Analysis</p>
              <p className="text-sm font-body text-federal-700 leading-relaxed">{issue.root_cause}</p>
            </div>
          )}

          {/* Formula */}
          {issue.formula_latex && (
            <FormulaBlock
              latex={issue.formula_latex}
              explanation={issue.formula_explanation}
              evidence={issue.oecd_evidence}
              sourceUrl="https://doi.org/10.1787/174521061831"
              sourceLabel="OECD WP No. 584 ↗"
            />
          )}

          {/* Evidence boxes */}
          {(issue.oecd_evidence || issue.australian_evidence) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {issue.oecd_evidence && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-xs font-sans font-semibold text-blue-800 mb-1">OECD Evidence</p>
                  <p className="text-xs text-blue-700 leading-relaxed">{issue.oecd_evidence}</p>
                </div>
              )}
              {issue.australian_evidence && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-xs font-sans font-semibold text-green-800 mb-1">Australian Evidence</p>
                  <p className="text-xs text-green-700 leading-relaxed">{issue.australian_evidence}</p>
                  {issue.source_urls?.budget && (
                    <a href={issue.source_urls.budget} target="_blank" rel="noopener noreferrer"
                       className="text-xs text-green-600 border-b border-dotted border-green-400 hover:text-green-800 mt-1 inline-block">
                      View source ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Pathway count */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-federal-400 font-sans">
              {issue.pathways?.length || issue.pathways_summary ? (
                isVictoria
                  ? `${issue.pathways?.length} detailed pathway(s) with full step-by-step workflows`
                  : 'Summary pathway available'
              ) : ''}
            </span>
            {isVictoria && issue.pathways?.length > 0 && (
              <button
                className="text-sm font-sans font-semibold text-federal-600 hover:text-federal-800
                           border-b border-federal-400 hover:border-federal-800 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onIssueSelect(issue.id)
                }}
              >
                View {issue.pathways.length} Pathway{issue.pathways.length > 1 ? 's' : ''} →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DiagnosisPanel({ stateId, pathwayData, stateData, onIssueSelect }) {
  const [expandedId, setExpandedId] = useState(null)

  if (!pathwayData) {
    return (
      <div className="card-academic text-center py-12">
        <p className="text-federal-500 font-sans">No diagnosis data available for this selection.</p>
      </div>
    )
  }

  const isVictoria = stateId === 'VIC'
  const issues = isVictoria ? pathwayData.issues : pathwayData.issues

  // Severity summary
  const severityCounts = {
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-baseline gap-4 mb-6 flex-wrap">
        <h2 className="font-display text-display-md text-federal-800">
          Issue Diagnosis — {stateData?.name}
        </h2>
        {isVictoria && (
          <span className="bg-federal-100 text-federal-700 text-xs px-2 py-1 rounded font-sans font-medium border border-federal-200">
            Primary Focus — Full depth
          </span>
        )}
      </div>

      {/* Severity summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {Object.entries(severityCounts).filter(([, v]) => v > 0).map(([sev, count]) => {
          const cfg = SEVERITY_CONFIG[sev]
          return (
            <div key={sev} className={`rounded p-3 border ${cfg.classes}`}>
              <p className="text-2xl font-mono font-bold">{count}</p>
              <p className="text-xs font-sans font-semibold mt-0.5">{cfg.label} Priority</p>
            </div>
          )
        })}
      </div>

      {/* Methodology note */}
      <div className="bg-federal-50 border border-federal-200 rounded p-3 mb-6">
        <p className="text-xs font-sans text-federal-600 leading-relaxed">
          <strong>Methodology:</strong> Issues identified from official ABS/RBA data divergences, 
          cross-verified against Productivity Commission findings and state treasury reports. 
          Severity scored 1-10 based on: (1) magnitude of gap vs national/OECD benchmark, 
          (2) structural vs cyclical nature, (3) second-order economic effects.
          {isVictoria && ' Each issue links to detailed policy pathways on the Pathways tab.'}
        </p>
      </div>

      {/* Heatmap */}
      {isVictoria && (
        <IssueHeatmap
          issues={issues}
          selectedId={expandedId}
          onSelect={(id) => setExpandedId(id === expandedId ? null : id)}
        />
      )}

      {/* Issues list */}
      <div className="space-y-3">
        {issues.map(issue => (
          <IssueCard
            key={issue.id}
            issue={issue}
            isVictoria={isVictoria}
            isExpanded={expandedId === issue.id}
            onClick={() => {
              if (expandedId === issue.id) {
                setExpandedId(null)
              } else {
                setExpandedId(issue.id)
              }
            }}
          />
        ))}
      </div>

      {/* Summary source note */}
      <div className="mt-8 pt-4 border-t border-parchment-300">
        <p className="text-xs text-federal-400 font-sans leading-relaxed">
          All diagnoses sourced from: ABS 5220.0 (State Accounts), ABS 6202.0 (Labour Force), 
          ABS 5204.0 (National Accounts), Victorian Budget 2025-26 Budget Papers, 
          Victorian DTF Economic Snapshot March 2025, 
          Productivity Commission Productivity Insights 2024.
          {' '}
          <a href="https://www.abs.gov.au/statistics/economy/national-accounts/australian-national-accounts-state-accounts/latest-release"
             target="_blank" rel="noopener noreferrer" className="citation-link">
            Primary source ↗
          </a>
        </p>
      </div>
    </div>
  )
}
