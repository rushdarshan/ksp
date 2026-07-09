---
date: 2026-07-07
topic: frontend-improvements
focus: "how improve our frontend"
mode: repo-grounded
---

# Ideation: Frontend Improvements for KSP Dashboard (Datathon Prep)

## Grounding Context

**Project:** KSP Dashboard-Datathon — crime analytics platform for Karnataka State Police, built for KSP Datathon 2026. Uses Zoho Catalyst as mandated cloud platform (deadline: July 19, 2026).

**Tech stack:** React 18 + Vite frontend, 21 Catalyst NodeJS function backends, QuickML AI (GLM-4.7 14B, Qwen 3.6), Zia (OCR, facial analytics, identity scanner, object/body detection, sentiment, generate content), STT/TTS (Hindi/Kannada/English), Data Store (ZCQL), Stratus (object storage), Signals (event bus), Slate, AppSail (Docker), Job Scheduling (15min), Cache, User Management.

**Existing panels (8 planned, 6 complete):** Chargesheet Clock, Accused-at-Large Ledger, Retraction Rate, Arrest Vector, Duration-Weighted Harm, Co-Accused Network. **Missing:** Mutual Accusation Signal, Officer Career Spine.

**Key gaps identified:** VoiceQuery sends `new Blob(["mock audio data"])` while Zia STT backend is production-ready; legal_rag uses hand-coded TF-IDF keyword matching instead of QuickML RAG; zero Catalyst Circuits (21 standalone functions); zero Signals (event bus) usage; zero Job Scheduling usage; 9+ functions generate Math.random() mock data; no PDF export; zero Cache usage.

**Competitor context:** corefour05-code/Datathon-2026-Zoho (Python FastAPI + Gemini 2.5 Flash — external AI violates Catalyst-only mandate — + React 18 + D3.js + PDF export + DBSCAN spatial clustering). Their strength: PDF export, network graphs. Their weakness: external AI is a rule violation.

**Judge rubric:** Creativity (30-40%), Technical Execution (20-30%), Problem Relevance (20-30%), UI/UX (10-20%), Presentation (10-20%). ZDC 2025 winners used 4+ Catalyst services layered.

## Ranked Ideas

### 1. Voice Pipeline Fix
**Description:** Replace `new Blob(["mock audio data"])` in VoiceQuery.jsx with real `navigator.mediaDevices.getUserMedia` → `MediaRecorder` pipeline. The backend Zia STT/TTS already works for Kannada/English — only the frontend capture step is mocked. ~2 hours.
**Warrant:** `direct:` `VoiceQuery.jsx:12-13` — hardcoded mock blob; `zia_voice/index.js:16-17` — real Zia STT call against Kannada audio buffer.
**Rationale:** Voice is the headline differentiator (bilingual STT/TTS). A mock voice demo is worse than no voice — it shows attempted but incomplete capability. The backend cost is already sunk; the 20-line frontend fix is the cheapest high-impact change in the codebase.
**Downsides:** Requires microphone permission dialog in browser. Edge cases: no mic, permission denied, audio format mismatch. Fallback UI needed when mic unavailable.
**Confidence:** 95%
**Complexity:** Low (~2 hours)
**Status:** Unexplored

### 2. Signals Live Alert Pulse
**Description:** Add one Catalyst Signal publish (`fir.ingested`) when a new FIR enters the Data Store, and one subscribe in the AlertsFeed component to push alerts in near-real-time. ~40 lines total. Gets us to 4+ Catalyst services (Functions + Data Store + Signals + one more).
**Warrant:** `direct:` Zero Catalyst Signals usage anywhere. `AlertsFeed.jsx:10-24` — fetches on mount only, no push. `alert_job/index.js:111-115` — writes alerts to Data Store but never publishes a Signal.
**Rationale:** Transforms the app from a pull-based read-only dashboard into an event-driven command center. Real-time responsiveness distinguishes "analytics tool" from "command center." Matches the ZDC 2025 winner pattern of 4+ Catalyst services.
**Downsides:** Signal delivery latency unknown. Need fallback polling for disconnected states. May require testing under rate limits.
**Confidence:** 90%
**Complexity:** Low (~1 day)
**Status:** Unexplored

### 3. QuickML RAG Upgrade
**Description:** Replace hand-coded TF-IDF keyword matching in `legal_rag/index.js` with a QuickML RAG knowledge base. Load BNS sections PDF (500KB limit per file). Switch primary query path from manual keyword scoring to QuickML semantic retrieval.
**Warrant:** `direct:` `legal_rag/index.js:7-48` — 49 hardcoded sections with manual keyword lists. `direct:` Lines 90-96 — scoring is hand-rolled term frequency. Zia `generateContent` only called as TF-IDF fallback (lines 99-106).
**Rationale:** Transforms "we built a keyword matcher" into "we integrated QuickML RAG" for judges. QuickML is the mandated AI service; using it scores directly on the 4+ Catalyst services criterion.
**Downsides:** 500KB file limit may require splitting legal texts. QuickML RAG latency may be higher than TF-IDF for straightforward lookups.
**Confidence:** 85%
**Complexity:** Low-Medium (~1 day)
**Status:** Unexplored

### 4. Cache + Job Scheduling → Sub-5s Dashboard
**Description:** Pre-compute all panel metrics every 15 minutes via Catalyst Job Scheduling cron (6 triggers/day, covering shift changes at 6AM/12PM/6PM/12AM). Serve from Cache — panels render in <100ms instead of hitting Data Store on every load.
**Warrant:** `direct:` 30s function timeout constraint from workshop transcript. `direct:` Zero Job Scheduling or Cache usage in current codebase. `reasoned:` Pre-compute + cache is a standard pattern for overcoming serverless timeout limits.
**Rationale:** Every competing dashboard will show loading spinners. A sub-5s full load is visibly superior in a live demo. Also solves the 30s timeout ceiling for complex queries.
**Downsides:** Data freshness limited to cron interval. Peak-hour incidents may not appear until next pre-compute. Needs warm-up strategy for first load.
**Confidence:** 80%
**Complexity:** Medium (~2 days)
**Status:** Unexplored

### 5. Catalyst-Only Badge
**Description:** Add "Powered by [N] Catalyst Services" footer to every page. Count all Catalyst services already integrated (estimate 8-11 services). ~1 hour.
**Warrant:** `direct:` ZDC 2025 winners explicitly listed Catalyst services used — a known judging signal. `reasoned:` Competitor uses external Gemini API (rule violation); visible compliance badge makes the contrast obvious without negative framing.
**Rationale:** Maximizes Technical Execution score (20-30% of rubric) with minimal effort. The competitor's Gemini dependency is their existential weakness; our 100% Catalyst badge is a quiet, classy counter.
**Downsides:** Must maintain accurate service count as features change. Trivial compliance theater risk if overplayed.
**Confidence:** 95%
**Complexity:** Very Low (~1 hour)
**Status:** Unexplored

### 6. One Catalyst Circuit
**Description:** Build one Circuit orchestrating a multi-step flow: FIR ingestion → Zia veracity check → Alert publish. Demonstrates parallel branching (3 functions × 5s = 15s, within 30s timeout). Creates a reusable template for the other 20 standalone functions.
**Warrant:** `direct:` Zero Catalyst Circuits — 21 functions are all standalone Express apps. `direct:` Workshop transcript confirms Circuits support parallel branching. `reasoned:` Judges evaluating "Catalyst-native depth" look for Circuits as proof of platform understanding.
**Rationale:** The gap is binary — either Circuits exist or they don't. One Circuit shows the judge we understand orchestration, not just independent microservices.
**Downsides:** Circuit debugging is harder than standalone functions. May add orchestration latency. Risk of Circuit failure cascading to multiple functions.
**Confidence:** 75%
**Complexity:** Medium (~2 days)
**Status:** Unexplored

### 7. Predictive Mode via QuickML LLM
**Description:** Add a daily prediction panel using QuickML GLM-4.7 14B. Prompt with last 30 days of FIR data (district, crime type, time, location) and generate 3 predictions for today. Surface as confidence-scored prediction cards.
**Warrant:** `direct:` QuickML GLM-4.7 14B serving available per workshop transcript. `external:` Competitor's Gemini violates Catalyst-only rules — they cannot legally claim predictive capability. `reasoned:` 8 current panels all show historical data; none predict forward.
**Rationale:** "What happened yesterday" → "What will happen today" is a higher-order analytical capability. Predictive policing is judge-bait. Since competitor cannot use external AI, this is a differentiated feature only we can have.
**Downsides:** LLM prediction quality may be unreliable. Requires careful prompt engineering and output validation. Risk of over-promising prediction accuracy.
**Confidence:** 70%
**Complexity:** Medium-High (~3 days)
**Status:** Unexplored

## Rejection Summary

| # | Idea | Reason Rejected |
|---|------|-----------------|
| 1 | PDF Export | Duplicates competitor's feature without differentiation; lower priority than architectural wins |
| 2 | Mock Data Honest Labeling | Honest but low ambition; can be absorbed into demo script without separate feature work |
| 3 | Zia OCR Pipeline | High wow factor but ~4 days effort exceeds available time before deadline |
| 4 | Veracity Badge on All Panels | VeracityPanel already exists; badge across all panels is 3-day effort for incremental gain |
| 5 | Auto-Narrative Demo Mode | This is a presentation script, not a product improvement — better as brainstorm output |
| 6 | Cross-Domain Framing | Presentation angle, not a feature; useful as demo narrative framing but not a build item |
| 7 | Hyperlocal Deep-Dive | Strategy pivot (one district depth vs 20-district breadth); too disruptive for remaining timeline |
| 8 | FilterBar Removal | Valid but small; better handled as a cleanup task during Cache + Job Scheduling work |
