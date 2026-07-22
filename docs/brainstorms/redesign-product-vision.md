---
date: 2026-07-14
topic: ksp-redesign
type: requirements
status: draft
---

# KSP Crime Genome — Full Product Redesign Vision

## Product Pressure Test

### What is this?
A comprehensive redesign of the KSP Crime Genome platform — transforming it from a "crime analytics dashboard with 20+ panels" into a purpose-built **Investigation Operating System** for Karnataka State Police officers.

### Why now?
- **Datathon deadline: July 19, 2026** (5 days)
- Current design has diverged from DESIGN.md spec (dark indigo vs parchment, panel-tokens.css war)
- 20+ panels with no hierarchy = officer overwhelm
- Judges score UI/UX at 10-20% — a coherent design system wins points

### What happens if we do nothing?
Judges see a collection of disconnected panels with inconsistent styling. The "redacted document" motif is lost. No visual identity survives contact with panel-tokens.css. Technical capability is impressive; presentation is forgettable.

### Is there a nearby framing that creates more user value?
Yes: reframe from "dashboard" to "investigation operating system." This isn't a semantic trick — it changes every design decision: navigation follows investigation workflow, panels have hierarchy based on urgency, and the interface adapts to case status.

---

## Three Design Concepts

### Concept 1: Mission Control

**Metaphor:** NASA Mission Control — a centralized command center where every screen shows a different aspect of one unified operation.

**Core idea:** One investigation = one mission. The interface is organized around the mission lifecycle, not around tools or data sources.

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ STATUS BAR: Mission status, time, notifications        │
├────────┬───────────────────────────────┬────────────────┤
│        │                               │                │
│  NAV   │    PRIMARY WORKSPACE          │   INTEL FEED   │
│        │    (case-specific content)    │   (alerts,     │
│  6-8   │                               │    updates,    │
│  items │    ┌─────┬─────┬─────┐       │    AI insi...) │
│  only  │    │ KPI │ KPI │ KPI │       │                │
│        │    └─────┴─────┴─────┘       │                │
│        │    ┌───────────────────┐      │                │
│        │    │  MAIN CONTENT     │      │                │
│        │    │  (one panel)      │      │                │
│        │    └───────────────────┘      │                │
│        │                               │                │
├────────┴───────────────────────────────┴────────────────┤
│ COMMAND BAR: Cmd+K, status actions, quick filters      │
└─────────────────────────────────────────────────────────┘
```

**Navigation:** 6-8 workflow-based items, not 30+ panel items:
- **Morning Brief** (auto-generated daily briefing)
- **Active Cases** (prioritized by urgency/age)
- **Evidence Locker** (all evidence across cases)
- **Network Map** (entity graph across all cases)
- **Intelligence** (AI analysis hub)
- **Administration** (audit, roles — collapsed by default)

**Visual language:**
- Dark navy (#1a2332) base with warm amber (#d4a843) accents
- Status-driven color coding: RED = urgent, AMBER = attention, GREEN = resolved
- Cards with subtle shadows for content grouping
- Typography hierarchy: Fraunces for "Mission Status" headings, Inter for body, JetBrains Mono for data/IDs

**Key interactions:**
- Cmd+K opens command palette with fuzzy search
- Status bar shows real-time case counts and alerts
- Right sidebar is contextual intel feed (not always visible)
- Panels animate in with slide-up + fade (150ms ease-out)
- KPI cards show sparklines for trend at a glance

**Strengths:** Strong visual hierarchy, purpose-built for investigations, memorable visual identity.
**Weaknesses:** Requires discipline to maintain 6-8 navigation items; deeper panels need drill-down pattern.

---

### Concept 2: Intelligence Workbench

**Metaphor:** Analyst's workbench — a clean, organized workspace where tools are arranged by task, not by category. Like a surgeon's tray: everything in its place, nothing extra.

**Core idea:** Officers work on one case at a time. The interface adapts to the current case, showing only relevant tools and data. Deep analysis on demand, never overwhelming.

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ CASE HEADER: FIR#, accused, status, priority badge     │
├─────────────────────────────────────────────────────────┤
│ TOOLBAR: [Overview] [Intel] [Evidence] [Timeline] [+]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ STATUS CARD  │  │ AI BRIEF    │  │ KEY EVIDENCE│    │
│  │ (always on) │  │ (collapsible)│  │ (3 items)   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ACTIVE WORK AREA                                │   │
│  │ (current tool: Theory Board / Graph / Chargesheet)│  │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ TIMELINE RIBBON (horizontal, always visible)    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Navigation:** Case-centric toolbar with workflow phases:
- **Overview** (case status, key metrics, responsible officer)
- **Intelligence** (AI brief, predictions, risk scores)
- **Evidence** (evidence locker with classification)
- **Network** (entity graph, co-accused links)
- **Timeline** (chronological event view)
- **Chargesheet** (auto-generated chargesheet builder)
- **+** (add custom panels)

**Visual language:**
- Light parchment (#f5f0e8) base with navy (#1a3a5c) accents — honor DESIGN.md
- Toolbar tabs with underline indicator (not equal-width tabs)
- Cards with left-border color coding (red/amber/green by status)
- Typography: Fraunces for case title, Inter for body, JetBrains Mono for FIR numbers

**Key interactions:**
- Timeline ribbon is always visible at bottom — scroll horizontally through events
- AI Brief collapsible — click to expand full analysis
- Evidence cards have hover preview (no click required)
- Panels slide in from right when selected (not full-page replacement)
- Cmd+K searches across all cases, not just current one

**Strengths:** Honors existing DESIGN.md, strong case focus, progressive disclosure, professional feel.
**Weaknesses:** Timeline ribbon may compete for vertical space; toolbar may need scrolling on small screens.

---

### Concept 3: Investigation OS

**Metaphor:** Operating system — cases are processes, evidence is files, the officer is the CPU, and the interface is the kernel managing everything.

**Core idea:** The product IS the operating system for investigations. Everything — cases, evidence, AI, alerts, team communication — runs as "apps" within the OS. The desktop metaphor scales to complexity.

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ DOCK: [Dashboard] [Cases] [Evidence] [Intel] [Chat] [⚙]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ DESKTOP: Active windows (case tabs)             │   │
│  │                                                 │   │
│  │ ┌───────────────┐  ┌───────────────┐            │   │
│  │ │ FIR-2026-4821 │  │ FIR-2026-4819 │  ...       │   │
│  │ │ [tab]         │  │ [tab]         │            │   │
│  │ ├───────────────┤  ├───────────────┤            │   │
│  │ │               │  │               │            │   │
│  │ │  Case view    │  │  Case view    │            │   │
│  │ │  (full OS     │  │  (different   │            │   │
│  │ │   window)     │  │   case)       │            │   │
│  │ │               │  │               │            │   │
│  │ └───────────────┘  └───────────────┘            │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  NOTIFICATION TRAY: alerts, AI insights, team messages │
└─────────────────────────────────────────────────────────┘
```

**Navigation:** OS-style dock at top with app icons:
- **Dashboard** (home/desktop with widgets)
- **Cases** (file explorer: list → detail → deep analysis)
- **Evidence** (file manager: drag, classify, link)
- **Intelligence** (AI assistant: contextual help in every window)
- **Network** (graph visualization app)
- **Timeline** (temporal view app)
- **Chat** (team communication — integrated, not floating)
- **Settings** (admin: roles, audit, config)

**Visual language:**
- Deep charcoal (#1a1a2e) base with electric blue (#4361ee) and amber (#f7b731) accents
- Window chrome: title bars with minimize/maximize/close (but functional, not decorative)
- Depth through layered shadows (3 levels: surface, elevated, floating)
- Typography: Inter for system UI, Fraunces for case titles, JetBrains Mono for data

**Key interactions:**
- Multiple case "windows" open simultaneously (tabs at top of workspace)
- Right-click context menus on any entity (accused, evidence, location)
- Drag evidence between cases (OS file manager metaphor)
- Notification tray shows real-time alerts (Catalyst Signals)
- Cmd+K is the "terminal" — power users can type commands directly
- Windows can be split-screen (two cases side by side)

**Strengths:** Maximum flexibility, scales to complexity, professional/memorable, leverages familiar OS metaphors.
**Weaknesses:** Most ambitious; risk of feeling gimmicky if not executed well; window management adds complexity.

---

## Product Pressure Test Results

| Question | Answer |
|----------|--------|
| What durable capability should this create? | A purpose-built investigation platform that Karnataka State Police would actually use daily — not a datathon demo, but a real tool. |
| What's the single sharpest user outcome? | Officer opens the app, sees exactly what needs attention today, and can act on it in under 30 seconds. |
| What adjacent product could we accidentally build? | A generic BI dashboard (charts + tables). The investigation-specific framing is what makes this different from Tableau/PowerBI. |
| What would have to be true for this to fail? | Officers would need to reject the workflow metaphor (investigation OS doesn't match how they actually work). Mitigation: ground every design decision in real KSP investigation procedures. |

---

## Recommended Direction

**Concept 2: Intelligence Workbench** — with elements of Concept 1's status bar and Concept 3's notification tray.

**Why:**
1. **Honors DESIGN.md** — light parchment base with navy accents is already defined; Concept 1 and 3 would require redefining the entire palette
2. **Lowest risk** — case-centric toolbar is proven (Linear, Jira, Palantir); OS metaphor (Concept 3) is riskier for a 5-day deadline
3. **Progressive disclosure** — toolbar with collapsible sections solves the "20 panels overwhelming" problem
4. **Timeline ribbon** — always-visible horizontal timeline is the most investigation-specific UI element; no competitor has it
5. **Fits the deadline** — the shell restructure (toolbar + case header + timeline ribbon) is achievable in 5 days; Concept 3's window management is not

**Elements to borrow:**
- From Concept 1: Status bar with real-time case counts (top of screen)
- From Concept 3: Notification tray for Catalyst Signals alerts (bottom-right)
- From Concept 1: KPI sparkline cards for at-a-glance metrics

---

## Scope Boundaries

### Deferred for later (post-datathon):
- Multi-user collaboration (real-time presence, shared annotations)
- Mobile-first responsive redesign
- Custom panel arrangement (drag-and-drop workspace)
- Keyboard shortcut system beyond Cmd+K

### Outside this product's identity:
- Generic BI dashboards (this is investigation-specific)
- Social features (this is a professional tool, not a social network)
- Gamification (this is law enforcement, not a game)

---

## Dependencies & Assumptions

1. **DESIGN.md tokens are authoritative** — we will fix divergence, not create a new design system
2. **panel-tokens.css is deleted** — replaced by proper theme implementation
3. **Case lifecycle data exists** — backend already tracks case status; we consume it
4. **5-day deadline is real** — design must be achievable in the remaining time
5. **Judges value visual consistency** — a coherent design system scores higher than feature count

---

*Document status: Draft — awaiting user confirmation of recommended direction*
