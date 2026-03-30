/**
 * ASEPS Solow-Swan Growth Model Engine
 * 
 * Implements: Augmented Solow Model (Mankiw-Romer-Weil 1992)
 * + Endogenous growth elements (Romer 1990, Lucas 1988)
 * 
 * Evidence base:
 * - OECD Working Paper No. 584 (2007): tested on 21 OECD countries 1971-2004
 *   including Australia, confirming model explains GSP growth patterns
 * - Mankiw, N.G., Romer, D., Weil, D.N. (1992). QJE 107(2), 407-437.
 * - RBA RDP 2023-04: Productivity, Capital and Labour in Australia
 */

/**
 * Compute steady-state capital per effective worker
 * k* = (s / (n + g + δ))^(1/(1-α))
 */
export function steadyStateCapital({ s, n, g, delta, alpha }) {
  return Math.pow(s / (n + g + delta), 1 / (1 - alpha));
}

/**
 * Compute steady-state output per effective worker
 * y* = (k*)^α
 */
export function steadyStateOutput({ s, n, g, delta, alpha }) {
  const kStar = steadyStateCapital({ s, n, g, delta, alpha });
  return Math.pow(kStar, alpha);
}

/**
 * Convergence speed (fraction of gap closed per year)
 * λ = (1-α)(n+g+δ)
 * Source: Mankiw-Romer-Weil 1992, equation 11
 */
export function convergenceSpeed({ alpha, n, g, delta }) {
  return (1 - alpha) * (n + g + delta);
}

/**
 * Half-life of convergence in years
 * t½ = ln(2) / λ
 */
export function convergenceHalfLife({ alpha, n, g, delta }) {
  const lambda = convergenceSpeed({ alpha, n, g, delta });
  return Math.log(2) / lambda;
}

/**
 * Endogenous growth rate from Romer/Lucas model
 * g_endogenous = δ_knowledge × L_A
 * where L_A = share of labour in knowledge/R&D production
 * Source: Romer (1990), Lucas (1988)
 */
export function endogenousGrowthRate({ delta_knowledge = 0.4, L_A_share }) {
  return delta_knowledge * L_A_share;
}

/**
 * Simulate GSP growth trajectory over N years under a given parameter set
 * Uses partial adjustment model toward steady-state
 */
export function simulateGrowthPath({ params, baseGSP, years = 5 }) {
  const { s, n, g, delta, alpha } = params;
  const lambda = convergenceSpeed({ alpha, n, g, delta });
  
  const yStar = steadyStateOutput({ s, n, g, delta, alpha });
  const yStarGDP = yStar * baseGSP; // Scale to actual GSP
  
  const path = [];
  let currentGSP = baseGSP;
  
  for (let t = 1; t <= years; t++) {
    // Convergence adjustment: y(t) approaches y* at rate λ
    const gap = yStarGDP - currentGSP;
    const adjustment = gap * (1 - Math.exp(-lambda));
    const tfpGrowth = g * currentGSP;
    const populationEffect = n * currentGSP;
    
    const gspGrowthRate = (adjustment + tfpGrowth + populationEffect) / currentGSP;
    currentGSP = currentGSP * (1 + gspGrowthRate);
    
    path.push({
      year: t,
      gsp: Math.round(currentGSP * 10) / 10,
      growthRate: Math.round(gspGrowthRate * 1000) / 10, // percentage
      gapToSteadyState: Math.round((yStarGDP - currentGSP) / yStarGDP * 100) / 10
    });
  }
  
  return path;
}

/**
 * Compare two scenarios (baseline vs optimised) and compute output gain
 */
export function compareScenarios({ baseline, optimised, baseGSP, years = 5 }) {
  const baselinePath = simulateGrowthPath({ params: baseline, baseGSP, years });
  const optimisedPath = simulateGrowthPath({ params: optimised, baseGSP, years });
  
  return {
    baseline: baselinePath,
    optimised: optimisedPath,
    cumulativeGain: optimisedPath[years - 1].gsp - baselinePath[years - 1].gsp,
    yearlyGains: optimisedPath.map((opt, i) => ({
      year: opt.year,
      gain: opt.gsp - baselinePath[i].gsp,
      gainPct: ((opt.gsp - baselinePath[i].gsp) / baselinePath[i].gsp) * 100
    }))
  };
}

/**
 * Compute debt sustainability metrics
 * Domar condition: primary surplus needed to stabilise B/Y
 * Required s_t = (r - g) × (B/Y)
 */
export function debtSustainability({ netDebtGSPRatio, realInterestRate, gspGrowthRate }) {
  const rMinusG = realInterestRate - gspGrowthRate;
  const requiredPrimarySurplusRatio = rMinusG * netDebtGSPRatio;
  return {
    rMinusG: Math.round(rMinusG * 1000) / 10,
    requiredPrimarySurplusGSPPct: Math.round(requiredPrimarySurplusRatio * 1000) / 10,
    isStabilising: rMinusG <= 0, // If g >= r, debt ratio stable even with deficit
    fiscalAdjustmentNeeded: requiredPrimarySurplusRatio
  };
}

/**
 * Human capital augmented output (Mankiw-Romer-Weil extension)
 * y* = A × (k*)^α × h^(1-α)
 * where h is human capital index
 */
export function humanCapitalOutput({ s, n, g, delta, alpha, h }) {
  const kStar = steadyStateCapital({ s, n, g, delta, alpha });
  return Math.pow(kStar, alpha) * Math.pow(h, 1 - alpha);
}

/**
 * Compute the steady-state output gap between current state and national benchmark
 * Used for ranking states by growth potential
 */
export function outputGap({ stateParams, benchmarkParams }) {
  const stateY = steadyStateOutput(stateParams);
  const benchmarkY = steadyStateOutput(benchmarkParams);
  return {
    stateY: Math.round(stateY * 100) / 100,
    benchmarkY: Math.round(benchmarkY * 100) / 100,
    gapPct: Math.round((benchmarkY - stateY) / benchmarkY * 100 * 10) / 10,
    yearsToClose50Pct: convergenceHalfLife(stateParams)
  };
}

// Pre-computed KaTeX formula strings for rendering
export const FORMULAS = {
  solow_production: 'Y = K^\\alpha (AL)^{1-\\alpha}',
  solow_steady_state: 'k^* = \\left(\\frac{s}{n+g+\\delta}\\right)^{\\frac{1}{1-\\alpha}}',
  solow_output: 'y^* = \\left(\\frac{s}{n+g+\\delta}\\right)^{\\frac{\\alpha}{1-\\alpha}}',
  convergence_speed: '\\lambda = (1-\\alpha)(n+g+\\delta)',
  half_life: 't_{1/2} = \\frac{\\ln 2}{\\lambda}',
  endogenous_growth: 'g = \\frac{\\dot{A}}{A} = \\delta \\cdot L_A',
  debt_stability: '\\frac{d}{dt}\\left(\\frac{B}{Y}\\right) = (r-g)\\frac{B}{Y} - s_t',
  required_surplus: 's_t > (r-g)\\cdot\\frac{B}{Y}',
  human_capital: 'y^* = A \\cdot (k^*)^\\alpha \\cdot h^{1-\\alpha}',
  delta_output: '\\Delta y^* = \\frac{\\alpha}{1-\\alpha}\\Delta s - \\frac{1}{1-\\alpha}\\Delta(n+g+\\delta)',
  effective_wage: 'w_{eff} = w_{nom} - \\frac{H_{cost}}{L} \\cdot \\phi',
  rnd_growth: 'g = \\delta \\cdot \\frac{R\\&D_{exp}}{w_A \\cdot L}'
};
