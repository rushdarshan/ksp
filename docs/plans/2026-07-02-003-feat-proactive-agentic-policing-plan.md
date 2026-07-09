---
title: feat: Proactive Agentic Policing
type: feat
status: active
date: 2026-07-02
origin: docs/plans/2026-07-02-002-feat-direction-plans-agentic-case-court-plan.md
---

# Proactive Agentic Policing

## Overview

A proactive alerting system that monitors the FIR data stream and acts on detected patterns without requiring a dashboard query. Three behaviors: FIR-triggered cross-check (when a FIR is created, auto-find linked cases and store alert), daily intelligence brief (scheduled summary per district), and anomaly-triggered case starter (when Z-score anomaly exceeds threshold, auto-collect related FIRs).

This is the closest to "agentic AI" this competition spec can achieve with Catalyst IN DC constraints — Functions triggered by HTTP (U2) and cron (U3/U4) rather than a running agent loop, but the user-facing behavior is identical: the system acts, no human queried.

---

## Problem Frame

Police officers today manually search for linked cases when investigating a new FIR. There is no autonomous system that cross-references MO patterns, flags repeat offenders, or alerts officers proactively. The open-data portal has dashboards (this project already has 14 features), but zero autonomous agents. This feature changes the paradigm from "officer queries the system" to "system alerts the officer."

---

## Requirements Trace

- R1. FIR-triggered cross-check: when a FIR is registered, auto-query linked cases by crime type, location, and FIR date proximity; compute relevance score; store alert visible to assigned officer
- R2. Daily intelligence brief: scheduled daily summary per district — daily FIR counts vs 30-day avg, notable topology shifts, repeat offender flags — delivered as a viewable report
- R3. Anomaly-triggered case starter: when existing alert_job Z-score exceeds threshold × 1.5, auto-collect related FIRs and generate investigation starter pack stored as structured data
- R4. Agent activity feed: frontend panel showing agent actions (cross-checks run, alerts sent, briefs generated) with timestamps

---

## Scope Boundaries

- Only the FIR-triggered cross-check runs in real-time (inline with FIR creation). Daily brief and case starter are cron-based.
- Cross-check uses heuristic similarity (crime type match + location proximity + name overlap) — NOT QuickML embeddings. This is done purposefully: heuristic works within 30s timeout, is auditable, and doesn't require training data generation.
- Alerts are stored in the existing Alerts Data Store table and displayed in the frontend agent panel — NOT pushed as push notifications (catalystApp.pushNotification() SDK exists but adds complexity for no demo benefit — the demo screen shows alerts).
- No multi-user auth beyond what already exists — the agent panel is visible to inspector/subinspector roles per existing routing.
- **The cross-check is called from the frontend** after FIR creation POST succeeds (AddFir.jsx handleSubmit). The `/addfir` endpoint is not in this repo — it's a Catalyst console-level or external endpoint, so inline backend hooking is not possible.
- **AddFir.jsx** must also be modified to call `POST /agentic/cross-check/:firId` (or `/demo` variant in non-production) after FIR creation, then navigate to Agent Panel route or show a persistent toast with "View Results" link.
- **Demo-mode fallback**: `POST /agentic/cross-check/:firId/demo` returns synthetic linked FIR results when real results are empty. Frontend uses this endpoint in dev/demo environments so the agent panel never shows an empty cross-check on the demo screen.

### Deferred to Follow-Up Work
- Real-time Signals-based event trigger when Catalyst IN DC supports it (currently blocked)
- Push notification delivery (Zia Notifications) — same reason, no demo benefit over in-app alerts

---

## Context & Research

### Relevant Code and Patterns

| Pattern | File |
|---------|------|
| **Cron job (no Express)** | `functions/alert_job/index.js` — async handler, ZCQL queries, writes to Alerts table |
| **Express Function boilerplate** | `functions/case_management/index.js` — Express init, routes, error handling |
| **ZCQL query + Data Store insert** | `functions/alert_job/index.js` — SELECT with GROUP BY, INSERT into Alerts table |
| **Shared utility module** | `functions/shared/analyzer.js` — `require('../shared/...')` pattern |
| **Frontend panel pattern** | `client/src/Components/CaseManagementPanel.jsx` — panel-box layout, apiUrl usage, useState/useEffect |
| **Sidebar + route integration** | `client/src/Components/Dashboard/Components/SideBar Section/Sidebar.jsx` + `client/src/App.jsx` |
| **Frontend FIR creation** | `client/src/Components/FirDetails/AddFir.jsx` — POST to `/addfir` |
| **Catalyst config** | `catalyst.json` — target list + client hosting |

### Key Findings

- **No Signals implementation exists** — the project aspires to event-driven triggers but Catalyst IN DC blocks Circuits. All async behavior uses cron polling or inline calls.
- **alert_job is the cron pattern** — exports `async (req, res)` without Express, uses ZCQL to query CaseMaster + Victim tables, inserts into Alerts table. Runs on schedule.
- **Alerts table is the notification mechanism** — written by alert_job, displayed in AlertsFeed.jsx frontend component. This is the existing alert pipeline to extend.
- **FIR creation flow** — Frontend POSTs to `${apiUrl}/addfir`. No AddFir function visible in repo — likely handled by Catalyst console-level config or a separate deployed function.
- **AppSail exists** (`appsail/network_analysis/`, `appsail/batch_veracity/`) — Python Flask containers for heavier processing, but not needed for this feature (all logic fits within 30s Function timeout).

### Institutional Learnings

- 30s Function timeout is the hard limit — any batch processing that exceeds this must use AppSail Docker or split into multiple function invocations
- Data Store 300-row fetch limit applies — queries that return more rows need pagination or aggregation in ZCQL
- Express functions mount at root `/`, routes are service-specific — no base path prefix pattern

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Inline cross-check** (cron-less) | FIR-triggered cross-check runs inline when FIR is created — either called from frontend after POST success, or as a second function chain. Polling cron would miss the real-time demo moment. Signals are blocked in IN DC. |
| **Heuristic similarity, not QuickML** | QuickML embedding requires training data generation, console training runs, and adds failure surface. Heuristic (same CrimeHeadID + same DistrictID + date proximity) is deterministic, auditable, works within 30s, and matches existing pattern (veracity_index heuristics). Accused name overlap dimension added only if Accused table exists in Data Store. |
| **Reuse Alerts table** | Existing Alerts table already has Title, Description, DistrictID, Severity, Type, CreatedAt columns. Adding a new `AGENT_ACTION` Type extends it without schema change. No new table needed. |
| **Store daily brief as Data Store row** | A daily brief is a JSON document stored as a single row in Alerts table with Type=`DAILY_BRIEF`. Simple, no schema migration, immediately queryable. |
| **No push notifications** | The demo happens on a single screen. In-app alerts in the agent panel are more visible to judges than a notification toast. PushNotification SDK is unused and adds deployment risk. |

---

## Open Questions

### Deferred to Implementation

- ~~**Where does `/addfir` route to?** The frontend POSTs to `${apiUrl}/addfir` but no matching function directory exists. The cross-check needs to hook into or parallel the FIR creation flow.~~ **Resolved:** No inline handler exists. Cross-check is called from the frontend after FIR creation POST succeeds.
- **Exact ZCQL query for "linked cases"?** The similarity heuristic needs to query cases by CrimeHeadID and DistrictID. The exact ZCQL syntax depends on Data Store schema (case-insensitive matching, date range filtering). These details emerge during implementation. Accused name ZCQL queries only needed if Accused table exists.
- **Brief generation format** — plain text summary vs structured JSON. Both work. Decision deferred to implementation based on frontend rendering choice.

---

## Output Structure

New files only — no existing file deletions.

```
functions/
├── agentic_police/
│   ├── index.js
│   ├── package.json
├── daily_brief/
│   ├── index.js
│   └── package.json
├── shared/
│   └── cross_check.js          (similarity heuristic)

client/src/Components/
├── AgentPanel.jsx              (agent activity feed + daily brief viewer)

client/src/App.jsx               (modified — 1 route added in 3 dashboards)
client/src/Components/FirDetails/AddFir.jsx   (modified — cross-check call after FIR creation)
client/src/Components/Dashboard/Components/SideBar Section/
├── Sidebar.jsx                  (modified — 1 link added)
client/src/Components/InspectorDash/Components/SideBar Section/
├── Sidebar.jsx                  (modified — 1 link added)
client/src/Components/SubInspectorDash/Components/SideBar Section/
├── Sidebar.jsx                  (modified — 1 link added)
```

---

## Implementation Units

- U1. **Agent shared infrastructure — similarity heuristic + cross-check logic**

**Goal:** Build the core cross-check module that finds linked cases given a FIR — reusable by both inline and cron paths.

**Requirements:** R1

**Dependencies:** None

**Files:**
- Create: `functions/shared/cross_check.js`
- Create: `functions/agentic_police/package.json`
- Test: `functions/agentic_police/cross_check.test.js` (or inline adoption test)

**Approach:**
- Export `async function runCrossCheck(catalystApp, firId)` — takes initialized Catalyst SDK app and FIR ID, returns array of linked-case findings
- Matching dimensions (each adds to score):
   1. Same CrimeHeadID → +60 points
   2. Same DistrictID → +20 points
   3. Overlapping FIR date within 30 days → +10 points
   4. ~~Accused name overlap dimension — +30/+50 points if Accused table exists in Data Store~~ (verify during implementation; if absent, points redistributed to CrimeHeadID — see Risks)
- Total score capped at 100. Threshold for alert: ≥40 points.
- Each finding is an object: `{ linkedFirId, score, matchedDimensions: string[], firNo, crimeType, filedDate }`
- No QuickML, no external embeddings — pure ZCQL queries with JS scoring

**Patterns to follow:**
- `functions/shared/analyzer.js` — shared module pattern, `require('../shared/...')`
- ZCQL query pattern from `functions/alert_job/index.js`

**Test scenarios:**
- Happy path: FIR with same CrimeHeadID + same District → score ≥60, alert generated
- Edge: FIR only matches on DistrictID (no CrimeHeadID match) → score = 20, no alert (below 40 threshold)
- Edge: FIR is first in its district/crime type → no linked cases found, returns empty array
- Edge: Linked FIR exists but is >30 days old → gets partial score (same CrimeHeadID + same District = 80) but above threshold, alert still generated
- Edge: If Accused table exists, name overlap adds +30/+50 bonus — happy path can reach 100+

**Verification:**
- Unit tests pass for all matching dimensions
- Empty array returned when no linkage exists
- Score calculation is deterministic (same input = same output)

---

- U2. **FIR-triggered cross-check — inline agent endpoint**

**Goal:** Create the `agentic_police` function with a `POST /agentic/cross-check/:firId` endpoint that runs cross-check and stores alerts.

**Requirements:** R1

**Dependencies:** U1

**Files:**
- Create: `functions/agentic_police/index.js`
- Modify: `catalyst.json` — add `"agentic_police"` to targets

**Approach:**
- Standard Express function (same pattern as `case_management/index.js`)
- Route: `POST /agentic/cross-check/:firId` — accepts FIR ID, calls `runCrossCheck()`, inserts findings into Alerts table with Type=`AGENT_ACTION`
- Route: `GET /agentic/actions` — returns recent agent actions (Alerts table filtered by Types `AGENT_ACTION`, `DAILY_BRIEF`, `CASE_STARTER`, ordered by CreatedAt DESC) — no Type filter at all (return all agent-related types, frontend filters)
- Route: `GET /agentic/briefs` — returns DAILY_BRIEF type alerts ordered by CreatedAt DESC (for Latest Daily Brief section)
- Route: `POST /agentic/cross-check/:firId/demo` — same as above but seeds fake linked FIR data if result set is empty (demo-mode fallback so the panel never shows "no linked FIRs found" on the demo screen)
- Each alert stored: `{ Title: "Agent: Cross-check found linked FIR #N (72% match)", Description: "Matched on crime type, district", DistrictID, Severity: "Low"/"Medium"/"High" based on score, Type: "AGENT_ACTION", CreatedAt }`
- **AddFir.jsx modification**: After FIR creation POST succeeds, call `POST /agentic/cross-check/:firId` (or `/demo` variant if env is dev/demo), then navigate to AgentPanel route (`/inspector/agent-panel`) or show a persistent toast with a "View Results" link

**Patterns to follow:**
- `functions/case_management/index.js` — Express function boilerplate, route structure, error handling
- `functions/alert_job/index.js` — Data Store table insert pattern

**Test scenarios:**
- Integration: POST to `/agentic/cross-check/:firId` with valid FIR ID → returns success response with results array
- Integration: POST with invalid FIR ID → returns 500 or error
- Integration: GET `/agentic/actions` → returns array of recent agent actions (may be empty)
- Edge: FIR ID exists but has no linked cases → returns empty results, no alert inserted

**Verification:**
- Function deploys as catalyst target
- POST endpoint returns correct results for known inputs
- GET returns stored actions

---

- U3. **Daily intelligence brief — cron job**

**Goal:** A scheduled cron function that generates a daily intelligence brief per district and stores it as an alert.

**Requirements:** R2

**Dependencies:** None (independent of U1/U2)

**Files:**
- Create: `functions/daily_brief/index.js`
- Create: `functions/daily_brief/package.json`
- Modify: `catalyst.json` — add `"daily_brief"` to targets

**Approach:**
- Same pattern as `alert_job/index.js` — non-Express async handler, exports `async (req, res)`
- Additionally, expose as Express route with `GET /agentic/briefs/trigger?district=N` for manual demo invocation (cron runs in production; this route lets the judge trigger a brief on demand during the 5-min demo)
- Queries CaseMaster for FIR counts per district per crime type for:
  - Today (or last 24h)
  - Rolling 60-day average (hardcoded per district, same approach as alert_job's historicalBaselines but extended to 60 days for demo-visible data — 30-day avg is meaningless with compressed synthetic data)
- Computes per district:
  - Total today, total vs 60-day avg, percentage change
  - Top crime type today (by count)
  - Notable change flags: any crime type with >2x normal rate
- Stores one Alerts row per district with Type=`DAILY_BRIEF`:
  - Title: `"Daily Brief — District N"`
  - Description: `"Today: X FIRs (Y% vs 60-day avg). Top crime: Z. Notable: [list]"`
  - Additional data: JSON in Description or structured fields
- Also stores one aggregate row: `"Daily Brief — All Districts"` with summary across all 20 districts

**Patterns to follow:**
- `functions/alert_job/index.js` — cron job pattern, ZCQL aggregation, hardcoded baselines, Alerts table insert
- Hardcoded historicalBaselines approach (same district mean/stddev structure)

**Test scenarios:**
- Happy path: Function runs on a day with FIR data → generates N+1 alert rows (N districts + aggregate)
- Edge: No FIR data for last 24h → generates brief with "0 FIRs today" for all districts
- Edge: Single district has unusually high count (e.g., 5x normal) → flag appears in notable section
- Edge: Function runs twice in the same day → inserts duplicate rows (idempotency not required — frontend shows latest)

**Verification:**
- Function executes without error
- Alerts table contains rows with Type=`DAILY_BRIEF`
- Each district gets one row

---

- U4. **Anomaly-triggered case starter — extend alert_job**

**Goal:** When alert_job detects a Z-score >3.0 threshold (1.5× existing 2.0 threshold), additionally generate a "case starter" — collection of related FIRs for that district.

**Requirements:** R3

**Dependencies:** U1 (cross-check logic for collecting related FIRs)

**Files:**
- Modify: `functions/alert_job/index.js` — add case starter generation after anomaly detection

**Approach:**
- After alert_job computes Z-score anomalies, for any district with Z-score >3.0:
  1. Query CaseMaster for FIRs in that district from last 7 days
  2. For each FIR, run cross-check similarity against other FIRs in same district (reuse U1's heuristic via `require('../shared/cross_check')`)
  3. Collect all FIRs with cross-score ≥40 — these form the "case cluster"
  4. Store a new Alerts row with Type=`CASE_STARTER`:
     - Title: `"🚨 Case Starter: Crime cluster in District N (Z-score: X)"`
     - Description: `"Cluster of Y linked FIRs detected. Key pattern: [crime type dominance]. Recommended action: [auto-generated suggestion]"`
- No file move needed — cross_check.js was created in `functions/shared/` in U1. Both functions require `../shared/cross_check`

**Patterns to follow:**
- `functions/shared/analyzer.js` — shared module pattern, `require('../shared/...')` from both functions
- `functions/alert_job/index.js` — existing pattern to extend

**Test scenarios:**
- Happy path: Z-score >3.0 in District 5 → case starter alert created with linked FIR cluster
- Edge: No district exceeds Z-score >3.0 → no CASE_STARTER alerts created, normal flow continues
- Edge: District exceeds threshold but has only 1 FIR in 7 days → cluster is size 1, starter still generated
- Integration: After this unit, the agent panel shows CASE_STARTER type actions alongside regular AGENT_ACTION type

**Verification:**
- Extended alert_job produces CASE_STARTER alerts when anomalies exceed threshold
- CASE_STARTER alerts contain linked FIR references
- Existing alert_job behavior unchanged (all original alerts still generated)

---

- U5. **Agent activity panel — frontend**

**Goal:** A React panel showing agent actions: cross-check results, daily briefs, case starters. Routes into all 3 dashboards.

**Requirements:** R4

**Dependencies:** U2, U3

**Files:**
- Create: `client/src/Components/AgentPanel.jsx`
- Modify: `client/src/App.jsx` — add import + route in all 3 dashboards
- Modify: `client/src/Components/Dashboard/Components/SideBar Section/Sidebar.jsx` — add nav link
- Modify: `client/src/Components/InspectorDash/Components/SideBar Section/Sidebar.jsx`
- Modify: `client/src/Components/SubInspectorDash/Components/SideBar Section/Sidebar.jsx`
- Modify: `catalyst.json` — no change (frontend-only)

**Approach:**
- Fetches from `GET /agentic/actions` and `GET /agentic/briefs` (or filters Alerts by Type on frontend)
- **States per section**: loading spinner (initial fetch), error banner with retry button (fetch failure), empty state ("No agent activity yet. Agent runs automatically when FIRs are registered."), populated feed
- **Layout** (stacked vertical within standard panel-box):
   1. **Latest Daily Brief** (top) — most recent DAILY_BRIEF entry, expanded card with district-by-district breakdown as a scrollable list. If none exists, show "No daily brief yet" with a "Generate Now" button that hits `GET /agentic/briefs/trigger`
   2. **Agent Log** (bottom) — chronological timeline feed of all AGENT_ACTION and CASE_STARTER entries, each row with icon (lightning bolt for cross-check, file for brief, magnifying glass for starter), title, description, timestamp, severity badge (gray/amber/red)
- Refreshes automatically every 30 seconds (setInterval with cleanup in useEffect). Also refreshes after navigating from FIR creation cross-check to show results immediately.
- Styled as a timeline/feed within the standard panel-box layout

**Patterns to follow:**
- `client/src/Components/CaseManagementPanel.jsx` — panel-box layout, apiUrl usage, useState/useEffect, axios pattern
- Sidebar link pattern from existing feature links (use `NavLink` with `isActive/isPending`)

**Test scenarios:**
- Happy path: Agent actions exist in Alerts table → panel shows feed with entries
- Edge: No agent actions yet → panel shows empty state: "No agent activity yet. Agent runs automatically when FIRs are registered."
- UI: Daily brief district cards render correctly for each district in brief data
- UI: Severity badges color correctly (Low=gray, Medium=amber, High=red)

**Verification:**
- Panel renders in all 3 dashboards
- Page load fetches and displays agent actions
- Empty state renders correctly

---

## System-Wide Impact

- **Alerts table**: Three new Type values added: `AGENT_ACTION`, `DAILY_BRIEF`, and `CASE_STARTER`. Existing AlertsFeed component queries `SELECT * FROM Alerts` with no Type filter — these new types will render under the "Proactive Alerts" header alongside existing types. **No modification needed for the Agent Panel** (it has its own filter), but `fir_api/index.js` should add `WHERE Type NOT IN ('DAILY_BRIEF', 'CASE_STARTER')` to the AlertsFeed query so daily briefs and case starters don't appear as crime alerts.
- **alert_job**: Extended to produce CASE_STARTER alerts at Z-score >3.0. The original Z-score >2.0 alerts remain unchanged. The new threshold adds alerts without removing existing behavior.
- **FIR creation flow**: `AddFir.jsx` modified to call cross-check after FIR creation POST succeeds, then navigate to AgentPanel route. Demo-mode uses `/demo` variant to seed results if real data is empty.
- **Unchanged invariants**: All existing 14 features, routes, sidebar links, API endpoints, Data Store schema, and frontend components remain untouched.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `/addfir` endpoint not in repo — can't hook into FIR creation flow | Frontend calls cross-check as second call after FIR creation POST succeeds. Same user-visible behavior, one extra HTTP request. |
| ZCQL queries exceed 30s timeout | All queries are simple SELECT with COUNT/GROUP BY on indexed columns (DistrictID). alert_job already runs similar queries successfully. If timeout occurs, paginate or split into AppSail batch. |
| Accused table may not exist in Catalyst Data Store (no function queries it) | **Resolved in U1 scoring:** CrimeHeadID dimension increased to +60, name overlap dimension shown as strikethrough. Implementation verifies schema first; if Accused table exists, restore +30/+50 name overlap and reduce CrimeHeadID back to +40. |
| AppSail Python container not available for cron | No Python needed — all logic in Node.js Functions. Cron scheduling is configured in Catalyst console, not in code. |
| Empty cross-check results kill demo impact | Demo-mode endpoint (`POST /agentic/cross-check/:firId/demo`) seeds fake linked FIR data when real results are empty. Frontend uses `/demo` variant when `process.env.NODE_ENV !== 'production'` or based on query param. |
| Daily brief zero demo visibility (cron only) | Manual trigger route `GET /agentic/briefs/trigger?district=N` added so the judge can generate a brief on demand. AgentPanel "Generate Now" button calls this route. |
| 30-day rolling avg meaningless with compressed synthetic data | Changed to 60-day rolling average in U3. Synthetic data generation must span 60+ days with a clear pattern shift at day ~45 to demonstrate anomaly detection. |

---

## Sources & References

- **Origin document:** `docs/plans/2026-07-02-002-feat-direction-plans-agentic-case-court-plan.md` (D01 section)
- Cron pattern: `functions/alert_job/index.js`
- Express pattern: `functions/case_management/index.js`
- Shared module pattern: `functions/shared/analyzer.js`
- Frontend panel pattern: `client/src/Components/CaseManagementPanel.jsx`
