---
title: Direction Plans — Proactive Agentic Policing, Investigation Case Management, Court Pipeline
type: feat
status: active
date: 2026-07-02
---

# Direction Plans — Agentic Policing, Case Management, Court Pipeline

## Overview

Three direction plans for the highest-leverage blind spots identified in the idea list audit. Each plan describes what to build, which Catalyst service, demo moment, and effort estimate. No implementation code.

---

## D01. Proactive Agentic Policing

### What to Build

An autonomous intelligence agent that monitors the data stream without human prompt and acts on detected patterns. Three behaviors:

1. **FIR-triggered cross-check** — When a new FIR is inserted, auto-query linked cases (same MO embedding, same location, overlapping accused names), compute veracity-weight-adjusted anomaly score, and push a notification to the assigned officer with the evidence summary.

2. **Daily intelligence brief** — Scheduled AppSail job (midnight) produces a one-page intelligence brief per district: "3 new cybercrime FIRs today (12% above 30-day avg), 1 repeat offender flagged in District 4, topology shift detected in theft→cyber transitions (+8%)." Delivered as Zia TTS audio + Slate dashboard card.

3. **Anomaly-triggered case starter** — When anomaly detection (existing `alert_job` Z-score) exceeds threshold × 1.5, auto-create a case file: collect all related FIRs, run NetworkX Louvain for associated entities, generate a summary PDF in Stratus, alert the relevant Inspector.

### Catalyst Services

| Service | Purpose |
|---------|---------|
| **Signals** | Event trigger on Data Store `row_inserted` (FIR created) to fire cross-check |
| **Job Scheduling** | Nightly cron for daily intelligence brief |
| **AppSail Docker** | Python batch jobs (embedding comparison, intelligence brief generation, PDF creation) |
| **QuickML LLM** | FIR narrative embedding for MO similarity search |
| **Zia Notifications** | Push alert to officer's Slate UI and phone |
| **Zia TTS** | Kannada voice brief delivery |
| **Stratus** | Store daily brief PDFs and auto-generated case starter packs |
| **Functions** | Express endpoints for frontend to query agent state and brief history |

### Demo Moment

> "A new cyber fraud FIR is registered. Watch — our system autonomously finds 3 linked cases by MO embedding (87% similarity), flags the suspect was arrested for UPI fraud 2 months ago, and pushes an alert to Inspector Kumar with a pre-assembled evidence pack. No human queried. No dashboard opened. The agent acted."

### Effort

**5-7 days** — 3 for FIR-triggered cross-check (Signals integration, embedding similarity, notification wiring), 2 for daily brief (AppSail batch, natural language summary prompt, TTS delivery), 2 for anomaly-triggered starter (threshold logic, PDF generation, Stratus storage).

### Why Judges Love It

Directly satisfies the "agentic AI not Q&A" spec requirement. No existing police platform has autonomous agents. The "FIR triggers investigation" flow is intuitively understandable even for non-technical judges.

---

## D02. Investigation Case Management

### What to Build

A case management dashboard that tracks every FIR from filing through investigation to court submission. Components:

1. **Case stage machine** — Every FIR gets a lifecycle: `filed → assigned → evidence_collection → witness_examination → charge_sheet → court_submitted`. Current stage visible on every FIR detail view. Stage transitions logged with timestamp and actor.

2. **Lead priority queue** — For each case, a ranked list of leads (derived from case data): "Follow up with witness Suresh (location: MG Road, last contact: 3 days ago)", "Request CCTV footage from BCP Safe City camera CAM-204 (time window: 18:00-18:30)", "Forensic report pending — lab ETA 48h". Leads scored by relevance and urgency.

3. **Investigation checklist** — Auto-generated per crime type. Burglary checklist: CCTV requisition, witness identification, forensic evidence collection, neighborhood inquiry, known offender check. Officer checks items off; dashboard shows completion %.

4. **Golden period timer** — The 72-hour "golden period" for investigation is displayed as a countdown on every unsolved case. Cases approaching expiry (< 12h) auto-escalate to senior officer.

### Catalyst Services

| Service | Purpose |
|---------|---------|
| **Data Store** | `Cases` table (case_id, fir_id, stage, assigned_officer, timer_start, lead_queue JSON, checklist JSON, stage_history JSON) |
| **Functions** | CRUD endpoints: `PUT /cases/:id/stage`, `GET /cases/:id/leads`, `PATCH /cases/:id/checklist/:item`, `GET /cases/expiring` |
| **Job Scheduling** | Every-hour cron: check cases approaching golden-period expiry, push escalation alerts |
| **Signals** | Stage transition triggers (e.g., `charge_sheet → court_submitted` triggers evidence pack finalization) |
| **Slate** | Case management UI: Kanban board per officer, detail view with timer + checklist + leads |
| **Zia Notifications** | Push alerts for stage changes, lead assignments, golden period warnings |

### Demo Moment

> "FIR #1085 assigned to Inspector Kumar. System auto-generates burglary checklist: 4 items. 3 leads scored by probability (lead #1: witness identified at scene — 89% relevance). Golden period timer: 68h remaining. Watch as Kumar checks off items — completion bar moves from 0% to 75%."

### Effort

**4-6 days** — 2 for Data Store schema + Function CRUD (stage machine + lead queue), 2 for frontend (Kanban board + timer + checklist components), 1 for checklists per crime type (hardcoded templates, ~10 crime types), 1 for escalation cron + notifications.

### Why Judges Love It

Police judges will immediately recognize this as the #1 operational gap. Every officer manages cases manually today. No dashboard in the competition will have case management. Highest daily-use potential.

---

## D03. Court & Prosecution Pipeline

### What to Build

A pipeline from investigation completion to court case management. Three features:

1. **IPC/BNS section recommender** — QuickML classifier trained on FIR narrative → IPC section(s). Given FIR text, return top-3 predicted sections with confidence scores. Existing `legal_rag` can be extended: instead of "type a question, get sections", auto-predict from FIR text.

2. **Charge sheet auto-draft** — From investigation data (FIR, evidence checklist items, witness statements, accused details), generate a structured charge sheet draft: sections, accused details, evidence summary, witness list, key facts. Output as structured JSON that a React component renders as a formatted document, plus Stratus PDF.

3. **Case strength estimator** — For each case headed to court, estimate conviction probability based on: evidence strength (checklist completion %), witness count + credibility score, district historical conviction rate for this crime type, time elapsed since incident. Output: 0-100 score + breakdown by factor.

### Catalyst Services

| Service | Purpose |
|---------|---------|
| **QuickML** | Multi-class classifier for IPC/BNS section prediction from FIR narrative. Regression model for case strength estimation. |
| **Functions** | Express endpoints: `POST /court/predict-sections`, `GET /court/draft-chargesheet/:caseId`, `GET /court/case-strength/:caseId` |
| **Data Store** | `CourtCases` table (case_id, fir_id, sections, charge_sheet_json, strength_score, strength_factors, court_date) |
| **Stratus** | Charge sheet PDF storage |
| **Zia Text Analysis** | Extract entities (accused names, IPC sections, locations) from FIR text for section recommender features |
| **Slate** | Court pipeline dashboard: cases by status, charge sheet preview, strength score gauge, section predictions |

### Demo Moment

> "Case ready for court. System predicts IPC sections 420 (fraud, 92% confidence) and 468 (forgery, 78% confidence) from FIR narrative. Charge sheet auto-drafted: 4 accused, 7 evidence items, 3 witnesses. Case strength: 74% — strong financial evidence, 2 credible witnesses. Estimated 64% conviction probability based on District 3 historical rate for IPC 420."

### Effort

**5-7 days** — 2 for IPC/BNS classifier (QuickML AutoML, training data from synthetic FIRs with section labels), 2 for charge sheet draft (template engine + Stratus PDF generation), 1 for case strength estimator (heuristic formula + QuickML regression), 1 for frontend (charge sheet preview + strength gauge + section display), 1 for integration wiring (pull investigation data from case management U2).

### Why Judges Love It

India has 5+ crore pending court cases. Charge sheet preparation is a massive bottleneck. Auto-generating charge sheets and estimating case strength directly addresses the justice system's biggest pain point. No competitor will have this.

---

## All 8 Gaps — Ranked by (Judge Impact × Feasibility)

| Rank | Gap | Impact (1-10) | Feasibility (1-10) | Score | Why |
|------|-----|---------------|--------------------|-------|-----|
| 1 | D02 **Investigation Case Management** | 9 | 9 | **81** | Officers use this daily. CRUD + state machine — well within Catalyst capabilities. Highest operational need. |
| 2 | D01 **Proactive Agentic Policing** | 10 | 7 | **70** | Innovation knockout. Judges explicitly want "agentic AI." Signals + Job Scheduling + Notifications is doable but needs careful async wiring. |
| 3 | D06 **Specialized Crime Modules** | 7 | 9 | **63** | Expanding existing GBV pattern to cyber/narcotics/trafficking. Low risk, high demonstration of platform breadth. Quick wins per module (1-2 days each). |
| 4 | D03 **Court & Prosecution Pipeline** | 8 | 7 | **56** | High impact (court backlog is national crisis). QuickML classifier needs training data generation. Demo impact is excellent. |
| 5 | D04 **Emergency Response & Dispatch** | 8 | 7 | **56** | Real-time dispatch optimization would wow judges. Needs existing beat optimizer + GPS mock data. Ties to patrol routing demo. |
| 6 | D07 **Community & Public Interface** | 7 | 6 | **42** | CCTNS mandates 9 citizen services. But citizen-facing features have less demo impact on a police audience. Needs auth boundary. |
| 7 | D05 **Cross-Jurisdiction Intelligence** | 7 | 5 | **35** | High value conceptually but limited without real cross-state data. Demo would look obviously synthetic. Best as post-hackathon. |

### Build Recommendation

Given ~20 days remaining:

- **Days 1-6: D02 Investigation Case Management** — highest daily-use impact, pure Catalyst-native CRUD, always-on demo value
- **Days 7-13: D01 Proactive Agentic Policing** — innovation spec requirement, Signals integration proves deep Catalyst expertise, "FIR triggers agent" is the best demo moment
- **Days 14-18: D03 Court & Prosecution Pipeline** — charge sheet + case strength rounds out the full police workflow narrative
- **Days 19-20: Deploy verification, README, demo script** — ensure zero crashes
