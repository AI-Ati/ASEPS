#!/usr/bin/env node
/**
 * ASEPS Data Validator
 * Validates all JSON data files before deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_DIR = path.join(__dirname, '../src/data');
let errors = 0;
let warnings = 0;

function check(condition, msg, isError = true) {
  if (!condition) {
    const prefix = isError ? '❌ ERROR' : '⚠  WARN';
    console.log(`  ${prefix}: ${msg}`);
    if (isError) errors++; else warnings++;
  }
}

function validateKeyMetrics() {
  console.log('\n📊 Validating key_metrics.json...');
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'key_metrics.json')));
  
  const REQUIRED_STATE_FIELDS = [
    'gsp_growth_pct', 'gsp_per_capita_aud', 'unemployment_rate_pct',
    'cpi_inflation_pct', 'net_debt_gsp_pct', 'labour_productivity_growth_pct'
  ];
  
  const EXPECTED_STATES = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'];
  
  // Check all states present
  for (const state of EXPECTED_STATES) {
    check(data.states[state], `Missing state: ${state}`);
  }
  
  // Check required fields per state
  for (const [stateId, stateData] of Object.entries(data.states || {})) {
    for (const field of REQUIRED_STATE_FIELDS) {
      check(
        stateData[field] !== undefined && stateData[field] !== null,
        `${stateId}.${field} is missing`
      );
      check(
        typeof stateData[field] === 'number',
        `${stateId}.${field} should be a number, got ${typeof stateData[field]}`,
        false
      );
    }
    
    // Sanity checks on values
    check(stateData.gsp_growth_pct > -10 && stateData.gsp_growth_pct < 20, 
      `${stateId}.gsp_growth_pct value ${stateData.gsp_growth_pct} seems implausible`);
    check(stateData.unemployment_rate_pct > 0 && stateData.unemployment_rate_pct < 30,
      `${stateId}.unemployment_rate_pct value ${stateData.unemployment_rate_pct} seems implausible`);
    check(stateData.cpi_inflation_pct > -5 && stateData.cpi_inflation_pct < 20,
      `${stateId}.cpi_inflation_pct value ${stateData.cpi_inflation_pct} seems implausible`);
  }
  
  check(data._meta?.generated, 'Missing _meta.generated timestamp');
  check(data._meta?.sources?.length > 0, 'Missing _meta.sources');
  
  console.log('  ✓ key_metrics.json structure valid');
}

function validateSolowParams() {
  console.log('\n📐 Validating solow_params.json...');
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'solow_params.json')));
  
  const REQUIRED_PARAMS = ['alpha', 's', 'delta', 'n', 'g', 'h', 'L_A_share'];
  const EXPECTED_STATES = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'];
  
  for (const state of EXPECTED_STATES) {
    check(data.parameters[state], `Missing Solow parameters for: ${state}`);
    
    if (data.parameters[state]) {
      for (const param of REQUIRED_PARAMS) {
        check(
          data.parameters[state][param] !== undefined,
          `${state}.${param} is missing`
        );
      }
      
      const p = data.parameters[state];
      // Economic validity checks
      check(p.alpha > 0.2 && p.alpha < 0.6, `${state}.alpha=${p.alpha} outside plausible range [0.2, 0.6]`);
      check(p.s > 0.1 && p.s < 0.5, `${state}.s=${p.s} outside plausible range [0.1, 0.5]`);
      check(p.delta > 0.02 && p.delta < 0.1, `${state}.delta=${p.delta} outside plausible range [0.02, 0.1]`);
      check(p.n > -0.01 && p.n < 0.05, `${state}.n=${p.n} outside plausible range [-0.01, 0.05]`);
      check(p.h > 0 && p.h <= 1, `${state}.h=${p.h} outside range [0, 1]`);
    }
  }
  
  // VIC must have computed scenarios
  const vic = data.parameters.VIC;
  check(vic?.computed?.steady_state_k_star, 'VIC missing computed.steady_state_k_star');
  check(vic?.scenario_optimised?.additional_output_billion_aud_yr5, 'VIC missing optimised scenario output projection');
  
  console.log('  ✓ solow_params.json structure valid');
}

function validateDeepPathways() {
  console.log('\n🗺  Validating deep_pathways.json...');
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'deep_pathways.json')));
  
  // Victoria must have 10 issues
  const vicIssues = data.victoria?.issues || [];
  check(vicIssues.length >= 10, `Victoria has ${vicIssues.length} issues, expected 10+`);
  
  for (const issue of vicIssues) {
    check(issue.id, `Issue missing id`);
    check(issue.title, `Issue ${issue.id} missing title`);
    check(issue.severity, `Issue ${issue.id} missing severity`);
    check(issue.data_evidence?.source_url, `Issue ${issue.id} missing source URL`);
    check(issue.formula_latex, `Issue ${issue.id} missing formula_latex`);
    check(issue.oecd_evidence || issue.australian_evidence, `Issue ${issue.id} missing evidence`);
    
    const pathways = issue.pathways || [];
    check(pathways.length >= 1, `Issue ${issue.id} has no pathways`, false);
    
    for (const pathway of pathways) {
      check(pathway.id, `Pathway in ${issue.id} missing id`);
      check(pathway.title, `Pathway ${pathway.id} missing title`);
      check(pathway.agency_primary, `Pathway ${pathway.id} missing agency_primary`);
      check(pathway.kpis?.length > 0, `Pathway ${pathway.id} missing KPIs`);
      check(pathway.steps?.length >= 5, `Pathway ${pathway.id} has <5 steps`, false);
      check(pathway.evidence_success, `Pathway ${pathway.id} missing evidence_success`, false);
      
      for (const step of (pathway.steps || [])) {
        check(step.year, `Step in pathway ${pathway.id} missing year`);
        check(step.step, `Step in pathway ${pathway.id} missing step description`);
      }
    }
  }
  
  // Check all 7 other states have summary issues
  const SUMMARY_STATES = ['NSW', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'];
  for (const state of SUMMARY_STATES) {
    check(data.states_summary[state], `Missing summary for state: ${state}`);
    const issues = data.states_summary[state]?.issues || [];
    check(issues.length >= 3, `${state} has ${issues.length} issues, expected 3+`, false);
  }
  
  console.log('  ✓ deep_pathways.json structure valid');
}

// Run all validations
console.log('🔍 ASEPS Data Validator');
console.log('========================');

try {
  validateKeyMetrics();
  validateSolowParams();
  validateDeepPathways();
} catch (err) {
  console.error('\n💥 Validator crashed:', err);
  process.exit(1);
}

// Summary
console.log('\n========================');
console.log(`Results: ${errors} errors, ${warnings} warnings`);

if (errors > 0) {
  console.log('❌ Validation FAILED — fix errors before deploying');
  process.exit(1);
} else if (warnings > 0) {
  console.log('⚠  Validation PASSED with warnings — review before deploying');
} else {
  console.log('✅ All validations PASSED');
}
