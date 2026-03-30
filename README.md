# ASEPS — Australian State Economic Pathways Simulator

> **The first interactive tool in Australia** that combines all-state economic data (ABS/RBA), root-cause diagnosis, scientifically calibrated growth models (Solow–Lucas), and step-by-step policy pathways — with Victoria at full depth.

---

## What This Is

ASEPS is a static educational research tool for:
- **Treasuries & policymakers**: Evidence-based pathway workflows with agency assignments and KPIs
- **Academic economists**: Solow model parameters calibrated from ABS data, KaTeX formulas, peer-reviewed citations
- **University students**: Transparent methodology linking raw data → diagnosis → economic theory → policy
- **Informed public**: Accessible visual summaries of state economic performance

**No equivalent tool exists** across any Australian government or academic institution (confirmed via exhaustive search of all .gov.au and .edu.au domains, March 2025).

---

## Setup

### Prerequisites
- Node.js ≥ 20.0.0
- npm ≥ 10.0.0

### Install & Run

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/aseps.git
cd aseps

# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5173
```

### Build for Production

```bash
# GitHub Pages deployment
DEPLOY_TARGET=github npm run build

# Netlify / other deployment
npm run build
# dist/ folder is ready to deploy
```

---

## Data Architecture

### Auto-Updated Quarterly (GitHub Actions)
`src/data/key_metrics.json` — fetched from ABS SDMX API:
- GSP growth rates (ABS 5220.0)
- Unemployment rates (ABS 6202.0)
- CPI/inflation (ABS 6401.0)

### Manual Update (Every 6 Months)
`src/data/deep_pathways.json` — requires human review:
- Victoria: 10 issues × 8 detailed pathways
- Other states: 3 issues × summary pathways

`src/data/solow_params.json` — recalibrate when ABS releases:
- Capital stock data (ABS 5209.0.55.001)
- System of National Accounts (ABS 5204.0)

### Manual Update Instructions
1. Download latest ABS Excel releases from links in `_meta.sources`
2. Update numeric values in the JSON files
3. Run `npm run validate` to check data integrity
4. Update `_meta.generated` timestamps
5. Run `npm run build` and deploy

---

## Automated Data Refresh

The GitHub Actions workflow (`.github/workflows/update-data.yml`) runs quarterly:
1. Fetches latest metrics from `api.data.abs.gov.au` (free, no auth)
2. Validates data integrity
3. Commits changes and triggers deployment
4. Opens a GitHub Issue requesting manual pathway review

To trigger manually: **Actions → Auto-Update ABS Economic Data → Run workflow**

---

## Deployment

### GitHub Pages (Primary)
1. Push to `main` branch
2. Go to **Settings → Pages → Source: GitHub Actions**
3. The workflow auto-deploys on data updates

### Netlify (Mirror)
1. Connect repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variable: `DEPLOY_TARGET=netlify`

---

## Data Sources (Official Only)

| Dataset | Source | URL |
|---|---|---|
| State Accounts (GSP) | ABS 5220.0 | https://www.abs.gov.au/statistics/economy/national-accounts/australian-national-accounts-state-accounts/latest-release |
| National Accounts | ABS 5204.0 | https://www.abs.gov.au/statistics/economy/national-accounts/australian-system-national-accounts/latest-release |
| Capital Stock | ABS 5209.0.55.001 | https://www.abs.gov.au/statistics/economy/national-accounts/australian-national-accounts-capital-stock/latest-release |
| Labour Force | ABS 6202.0 | https://www.abs.gov.au/statistics/labour/employment-and-unemployment/labour-force-australia/latest-release |
| CPI | ABS 6401.0 | https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia/latest-release |
| R&D | ABS 8104.0 | https://www.abs.gov.au/statistics/industry/technology-and-innovation/research-and-experimental-development-businesses-australia/latest-release |
| RBA Indicators | RBA | https://www.rba.gov.au/statistics/tables/ |
| Victorian Budget | Vic DTF | https://www.budget.vic.gov.au/ |
| DTF Snapshot | Vic DTF | https://www.dtf.vic.gov.au/economic-development/victorias-economy/victorian-economic-snapshot |
| Productivity | PC | https://www.pc.gov.au/research/ongoing/productivity-insights |

---

## Research Foundation

| Reference | DOI |
|---|---|
| Mankiw, Romer & Weil (1992) — Augmented Solow | https://doi.org/10.2307/2118477 |
| OECD Working Paper No. 584 (2007) — OECD convergence | https://doi.org/10.1787/174521061831 |
| Romer (1990) — Endogenous Technological Change | https://doi.org/10.1086/261725 |
| Lucas (1988) — On the Mechanics of Economic Development | https://doi.org/10.1016/0304-3932(88)90168-7 |
| RBA RDP 2023-04 — Productivity in Australia | https://www.rba.gov.au/publications/rdp/2023/2023-04.html |

---

## Disclaimer

ASEPS is an independent educational and research tool. All analysis is based exclusively on publicly available official data from ABS, RBA, and state/territory treasury departments. All economic models and policy pathways are derived from peer-reviewed academic research. **This tool does not constitute financial, investment, economic, or policy advice.** Projections are illustrative model outputs, not forecasts. Users should verify all data against primary sources before any application. Not affiliated with any government department or institution.

---

## Accessibility

WCAG 2.2 AA compliant. All charts have descriptive aria-labels. KaTeX formulas include screen-reader accessible plain-text alternatives. Keyboard navigable throughout.

---

## License

MIT — open for educational and research use. Attribution appreciated.
