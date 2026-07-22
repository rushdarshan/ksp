# Plan 001: Rewrite README to match current project state

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 9aa1f35..HEAD -- README.md`
> If README.md changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `9aa1f35`, 2026-07-14

## Why this matters

The current README describes a 2024 hackathon project called "Police Performance and Resource Management" with broken image links, no setup instructions, and no mention of the Crime Genome features that now define the product. Anyone cloning this repo — a judge, a teammate, an AI executor — gets a misleading first impression. The README is the front door; right now it opens to the wrong building.

## Current state

- `README.md` (87 lines) — describes "Police Performance and Resource Management" for "Karnataka State Police Hackathon - 2024". Contains broken GitHub asset image links, a typo ("Statememt"), a "Under Progress" section with likely-completed items, and a PowerBI link.
- `PRODUCT.md` (42 lines) — authoritative product description: "AI-driven crime analytics and visualization platform for the Karnataka State Police." Users: police supervisory officers. Brand: "Authoritative, precise, commanding."
- `DESIGN.md` (330 lines) — full design system: "Apple Premium Utilitarian Minimalism," redacted-document motif, Fraunces/Inter typography, color tokens.
- `PLAN.md` (288 lines) — Phase 2 build plan for 8 new panels (Chargesheet Clock, Accused-at-Large, Retraction Rate, Arrest Vector, Duration-Weighted Harm, Co-Accused Network, Mutual Accusation, Officer Career Spine).
- `CLAUDE.md` (8 lines) — agent skill list only.
- Tech stack (from `client/package.json`): React 18, Vite 5, react-router-dom 6, react-leaflet 4, react-force-graph-2d, react-hot-toast, ApexCharts, Radix UI, Sass.
- Backend: 22 Python Catalyst serverless functions, 27 CCTNS synthetic tables, Zoho Catalyst hosting.
- Recent commits: 3 total. Latest: `9aa1f35 feat(voice): implement MediaRecorder audio capture`.
- Demo credentials: `anjumala`/`123` (ACP), `dharmendra`/`123` (Inspector), `marutig`/`123` (Sub-Inspector).

## Commands you will need

| Purpose     | Command                              | Expected on success      |
|-------------|--------------------------------------|--------------------------|
| Dev server  | `cd client && npm run dev`           | Vite starts on :5173     |
| Build       | `cd client && npm run build`         | Builds in ~40s, no errors|
| Lint        | `cd client && npm run lint`          | exit 0 (may have warnings)|

## Scope

**In scope**:
- `README.md` (rewrite)

**Out of scope** (do NOT touch):
- `PRODUCT.md`, `DESIGN.md`, `PLAN.md`, `CLAUDE.md` — these are authoritative sources the README should reference, not modify.
- Any source code files.

## Git workflow

- Branch: `docs/rewrite-readme` (or work on current branch)
- Single commit: `docs: rewrite README to match current project state`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Read authoritative sources

Read these files to extract the information the new README needs:
- `PRODUCT.md` — product purpose, users, brand personality
- `DESIGN.md` — design system summary (first 50 lines enough for README)
- `client/package.json` — exact dependency list
- `docs/plans/2026-07-10-001-feat-crime-genome-operating-model-plan.md` — if it exists, the Crime Genome feature list

**Verify**: You can name the product's target users and core purpose from memory.

### Step 2: Write the new README

Replace the entire contents of `README.md` with the following structure. Use the information gathered in Step 1. Write in the project's voice: authoritative, precise, no fluff.

```markdown
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
- **Voice Query** — MediaRecorder-based audio capture for voice-driven queries
- **PII Masking** — Aadhaar and phone number redaction with reveal toggle
- **Case Notes** — timestamped notes with evidence linking and audit logging

## Design System

"Apple Premium Utilitarian Minimalism" — warm monochrome palette, Fraunces serif for headings, Inter for data, redacted-document motif for loading states. See [`DESIGN.md`](DESIGN.md) for the full specification.

## API Endpoints

Serverless functions under `functions/`:

| Endpoint | Purpose |
|----------|---------|
| `/server/zia_brief/zia_brief` | AI case synthesis (POST) |
| `/server/case_management/*` | Case CRUD, notes, evidence |
| `/server/login` | Authentication |
| `/server/verify` | JWT verification |
| `/server/chargesheet-clock/*` | Chargesheet deadline tracking |
| `/server/accused-at-large/*` | Accused-at-large ledger |
| `/server/retraction_rate/*` | Retraction rate analytics |
| `/server/arrest_vector/*` | Arrest geography |
| `/server/network_analysis/*` | Co-accused network graph |

## Data

27 CCTNS (Crime & Criminal Tracking Network & System) synthetic tables covering case registration, accused persons, arrests, chargesheets, employees, units, and crime classifications. All data is synthetic — generated for hackathon demonstration purposes.

See `generate_ksp_data.py` for the data generation pipeline and `synthetic_data/` for the raw CSVs.

## Project History

Originally built for the Karnataka State Police Hackathon 2024 as a performance analytics dashboard. Evolved into a crime intelligence platform with the "Crime Genome" operating model — transforming from a collection of dashboards into an integrated investigative workspace.

## License

Internal — Karnataka State Police Hackathon submission.
```

**Verify**: `cat README.md | wc -l` shows ~130-150 lines. The file starts with `# KSP Crime Analytics Dashboard`.

### Step 3: Validate the README renders correctly

Open the README in a markdown renderer (or just read it back) and confirm:
- All markdown tables render properly
- Code blocks have correct language hints
- The architecture tree displays correctly
- No broken links (the only link is `DESIGN.md` which exists)

**Verify**: `grep -n "Statememt\|Police Performance and Resource Management\|Under Progress\|PowerBI" README.md` returns no matches (old content fully removed).

## Test plan

No automated tests needed — this is a documentation-only change.

Manual verification:
1. Read the rendered README on GitHub (or in a markdown previewer)
2. Confirm the Quick Start section accurately describes how to run the app
3. Confirm the demo credentials table matches `Login.jsx` lines 29-33
4. Confirm the feature list matches what's actually built (check CaseWorkspace tabs, MyDay, Person360, Supervisor)

## Done criteria

- [ ] `README.md` starts with `# KSP Crime Analytics Dashboard`
- [ ] `grep -c "Statememt\|Police Performance\|Under Progress\|PowerBI" README.md` returns `0`
- [ ] Quick Start section includes working `npm run dev` command
- [ ] Demo credentials table lists all 3 roles with correct usernames
- [ ] Architecture tree matches actual directory structure
- [ ] Feature list covers all major components built in U1-U14
- [ ] No broken links (`DESIGN.md` link resolves)
- [ ] `git diff --stat` shows only `README.md` modified

## STOP conditions

- If `PRODUCT.md` or `DESIGN.md` have been modified since this plan was written (the source of truth may have changed).
- If the demo credentials no longer match what's in `Login.jsx`.
- If the directory structure has changed significantly (new top-level dirs, renamed folders).

## Maintenance notes

- When new features are added, update the Features section.
- When dependencies change, update the Stack line.
- When new API endpoints are added, update the API Endpoints table.
- The README should be kept in sync with `PRODUCT.md` — if they diverge, `PRODUCT.md` is authoritative.
