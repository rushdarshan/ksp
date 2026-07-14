---
date: 2026-07-14
topic: full-product-redesign
focus: "transform KSP Crime Genome into Investigation OS — Mission Control / Intelligence Workbench / Investigation OS concepts"
mode: repo-grounded
status: in-progress
---

# Ideation: Full Product Redesign — KSP Crime Genome → Investigation OS

**Run ID:** pending  
**Mode:** repo-grounded, Deep — product tier  
**Status:** Phase 1 — Grounding in progress

## Grounding Context

### Current State (from audit)

**Project:** KSP Crime Genome — crime analytics platform for Karnataka State Police, built for KSP Datathon 2026 (deadline: July 19, 2026). Zoho Catalyst backend (mandated).

**Stack:** React 18 + Vite + SCSS + React Router (HashRouter), Zoho Catalyst (23 Node.js functions), JWT auth, role-based access (ACP/DySP → Inspector → Sub-Inspector).

**Core architecture:**
- All three role dashboards (Dashboard.jsx, InspectorDash.jsx, SubInspectorDash.jsx) are thin wrappers: `<Shell basePath="..." />`
- Shell = sidebar + topbar + content + right sidebar
- 20+ lazy-loaded analytical panels
- Command Palette (Cmd+K)
- Global floating ChatPanel
- Demo/mock data throughout with `// ponytail:` markers for backend swap
- Backend API: `VITE_API_URL` or `/server`; endpoints for FIR, ZIA brief, case strength, case management

**Design system (DESIGN.md):** "redacted document" motif
- Fonts: Fraunces (serif display), Inter (sans), JetBrains Mono (mono)
- Colors: muted navy (#1a3a5c), amber (#b8860b), parchment (#f5f0e8)
- Single shadow: 0 2px 8px rgba(0,0,0,.08)
- Border radius: 2-6px

**Design divergence from spec:**
- DailyBrief uses dark indigo gradients (#1e1b4b → #312e81) — NOT in DESIGN.md
- `panel-tokens.css` is 367-line aggressive override layer killing dark-theme inline styles
- Heavy inline styles in CaseWorkspace tabs, MyDayDashboard, EvidenceReview
- No animation library — all CSS-only motion
- No UI component library — only Radix UI for dropdown menu

**20+ panels across:**
- MyDayDashboard: DailyBrief, CaseCards, AlertsFeed
- CaseWorkspace tabs: Overview, AI Intelligence Brief, Theory Board, Evidence, Entity Graph, Timeline, Notes, Chargesheet
- Analytical: Predictive, VictimRiskShield, DarkFigure, Veracity, VoiceQuery, LegalRAG
- Admin: AuditLog, RoleManager, BulkFIRIngest

**Existing ideation (6 docs):** Voice Pipeline fix, Signals Live Alert, QuickML RAG, Cache+Job Scheduling, Neo4j Graph, AI Audit Trail, kepler.gl maps, Qdrant Vector Search. These are feature-level; none address holistic product redesign.

### Known Pain Points (from audit)

1. **No visual identity** — "redacted document" motif is defined but not consistently expressed; DailyBrief goes dark indigo, Landing page goes parchment; no unifying presence
2. **Overwhelm** — 20+ panels with no hierarchy; everything is equal weight; no progressive disclosure
3. **Inline style sprawl** — component-level styles scattered everywhere, no design token system feeding components
4. **panel-tokens.css** — 367-line override layer that fights existing dark themes instead of creating harmony
5. **No motion language** — CSS keyframes only; no coordinated transitions, no page-to-page rhythm
6. **Flat navigation** — sidebar lists all panels equally; no investigation workflow structure
7. **Mock data throughout** — every panel shows demo data; no "first-run" experience; no empty states
8. **Zero progressive disclosure** — all intelligence shown at once; no drill-down, no "tell me more"
9. **No spatial hierarchy** — everything is full-width stacked; no cards, no grids, no visual grouping
10. **No feedback loops** — actions don't confirm; no undo; no "this was saved"

## Ideas — Phase 2: Divergent Ideation

---

### Frame 1: Pain and Friction

**1.1 Investigation Wall of Text**
Every case tab dumps dense paragraphs with no visual hierarchy. AI Intelligence Brief is 387 lines of monochrome text. Theory Board shows hypotheses as flat lists.
→ *Warrant:* `direct:` AIIntelligenceBrief.jsx lines are all same font/weight; no headings, no callouts, no progressive disclosure.
→ *Why it matters:* Officers scanning 10+ cases need to extract signal in seconds, not minutes.

**1.2 Sidebar Navigation Overload**
30+ nav items in a flat list; no grouping by workflow phase. Every panel is one click away but nothing is prioritized.
→ *Warrant:* `direct:` Sidebar.jsx has ~30 items in a flat list with only 4 section headers (Home, Analysis, Tools, Admin).
→ *Why it matters:* New users don't know where to start; experienced users memorize locations but waste scans.

**1.3 Dark Theme vs Light Theme War**
panel-tokens.css (367 lines) aggressively overrides dark-theme inline styles. DailyBrief uses gradients (#1e1b4b → #312e81) that fight the light parchment base. Two visual identities coexist.
→ *Warrant:* `direct:` panel-tokens.css lines 1-100 override all dark inline styles; DailyBrief.jsx inline gradient style.
→ *Why it matters:* Inconsistent visual identity undermines credibility; judges notice visual inconsistency first.

**1.4 Zero Empty States**
Every panel assumes data exists. When data is missing, panels show loading spinners or blank space. No "here's what to do next" guidance.
→ *Warrant:* `reasoned:` Demo data masks this; production would show blank panels with no guidance.
→ *Why it matters:* First-time users hit blank screens and don't know what to do.

**1.5 No Keyboard Navigation**
Command Palette (Cmd+K) exists but no keyboard shortcuts for common actions. Tab order is unmanaged.
→ *Warrant:* `direct:` CommandPalette.jsx handles Cmd+K; no other keyboard shortcuts found.
→ *Why it matters:* Power users (investigators) need keyboard-first workflows for speed.

---

### Frame 2: Inversion, Removal, or Automation

**2.1 Remove the Sidebar — Replace with Context-Driven Navigation**
Instead of showing all 30+ panels at all times, infer what the officer needs based on case status and current action. Show only relevant next steps.
→ *Warrant:* `reasoned:` Every case has a lifecycle (registered → under investigation → chargesheet filed). Navigation should follow lifecycle, not list everything.
→ *Why it matters:* Reduces cognitive load by 80%; officers see 3-5 actions instead of 30.

**2.2 Remove panel-tokens.css — One Theme to Rule Them All**
Delete the 367-line override layer entirely. Adopt the dark indigo (from DailyBrief) as the single base, with light accents for cards/panels.
→ *Warrant:* `direct:` panel-tokens.css exists only because two themes were bolted together. One theme eliminates the need.
→ *Why it matters:* Removes 367 lines of CSS debt and eliminates visual inconsistency.

**2.3 Automate Case Progression**
Instead of officers manually updating case status, auto-advance based on evidence activity. When chargesheet is uploaded → case moves to "Review." When arrest is made → case moves to "Arrested."
→ *Warrant:* `reasoned:` CaseWorkspace has manual status toggles; Catalyst Signals could trigger status changes.
→ *Why it matters:* Removes administrative friction; officers focus on investigation, not bookkeeping.

**2.4 Remove ChatPanel — Move AI to Context**
The floating ChatPanel is always-on but disconnected from context. Instead, embed AI assistance directly into each panel — "ask about this evidence," "explain this prediction."
→ *Warrant:* `direct:` ChatPanel.jsx is a separate floating overlay; AIIntelligenceBrief.jsx has its own AI logic. Two AI surfaces.
→ *Why it matters:* Contextual AI is 10x more useful than a generic chatbot.

**2.5 Auto-Generate Daily Brief**
Instead of DailyBrief being a static summary, auto-generate it from overnight activity: new FIRs filed, arrests made, chargesheets submitted, alerts triggered.
→ *Warrant:* `direct:` DailyBrief.jsx shows static demo data; no real-time data feed.
→ *Why it matters:* Transforms "morning report" from static display to living intelligence.

---

### Frame 3: Assumption-Breaking and Reframing

**3.1 Reframe: This Is Not a Dashboard — It's an Investigation OS**
The current product assumes "dashboard" = charts + tables + panels. Reframe as an operating system: each case is a "process," evidence are "files," the officer is the "CPU" executing investigation tasks.
→ *Warrant:* `reasoned:` Operating system metaphor maps perfectly: process management (cases), file system (evidence), scheduler (officer workload), IPC (inter-agency communication).
→ *Why it matters:* Changes every design decision — from layout to navigation to interaction model.

**3.2 Break Assumption: All Panels Are Equal**
Current design treats every panel as full-width, same visual weight. Break this: some panels are "always visible" (case status, key alerts), some are "on-demand" (deep analytics), some are "ambient" (background monitoring).
→ *Warrant:* `direct:` All CaseWorkspace tabs are equal-width tabs with same visual treatment.
→ *Why it matters:* Information hierarchy is the core of usable complex systems.

**3.3 Break Assumption: Officers Want to See Everything**
The current design shows all available data at once. Reframe: officers want to see only what's relevant to their current task. Progressive disclosure: overview → drill-down → deep analysis.
→ *Warrant:* `reasoned:` Cognitive load research: 7±2 items; current dashboard shows 20+ panels.
→ *Why it matters:* Less is more when the less is the right less.

**3.4 Break Assumption: The Product Starts at Login**
Current flow: Login → Dashboard. Reframe: the product starts at the officer's morning — push notifications for overnight activity, daily briefing, priority queue.
→ *Warrant:* `reasoned:` DailyBrief.jsx is the first panel seen but shows static data; no push/prep concept.
→ *Why it matters:* Changes the first 5 minutes of every officer's day from "check the dashboard" to "here's what happened while you were away."

**3.5 Break Assumption: Evidence Is Static**
EvidenceReview shows evidence as a list of items with status badges. Reframe: evidence is dynamic — it has a lifecycle (submitted → analyzed → verified → linked → used in chargesheet).
→ *Warrant:* `direct:` EvidenceReview.jsx shows static evidence cards with status badges; no workflow.
→ *Why it matters:* Evidence lifecycle tracking creates accountability and shows progress.

---

### Frame 4: Leverage and Compounding

**4.1 Design Token System → Single Source of Truth**
Create a proper design token system (colors, spacing, typography, shadows) as SCSS variables. Every component consumes tokens, not inline values. Change once, propagate everywhere.
→ *Warrant:* `direct:` DESIGN.md defines tokens but components use inline hex values (#1e1b4b, #312e81) and panel-tokens.css overrides.
→ *Why it matters:* One visual change (e.g., accent color) updates 100% of the UI in one edit.

**4.2 Case Lifecycle as Core Architecture**
Build everything around case lifecycle: navigation follows lifecycle, analytics are lifecycle-aware, alerts are lifecycle-triggered. One architecture, many surfaces.
→ *Warrant:* `reasoned:` CaseWorkspace already has case data; lifecycle is the missing organizing principle.
→ *Why it matters:* One architecture decision unifies navigation, analytics, alerts, and reporting.

**4.3 Reusable Panel Shell**
Create a standard panel shell (header with title + actions, body with content, footer with metadata). Every panel uses the same shell. Consistency without repetition.
→ *Warrant:* `direct:` Every panel has different header/body/footer treatment; no shared component.
→ *Why it matters:* Visual consistency across 20+ panels with zero ongoing maintenance.

**4.4 Shared Investigation Timeline**
One timeline per case that all panels contribute to. AI brief adds entries, evidence adds entries, notes add entries. Single chronological view of everything that happened.
→ *Warrant:* `direct:` TimelinePanel.jsx exists but is separate from other panels; no cross-panel timeline.
→ *Why it matters:* Timeline is the most natural way humans understand sequences of events.

**4.5 Global Filter State → Context Propagation**
Current FilterContext filters FIRs globally. Extend: every panel should react to global filters (district, date range, crime type). One filter, all panels respond.
→ *Warrant:* `direct:` FilterContext.jsx exists but only MyDayDashboard and Sidebar consume it; most panels ignore it.
→ *Why it matters:* Filter once, see everything update — the core interaction of an analytical tool.

---

### Frame 5: Cross-Domain Analogy

**5.1 Palantir Gotham — Case-Folder Metaphor**
Gotham uses a "case folder" metaphor: one case = one folder containing all intelligence, evidence, entities, timelines. Officers open a folder and see everything organized by type, not by source.
→ *Warrant:* `external:` Palantir Gotham's core UX is the case-centric intelligence folder. `reasoned:` Our CaseWorkspace already has tabs — restructure as a folder with sections, not tabs.
→ *Why it matters:* Proven in law enforcement; 20+ years of Palantir refinement.

**5.2 Linear — Keyboard-First, Status-Driven**
Linear uses keyboard shortcuts for everything, status-driven navigation (Backlog → Todo → In Progress → Done), and progressive disclosure (list → detail → full page).
→ *Warrant:* `external:` Linear's keyboard-first design is the benchmark for professional tools. `reasoned:` Our Command Palette exists but no other keyboard shortcuts.
→ *Why it matters:* Professional investigators need professional tools; mouse-only is slow.

**5.3 VS Code — Panel Architecture**
VS Code uses a sidebar for navigation, a main editor area, and optional panels (terminal, debug, output). Panels can be toggled, resized, and rearranged.
→ *Warrant:* `external:` VS Code's panel system is the gold standard for complex workspace UIs. `reasoned:` Our Shell already has sidebar + main + right sidebar — extend with toggleable/resizeable panels.
→ *Why it matters:* Officers can customize their workspace for different investigation modes.

**5.4 Hospital EMR — Progressive Disclosure**
Emergency department EMRs show a "track board" (all patients, status, priority), then drill into individual patient charts. Critical info is always visible; details are one click away.
→ *Warrant:* `external:` Hospital EMR track boards solve the same "many items, varying priority" problem. `reasoned:` Our MyDayDashboard is a track board — formalize the pattern.
→ *Why it matters:* Proven in high-stakes, time-pressured environments (emergency departments).

**5.5 Spotify — Context-Driven UI**
Spotify shows different home screens based on time of day, listening history, and context (workout, commute, focus). The UI adapts to what you need right now.
→ *Warrant:* `external:` Spotify's contextual home is the model for adaptive UI. `reasoned:` Our Dashboard shows the same layout regardless of time, role, or case activity.
→ *Why it matters:* Adaptive UI reduces cognitive load; the right information at the right time.

---

### Frame 6: Constraint-Flipping

**6.1 What If We Had Zero Budget for Design?**
Strip to pure typography and whitespace. No colors, no shadows, no gradients. Just hierarchy through size, weight, and spacing. Force excellent information architecture.
→ *Warrant:* `reasoned:` Constraints breed creativity; brutalist design forces content-first thinking.
→ *Why it matters:* If the hierarchy works without decoration, it works with decoration. Proves the foundation.

**6.2 What If We Had 100 Users Instead of 3?**
Multi-user collaboration: officers work on cases simultaneously. Real-time presence indicators, shared annotations, conflict resolution.
→ *Warrant:* `reasoned:` Real investigations involve teams; single-user design is an artificial constraint.
→ *Why it matters:* Collaboration is the future of law enforcement tools; Palantir supports it.

**6.3 What If the Deadline Were Tomorrow?**
Ship the minimum viable redesign in 24 hours. What survives? Only the highest-impact changes: design tokens, consistent typography, one navigation model, empty states.
→ *Warrant:* `reasoned:` Deadline pressure reveals true priorities; everything else is nice-to-have.
→ *Why it matters:* Identifies the 20% of changes that deliver 80% of the value.

**6.4 What If We Were Building for Mobile First?**
Design for phone screens first, then scale up. Forces information density decisions, prioritization, and touch-friendly interactions.
→ *Warrant:* `reasoned:` Officers in the field use phones; desktop-only is an assumption.
→ *Why it matters:* Mobile-first design produces better desktop UIs too — forces clarity.

**6.5 What If We Had to Explain the UI to a New Officer in 30 Seconds?**
The "30-second test": can a new officer look at the screen and know exactly what to do? If not, the design fails the clarity test.
→ *Warrant:* `reasoned:` Onboarding cost is the hidden tax of complex UIs; clarity is the cure.
→ *Why it matters:* The best design is the one that needs no explanation.

---

## Cross-Cutting Combinations

**C1: Investigation OS + Palantir Case-Folder + Linear Keyboard-First**
Combine Frame 3's "Investigation OS" reframe with Frame 5's Palantir case-folder metaphor and Frame 5's Linear keyboard-first model. Result: an investigation operating system where cases are processes, evidence is files, and officers navigate with keyboard shortcuts following a status-driven lifecycle. This is the "Mission Control" concept.

**C2: VS Code Panel Architecture + Context-Driven UI + Progressive Disclosure**
Combine Frame 5's VS Code panel model with Frame 5's Spotify-like context-driven UI and Frame 3's progressive disclosure. Result: a workspace where panels are toggleable/resizable, the layout adapts to current investigation phase, and information is revealed progressively (overview → drill-down → deep analysis). This is the "Intelligence Workbench" concept.

**C3: Hospital EMR Track Board + Auto-Generate Daily Brief + Case Lifecycle**
Combine Frame 5's EMR track board with Frame 2's auto-generated daily brief and Frame 4's case lifecycle architecture. Result: a "case management OS" where the morning briefing is auto-generated, cases progress through lifecycle stages automatically, and the main view is a prioritized track board. This is the "Investigation OS" concept.

**C4: Design Token System + Reusable Panel Shell + One Theme**
Combine Frame 4's design tokens with Frame 4's reusable panel shell and Frame 2's single-theme decision. Result: a design system where tokens drive everything, panels share a consistent shell, and one visual theme eliminates inconsistency. Foundation for all three concepts.

**C5: 30-Second Test + Empty States + Keyboard Navigation**
Combine Frame 6's clarity test with Frame 1's empty states and Frame 1's keyboard navigation. Result: an interface that passes the 30-second test, has helpful empty states for every panel, and supports keyboard-first workflows. Quality foundation for any concept.

---

## Survivor Ranking (Top 7)

| Rank | Idea | Frame | Impact | Confidence |
|------|------|-------|--------|------------|
| 1 | C1: Investigation OS + Case-Folder + Keyboard | Cross-cut | ★★★★★ | 90% |
| 2 | C4: Design Tokens + Panel Shell + One Theme | Cross-cut | ★★★★★ | 95% |
| 3 | 2.2: Remove panel-tokens.css — One Theme | Inversion | ★★★★☆ | 95% |
| 4 | 3.1: Reframe as Investigation OS | Assumption | ★★★★☆ | 85% |
| 5 | 4.1: Design Token System | Leverage | ★★★★☆ | 95% |
| 6 | 1.2: Sidebar Navigation Overload | Pain | ★★★☆☆ | 90% |
| 7 | 3.3: Progressive Disclosure | Assumption | ★★★☆☆ | 85% |

---

## Status

- [x] Phase 1: Grounding complete
- [x] Phase 2: Divergent ideation complete (6 frames, 30 ideas, 7 survivors)
- [x] Phase 3: Critique and cross-cutting combinations
- [x] Phase 4: Three design concepts generated (Mission Control, Intelligence Workbench, Investigation OS)
- [x] Phase 5: Selection — Intelligence Workbench recommended (with Concept 1 status bar + Concept 3 notification tray)

## Output

Three design concepts + product vision document written to:  
`ksp/docs/brainstorms/redesign-product-vision.md`

