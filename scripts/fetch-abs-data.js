#!/usr/bin/env node
/**
 * ASEPS ABS Data Fetcher
 * Fetches the latest state unemployment (ABS 6202.0 Labour Force) and
 * annual CPI inflation (ABS 6401.0) from the ABS Data API (SDMX-JSON).
 * Runs quarterly via GitHub Actions.
 *
 * ABS Data API: https://www.abs.gov.au/about/data-services/application-programming-interfaces-apis/data-api-user-guide
 *
 * GSP, debt and productivity are annual/budget figures and are updated by
 * hand (see the review issue opened by the workflow).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_FILE = path.join(__dirname, '../src/data/key_metrics.json');
const ABS_API_BASE = 'https://data.api.abs.gov.au/rest/data';

// ABS region codes → ASEPS ids. CPI uses capital cities (1–8) and 50 for
// the weighted average of eight capitals (national).
const LF_REGIONS = { '1': 'NSW', '2': 'VIC', '3': 'QLD', '4': 'SA', '5': 'WA', '6': 'TAS', '7': 'NT', '8': 'ACT', AUS: 'AUS' };
const CPI_REGIONS = { '1': 'NSW', '2': 'VIC', '3': 'QLD', '4': 'SA', '5': 'WA', '6': 'TAS', '7': 'NT', '8': 'ACT', '50': 'AUS' };

const startYear = new Date().getUTCFullYear() - 1;

const SOURCES = [
  {
    field: 'unemployment_rate_pct',
    label: 'ABS 6202.0 Labour Force — unemployment rate, persons 15+, seasonally adjusted',
    // MEASURE.SEX.AGE.TSEST.REGION.FREQ — M13 unemployment rate, 3 persons, 1599 15+, 20 seasonally adjusted
    url: `${ABS_API_BASE}/LF/M13.3.1599.20.${Object.keys(LF_REGIONS).join('+')}.M?startPeriod=${startYear}-01`,
    regions: LF_REGIONS,
    range: [0, 20],
  },
  {
    field: 'cpi_inflation_pct',
    label: 'ABS 6401.0 CPI — all groups, % change from corresponding quarter of previous year',
    // MEASURE.INDEX.TSEST.REGION.FREQ — 3 annual % change, 10001 all groups CPI, 10 original
    url: `${ABS_API_BASE}/CPI/3.10001.10.${Object.keys(CPI_REGIONS).join('+')}.Q?startPeriod=${startYear}-Q1`,
    regions: CPI_REGIONS,
    range: [-5, 20],
  },
];

async function fetchJSON(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.sdmx.data+json',
      'User-Agent': 'ASEPS-DataFetcher/2.0 (educational research tool)',
    },
  });
  if (!response.ok) {
    throw new Error(`ABS API error: ${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

/**
 * Parse an SDMX-JSON response into { regionCode: { value, period } } using the
 * dimension metadata in the response rather than assuming key positions.
 */
export function latestByRegion(json) {
  const root = json.data ?? json;
  const structure = root.structure ?? root.structures?.[0];
  const seriesDims = structure?.dimensions?.series ?? [];
  const timeValues = structure?.dimensions?.observation?.[0]?.values ?? [];
  const regionPos = seriesDims.findIndex(d => d.id === 'REGION');
  if (regionPos < 0) throw new Error('REGION dimension not found in ABS response');

  const out = {};
  for (const [key, s] of Object.entries(root.dataSets?.[0]?.series ?? {})) {
    const regionIdx = Number(key.split(':')[regionPos]);
    const region = seriesDims[regionPos].values[regionIdx]?.id;
    const obs = Object.entries(s.observations ?? {})
      .filter(([, v]) => v?.[0] !== null && v?.[0] !== undefined)
      .map(([i, v]) => ({ period: timeValues[Number(i)]?.id, value: Number(v[0]) }))
      .filter(o => o.period && Number.isFinite(o.value))
      .sort((a, b) => a.period.localeCompare(b.period));
    if (region && obs.length) out[region] = obs[obs.length - 1];
  }
  return out;
}

async function fetchSource(src) {
  console.log(`Fetching ${src.label}...`);
  try {
    const parsed = latestByRegion(await fetchJSON(src.url));
    const results = {};
    for (const [code, { value, period }] of Object.entries(parsed)) {
      const id = src.regions[code];
      if (!id) continue;
      if (value < src.range[0] || value > src.range[1]) {
        console.warn(`  ⚠ ${id}.${src.field}=${value} outside plausible range — skipped`);
        continue;
      }
      results[id] = { value: Math.round(value * 10) / 10, period };
    }
    console.log(`✓ ${src.field}: ${Object.keys(results).length} regions`);
    return results;
  } catch (err) {
    console.error(`⚠ ${src.field} fetch failed: ${err.message}. Keeping existing data.`);
    return {};
  }
}

function quarterLabel(d = new Date()) {
  return `${d.getUTCFullYear()}-Q${Math.floor(d.getUTCMonth() / 3) + 1}`;
}

async function main() {
  console.log('\n🇦🇺 ASEPS ABS Data Fetcher');
  console.log('================================');
  console.log(`Started: ${new Date().toISOString()}`);

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const fetched = await Promise.all(SOURCES.map(fetchSource));

  let updatedCount = 0;
  const periods = { ...(data._meta.auto_reference_periods ?? {}) };

  SOURCES.forEach((src, i) => {
    for (const [id, { value, period }] of Object.entries(fetched[i])) {
      const target = id === 'AUS' ? data.national : data.states[id];
      if (!target) continue;
      if (target[src.field] !== value) {
        console.log(`  ${id}.${src.field}: ${target[src.field]} → ${value} (${period})`);
        target[src.field] = value;
        updatedCount++;
      }
      periods[src.field] = period;
    }
  });

  if (updatedCount === 0) {
    console.log('\nℹ No value changes — key_metrics.json left untouched');
    return;
  }

  const now = new Date();
  data._meta.generated = quarterLabel(now);
  data._meta.last_auto_update = now.toISOString();
  data._meta.next_auto_update = new Date(now.getTime() + 92 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  data._meta.auto_reference_periods = periods;

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n');
  console.log(`\n✅ Complete: ${updatedCount} metrics updated → ${DATA_FILE}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });
}
