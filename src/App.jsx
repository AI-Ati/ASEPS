import { useState, useCallback } from 'react'
import StateSelector from './components/StateSelector'
import EconomicDashboard from './components/EconomicDashboard'
import DiagnosisPanel from './components/DiagnosisPanel'
import PathwayViewer from './components/PathwayViewer'
import ComparativeAnalytics from './components/ComparativeAnalytics'
import ExportButton from './components/ExportButton'
import DisclaimerBanner from './components/DisclaimerBanner'
import DataTimestamp from './components/DataTimestamp'
import MethodologyModal from './components/MethodologyModal'
import keyMetrics from './data/key_metrics.json'
import deepPathways from './data/deep_pathways.json'
import solowParams from './data/solow_params.json'

const TABS = [
  { id: 'dashboard',    label: 'Economic Dashboard',    icon: '📊' },
  { id: 'diagnosis',    label: 'Issue Diagnosis',       icon: '🔍' },
  { id: 'pathways',     label: 'Policy Pathways',       icon: '🗺' },
  { id: 'comparative',  label: 'Comparative Analytics', icon: '📐' },
]

export default function App() {
  const [selectedState, setSelectedState] = useState('VIC')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedIssueId, setSelectedIssueId] = useState(null)

  const stateData = selectedState === 'AUS'
    ? keyMetrics.national
    : keyMetrics.states[selectedState]

  const pathwayData = selectedState === 'VIC'
    ? deepPathways.victoria
    : deepPathways.states_summary[selectedState]

  const solowData = solowParams.parameters[selectedState]

  const handleIssueSelect = useCallback((issueId) => {
    setSelectedIssueId(issueId)
    setActiveTab('pathways')
  }, [])

  return (
    <div className="min-h-screen bg-parchment-100" id="aseps-root">
      
      {/* Persistent Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Header */}
      <header className="bg-federal-600 text-white border-b-4 border-ochre-500">
        <div className="max-w-screen-xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-ochre-400 text-xs font-sans font-semibold tracking-[0.15em] uppercase">
                  Educational Research Tool
                </span>
                <span className="text-federal-400 text-xs">|</span>
                <DataTimestamp meta={keyMetrics._meta} />
              </div>
              <h1 className="font-display text-display-lg text-white leading-tight">
                Australian State Economic
                <br />
                <span className="text-ochre-400">Pathways Simulator</span>
              </h1>
              <p className="mt-2 text-federal-200 font-body text-sm max-w-2xl leading-relaxed">
                Evidence-based analysis of all Australian states and territories — 
                ABS/RBA official data · Solow–Lucas growth models · Peer-reviewed policy pathways
              </p>
            </div>
            <div className="hidden lg:flex flex-col items-end gap-2">
              <ExportButton stateId={selectedState} stateData={stateData} />
              <div className="flex items-center gap-3">
                <p className="text-federal-300 text-xs font-sans">Sources: ABS · RBA · Victorian DTF</p>
                <MethodologyModal />
              </div>
            </div>
          </div>

          {/* State Selector */}
          <div className="mt-6">
            <StateSelector
              selected={selectedState}
              onChange={setSelectedState}
              metrics={keyMetrics}
            />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b border-parchment-300 shadow-academic sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-4 text-sm font-sans font-medium
                  border-b-2 transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-federal-600 text-federal-600 bg-federal-50'
                    : 'border-transparent text-federal-400 hover:text-federal-600 hover:bg-parchment-100'}
                `}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === 'diagnosis' && selectedState === 'VIC' && (
                  <span className="bg-federal-600 text-white text-xs px-1.5 py-0.5 rounded-full">10</span>
                )}
                {tab.id === 'diagnosis' && selectedState !== 'VIC' && selectedState !== 'AUS' && (
                  <span className="bg-federal-300 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-6 py-8" id="aseps-content">
        
        {activeTab === 'dashboard' && (
          <EconomicDashboard
            stateId={selectedState}
            stateData={stateData}
            solowData={solowData}
            allStates={keyMetrics.states}
            national={keyMetrics.national}
          />
        )}

        {activeTab === 'diagnosis' && (
          <DiagnosisPanel
            stateId={selectedState}
            pathwayData={pathwayData}
            stateData={stateData}
            onIssueSelect={handleIssueSelect}
          />
        )}

        {activeTab === 'pathways' && (
          <PathwayViewer
            stateId={selectedState}
            pathwayData={pathwayData}
            solowData={solowData}
            stateData={stateData}
            selectedIssueId={selectedIssueId}
            onIssueSelect={setSelectedIssueId}
          />
        )}

        {activeTab === 'comparative' && (
          <ComparativeAnalytics
            selectedState={selectedState}
            allStates={keyMetrics.states}
            national={keyMetrics.national}
            allSolow={solowParams.parameters}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-federal-900 text-federal-200 mt-16">
        <div className="max-w-screen-xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-display text-white text-lg mb-3">ASEPS</h3>
              <p className="text-sm leading-relaxed">
                Australian State Economic Pathways Simulator — 
                a first-of-its-kind educational research tool for 
                evidence-based economic growth analysis.
              </p>
            </div>
            <div>
              <h3 className="font-sans font-semibold text-white text-sm mb-3 uppercase tracking-wide">
                Official Data Sources
              </h3>
              <ul className="text-sm space-y-1.5">
                {[
                  ['ABS State Accounts (5220.0)', 'https://www.abs.gov.au/statistics/economy/national-accounts/australian-national-accounts-state-accounts/latest-release'],
                  ['ABS Labour Force (6202.0)', 'https://www.abs.gov.au/statistics/labour/employment-and-unemployment/labour-force-australia/latest-release'],
                  ['RBA Statistical Tables', 'https://www.rba.gov.au/statistics/tables/'],
                  ['Victorian DTF Economic Snapshot', 'https://www.dtf.vic.gov.au/economic-development/victorias-economy/victorian-economic-snapshot'],
                  ['Victorian Budget 2025-26', 'https://www.budget.vic.gov.au/'],
                  ['Productivity Commission', 'https://www.pc.gov.au/research'],
                ].map(([label, url]) => (
                  <li key={label}>
                    <a href={url} target="_blank" rel="noopener noreferrer"
                       className="hover:text-ochre-400 transition-colors">
                      {label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-sans font-semibold text-white text-sm mb-3 uppercase tracking-wide">
                Research Foundation
              </h3>
              <ul className="text-sm space-y-1.5">
                {[
                  ['Mankiw, Romer & Weil (1992) — QJE', 'https://doi.org/10.2307/2118477'],
                  ['OECD Working Paper No. 584 (2007)', 'https://doi.org/10.1787/174521061831'],
                  ['Romer (1990) — JPE Endogenous Growth', 'https://doi.org/10.1086/261725'],
                  ['RBA RDP 2023-04 Productivity', 'https://www.rba.gov.au/publications/rdp/2023/2023-04.html'],
                  ['PC Productivity Insights 2024', 'https://www.pc.gov.au/research/ongoing/productivity-insights'],
                ].map(([label, url]) => (
                  <li key={label}>
                    <a href={url} target="_blank" rel="noopener noreferrer"
                       className="hover:text-ochre-400 transition-colors">
                      {label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-federal-700 text-xs text-federal-400 leading-relaxed">
            <p>
              <strong className="text-federal-200">Disclaimer:</strong> ASEPS is an independent educational and research tool. 
              All analysis is based exclusively on publicly available official data from ABS, RBA, and state/territory treasury departments. 
              All economic models and pathways are derived from peer-reviewed academic research. 
              This tool does not constitute financial, investment, economic or policy advice. 
              Projections are illustrative models, not forecasts. 
              Users should verify all data against primary sources before any application.
              Not affiliated with any government department or institution.
            </p>
            <p className="mt-3">
              Data auto-updated quarterly from ABS API. Deep pathways reviewed manually every 6 months. 
              Last data update: {keyMetrics._meta.last_auto_update || keyMetrics._meta.generated} · 
              Next update: {keyMetrics._meta.next_auto_update}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
