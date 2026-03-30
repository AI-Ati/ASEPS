const STATE_ORDER = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT']

const STATE_FLAGS = {
  VIC: '🏛', NSW: '🦁', QLD: '🌅', WA: '⚓',
  SA: '🌾', TAS: '🌿', NT: '🦘', ACT: '🏛'
}

function GrowthPill({ value, benchmark }) {
  const diff = value - benchmark
  const color = diff >= 0.3 ? 'text-green-700 bg-green-50' 
              : diff <= -0.3 ? 'text-red-700 bg-red-50'
              : 'text-amber-700 bg-amber-50'
  return (
    <span className={`text-xs font-mono px-1.5 py-0.5 rounded font-medium ${color}`}>
      {value > 0 ? '+' : ''}{value.toFixed(1)}%
    </span>
  )
}

export default function StateSelector({ selected, onChange, metrics }) {
  const national = metrics.national
  
  return (
    <div>
      {/* National button */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => onChange('AUS')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded text-sm font-sans font-medium
            border-2 transition-all duration-200
            ${selected === 'AUS' 
              ? 'bg-white text-federal-700 border-ochre-400 shadow-academic-md' 
              : 'bg-federal-700 text-federal-100 border-federal-500 hover:border-ochre-400'}
          `}
        >
          🇦🇺 Australia (National)
          {selected !== 'AUS' && (
            <span className="font-mono text-xs text-federal-300">
              {national.gdp_growth_pct.toFixed(1)}%
            </span>
          )}
        </button>

        <span className="text-federal-400 text-xs font-sans">|</span>

        {/* State buttons */}
        {STATE_ORDER.map(stateId => {
          const s = metrics.states[stateId]
          const isSelected = selected === stateId
          const isVic = stateId === 'VIC'
          
          return (
            <button
              key={stateId}
              onClick={() => onChange(stateId)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded text-sm font-sans
                border-2 transition-all duration-200
                ${isSelected
                  ? 'bg-white text-federal-700 border-ochre-400 shadow-academic-md font-semibold'
                  : isVic
                    ? 'bg-federal-500 text-white border-federal-400 hover:border-ochre-400 font-medium'
                    : 'bg-federal-700 text-federal-100 border-federal-500 hover:border-federal-300'
                }
              `}
              title={s.name}
            >
              <span>{STATE_FLAGS[stateId]}</span>
              <span>{stateId}</span>
              {isVic && !isSelected && (
                <span className="text-xs bg-ochre-500 text-white px-1 rounded">★</span>
              )}
              {isSelected && (
                <span className="font-mono text-xs text-federal-500">
                  {s.gsp_growth_pct.toFixed(1)}%
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected state quick stats */}
      {selected !== 'AUS' && (
        <div className="mt-3 flex flex-wrap gap-4 items-center">
          {(() => {
            const s = metrics.states[selected]
            const nat = metrics.national
            return (
              <>
                <span className="text-federal-200 text-xs font-sans">
                  {s.name} — Quick stats:
                </span>
                <span className="text-white text-xs font-sans">
                  GSP Growth <GrowthPill value={s.gsp_growth_pct} benchmark={nat.gdp_growth_pct} />
                </span>
                <span className="text-white text-xs font-sans">
                  Unemployment <span className="font-mono text-federal-200">{s.unemployment_rate_pct.toFixed(1)}%</span>
                </span>
                <span className="text-white text-xs font-sans">
                  Net Debt/GSP <span className="font-mono text-federal-200">{s.net_debt_gsp_pct.toFixed(1)}%</span>
                </span>
                <span className="text-white text-xs font-sans">
                  Per capita <span className="font-mono text-federal-200">${(s.gsp_per_capita_aud / 1000).toFixed(0)}k</span>
                </span>
                {selected === 'VIC' && (
                  <span className="bg-ochre-500 text-white text-xs px-2 py-0.5 rounded font-sans font-medium">
                    Primary focus — 10 issues · 8 pathways each
                  </span>
                )}
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}
