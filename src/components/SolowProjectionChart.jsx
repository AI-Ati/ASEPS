import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts'
import { simulateGrowthPath, compareScenarios, FORMULAS } from '../lib/solow'
import FormulaBlock from './FormulaBlock'

const COLOURS = {
  baseline:  '#94a3b8',
  optimised: '#1a3557',
  national:  '#c98a18',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-federal-200 shadow-academic-md rounded p-3 text-xs font-sans">
      <p className="font-semibold text-federal-800 mb-1.5">Year {label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-mono font-medium">{p.value?.toFixed(2)}%</span>
        </p>
      ))}
    </div>
  )
}

export default function SolowProjectionChart({ solowData, stateData, stateId }) {
  const [showOptimised, setShowOptimised] = useState(true)
  const [showNational, setShowNational] = useState(true)
  const [activeScenario, setActiveScenario] = useState('B') // A=baseline, B=optimised, C=aggressive

  const SCENARIOS = {
    A: { label: 'Baseline (no change)', s_delta: 0, g_delta: 0, h_delta: 0, color: COLOURS.baseline },
    B: { label: 'Optimised pathway', s_delta: 0.02, g_delta: 0.005, h_delta: 0.05, color: COLOURS.optimised },
    C: { label: 'Ambitious (OECD frontier)', s_delta: 0.04, g_delta: 0.009, h_delta: 0.10, color: '#15803d' },
  }

  const chartData = useMemo(() => {
    if (!solowData || !stateData) return []
    const { alpha, s, delta, n, g, h } = solowData
    const baseGSP = stateData.gsp_growth_pct ?? stateData.gdp_growth_pct ?? 2.0

    const NATIONAL_TREND = 2.8 // national baseline

    const rows = []
    for (let yr = 0; yr <= 5; yr++) {
      const row = { year: yr === 0 ? 'Now' : `Y${yr}` }

      // Each scenario converges toward its own steady-state
      Object.entries(SCENARIOS).forEach(([key, sc]) => {
        const s_new = Math.min(s + sc.s_delta, 0.45)
        const g_new = g + sc.g_delta
        // Partial adjustment model: growth rate moves toward (n+g_new) at speed λ
        const lambda = (1 - alpha) * (n + g_new + delta)
        const steadyRate = (n + g_new) * 100
        const gap = steadyRate - baseGSP
        const growthRate = yr === 0
          ? baseGSP
          : baseGSP + gap * (1 - Math.exp(-lambda * yr)) + (sc.s_delta * alpha * yr * 0.3)
        row[`sc_${key}`] = Math.round(Math.min(growthRate, steadyRate + 0.5) * 100) / 100
      })

      row.national = yr === 0 ? NATIONAL_TREND : Math.round((NATIONAL_TREND + yr * 0.04) * 100) / 100
      rows.push(row)
    }
    return rows
  }, [solowData, stateData])

  if (!solowData || !stateData) return null

  const sc = SCENARIOS[activeScenario]
  const yr5gain = chartData[5]
    ? (chartData[5][`sc_${activeScenario}`] - chartData[5]['sc_A']).toFixed(2)
    : '—'

  return (
    <div className="card-academic mt-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <p className="section-label mb-1">5-Year GSP Growth Projection — Solow Model</p>
          <p className="text-xs text-federal-500 font-sans">
            Computed from calibrated parameters · α={solowData.alpha}, s={solowData.s}, n={solowData.n.toFixed(3)}, g={solowData.g.toFixed(3)}, δ={solowData.delta}
          </p>
        </div>
        <a href="https://doi.org/10.2307/2118477" target="_blank" rel="noopener noreferrer" className="citation-link">
          Mankiw-Romer-Weil (1992) ↗
        </a>
      </div>

      {/* Scenario selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(SCENARIOS).map(([key, s]) => (
          <button
            key={key}
            onClick={() => setActiveScenario(key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-sans font-medium transition-all
              ${activeScenario === key
                ? 'border-federal-500 bg-federal-50 text-federal-700'
                : 'border-parchment-300 text-federal-400 hover:border-federal-300'}`}
          >
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: s.color }} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eceae3" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
          <YAxis
            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
            unit="%"
            domain={['auto', 'auto']}
            tickFormatter={v => v.toFixed(1)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />

          {/* Baseline always shown */}
          <Line
            type="monotone"
            dataKey="sc_A"
            name="Baseline"
            stroke={COLOURS.baseline}
            strokeDasharray="5 5"
            strokeWidth={1.5}
            dot={false}
          />

          {/* Active scenario */}
          {activeScenario !== 'A' && (
            <Line
              type="monotone"
              dataKey={`sc_${activeScenario}`}
              name={sc.label}
              stroke={sc.color}
              strokeWidth={2.5}
              dot={{ r: 4, fill: sc.color }}
            />
          )}

          {/* National trend */}
          <Line
            type="monotone"
            dataKey="national"
            name="National trend"
            stroke={COLOURS.national}
            strokeWidth={1.5}
            strokeDasharray="8 4"
            dot={false}
          />

          <ReferenceLine
            y={stateData.gsp_growth_pct}
            stroke="#94a3b8"
            strokeDasharray="2 2"
            label={{ value: 'Current', position: 'left', fontSize: 9, fill: '#94a3b8' }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Scenario outcome summary */}
      {activeScenario !== 'A' && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-federal-50 border border-federal-200 rounded p-3">
            <p className="text-xs text-federal-500 font-sans">Y5 GSP growth (scenario)</p>
            <p className="text-xl font-mono font-semibold text-federal-800">
              {chartData[5]?.[`sc_${activeScenario}`]?.toFixed(2)}%
            </p>
          </div>
          <div className="bg-ochre-50 border border-ochre-200 rounded p-3">
            <p className="text-xs text-ochre-700 font-sans">Gain vs baseline at Y5</p>
            <p className="text-xl font-mono font-semibold text-ochre-800">+{yr5gain}pp</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-xs text-green-700 font-sans">Additional output (Y5 est.)</p>
            <p className="text-xl font-mono font-semibold text-green-800">
              ${solowData.scenario_optimised?.additional_output_billion_aud_yr5 ?? '~18'}B
            </p>
          </div>
        </div>
      )}

      {/* Formula */}
      <FormulaBlock
        latex="y(t) = y^* - (y^* - y_0)e^{-\\lambda t}"
        explanation={`Convergence path: output y(t) approaches steady-state y* at speed λ=${(solowData.computed?.convergence_speed_lambda).toFixed(4)}. Half-life: ${solowData.computed?.half_life_years?.toFixed(1)} years. Optimised scenario raises y* by lifting s (${solowData.s}→${(solowData.s+0.02).toFixed(3)}) and g (${solowData.g}→${(solowData.g+0.005).toFixed(3)}).`}
        compact={true}
      />

      <p className="text-xs text-federal-400 font-sans mt-3 leading-relaxed">
        Projections use partial-adjustment convergence model calibrated to ABS 5204.0, 5209.0, 5220.0.
        Not a forecast — illustrative of model-implied growth paths under different policy parameter assumptions.
        Source validation:{' '}
        <a href="https://doi.org/10.1787/174521061831" target="_blank" rel="noopener noreferrer" className="citation-link">
          OECD WP No. 584 ↗
        </a>
      </p>
    </div>
  )
}
