# KSP Crime Analytics Dashboard

AI-driven crime analytics and visualization platform for the Karnataka State Police. Transforms siloed crime records into an integrated intelligence hub with network analysis, predictive risk scoring, and conversational AI querying.

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd ksp

# Install client dependencies
cd client
npm install

# Start the dev server
npm run dev
```

The app runs at `http://localhost:5173`. Use the demo credentials on the login page:

| Role | Username | Password |
|------|----------|----------|
| ACP/DySP | `anjumala` | `123` |
| Inspector | `dharmendra` | `123` |
| Sub-Inspector | `marutig` | `123` |

### Build

```bash
cd client
npm run build    # production build
npm run preview  # preview the production build
```

## Architecture

```
ksp/
├── client/          React 18 + Vite frontend
│   └── src/
│       ├── Components/
│       │   ├── CaseWorkspace/    Crime Genome case management shell
│       │   ├── MyDay/            Daily briefing dashboard
│       │   ├── Supervisor/       Supervising officer flows
│       │   ├── Person360/        Entity risk profiling
│       │   └── CommandPalette/   Global search (Cmd+K)
│       └── utils/                API fetch, PII masking
├── functions/       Zoho Catalyst serverless functions (Node.js)
│   ├── case_management/    Case CRUD + Data Store tables
│   ├── crime_chat/         Grounded conversational query router
│   ├── co_accused_network/ Relational criminal network builder
│   ├── zia_brief/          AI-powered case synthesis
│   └── shared/             PII masking, audit logging
├── synthetic_data/  CCTNS synthetic dataset (27 tables)
└── docs/            Design system, product docs, plans
```

**Stack**: React 18, Vite 5, react-router-dom, react-leaflet, react-force-graph-2d, ApexCharts, Radix UI, Sass. Backend: Zoho Catalyst serverless functions with Data Store.

## Features

### Crime Genome Operating Model

The core investigative workflow — an 8-tab Case Workspace where officers move from raw data to chargesheet:

| Tab | Purpose |
|-----|---------|
| **Overview** | 30-second case card — key facts at a glance |
| **AI Brief** | ZIA-synthesized intelligence brief with solvability scoring |
| **Theory Board** | Classify and track investigative theories with confidence thresholds |
| **Evidence** | Evidence locker with AI analysis, gap detection, and status tracking |
| **Network** | Interactive entity graph + cross-case similarity surfacing |
| **Timeline** | Case event timeline with chronological evidence mapping |
| **Notes** | Case notes with linked evidence and audit trail |
| **Chargesheet** | AI-assisted chargesheet generation with BNS section mapping |

### Analytics Panels

- **Chargesheet Clock** — case urgency tracker with deadline countdown
- **Accused-at-Large Ledger** — named suspects with zero arrests
- **Retraction Rate** — chargesheet quality by station and IO
- **Arrest Vector Map** — geographic arrest patterns with sink station detection
- **Co-Accused Network** — force-directed graph of criminal networks
- **Predictive Hotspots** — ML-powered crime hotspot forecasting
- **Dark Figure** — unreported crime estimation
- **Deterrence Dashboard** — public-facing crime statistics

### Role-Based Dashboards

- **ACP/DySP** (`/dashboard`) — full analytics suite, FIR management, officer oversight
- **Inspector** (`/inspector`) — station-level intelligence, case management
- **Sub-Inspector** (`/subinspector`) — FIR entry, evidence tracking
- **Supervisor** (`/supervisor`) — station overview, chargesheet review workflow

### Additional Features

- **My Day** — daily briefing with priority cases, alerts, and pending actions
- **Person 360** — entity risk profiling with cross-case timeline and risk scores
- **Command Palette** — global search with FIR shorthand (type "142" to open case #142)
- **Conversational intelligence** — contextual English/Kannada queries with record citations, confidence, and local PDF export
- **Voice Query** — browser Kannada speech recognition and playback, with optional provider-backed STT/TTS
- **PII Masking** — Aadhaar and phone number redaction with reveal toggle
- **Case Notes** — timestamped notes with evidence linking and audit logging

## Design System

"Apple Premium Utilitarian Minimalism" — warm monochrome palette, Fraunces serif for headings, Inter for data, redacted-document motif for loading states. See [`DESIGN.md`](DESIGN.md) for the full specification.

## API Endpoints

Serverless functions under `functions/`:

| Endpoint | Purpose |
|----------|---------|
| `/server/crime_chat/query` | Grounded conversational crime intelligence (POST) |
| `/server/zia_brief/zia_brief` | AI case synthesis (POST) |
| `/server/case_management/*` | Case CRUD, notes, evidence |
| `/server/chargesheet_clock/stats` | Data-backed investigation review clock |
| `/server/accused_at_large/ledger` | Accused-to-arrest anti-join ledger |
| `/server/co_accused_network/graph` | Shared-FIR accused network graph |
| `/server/zia_voice/*` | Optional external STT/TTS adapter and capability report |

## Data

27 CCTNS (Crime & Criminal Tracking Network & System) synthetic tables covering case registration, accused persons, arrests, chargesheets, employees, units, and crime classifications. All data is synthetic — generated for hackathon demonstration purposes.

See `generate_ksp_data.py` for the data generation pipeline and `synthetic_data/` for the raw CSVs.

See `docs/hackathon-readiness.md` for the deployment gate, capability truth table, and judge demo path.

## Project History

Originally built for the Karnataka State Police Hackathon 2024 as a performance analytics dashboard. Evolved into a crime intelligence platform with the "Crime Genome" operating model — transforming from a collection of dashboards into an integrated investigative workspace.

## License

Internal — Karnataka State Police Hackathon submission.
