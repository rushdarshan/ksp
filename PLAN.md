# KSP Crime Genome — Phase 2 Build Plan
## 8 New Panels from Schema-Deep Survivors

---

## Executive Summary

Synthesize 8 brainstorms into a build order that tells a coherent demo story. Each panel surfaces a signal that already lives in the CCTNS schema but is invisible in standard dashboards — chargesheet deadlines, accused-at-large, retraction rates, arrest geography, duration-weighted harm, co-accused networks, mutual accusation pairs, and officer career stitching.

**Total effort:** ~10-12 days single developer  
**Demo flow:** Urgency → Gaps → Quality → Geography → Harm → Intelligence → Triage → Accountability

---

## Demo Narrative Arc (judge journey)

| Panel | Pitch | Emotional beat |
|-------|-------|----------------|
| 1. Chargesheet Clock | "Cases expire in 6 days — accused walks free" | Shock |
| 2. Accused-at-Large Ledger | "23 named suspects, zero arrests" | Concern |
| 3. Retraction Rate | "15% of your chargesheets come back stamped false" | Reflection |
| 4. Arrest Vector | "Your CCB pulls arrests from 14km away — that's a sink" | Insight |
| 5. Duration-Weighted Harm | "1 FIR, 90 days of harm — counts lie" | Reframe |
| 6. Co-Accused Network | "3 A1s share 7 cases — that's a gang" | Discovery |
| 7. Mutual Accusation Signal | "Both sides filed — read them together" | Nuance |
| 8. Officer Career Spine | "KG1841136: 47 FIRs, 32 arrests, 28 chargesheets — one officer" | Accountability |

---

## Build Order & Estimates

### Phase A: The Urgency Layer (Days 1-2)
#### A1: Chargesheet Clock (#17) — ~1 day
- **Mock endpoint:** `GET /server/chargesheet-clock/cases` + `/stats`
- **Component:** `ChargesheetClockPanel.jsx`
- **Data:** CaseMaster.CrimeRegisteredDate, GravityOffenceID → 90/180 day limit
- **UI:** Progress bar per case, urgency bands (critical/warning/normal), filter/sort
- **File changes:** mock-api-data.js (+40 lines), new panel file (~200 lines), App.jsx route

#### A2: Accused-at-Large Ledger (#20) — ~1 day
- **Mock endpoint:** `GET /server/accused-at-large/ledger`
- **Component:** `AccusedAtLargePanel.jsx`
- **Data:** Accused LEFT JOIN ArrestSurrender WHERE NULL
- **UI:** Card list, detail split-pane, gravity/district filters
- **File changes:** mock-api-data.js (+35 lines), new panel file (~250 lines), App.jsx route

### Phase B: Quality & Geography (Days 3-5)
#### B3: Retraction Rate (#16) — ~2 days
- **Mock endpoints:** `GET /server/retraction_rate/summary`, `/by_io`, `/trend`
- **Component:** `RetractionRatePanel.jsx`
- **Data:** ChargesheetDetails.cstype (A/B/C) grouped by station
- **UI:** KPI cards, station table sorted worst-first, drill to IO, trend chart
- **File changes:** mock-api-data.js (+50 lines), new panel file (~250 lines), App.jsx route

#### B4: Arrest Vector (#15) — ~1.5 days
- **Mock endpoint:** `GET /server/arrest_vector/vectors`
- **Component:** `ArrestVectorPanel.jsx`
- **Data:** CaseMaster.lat/lng → ArrestSurrender.PoliceStationID
- **UI:** Leaflet map with curved arcs, summary stats, sink station bar chart
- **File changes:** mock-api-data.js (+60 lines), new panel file (~400 lines), App.jsx route
- **Key block:** L.curve plugin or leaflet-routing-machine for great-circle arcs

### Phase C: Harm & Intelligence (Days 6-8)
#### C5: Duration-Weighted Harm (#21) — ~1 day
- **Mock endpoint:** `GET /server/duration_harm/harm-weight`
- **Component:** `HarmLayerPanel.jsx` (extends HotspotMap)
- **Data:** CaseMaster.IncidentFromDate → IncidentToDate → LOG10 weight
- **UI:** Dual-map comparison (raw vs weighted), shift indicator, split/merge toggle
- **File changes:** mock-api-data.js (+30 lines), new panel file (~150 lines), App.jsx route

#### C6: Co-Accused Network (#22) — ~1 day
- **Mock endpoint:** `GET /server/network_analysis/graph` (extend existing)
- **Component:** Extend `NetworkGraph.jsx` with PersonID-aware sizing/coloring
- **Data:** Accused.PersonID (A1/A2/A3) → node size, edge role-pair coloring
- **UI:** Larger A1 nodes, A1-A1 edges in red, gang detection toggle, click → accused detail
- **File changes:** mock-api-data.js (+20 lines), NetworkGraph.jsx (+80 lines)

### Phase D: Advanced Signals (Days 9-12)
#### D7: Mutual Accusation Signal (#18) — ~2 days
- **Mock endpoints:** `GET /server/mutual_accusation/summary`, `/pairs`
- **Component:** `MutualAccusationPanel.jsx`
- **Data:** Accused.IsComplainantAccused BIT flag
- **UI:** Force graph + time series + pair detail card, connected-FIR side-by-side
- **File changes:** mock-api-data.js (+70 lines), new panel file (~260 lines), App.jsx route

#### D8: Officer Career Spine (#19) — ~2-3 days
- **Mock endpoint:** `POST /api/officer/career-spine`
- **Component:** Extend `Officers.jsx` + `Details.jsx` with timeline + metrics
- **Data:** EmployeeID → CaseMaster + ArrestSurrender + ChargesheetDetails UNION
- **UI:** Career timeline, effectiveness metric cards, unit rollup bar chart, compare mode
- **File changes:** mock-api-data.js (+50 lines), Details.jsx (+200 lines), Officers.jsx (+50 lines)

---

## Schema Coverage Map

| Panel | Tables Touched | New Queries | New Schema |
|-------|---------------|-------------|------------|
| Chargesheet Clock | CaseMaster, ChargesheetDetails, GravityOffence, CaseStatus, Unit | 1 | 0 |
| Accused-at-Large | Accused, ArrestSurrender, CaseMaster, GravityOffence, Unit | 1 | 0 |
| Retraction Rate | ChargesheetDetails, CaseMaster, Employee, Unit | 3 | 0 |
| Arrest Vector | CaseMaster, ArrestSurrender, Unit, District | 1 | 0 |
| Duration-Weighted Harm | CaseMaster | 1 | 0 |
| Co-Accused Network | Accused, CaseMaster, CrimeSubHead, Unit | 1 | 0 |
| Mutual Accusation | Accused, ComplainantDetails, CaseMaster, CrimeSubHead, Unit | 2 | 0 |
| Officer Career Spine | Employee, CaseMaster, ArrestSurrender, ChargesheetDetails, Rank, Designation, Unit | 2 | 0 |

**Zero new schema — all 8 panels query existing columns.**

---

## UI Integration

All panels follow existing patterns:
- `PanelCard` + `PanelHeader` from shared components
- `useFetchData` hook (already fixed for undefined URL guard)
- Lazy-loaded via `React.lazy()`
- Error-wrapped fallbacks via existing ErrorBoundary
- Classified Document design system (Fraunces/Inter/JetBrains Mono, navy/amber)
- Sidebar nav items in appropriate role dashboards

---

## Risk Register

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Leaflet arc drawing breaks on Windows Chrome | Medium | Test early, fall back to straight lines |
| NetworkGraph.jsx PersonID data missing in mock | Low | Already generating PersonID in mock data |
| Mutual Accusation portrayed as "false case detector" | Medium | Frame as "connected-cases triage" in all UI copy |
| Officer Career Spine needs timeline component | Medium | Use existing react-vertical-timeline if available, else simple CSS |
| Build exceeds 12 days | Medium | Phase D is stretch — cut if timeline slips |
| Mock server plugin doesn't handle new endpoints | Low | Follows existing pattern match — zero config needed |

---

## Success Criteria

**Must-have for demo:**
- [ ] All 8 panels render without crash
- [ ] Each panel displays realistic mock data
- [ ] Demo narrative flows logically (urgency → accountability)
- [ ] Classified document design system consistent across all panels
- [ ] All panels load via lazy routing
- [ ] ErrorBoundary catches any rendering errors

**Nice-to-have:**
- [ ] Cross-panel navigation (click node → open case detail)
- [ ] Officer Career Spine comparison mode
- [ ] Duration-Weighted Harm dual-map sync
- [ ] Co-Accused Network gang detection toggle

---

## GSTACK REVIEW REPORT

### Phase 1: CEO Review (Strategy & Scope)

#### Premise Challenge

- **"Build all 8 panels"** — The plan assumes building all 8 is the right goal. For a hackathon demo, 6 polished panels beat 8 rushed ones. D8 (Officer Career Spine) is 2-3 days for one panel = ~25% of total budget for 12.5% of the demo. **Recommendation:** Keep 8 in plan but treat D8 as the first cut if timeline slips (auto-decided: P6 bias toward action, P3 pragmatic).
- **"Demo flow: urgency → accountability"** — Emotional arc is sound but leads with abstract urgency (a timer). Consider swapping A1 (Chargesheet Clock) and B4 (Arrest Vector) — the map is the most visually arresting panel and hooks the judge immediately. **Taste decision** — reasonable people could disagree.
- **"10-12 days"** — This is tight for a single dev. Each panel has ~0.5 day of hidden integration (sidebar nav, route registration, mock data debugging). Add 3 buffer days. Realistic: 13-15 days for all 8.

#### Scope Assessment

| Decision | Classification | Rationale |
|----------|---------------|-----------|
| Build all 8 in plan | Auto-decide (P1 completeness) | Zero new schema, independent panels, blast radius shared |
| D8 as first cut if slipping | Auto-decide (P3 pragmatic) | 2-3 days for one panel is disproportionate |
| Demo starts with Arrest Vector | Taste (surface at gate) | Map hooks judges faster than timer |
| 13-15 day estimate | Noted as revision | Adds 1-3 days buffer for integration |

#### What Already Exists
- NetworkGraph.jsx → Co-Accused Network (C6) reuses force graph, node/link shapes
- HotspotMap.jsx → Duration-Weighted Harm (C5) reuses Leaflet heat layer
- Details.jsx, Officers.jsx → Officer Career Spine (D8) extends existing profile page
- CaseManagementPanel.jsx → Pattern for card list + detail split pane (A1, A2, B3)
- mock-api-data.js → All panels add handlers here (shared blast radius)

#### Deferred (Not in Scope)
- Cross-panel navigation (click node → FIR detail) — nice-to-have, adds coupling
- Officer comparison mode — complexity disproportionate for demo
- Per-panel Jest tests — pre-existing decision (hackathon zero tests)

### Phase 2: Design Review

#### 7-Dimension Assessment

| Dimension | Score | Issues |
|-----------|-------|--------|
| Information hierarchy | 8/10 | Each panel has clear focal point (big number, worst-first table) |
| Interaction states | 6/10 | Loading/error via ErrorBoundary + useFetchData, but empty states not specified |
| User journey | 9/10 | Strong emotional arc, clear pitch per panel |
| Design system | 10/10 | All panels use classified doc system — consistent |
| Responsive | 4/10 | Not specified for any panel (gaps) |
| Accessibility | 3/10 | Touch targets, keyboard nav, contrast not mentioned |
| Consistency | 8/10 | PanelCard/PanelHeader reuse ensures base consistency |

#### Issues Identified

| # | Severity | Finding | Fix |
|---|----------|---------|-----|
| D1 | High | Empty states unspecified for all panels | Add "No data" fallback per panel matching classified doc design |
| D2 | High | Responsive layout not addressed | Add min-width breakpoint per panel (768px collapse) |
| D3 | Medium | D7 Mutual Accusation UI copy risk | All labels must use "connected cases" not "false case" |
| D4 | Medium | Touch targets not verified | Ensure all interactive elements ≥44x44px per previous P2 finding |
| D5 | Low | C5 dual-map sync complexity on mobile | Default to stacked (not side-by-side) below 768px |

#### Auto-Decided Design Actions
- D1 (empty states): Add to each panel spec (P1 completeness)
- D2 (responsive): Add 768px breakpoint to each panel spec (P2 boil the blast radius)
- D3 (framing): Fix UI copy on D7 spec (P5 explicit)
- D4 (touch targets): Carry forward from previous P2 finding (P1 completeness)
- D5 (mobile dual-map): Stack layout on mobile (P3 pragmatic)

### Phase 3: Eng Review

#### Architecture Assessment

All panels follow established patterns. No new architectural complexity — each is a standalone React component + mock API handler.

**Dependency graph:**
```
mock-api-data.js ← all 8 panels (shared)
App.jsx / routes ← all 8 panels (shared)
NetworkGraph.jsx ← C6 (extends)
HotspotMap.jsx ← C5 (extends)
Details.jsx / Officers.jsx ← D8 (extends)
```

**Inconsistency found:** D8 uses `POST /api/officer/career-spine` while all other panels use `GET /server/...`. Should be `GET /server/officer/spine/:kgid` to match convention. (Severity: low, fix: change endpoint in spec.)

#### Key Technical Risks

| Risk | Likelihood | Mitigation | Auto-Decision |
|------|-----------|------------|---------------|
| Leaflet arc plugin may not exist for React Leaflet 4.x | Medium | Use `leaflet-curve` or draw programmatic SVG arcs on map overlay | Test in first 2 hours of B4; if blocked, switch to straight dashed lines with length labels |
| D8 timeline component doesn't exist in codebase | High | Check package.json for react-vertical-timeline; fallback: CSS-only vertical timeline (~50 lines) | Use CSS-only timeline (P5 explicit) |
| D8 POST vs GET inconsistency | Low | Change to GET before building | Auto-fix at implementation time |
| C6 force graph with 500+ nodes degrades | Low | react-force-graph-2d handles LOD via canvas | Monitor, no pre-optimization (P3 pragmatic) |

#### Mock Data Complexity (by panel)

| Panel | Mock Data Complexity | Notes |
|-------|---------------------|-------|
| A1 | Low | Date arithmetic only |
| A2 | Low | LEFT JOIN filter |
| B3 | Medium | Need realistic cstype distribution biased by station |
| B4 | High | Need station GPS coords, realistic lat/lng pairs for arcs |
| C5 | Low | LOG10(date diff) on existing data |
| C6 | Low | Already generating PersonID; just extend shape |
| D7 | Medium | Need IsComplainantAccused flag + paired FIRs |
| D8 | High | Need realistic EmployeeID cross-references in all 3 tables |

#### File Change Summary

| File | Panels Touched | Est. New Lines |
|------|---------------|----------------|
| mock-api-data.js | All 8 | ~355 |
| App.jsx (routes) | All 8 | ~24 |
| New panel files | 6 new components | ~1,460 |
| Extended files | NetworkGraph.jsx, Details.jsx, Officers.jsx | ~330 |
| **Total** | | **~2,169** |

### Cross-Phase Themes

| Theme | Phases Flagged | Signal |
|-------|---------------|--------|
| D8 (Officer Career Spine) cost disproportionate | CEO, Eng | High confidence — should be first cut if schedule slips |
| Leaflet arc dependency risk | Eng | Medium — test early in B4 schedule |
| Empty states and responsive gaps | Design | High — easy to fix now, costly to retrofit |
| Demo narrative ordering (Arrest Vector first?) | CEO | Taste decision — choose at construction start |

### Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale |
|---|-------|----------|---------------|-----------|-----------|
| 1 | CEO | Keep all 8 in plan | Auto-decide | P1 (completeness) | Zero new schema, independent panels |
| 2 | CEO | D8 = first cut if slipping | Auto-decide | P3 (pragmatic) | 25% of budget for 12.5% of demo |
| 3 | CEO | Demo start with Arrest Vector vs Chargesheet Clock | Taste → user chose A | P6 (bias toward action) | Chargesheet Clock — urgency first |
| 4 | CEO | Add 3 buffer days (13-15 total) | Auto-decide | P1 (completeness) | Hidden integration cost per panel |
| 5 | Design | Add empty states to all panels | Auto-decide | P1 (completeness) | Easy now, costly retrofit |
| 6 | Design | Add 768px responsive breakpoint | Auto-decide | P2 (boil lakes) | Shared blast radius |
| 7 | Design | Fix D7 UI copy to "connected cases" | Auto-decide | P5 (explicit) | Prevent demo framing risk |
| 8 | Eng | D8 endpoint: GET not POST | Auto-decide | P5 (explicit) | Match existing pattern |
| 9 | Eng | Timeline: CSS-only not new dependency | Auto-decide | P5 (explicit) | Check package.json first |
| 10 | Eng | Leaflet arcs: test early, fallback to lines | Auto-decide | P3 (pragmatic) | Don't block B4 on plugin discovery |
