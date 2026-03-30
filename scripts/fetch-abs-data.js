#!/usr/bin/env node
/**
 * ASEPS ABS Data Fetcher
 * Fetches latest key economic metrics from ABS SDMX JSON API
 * Runs quarterly via GitHub Actions
 * 
 * ABS API documentation: https://api.data.abs.gov.au/
 * SDMX REST API: https://data.abs.gov.au/sdmx-json/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_FILE = path.join(__dirname, '../src/data/key_metrics.json');

// State codes mapping (ABS uses these in SDMX series)
const STATE_CODES = {
  '1': 'NSW',
  '2': 'VIC', 
  '3': 'QLD',
  '4': 'SA',
  '5': 'WA',
  '6': 'TAS',
  '7': 'NT',
  '8': 'ACT',
  '0': 'AUS'
};

// ABS SDMX API endpoints (free, no authentication required)
const ABS_API_BASE = 'https://api.data.abs.gov.au/data';

const ENDPOINTS = {
  // ABS 5220.0 - State Accounts (GSP chain volume measures)
  gsp: `${ABS_API_BASE}/ABS,GSP,1.0.0/1..Q?startPeriod=2022&detail=dataonly&format=jsondata`,
  
  // ABS 6202.0 - Labour Force (unemployment by state)
  unemployment: `${ABS_API_BASE}/ABS,LF,1.0.0/M2.1..15.Q?startPeriod=2024&detail=dataonly&format=jsondata`,
  
  // ABS 6401.0 - CPI (by capital city)
  cpi: `${ABS_API_BASE}/ABS,CPI,1.0.0/1..Q?startPeriod=2024&detail=dataonly&format=jsondata`,
  
  // ABS 5512.0 - Government Finance Statistics (debt)
  gfs: `${ABS_API_BASE}/ABS,GFS,1.0.0/A..Q?startPeriod=2023&detail=dataonly&format=jsondata`
};

async function fetchJSON(url) {
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'ASEPS-DataFetcher/1.0 (https://github.com/aseps-au/aseps; Educational research tool)'
    }
  });
  
  if (!response.ok) {
    throw new Error(`ABS API error: ${response.status} ${response.statusText} for ${url}`);
  }
  
  return response.json();
}

function extractLatestValue(seriesData) {
  const obs = seriesData.observations || {};
  const periods = Object.keys(obs).map(Number).sort((a, b) => b - a);
  if (periods.length === 0) return null;
  return obs[periods[0]][0]; // First value is the observation value
}

async function fetchGSPData() {
  console.log('Fetching GSP data from ABS 5220.0...');
  try {
    const data = await fetchJSON(ENDPOINTS.gsp);
    const series = data.data?.dataSets?.[0]?.series || {};
    
    const results = {};
    for (const [key, value] of Object.entries(series)) {
      // Key format: stateCode:measureCode:...
      const parts = key.split(':');
      const stateCode = parts[0];
      const stateId = STATE_CODES[stateCode];
      
      if (stateId) {
        const latestValue = extractLatestValue(value);
        if (latestValue !== null) {
          results[stateId] = results[stateId] || {};
          results[stateId].gsp_growth_pct = Math.round(latestValue * 10) / 10;
        }
      }
    }
    
    console.log(`✓ GSP data fetched for ${Object.keys(results).length} states`);
    return results;
  } catch (err) {
    console.error(`⚠ GSP fetch failed: ${err.message}. Using existing data.`);
    return null;
  }
}

async function fetchUnemploymentData() {
  console.log('Fetching unemployment data from ABS 6202.0...');
  try {
    const data = await fetchJSON(ENDPOINTS.unemployment);
    const series = data.data?.dataSets?.[0]?.series || {};
    
    const results = {};
    for (const [key, value] of Object.entries(series)) {
      const parts = key.split(':');
      const stateCode = parts[2];
      const stateId = STATE_CODES[stateCode];
      
      if (stateId) {
        const latestValue = extractLatestValue(value);
        if (latestValue !== null) {
          results[stateId] = results[stateId] || {};
          results[stateId].unemployment_rate_pct = Math.round(latestValue * 10) / 10;
        }
      }
    }
    
    console.log(`✓ Unemployment data fetched for ${Object.keys(results).length} states`);
    return results;
  } catch (err) {
    console.error(`⚠ Unemployment fetch failed: ${err.message}. Using existing data.`);
    return null;
  }
}

async function fetchCPIData() {
  console.log('Fetching CPI data from ABS 6401.0...');
  try {
    const data = await fetchJSON(ENDPOINTS.cpi);
    const series = data.data?.dataSets?.[0]?.series || {};
    
    const results = {};
    // CPI is by capital city, not state — map cities to states
    const CITY_TO_STATE = {
      '1': 'NSW', '2': 'VIC', '3': 'QLD', '4': 'SA', 
      '5': 'WA', '6': 'TAS', '7': 'NT', '8': 'ACT'
    };
    
    for (const [key, value] of Object.entries(series)) {
      const parts = key.split(':');
      const cityCode = parts[1];
      const stateId = CITY_TO_STATE[cityCode];
      
      if (stateId) {
        const latestValue = extractLatestValue(value);
        if (latestValue !== null) {
          results[stateId] = results[stateId] || {};
          results[stateId].cpi_inflation_pct = Math.round(latestValue * 10) / 10;
        }
      }
    }
    
    console.log(`✓ CPI data fetched for ${Object.keys(results).length} states`);
    return results;
  } catch (err) {
    console.error(`⚠ CPI fetch failed: ${err.message}. Using existing data.`);
    return null;
  }
}

async function main() {
  console.log('\n🇦🇺 ASEPS ABS Data Fetcher');
  console.log('================================');
  console.log(`Started: ${new Date().toISOString()}`);
  
  // Load existing data as fallback
  const existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  
  // Fetch all data sources
  const [gspData, unemploymentData, cpiData] = await Promise.all([
    fetchGSPData(),
    fetchUnemploymentData(),
    fetchCPIData()
  ]);
  
  // Merge fetched data into existing structure
  let updatedCount = 0;
  
  const mergeIntoState = (stateData, newData, stateId) => {
    if (!newData || !newData[stateId]) return stateData;
    
    for (const [key, value] of Object.entries(newData[stateId])) {
      if (stateData[key] !== value) {
        console.log(`  ${stateId}.${key}: ${stateData[key]} → ${value}`);
        stateData[key] = value;
        updatedCount++;
      }
    }
    return stateData;
  };
  
  // Update national data
  if (gspData?.AUS) {
    existingData.national = mergeIntoState(existingData.national, gspData, 'AUS');
  }
  
  // Update all states
  for (const [stateId, stateData] of Object.entries(existingData.states)) {
    existingData.states[stateId] = mergeIntoState(stateData, gspData, stateId);
    existingData.states[stateId] = mergeIntoState(existingData.states[stateId], unemploymentData, stateId);
    existingData.states[stateId] = mergeIntoState(existingData.states[stateId], cpiData, stateId);
  }
  
  // Update metadata
  existingData._meta.generated = new Date().toISOString().split('T')[0].substring(0, 7).replace('-', '-Q');
  existingData._meta.last_auto_update = new Date().toISOString();
  existingData._meta.next_auto_update = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];
  
  // Write updated data
  fs.writeFileSync(DATA_FILE, JSON.stringify(existingData, null, 2));
  
  console.log(`\n✅ Complete: ${updatedCount} metrics updated`);
  console.log(`📁 Written to: ${DATA_FILE}`);
  
  if (updatedCount === 0) {
    console.log('ℹ No changes detected — data appears current');
  }
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
