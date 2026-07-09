---
date: 2026-07-02
topic: crime-genome-improvements
focus: survivors-ranked
mode: elsewhere-software
run-id: b0f43c8d,a32e6ef3
---

# Ideation: Crime Genome Project — Improvement Ideas

Generated via `ce-ideate` (surprise-me mode, continuation run a32e6ef3). Grounding from codebase scan, web research, prior doc (run b0f43c8d), and project documentation.

## Grounding Context

**Project:** Crime Genome Project — KSP Datathon 2026 Challenge 2. Zoho Catalyst India DC. 19 Catalyst Functions (Node.js, <30s), React 18 SPA on Slate (HashRouter, 1.9MB bundle), XGBoost via QuickML, 2 AppSail Docker containers (Python, NetworkX/Louvain), Catalyst Data Store (500K synthetic FIRs, 26 CSV tables, no PostGIS/JSON/WebSocket, 300-row limit, 4-JOIN cap), Signals event bus, Job Scheduling for nightly batch.

**Features built:** FIR Veracity Index (14 linguistic markers, VeriPol-style), Crime Topology Navigator (12-crime Markov transition matrix, FSC metric, `?weightByVeracity`), Victim Risk Shield (repeat victim scoring, `?weightByVeracity`), GBV Analytics Hub (conviction rates, resources), FIR CRUD API, Zia voice pipeline (Kannada STT→translate→query→TTS), Legal RAG (40+ BNS sections, keyword TF scoring, Zia fallback), QuickML hotspot prediction (XGBoost, `?weightByVeracity`), anomaly detection alerts (Z-score outlier + repeat victim), Dark Figure estimation (±35% uncertainty, KCVS 2019), Solvability Index (QuickML classifier, 0-100), Fairness Audit Dashboard, Hotspot Map, Network Graph, CounterCrime Simulator, Temporal Crime Genome, FIR Quality Score.

**D01 Proactive Agentic Policing:** Cross-check similarity heuristic (CrimeHeadID +60, DistrictID +20, date proximity +10, threshold ≥40). Agentic Police function (4 routes: cross-check, demo, actions, briefs). Daily Brief function (60-day rolling avg, 20 districts, cron + manual). Alert Job extended (CASE_STARTER at Z-score >3.0). AgentPanel.jsx (4 states, auto-refresh, case-starter workflow).

**D02 Case Management:** Case management function (20 cases, 12 crime types, 6-stage state machine: Registered→Scrutiny→Investigation→ChargeSheet→Trial→Closed, AI leads, golden timer). CaseManagementPanel.jsx (2-column: case list + detail, stage progress, checklist, leads, golden timer countdown).

**Beat & Patrol Optimizer:** Express function (3 endpoints: GET /beats, POST /optimize, GET /patrol). Heuristic load balancing + nearest-neighbor patrol routing. BeatOptimizerPanel.jsx (3-tab: beats table, optimization summary, patrol routes). Routes + sidebar in all 3 dashboards.

**Key platform constraints:** 30s function timeout. No PostGIS. 300-row Data Store fetch limit (pagination required). No WebSocket (5s polling). HashRouter mandatory for Slate. No Circuits (India DC) — Signals event bus. QuickML SDK internal auth. 1.9MB JS bundle (Chunks >500 kB WARNING). Zero tests across codebase. App.jsx ~250 lines of copy-paste route duplication.

**Research inputs (run a32e6ef3):** Competitor landscape — MahaCrimeOS AI (Dec 2025, 1,100 stations, auto investigation plans), CrimeOS AI (CyberEye 2026, 5-stage agentic pipeline, 90% case rate, real-time dashboards), Project Trinetra (Akola 2025, predictive policing RORS), CCTNS 2.0 (MHA Apr 2026, entity resolution, RTM dashboard). Cross-domain analogies researched: epidemiology (R₀ for near-repeat crime), finance (GNN anti-fraud, CAT bonds for exceedance), cybersecurity (ISAC threat intel sharing), logistics (VRP for beat routing, Amazon PROPHET), gaming (procedural generation for synthetic FIRs), aviation safety (NTSB accident investigation → Swiss Cheese model). KSP strategic context: ISO 27001 certification (May 2026), Home Minister 100-day plan (crime prevention, underreporting) aligning with NCRB 2025 data gaps.

## Ideation Frames Used

1. **Pain and Friction** — user/operator pain points; slow/broken/annoying
2. **Inversion, Removal, Automation** — invert painful steps, remove, automate away
3. **Assumption-Breaking and Reframing** — what's treated as fixed but is actually a choice
4. **Leverage and Compounding** — one-time investments that multiply in value
5. **Cross-Domain Analogy** — how different fields solve structurally analogous problems
6. **Constraint-Flipping** — invert/extreme constraints to surface unexpected designs

## Ranked Survivors

**Legend:** ✅ Implemented (already built). 🔶 Partially built (needs extension). ⬜ Unexplored (not yet built).

---

### 1. FIR Variant Surveillance — Real-Time Crime-Type Drift Detection ⬜

**Warrant:** `external:` Genomic epidemiology variant surveillance (Rambaut et al. 2020, Pango lineage system). `direct:` Crime Topology Navigator exists with Markov transition matrix; anomaly alerts exist for outlier detection. `reasoned:` Crime types evolve ("robbery" in 2024 vs 2019 is structurally different); transition matrix cannot detect this, embedding drift can.

**Description:** Replace static FIR crime-type labels with daily embedding-space clustering. Each day's FIRs embedded via QuickML LLM (Qwen 2.5 7B on Catalyst), projected into 2D UMAP, compared against 30-day rolling cluster structure via HDBSCAN + Jaccard similarity. When similarity drops below 0.7 → "crime variant" alert. The 12-crime topology gets a spectrogram overlay showing each type's representational stability over time.

**Why it matters:** Turns topology from static viz into early-warning system. Directly ties "crime genome" metaphor to operational insight. Innovation knockout for judges.

**Downsides:** Embedding dimension and cluster sensitivity need tuning. Risk of false positives from seasonal variation.

**Confidence:** 90% | **Complexity:** Medium | **Status:** Unexplored

**Implementation sketch (3 days):**
- Day 1: QuickML LLM `/embed` endpoint (128-dim vectors from FIR text)
- Day 2: AppSail Python job — HDBSCAN nightly, Jaccard vs 30-day baseline, store drift scores
- Day 3: Frontend drift badge on TopologyPanel + spectrogram overlay
- Total: ~150 lines Python + ~30 lines React + 1 function endpoint

---

### 2. Crime Black Box Reconstruction — Automated Investigative Timeline ⬜

**Warrant:** `direct:` Innovation gaps explicitly cite "no cross-FIR contradiction detection" and "no BCP Safe City camera integration." `external:` Aviation safety investigation (NTSB/BEA) — timeline reconstruction from heterogeneous data sources. `reasoned:` BCP Safe City's 5 lakh cameras produce metadata mated with FIR timestamps; even basic temporal cross-checking catches fabrications.

**Description:** Automated timeline reconstruction engine. Ingests all FIRs per CaseMasterID (complainant, counter-FIR, witness FIRs), plus evidence metadata (CCTV timestamps, call records, forensic reports). Constructs a directed acyclic event graph. Flags:
- **Gaps:** time ranges with no data
- **Contradictions:** two FIRs, same time+place, incompatible descriptions
- **Corroboration:** independent sources agreeing on a fact (confidence boost)

Output is a visual timeline with confidence bands per data point, color-coded by source.

**Why it matters:** Closes 3 gaps in one feature (contradiction, camera integration, investigative tooling). Highest operational impact — investigators spend enormous time manually cross-referencing.

**Downsides:** Real camera API requires BCP partnership. Demo uses synthetic camera feeds.

**Confidence:** 85% | **Complexity:** High | **Status:** Unexplored

**Implementation sketch (5 days):**
- Day 1-2: AppSail Python service — event DAG from FIR dates, mock camera metadata table
- Day 3: Contradiction engine (set operations on time+location+description)
- Day 4: React timeline component with confidence bands
- Day 5: Signals event bus wiring (new FIR → recompute linked cases)
- Total: ~300 lines Python + ~180 lines React + 1 AppSail service

---

### 3. Dark Figure Layer — Latent Crime Estimation from Underreporting 🔶

**Warrant:** `direct:` Karnataka Crime Victimisation Survey (Azim Premji University 2019) cited in implementation plan, never used. `direct:` GBV analytics already queries FIR data — Tandfonline 2026 finds FIRs undercount GBV. `external:` Crime victimization surveys globally show 50-80% underreporting for GBV, property crime.

**Description:** QuickML regression model estimates "actual crime" vs "reported crime" per district. Features: district demographics, literacy rate, urban/rural ratio, police presence, prior GBV reporting rates, survey-based victimization baselines. Output per district per crime type: `{firCount, estimatedTotal, gap, recommendation}`. The gap metric changes operational response — high gap → community outreach, not patrols.

**Why it matters:** Pre-empts the hardest judge question ("what about underreporting bias?"). Changes operational decision-making. Only entrant thinking about this.

**Downsides:** 2019 survey data may not reflect post-COVID reality. Estimates require caveats.

**Confidence:** 80% | **Complexity:** Medium | **Status:** Partially implemented (basic estimation exists; needs non-police signal extension)

**Implementation sketch (2 days):**
- Day 1: QuickML AutoML regression on survey features + demographics → reporting probability per crime type
- Day 2: `GET /dark-figure?district=X` endpoint + frontend comparison bars widget
- Total: ~80 lines Python (training) + ~60 lines JS + ~50 lines React

---

### 4. Station-in-a-Box — Offline Crime Genome ⬜

**Warrant:** `direct:` VeriPol scoring is deterministic (precomputable). XGBoost model binary (~100KB) runs in-browser via ONNX.js. React SPA is fully client-side (HashRouter) — switch API to IndexedDB. `external:` AI-BEAVERS 2026: "deployment pipeline > polished demo." Offline mode proves deployability in rural Karnataka with intermittent connectivity. `external:` BPR&D New Sub Beat System — remote Karnataka stations often lack reliable internet.

**Description:** Nightly AppSail job produces a ZIP archive: SQLite DB (30 days FIRs + precomputed scores + topology graph + risk scores), XGBoost→ONNX.js model, static React build configured for offline mode. Officer downloads ZIP, extracts, opens `index.html`. Works completely offline. New FIRs queue locally, sync on reconnect via delta merge.

**Why it matters:** Bridges gap between "won a prize" and "deployed in 1100 stations." Answers Scalability criterion definitively. Only project that works where connectivity doesn't.

**Downsides:** 2-3 week engineering effort. ONNX.js inference speed on old hardware. SQLite merge conflict resolution.

**Confidence:** 85% | **Complexity:** High | **Status:** Unexplored

---

### 5. Solvability Index — Case Triage at FIR Creation ✅

**Warrant:** `direct:` FIR CRUD API provides all input features (IPC sections, timestamps, location, witness fields). QuickML is deployed but only used for hotspot prediction. `direct:` FIR Veracity Index scores credibility — solvability is the natural complement. `reasoned:` District clearance rates vary dramatically (Bengaluru Urban vs rural Kalaburagi). Uniform investigative process ignores this. Solvability Index enables adaptive resource allocation without human bias.

**Description:** QuickML binary classifier predicts solvability (arrest+charge+conviction within 90 days) from 6 initial FIR features: evidence types, time-to-report delay, MO specificity, district historical clearance rate, witness count, suspect identified flag. Output is 0-100 score visible on every FIR detail view. High-solvability → fast-track queue. Low-solvability → specialized resource allocation (cyber cell, cold case team).

**Why it matters:** Directly addresses India's #1 police problem: case backlog. NCRB reports millions of pending investigations. Triage by solvability probability is the most defensible prioritization method.

**Downsides:** Needs historical solvability training data — may need synthetic labeling.

**Confidence:** 80% | **Complexity:** Low-Medium | **Status:** Implemented

---

### 6. Svarah Vault — Voice-First FIR Intelligence Pipeline ⬜

**Warrant:** `direct:` Zia voice pipeline exists (Kannada STT→translate→query→TTS). VeriPol linguistic markers naturally extend to spoken-language features (VeriPol 2018 methodology supports this). `external:` Police Scotland "Voice-FIR" pilot (2024) found 40% less documentation time. `reasoned:` Every FIR system in India is form-based. Voice-first is more accessible for low-literacy complainants and faster for officers.

**Description:** Extended Zia pipeline: STT → transcript → 3 parallel Catalyst Function extractors: (a) Zia Text Analysis for entities, (b) QuickML classifier on transcript embeddings for crime type, (c) cosine similarity search against prior transcripts for linked cases. Frontend is voice-first — officer speaks a query, hears "3 similar incidents found." VeriPol extends to filler word density, self-correction count, pause frequency.

**Why it matters:** No Indian police tech does voice-first intelligence. Directly serves low-literacy complainants. Innovation criterion knockout.

**Downsides:** Zia STT accuracy on long Kannada recordings unvalidated. Embedding pipeline latency. Voice marker accuracy unproven.

**Confidence:** 75% | **Complexity:** High | **Status:** Unexplored

---

### 7. VeriPol Score as Downstream Weight Modulator ✅

**Warrant:** `direct:` Veracity index computes score (0-100) per FIR. Topology navigator transition matrix currently counts raw FIRs — `?weightByVeracity=true` is one parameter change. `external:` VeriPol paper (Quijano-Sánchez 2018) explicitly discusses downstream weight modulation as next research step — this is novel even against prior art. `reasoned:` Fabricated FIRs distort topology transitions, hotspot predictions, and victim risk scores. A veracity-weighted pipeline is self-correcting.

**Description:** FIR weight = `veracity_score` instead of `1` in topology transitions. Hotspot prediction: filter FIRs with veracity < 0.3. Victim risk: exclude FIRs with veracity < 0.2 from repeat count. All toggled via `?weightByVeracity=true` query param, defaulting off. Implemented across topology_navigator, quickml_predict, victim_risk_shield.

**Why it matters:** Purest technical expression of "garbage in, garbage out" defense. Judges see compounding logic instantly.

**Downsides:** Exhibition risk — if veracity model is wrong, error propagates. Must be toggleable with clear demo framing.

**Confidence:** 85% | **Complexity:** Low | **Status:** Implemented (query param on 3 functions)

---

### 8. Transit Detection Early Warning — Crime Signal Burst Detection ⬜

**Warrant:** `external:` Exoplanet transit detection via Box-Least-Squares (Kovács et al. 2002) — finds periodic dimming events in noisy stellar flux. `direct:` Temporal Crime Genome exists (monthly crime time-series per district+type). `reasoned:` Crime sprees create characteristic time-series signatures (rapid onset, plateau, decay). Z-score anomaly detection catches outliers but misses extended multi-day bursts. BLS adapted as sliding-window box-duration search.

**Description:** Port BLS algorithm to crime time-series data. Searches for box-shaped bursts (rapid rise, sustained elevated counts, decay) across sliding temporal windows. Each detected "transit" gets: duration (days), amplitude (% above baseline), significance (S/N ratio). Overlaid on Temporal Crime Genome heatmaps as transit markers. Configurable per crime type and district. Clusters: detection confidence for operational response.

**Why it matters:** Z-score fires on every village festival (false positives). Transit detection distinguishes crime sprees from statistical noise. Complement to FIR Variant Surveillance — that detects structural drift, this detects transient events. Judges see cross-domain algorithm port — strong Innovation + Presentation hook.

**Downsides:** BLS assumes box-shaped signals; real crime sprees have irregular shapes. Sensitivity/ specificity tradeoff needs tuning.

**Confidence:** 80% | **Complexity:** Medium | **Status:** Unexplored

**Implementation sketch (2 days):**
- Day 1: AppSail Python — BLS over daily FIR count array, store transit events in Data Store table
- Day 2: React overlay component for Temporal Crime Genome — transit markers + confidence badges
- Total: ~100 lines Python + ~80 lines React, no new Function endpoint (reuses Temporal Crime Genome frontend)

---

### 9. Crime Catastrophe Exceedance Curve — Actuarial Risk Triage ⬜

**Warrant:** `external:` Insurance/reinsurance standard — exceedance probability (EP) curves for catastrophe risk (Swiss Re, RMS). `direct:` Solvability Index exists (per-case triage). `direct:` CounterCrime Simulator exists (what-if queries). `reasoned:` Aggregate risk exposure (expected crime cost) is a separate question from case-level triage. EP curves answer "what's the 1-in-10-year crime event in this district?" — strategic resource planning the KSP currently cannot do.

**Description:** Exceedance curve per district+crime-type: X = crime count, Y = probability of exceeding that count in a year. Derived from historical FIR counts + Dark Figure gap adjustments. Output: 3 threshold lines (10yr, 5yr, 1yr return period) with district overlay. Frontend is compact risk gauge + return-period selector. Exposed as a new tab in CounterCrime Simulator or standalone widget on Strategic Dashboard.

**Why it matters:** Gives KSP leadership what no competitor offers — actuarial-grade risk language. "1-in-10-year robbery event in Bengaluru Urban exceeds 2,400 FIRs" is a sentence no other dashboard can generate. Direct Impact on strategic planning. Strong Presentation hook with insurance analogy.

**Downsides:** 2 years of data → 1yr return period is speculative. Needs caveat labeling. Less useful at station level.

**Confidence:** 85% | **Complexity:** Low | **Status:** Unexplored

**Implementation sketch (1 day):**
- Day 1: Python batch in existing AppSail — 5-line SciPy norm.fit per district+type, store mu/sigma, 10 EXP curves as JSON. React gauges widget.
- Total: ~40 lines Python + ~60 lines React, reuses existing AppSail container

---

### 10. 3-Click FIR — Progressive Auto-Fill FIR Wizard ⬜

**Warrant:** `direct:` FIR CRUD API has all input fields. VeriPol scores exist. `reasoned:` Every competitor's FIR form has 12+ fields — the assumption is that all must be filled before submission. Inversion: most fields can be auto-filled from identity lookup (Aadhaar/voter ID), previous FIR, or voice input. Three clicks covers: (1) identify complainant, (2) select crime type, (3) describe incident. Judges see the inversion instantly.

**Description:** Progressive FIR wizard — 3 screens. Screen 1: complainant identity (mobile/Aadhaar lookup auto-fills name, address, phone). Screen 2: crime type and location (type-ahead IPC section search, map pin, GPS geolocation). Screen 3: description input (text or voice via Zia STT). Remaining 9 fields auto-filled from defaults + previous FIR heuristics. Generates same POST /fir payload as the full form. Toggle to expand to full form for experienced officers.

**Why it matters:** Cuts documentation time by ~70%. Makes Crime Genome accessible to officers who avoid the full form. Innovation hook: "everyone builds forms, we eliminated them." Directly contrasts with CrimeOS AI's automated investigation plans (they also start from a full FIR — we start from 3 fields).

**Downsides:** Auto-fill accuracy depends on identity database quality. Demo with synthetic data will look trivial. Must exist alongside full form, not replace it.

**Confidence:** 90% | **Complexity:** Low | **Status:** Unexplored

**Implementation sketch (1.5 days):**
- Day 1: 3-step React form component (StepIndicator + screens). Auto-fill from existing FIR CRUD lookup endpoint.
- Day 0.5: Wire to POST /fir, add toggle to expand to full form.
- Total: ~200 lines React, no new backend

---

### 11. Victim-Notified Justice — Automated Case Stage Notifications ⬜

**Warrant:** `direct:` Case management exists (6-stage state machine with lastUpdated timestamps). `direct:` GBV Analytics Hub cites victim drop-off rates. `external:` Police Scotland "Voice-FIR" pilot found 40% less documentation time and similarly improved victim satisfaction from automated updates. `reasoned:` NCRB data consistently shows victim attrition — complainants stop following up because they never hear back. Automated stage-change notifications (SMS/WhatsApp) address the #1 citizen pain point with zero per-case police effort.

**Description:** Check-for-notifications endpoint: `/case/check-notifications?caseId=X` returns unsent stage-change notifications. Backend-only feature (no new frontend — notifications surface in Agent Panel or through an external SMS gateway). When case transitions stage (Filing→Scrutiny→Investigation→Charge Sheet→Trial→Closed), the state machine writes a `pending_notification` row to a Notifications table. A cron function or check endpoint reads pending notifications. Demo: show notification inbox with case stage changes. Production: SMS gateway or WhatsApp Business API.

**Why it matters:** Directly targets KCVS 2019's 977× GBV reporting gap — victims stop reporting because they see no follow-through. Automated notification costs nothing and changes the perception of police responsiveness. Highest Impact-per-effort ratio of any candidate. Every competitor focuses on police-facing tools; this is citizen-facing.

**Downsides:** SMS gateway cost (negligible for demo). WhatsApp API requires business verification. Demo uses in-app notification inbox.

**Confidence:** 95% | **Complexity:** Low | **Status:** Unexplored

**Implementation sketch (1 day):**
- Day 0.5: Add notification table + write-to-notifications in case_management stage transitions (6 inserts)
- Day 0.5: Check endpoint + frontend notification badge/inbox component
- Total: ~50 lines backend + ~100 lines React, no new Function

---

### 12. Deterrence Dashboard — Citizen-Facing Sanitized Crime Intel ⬜

**Warrant:** `external:` Crime prevention through environmental design (CPTED) — publishing crime patterns deters opportunistic crime. `direct:` Hotspot Map + Dark Figure + Temporal Crime Genome data already aggregated. `reasoned:` All competitors show police-facing dashboards. None publish strategic crime intel as a deterrence tool. Flipping the constraint: instead of hiding crime data (fear of panic), publish sanitized aggregate stats → citizens self-protect + deterrence effect.

**Description:** Read-only public dashboard with sanitized aggregate crime metrics: per-district crime index (1-10), current week's most common crime type, safety trend (↑=worsening/↓=improving, ±10% threshold), prevention tips per ward. No individual FIR data, no names, no addresses below district level. Auto-generated daily from existing Feature Store aggregates. Separate route, no auth required. KSP branding.

**Why it matters:** Zero-competition territory for datathon. Judges see a project that serves citizens, not just police. Strong Impact + Presentation hook (KSP showing transparency). Politically aligned with Home Minister's 100-day plan on public trust.

**Downsides:** Must be careful to avoid alerting criminals ("Wednesday is low-patrol day"). Aggregate + 24h delay mitigates this. May be seen as scope creep for a police-facing datathon.

**Confidence:** 80% | **Complexity:** Low | **Status:** Unexplored

**Implementation sketch (1 day):**
- Day 0.5: Read-only route bypassing auth, returning sanitized aggregates
- Day 0.5: Minimalist public React page (no sidebar, KSP header, 4 metric cards)
- Total: ~40 lines backend + ~120 lines React

---

### 13. Criminal-Flow Beats — Inverted Beat Assignment ⬜

**Warrant:** `direct:` Beat Optimizer exists (3 endpoints: beats, optimize, patrol). `direct:` Network Graph exists (criminal association edges). Topology Navigator captures crime-type transitions. `reasoned:` All beat optimization literature (Heliyon 2023, PPS-MOEA/D 2025) assigns beats to cover crime density. Inversion: assign beats based on where criminals live and move (from arrest data, network centrality), not where crimes occur. Catch criminals before they commit.

**Description:** New "flow" mode for Beat Optimizer. Input: criminal residence locations (from arrest records), association edges (from Network Graph), predicted crime-type transitions (from Topology Navigator). Output: beat boundaries that minimize criminal intra-beat travel distance to predicted target areas. Combined with existing crime-density beats as a weighted overlay. Frontend toggle: "Density mode" vs "Flow mode" with visual comparison.

**Why it matters:** Changes the framing from reactive (cover past crime) to proactive (cover criminal flow). Directly ties to D01 agentic policing philosophy. Only team with a proactive vs reactive beat comparison. Strong Presentation narrative.

**Downsides:** Criminal residence data quality is poor in real police data (addresses may be fake). Demo uses synthetic criminal residence clusters. Beat boundaries change weekly — impractical for real deployment without officer buy-in.

**Confidence:** 85% | **Complexity:** Medium | **Status:** Unexplored

**Implementation sketch (2 days):**
- Day 1: Extend beat_optimizer POST /optimize — accept flowMode=true, compute criminal-density Voronoi, blend with crime-density
- Day 1: Extend BeatOptimizerPanel — flow/density toggle, side-by-side comparison
- Total: ~80 lines Node.js + ~80 lines React, extends existing function+component

---

### 14. Network-First Genome — Graph as Primary Interface ⬜

**Warrant:** `external:` CrimeOS AI and MahaCrimeOS use table/list dashboards. None show a force-directed graph as the PRIMARY interface. `direct:` Topology Navigator + Network Graph both exist as secondary panels. `reasoned:` The crime genome metaphor demands a visual genome browser. A table is not a genome browser. Making the graph the primary interface (not a secondary viz) differentiates from every competitor instantly.

**Description:** Rearrange landing dashboard to show Network Graph as the default view (not sidebar widget). FIR search, case management, alerts become overlay panels triggered from graph nodes. Every click on a node expands its genome card (crime types, recent FIRs, linked persons, risk scores). 3 layout modes: topology (crime-type flow), social (person-person links), spatial (geo-clustered). Keyboard shortcuts for power users.

**Why it matters:** Low-code-change, high-presentation-impact rewrite of existing components. Graph is already built. This is a layout + routing change, not a new feature. The visual impact on judges in a 5-minute demo is disproportionate to effort.

**Downsides:** Graph as primary interface may confuse non-technical judges. Must keep traditional dashboard accessible in 1 click. NetworkX force layout may be slow for >1,000 nodes — precompute positions nightly.

**Confidence:** 95% | **Complexity:** Low | **Status:** Unexplored

**Implementation sketch (1 day):**
- Day 0.5: Restructure App.jsx to default-route to GraphPanel instead of Dashboard
- Day 0.5: Add overlay panels for FIR search, case mgmt, alerts triggered from graph node clicks
- Total: ~80 lines React (restructuring) + reuse of existing GraphPanel, TopologyPanel, AlertPanel components

---

## Rejection Summary

### Prior Rejections (from run b0f43c8d)

| # | Idea | Frame | Reason Rejected |
|---|------|-------|-----------------|
| 1 | Spec-Driven Feature Codegen | Inversion | Too expensive for 26-day sprint; post-hackathon tech debt |
| 2 | Auto-Generated Regression Tests | Inversion | Duplicates FIR Forge; below innovation bar |
| 3 | Transparent Pagination Layer | Inversion | Engineering improvement, not ideation-worthy |
| 4 | Convention-Based Route Splitting | Inversion | Below ambition floor; engineering hygiene |
| 5 | Automated Station Rollout | Inversion | Too speculative for datathon; no real stations |
| 6 | Citizen Window | Assumption-breaking | Duplicates Janata Eye (weaker framing) |
| 7 | Interop Fabric | Assumption-breaking | Too abstract; Camera Signal Layer more concrete |
| 8 | Adoption Engine | Assumption-breaking | Good ops but doesn't pass meeting test |
| 9 | Cost-Aware Recommendations | Assumption-breaking | Too speculative without real cost data |
| 10 | MO Embedding as Entity Key | Leverage | High complexity, theoretical downstream benefits |
| 11 | Signals as System Backplane | Leverage | Architecture decision, not ideation output |
| 12 | Topology Navigator as Crime Index | Leverage | Already partially implemented |
| 13 | Catalyst Auth as Feature Gate | Leverage | Engineering improvement, not innovation |
| 14 | Zia Voice as Universal I/O | Leverage | Duplicates Svarah Vault (stronger voice concept) |
| 15 | Parametric Synthetic Generator | Leverage | Merged into FIR Forge |
| 16 | Three-Way FIR Matching | Analogy | Merged into Crime Black Box (more comprehensive) |
| 17 | Crime Prediction Ensemble (Weather) | Analogy | Excellent concept, high implementation risk in 26 days |
| 18 | Crime Immune System (Immunology) | Analogy | 2-3 year institutional memory — unrealistic timeframe |
| 19 | ABC Crime Triage (Supply Chain) | Analogy | Merged into Skeleton Crew / Solvability Index |
| 20 | Crime Biogeography (Ecology) | Analogy | Too academic for judges to evaluate in 5 minutes |
| 21 | FIR Forge (Gaming procedural gen) | Analogy | High effort for indirect value; synthetic data already exists |
| 22 | PreCrime Grid | Constraint-flipping | Duplicates Societal Response Router |
| 23 | Truth First (perfect data mode) | Constraint-flipping | Interesting inversion, below pragmatism threshold |
| 24 | Societal Response Router | Constraint-flipping | Politically sensitive for KSP Datathon audience |
| 25 | Skeleton Crew (extreme staffing) | Constraint-flipping | Macabre framing; Solvability Index covers same territory |
| 26 | Janata Eye (public crime map) | Constraint-flipping | Separate from core platform; better as Phase 2 |
| 27 | Camera Signal Layer | Constraint-flipping | Merged into Crime Black Box |
| 28 | Crime Topology Drift Detection | Inversion | Merged into FIR Variant Surveillance (richer concept) |
| 29 | Signal-Driven Contradiction Engine | Inversion | Merged into Crime Black Box |

### New Rejections (from run a32e6ef3)

| # | Idea | Frame | Reason Rejected |
|---|------|-------|-----------------|
| 30 | WhatsApp Bot for Beat Constables | Assumption-breaking | Good ops, below innovation bar for datathon; Svarah Vault covers voice interface more distinctively |
| 31 | Print Beat Card (thermal for constables) | Assumption-breaking | Too low-tech for Innovation 25% criterion; good in production, wrong for datathon |
| 32 | Citizen Risk Radar | Assumption-breaking | Duplicates Janata Eye (R26) — citizen-facing crime query was already rejected |
| 33 | Procedural Friction Score | Assumption-breaking | Too speculative to implement meaningfully; Fairness Audit covers bias detection |
| 34 | Jurisdictionless Genome | Assumption-breaking | Politically sensitive (cross-district data sharing); same issue as Societal Response Router (R24) |
| 35 | Crime Phylogenetics (Historical Linguistics) | Analogy | Same fatal flaw as Crime Biogeography (R20) — too academic for 5-minute judge evaluation |
| 36 | Cognitive Debiasing for Investigations | Analogy | Hard to implement meaningfully in 13 days; partial overlap with FIR Quality Score |
| 37 | Crime Reaction Kinetics (Chemistry) | Analogy | Too speculative; no clear implementation path in 13 days |
| 38 | Herd Immunity Patrol Saturation | Analogy | Same fatal flaw as Crime Immune System (R18) — institutional memory unrealistic |
| 39 | Synthetic FIR Forensics (adversarial training) | Constraint-flipping | Duplicates VeriPol concept (adversarial FIR detection); different framing, same feature |
| 40 | Precomputed View Cache (static dashboards) | Constraint-flipping | Engineering improvement, below innovation bar; Materialized Feature Store (new leverage) same class |
| 41 | Smoke Test Mode ($0 graceful degradation) | Constraint-flipping | Deployment pattern, not ideation-worthy |
| 42 | Scenario Cards (10yr strategic outputs) | Constraint-flipping | Already covered by CounterCrime Simulator (existing feature) |
| 43 | Shared Embedding Pipeline | Leverage | Engineering improvement; good to build as infrastructure but not an ideation survivor |
| 44 | Universal Entity Resolution Layer | Leverage | Engineering improvement; speculative downstream benefit |
| 45 | Materialized Feature Store | Leverage | Engineering improvement; enables Precomputed View Cache (also rejected) |
| 46 | Zero-to-One Test Infrastructure | Leverage | Essential hygiene but won't win Innovation 25% |
| 47 | Route-Based Code Splitting (React.lazy) | Leverage | Engineering improvement; 1.9MB bundle is a deployment concern, not demo-impact |
| 48 | Unified Catalyst Table Index Strategy | Leverage | Database administration, not innovation |
| 49 | LLM Call Cache | Leverage | Infrastructure optimization; no judge-visible impact |
| 50 | Maps Show Pretty Lies (300-row truncation) | Pain/Friction | Problem statement, not a solution; addressed by Materialized Feature Store approach |
| 51 | Every Dashboard Says 300 (silently) | Pain/Friction | Problem statement |
| 52 | App Takes a Coffee Break (1.9MB bundle) | Pain/Friction | Problem statement |
| 53 | Navigation Breaks on Deploy (zero tests) | Pain/Friction | Problem statement |
| 54 | Real-Time Is Actually 30s-Old Intel | Pain/Friction | Problem statement; no WebSocket, fundamental constraint |
| 55 | Z-Score Alerts Every Village Festival | Pain/Friction | Problem statement; addressed by Transit Detection Early Warning (S8) |
| 56 | Twenty Features, Zero Onboarding | Pain/Friction | Problem statement |
| 57 | No One Can Prove Any of It Works | Pain/Friction | Problem statement |

## Cross-Cutting Combinations

### Prior Combinations (from run b0f43c8d)

- **FIR Variant Surveillance + Crime Black Box:** Variant Surveillance detects drift; Black Box reconstructs the specific incident pattern driving it.
- **Dark Figure Layer + Solvability Index:** Dark Figure identifies underreported areas; Solvability Index triages what gets investigated where reporting exists. Combined: full resource allocation intelligence.
- **VeriPol Weight Modulator + FIR Variant Surveillance:** Weighted FIRs produce cleaner embedding clusters → more accurate drift detection.
- **Station-in-a-Box + Svarah Vault:** Offline mode with preloaded voice packs enables voice-first FIR filing in disconnected stations (most rural use case).

### New Combinations (from run a32e6ef3)

- **Transit Detection + FIR Variant Surveillance:** Transit Detection catches burst events (crime sprees); Variant Surveillance catches structural drift (MO evolution). Together: full-spectrum temporal anomaly detection. One backend, one frontend overlay.
- **3-Click FIR + Victim-Notified Justice:** The citizen journey from 3-click filing to automated follow-through. Complete "citizen-first" narrative arc for judges — shortest path to filing + zero-effort tracking. Stronger Presentation than either alone.
- **Criminal-Flow Beats + Network-First Genome:** Flow beats displayed on the graph-as-primary-interface. Judge clicks a criminal node → sees its flow beat overlay → toggles to see how beat boundaries shift. Visualizes the proactive policing narrative.
- **Deterrence Dashboard + Crime Catastrophe Exceedance Curve:** Public-facing risk dashboard with actuarial-grade language. "Your district's 1-in-5-year crime risk is Moderate" is the kind of output that drives press coverage and citizen trust.
- **3-Click FIR + Svarah Vault:** Voice input as the "zero-click" mode for 3-Click FIR. Officer speaks complainant details → auto-fills step 1 and 2. Combined: zero-form + voice-first = no fields at all.
- **Crime Catastrophe Exceedance + CounterCrime Simulator:** "What-if" queries answered in actuarial terms — "increasing patrol by 10% reduces your 1-in-5-year exceedance from 2,400 to 2,100." Only possible combination at this datathon.
- **Network-First Genome + All Features:** The graph-as-primary-interface pattern elevates every existing feature — topology, black box, transit detection, case management — by making them discoverable from a single visual surface. Highest leverage per effort.

---

## DB-Schema-Grounded Ideation (Run 3 — 2026-07-06)

**Focus hint:** KSP FIR System ER Diagram — full database schema (CaseMaster, ComplainantDetails, Victim, Accused, ArrestSurrender, ActSectionAssociation, CrimeHead/SubHead, Employee, Unit, Court, ChargesheetDetails, CaseStatusMaster).

**Frames used:** Pain & Friction, Leverage & Compounding, Assumption-Breaking (3 sub-agents, 24 raw ideas; cross-domain analogy agent aborted — ideas generated from schema knowledge).

### New Survivors (8)

---

### 15. Arrest Vector — The Geography of Capture ⬜

**Warrant:** `direct:` `CaseMaster` has `latitude`/`longitude` for the *incident*; `ArrestSurrender` has its own `ArrestSurrenderStateId`/`ArrestSurrenderDistrictId`/`PoliceStationID` for the *arrest*. Two geographies per case, both in the schema. `reasoned:` The vector from crime-location to arrest-location is itself a metric — long vectors reveal cross-district/interstate hideouts, near-zero vectors reveal on-scene arrests, recurring short vectors at the same spot reveal habitual safe-houses.

**Description:** Compute the geographic vector (distance + bearing) from each case's incident GPS to its arrest location. Visualize as a flow map: arrows from crime to arrest, colored by distance band. Aggregate by district to show "where do we arrest FROM" — fugitive corridors, surrender hotspots, stations whose catchment extends beyond their jurisdiction. Cross-reference with `GravityOffenceID` — heinous crimes should have longer vectors (flight), short vectors for heinous crimes may indicate immediate apprehension (good) or station-level data-entry shortcuts (bad).

**Why it matters:** "Where do we arrest from?" is a question about police reach, not about crime. Zero existing survivor or competitor covers this angle. The visual impact on judges — flow arrows on a map — is immediate and visceral.

**Downsides:** Arrest location precision depends on data-entry discipline. Some arrests have no GPS (only district/station). Need fallback to district-centroid distance.

**Confidence:** 90% | **Complexity:** Low-Medium | **Status:** Unexplored

---

### 16. Retraction Rate — cstype B/C as System Failure Metric ⬜

**Warrant:** `direct:` `ChargesheetDetails.cstype` is an explicit enum: A=Chargesheet, B=False Case, C=Undetected. Today the dashboard treats cstype=A as closure and ignores B/C. `reasoned:` The B+C rate per station/IO/section is a data-quality and investigative-failure signal. High B-rate = over-filing (reactive registration, 498A-style) or weak investigation. High C-rate = unsolved crime. Both are station health indicators that "chargesheet rate 0.78" silently hides.

**Description:** New panel: "FIR Retraction Audit." For each station/IO/crime-type, show the full outcome funnel: Filed → Chargesheeted (A) / False Case (B) / Undetected (C) / Still Pending. The B+C rate is the "retraction rate" — how often KSP formally opens a case and then formally retracts it. Color-code: high B-rate stations flagged for over-filing review; high C-rate stations flagged for solvability support. Trend over time to see whether retraction rate improves or worsens.

**Why it matters:** Inverts the standard "chargesheet rate" KPI. Every competitor shows chargesheet rate as a success metric. None show the failure denominator. A judge seeing "Station X chargesheets 80% of cases, but 15% are false cases and 20% undetected" gets a completely different picture. Highest insight-to-effort ratio.

**Downsides:** cstype B can be legitimate (genuine false FIRs). Need contextual labeling, not blanket "failure."

**Confidence:** 95% | **Complexity:** Low | **Status:** Unexplored

---

### 17. Chargesheet Clock — Statutory Deadline Countdown ⬜

**Warrant:** `direct:` `CaseMaster.CrimeRegisteredDate` + absence of matching `ChargesheetDetails.csdate` = days elapsed without chargesheet. `GravityOffenceID` indexes severity (heinous crimes carry stricter deadlines — 90 days, extendable to 180). `reasoned:` Late chargesheets trigger default bail under Section 167(2) CrPC — the case collapses, the accused walks free, and no panel tracks this.

**Description:** Per-case countdown timer from `CrimeRegisteredDate` to the statutory deadline (90 days for heinous, 180 for non-heinous, with extensions tracked). Color-code: green (>30 days remaining), amber (<15 days), red (<0 = deadline breached, bail rights triggered). Aggregate by station/district to show "how many cases will breach this month?" Add to Case Management panel as a column + filter. Auto-alert via the existing Agent Panel when a case crosses the amber threshold.

**Why it matters:** Late chargesheet = case collapse = accused released = wasted investigation. This is the single most preventable failure in the pipeline, and no dashboard surfaces it. Direct operational impact — an SHO seeing "12 cases breach deadline this month" can reallocate IO effort immediately.

**Downsides:** Deadline calculation has legal nuances (excludable days, extension filings). Demo version uses simple 90/180 day countdown with a note.

**Confidence:** 90% | **Complexity:** Low | **Status:** Unexplored

---

### 18. Mutual Accusation Signal — IsComplainantAccused as Contested-Crime Detector ⬜

**Warrant:** `direct:` `Accused.IsComplainantAccused` is a BIT flag — it exists *because* the complainant is sometimes the accused (mutual cross-FIRs in property-for-dowry, self-defense flips, malicious-prosecution counter-filing). `reasoned:` Mutual accusation clusters are an early-triage signal for 498A misuse AND genuine trafficking-camouflaged-as-domestic-dispute patterns. The flag exists, the dashboard ignores it.

**Description:** Panel showing mutual-accusation clusters: cases where `IsComplainantAccused = 1`, grouped by district/station/crime-type. Network view: complainant-accused pairs linked across multiple FIRs (serial mutual filers). Time-series: mutual-accusation rate per station over time (spikes may indicate coordinated harassment campaigns or retaliatory filing patterns). Cross-reference with `CrimeSubHead` — 498A (cruelty by husband/relatives) is the canonical mutual-accusation crime.

**Why it matters:** No competitor mines this flag. It's a structural column the schema designers added for a reason, and every dashboard treats accused and complainant as separate entities. Surfacing mutual-accusation patterns directly addresses the politically charged 498A misuse debate with data, not rhetoric.

**Downsides:** Politically sensitive. Must frame as "triage signal" not "misuse detector." Demo with synthetic data avoids real-case privacy issues.

**Confidence:** 85% | **Complexity:** Low | **Status:** Unexplored

---

### 19. Officer Career Spine — Dual EmployeeID Role Stitching ⬜

**Warrant:** `direct:` `Employee.EmployeeID` appears as `CaseMaster.PolicePersonID` (who registered the FIR), `ArrestSurrender.IOID` (who made the arrest), and `ChargesheetDetails.PolicePersonID` (who chargesheeted). Same person, three roles, three tables. `reasoned:` Stitching by `EmployeeID`/`KGID` creates a per-officer career timeline: cases registered → arrests made → chargesheet outcomes. One spine, many views: IO effectiveness rates, career-stage patterns, workload equity, mentorship networks.

**Description:** "Officer Career" panel: search by KGID/EmployeeID → timeline of all roles (registered N FIRs, made M arrests, chargesheeted K cases). Effectiveness metrics: chargesheet-A rate per officer, arrest-to-chargesheet conversion, average case-pendency per IO. Cross-reference with `Rank`/`Designation` to compare performance across ranks. Unit-level rollup: which stations have the best/worst IO effectiveness. Links to `Unit.ParentUnit` for circle/district comparisons.

**Why it matters:** Turns the Officers page from a directory into an analytics surface. Every competitor shows officer lists — none show career performance spines. The dual-role stitching is a schema insight no one else has noticed. Compounds with Solvability Index (S5) — per-officer solvability rates surface bias and skill gaps.

**Downsides:** Career data assumes officer stays at same unit — transfers create gaps. Demo uses static snapshot.

**Confidence:** 85% | **Complexity:** Medium | **Status:** Unexplored

---

### 20. Accused-at-Large Ledger — Named-But-Unarrested Tracker ⬜

**Warrant:** `direct:` `Accused` table lists every named accused per case. `ArrestSurrender` records actual arrests. Left join: `Accused LEFT JOIN ArrestSurrender ON CaseMasterID + AccusedMasterID` — rows with no arrest match = accused-at-large. `reasoned:` "Who's still out there?" is the most operationally urgent question a police dashboard can answer, and no panel surfaces it.

**Description:** Panel listing all accused persons with no matching `ArrestSurrender` record, sorted by `GravityOffenceID` (heinous first). Columns: accused name, PersonID (A1/A2/A3), case number, crime type, days-at-large (CrimeRegisteredDate to today), district. Flag repeat-at-large (same person named in multiple cases, never arrested). Aggregate by station: "Station X has 47 accused-at-large" is a headline no SHO can ignore.

**Why it matters:** Most embarrassing failure state for a police station. Named-but-unarrested is the gap between "we know who did it" and "we caught them." Judges see immediate operational value. Low complexity (one LEFT JOIN + display).

**Downsides:** Some "at-large" accused may have surrendered at a different station (data not linked). Need caveat labeling.

**Confidence:** 90% | **Complexity:** Low | **Status:** Unexplored

---

### 21. Duration-Weighted Harm — Incident Range as Severity Metric ⬜

**Warrant:** `direct:` `CaseMaster.IncidentFromDate`/`IncidentToDate` define a time range. Today the dashboard counts each CaseMasterID as one tally mark — a 30-second snatching weighs the same as a 14-week stalking campaign. `external:` Crime-science literature (repeat victimization, Sherman's hot-deviant-time) treats duration as a severity input. `reasoned:` A range spanning weeks or months is a *campaign*, not an incident — sustained victimization that count-based heatmaps render invisible.

**Description:** Compute `IncidentToDate - IncidentFromDate` as "harm duration" per case. Weight crime counts by duration: a 90-day case counts as 90 units, a 1-day case as 1 unit. Show on hotspot map: duration-weighted heat (where sustained harm concentrates) vs raw-count heat (where incidents are frequent). The difference between the two maps reveals "incident-dense but brief" areas (mugging corridors) vs "sustained-harm" areas (domestic violence, trafficking, harassment). Cross-reference with `CrimeSubHead` — DV/trafficking cases will dominate the duration-weighted view.

**Why it matters:** Reframes "crime count" as "harm exposure." Every competitor uses raw counts. Duration-weighting surfaces the exact crime types (DV, stalking, trafficking) that KSP most under-resources and that count-based analytics render invisible. Strong presentation hook: "1 FIR, 90 days of harm."

**Downsides:** Some cases have `IncidentFromDate = IncidentToDate` (point events). Need to handle null `IncidentToDate` (ongoing cases). Duration may reflect reporting delay, not actual harm duration.

**Confidence:** 80% | **Complexity:** Low | **Status:** Unexplored

---

### 22. Co-Accused Network — PersonID A1/A2/A3 as Graph Structure ⬜

**Warrant:** `direct:` `Accused.PersonID` encodes the prime-accused ordering (A1 = prime, A2/A3 = co-accused) within a case. `reasoned:` A repeat offender's signature isn't their solo cases — it's their *co-accused pattern*. The A1/A2/A3 ordering is a latent "role seniority" signal the schema encodes but no dashboard mines. `reasoned:` Co-offending network analysis is established in crime intelligence (Morselli 2009, "Inside Criminal Networks").

**Description:** Build an undirected co-accused graph: nodes = accused persons (deduped by name+demographics), edges = shared `CaseMasterID`, edge weight = number of shared cases. A1-A1 edges (two prime accused in the same case — rare, signals co-leadership) vs A1-A2 edges (prime + secondary — hierarchy). Panel features: gang core detection (dense clusters), recruiter pattern (one A1 rotating through fresh A2/A3s), repeat co-accused pairs (serial criminal partnerships). Cross-reference with `ArrestSurrender` — accused with high co-accused count but low arrest rate = likely protected/informant.

**Why it matters:** The existing NetworkGraph panel uses mock data. This grounds it in the actual schema's PersonID ordering — a structural signal no competitor uses. The A1-as-edge-weight convention encodes role seniority without a new table. Compounds with Criminal-Flow Beats (S13) — flow beats based on where criminals live, co-accused network based on who they work with.

**Downsides:** Name-based deduplication is unreliable (common names, aliases). Demo uses synthetic data with unique person keys.

**Confidence:** 80% | **Complexity:** Medium | **Status:** Unexplored

---

### New Rejections (from Run 3)

| # | Idea | Frame | Reason Rejected |
|---|------|-------|-----------------|
| 58 | Stale-Since-Incident Reporter | Pain | Subsumed by Case-Journey Timeline Backbone (L7) — same pipeline-gap tracking |
| 59 | Section Misfit Catcher | Pain | Requires authoring validation rules — engineering, not innovation |
| 60 | Recidivist Fingerprints | Pain | Subsumed by Co-Accused Network (S22) — both use Accused.PersonID for cross-case analysis |
| 61 | Court Pipeline Gridlock | Pain | Subsumed by Case-Journey Timeline — same pipeline tracking |
| 62 | Station Hierarchy Orphan Check | Pain | Data quality check, below innovation bar for datathon |
| 63 | CrimeNo Parser | Leverage | Engineering infrastructure — useful primitive but not a judge-facing feature |
| 64 | Unit Hierarchy Closure Table | Leverage | Engineering infrastructure — enables rollups but isn't itself a panel |
| 65 | CrimeHead Canonical Taxonomy | Leverage | Engineering infrastructure — data normalization, not innovation |
| 66 | Geo Grid Index | Leverage | Engineering infrastructure — spatial indexing, not a feature |
| 67 | Officer Dual-Role Handoff | Assumption | Subsumed by Officer Career Spine (S19) — both use dual EmployeeID role |
| 68 | CrimeNo Parseability as Discipline | Assumption | Subsumed by CrimeNo Parser (R63) — same structured-string insight |
| 69 | Charge-Bundle Graph (ActSectionAssociation co-occurrence) | Leverage | Strong concept, higher complexity than top 8, deferred to honorable mentions |
| 70 | Case-Journey Timeline Backbone | Leverage | Strong concept, subsumes P2/P7, but higher complexity — deferred to honorable mentions |
| 71 | Charge-Trajectory (ActSectionAssociation order) | Assumption | Strong reframing, but requires temporal section tracking not in mock data — deferred |
| 72 | Org-Tree Variance Decomposition | Assumption | Strong analytic, but requires closure table (R64) to implement — deferred |

### New Cross-Cutting Combinations

- **Arrest Vector (S15) + Accused-at-Large (S20):** Where do accused go when they flee? Vector shows the direction, ledger shows who's still missing. Combined: "3 heinous-crime accused at large, last known arrest vector points to Ramanagara district."
- **Retraction Rate (S16) + Officer Career Spine (S19):** Which officers have high B/C rates? Systemic over-filing or weak investigation? Combined: per-officer retraction profile surfaces both filing discipline and investigative quality.
- **Mutual Accusation (S18) + Charge-Bundle (R69):** Which charge bundles appear in mutual-accusation cases? 498A + 34 IPC + 323 IPC is the canonical mutual-accusation bundle. Combined: charge-stacking audit in contested-crime cases.
- **Chargesheet Clock (S17) + Case-Journey Timeline (R70):** Where in the pipeline does the clock expire? Which stage causes the most deadline breaches? Combined: bottleneck-stage × deadline-breach heatmap.
- **Duration-Weighted Harm (S21) + Dark Figure (S3):** Sustained-harm areas likely have higher dark-figure (underreporting is cumulative). Combined: "harm exposure × reporting gap" = true burden index.
- **Co-Accused Network (S22) + Criminal-Flow Beats (S13):** Flow beats based on where criminals live; co-accused network based on who they work with. Combined: "gang territory" overlay — where a gang operates (flow) + who's in it (network).

(End of file)
