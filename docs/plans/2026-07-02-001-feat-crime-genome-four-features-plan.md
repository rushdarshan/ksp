---
title: feat: Crime Genome — CounterCrime, Temporal Topology, FIR Quality, Fairness Audit
type: feat
status: active
date: 2026-07-02
origin: docs/brainstorms/2026-07-01-datathon-research-master-list.md
---

# feat: Crime Genome — CounterCrime, Temporal Topology, FIR Quality, Fairness Audit

## Overview

Add 4 features to the Crime Genome platform for KSP Datathon 2026: CounterCrime Simulator (what-if crime simulation), Temporal Crime Genome (time-travel topology), FIR Quality Score (10-dimension FIR completeness scoring), and Fairness Audit Dashboard (demographic parity + equal opportunity metrics).

All deterministic or heuristic-based. CounterCrime uses hardcoded correlation weights from existing district data. No QuickML dependencies.

---

## Problem Frame

The Crime Genome platform already reads FIR signatures across 7 layers (veracity, topology, victim risk, GBV, solvability, dark figure, weighted analysis). Judges at KSP Datathon evaluate innovation (25%), feasibility (20%), scalability (20%), impact (20%), and presentation (15%). The current platform answers "what is happening" and "what will happen" but not "what should we do about it" — CounterCrime fills that gap. Temporal topology adds a time dimension that no competing platform shows. FIR Quality Score adds data-integrity value. Fairness Audit addresses emerging AI ethics regulations.

---

## Requirements Trace

- R1. CounterCrime: POST endpoint accepting district + what-if params, returning predicted crime deltas with uncertainty
- R2. CounterCrime: React slider panel for interactively adjusting patrol budget, literacy, police per capita, streetlight coverage
- R3. Temporal Crime Genome: Extend topology_navigator with `?month=` returning monthly transition matrix
- R4. Temporal Crime Genome: Time-slider UI on TopologyPanel re-rendering the canvas per month
- R5. FIR Quality Score: 10-dimension scoring (witness, evidence, time precision, location, accused description, narrative coherence, property valuation, legal section match, delay justification, officer notes)
- R6. FIR Quality Score: Badge on FIR detail + dashboard panel listing lowest-quality FIRs
- R7. Fairness Audit: Demographic parity + equal opportunity metrics for XGBoost hotspot, Solvability Index, Victim Risk Shield
- R8. Fairness Audit: Per-district and per-demographic breakdowns, arXiv 1703.00056 citation in tooltip

---

## Scope Boundaries

- CounterCrime uses deterministic correlation weights, not ML predictions. Weights are hardcoded from existing synthetic district correlations.
- Temporal topology uses hardcoded monthly transition matrices (12 months × 12×12 matrix = 1728 values). Not computed dynamically from FIR dates — that would require monthly ZCQL queries hitting 300-row limits.
- FIR Quality Score is a heuristic (like Solvability Index). Not an ML classifier. The 10 dimensions are rule-based.
- Fairness Audit uses district as the demographic grouping dimension. No per-FIR demographic attributes (age/gender/caste) exist in our synthetic data — district is the only available grouping.
- No new Data Store tables. All features use existing tables + hardcoded synthetic data + deterministic computation.
- No AppSail services. All features run within 30s Function timeout.

### Deferred to Follow-Up Work

- CounterCrime with real correlation training from actual district crime data
- Temporal topology with live monthly aggregation from FIR dates (needs >300 FIRs per month for stable matrices)
- FIR Quality Score with per-district calibration
- Fairness Audit with per-officer or per-demographic breakdowns (needs data)

---

## Context & Research

### Relevant Code and Patterns

- `functions/shared/analyzer.js` — shared module pattern. FIR Quality Score should create `functions/shared/quality_score.js` following this exact structure.
- `functions/dark_figure/index.js` — `DISTRICT_PROFILES` object (lines 7-28) with 20 districts containing literacyRate, urbanRatio, policePerCapita. CounterCrime extends this with patrolBudget, streetlightCoverage, unemploymentRate.
- `functions/solvability_index/index.js` — `computeSolvability()` returns `{ score, uncertaintyBand, factors: [{ name, score, max }] }`. FIR Quality Score returns identical shape so `SolvabilityBadge.jsx` can be reused directly.
- `client/src/Components/SolvabilityBadge.jsx` — renders `{ score ± uncertainty }` bar + factor breakdown `<details>`. Reusable for FIR Quality Score with zero modification.
- `client/src/Components/VeracityPanel.jsx` — form panel with preset buttons, grid input layout, loading state, result card. Template for CounterCrimePanel.
- `client/src/Components/TopologyPanel.jsx` — canvas-based circular graph layout. Time-slider component overlays this canvas.
- `functions/topology_navigator/index.js` — existing `?districtId=` and `?weightByVeracity=true` query param pattern (line 49-50). `?month=` follows the same.
- `client/src/App.jsx` — all 3 dashboards repeat the same 14 child routes. Each new feature adds 3 route entries (one per dashboard).
- `client/src/Components/Dashboard/Components/SideBar Section/Sidebar.jsx`, `client/src/Components/InspectorDash/Components/SideBar Section/Sidebar.jsx`, `client/src/Components/SubInspectorDash/Components/SideBar Section/Sidebar.jsx` — all 3 identical except home route path. Each new feature adds 3 sidebar entries.
- `catalyst.json` — 11 function targets. Each new backend function adds a target here.
- `CRIME_FAMILIES` in `functions/topology_navigator/index.js` — 12 crime types with IDs `theft`–`publicorder`. All crime-type references reuse this list exactly.

### Institutional Learnings

All 11 existing functions follow: Express app → `catalyst.initialize(req)` inside handler → `try/catch` → synthetic fallback on Data Store failure. Every function must follow this pattern. FIR Quality Score and CounterCrime data queries must fall back to synthetic data when Data Store tables don't exist (standard pattern observed in all functions).

### External References

- arXiv 1703.00056 — "Equality of Opportunity in Supervised Learning" (Hardt et al.) — cited in Fairness Audit UI tooltip per R8

---

## Key Technical Decisions

- **Deterministic heuristics over ML**: All 4 features use deterministic formulas or heuristic scoring. No QuickML dependency at all. CounterCrime weights are hardcoded from existing district data correlations.
- **Hardcoded monthly matrices**: 12 monthly transition matrices stored as a JS lookup object rather than computed dynamically. Avoids Data Store query limits and keeps function under 30s timeout.
- **District as demographic grouping**: Fairness Audit uses district as the protected attribute dimension. This is available in our data and demonstrates the metric correctly even without per-person demographics.
- **6 of 10 FIR quality dimensions from existing data**: Witness statements, evidence cited, time precision, location specificity, accused description, delay justification all map to fields in existing FIR schema. Narrative coherence reuses VeriPol linguistics. Property valuation, legal section match, officer notes completeness are computed from field presence.
- **Three-sidebar repetition**: Each of the 3 dashboards has an independent Sidebar.jsx. All 3 get the same new links. No shared sidebar component — not worth the refactor for a datathon.
- **No new npm dependencies**: All icons come from `react-icons` (already installed). No charting library added — Fairness Audit uses CSS bar charts (same pattern as other panels).

---

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

### Shared architecture per feature

```
Function Endpoint (Express) → Pure computation function → JSON response
                                                     ↕ (import shared module where applicable)
React Component → fetch() → render meter/bars/sliders → Route in App.jsx → Sidebar link
```

### CounterCrime simulation formula (directional)

```js
// Simplified correlation model — not actual implementation
function simulate(params) {
  const { districtId, patrolBudget, literacyRate, policePerCapita, streetlightCoverage } = params;
  const deltas = {};
  for (const crimeType of CRIME_TYPES) {
    const delta =
      ((patrolBudget - baseline.patrolBudget) * WEIGHTS[crimeType].patrol) +
      ((literacyRate - baseline.literacyRate) * WEIGHTS[crimeType].literacy) +
      ((policePerCapita - baseline.policePerCapita) * WEIGHTS[crimeType].police) +
      ((streetlightCoverage - baseline.streetlightCoverage) * WEIGHTS[crimeType].streetlight);
    deltas[crimeType] = { delta: +delta.toFixed(1), direction: delta >= 0 ? 'increase' : 'decrease' };
  }
  return { districtId, baseline, deltas, recommendation };
}
```

### Monthly transition matrix shape

```js
const MONTHLY_MATRICES = {
  '2025-01': { theft: { burglary: 0.30, robbery: 0.20, ... }, ... },
  '2025-02': { theft: { burglary: 0.25, robbery: 0.22, ... }, ... },
  // 12 months total — matrix values vary by ±20% from baseline TRANSITION_MATRIX
};
```

---

## Implementation Units

- U1. **CounterCrime backend**

**Goal:** Simulation formula + POST endpoint with district profile, uncertainty ranges, and hardcoded correlation weights

**Requirements:** R1

**Dependencies:** None

**Files:**
- Create: `functions/countercrime/index.js`
- Create: `functions/countercrime/package.json` (depends on `zcatalyst-sdk-node`)
- Modify: `catalyst.json` (add `countercrime` to targets)

**Approach:**
- Create `functions/countercrime/index.js` following the Express pattern from `functions/dark_figure/index.js`
- Extend the `DISTRICT_PROFILES` pattern with 3 new synthetic fields per district: `patrolBudget` (derived from policePerCapita), `streetlightCoverage` (0.3-0.9 per district), `unemploymentRate` (0.04-0.20 per district)
- Define correlation weights as a hardcoded object: `{ theft: { patrol: -0.4, literacy: -0.3, police: -0.35, streetlight: -0.25 }, robbery: { ... }, ... }` — negative correlation means "increase this factor → crime decreases"
- POST `/countercrime/simulate` accepts `{ districtId, patrolBudget, literacyRate, policePerCapita, streetlightCoverage }` — all optional, defaults to current district baseline
- Return `{ districtId, districtName, baseline: {...}, deltas: { crimeType: { delta, direction, percentChange } }, recommendation: string, note: 'Estimated based on demographic correlations — not causal' }`
- Include `±15%` uncertainty band on all deltas (matching dark figure pattern)
- Include a `presetScenarios` GET endpoint (`/countercrime/presets`) returning 3 pre-baked what-if scenarios for the demo

**Patterns to follow:**
- `functions/dark_figure/index.js` — `computeDarkFigure()` pure function pattern
- `functions/solvability_index/index.js` — Express `POST /solvability` handler pattern
- `DISTRICT_PROFILES` from `functions/dark_figure/index.js` — district data shape

**Test scenarios:**
- Happy path: POST valid params for district 3 → returns deltas, recommendation, baseline. Verify max negative delta is on the crime type most correlated with the changed factor.
- Edge case: POST with no params (all defaults) → returns zero deltas, unchanged baseline
- Edge case: POST districtId that doesn't exist (e.g., 99) → returns error with `district not found`
- Edge case: POST out-of-range slider value (negative patrol budget) → clamp to valid range
- Error: POST with no body → returns 400 with validation error
- Integration: GET `/countercrime/presets` returns 3 entries with `{ label, params, description }` shape

**Verification:**
- npm run build succeeds with countercrime target in catalyst.json
- `/server/countercrime/simulate` returns 200 with correct response shape
- Frontend can call endpoint and render results

---

- U2. **CounterCrime frontend**

**Goal:** CounterCrimePanel.jsx with 4 `<input type="range">` sliders, district selector, preset buttons, and results display

**Requirements:** R2

**Dependencies:** U1

**Files:**
- Create: `client/src/Components/CounterCrimePanel.jsx`
- Modify: `client/src/App.jsx` (add 3 routes: `/dashboard/countercrime`, `/inspector/countercrime`, `/subinspector/countercrime`)
- Modify: `client/src/Components/Dashboard/Components/SideBar Section/Sidebar.jsx` (add CounterCrime link under CRIME GENOME)
- Modify: `client/src/Components/InspectorDash/Components/SideBar Section/Sidebar.jsx` (same)
- Modify: `client/src/Components/SubInspectorDash/Components/SideBar Section/Sidebar.jsx` (same)

**Approach:**
- District selector (`<select>` populated from DISTRICT_PROFILES names, passed as hardcoded list)
- 4 `<input type="range">` sliders: patrol budget (±50% from baseline), literacy rate (0-100%), police per capita (±50%), streetlight coverage (0-100%)
- Preset buttons row: "Increase patrols 20%", "Improve literacy 10%", "All interventions combined"
- "Show baseline" toggle — when on, sliders show current district values
- On submit: POST to `/server/countercrime/simulate` with current slider values
- Results section: per-crime-type delta display with colored bars (green = decrease, red = increase) + overall recommendation
- Loading/error states matching VeracityPanel pattern

**Patterns to follow:**
- `client/src/Components/VeracityPanel.jsx` — form layout, preset buttons, loading state, result card
- `client/src/Components/SolvabilityBadge.jsx` — color thresholds for scores

**Test scenarios:**
- Happy path: select district 3, adjust sliders, submit → sees per-crime deltas and recommendation
- Edge case: submit without changing defaults → "No change from baseline" message
- Edge case: district with no profile → district selector shows "No data available"
- Loading: spinner while POST is in flight
- Error: endpoint returns 500 → error message with retry button

**Verification:**
- Panel renders in all 3 dashboards at `/countercrime`
- Sidebar link visible in all 3 roles
- npm run build succeeds

---

- U3. **Temporal topology backend**

**Goal:** Extend topology_navigator with monthly transition matrices + `?month=` query parameter

**Requirements:** R3

**Dependencies:** None (modifies existing function, doesn't break existing behavior)

**Files:**
- Modify: `functions/topology_navigator/index.js`

**Approach:**
- Add `MONTHLY_MATRICES` constant — an object keyed by `YYYY-MM` (12 entries, 2025-01 through 2025-12)
- Each entry is a full 12×12 transition matrix with values varied ±20% from the existing baseline `TRANSITION_MATRIX`. For example, if baseline `theft→burglary` is 0.28, January might be 0.31 and June might be 0.22.
- Pattern: months 1-4 = higher property crime transitions (festival season), months 6-9 = higher public order/assault (summer), months 10-12 = higher theft/fraud (holiday)
- Add line ~50: `const month = req.query.month || null;`
- When `month` param is provided: use `MONTHLY_MATRICES[month]` instead of `TRANSITION_MATRIX` for all operations (FSC computation, edge generation, node sizing)
- When `month` is null or not found: fall back to `TRANSITION_MATRIX` (backward compatible)
- Include `MONTHLY_MATRICES` only when `month` param is present in the SELECT queries — the fallback data path is unchanged
- Return `month` in the metadata response when temporal mode is active
- Add GET `/topology/months` endpoint returning list of available months: `['2025-01', ..., '2025-12']`

**Patterns to follow:**
- Existing `req.query.districtId` and `req.query.weightByVeracity` pattern at line 49-50 of topology_navigator/index.js
- Existing `TRANSITION_MATRIX` structure for MONTHLY_MATRICES

**Test scenarios:**
- Happy path: GET `/topology?month=2025-06` → returns nodes + edges computed from June matrix. FSC values differ from baseline.
- Edge case: GET `/topology?month=invalid` → falls back to baseline matrix, month not in metadata
- Edge case: GET `/topology` (no month) → baseline behavior identical to current
- Integration: GET `/topology/months` returns 12 entries with YYYY-MM format
- Backward compat: all existing features (districtId, weightByVeracity) still work with or without month param

**Verification:**
- npm run build succeeds
- Existing topology panel loads without breaking
- `/server/topology_navigator/topology?month=2025-06` returns different edges than baseline

---

- U4. **Temporal topology frontend**

**Goal:** Time-slider UI on TopologyPanel that re-fetches topology data per month and re-renders the canvas

**Requirements:** R4

**Dependencies:** U3

**Files:**
- Modify: `client/src/Components/TopologyPanel.jsx`

**Approach:**
- Add a `<div>` above the canvas area with an `<input type="range">` slider min=0 max=11 step=1, plus month label display
- Fetch available months list from `/server/topology_navigator/topology/months` on mount
- When slider value changes: refetch `/server/topology_navigator/topology?month={months[value]}`
- Re-render canvas with new data (the existing `useEffect` on `data` already handles this)
- Add transition edge color logic: compare current month's matrix to baseline. Edges with probability > baseline are rendered in red `#ef4444`, edges with probability < baseline in blue `#3b82f6`, unchanged in existing `#334155`. Store baseline in a ref or hardcoded constant.
- Add a "vs baseline" toggle that switches between absolute mode (show current month's edges) and diff mode (show color-coded increases/decreases)
- Loading state while fetching per-month data
- The existing `selectedNode` and detail panel work unchanged with temporal data

**Patterns to follow:**
- Existing canvas render pipeline in TopologyPanel.jsx — don't change the render function, only the data input
- VeracityPanel loading/error states

**Test scenarios:**
- Happy path: load panel → slider defaults to month 0 (January) → canvas renders → slide to June → canvas re-renders with different edges and node sizes
- Edge case: slider at max → last available month renders correctly
- Edge case: re-fetch fails → canvas shows previous month's data with stale indicator
- Loading: spinner during month fetch

**Verification:**
- TopologyPanel canvas re-renders when slider changes
- Color-coded edges visible when "vs baseline" toggle is on
- no breakage of existing topology functionality

---

- U5. **FIR quality backend**

**Goal:** Shared quality_score.js module + POST `/fir-quality` endpoint returning 10-dimension score

**Requirements:** R5

**Dependencies:** None

**Files:**
- Create: `functions/shared/quality_score.js`
- Create: `functions/fir_quality/index.js`
- Create: `functions/fir_quality/package.json` (depends on `zcatalyst-sdk-node`)
- Modify: `catalyst.json` (add `fir_quality` to targets)

**Approach:**
- Create `functions/shared/quality_score.js` exporting:
  - `QUALITY_DIMENSIONS` array: `[{ id, name, max, description }]` for all 10 dimensions
  - `computeQualityScore(firData)` → `{ qualityScore, dimensions: [{ name, score, max }], flags: [], details: {...} }`
- 10 dimensions and their heuristics:
  1. `witnessStatements` (max 10): score = witness count × 3, capped at 10
  2. `evidenceCited` (max 10): score = evidence types × 2, capped at 10
  3. `timePrecision` (max 10): score = temporal markers from VeriPol analysis × 2 (reuse `detectScript`/`analyzeFIR` linguistic details), capped at 10
  4. `locationSpecificity` (max 10): score = mentions of specific locations (road names, landmarks, area names) — regex match against known Bangalore area names or generic location indicators, capped at 10
  5. `accusedDescription` (max 10): score = accusedCount > 0 ? (mentions of physical description, vehicle details, name, or identifier) × 3 : 0, capped at 10
  6. `narrativeCoherence` (max 10): score = normalized VeriPol linguistics score × 10 (reuse VeriPol's linguistic markers — past tense ratio, sensory details, temporal anchoring)
  7. `propertyValuation` (max 10): score = propertyValue > 0 ? (propertyValue > 100000 && narrative length > 50 ? 10 : 7) : 0
  8. `legalSectionMatch` (max 10): score = IPC/BNS section numbers mentioned in narrative match the FIR's crime head — check for keyword overlap between narrative and CRIME_FAMILIES keywords
  9. `delayJustification` (max 10): if delayReason is present and length > 10, score = 10; if delayReason present but short, score = 5; if no delay, score = 10 (no delay needed); else score = 0
  10. `officerNotesCompleteness` (max 10): score = officer notes section present and length > 20 ? 10 : length > 5 ? 5 : 0 — but since our synthetic data may not have this field, default to 7 (synthetic medium quality)
- `computeQualityScore` is a pure function — no Data Store calls
- Create `functions/fir_quality/index.js` with:
  - POST `/fir-quality` — accepts `{ firId, firNo, narrative, evidenceTypes, witnessCount, propertyValue, delayReason, accusedCount, accusedDescription, crimeType }`, returns quality score + 10 dimension breakdown
  - GET `/fir-quality/lowest` — returns top 10 lowest-quality FIRs from synthetic data (hardcoded list of 10 FIRs with varying quality scores for demo)
  - GET `/fir-quality/crime-types` — returns average quality score per crime type (computed from synthetic data)

**Patterns to follow:**
- `functions/shared/analyzer.js` — shared module with pure functions
- `functions/solvability_index/index.js` — `computeSolvability()` shape: `{ score, uncertaintyBand, factors: [{ name, score, max }] }`
- Return shape matches SolvabilityBadge's expected props exactly

**Test scenarios:**
- Happy path: POST FIR with complete data (witnesses, evidence, property, location) → qualityScore >= 70
- Happy path: POST FIR with minimal data → qualityScore < 30
- Edge case: POST with missing narrative → narrativeCoherence score = 0, total drops accordingly
- Edge case: POST FIR with Kannada script → narrativeCoherence scores null (language not supported), others still compute
- Error: POST with no body → 400 validation
- Integration: GET `/fir-quality/lowest` returns array of 10 entries with `{ firNo, qualityScore, topFlag }`
- Integration: GET `/fir-quality/crime-types` returns object keyed by crime type with `{ averageScore, count }`

**Verification:**
- npm run build succeeds with fir_quality target
- `/server/fir_quality/fir-quality` returns correct response shape
- Quality module can be imported and tested independently

---

- U6. **FIR quality frontend**

**Goal:** Reuse SolvabilityBadge for quality score in FIR detail view + create FirQualityPanel dashboard panel

**Requirements:** R6

**Dependencies:** U5

**Files:**
- Modify: `client/src/Components/FirDetails/DetailedFir.jsx` (add QualityBadge below existing SolvabilityBadge)
- Create: `client/src/Components/FirQualityPanel.jsx`
- Modify: `client/src/App.jsx` (add 3 routes: `/dashboard/fir-quality`, `/inspector/fir-quality`, `/subinspector/fir-quality`)
- Modify: `client/src/Components/Dashboard/Components/SideBar Section/Sidebar.jsx` (add FIR Quality link)
- Modify: `client/src/Components/InspectorDash/Components/SideBar Section/Sidebar.jsx` (same)
- Modify: `client/src/Components/SubInspectorDash/Components/SideBar Section/Sidebar.jsx` (same)

**Approach:**
- In `DetailedFir.jsx`: after the existing `<SolvabilityBadge>` component (around line where FIR data is displayed), add a new `<QualityBadge>` component that imports the same pure display pattern. `QualityBadge` POSTs to `/server/fir_quality/fir-quality` with FIR data and renders the response using the same meter-bar + factor breakdown pattern.
- Create `client/src/Components/FirQualityPanel.jsx`:
  - On mount, fetch `/server/fir_quality/fir-quality/lowest` → display a table of lowest-quality FIRs
  - Each row: FIR number (linked to `/firdetails/:FirNo/:FirYear`), quality score (color-coded bar), top flag
  - Below the table: fetch `/server/fir_quality/fir-quality/crime-types` → render quality score per crime type as horizontal bar chart (CSS only, no charting library)
  - Same loading/error patterns as other panels
- Add the `FaFileAlt` icon import from `react-icons/fa` (already installed) for sidebar link

**Patterns to follow:**
- `client/src/Components/SolvabilityBadge.jsx` — meter-bar pattern, factor breakdown
- `client/src/Components/DarkFigurePanel.jsx` — district listing + crime-type breakdown layout

**Test scenarios:**
- Happy path: FIR detail page → quality badge renders with 10 dimensions + total score
- Happy path: FIR Quality panel → table of 10 FIRs + per-crime-type chart renders
- Edge case: FIR with no narrative → quality badge shows 0 for narrative coherence dimension
- Loading: spinner while fetching quality data
- Error: endpoint fails → error card with retry button

**Verification:**
- Quality badge renders below SolvabilityBadge in DetailedFir.jsx
- FIR Quality panel renders in all 3 dashboards at `/fir-quality`
- Sidebar link visible in all 3 roles
- npm run build succeeds

---

- U7. **Fairness audit backend**

**Goal:** GET endpoint computing demographic parity + equal opportunity metrics for 3 models per district

**Requirements:** R7, R8

**Dependencies:** None (uses existing model endpoints, no new ML)

**Files:**
- Create: `functions/fairness_audit/index.js`
- Create: `functions/fairness_audit/package.json` (depends on `zcatalyst-sdk-node`)
- Modify: `catalyst.json` (add `fairness_audit` to targets)

**Approach:**
- Create 3 synthetic prediction datasets (one per "model") — each is a hardcoded array of `{ districtId, crimeType, predicted, actual }` objects covering all 20 districts × 12 crime types
  - XGBoost hotspot: predictions sampled around 0.6-0.9 accuracy (best model)
  - Solvability Index: predictions sampled around 0.5-0.8 accuracy (moderate)
  - Victim Risk Shield: predictions sampled around 0.4-0.7 accuracy (worst — risk scoring is inherently less precise)
- For each model, compute per-district:
  - **Demographic parity ratio** = P(Ŷ=1 | district A) / P(Ŷ=1 | district B) — compare each district to the district with the lowest positive prediction rate. Ratio close to 1.0 = fair. Lower = more disparity.
  - **Equal opportunity difference** = TPR(district) - TPR(highest TPR district) — compare true positive rate difference. 0 = fair. Negative = district has lower opportunity.
- GET `/fairness-audit/models` — returns list of model names: `['xgb_hotspot', 'solvability_index', 'victim_risk_shield']`
- GET `/fairness-audit/metrics?model=xgb_hotspot` — returns per-district metrics:
  ```
  { model, metrics: [{ districtId, districtName, demographicParityRatio, equalOpportunityDiff, positiveRate, truePositiveRate, sampleCount }] }
  ```
- GET `/fairness-audit/summary` — returns overall fairness score per model (average demographic parity ratio across all districts):
  ```
  [{ model, avgDemographicParityRatio, minParityRatio, avgEqualOpportunityDiff, fairnessRating: 'good'|'moderate'|'concern' }]
  ```
- Cache synthetic prediction data as a module-level constant (same pattern as DISTRICT_PROFILES)
- Include `note: 'Metrics computed on synthetic prediction data for demonstration. Real deployment requires demographic data collection.'` in responses

**Patterns to follow:**
- `functions/quickml_predict/index.js` — model prediction pattern
- `functions/dark_figure/index.js` — per-district computation pattern

**Test scenarios:**
- Happy path: GET `/fairness-audit/models` → array of 3 model names
- Happy path: GET `/fairness-audit/metrics?model=xgb_hotspot` → 20 entries with demographicParityRatio and equalOpportunityDiff per district
- Happy path: GET `/fairness-audit/summary` → 3 entries with fairnessRating
- Edge case: GET `/fairness-audit/metrics?model=nonexistent` → returns 400 with supported models list
- Edge case: GET `/fairness-audit/metrics` (no model param) → returns all models' metrics
- Integration: xgb_hotspot has the best fairness scores (highest avg parity ratio), victim_risk_shield has the worst

**Verification:**
- All 3 endpoints return correct shapes
- npm run build succeeds with fairness_audit target

---

- U8. **Fairness audit frontend**

**Goal:** FairnessAuditPanel.jsx with per-model selector, per-district metrics table, overall fairness score, and arXiv citation tooltip

**Requirements:** R8

**Dependencies:** U7

**Files:**
- Create: `client/src/Components/FairnessAuditPanel.jsx`
- Modify: `client/src/App.jsx` (add 3 routes: `/dashboard/fairness-audit`, `/inspector/fairness-audit`, `/subinspector/fairness-audit`)
- Modify: `client/src/Components/Dashboard/Components/SideBar Section/Sidebar.jsx` (add Fairness Audit link)
- Modify: `client/src/Components/InspectorDash/Components/SideBar Section/Sidebar.jsx` (same)
- Modify: `client/src/Components/SubInspectorDash/Components/SideBar Section/Sidebar.jsx` (same)

**Approach:**
- Model selector (`<select>` populated from GET `/fairness-audit/models`)
- On mount AND model change: fetch GET `/fairness-audit/metrics?model={selected}`
- Summary cards at top: overall fairness rating (color-coded badge: green "Good" / yellow "Moderate" / red "Concern"), average demographic parity ratio, average equal opportunity difference
- Per-district table below: 20 rows with columns — District Name, Demographic Parity Ratio (bar), Equal Opportunity Diff (bar), Sample Count
- Bars colored green (ratio ≥ 0.9), yellow (0.7-0.9), red (< 0.7)
- Tooltip on the "Demographic Parity" column header: "Based on Demographic Parity (arXiv 1703.00056). Ratio close to 1.0 = prediction rates are similar across districts."
- Tooltip on the "Equal Opportunity" column header: "Based on Equal Opportunity (arXiv 1703.00056). Difference close to 0 = true positive rates are similar across districts."
- Below the table, a small card explaining: "Note: Metrics computed on synthetic prediction data. Real deployment requires demographic data collection and legal approval under applicable AI regulations."
- Loading/error states matching other panels

**Patterns to follow:**
- `client/src/Components/DarkFigurePanel.jsx` — per-district breakdown layout, selectors
- `client/src/Components/SolvabilityBadge.jsx` — color-coded meter bars
- CSS-only bars (no charting library)

**Test scenarios:**
- Happy path: load panel → model defaults to xgb_hotspot → summary cards + 20-row district table render
- Happy path: switch model to victim_risk_shield → metrics update (lower fairness scores)
- Edge case: API returns 500 → error message with retry
- Hover: tooltip on column headers shows arXiv 1703.00056 citation
- Loading: spinner during data fetch

**Verification:**
- Panel renders in all 3 dashboards at `/fairness-audit`
- Sidebar link visible in all 3 roles
- npm run build succeeds

---

- U9. **Build verification and cross-feature integration**

**Goal:** Ensure all 4 features build, all routes resolve, all sidebars render

**Requirements:** R1–R8

**Dependencies:** U2, U4, U6, U8

**Files:**
- No file changes — verification only

**Approach:**
- Run `npm run build` (from `KSP-Dashboard-Datathon/client/`) and confirm exit 0
- Verify catalyst.json has 14 targets (existing 11 + countercrime, fir_quality, fairness_audit)
- Verify each feature's route renders without 404: `/dashboard/countercrime`, `/dashboard/fir-quality`, `/dashboard/fairness-audit` (and inspector/subinspector variants)
- Verify sidebar links appear in all 3 sidebars
- Quick manual check: TopologyPanel monthly matrices don't crash the canvas render

**Verification:**
- `npm run build` exits 0
- All 14 function targets in catalyst.json
- All 3 dashboards have working links for all 4 new features

---

## System-Wide Impact

- **Interaction graph:** No new callbacks, middleware, or observers. CounterCrime and FIR Quality endpoints are standalone POST handlers. Temporal topology extends existing topology_navigator GET handler. Fairness Audit is a standalone GET handler.
- **Error propagation:** All new endpoints follow the existing `try/catch → res.status(500)` pattern. No cross-feature error chains — features are independent.
- **State lifecycle risks:** No state mutation. All features are stateless computations. No cache invalidation, no partial writes, no duplicate concerns.
- **API surface parity:** topology_navigator `?month=` param is additive and backward compatible. All existing clients continue working unchanged.
- **Unchanged invariants:** All existing 11 functions, all existing 14 dashboard routes, all existing sidebar links, all existing React components remain untouched.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Monthly transition matrices are manually authored (1728 values) and may contain inconsistencies (rows not summing to 1.0) | Each matrix row auto-normalized in code to sum to 1.0 at computation time. Validation script in comments. |
| Fairness Audit synthetic data may not demonstrate meaningful disparity (all districts look fair) | Intentionally sample predictions with higher variance for lower-literacy districts. victim_risk_shield model has built-in disparity to demonstrate the tool works. |
| 10 FIR quality dimensions include `officerNotesCompleteness` which doesn't exist in our synthetic data | Default to 7/10 with a note. All other 9 dimensions computed from available fields. |
| npm run build may hit chunk size warning from 4 new components | Acceptable — pre-existing warning. Not a blocker for datathon deployment. |
| 3 sidebars × 3 features (CounterCrime, FIR Quality, Fairness Audit) = 9 sidebar edits. Temporal topology has no sidebar. Missing any one breaks that dashboard's navigation. | Each sidebar edit follows the same 5-line pattern. Verify all 3 after edits. |

---

## Documentation / Operational Notes

- No operational notes — features are demo-only for datathon, not production deployment.
- CounterCrime uses hardcoded correlation weights. A production version would derive weights from real district crime data regression.
- Fairness Audit metrics are demonstrative. A real deployment would need demographic data collection approval and compliance with IT Act / DPDP Act.

---

## Sources & References

- **Origin document:** `docs/brainstorms/2026-07-01-datathon-research-master-list.md`
- Related code: `functions/dark_figure/index.js` — DISTRICT_PROFILES pattern
- Related code: `functions/solvability_index/index.js` — factor breakdown shape
- Related code: `functions/topology_navigator/index.js` — query param pattern
- External: arXiv 1703.00056 — "Equality of Opportunity in Supervised Learning"
