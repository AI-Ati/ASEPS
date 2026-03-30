import { useState } from 'react'

export default function MethodologyModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-sans text-federal-300 hover:text-white border-b border-dotted border-federal-500 hover:border-white transition-colors"
      >
        Methodology & Sources
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-federal-900/80 backdrop-blur-sm"
             onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-academic-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-federal-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-xl">Methodology & Data Sources</h2>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-2xl leading-none" aria-label="Close">×</button>
            </div>

            <div className="px-6 py-6 space-y-6 font-body text-sm text-federal-800 leading-relaxed">

              <section>
                <h3 className="font-display text-lg text-federal-900 mb-2">Economic Growth Models</h3>
                <p>ASEPS uses two complementary growth frameworks, both empirically validated for Australia:</p>
                <ul className="mt-2 space-y-2 list-disc list-inside text-federal-700">
                  <li><strong>Augmented Solow-Swan Model</strong> (Mankiw, Romer & Weil 1992, QJE): explains steady-state output per worker, convergence dynamics, and policy levers (savings rate, depreciation, population growth, TFP). Validated for 21 OECD countries including Australia by OECD Working Paper No. 584 (2007).</li>
                  <li><strong>Endogenous Growth / Romer-Lucas Model</strong> (Romer 1990; Lucas 1988): explains long-run growth via R&D, human capital accumulation, and knowledge spillovers. Parameters calibrated from ABS R&D (8104.0) and education (4213.0) data.</li>
                  <li><strong>Domar Debt Sustainability</strong>: fiscal sustainability assessed using the standard condition s_t &gt; (r−g)×(B/Y), with Victoria-specific parameters from RBA and Victorian Budget Papers.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-display text-lg text-federal-900 mb-2">Parameter Calibration</h3>
                <p>All Solow parameters are calibrated exclusively from ABS official data:</p>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-xs border border-parchment-300">
                    <thead className="bg-parchment-100">
                      <tr>
                        {['Parameter', 'Definition', 'Source', 'Victoria Value'].map(h => (
                          <th key={h} className="text-left px-3 py-2 font-sans font-semibold border-b border-parchment-300">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['α', 'Capital income share', 'ABS 5204.0 Table 2: GOS/(GOS+CoE), avg 2014-2024', '0.350'],
                        ['s', 'Gross savings rate', 'ABS 5220.0 State use table, public+private', '21.8%'],
                        ['δ', 'Depreciation rate', 'ABS 5209.0.55.001 CFC/capital stock, Victoria', '4.8%'],
                        ['n', 'Labour force growth', 'ABS 3101.0 + 6202.0, participation trend 2019-24', '2.7%'],
                        ['g', 'TFP growth (trend)', 'ABS 5204.0 MFP index, Victoria, 5-yr avg', '1.2%'],
                        ['h', 'Human capital index', 'ABS 4213.0 tertiary attainment (proxy)', '0.68'],
                        ['L_A', 'R&D labour share', 'ABS 8104.0 R&D exp / employment', '4.2%'],
                      ].map(row => (
                        <tr key={row[0]} className="border-b border-parchment-200">
                          {row.map((cell, i) => (
                            <td key={i} className={`px-3 py-2 ${i===0 ? 'font-mono font-semibold text-federal-700' : ''}`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-display text-lg text-federal-900 mb-2">Issue Severity Scoring</h3>
                <p>Each issue scored 1-10 on three dimensions (equal weight):</p>
                <ol className="mt-2 space-y-1 list-decimal list-inside text-federal-700">
                  <li>Magnitude of gap vs national or OECD benchmark (ABS/RBA data)</li>
                  <li>Structural vs cyclical nature (structural = higher score)</li>
                  <li>Second-order economic effects (multiplier and spill-over impact)</li>
                </ol>
                <p className="mt-2">Critical ≥8, High 6-7, Medium 4-5, Low 1-3.</p>
              </section>

              <section>
                <h3 className="font-display text-lg text-federal-900 mb-2">Pathway Evidence Standards</h3>
                <p>Every policy pathway must satisfy:</p>
                <ol className="mt-2 space-y-1 list-decimal list-inside text-federal-700">
                  <li>Link to peer-reviewed economic theory (DOI cited)</li>
                  <li>Empirical validation from OECD or Australian official sources</li>
                  <li>Agency and budget envelope referenced in official government documents</li>
                  <li>KPIs mapped to specific ABS/RBA series for future verification</li>
                  <li>Real-world precedent cited (international or Australian)</li>
                </ol>
              </section>

              <section>
                <h3 className="font-display text-lg text-federal-900 mb-2">Data Sources</h3>
                <ul className="space-y-1 text-federal-700">
                  {[
                    ['ABS 5220.0', 'State Accounts (GSP, SFD)', 'https://www.abs.gov.au/statistics/economy/national-accounts/australian-national-accounts-state-accounts/latest-release'],
                    ['ABS 5204.0', 'National Accounts (MFP, productivity)', 'https://www.abs.gov.au/statistics/economy/national-accounts/australian-system-national-accounts/latest-release'],
                    ['ABS 5209.0', 'Capital Stock', 'https://www.abs.gov.au/statistics/economy/national-accounts/australian-national-accounts-capital-stock/latest-release'],
                    ['ABS 6202.0', 'Labour Force Survey', 'https://www.abs.gov.au/statistics/labour/employment-and-unemployment/labour-force-australia/latest-release'],
                    ['ABS 6401.0', 'Consumer Price Index', 'https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia/latest-release'],
                    ['ABS 8104.0', 'R&D Expenditure', 'https://www.abs.gov.au/statistics/industry/technology-and-innovation/research-and-experimental-development-businesses-australia/latest-release'],
                    ['RBA Tables', 'Key Economic Indicators', 'https://www.rba.gov.au/statistics/tables/'],
                    ['Vic Budget 2025-26', 'Budget Papers 2 & 3', 'https://www.budget.vic.gov.au/'],
                    ['Vic DTF Snapshot', 'Economic Snapshot March 2025', 'https://www.dtf.vic.gov.au/economic-development/victorias-economy/victorian-economic-snapshot'],
                    ['PC', 'Productivity Insights 2024', 'https://www.pc.gov.au/research/ongoing/productivity-insights'],
                  ].map(([label, desc, url]) => (
                    <li key={label} className="flex items-start gap-2">
                      <span className="font-mono text-federal-400 text-xs flex-shrink-0 mt-0.5">{label}</span>
                      <span>— {desc} · <a href={url} target="_blank" rel="noopener noreferrer" className="citation-link">{url.replace('https://','').split('/')[0]} ↗</a></span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-amber-50 border border-amber-200 rounded p-4">
                <h3 className="font-sans font-semibold text-amber-900 mb-2">Disclaimer</h3>
                <p className="text-amber-800 text-xs leading-relaxed">
                  ASEPS is an independent educational and research tool. All analysis is based exclusively on publicly 
                  available official data from ABS, RBA, and state/territory treasury departments. All economic models 
                  and policy pathways are derived from peer-reviewed academic research. This tool does not constitute 
                  financial, investment, economic, or government policy advice. Projections are illustrative model 
                  outputs, not forecasts or predictions. Users should verify all data against primary sources before 
                  any application. Not affiliated with any government department, university, or institution.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
