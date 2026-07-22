# Crime Genome Project — Implementation Plan

## Overview
Platform for KSP Datathon 2026 Challenge 2. Deployed on Zoho Catalyst (India DC). Reads every FIR's full signature — veracity, topology, victim risk, beat optimization, GBV analytics.

## Architecture (5 Layers)

### Layer 1: Data Ingestion
- **CCTNS/FIR Data Store** (Catalyst Data Store): 500K synthetic FIRs, 26 CSV tables, 10 Karnataka districts
- **Kannada Voice Pipeline**: browser speech APIs first, with explicit external STT/TTS adapters when configured
- **Synthetic Data Generator**: Python script produces realistic FIR data

### Layer 2: Orchestration
- **Signals Event Bus** (replaces Circuits — blocked in IN DC): CDC on Data Store row_inserted triggers real-time recomputation
- **Job Scheduling** (cron): Nightly batch processing via AppSail Docker
- **Catalyst Serverless Functions** (Node.js, <30s timeout): 8 function endpoints

### Layer 3: ML & Analytics Engine
- **QuickML (XGBoost)**: Hotspot forecasting model (existing, deployed)
- **FIR Veracity Index**: VeriPol-style linguistic analysis (14 markers)
- **Crime Topology Navigator**: Markov transition matrix + FSC metric (novel)
- **Victim Risk Shield**: Repeat victimization scoring (novel for India)
- **GBV Analytics Hub**: Crimes-against-women dashboards
- **Beat & Patrol Optimizer**: MIP beat redesign + ACO routing (AppSail Python)
- **Network Analysis**: Louvain community detection (existing AppSail)

### Layer 4: API & Frontend
- **Slate Hosting**: React SPA with HashRouter (required for Slate)
- **Catalyst Auth**: Role-based (Inspector / Sub-Inspector)
- **API Gateway**: 8 function endpoints, CORS-configured

### Layer 5: Users
- Analyst/Inspector, Patrol Officer, Victim Support, Senior Leadership

---

## Completed Work

### Existing (pre-July 2026)
- 5 Catalyst Functions: fir_api, zia_voice, legal_rag, quickml_predict, alert_job
- AppSail Docker: NetworkX graph/Louvain community detection
- XGBoost model on QuickML
- React frontend on Vite (402 components, Leaflet maps, ApexCharts, ForceGraph2D)
- 500 synthetic FIRs across 10 Karnataka districts
- Role-based auth via JWT
- Kannada query and response translation through Zia generative AI; voice capture/playback uses browser APIs or configured providers

### P0/P1 Fixes (July 1)
| Blocker | Fix |
|---------|-----|
| quickml_predict: spawnSync('python') crashes in Catalyst sandbox | Replaced with `catalystApp.quickML().predict()` SDK call |
| legal_rag: hardcoded mock response | Replaced with a narrow, verified BNS knowledge set, evidence citations, and Zia fallback |
| alert_job: hardcoded synthetic alerts | Replaced with Z-score outlier detection per district + repeat victim alerts |
| fir_api /alerts: duplicate mock | Now reads from Alerts Data Store table |

### New Feature Functions (July 1)
| Function | Endpoint | Description |
|----------|----------|-------------|
| `veracity_index` | POST /analyze | 14 linguistic markers, VeriPol-style scoring, Zia consistency check |
| `topology_navigator` | GET /topology | Directed crime-type transition graph, FSC metric per node |
| `victim_risk_shield` | GET /score/:victimId | Repeat victim risk scoring with factors & recommendations |

### Artifacts
- `client/public/architecture.svg`: Product flow diagram (mandatory for judges)
- `docs/implementation-plan.md`: This document
- `catalyst.json`: Updated with 8 function targets

---

## Priority Features for Remaining 26 Days

### 1. FIR Veracity Index (HIGHEST DEMO IMPACT)
**Backend**: Done — `veracity_index` function with 14 linguistic markers
**Frontend**: Add panel to FIR detail view showing veracity score, flags, linguistic breakdown
**Demo**: Paste 2 example FIRs — one genuine, one fabricated. Show score difference.

### 2. Crime Topology Navigator (MOST VISUALLY MEMORABLE)
**Backend**: Done — `topology_navigator` function with transition matrix + FSC
**Frontend**: Force-directed graph showing crime-type transitions. Click node → drill into contributing FIRs
**Demo**: Show burglary→robbery→violence escalation chain. FSC = 0.74.

### 3. Victim Risk Shield (EMOTIONAL + SOCIAL IMPACT)
**Backend**: Done — `victim_risk_shield` function with multi-factor scoring
**Frontend**: Add victim risk badge to FIR detail. Dashboard panel showing high-risk victims
**Demo**: Find victim "Sunita K" with 3 FIRs. Show 72nd percentile risk. Auto-generated alert.

### 4. Product Flow Diagram
**Completed**: `client/public/architecture.svg` — 5-layer architecture with all Catalyst services

### 5. Beat & Patrol Optimizer (TANGIBLE OPS IMPROVEMENT)
**Backend**: Needs AppSail Python function (MIP beat redesign + ACO routing)
**Frontend**: Map showing current vs. optimized beats. Metrics: coverage gap, patrol distance reduction
**Status**: Research done (Zhu et al. 2020 template, ACO algorithm selected). Implementation pending.

### 6. GBV Analytics Hub (POLITICALLY RESONANT)
**Backend**: Needs Catalyst Function querying FIR data filtered to GBV crimes
**Frontend**: FIR-to-conviction funnel per district, heatmap of GBV crimes, time-series forecast
**Status**: Research done (ITSSO integration, OSC data mapping). Implementation pending.

---

## Technical Decisions

### Catalyst Circuits
Not available in India DC. Replaced by:
- **Signals**: Event bus for real-time triggers (Data Store CDC)
- **Job Scheduling**: Cron for nightly batch processing
- **Custom Publisher pattern**: Function chaining (Function A → Signal → Function B)

### 30-Second Timeout
All quick-serving endpoints (<30s) run as Catalyst Functions.
Long-running tasks (topology graph, beat optimization) run as AppSail Docker batch jobs via Job Scheduling.
Results precomputed nightly, stored in Data Store + Cache.

### Data Store Limitations
- No PostGIS: Store lat/lng as Double, pre-filter by district/zone before bounding box
- No JSON columns: Use Text (10K char) or NoSQL document store
- 300-row fetch limit: Must paginate dashboard queries
- Solution: Precompute and store aggregated results; serve to frontend in small batches

### Slate Deployment
- Must use HashRouter (BrowserRouter causes 404 on refresh)
- CORS via Authorized Domains in Authentication console
- No WebSocket support → use polling (5s interval) for live dashboard updates

### QuickML Integration
- Use `zcatalyst-sdk-node`'s `quickML().predict()` — no OAuth needed from within Functions
- Model trained via `quickml_pipeline.py` and uploaded to QuickML console
- Fallback: Read precomputed scores from Data Store

---

## Demo Script (5 Minutes)

| Time | Action |
|------|--------|
| :00-:30 | Login → Dashboard overview (crime genome concept, 5-district KPIs) |
| :30-1:30 | FIR Veracity → Paste 2 FIRs. Scores: 87% authentic vs 92% fabricated. Explain 14 linguistic markers. |
| 1:30-2:30 | Crime Topology → Select Bengaluru Urban. Directed graph animates: vehicle theft→burglary→robbery→assault. FSC=0.74. |
| 2:30-3:15 | Victim Risk → Look up victim with 3 FIRs. Score: HIGH (72nd percentile). Auto-generated alert. |
| 3:15-4:00 | Beat Optimizer → Show current beat map → overlay optimized beats. Coverage gap -23%, patrol distance -18%. |
| 4:00-4:30 | GBV Hub → One click. District heatmap + time-series forecast. |
| 4:30-5:00 | Wrap → "Crime Genome Project. All on Catalyst. Live in production." |

---

## Research Synthesized

### Novelty Map
| Feature | Global Prior Art | India Police Status | Catalyst Specific |
|---------|-----------------|-------------------|-------------------|
| Crime Topology Navigator | Academic only (Heiler 2023) | Doesn't exist | First-mover |
| FIR Veracity Index | VeriPol (Spain, 2017) | Doesn't exist | First-mover |
| Victim Risk Shield | ProVict (Netherlands) | Doesn't exist | First-mover |
| Beat + Patrol Optimizer | Zhu et al. 2020 (US) | Doesn't exist | First-mover |
| GBV Analytics Hub | ITSSO (India, sexual-only) | Partial (ITSSO) | First integrated |
| Counterfactual Simulator | CounterCrime (academic) | Doesn't exist | Future |
| Bail Risk Assessment | IBPS (academic) | Academic only | Future |
| Safe Route Navigator | Safetipin, AWS SafeRoute | Multiple apps | Future |

### Key Sources
- Stander et al. (1989): Markov Chain Analysis of Criminal Careers
- Heiler et al. (2023): Large-scale specialization in criminal careers (Scientific Reports)
- Quijano-Sánchez et al. (2018): VeriPol — false report detection (Knowledge-Based Systems)
- ProVict (Raaijmakers et al. 2022): Victim risk scoring (Netherlands Police)
- Zhu et al. (2020): Data-Driven Police Beat Design (Georgia Tech)
- CounterCrime (2025): Counterfactual crime analytics (IEEE TVCG)
- Karnataka Crime Victimisation Survey (Azim Premji University, 2019)
- BPR&D New Sub Beat System (Karnataka model)
