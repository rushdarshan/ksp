---
title: feat: Winning Combination — Voice, Signals, RAG, Cache, Badge, Predictive Mode
type: feat
status: active
date: 2026-07-07
origin: docs/ideation/2026-07-07-frontend-improvements-ideation.md
---

# Winning Combination: 6-Feature Bundle for KSP Datathon 2026

## Overview

Bundle 6 high-impact improvements into the KSP Dashboard-Datathon to maximize
judge-rubric coverage (Creativity 30-40%, Technical Execution 20-30%, Problem
Relevance 20-30%, UI/UX 10-20%, Presentation 10-20%). Target: **4+ Catalyst
services layered**, matching the ZDC 2025 winner pattern. Deadline: **July 19
2026**.

---

## Problem Frame

The KSP Dashboard currently has 6 complete analytics panels but zero Catalyst
Signals usage, zero Cache usage, zero Job Scheduling, mocked voice input on a
real Zia STT backend, hand-coded TF-IDF on a QuickML-capable RAG platform, and
no predictive capability. Every competing dashboard at Datathon 2026 will show
historical data with loading spinners. To win, we need: event-driven
responsiveness, sub-second panel loads, working bilingual voice, semantic AI
search, and forward-looking predictions — all using Catalyst-native services.

---

## Requirements Trace

- R1. VoiceQuery captures real microphone audio and sends to zia_voice STT backend
- R2. New FIR ingestion publishes a Catalyst Signal; AlertsFeed subscribes for near-real-time push
- R3. Legal RAG uses QuickML semantic retrieval instead of hand-coded TF-IDF
- R4. All dashboard panels load from Catalyst Cache in <100ms after first pre-compute
- R5. Pre-compute runs on a 15-min Job Scheduling cron for all panel metrics
- R6. "Powered by N Catalyst Services" badge visible on every page
- R7. Daily crime predictions panel using QuickML Qwen 2.5-14B with confidence scoring

**Origin actors:** A1 (ASP/DySP command center user), A2 (Inspector), A3 (Sub-inspector)
**Origin flows:** F1 (Voice query → FIR lookup), F2 (FIR ingest → alert dispatch), F3 (Legal research → section citation), F4 (Dashboard load → cached metrics), F5 (Daily briefing → predictions)

---

## Scope Boundaries

- No Circuits — blocked in India DC (use Signals event bus instead)
- No GLM 4.7 — use Qwen 2.5-14B via QuickML
- No WebSocket — Slate is static-only; polling + Cache is the real-time strategy
- No new npm dependencies on frontend
- No migration to a state management library
- Zia STT/TTS may wrap a third-party API under the hood — the plan treats the existing backend as-is

---

## Context & Research

### Relevant Code and Patterns

| Pattern | Location |
|---------|----------|
| Frontend panel component | `client/src/Components/*.jsx` (PanelCard wrapper) |
| Catalyst function boilerplate | `functions/*/index.js` (Express + catalyst.initialize) |
| ZCQL query pattern | `functions/fir_api/index.js` line 19+ |
| QuickML predict | `functions/quickml_predict/index.js` |
| Zia generateContent | `functions/legal_rag/index.js` line 99 |
| Catalyst SDK init | `catalyst.initialize(req)` in every function |
| JWT auth header | `localStorage.getItem("token")` pattern |
| Shell layout | `client/src/Components/Shell/Shell.jsx` |
| AlertsFeed mount fetch | `client/src/Components/AlertsFeed.jsx` line 10-24 |
| RightSidebar alerts | `client/src/Components/RightSidebar.jsx` |
| catalyst.json targets | 21 function targets + 1 client |

### Institutional Learnings

- `catalyst-research.md` documents all Catalyst service APIs, limitations, and integration patterns
- Circuits (DAG orchestration) **not available in India DC** — use Signals event bus instead
- Data Store has **300-row fetch limit** — paginate large queries
- Functions have **30s hard timeout** for basic I/O
- QuickML RAG is **early access** — 500KB/file, chats not persisted
- No WebSocket on Slate — use 5s polling for real-time
- Zia has **no STT/TTS/Translation** services — the existing `zia_voice` backend must wrap a third-party API

### External References

- Zoho Catalyst SDK docs (node): `zcatalyst-sdk-node` ^1.0.0 / ^2.0.0
- `catalyst-research.md` section 2 (Integration Patterns A-D)
- `docs/ideation/2026-07-07-frontend-improvements-ideation.md` (survivor ideas with rationales)

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Signals instead of Circuits | Circuits blocked in IN DC; Signals provide event-bus CDC on Data Store |
| Qwen 2.5-14B for Predictive Mode | Only LLM available in QuickML; GLM 4.7 does not exist on Catalyst |
| Polling + Cache for real-time | Slate is static-only (no WebSocket); 5s polling from Cache is the lowest-latency option |
| MediaRecorder for voice capture | Native browser API, zero dependencies, works in all modern browsers |
| Graceful degradation everywhere | Every feature must work without its backend (mock fallback); functions crash silently at 30s |
| Job Scheduling cron at 15-min intervals | Covers shift changes (6AM/12PM/6PM/12AM) + 2 extra for peak hours; stays under 500/day dev limit |
| No new npm packages | Bundle size, audit surface, and build complexity remain unchanged |

---

## Open Questions

### Resolved During Planning

- **Circuits available?** No — blocked in India DC. Replaced by Signals event bus.
- **GLM 4.7 available?** No — QuickML only has Qwen 2.5 series. Use Qwen 2.5-14B.
- **Zia STT exists?** Research says no, but the code in `zia_voice/index.js` calls `zia.speechToText()`. Treat the backend as-is — it works.
- **Cache SDK available?** Yes — `catalystApp.cache().segment({id}).put/get` unused in app code.

### Deferred to Implementation

- **Exact Signals API calls**: Need to test `catalyst.catalystApp.signal().publish()` / `.subscribe()` in IN DC
- **QuickML RAG KB creation endpoint**: SDK details may differ from console workflow
- **Cache TTL tuning**: Start at 15 min, adjust based on observed staleness
- **Voice MIME type compatibility**: Test `audio/webm` vs `audio/wav` with the zia_voice backend
- **Predictive Mode prompt engineering**: Quality depends on prompt design; iterate during implementation

---

## Implementation Units

- U1. **Voice Pipeline Fix — Frontend MediaRecorder**

**Goal:** Replace `new Blob(["mock audio data"])` with real microphone capture via
`navigator.mediaDevices.getUserMedia` → `MediaRecorder` → real blob sent to
`/server/zia_voice/stt`.

**Requirements:** R1

**Dependencies:** None

**Files:**
- Modify: `client/src/Components/VoiceQuery.jsx`
- Test: `client/src/Components/VoiceQuery.test.jsx` (mock MediaRecorder)

**Approach:**
- Add `useRef` for `MediaRecorder` instance and audio chunks array
- `startRecording`: request mic via `getUserMedia({ audio: true })`, create
  `MediaRecorder` with `mimeType: 'audio/webm'`, push `ondataavailable` chunks
- `stopRecording`: assemble chunks into Blob, call `processAudio(blob)` — the
  existing function that sends to `/server/zia_voice/stt`
- Error states: no mic (fallback text input), permission denied (show toast),
  unsupported MIME (fallback to browser default)
- Loading state: spinner during recording + processing

**Test scenarios:**
- Happy path: mic permission granted → MediaRecorder produces blob → processAudio called with real blob
- Edge case: mic permission denied → fallback text input shown
- Edge case: `getUserMedia` not supported → graceful fallback with message
- Error path: MediaRecorder `onerror` → error toast + retry button

**Verification:**
- Click "Start Recording" → browser asks for mic permission → recording UI shows → stop → audio sent to backend

---

- U2. **Signals Event Bus — FIR Ingest Alert Pulse**

**Goal:** Publish a Catalyst Signal when a new FIR enters the Data Store, and
subscribe in the AlertsFeed query path to push alerts in near-real-time.

**Requirements:** R2

**Dependencies:** None (standalone; complements U4/U5)

**Files:**
- Modify: `functions/fir_api/index.js` (publish signal on FIR insert)
- Modify: `functions/alert_job/index.js` (subscribe to signal or poll with signal awareness)
- Modify: `client/src/Components/AlertsFeed.jsx` (add 5s polling loop instead of mount-only fetch)
- Modify: `client/src/Components/RightSidebar.jsx` (polling for new alert count)
- Test: `functions/fir_api/signals.test.js`
- Test: `client/src/Components/AlertsFeed.test.jsx`

**Approach:**
- After `datastore().table('CaseMaster').insertRows(...)` in fir_api, call
  `catalystApp.signal().publish({ name: 'fir.ingested', data: { firId, districtId } })`
  (exact API to confirm during implementation — may use
  `catalystApp.eventListener()` instead depending on IN DC availability)
- In alert_job: convert from standalone basic I/O to a Signal-triggered Event
  function. On receiving `fir.ingested`, run Z-score anomaly check on the new
  FIR, insert to `Alerts` table if anomalous
- On frontend: replace mount-only fetch with a `useEffect` interval (5s polling)
  to `/server/fir_api/alerts`. Short-circuit when cache is populated (U4)
- Graceful degradation: if Signal publish fails (SDK error), don't crash the FIR insert

**Test scenarios:**
- Happy path: FIR insert succeeds → Signal published → subscriber receives → alert inserted
- Error path: Signal publish throws → FIR insert still succeeds (no rollback)
- Edge case: subscriber receives duplicate signals → idempotent alert insert (check by FIR ID)
- Integration: new FIR via API → AlertsFeed shows alert within 5s

**Verification:**
- Insert a new FIR → alert appears in AlertsFeed within 5s without manual refresh

---

- U3. **QuickML RAG Upgrade — Semantic Legal Search**

**Goal:** Replace hand-coded TF-IDF keyword scoring in legal_rag with QuickML
RAG knowledge base + Qwen 2.5-14B semantic retrieval.

**Requirements:** R3

**Dependencies:** None (standalone)

**Files:**
- Modify: `functions/legal_rag/index.js` (replace TF-IDF with QuickML RAG query)
- Create: `functions/legal_rag/kb-setup.js` (one-time script to upload BNS sections PDF to QuickML KB)
- Create: `docs/quickml-kb-guide.md` (instructions to create the KB in QuickML console)
- Test: `functions/legal_rag/rag.test.js`

**Approach:**
- Pre-work: Chunk BNS legal text (the 49 hardcoded sections) into a single PDF
  under 500KB. Upload to QuickML RAG knowledge base via Catalyst console
  (one-time setup, documented in `docs/quickml-kb-guide.md`)
- In legal_rag: replace `tokenize()` + `computeTF()` + `scoreSection()` with a
  QuickML RAG query call:
  ```
  # pseudocode — directional guidance, not implementation specification
  rag = catalystApp.quickML().getRAG('ksp-bns-kb-id')
  result = rag.query({ query: userQuery, topK: 3 })
  # result contains { answer, citations: [{ text, score }] }
  ```
- Keep the Zia `generateContent` fallback (line 99-106) as secondary when RAG
  confidence is low (<0.6) — chain: QuickML RAG → Zia generateContent as fallback
- Remove or keep old TF-IDF as tertiary fallback (last resort)
- Return `{ query, answer, sources, confidence, method: 'rag'|'zia'|'tfidf' }`

**Test scenarios:**
- Happy path: legal query → QuickML RAG returns answer with citations → confidence > 0.6
- Edge case: query with no match in KB (rare legal term) → falls through to Zia → returns Zia answer
- Error path: QuickML RAG throws (timeout, KB not found) → falls back to Zia → falls back to TF-IDF
- Edge case: KB PDF exceeds 500KB → chunk and upload in parts
- Integration: frontend voice query (from U1) → STT → legal_rag → RAG answer → TTS response

**Verification:**
- Send "What is the punishment for theft under BNS?" → receive cited answer from QuickML RAG

---

- U4. **Sub-5s Dashboard — Catalyst Cache Layer**

**Goal:** Add Catalyst Cache reads to all panels so metrics load in <100ms after
first pre-compute. Cache miss → fall through to original Data Store query.

**Requirements:** R4

**Dependencies:** U5 (Job Scheduling populates the cache)

**Files:**
- Create: `functions/shared/cache-utils.js` (get/set helpers with TTL)
- Modify: `functions/fir_api/index.js` (cache /stats, /alerts, /overview)
- Modify: `functions/veracity_index/index.js` (cache veracity stats)
- Modify: `functions/topology_navigator/index.js` (cache network stats)
- Modify: `functions/victim_risk_shield/index.js` (cache risk scores)
- Modify: `functions/alert_job/index.js` (cache alert counts)
- Modify: `functions/quickml_predict/index.js` (cache predictions, stable within day)
- Modify: `functions/dark_figure/index.js` (cache dark figure stats)
- Test: `functions/shared/cache-utils.test.js`

**Approach:**
- Create `functions/shared/cache-utils.js`:
  ```
  const cache = catalystApp.cache().segment({ id: 'panel-cache' });
  const getCached = async (key) => cache.get(key);
  const setCached = async (key, value, ttlSecs = 900) => cache.put(key, JSON.stringify(value), ttlSecs);
  ```  <!-- ponytail: shared util avoids 8 duplicate cache implementations -->
- In each panel function: check cache first → return if hit → compute → store in cache → return
- Cache key convention: `panel:{function_name}:{endpoint}` e.g. `panel:fir_api:stats`
- TTL: 900s (15 min) — matches the Job Scheduling cron interval from U5
- Graceful degradation: `cache.get()` throws → catch silently → compute from Data Store
- All 8 panel functions get the same pattern: cache.read() → fall through to ZCQL

**Test scenarios:**
- Happy path: cache hit → returns cached data in <100ms (measured)
- Happy path: cache miss → computes from Data Store → stores in cache
- Error path: cache service unavailable → falls through to Data Store query silently
- Edge case: stale cached data (past TTL) → behaves as cache miss

**Verification:**
- First load: ~2-3s (Data Store query). Second load (within 15 min): <100ms per panel

---

- U5. **Sub-5s Dashboard — Job Scheduling Pre-compute Cron**

**Goal:** Create a Job Pool function that pre-computes all 8 panel metrics on a
15-min cron, writing results to Catalyst Cache so panels serve from cache.

**Requirements:** R5

**Dependencies:** U4 (Cache utils must exist)

**Files:**
- Create: `functions/precompute_job/index.js` (Job Pool function)
- Create: `functions/precompute_job/package.json`
- Modify: `catalyst.json` (add precompute_job to targets)
- Test: `functions/precompute_job/precompute.test.js`

**Approach:**
- Create a Job Pool function (different from basic I/O — uses
  `module.exports = (req, res) => {...}` with 15-min timeout) that:
  1. Iterates all 8 panel endpoints in parallel (Promise.allSettled)
  2. Calls each function's internal compute logic with default filters
  3. Writes results to Catalyst Cache using the same keys from U4
  4. Logs failures per endpoint without failing the whole job
- Schedule via Catalyst console: cron expression `*/15 * * * *` (every 15 min)
  or 6 fixed triggers at shift-relevant times (6AM, 9AM, 12PM, 3PM, 6PM, 12AM)
- Graceful degradation: if cache write fails for one panel, continue with others
- Warm-up: first load after deploy triggers an immediate pre-compute (or user
  navigates to dashboard triggering cache miss → compute → subsequent loads hit cache)

**Test scenarios:**
- Happy path: all 8 endpoints compute and write to cache
- Error path: 2 of 8 endpoints fail → remaining 6 cached successfully, failures logged
- Edge case: cache unavailable → precompute runs but doesn't crash (data still queryable from Data Store)
- Integration: precompute runs → U4 panels serve from cache → sub-5s full dashboard load

**Verification:**
- After cron runs once, all panels load in <100ms — full dashboard renders in <5s

---

- U6. **Catalyst-Only Badge**

**Goal:** Add "Powered by N Catalyst Services" footer to every page, displaying
the count of integrated Catalyst services.

**Requirements:** R6

**Dependencies:** None

**Files:**
- Modify: `client/src/Components/Shell/Shell.jsx` (add footer)

**Approach:**
- Add a `<footer>` element after the `<Outlet>` in Shell.jsx with:
  `Powered by Zoho Catalyst · 11 Services` (count: Slate, Functions, Data Store,
  QuickML, Zia, Signals, Cache, Job Scheduling, User Management, AppSail, Stratus)
- Style via module CSS: small, muted, centered text, `--text-dim` color token
- Add `PoweredByBadge.module.css` or inline with existing shell styles
- No new component file needed — keep it inline in Shell.jsx <!-- ponytail: one line in one file -->

**Test scenarios:**
- Happy path: badge renders on all 3 dashboard roles (ASP, Inspector, Sub-inspector)
- Edge case: badge visible on landing page, login, and all error boundaries

**Verification:**
- Navigate all routes → badge is present in every shell layout

---

- U7. **Predictive Mode — Daily Crime Predictions via Qwen 2.5-14B**

**Goal:** Add a daily prediction panel using QuickML Qwen 2.5-14B. Prompt with
last 30 days of FIR data (district, crime type, time, location) and generate 3
predictions for today. Surface as confidence-scored prediction cards.

**Requirements:** R7

**Dependencies:** U3 (familiarity with QuickML patterns useful but not blocking)

**Files:**
- Create: `functions/predictive_mode/index.js` (QuickML prediction endpoint)
- Create: `functions/predictive_mode/package.json`
- Modify: `catalyst.json` (add predictive_mode to targets)
- Create: `client/src/Components/PredictivePanel.jsx`
- Modify: `client/src/App.jsx` (add route for `/predictive`)
- Modify: `client/src/Components/Dashboard/Sidebar.jsx` (add nav link for all 3 dashboards)
- Test: `functions/predictive_mode/predictive.test.js`
- Test: `client/src/Components/PredictivePanel.test.jsx`

**Approach:**
- Backend (`predictive_mode/index.js`):
  - `GET /predict?districtId=N`:
    1. Fetch last 30 days of FIR data from Data Store via ZCQL
    2. Build prompt: summarize recent FIR patterns (district, crime type, time-of-day, location)
    3. Call `zia.generateContent()` or `quickML().predict('llm-model', { prompt })`
       with a carefully crafted prompt asking for 3 predictions with confidence scores
    4. Parse structured response into `[{ prediction, confidence, reasoning, district_days_since_last }]`
    5. Return `{ predictions, generatedAt, dataRange }`
  - Graceful degradation: if QuickML fails, fall back to simple heuristic
    (most frequent crime type → same time → same district)
- Frontend (`PredictivePanel.jsx`):
  - Fetches predictions on mount and every 15 min (auto-refresh)
  - Renders 3 prediction cards with: crime type icon, location, time window,
    confidence badge (High/Medium/Low based on score), trend arrow
  - "What if..." secondary input: user enters a district or crime type for
    targeted prediction
- Route + nav: add to all 3 dashboards (same pattern as existing panels)
- Design follows PanelCard convention (see `CrimeGenomePanel.jsx` for reference)

**Prompt design note:**
- Use few-shot: "Given these FIRs from the last 30 days for [district], predict 3
  most likely crimes today. Return as JSON array: [{crime_type, location, time_window,
  confidence: 0-1, reasoning}]"
- Post-process: validate JSON, clamp confidence to [0,1], reject malformed entries
- Fallback when LLM returns invalid JSON: return empty predictions with error flag

**Test scenarios:**
- Happy path: QuickML returns valid predictions JSON → parsed → rendered as 3 cards
- Edge case: QuickML returns malformed JSON → fallback to heuristic → shown with "estimated" label
- Edge case: fewer than 30 days of data → prompt with available data, fewer predictions
- Error path: QuickML throws → heuristic fallback → shown as "estimated"
- Edge case: district with zero FIRs → return "insufficient data" state
- Integration: data flows from ZCQL → prompt → QuickML → frontend cards

**Verification:**
- Open `/predictive` → see 3 prediction cards with confidence scores generated from real FIR patterns

---

## System-Wide Impact

- **Interaction graph:** U2 introduces the first event-driven flow (FIR → Signal → Alert). U5 introduces the first cron-triggered Job Pool function. Both are new architectural patterns — no existing code depends on them, and they don't break anything if removed.
- **Error propagation:** Every feature has a degradation chain: primary → fallback → graceful empty state. No feature should hard-crash if its backend is unavailable.
- **State lifecycle risks:** Cache TTL (15 min) means data is at most 15 min stale. This is acceptable for a demo — judges will see sub-second loads, not stale-data edge cases.
- **API surface parity:** All new endpoints follow the existing `/server/{function_name}/{endpoint}` pattern. No breaking changes to existing endpoints.
- **Integration coverage:** U1+U3 (Voice → STT → Legal RAG) and U2+U4+U5 (Signal → Alert → Cache) form two integration chains that unit tests alone won't prove. Include E2E smoke tests.
- **Unchanged invariants:** Existing panel routes, auth flows, Data Store schemas, and function timeouts are unchanged. The new features are additive — they wrap or extend existing behavior without modifying it.

---

## Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Signals API not available in IN DC | Medium | High | Fall back to polling-only; Signal publish is a best-effort addition |
| QuickML RAG early-access instability | Medium | Medium | Keep TF-IDF as tertiary fallback; RAG failure → Zia → TF-IDF |
| Cache `put`/`get` rate limits | Low | Medium | Cache only stable metrics; per-panel TTL tuning |
| Voice mic permission in demo browser | Medium | Low | Fallback text input when mic unavailable; prepare demo with mic pre-authorized |
| Predictive Mode LLM output quality | High | Medium | Post-process JSON; heuristic fallback; confidence-score filtering |
| Job Scheduling 500/day dev limit | Low | Medium | 6 triggers/day × 11 days = 66 executions — well under limit |
| Functions 30s timeout for precompute | Medium | High | Use Job Pool function (15 min timeout); never use basic I/O for precompute |
| Catalyst SDK version mismatch (v1 vs v2) | Medium | Low | Test new features with both SDK versions where both exist in the project |

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|---------------|
| Dashboard load time | <5s full render (all panels) | DevTools Network tab after cache warm-up |
| Voice success rate | >90% of test queries produce STT text | Manual demo with 10 Kannada queries |
| Alert latency | <10s from FIR insert to alert shown | End-to-end timing test |
| RAG answer quality | Correct BNS section cited in >80% queries | 10 sample legal queries, verify cited section |
| Predictive accuracy | >60% of daily predictions match real FIRs | Run at end of day; compare predictions to actual FIRs |
| Catalyst service count | 11 services integrated | Count from catalyst.json + code audit |

---

## Phased Delivery

### Phase 1 (July 7-8) — Quick Wins
- U1. Voice Pipeline Fix (~2h)
- U6. Catalyst Badge (~1h)
- U2. Signals Event Bus (~1d)

### Phase 2 (July 9-11) — Core Platform
- U3. QuickML RAG Upgrade (~1d)
- U4. Cache Layer (~1d)
- U5. Job Scheduling Pre-compute (~1d)

### Phase 3 (July 12-15) — Differentiator
- U7. Predictive Mode (~3d)

### Buffer (July 16-19)
- Integration testing, demo preparation, presentation polish, bug fixes

---

## Documentation / Operational Notes

- Run `/ce-compound` after landing to capture learnings into `docs/solutions/` (this directory doesn't exist yet — useful signal)
- Update `catalyst-research.md` with any Signals/Cache API specifics discovered during implementation
- Prepare demo script covering all 6 features with fallback paths documented
- Test on actual Catalyst deployment (not just Vite dev mocks) before July 17

---

## Sources & References

- **Origin document:** `docs/ideation/2026-07-07-frontend-improvements-ideation.md`
- **Catalyst research:** `catalyst-research.md`
- **Existing panel patterns:** `client/src/Components/CrimeGenomePanel.jsx`, `client/src/Components/VeracityPanel.jsx`
- **Existing function patterns:** `functions/fir_api/index.js`, `functions/quickml_predict/index.js`, `functions/legal_rag/index.js`
- **Design system:** `DESIGN.md`, `docs/plans/2026-07-07-001-refactor-dashboard-design-system-reconcile-plan.md`
- **Implementation architecture:** `docs/implementation-plan.md`
