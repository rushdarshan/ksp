---
date: 2026-07-08
topic: ps2-gap-analysis
focus: "problem-statement-2 gaps and improvements"
mode: repo-grounded
---

# Ideation: PS2 Gap Analysis — Where We Lack, Where We Can Improve

## Grounding Context

**Project:** KSP Dashboard-Datathon — 23 Catalyst functions, 17 analytical panels, 3 role-specific dashboards, Kannada voice STT/TTS, Qwen 2.5-14B predictive pipeline, criminological depth (VeriPol, dark figure estimation, exceedance curves, fairness audits).

**Competitor threat (public repos):**
- ULTRON: Three.js 3D extruded Karnataka map, Cytoscape.js network graphs, LLM+RAG chatbot, anime.js story-driven scroll narrative — **strong visual demo differentiator**
- CrimeScope AI 2.0: Digital twin simulator with patrol scenario what-ifs, 202K records, "AI copilot" with 15+ query patterns
- Crime Vision: PDF report generation, XGBoost + Leaflet, JWT auth

**Our strength vs PS2:** Advanced network analysis (3 graph viz tools), hotspot mapping, predictive risk scoring, crime trend analysis, beat optimization, FIR veracity — 8/10 PS2 requirements covered solidly.

**Our gaps vs PS2:**
1. Visual storytelling — functional UI, not cinematic. No 3D, no animated transitions, no narrative demo flow.
2. Emerging trend alerts — no red-zone pulsing visual on map when crime spikes
3. Socio-economic correlation — countercrime backend has data, no frontend panel
4. Anomaly detection — transit_detection exists but no visual call-out UI
5. "Why behind where" — no causation-explanation layer
6. Digital twin / what-if — countercrime backend exists, no frontend
7. PDF export — zero across all panels
8. Explainable AI — no systematic evidence-trail layer

## Ranked Ideas

### 1. Digital Twin / What-If Simulator Panel
**Description:** Build a frontend panel (`WhatIfPanel.jsx`) wrapping our existing `countercrime` function. Users adjust sliders for patrol budget (+/-50%), literacy rate, streetlight coverage, police per capita → instantly see predicted crime rate changes across 12 crime types on a bar chart. Demo-ready in 5 minutes: show "what if we increase patrol budget 20% in District 5" → theft drops 12%.
**Warrant:** `direct:` `functions/countercrime/index.js` — full what-if simulation engine exists serving `POST /simulate`. No frontend panel exists. `docs/ideation/2026-07-07-frontend-improvements-ideation.md` already identified this gap.
**Rationale:** CrimeScope AI 2.0's digital twin is their headline feature. We have the same capability hidden in a backend function with no UI. Building the panel unlocks a strong demo moment: "pull a slider, see crime change in real time." None of our 17 panels are interactive simulators — this would be unique in our portfolio and directly addresses PS2's "smarter resource deployment" requirement.
**Downsides:** Slider UX needs debouncing to avoid hammering the function. Requires explanation that it's a correlation-weighted model, not causal ML.
**Confidence:** 90%
**Complexity:** Low-Medium (~4 hours)
**Status:** Unexplored

### 2. Red-Zone Pulsing Crime Spike Alerts on Map
**Description:** When `alert_job` detects a crime category with Z-score > 2 in a district, overlay a pulsing red circle on the HotspotMap at that district's centroid. The pulse animation is pure CSS (`@keyframes pulse`) with scale + opacity oscillation. Clicking it shows: "Theft in District 4: 3.2σ above 60-day average." Directly matches PS2's "red-zone pulsing" spec.
**Warrant:** `direct:` PS2 spec: "Visual indicators (e.g., red-zone pulsing) when a specific crime category spikes in a region compared to historical averages." `direct:` `HotspotMap.jsx` — Leaflet map component exists, can add circle overlays. `direct:` `alert_job/index.js` — already computes Z-scores.
**Rationale:** This is the only requirement in PS2 that references a *specific visual effect* ("red-zone pulsing"). Having it in our demo shows judges we read the spec carefully. Low complexity — CSS animation + Leaflet circle marker + one API call.
**Downsides:** Need to expose alert data to the map component (currently only in AlertFeed + RightSidebar).
**Confidence:** 95%
**Complexity:** Low (~3 hours)
**Status:** Unexplored

### 3. Socio-Economic Crime Correlation Panel
**Description:** A dedicated panel (`SocioEconPanel.jsx`) showing crime rates side-by-side with district-level socio-economic indicators: population density, literacy rate, urbanization index, police per capita, streetlight coverage. Uses a scatter plot (crime rate vs. each indicator) to show correlations. Data sourced from the existing district profiles in `countercrime/index.js`. Directly addresses PS2's "overlays crime data with urbanization patterns, population distribution, and socio-economic indicators."
**Warrant:** `direct:` PS2 spec: "Socio-Economic Correlation: Overlays crime data with urbanization patterns, population distribution, and socio-economic indicators to understand the 'why' behind the 'where'." `direct:` `functions/countercrime/index.js:10-85` — full district profile data with literacy, urbanization, police per capita, streetlight scores. No panel exposes this.
**Rationale:** "Why behind the where" is the PS2 headline. This panel is the most direct response. Our countercrime function already has the data — this is a frontend-only build.
**Downsides:** Over-interpretation risk — correlations are not causation. Need disclaimer text.
**Confidence:** 90%
**Complexity:** Medium (~5 hours)
**Status:** Unexplored

### 4. Anomaly Detection Visual Call-Out System
**Description:** A dedicated panel (`AnomalyPanel.jsx`) that queries `transit_detection` for detected crime bursts, plus a floating call-out banner on the main dashboard (`DashboardBody.jsx`) that slides in when an anomaly is active. The call-out shows: "⚠ BURST DETECTED: Robbery cases in District 7 are 4.2× above baseline over the last 5 days." Blue background, dismiss button, links to the anomaly panel for details. Directly addresses PS2's "Visual call-outs for incidents that deviate from standard behavioral patterns."
**Warrant:** `direct:` PS2 spec: "Anomaly Detection: Visual call-outs for incidents that deviate from standard behavioral patterns, assisting investigators in linking complex cases." `direct:` `functions/transit_detection/index.js` — BLS burst detection algorithm exists and is deployed. No frontend UI or call-out system exists.
**Rationale:** The challenge explicitly asks for visual call-outs. We have the detection algorithm but no user-facing alert. This is a backend function waiting for a frontend — zero backend work needed.
**Downsides:** Need to avoid alert fatigue — only show high-significance bursts.
**Confidence:** 85%
**Complexity:** Low-Medium (~4 hours)
**Status:** Unexplored

### 5. 3D Geospatial Map Layer (Three.js / react-three-fiber)
**Description:** Replace (or augment) the flat Leaflet heatmap with a 3D extruded district map using react-three-fiber. Each district polygon extruded to height proportional to crime rate. Color heat gradient. Orbit controls for rotation. District boundary lines. This directly competes with ULTRON's Three.js implementation.
**Warrant:** `external:` ULTRON (github.com/heyItsRocky/ultron-datathon-2026) uses Three.js extruded Karnataka map as their demo opening — it's immediately visually impressive and sets the tone for their entire presentation. `reasoned:` In a datathon judged partly on presentation quality, the first visual judges see determines their baseline. Flat heatmaps are expected; 3D extruded maps are memorable.
**Rationale:** ULTRON's 3D map is their strongest differentiator. We need a comparable visual hook. However, this is high complexity and could destabilize the build if rushed.
**Downsides:** Heavy dependency (react-three-fiber ~200KB). Learning curve for Three.js. Risk of destabilizing existing map. Won't help if the judging is done on a projector (3D can look confusing). Competes with HotspotMap's existing Leaflet implementation.
**Confidence:** 60%
**Complexity:** High (~12-16 hours)
**Status:** Unexplored

### 6. PDF Report Export for Analytics Panels
**Description:** Add a "Export PDF" button to each analytics panel title bar. Uses the browser's `window.print()` triggered via a print-friendly stylesheet, or `html2canvas` + `jspdf` for cleaner output. Each PDF includes: panel title, current filter state, date range, chart/image, key metrics, and a "Generated by KSP Crime Intelligence Platform" footer. Crime Vision already ships this.
**Warrant:** `external:` Crime Vision (PS2 competitor) has PDF export as a listed feature. `reasoned:` Professional analytics platforms have export as table stakes — judges evaluating "Technical Execution" expect it. A dashboard that can't produce a printable report signals incomplete.
**Rationale:** Low complexity for high professionalism signal. Reuse one export utility across all panels instead of per-panel implementation.
**Downsides:** `html2canvas` can be flaky with Leaflet maps and SVG charts. `window.print()` is simpler but less controlled.
**Confidence:** 85%
**Complexity:** Low (~3 hours for utility + per-panel wiring)
**Status:** Unexplored

### 7. Explainability Footer on AI Panels
**Description:** Add a collapsible "Methodology & Sources" footer to every AI-driven panel (PredictivePanel, VictimRiskPanel, VeracityPanel, DarkFigurePanel, etc.). Shows: data sources queried, model/method used (QuickML / heuristic / Zia LLM), confidence score range, last updated timestamp, and a disclaimer. One reusable React component.
**Warrant:** `direct:` PS1/PS2 both mention explainable AI. PS2 says "Visualization of reasoning paths and correlations used in analysis." `reasoned:` Most datathon entries will make opaque AI claims ("89% accuracy" — CrimeScope). Showing methodology builds credibility with technical judges and directly addresses the accountability requirement.
**Rationale:** This is a force multiplier — one component reused across 6-7 panels gives the impression of a well-architected system. It also protects against judges asking "how does this work?" — the answer is already on screen.
**Downsides:** Adds visual clutter. Need to keep it collapsible by default. Some panels may not have clean methodology to report.
**Confidence:** 90%
**Complexity:** Low (~2 hours for component + per-panel integration)
**Status:** Unexplored

## Rejection Summary

| # | Idea | Reason Rejected |
|---|------|-----------------|
| 1 | Narrative scroll demo mode (anime.js) | Too complex (20+ hours) for too little marginal gain — ULTRON already did this, copying it looks like imitation |
| 2 | Full chatbot for PS2 | Chatbot is PS1 requirement, not PS2. PS2 is about analytics, not conversational AI |
| 3 | Seasonal trend decomposition | Duplicates existing exceedance_curve + alert_job Z-score analysis; marginal value |
| 4 | Dark mode toggle | Nice-to-have cosmetic, doesn't address any PS2 requirement, not worth 4 hours |
| 5 | Real-time WebSocket push | Blocked by Catalyst IN DC constraints (no WebSocket on Slate); would require AppSail, too heavy |
| 6 | MO pattern analysis panel | Partially covered by AccusedAtLarge + TopologyPanel; insufficient warrant for dedicated panel |
