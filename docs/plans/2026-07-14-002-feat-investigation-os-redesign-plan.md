---
title: "feat: Investigation OS — Mission Control, Navigation, Theory Board"
type: feat
status: active
date: 2026-07-14
origin: docs/redesign/01-product-strategy.md
---

# Investigation OS — Mission Control, Navigation, Theory Board

## Overview

Transform the KSP Crime Genome platform from a generic admin dashboard into a premium Investigation Operating System. Focus on three high-impact changes: (1) redesign MyDay as a priority case queue instead of a card grid, (2) add breadcrumb navigation and collapse Analytics/Admin sidebar sections, (3) create a Theory Board component for hypothesis tracking. These changes make the investigation workflow visible to judges in 30 seconds.

---

## Problem Frame

Judges see 30+ panels with equal weight. The investigation workflow (intake → correlation → theory → chargesheet) is invisible. MyDay shows a card grid of 15+ items instead of today's priority cases. The sidebar has 16+ items in 4 sections with no hierarchy. There is no Theory Board despite it being a core investigation concept.

---

## Requirements Trace

- R1. MyDay must show a priority case queue (top 5 cases as a list, not a card grid)
- R2. Sidebar must collapse Analytics and Admin sections by default
- R3. Breadcrumb navigation must show current location in the app hierarchy
- R4. Theory Board component must track investigation hypotheses with status
- R5. All changes must use existing design system primitives (PanelCard, PanelHeader, etc.)
- R6. No new dependencies — CSS + React only
- R7. Build must pass clean

---

## Scope Boundaries

- No new backend functions — all data is mock/in-memory
- No state management library addition
- No test framework setup
- No Catalyst deployment changes
- Entity Graph remains in Case Workspace (standalone version deferred)

### Deferred to Follow-Up Work

- Standalone Entity Graph page (currently in Case Workspace tab)
- Command Palette (⌘K search) — high effort, deferred
- ZIA as always-accessible center — requires more architectural changes
- Full analytics panel consolidation (15 panels → grouped categories)

---

## Context & Research

### Relevant Code and Patterns

- `client/src/Components/MyDayDashboard.jsx` — Current MyDay (card grid, needs rewrite to queue)
- `client/src/Components/MyDay/myday.scss` — Current MyDay styles
- `client/src/Components/Shell/Shell.jsx` — App shell (sidebar + content area)
- `client/src/Components/Shell/Top.jsx` — TopBar (needs breadcrumb)
- `client/src/Components/Shell/top.scss` — TopBar styles
- `client/src/Components/panels/PanelCard.jsx` — Design system primitive
- `client/src/Components/CaseWorkspace/CaseWorkspace.jsx` — Case workspace (has Theory Board tab but no dedicated component)
- `client/src/App.jsx` — Routes (~30 shared child routes)

### Institutional Learnings

- Previous plans (2026-07-07-001, 2026-07-07-002) addressed design system reconciliation
- PanelCard/PanelHeader/PanelBadge are the design primitives — all new components use them
- Mock data pattern: hardcode realistic arrays at top of file with `ponytail:` comments
- CSS classes over inline styles (established in 6-phase redesign)

---

## Key Technical Decisions

1. **MyDay as PriorityQueue, not card grid**: List layout with case number, crime type, status badge, last updated time. Top 5 by urgency. Simpler than grid, more useful for judges.

2. **Sidebar collapse via CSS**: Analytics and Admin sections use `<details>/<summary>` or CSS `:checked` toggle. No JS state needed — pure CSS collapse.

3. **Breadcrumb from route hierarchy**: Parse `useLocation()` to build breadcrumb trail. No extra state — derived from URL.

4. **Theory Board as standalone component**: Separate from CaseWorkspace. Shows hypothesis cards with status (Active/Proven/Dismissed), linked entities, confidence score. Uses PanelCard primitive.

5. **Reuse existing mock data patterns**: All new components hardcode realistic mock arrays at top of file.

---

## Open Questions

### Resolved During Planning

- Q: Should MyDay show all cases or just today's? → A: Top 5 priority cases, regardless of date
- Q: Should breadcrumb be clickable? → A: Yes, each segment links to its route
- Q: Should Theory Board be a page or a component? → A: Component that can be used in CaseWorkspace or standalone

### Deferred to Implementation

- Exact mock data for Theory Board hypotheses (will create realistic Karnataka crime scenarios)
- Sidebar collapse animation (CSS transition vs instant)

---

## Implementation Units

- U1. **MyDay Priority Queue**

**Goal:** Replace the MyDay card grid with a priority case queue showing top 5 cases as a list.

**Requirements:** R1

**Dependencies:** None

**Files:**
- Modify: `client/src/Components/MyDayDashboard.jsx`
- Modify: `client/src/Components/MyDay/myday.scss`

**Approach:**
- Replace card grid with a vertical list layout
- Each item: case number, crime type, status badge, priority indicator, last updated
- Top 5 cases sorted by urgency (urgent > investigation > trial)
- Keep the "Today's Brief" section below the queue
- Use CSS classes from myday.scss (`.myday-queue`, `.queue-item`)

**Patterns to follow:**
- Existing `CaseWorkspace.jsx` status badge pattern
- `PanelCard` for container, `PanelBadge` for status

**Test scenarios:**
- Happy path: MyDay renders 5 priority cases in a list
- Edge case: No cases → empty state with "No priority cases today"
- Edge case: All cases same priority → sorted by last updated

**Verification:**
- MyDay shows a list of 5 cases, not a card grid
- Each case shows number, type, status badge, time
- "Today's Brief" section remains below the queue

---

- U2. **Sidebar Collapse + Breadcrumb Navigation**

**Goal:** Collapse Analytics/Admin sidebar sections by default. Add breadcrumb navigation to TopBar.

**Requirements:** R2, R3

**Dependencies:** None

**Files:**
- Modify: `client/src/Components/Shell/Shell.jsx`
- Modify: `client/src/Components/Shell/Top.jsx`
- Modify: `client/src/Components/Shell/top.scss`
- Modify: `client/src/Components/Shell/sidebar.scss`

**Approach:**
- Sidebar: wrap Analytics and Admin sections in collapsible containers
- Use `<details>/<summary>` for semantic collapse (no JS needed)
- Add CSS transition for smooth open/close
- TopBar: parse `useLocation()` to build breadcrumb array
- Render breadcrumb as `Home > Section > Page` with links
- Style breadcrumb with existing TopBar CSS variables

**Patterns to follow:**
- Existing sidebar section structure in `Shell.jsx`
- `useLocation()` from react-router-dom for route parsing

**Test scenarios:**
- Happy path: Analytics/Admin sections collapsed by default, expandable
- Happy path: Breadcrumb shows correct path for any route
- Edge case: Root route → breadcrumb shows just "Home"
- Edge case: Deep route → breadcrumb truncates with ellipsis if too long

**Verification:**
- Sidebar has collapsible Analytics/Admin sections
- TopBar shows breadcrumb navigation
- Breadcrumb links navigate to correct routes

---

- U3. **Theory Board Component**

**Goal:** Create a Theory Board component for tracking investigation hypotheses.

**Requirements:** R4

**Dependencies:** None

**Files:**
- Create: `client/src/Components/TheoryBoard/TheoryBoard.jsx`
- Create: `client/src/Components/TheoryBoard/theoryboard.scss`
- Modify: `client/src/App.jsx` (add route)

**Approach:**
- Create TheoryBoard component with mock hypothesis data
- Each hypothesis card: title, description, status (Active/Proven/Dismissed), linked entities, confidence score
- Use PanelCard/PanelHeader primitives
- Add route `/theory-board` in App.jsx
- Add sidebar link in Shell.jsx

**Patterns to follow:**
- Existing `CaseWorkspace.jsx` tab structure for hypothesis display
- `PanelCard` for container, `PanelBadge` for status, `PanelHeader` for title

**Test scenarios:**
- Happy path: Theory Board renders 3-5 mock hypotheses
- Happy path: Each hypothesis shows status badge with correct color
- Edge case: No hypotheses → empty state with "No active theories"
- Edge case: Status filter (All/Active/Proven/Dismissed)

**Verification:**
- Theory Board page renders at `/theory-board`
- Hypotheses display with status badges
- Page uses design system primitives

---

- U4. **Polish and Integration**

**Goal:** Ensure all new components integrate cleanly, build passes, visual consistency.

**Requirements:** R5, R6, R7

**Dependencies:** U1, U2, U3

**Files:**
- Verify: All modified/created files
- Modify: `client/src/App.jsx` (if routing needs adjustment)

**Approach:**
- Run `npm run build` and fix any errors
- Verify visual consistency across all new components
- Ensure no inline styles (use CSS classes)
- Check responsive behavior at 768px and 1024px breakpoints

**Test scenarios:**
- Build passes with no errors
- All new pages render without console errors
- Responsive layout works at mobile/tablet/desktop

**Verification:**
- `npm run build` succeeds
- No console errors on any new page
- Visual consistency with existing design system

---

## System-Wide Impact

- **Interaction graph:** Sidebar collapse affects Shell.jsx layout. Breadcrumb affects TopBar rendering. Theory Board adds new route.
- **Error propagation:** Mock data failures only — no backend changes.
- **State lifecycle risks:** None — all state is local component state.
- **API surface parity:** No API changes.
- **Unchanged invariants:** Existing routes, CaseWorkspace, ChatPanel, all analytics panels remain unchanged.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Sidebar collapse breaks layout | Test at multiple viewport widths |
| Breadcrumb parsing fails on complex routes | Fallback to route name from config |
| Theory Board mock data looks unrealistic | Use Karnataka crime scenarios from existing mock data |

---

## Sources & References

- Origin: `docs/redesign/01-product-strategy.md`
- Origin: `docs/redesign/02-enterprise-ux-audit.md`
- Origin: `docs/redesign/03-design-system.md`
- Origin: `docs/redesign/04-motion.md`
- Related plan: `docs/plans/2026-07-14-001-feat-hackathon-winning-polish-plan.md`
