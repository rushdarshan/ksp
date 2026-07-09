---
title: feat: Crime Genome — VeriPol Weight Modulator, Solvability Index, Dark Figure Layer
type: feat
status: active
date: 2026-07-01
origin: docs/ideation/2026-07-01-crime-genome-improvements-ideation.md
deepened: 2026-07-01
---

# Crime Genome — VeriPol Weight Modulator, Solvability Index, Dark Figure Layer

## Overview

Build 3 features on top of the existing Crime Genome platform. All deterministic (no QuickML training dependency), toggleable via config flags, and wired into all 3 dashboards.

---

## Problem Frame

The Crime Genome platform has 4 analytical features (Veracity, Topology, Victim Risk, GBV) but lacks:
- Self-correction for fabricated FIRs distorting downstream analytics (veracity-weighted pipeline)
- Case triage intelligence (which FIRs are solvable vs. dead ends)
- Underreporting awareness (latent crime invisible to patrol data)

These 3 features close the loop: VeriPol weight makes the system self-correcting, Solvability Index turns every FIR into an operational decision, Dark Figure Layer surfaces what the data doesn't show.

---

## Requirements Trace

### Configuration (R1)

- R1. VeriPol weight must be toggleable via config flag, defaulting off

### Backend API Contracts (R2, R3, R4)

- R2. Topology nodes, hotspot predictions, and victim risk scoring must accept an optional `?weightByVeracity=true` query param (affects node sizes and FIR counts, not edge weights — see U2)
- R3. Solvability Index must compute a 0-100 score from 6 FIR features and display on FIR detail view
- R4. Dark Figure Layer must estimate actual vs. reported crime per district and expose `GET /dark-figure?district=X`

### Infrastructure Constraints (R5)

- R5. All 3 features must stay within Catalyst constraints (30s timeout, 300-row limit, no PostGIS)

### Frontend & Navigation (R6)

- R6. Solvability Index and Dark Figure Layer must appear in Dashboard, InspectorDash, SubInspectorDash Crime Genome sidebar sections. VeriPol Weight Modulator is backend-toggle only (config flag + query param), no sidebar entry.

---

## Scope Boundaries

- No QuickML model training — all models are deterministic scoring formulas. QuickML upgrade path deferred.
- No real Azim Premji survey integration — static embedded district profiles for demo purposes
- No VeriPol weight propagation to GBV Analytics (out of scope for this pass)
- No changes to existing FIR data pipeline or schema migrations
- VeriPol scoring is English-only. Kannada and other Indian-language FIRs produce `languageNotSupported: true` and are skipped from weighted computations. All synthetic demo data is English.
- No frontend toggle for VeriPol Weight Modulator — backend-only via config flag + query param. Weighting status displayed via `weighted: true` response flag.

### Deferred to Follow-Up Work

- Multi-language VeriPol support (translated feature extraction for Kannada, Hindi, etc.)
- QuickML training pipeline for Solvability Index (requires labeled historical data)
- Real survey data ingestion for Dark Figure Layer
- Frontend toggle UI for VeriPol Weight Modulator (settings panel or per-component switch)
- FIR Variant Surveillance, Crime Black Box, Station-in-a-Box (separate future plans)

---

## Context & Research

### Relevant Code and Patterns

- **Catalyst Function pattern**: `functions/veracity_index/index.js` (Express + `catalyst.initialize()` + ZCQL + try/catch Data Store fallback + `module.exports = app`). All new functions follow this exactly.
- **QuickML SDK usage**: `functions/quickml_predict/index.js:35` — `catalystApp.quickML().predict('model_name', features)`. Solvability Index uses this pattern when a QuickML model exists; falls back to deterministic formula.
- **Config pattern**: All existing functions hardcode parameters inline. New global config file `functions/shared/config.js` for the `weightByVeracity` flag.
- **Frontend routing**: `client/src/App.jsx` — HashRouter with 3 dashboard groups (`/dashboard`, `/inspector`, `/subinspector`). Each feature needs 3 route entries + 3 sidebar links.
- **Sidebar pattern**: `client/src/Components/{Dashboard,InspectorDash,SubInspectorDash}/Components/SideBar Section/Sidebar.jsx` — Crime Genome `<div className="menuDiv">` section with `NavLink` entries.
- **FIR detail view**: `client/src/Components/FirDetails/DetailedFir.jsx` — renders `data[0]` key-value pairs. Solvability badge renders as an additional component below the table.
- **VeriPol scoring algorithm**: `functions/veracity_index/index.js:11-89` — `analyzeFIR()` with 14 linguistic markers. Weight modulator reuses this score.

### Institutional Learnings

- (see ideation doc `docs/ideation/2026-07-01-crime-genome-improvements-ideation.md`) — implementation sketches in Ranked Survivors #1 (VeriPol Weight Modulator), #5 (Solvability Index), #3 (Dark Figure Layer)

### External References

- VeriPol paper (Quijano-Sánchez et al. 2018) — Ridge Logistic Regression for fabricated report detection. Existing `veracity_index` already implements this approach with linguistic markers.

---

## Key Technical Decisions

- **Deterministic formulas over QuickML**: All 3 features use formulas computable within 30s without a trained model. QuickML upgrade path is documented but not required for v1. This avoids dependency on Catalyst console model training.
- **Config precedence**: Query param `?weightByVeracity=true` overrides config flag when present. Config flag is fallback when param absent. Both absent = existing behavior (default). All VeriPol thresholds centralized in config.js.
- **AppSail batch pre-computation instead of per-request FIR scoring**: VeriPol weighting requires scoring every FIR narrative. Instead of fetching 300+ individual FIR rows at query time (hits Data Store 300-row limit and 30s timeout), a nightly AppSail Python job runs `analyzeFIR()` on all narratives and stores per-FIR veracity scores in a `FirVeracity` Data Store table. Weighted queries read precomputed scores via GROUP BY aggregation — stays within 300-row limit. U2/U3/U4 modified accordingly. The `analyzeFIR()` function itself is extracted from `veracity_index/index.js` into `functions/shared/analyzer.js` for reuse across veracity_index (imported), the batch job, and any downstream consumers.
- **VeriPol weight scoped to node sizes only (not edge weights)**: The topology navigator uses a static criminology-derived transition matrix that cannot be recomputed from individual FIR data (no perpetrator-linking pipeline exists). `?weightByVeracity=true` adjusts node sizes (crime type counts scaled by mean veracity) but leaves edge weights (transition probabilities) unchanged. A `weighted: true` metadata flag indicates active weighting.
- **Kannada narrative detection**: `analyzeFIR()` in shared/analyzer.js includes script-detection logic. If narrative is not Latin-script, returns `{ veracityScore: null, languageNotSupported: true }`. Weighted queries skip non-Latin FIRs with a `skippedLanguage: 'Kannada'` counter in response metadata. UI displays: "VeriPol scoring limited to English FIRs (demo constraint)." All synthetic demo data is English.
- **Embedded district data**: Dark Figure Layer embeds district demographics as a static JS object — no Data Store dependency, works offline, under 50 lines. Estimates shown as ranges (±35% uncertainty band for 2019→2026 gap) rather than single numbers.
- **VeriPol weight as query param**: `?weightByVeracity=true` on existing endpoints (`/topology`, `/predict`, `/score/:victimId`). No changes to response shape — weighted results return the same schema with `weighted: true` metadata flag.

**Rejected — shared file via relative require**: Catalyst deploys each function target independently. `require('../shared/config')` may fail if Catalyst CLI packages only the individual function directory. Instead, config flag is duplicated inline per function with a `require()` from an AppSail-deployed shared package, or set via Catalyst App Property (`catalystApp.appProperty()`). The shared `analyzer.js` is the only extracted module, deployed with an AppSail Python job and consumed via HTTP.

---

## Implementation Units

- U1. **[Extract analyzeFIR() to shared module + batch veracity precomputation]**

**Goal:** Shared `analyzeFIR()` function callable from any module. Precomputed per-FIR veracity scores in Data Store for fast weighted queries. Config flag + threshold constants centralized.

**Requirements:** R1, R2

**Dependencies:** None

**Files:**
- Create: `functions/shared/analyzer.js` — extracted `analyzeFIR()` + `detectScript()` helper
- Create: `functions/shared/package.json`
- Modify: `functions/veracity_index/index.js` — import `analyzeFIR` from shared instead of inline
- Create: `appsail/batch_veracity/Dockerfile` or `appsail/batch_veracity/main.py` — nightly batch that reads all FIRs, runs `analyzeFIR()`, writes to `FirVeracity` Data Store table

**Approach:**
- `shared/analyzer.js` exports `{ analyzeFIR, detectScript, VERACITY_CONFIG }`:
  - `analyzeFIR()` — exact same 14-marker logic moved from `veracity_index/index.js`. No behavioral change.
  - `detectScript(text)` — returns `'latin'`, `'kannada'`, or `'other'` using Unicode block ranges. Kannada returns `{ veracityScore: null, languageNotSupported: true }`.
  - `VERACITY_CONFIG` — `{ WEIGHT_BY_VERACITY_DEFAULT: false, HOTSPOT_MIN: 0.3, VICTIM_MIN: 0.2 }` — single source for thresholds. Thresholds differ: hotspot uses 0.3 (higher bar for spatial prediction), victim risk uses 0.2 (even partially credible FIRs signal exposure to harm).
- `veracity_index/index.js`: remove inline `analyzeFIR()`, import from `../shared/analyzer`. No behavioral change to `/analyze` endpoint.
- Batch job (`appsail/batch_veracity/`): Python script that connects to Catalyst Data Store via REST API, iterates FIRs in pages, calls `analyzeFIR()` on each narrative, writes `{ FIRNo, FIRYear, VeracityScore, Language }` to `FirVeracity` table. Runs nightly via Job Scheduling.

**Patterns to follow:**
- `functions/veracity_index/index.js:11-89` — source of extracted `analyzeFIR()` code
- `functions/veracity_index/index.js:104-148` — existing POST handler imports from shared after extraction

**Test scenarios:**
- Happy path: `analyzeFIR()` produces identical output before and after extraction
- Happy path: `detectScript('ಇದು ಕನ್ನಡ ಪಠ್ಯ')` returns `'kannada'`
- Happy path: `detectScript('This is English text')` returns `'latin'`
- Edge case: empty/mixed script text defaults to `'other'`
- Edge case: Kannada narrative returns `{ veracityScore: null, languageNotSupported: true }` instead of 0.5 fallback
- Config: `VERACITY_CONFIG.HOTSPOT_MIN` is 0.3 and `VERACITY_CONFIG.VICTIM_MIN` is 0.2

**Verification:**
- `require('../shared/analyzer').analyzeFIR(mockNarrative)` returns same result as before extraction
- Known Kannada string returns languageNotSupported flag
- Veracity_index `/analyze` endpoint continues to work unchanged

---

- U2. **[Modify topology_navigator to weight node sizes by veracity]**

**Goal:** Topology endpoint optionally adjusts crime-type node sizes by mean veracity score. Edge weights (static transition matrix) unchanged.

**Requirements:** R2

**Dependencies:** U1

**Files:**
- Modify: `functions/topology_navigator/index.js`
- Test: `functions/topology_navigator/test.js`

**Approach:**
- Accept `?weightByVeracity=true` query param
- When true: query precomputed scores from `FirVeracity` table (GROUP BY CrimeHeadID, AVG(VeracityScore)), multiply crime counts by mean veracity per crime type for node sizing. Edge weights remain from static TRANSITION_MATRIX.
- When false or absent: existing behavior unchanged (raw GROUP BY count from CaseMaster)
- Metadata field `weighted: true` in response
- Kannada FIRs (veracityScore = null) excluded from mean calculation, counted in `skippedLanguageCount`

**Patterns to follow:**
- Existing `GET /topology` at `topology_navigator/index.js:45` — query param pattern, Data Store fallback

**Test scenarios:**
- Happy path: `GET /topology` (no param) returns existing behavior with `weighted: false`
- Happy path: `GET /topology?weightByVeracity=true` returns same node/edge shape with adjusted node sizes and `weighted: true`
- Edge case: `FirVeracity` table query fails — falls back to existing GROUP BY with `weighted: false` and warning log
- Edge case: all FIRs are Kannada (no veracity scores) — node sizes unchanged, `skippedLanguageCount` in metadata
- Edge case: uniform veracity (all 1.0) — node sizes identical to unweighted version

**Verification:**
- Existing topology response shape preserved when param absent
- `weighted: true` flag present only when param active
- Node sizes differ between weighted and unweighted when veracity varies by crime type

---

- U3. **[Modify quickml_predict hotspot endpoint to accept weightByVeracity]**

**Goal:** Hotspot predictions optionally filter district-level FIR counts by veracity threshold when `weightByVeracity=true`.

**Requirements:** R2

**Dependencies:** U1

**Files:**
- Modify: `functions/quickml_predict/index.js`
- Test: `functions/quickml_predict/test.js`

**Approach:**
- Accept `?weightByVeracity=true` query param
- When true: before generating prediction features, query aggregate from `FirVeracity` table: `SELECT CrimeHeadID, AVG(VeracityScore) FROM FirVeracity WHERE DistrictID = X GROUP BY CrimeHeadID`. Scale the per-crime-type risk baseline by the mean veracity (lower veracity → lower risk contribution). Risk values remain in [0,1] range after rescaling.
- When false: existing behavior unchanged (random feature vectors + QuickML model)
- Threshold: `VERACITY_CONFIG.HOTSPOT_MIN = 0.3` from shared/analyzer.js. Crime types with mean veracity below threshold contribute 0 to risk baseline.
- Backward compatibility: weighted mode returns same shape. New `metadata.weighted: true` and `metadata.veracityFilteredCrimeTypes: []` fields.

**Patterns to follow:**
- `quickml_predict/index.js:34-43` — QuickML fallback to Data Store query pattern (modified for precomputed scores table)

**Test scenarios:**
- Happy path: `GET /predict` (no param) returns existing hotspot format
- Happy path: `GET /predict?weightByVeracity=true` returns adjusted risk values with `weighted: true`
- Edge case: all crime types below threshold — returns uniform low risk (0.1) with `veracityFilteredCrimeTypes` listing all types
- Edge case: `FirVeracity` table unavailable — gracefully degrades to unweighted prediction with `weighted: false`

**Verification:**
- Existing response shape preserved when param absent
- Weighted request shows different risk distribution and metadata flags

---

- U4. **[Modify victim_risk_shield to accept weightByVeracity]**

**Goal:** Victim risk scoring optionally excludes FIRs with veracity < 0.2 from repeat victim counts.

**Requirements:** R2

**Dependencies:** U1

**Files:**
- Modify: `functions/victim_risk_shield/index.js`
- Test: `functions/victim_risk_shield/test.js`

**Approach:**
- Accept `?weightByVeracity=true` query param
- When true: for the victim's FIRs, fetch precomputed scores from `FirVeracity` table (JOIN on FIRNo/FIRYear). Exclude FIRs with veracity < 0.2 from repeat count, escalation rate, and factor calculations. If `FirVeracity` has no record for a given FIR (e.g., Kannada), include it but note in factors.
- When false: existing behavior unchanged (COUNT from Victim table, ZCQL JOIN)

**Patterns to follow:**
- `victim_risk_shield/index.js:7-137` — existing victim scoring logic with ZCQL JOIN pattern (modified to JOIN `FirVeracity` instead of raw `Victim` GROUP BY)

**Test scenarios:**
- Happy path: `GET /score/:victimId` (no param) returns existing risk score
- Happy path: `GET /score/:victimId?weightByVeracity=true` returns adjusted (potentially lower) risk score
- Edge case: all FIRs below threshold — returns risk score of 5 (Low) with factor "All FIRs below veracity threshold"
- Edge case: `FirVeracity` table unavailable — gracefully degrades to unweighted score
- Integration: high-risk victim with all verifiable FIRs shows same score regardless of weight param

**Verification:**
- Existing response preserved when param absent
- Weighted response includes `factors` mentioning veracity filtering

---

- U5. **[Build Solvability Index function and endpoint]**

**Goal:** New Catalyst Function exposing `POST /solvability` — accepts FIR fields, returns 0-100 solvability score with factor breakdown and display on FIR detail view.

**Requirements:** R3

**Dependencies:** None (standalone scoring function)

**Files:**
- Create: `functions/solvability_index/index.js`
- Create: `functions/solvability_index/package.json`
- Create: `client/src/Components/SolvabilityBadge.jsx`
- Modify: `client/src/Components/FirDetails/DetailedFir.jsx`

**Approach:**
- Scoring formula (6 features, each contributes 0-20 points capped at 100):
  - **Evidence types present** (0-20): physical, forensic, cctv, witness, digital — +4 each, max 20
  - **Time-to-report delay** (0-20): <24h=20, 24-72h=15, 3-7d=10, 7-30d=5, >30d=0
  - **MO specificity** (0-15): keyword count from narrative matching known MO patterns (modus operandi taxonomy built into function)
  - **District clearance rate** (0-15): hardcoded per-district rate lookup, 0-15 scaled proportionally
  - **Witness count** (0-15): 0=0, 1=5, 2=10, 3+=15
  - **Suspect identified flag** (0-15): 15 if suspect named/identified, 0 if unknown
- Formula is heuristic — UI displays uncertainty band: ±15 for scores 20-80, ±5 for scores <20 or >80
- Request body schema: `{ narrative, firNo, firYear, districtId, evidenceTypes: string[], delayHours: number, witnessCount: number, suspectIdentified: boolean }` — populated from FIR data in DetailedFir view
- Response: `{ solvabilityScore, uncertaintyBand: ±N, factors: [{name, score, max}] }`
- `package.json` — Express + zcatalyst-sdk-node
- `SolvabilityBadge.jsx` — Loading state: skeleton bar matching gauge dimensions + spinner. Error state: inline message box "Analysis unavailable" with retry button. Success: score gauge (0-100) with colored bar (red <40, yellow 40-70, green >70), text label alongside color (for color-blind accessibility), factor breakdown list. Score displayed as "72 ± 15" format.
- Solvability is accessible only from FIR detail view (DetailedFir). No sidebar route — the badge renders below the FIR data table automatically. No separate route needed.
- API calls use `/server/solvability_index/solvability` pattern (matching existing Crime Genome panels, not VITE_API_URL)

**Patterns to follow:**
- `functions/veracity_index/index.js` — scoring function + POST handler pattern
- `client/src/Components/VeracityPanel.jsx` — score gauge visualization (color-coded) — but add text label for accessibility
- Existing Crime Genome panels use `/server/{function_name}/{route}` hardcoded paths

**Test scenarios:**
- Happy path: FIR with CCTV evidence, <24h report, suspect named, 3 witnesses returns score >= 70
- Happy path: FIR with no evidence, >30d delay, no suspect, 0 witnesses returns score <= 20
- Edge case: missing optional fields — function defaults to 0 for that factor
- Edge case: all fields empty — returns 0 with all factors at 0
- Edge case: negative or nonsensical values (negative delay) — clamped to nearest valid range
- UI loading: SolvabilityBadge renders skeleton while POST is in-flight
- UI error: SolvabilityBadge shows retry button on 500 response
- Integration: DetailedFir renders SolvabilityBadge beneath FIR data table

**Verification:**
- `POST /solvability` returns expected shape `{ solvabilityScore, uncertaintyBand, factors, firNo }`
- SolvabilityBadge renders on DetailedFir with correct score, color, and text label

---

- U6. **[Build Dark Figure Layer function and endpoint]**

**Goal:** New Catalyst Function exposing `GET /dark-figure` with optional `?district=X` query param, returns estimated crime gap for all or one district with uncertainty bands.

**Requirements:** R4

**Dependencies:** None

**Files:**
- Create: `functions/dark_figure/index.js`
- Create: `functions/dark_figure/package.json`
- Create: `client/src/Components/DarkFigurePanel.jsx`

**Approach:**
- Static district profile data embedded as constant (20 districts, ~5 fields each: literacy rate, urban ratio, police per capita, 2019 survey underreporting rate per crime type)
- Time-decay: since 2019 survey data is 7 years old (2026), estimated values include ±35% uncertainty band. Displayed as range, not single number.
- Formula per district per crime type:
  ```
  estimatedTotal = firCount / (1 - underreportingRate)
  lowerBound = estimatedTotal * 0.65
  upperBound = estimatedTotal * 1.35
  gap = estimatedTotal - firCount
  ```
- `GET /dark-figure` — returns all 20 districts (aggregate query: `SELECT DistrictID, COUNT(*) FROM CaseMaster GROUP BY DistrictID` — safe within 300 rows)
- `GET /dark-figure?district=1` — returns single district
- Response: `{ districtId, firCounts: { theft, assault, ... }, estimatedTotals: { ... estimated, lowerBound, upperBound }, gaps: { ... }, dataYear: 2019, recommendation }`
- Recommendation field uses rule: `gapPercent > 50 ? 'Community outreach needed' : 'Standard monitoring'` — but always prefixed with "Based on 2019 projections:"
- `package.json` — Express + zcatalyst-sdk-node
- `DarkFigurePanel.jsx` —
  - Loading state: skeleton bars + spinner for the entire panel
  - Error state: inline error banner with retry button; district selector remains functional
  - Content hierarchy (top to bottom):
    1. Summary header: total estimated vs reported gap across all displayed districts
    2. District selector dropdown (default: first district)
    3. Comparison bars: per crime type, actual (solid) vs estimated range (hatched, showing lowerBound–upperBound). Ordered by gap size descending (largest gap first). Top 5 crime types by gap, "Show all" expand.
    4. Recommendation callout: orange/red banner for "Community outreach needed", gray/green for "Standard monitoring". Positioned above bars + below district selector.
    5. Data year footnote: "Underreporting estimates based on Karnataka Crime Victimisation Survey 2019"
- API calls use `/server/dark_figure/dark-figure` pattern (matching existing panels)
- Routes: `/dashboard/dark-figure`, `/inspector/dark-figure`, `/subinspector/dark-figure`

**Patterns to follow:**
- `functions/gbv_analytics/index.js` — analytics endpoint with static resource data pattern
- `client/src/Components/GbvPanel.jsx` — stats overview + resource list pattern (for summary header)

**Test scenarios:**
- Happy path: `GET /dark-figure` returns array of 20 district entries with all required fields (estimatedTotals includes lowerBound, upperBound)
- Happy path: `GET /dark-figure?district=3` returns single district
- Edge case: nonexistent district ID — returns empty entry with `{ districtId, error: 'No data' }`
- Edge case: FIR count data unavailable — uses Data Store fallback with uniform counts
- UI loading: DarkFigurePanel shows skeleton bars while GET is in-flight
- UI error: DarkFigurePanel shows retry button on 500; district selector dropdown remains usable
- Integration: district selector change re-fetches and re-renders bars/stats

**Verification:**
- Endpoints return correct shapes with uncertainty bounds
- DarkFigurePanel renders with correct loading → content or error transitions

---

- U7. **[Wire frontend — routes, sidebar links, catalyst targets]**

**Goal:** Dark Figure Layer accessible from all 3 dashboards sidebar. SolvabilityBadge auto-renders in FIR detail view. catalyst.json lists all 11 function targets.

**Requirements:** R6

**Dependencies:** U5, U6

**Files:**
- Modify: `catalyst.json`
- Modify: `client/src/App.jsx`
- Modify: `client/src/Components/Dashboard/Components/SideBar Section/Sidebar.jsx`
- Modify: `client/src/Components/InspectorDash/Components/SideBar Section/Sidebar.jsx`
- Modify: `client/src/Components/SubInspectorDash/Components/SideBar Section/Sidebar.jsx`
- Modify: `client/src/Components/FirDetails/DetailedFir.jsx`

**Approach:**
- `catalyst.json` targets: add `solvability_index` and `dark_figure` to the targets array (total: 11). This is the ONLY edit to catalyst.json — U5/U6 no longer list it.
- `App.jsx`: Add 3 route blocks (dashboard, inspector, subinspector) for:
  - `dark-figure` → `<DarkFigurePanel/>`
  - (SolvabilityIndex has no route — renders directly in DetailedFir)
- Sidebar files: In the Crime Genome `<div className="menuDiv">`, add 1 `<li>` entry:
  - "Dark Figure Layer" → `dark-figure` (relative path)
  - Icon: `FaEye` (imported from `react-icons/fa`)
  - (Solvability Index has no sidebar entry — it's part of FIR detail view)
  - Order: append at end of Crime Genome section: Veracity → Topology → Victim Risk → Solvability Index → GBV → Dark Figure Layer (no sidebar entry for Solvability, but the order in the section reads: Veracity, Topology, Victim Risk, GBV, Dark Figure)
- `DetailedFir.jsx`: Import and render `<SolvabilityBadge>` beneath the FIR data table, passing the FIR data object. Use the same FIR data already fetched via `useFetchData`. Badge auto-fetches score on mount.
- Accessibility: All new sidebar links must have `aria-current="page"` for active state and `focus-visible` outlines (existing pattern in sidebar files uses NavLink's built-in isActive — verify it produces visible focus). SolvabilityBadge score gauge includes `role="meter"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, plus text label alongside color. District selector in DarkFigurePanel must be keyboard-operable with `aria-live="polite"` for dynamic content updates. Touch targets minimum 44×44px for sidebar items.

**Patterns to follow:**
- `client/src/App.jsx:214-229` — existing Veracity/Topology/Victim/GBV route entries (cloned for Dark Figure)
- Sidebar files: Crime Genome `<li>` entries at lines 184-226 (append at end)
- Existing NavLink `isActive` class pattern for `aria-current` (NavLink provides this automatically)

**Test scenarios:**
- Integration: navigating to `/dashboard/dark-figure` renders DarkFigurePanel
- Integration: clicking "Dark Figure Layer" sidebar link navigates to `/dashboard/dark-figure` (or `/inspector/dark-figure`, `/subinspector/dark-figure`)
- Integration: opening a FIR detail view (`/dashboard/firdetails/:FirNo/:FirYear`) shows SolvabilityBadge beneath the table
- Integration: `npm run build` succeeds (baseline 1374 modules, acceptable increase)
- Accessibility: SolvabilityBadge rendered with `role="meter"` and `aria-valuenow` — verified via DOM inspection

**Verification:**
- `catalyst.json` has 11 targets, build succeeds, all sidebar links render and navigate correctly

---

- U8. **[Post-build verification]**

**Goal:** Confirm build succeeds and all features are accessible.

**Requirements:** R1-R6

**Dependencies:** U7

**Files:**
- None (verification only)

**Approach:**
- Run `npm run build` in client/
- Spot-check: all 3 dashboards show Crime Genome section with 6 items (Veracity, Topology, Victim Risk, GBV, Solvability Index, Dark Figure Layer)
- Verify endpoints return expected shapes

**Test scenarios:**
- Build succeeds with no errors
- All 6 Crime Genome sidebar links navigate correctly (manual spot-check)

**Verification:**
- `npm run build` exit code 0
- No console errors in route resolution

---

## System-Wide Impact

- **Interaction graph**: `shared/analyzer.js` is imported by `veracity_index` (existing) and the AppSail batch job (new). No circular dependencies. Existing `topology_navigator`, `quickml_predict`, `victim_risk_shield` query precomputed scores from `FirVeracity` Data Store table — no direct dependency on `analyzer.js` at request time.
- **Error propagation**: All new and modified endpoints follow existing try/catch pattern. Weighted modes gracefully degrade to unweighted when `FirVeracity` table is unavailable. Scoring failures return `{ error }` with 500 status, frontend shows "Analysis unavailable" fallback with retry button.
- **State lifecycle risks**: No write operations from request handlers. `FirVeracity` table written by nightly AppSail batch job — stale-data window of up to 24h. SSR (stale score risk) acceptable for demo.
- **Unchanged invariants**: Existing endpoint response shapes preserved when `?weightByVeracity` param absent. Config flag defaults to `false`. GBV Analytics, Legal RAG, Zia Voice, Alerts, and FIR API functions untouched.
- **Kannada FIRs**: System-wide, any FIR with non-Latin narrative produces `veracityScore: null` with `languageNotSupported: true`. Weighted queries skip these FIRs. This is a demo limitation — true multi-language VeriPol would require translated feature extraction, deferred to future work.
- **300-row limit avoidance**: All weighted queries use precomputed `FirVeracity` table with GROUP BY aggregation — never fetch individual FIR rows at request time. Aggregate queries return 1 row per crime type per district (≤12 rows per query) — well within the 300-row limit.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| VeriPol weighting on Kannada FIRs produces null scores — silent no-op across all 3 weighted features | `detectScript()` and explicit `languageNotSupported: true` flag; UI displays "VeriPol limited to English FIRs (demo constraint)" |
| Solvability Index requires FIR narrative text which may not be present in all Data Store rows | Accept narrative as request body field; if absent, score with available fields and note "missing narrative" factor |
| Dark Figure Layer uses 7-year-old 2019 survey data | ±35% uncertainty band on all estimates. Year of data displayed prominently in each estimate. Recommendation text prefixed "Based on 2019 projections:" |
| Sidebar import path errors (Component vs Components) | Follow exact pattern from existing sidebar files — same casing, same relative paths |
| Catalyst deploy may not preserve `require('../shared/analyzer')` path | Shared module deployed via AppSail, consumed via HTTP. `veracity_index` imports analyzer inline but will need deployment verification |
| Solvability Index heuristic formula not validated against local data | UI displays uncertainty band ±15 and label "Heuristic score — not validated against local data" |
| `FirVeracity` table may not exist on first deploy (before batch job runs) | All weighted queries have fallback to unweighted when table doesn't exist; endpoint responds with `weighted: false` and warning log |

---

## Documentation / Operational Notes

- Add `npm run build` verification before any catalyst deploy
- All 3 features are read-only — no write permissions needed (except AppSail batch job writing to `FirVeracity` table)
- **Deployment order**: (1) Deploy `shared/analyzer.js` with the AppSail batch job, (2) run batch job to populate `FirVeracity` table, (3) deploy `veracity_index` (updated import), (4) deploy modified `topology_navigator`, `quickml_predict`, `victim_risk_shield`, (5) deploy new `solvability_index` and `dark_figure`, (6) deploy updated client build
- **Pre-deployment verification**: Deploy one new function target (e.g., `solvability_index` with a `/ping` health route) to Catalyst staging and confirm `/server/solvability_index/ping` returns 200 before deploying full features
- `FirVeracity` table schema (Data Store): `{ FIRNo (Text), FIRYear (Number), VeracityScore (Double), Language (Text), ScoredAt (DateTime) }`. Batch job truncates and rewrites nightly.
- Existing `functions/` are independent npm packages. The `shared/` modules are deployed via AppSail; request-time functions communicate via HTTP to the batch job, not direct require.

---

## Sources & References

- **Origin document:** `docs/ideation/2026-07-01-crime-genome-improvements-ideation.md`
- **VeriPol prior art:** Quijano-Sánchez et al. 2018 — False complaint detection via Ridge Logistic Regression
- **Catalyst SDK reference:** `functions/alert_job/node_modules/zcatalyst-sdk-node/lib/quickml/index.js`
