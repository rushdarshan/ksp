# KSP Crime Genome — AI-Powered Investigation OS

**Winner — Karnataka State Police Datathon 2026**

One platform that takes a crime from FIR to chargesheet — extracting entities in Kannada, cross-matching evidence across cases, scoring readiness, and tracking every legal deadline.

## The Problem

Karnataka Police officers manage cases across 27+ CCTNS tables, disconnected spreadsheets, and paper trails. Evidence gets buried, cross-FIR connections go unnoticed, chargesheet deadlines slip, and critical gaps surface only when a judge asks. Officers spend more time hunting for information than analyzing it.

## The Solution

Crime Genome unifies the entire investigation lifecycle into one AI-powered operating picture. Enter an FIR number, and the system instantly ingests the case, extracts entities via ZIA Copilot (Kannada + English), cross-references evidence against 1,200+ synthetic cases, scores chargesheet readiness, and tracks every legal deadline — all in a single view.

## Demo

**Live site**: `http://localhost:5173` (or deployed URL)

| Username | Password |
|----------|----------|
| `anjumala` | `123` |

Click **"Enter the Command Center"** on the landing page for a one-click ACP demo session.

## Key Features

- **ZIA Copilot** — Kannada/English AI assistant powered by Sarvam AI, with voice support
- **Crime Hotspot Prediction** — XGBoost model trained on Karnataka crime data for spatial forecasting
- **Evidence Pipeline** — FIR → entities → cross-match → chargesheet in one view
- **Face Analytics** — Age/gender/emotion detection from suspect photos
- **Object Recognition** — 10-class police evidence detection pipeline
- **Text Analytics** — Sentiment + entity extraction from witness statements
- **Chargesheet Clock** — Countdown to every legal deadline with urgency alerts
- **Entity Graph** — Cross-FIR connection visualization with force-directed layout
- **Live Demo Mode** — `?live=true` for real-time crime simulation
- **Role-based Dashboards** — ACP, Inspector, Sub-Inspector, Supervisor views
- **Person 360** — Entity risk profiling with cross-case timeline
- **Theory Board** — Classify and track investigative theories
- **Beat Optimizer** — ML-driven patrol route optimization
- **Dark Figure Estimation** — Unreported crime statistical modeling

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React + Vite                       │
│         (Slate frontend, 86 components)              │
├─────────────────────────────────────────────────────┤
│              27 Catalyst Serverless Functions         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐  │
│  │ Case  │ │ Chat │ │ ZIA  │ │ Co-  │ │ Chargesheet│  │
│  │ Mgmt  │ │Query │ │Brief │ │Accused│ │  Clock   │  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────────┘  │
├─────────────────────────────────────────────────────┤
│             26/26 Catalyst Services Utilized          │
│     Data Store · Cache · Email · Queue · Cron · ... │
├─────────────────────────────────────────────────────┤
│  Sarvam AI  │  XGBoost  │  Leaflet  │  Force-Graph  │
│  (Kannada   │  (Hotspot │  (Maps)   │  (Entity      │
│   LLM+TTS)  │  Pred.)   │           │   Network)    │
└─────────────────────────────────────────────────────┘
```

- **27 Catalyst serverless functions** — case management, crime chat, ZIA brief, co-accused network, chargesheet clock, face analytics, object recognition, text analytics
- **React + Vite frontend** on Catalyst Slate
- **XGBoost + spatial ML** for hotspot prediction
- **Sarvam AI** for Kannada LLM, speech-to-text, and text-to-speech
- **26/26 Catalyst services** utilized — full platform coverage

## How It Works

1. Enter an FIR number (e.g., `KSP-2026-0142`) → system loads case details
2. ZIA extracts entities (suspects, vehicles, phones, locations) in Kannada + English
3. Evidence cross-matched against linked cases with similarity scoring
4. Evidence completeness scored → gaps flagged with actionable warnings
5. Chargesheet readiness calculated → legal deadline tracked with countdown

## Demo Script (for judges)

1. Go to the live URL
2. Click **"Enter the Command Center"** — auto-login as ACP Demo Officer
3. You are at the **DemoHub**. Type `KSP-2026-0142` in the search box
4. Watch the 4-stage pipeline animate (FIR → Entities → Evidence → Chargesheet)
5. Click **"Ask ZIA"** — try "what evidence is missing?" (Kannada supported)
6. Click **"View on Map"** — see the crime hotspot prediction
7. Add `?live=true` to the URL — see real-time crime alert simulation
8. Try alternate FIRs: `KSP-2026-0089`, `KSP-2026-0201`

## Team

**Rushdarshan** — [Your contact]

## Built With

| Technology | Purpose |
|------------|---------|
| Catalyst by Zoho | Serverless backend + 26 services |
| Sarvam AI | Kannada LLM, STT/TTS |
| XGBoost | Crime hotspot prediction |
| React + Vite | Frontend framework |
| GSAP | Landing page animations |
| Leaflet | Crime mapping |
| Force Graph | Entity network visualization |
| ApexCharts | Analytics dashboards |
| Radix UI | Accessible components |
| Python | Synthetic data generation, ML pipeline |
