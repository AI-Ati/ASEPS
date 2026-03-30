import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, Cell, ReferenceLine
} from 'recharts'
import { steadyStateOutput, convergenceHalfLife } from '../lib/solow'

const COLOURS = ['#1a3557', '#c98a18', '#15803d', '#b91c1c', '#7c3aed', '#0891b2', '#be185d', '#92400e']
const STATE_NAMES = { VIC:'Victoria', NSW:'New South Wales', QLD:'Queensland', WA:'Western Australia', SA:'South Australia', TAS:'Tasmania', NT:'Northern Territory', ACT:'ACT' }

function RankTable({ rows, columns, title, source, sourceUrl }) {
  return (
    <div className="card-academic">
      <div className="flex items-center justify-between mb-3">
        <p className="section-label">{title}</p>
        {sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="citation-link">{source} ↗</a>}
      </div>
      <table className="data-table">
        <thead>
          <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className={row.id === 'VIC' ? 'bg-federal-50 font-semibold' : ''}>
              <td className="text-federal-400">{i + 1}</td>
              {columns.slice(1).map(c => (
                <td key={c.key} className={c.highlight && i === 0 ? 'text-green-700' : c.highlight && i === rows.length - 1 ? 'text-red-700' : ''}>
                  {c.format ? c.format(row[c.key]) : row[c.key]}
                  {row.id === 'VIC' && c.key === 'name' && <span className="ml-1 text-ochre-600">★</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ComparativeAnalytics({ selectedState, allStates, national, allSolow }) {
  const stateList = Object.entries(allStates).map(([id, s]) => ({ id, ...s, name: STATE_NAMES[id] || id }))

  // GSP growth ranking
  const gspRanked = [...stateList].sort((a, b) => b.gsp_growth_pct - a.gsp_growth_pct)

  // Solow steady-state comparison
  const solowComparison = Object.entries(allSolow).map(([id, params]) => {
    const yStar = steadyStateOutput(params)
    const halfLife = convergenceHalfLife(params)
    const state = allStates[id]
    return {
      id,
      name: STATE_NAMES[id] || id,
      y_star: Math.round(yStar * 100) / 100,
      half_life: Math.round(halfLife * 10) / 10,
      s: (params.s * 100).toFixed(1),
      g: (params.g * 100).toFixed(2),
      alpha: params.alpha,
      gsp_growth: state?.gsp_growth_pct
    }
  }).sort((a, b) => b.y_star - a.y_star)

  // Multi-metric radar data (normalised 0-10)
  const maxGSP = Math.max(...stateList.map(s => s.gsp_growth_pct))
  const maxPerCap = Math.max(...stateList.map(s => s.gsp_per_capita_aud))
  const maxRD = Math.max(...stateList.map(s => s.rd_intensity_pct_gsp))
  const maxBizInv = Math.max(...stateList.map(s => s.business_investment_growth_pct))

  const radarMetrics = ['GSP Growth', 'Per Capita', 'Low Unemploy.', 'Fiscal Health', 'R&D', 'Biz Investment']
  
  const radarData = radarMetrics.map(m => {
    const obj = { metric: m }
    stateList.forEach(s => {
      let val
      if (m === 'GSP Growth')     val = (s.gsp_growth_pct / maxGSP) * 10
      if (m === 'Per Capita')     val = (s.gsp_per_capita_aud / maxPerCap) * 10
      if (m === 'Low Unemploy.')  val = ((10 - s.unemployment_rate_pct) / 7) * 10
      if (m === 'Fiscal Health')  val = Math.max(0, (50 - s.net_debt_gsp_pct) / 5)
      if (m === 'R&D')            val = (s.rd_intensity_pct_gsp / maxRD) * 10
      if (m === 'Biz Investment') val = Math.max(0, (s.business_investment_growth_pct / maxBizInv) * 10)
      obj[s.id] = Math.round(val * 10) / 10
    })
    return obj
  })

  // Scatter: savings rate vs steady-state output
  const scatterData = Object.entries(allSolow).map(([id, p]) => ({
    id,
    name: STATE_NAMES[id],
    x: p.s * 100,
    y: steadyStateOutput(p),
    isSelected: id === selectedState
  }))

  // Per capita comparison
  const perCapitaRanked = [...stateList].sort((a, b) => b.gsp_per_capita_aud - a.gsp_per_capita_aud)

  return (
    <div className="animate-fade-in">
      <div className="flex items-baseline gap-4 mb-6">
        <h2 className="font-display text-display-md text-federal-800">Comparative Analytics</h2>
        <span className="section-label">All states & territories · 2023-24</span>
      </div>

      {/* Top charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Radar: 3 selected states + national */}
        <div className="card-academic">
          <div className="flex items-center justify-between mb-3">
            <p className="section-label">Multi-Dimensional Comparison (Normalised 0–10)</p>
            <a href="https://www.abs.gov.au/statistics/economy/national-accounts/australian-national-accounts-state-accounts/latest-release"
               target="_blank" rel="noopener noreferrer" className="citation-link">ABS 5220.0 ↗</a>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#dedad0" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fontFamily: 'Instrument Sans' }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 9 }} />
              {['VIC', 'NSW', 'QLD', 'WA'].map((id, i) => (
                <Radar key={id} name={STATE_NAMES[id]} dataKey={id}
                  stroke={COLOURS[i]} fill={COLOURS[i]} fillOpacity={0.12} strokeWidth={id === selectedState ? 2.5 : 1.5}
                />
              ))}
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
          <p className="text-xs text-federal-400 font-sans mt-1">Higher = better on all axes. Source: ABS, RBA</p>
        </div>

        {/* Solow steady-state scatter: savings rate vs y* */}
        <div className="card-academic">
          <div className="flex items-center justify-between mb-3">
            <p className="section-label">Solow Model: Savings Rate vs Steady-State Output (y*)</p>
            <a href="https://doi.org/10.2307/2118477" target="_blank" rel="noopener noreferrer" className="citation-link">MRW 1992 ↗</a>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eceae3" />
              <XAxis dataKey="x" unit="%" name="Savings Rate (s)" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                     label={{ value: 'Savings Rate s (%)', position: 'bottom', fontSize: 11 }} />
              <YAxis dataKey="y" name="Steady-State y*" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                     label={{ value: 'Steady-State y*', angle: -90, position: 'left', fontSize: 11 }} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (!payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-white border border-federal-200 rounded p-2 text-xs font-sans shadow-academic-md">
                      <p className="font-semibold text-federal-800">{d.name}</p>
                      <p>s = {d.x.toFixed(1)}% · y* = {d.y.toFixed(2)}</p>
                    </div>
                  )
                }}
              />
              <Scatter data={scatterData} fill={COLOURS[0]}>
                {scatterData.map((entry, i) => (
                  <Cell key={i}
                    fill={entry.id === selectedState ? COLOURS[1] : entry.id === 'VIC' ? COLOURS[0] : '#94a3b8'}
                    r={entry.id === selectedState || entry.id === 'VIC' ? 7 : 5}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs text-federal-400 font-sans mt-1">Each point = one state. Higher savings rate drives higher steady-state output. Calibrated from ABS 5204.0, 5209.0.</p>
        </div>
      </div>

      {/* Rankings row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RankTable
          title="GSP Growth Rate Ranking 2023-24"
          source="ABS 5220.0"
          sourceUrl="https://www.abs.gov.au/statistics/economy/national-accounts/australian-national-accounts-state-accounts/latest-release"
          rows={gspRanked}
          columns={[
            { key: 'rank', label: '#' },
            { key: 'name', label: 'State/Territory' },
            { key: 'gsp_growth_pct', label: 'GSP Growth', format: v => `${v.toFixed(1)}%`, highlight: true },
            { key: 'unemployment_rate_pct', label: 'Unemploy.', format: v => `${v.toFixed(1)}%` },
            { key: 'net_debt_gsp_pct', label: 'Net Debt/GSP', format: v => `${v.toFixed(1)}%` },
          ]}
        />

        <RankTable
          title="Solow Steady-State Output (y*) Ranking"
          source="ABS 5204.0 + computed"
          sourceUrl="https://www.abs.gov.au/statistics/economy/national-accounts/australian-system-national-accounts/latest-release"
          rows={solowComparison}
          columns={[
            { key: 'rank', label: '#' },
            { key: 'name', label: 'State' },
            { key: 'y_star', label: 'y* (Solow)', format: v => v.toFixed(2), highlight: true },
            { key: 's', label: 's (%)', format: v => `${v}%` },
            { key: 'half_life', label: 'Half-life (yr)', format: v => `${v}y` },
          ]}
        />
      </div>

      {/* Per capita bar chart */}
      <div className="card-academic mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">GSP Per Capita by State/Territory 2023-24</p>
          <a href="https://www.abs.gov.au/statistics/economy/national-accounts/australian-national-accounts-state-accounts/latest-release"
             target="_blank" rel="noopener noreferrer" className="citation-link">ABS 5220.0 ↗</a>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={perCapitaRanked} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eceae3" />
            <XAxis dataKey="id" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
            <YAxis tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                   tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12 }} />
            <ReferenceLine y={national.gdp_per_capita_aud} stroke={COLOURS[1]} strokeDasharray="4 4"
                           label={{ value: 'National avg', position: 'right', fontSize: 10 }} />
            <Bar dataKey="gsp_per_capita_aud" name="GSP per capita" radius={[2, 2, 0, 0]}>
              {perCapitaRanked.map((entry, i) => (
                <Cell key={i} fill={entry.id === 'VIC' ? COLOURS[0] : entry.id === selectedState ? COLOURS[1] : '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-federal-400 font-sans mt-1">
          Victoria (blue) · Selected state (gold) · Others (grey). Dashed line = national average ${national.gdp_per_capita_aud.toLocaleString()}.
        </p>
      </div>

      {/* Solow parameter comparison table */}
      <div className="card-academic">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">Solow Model Parameters — All States (Calibrated from ABS)</p>
          <a href="https://doi.org/10.2307/2118477" target="_blank" rel="noopener noreferrer" className="citation-link">MRW (1992) ↗</a>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>State</th>
                <th title="Capital income share (ABS 5204.0)">α (capital share)</th>
                <th title="Gross savings rate (ABS 5220.0)">s (savings)</th>
                <th title="Depreciation rate (ABS 5209.0)">δ (depreciation)</th>
                <th title="Labour force growth (ABS 6202.0)">n (labour growth)</th>
                <th title="TFP growth trend (ABS 5204.0)">g (TFP growth)</th>
                <th title="Human capital index (ABS 4213.0)">h (human capital)</th>
                <th title="Steady-state capital per worker">k*</th>
                <th title="Convergence half-life in years">Half-life</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(allSolow).map(([id, p]) => (
                <tr key={id} className={id === 'VIC' ? 'bg-federal-50 font-semibold' : ''}>
                  <td className="font-sans font-medium">
                    {STATE_NAMES[id]}
                    {id === 'VIC' && <span className="ml-1 text-ochre-600">★</span>}
                  </td>
                  <td>{p.alpha}</td>
                  <td>{(p.s * 100).toFixed(1)}%</td>
                  <td>{(p.delta * 100).toFixed(1)}%</td>
                  <td>{(p.n * 100).toFixed(1)}%</td>
                  <td>{(p.g * 100).toFixed(2)}%</td>
                  <td>{p.h}</td>
                  <td>{p.computed?.steady_state_k_star || steadyStateOutput(p).toFixed(2)}</td>
                  <td>{p.computed?.half_life_years || convergenceHalfLife(p).toFixed(1)}yr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-federal-400 font-sans mt-3 leading-relaxed">
          Parameters calibrated from: ABS 5204.0 (capital share, TFP), ABS 5209.0.55.001 (depreciation), 
          ABS 6202.0 (labour growth), ABS 5220.0 (savings), ABS 4213.0 (human capital proxy). 
          Methodology: Mankiw, Romer & Weil (1992); validated for Australia by OECD Working Paper No. 584 (2007).
        </p>
      </div>
    </div>
  )
}
