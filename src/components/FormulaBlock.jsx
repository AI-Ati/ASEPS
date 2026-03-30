import { useEffect, useRef } from 'react'

// Lazy-load KaTeX from CDN (already loaded in index.html)
function renderKaTeX(latex, element, displayMode = false) {
  if (typeof window !== 'undefined' && window.katex) {
    try {
      window.katex.render(latex, element, {
        displayMode,
        throwOnError: false,
        strict: false,
        trust: false,
        macros: {
          '\\R': '\\mathbb{R}',
          '\\E': '\\mathbb{E}',
        }
      })
    } catch (e) {
      element.textContent = latex
    }
  }
}

export function InlineFormula({ latex }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) renderKaTeX(latex, ref.current, false)
  }, [latex])
  return <span ref={ref} className="katex-inline" aria-label={`Formula: ${latex}`} />
}

export default function FormulaBlock({ latex, explanation, evidence, sourceUrl, sourceLabel, compact = false }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) renderKaTeX(latex, ref.current, true)
  }, [latex])

  if (compact) {
    return (
      <div className="bg-federal-50 border-l-4 border-federal-300 px-4 py-3 my-3">
        <div ref={ref} className="text-center overflow-x-auto" aria-label={`Mathematical formula: ${latex}`} />
        {explanation && (
          <p className="mt-2 text-xs text-federal-600 font-sans leading-relaxed">{explanation}</p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-federal-50 to-parchment-100 border border-federal-200 rounded-academic p-5 my-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="section-label">Mathematical Model</span>
        <div className="flex-1 h-px bg-federal-200" />
        {sourceUrl && (
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer"
             className="citation-link text-xs">
            {sourceLabel || 'Source ↗'}
          </a>
        )}
      </div>

      {/* Formula display */}
      <div
        ref={ref}
        className="text-center overflow-x-auto py-2 px-4 bg-white border border-federal-100 rounded"
        aria-label={`Mathematical formula: ${latex}`}
      />

      {/* Plain text fallback for screen readers */}
      <span className="sr-only">Formula: {latex}</span>

      {/* Explanation */}
      {explanation && (
        <div className="mt-3 pt-3 border-t border-federal-200">
          <p className="text-sm text-federal-700 font-body leading-relaxed">
            <strong className="font-sans font-semibold text-federal-900">Applied to this context: </strong>
            {explanation}
          </p>
        </div>
      )}

      {/* Evidence */}
      {evidence && (
        <div className="mt-3 bg-ochre-50 border border-ochre-200 rounded px-3 py-2">
          <p className="text-xs text-ochre-800 font-sans leading-relaxed">
            <strong>Evidence: </strong>{evidence}
          </p>
        </div>
      )}
    </div>
  )
}
