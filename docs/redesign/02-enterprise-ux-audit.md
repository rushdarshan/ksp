# Phase 2 — Enterprise UX Audit

## Benchmark Principles (not visuals)

### Palantir Gotham
- Information density without clutter: every pixel carries data
- Command palette (⌘K) as primary navigation — no sidebar browsing
- Timeline view as investigation backbone
- Entity-centric: everything orbits around people, places, events
- Dark theme with high-contrast data highlights

### Linear
- Keyboard-first: ⌘K everywhere, no mouse required
- Single-page app feel: no full-page reloads
- Status as color: subtle background tints, not badges
- Density control: compact vs comfortable toggle
- Zero chrome when not needed

### Apple
- Progressive disclosure: show summary, reveal detail on demand
- Spatial consistency: same element looks same everywhere
- Motion as meaning: animations explain state changes
- Typography as hierarchy: weight + size, not color + size

### Raycast
- Command palette as OS: everything is one keystroke away
- Fuzzy search over hierarchical navigation
- Extensions as plugins: consistent API, varied functionality
- Dark by default, light as option

### Arc
- Spaces as context switching: different workspaces for different tasks
- Sidebar as primary nav: always visible, never hidden
- Split view: sidebar + content, not modal overlays
- Favorites as shortcuts: pinned items at top

## Current State — Information Architecture

### Problem: 30+ panels with no hierarchy
The sidebar has:
```
My Work (2 items)
├── My Day
└── Cases / FIRs
Investigate (5 items)
├── Case Workspace
├── Network Analysis
├── CCTV Intelligence
├── Phone Analysis
├── Financial Intel
Command & Staff (3 items)
├── Daily Briefing
├── Officer Directory
└── Leave Management
Analytical Catalog (9 items) ← OVERWHELMING
├── Crime Statistics
├── Pattern Detection
├── Criminal Network
├── Geo Crime Map
├── Fir Quality
├── Public Deterrence
├── Counter-Crime
├── Fairness Audit
└── FIR Quality
Administration (3 items)
├── Case Management
├── FIR Master
└── User Management
```

### What judges see: a long list of unrelated tools
### What judges should see: an investigation workflow

## Redesign — New Information Architecture

```
MyDay
├── Priority Cases (queue, not grid)
├── Today's Brief (AI-generated)
└── Quick Actions (ZIA, New FIR, Search)

Investigate
├── Case Workspace (the core)
│   ├── Overview
│   ├── FIR Details
│   ├── Timeline
│   ├── Entities
│   ├── Evidence
│   ├── Network
│   ├── Theory Board
│   └── Chargesheet
├── Entity Graph (standalone)
└── Cross-Case Analysis

Analytics (collapsed by default)
├── Crime Patterns
├── Hotspot Map
├── Quality Scores
├── Fairness Audit
└── Public Deterrence

Admin (collapsed by default)
├── FIR Master
├── Officers
└── Users
```

## Visual Hierarchy Report

### What works
- PanelCard/PanelHeader/PanelBadge system (consistent)
- Status color coding (Investigation blue, Trial amber)
- Fraunces/Inter/JetBrains Mono type system
- The Investigation OS landing page narrative

### What's broken
1. **Sidebar density**: 4 sections, 16+ items, no collapse states
2. **MyDay is a card grid**: Should be a priority queue (list, not grid)
3. **Analytics as equal citizens**: 9 panels in "Analytical Catalog" overwhelming
4. **Generic welcome header**: "Welcome to KSP Dashboard" says nothing
5. **No breadcrumb context**: User doesn't know WHERE they are
6. **Right sidebar competing**: Live Alerts vs main content

### Priority Fixes
1. **MyDay → Priority Queue**: Top 5 cases as a list, not a card grid
2. **Sidebar collapse**: Analytics/Admin collapsed by default
3. **Breadcrumb navigation**: Always show location in hierarchy
4. **ZIA as center**: "Ask ZIA" should be always-accessible, not buried
5. **Case Workspace as hero**: This is the core product, make it prominent
