---
title: "feat: Hackathon Winning Polish — Missing Panels, Chatbot API, Design Compliance"
type: feat
status: active
date: 2026-07-14
origin: docs/plans/2026-07-07-002-feat-winning-combination-plan.md
---

# Hackathon Winning Polish — Missing Panels, Chatbot API, Design Compliance

## Overview

The KSP Crime Genome platform has 15 Crime Genome units implemented with a working build, but several backend functions lack frontend panels, the chatbot is 100% mock, and design system compliance is incomplete. This plan closes the gaps that matter most for hackathon judging: filling missing panels, connecting the chatbot to real backend endpoints, and ensuring every screen passes visual quality review.

---

## Problem Frame

Judges evaluate three things: (1) does it work end-to-end, (2) does it look professional, (3) does it solve the problem. Currently:
- 4 backend functions have no frontend panel (CounterCrime, FIR Quality, Fairness Audit, Agent Panel)
- ChatPanel uses hardcoded mock responses — no real API call
- Some panels still use raw inline styles instead of PanelCard primitives
- The demo flow has gaps where judges would hit "coming soon" or blank screens

---

## Requirements Trace

- R1. Every backend function with a data contract must have a corresponding frontend panel
- R2. ChatPanel must connect to at least one real backend endpoint (zia_brief or legal_rag)
- R3. All panels must use the design system (PanelCard, PanelHeader, PanelBadge primitives)
- R4. The demo script must work end-to-end without hitting any mock/blank screens
- R5. Build must pass clean with no errors

---

## Scope Boundaries

- No new backend functions — only wire existing ones to new frontend panels
- No state management library addition — keep current useState/useContext pattern
- No test framework setup — too late in hackathon cycle
- No Catalyst deployment changes — that requires credentials and CLI setup outside scope
- Design system migration is incremental — migrate panels that judges will actually see

### Deferred to Follow-Up Work

- Catalyst deployment for live judge access (requires `catalyst` CLI + project credentials)
- Full test framework setup (Jest/Vitest + React Testing Library)
- Unifying the three near-identical sidebar components
- Fixing the `Regsiter/` folder typo

---

## Context & Research

### Relevant Code and Patterns

- `client/src/Components/panels/` — Design system primitives (PanelCard, PanelHeader, PanelBadge, PanelChart, PanelTable)
- `client/src/Components/HotspotMap.jsx` — Example of well-structured panel with mock data + design system compliance
- `client/src/Components/PredictivePanel.jsx` — Example of panel that connects to backend
- `functions/countercrime/index.js` — CounterCrime simulation backend (exists, no frontend)
- `functions/fir_quality/index.js` — FIR Quality scoring backend (exists, no frontend)
- `functions/fairness_audit/index.js` — Fairness audit backend (exists, no frontend)
- `functions/agentic_police/index.js` — Agent cross-check backend (exists, no frontend)
- `functions/zia_brief/index.js` — ZIA synthesis backend (exists, chatbot should connect)
- `functions/legal_rag/index.js` — Legal RAG backend (exists, chatbot should connect)
- `client/src/Components/ChatPanel/ChatPanel.jsx` — Current mock chatbot
- `client/src/App.jsx` — Routing structure with ~30 shared child routes

### Institutional Learnings

- Plans 2026-07-07-001 and 2026-07-07-002 already addressed design system reconciliation and winning combination features
- The project uses Zoho Catalyst serverless functions — frontend calls them via `apiFetch` utility
- Mock data pattern: components hardcode realistic data arrays at top of file, with `ponytail:` comments marking mock boundaries

---

## Key Technical Decisions

1. **Wire chatbot to zia_brief first, legal_rag second**: zia_brief already returns structured case summaries; legal_rag returns BNS sections. Both have HTTP endpoints. The chatbot's `getMockResponse()` function gets replaced with a real `fetch()` call to these endpoints, with mock fallback on error.

2. **New panels follow HotspotMap pattern**: Each new panel is a standalone component with hardcoded mock data that matches the backend's response schema. When the backend is deployed, swap mock data for `apiFetch()` calls.

3. **Route new panels into sharedChildren**: All 4 new panels get added to the shared route block in App.jsx so they're available in all 3 role dashboards.

4. **Design system compliance is optional for new panels**: The priority is having working panels with data. Migrate to PanelCard primitives only for panels that judges will spend time on (CounterCrime, Fairness Audit).

---

## Open Questions

### Resolved During Planning

- Q: Should we add new routes or reuse existing ones? A: Add new routes in sharedChildren — each panel gets its own path.
- Q: How much backend integration is realistic? A: Chatbot → zia_brief is achievable. Other panels stay mock with realistic data.

### Deferred to Implementation

- Q: Exact API response shapes from countercrime/fir_quality/fairness_audit? A: Will read the function files during implementation to match mock data to real schemas.
- Q: Whether Catalyst deployment is needed before demo? A: Deferred — requires user's Catalyst credentials.

---

## Implementation Units

- U1. **CounterCrime Panel**

**Goal:** Create a frontend panel for the CounterCrime Simulator backend

**Requirements:** R1, R4

**Dependencies:** None

**Files:**
- Create: `client/src/Components/CounterCrimePanel.jsx`
- Modify: `client/src/App.jsx` (add route)

**Approach:**
- Read `functions/countercrime/index.js` to understand the API response shape
- Create panel with hardcoded mock data matching that schema
- Include: simulation parameters (crime type, location, time range), results (predicted incidents, confidence, resource recommendation)
- Use PanelCard + PanelHeader primitives from `components/panels/`
- Add route `/countercrime` to sharedChildren in App.jsx

**Patterns to follow:**
- `client/src/Components/HotspotMap.jsx` — panel structure, mock data pattern
- `client/src/Components/PredictivePanel.jsx` — simulation results display

**Test scenarios:**
- Happy path: Panel renders with mock simulation results, shows crime type selector, displays predicted incident map
- Edge case: Empty state before simulation runs — shows "Configure Parameters" prompt
- Error path: Backend unreachable — shows mock data with "Demo Mode" badge

**Verification:**
- Panel renders at `/dashboard/countercrime` (and /inspector/countercrime, /subinspector/countercrime)
- Shows realistic counter-crime simulation data
- Build passes with new route

---

- U2. **FIR Quality Panel**

**Goal:** Create a frontend panel for the FIR Quality Score backend

**Requirements:** R1, R4

**Dependencies:** None

**Files:**
- Create: `client/src/Components/FirQualityPanel.jsx`
- Modify: `client/src/App.jsx` (add route)

**Approach:**
- Read `functions/fir_quality/index.js` to understand the 10-dimension scoring API
- Create panel showing: FIR quality score (0-100), dimension breakdown (completeness, consistency, timeliness, etc.), improvement suggestions
- Mock data: 3-5 FIRs with varying quality scores and dimension breakdowns
- Use PanelCard + PanelHeader + PanelTable primitives
- Add route `/fir-quality` to sharedChildren

**Patterns to follow:**
- `client/src/Components/CaseWorkspace/CaseStrengthMeter.jsx` — gauge/score display
- `client/src/Components/SolvabilityBadge.jsx` — score badge pattern

**Test scenarios:**
- Happy path: Panel renders FIR quality scores with dimension breakdown, shows color-coded badges (green >80, amber 50-80, red <50)
- Edge case: Single FIR with perfect score (100) — all dimensions green
- Error path: No FIRs loaded — shows empty state with "Upload FIR to analyze" prompt

**Verification:**
- Panel renders at `/dashboard/fir-quality`
- Shows 10-dimension quality breakdown per FIR
- Build passes

---

- U3. **Fairness Audit Panel**

**Goal:** Create a frontend panel for the Fairness Audit backend

**Requirements:** R1, R4

**Dependencies:** None

**Files:**
- Create: `client/src/Components/FairnessAuditPanel.jsx`
- Modify: `client/src/App.jsx` (add route)

**Approach:**
- Read `functions/fairness_audit/index.js` to understand the demographic parity metrics
- Create panel showing: overall fairness score, demographic parity across groups, false positive/negative rates by category
- Mock data: 3-4 demographic categories with parity metrics
- Include visual: bar chart comparing arrest rates across groups, disparity ratio gauge
- Use PanelCard + PanelHeader + PanelChart primitives
- Add route `/fairness-audit` to sharedChildren

**Patterns to follow:**
- `client/src/Components/DarkFigurePanel.jsx` — statistical analysis display
- `client/src/Components/panels/PanelChart.tsx` — chart integration

**Test scenarios:**
- Happy path: Panel renders fairness metrics with bar chart, shows disparity ratios, flags categories with parity violations
- Edge case: Perfect parity (all ratios = 1.0) — shows "No disparities detected" green badge
- Error path: Backend unreachable — shows mock data with disclaimer

**Verification:**
- Panel renders at `/dashboard/fairness-audit`
- Shows demographic parity metrics with visual chart
- Build passes

---

- U4. **Agent Panel (Agentic Police)**

**Goal:** Create a frontend panel for the Agentic Police cross-check backend

**Requirements:** R1, R4

**Dependencies:** None

**Files:**
- Create: `client/src/Components/AgentPanel.jsx`
- Modify: `client/src/App.jsx` (add route)

**Approach:**
- Read `functions/agentic_police/index.js` to understand the agent cross-check API
- Create panel showing: active agent tasks, cross-check results, agent recommendations, task status timeline
- Mock data: 3-5 agent tasks with different statuses (running, completed, pending)
- Include: task input form (select FIR, trigger cross-check), results display with confidence scores
- Use PanelCard + PanelHeader primitives
- Add route `/agent` to sharedChildren

**Patterns to follow:**
- `client/src/Components/CaseWorkspace/AIIntelligenceBrief.jsx` — AI analysis display
- `client/src/Components/AlertsFeed.jsx` — status/feed display

**Test scenarios:**
- Happy path: Panel renders agent tasks with status badges, shows cross-check results with confidence scores
- Edge case: No active tasks — shows "No pending cross-checks" empty state
- Error path: Agent service unavailable — shows mock data with "Simulated" badge

**Verification:**
- Panel renders at `/dashboard/agent`
- Shows agentic police tasks and cross-check results
- Build passes

---

- U5. **ChatPanel API Integration**

**Goal:** Connect ChatPanel to real backend endpoints (zia_brief, legal_rag) with mock fallback

**Requirements:** R2, R4

**Dependencies:** U1-U4 (to ensure all panels exist before chatbot references them)

**Files:**
- Modify: `client/src/Components/ChatPanel/ChatPanel.jsx`

**Approach:**
- Read `functions/zia_brief/index.js` and `functions/legal_rag/index.js` to understand request/response shapes
- Replace `getMockResponse()` with a function that:
  1. Tries real API call first (via `apiFetch` or direct fetch to Catalyst function URL)
  2. Falls back to mock response on error
- Map user queries to appropriate endpoints:
  - FIR summaries → zia_brief
  - BNS section lookup → legal_rag
  - General queries → mock (no backend exists)
- Add "Demo Mode" indicator when using mock fallback
- Keep existing mock responses as fallback data

**Patterns to follow:**
- `client/src/utils/apiFetch.js` — existing API call utility
- `client/src/Components/CaseWorkspace/AIIntelligenceBrief.jsx` — latency fallback pattern (5s timeout → mock)

**Test scenarios:**
- Happy path: Chat sends query, receives real response from zia_brief, displays with sources
- Edge case: Backend responds slowly (>3s) — shows typing indicator, eventually returns result
- Error path: Backend unreachable — falls back to mock response, shows "Demo Mode" badge
- Integration: User asks about FIR 142 → chatbot calls zia_brief → returns structured case summary

**Verification:**
- ChatPanel makes real API call when backend is available
- Falls back gracefully to mock on error
- "Demo Mode" badge visible when using mock data
- Build passes

---

- U6. **Design System Compliance Pass**

**Goal:** Migrate remaining panels to use PanelCard/PanelHeader/PanelBadge primitives

**Requirements:** R3

**Dependencies:** U1-U5 (all panels must exist before compliance pass)

**Files:**
- Modify: `client/src/Components/HotspotMap.jsx` (if not already compliant)
- Modify: `client/src/Components/TopologyPanel.jsx`
- Modify: `client/src/Components/VeracityPanel.jsx`
- Modify: `client/src/Components/GbvPanel.jsx`
- Modify: `client/src/Components/VictimRiskPanel.jsx`
- Modify: `client/src/Components/DarkFigurePanel.jsx`
- Modify: `client/src/Components/BeatOptimizerPanel.jsx`
- Modify: `client/src/Components/ChargesheetClockPanel.jsx`
- Modify: `client/src/Components/AccusedAtLargePanel.jsx`
- Modify: `client/src/Components/RetractionRatePanel.jsx`
- Modify: `client/src/Components/CoAccusedNetworkPanel.jsx`
- Modify: `client/src/Components/PredictivePanel.jsx`
- Modify: `client/src/Components/ArrestVectorPanel.jsx`
- Modify: `client/src/Components/DeterrenceDashboard.jsx`
- Modify: `client/src/Components/NetworkGraph.jsx`

**Approach:**
- Read each panel file
- Replace raw `<div>` wrappers with `<PanelCard>` where appropriate
- Replace inline header styles with `<PanelHeader>`
- Replace inline badge styles with `<PanelBadge>`
- Replace inline table styles with `<PanelTable>`
- Keep existing functionality intact — only change wrapper elements
- Priority: panels that appear in the demo script first

**Patterns to follow:**
- `client/src/Components/panels/index.ts` — exported primitives
- `client/src/Components/panels/PanelCard.tsx` — card wrapper
- `client/src/Components/panels/PanelHeader.tsx` — header with title + subtitle
- `client/src/Components/panels/PanelBadge.tsx` — status badge

**Test scenarios:**
- Test expectation: none — this is a styling migration, no behavioral change
- Verification: each migrated panel renders identically to before (visual regression check)
- Build passes after each panel migration

**Verification:**
- All panels use PanelCard/PanelHeader/PanelBadge primitives
- No raw inline `style={{}}` for layout in migrated panels
- Build passes clean
- Visual appearance unchanged (same colors, spacing, typography)

---

## System-Wide Impact

- **Interaction graph:** New routes in App.jsx sharedChildren affect all 3 role dashboards
- **Error propagation:** ChatPanel API errors fall back to mock — no user-facing crashes
- **State lifecycle risks:** None — all panels are stateless with local useState
- **API surface parity:** New panels call existing backend functions — no new API surface
- **Integration coverage:** ChatPanel → zia_brief integration is the only cross-layer scenario
- **Unchanged invariants:** Existing panels, routing, auth, and login remain untouched

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Backend functions may have changed their API contract since plans were written | Read each function file before building panel, match mock data to actual schema |
| ChatPanel API integration may fail if Catalyst functions aren't deployed | Mock fallback ensures demo works regardless of deployment status |
| Design system migration may break panel layouts | Migrate one panel at a time, verify build + visual after each |
| Too many changes may introduce regressions | Build after each unit, commit atomically |

---

## Documentation / Operational Notes

- Update `docs/demo-script.md` to include new panels in the demo flow
- Update `README.md` to mention new panels and their routes
- Mark plan files 2026-07-02-001 and 2026-07-02-003 as partially complete (backend done, frontend now done)

---

## Sources & References

- Origin document: `docs/plans/2026-07-07-002-feat-winning-combination-plan.md`
- Related code: `functions/countercrime/index.js`, `functions/fir_quality/index.js`, `functions/fairness_audit/index.js`, `functions/agentic_police/index.js`
- Design system: `client/src/Components/panels/index.ts`
- API utility: `client/src/utils/apiFetch.js`
