---
title: "fix: Remove AI anti-patterns from redesign components"
type: fix
status: active
date: 2026-07-14
origin: impeccable critique (2026-07-14)
---

# Fix Critique Anti-Patterns

## Overview

Remove 35 AI-generated UI anti-patterns detected by the impeccable scanner across the KSP Crime Genome platform. Focus on the 4 pattern categories: side-tab borders (18), Inter font overuse (9), layout transitions (6), and bounce easing (2).

---

## Problem Frame

The impeccable critique scored the redesign 25/40 on Nielsen's heuristics. The biggest issue: 18 `border-left: 3px solid` side-tab accents across 6 files — the single most recognizable AI-generated UI tell. Combined with Inter font overuse (9 instances) and layout animation anti-patterns (8 instances), the interface risks being dismissed as generic AI output during hackathon judging.

---

## Requirements Trace

- R1. Remove all `border-left: 3px solid` side-tab accent borders (18 instances)
- R2. Replace direct `font-family: Inter` with design system variables (9 instances)
- R3. Replace layout property animations with transform/opacity (6 instances)
- R4. Replace bounce easing with ease-out-quart/expo (2 instances)
- R5. Build must pass clean after all changes

---

## Scope Boundaries

- Only fix anti-patterns detected by the scanner
- Do not restructure components or change functionality
- Do not add new features (keyboard shortcuts deferred)
- Preserve visual hierarchy — replace side-tab borders with subtler alternatives, not removal

---

## Implementation Units

- U1. **Remove side-tab borders**

**Goal:** Replace all `border-left: 3px solid` accent borders with full 1px borders or background tints

**Requirements:** R1

**Dependencies:** None

**Files:**
- Modify: `client/src/Components/CaseWorkspace/AIIntelligenceBrief.jsx`
- Modify: `client/src/Components/CaseWorkspace/AIIntelligenceBrief.scss`
- Modify: `client/src/Components/CaseWorkspace/EvidenceReview.jsx`
- Modify: `client/src/Components/FirDetails/CrimeGenomePanel.jsx`
- Modify: `client/src/Components/FirDetails/DetailedFir.jsx`
- Modify: `client/src/Components/VoiceQuery.jsx`
- Modify: `client/src/Components/TheoryBoard/theoryboard.scss`

**Approach:**
- Replace `border-left: 3px solid #b8860b` with `border: 1px solid var(--border-light)` and `background: var(--surface)`
- Use `border-left: 3px solid var(--amber)` → `border-left: none; border: 1px solid var(--border-light)` pattern
- Preserve amber accent via background tint on header/label elements instead

**Patterns to follow:**
- Existing PanelCard uses `border: 1px solid var(--border-light)` — follow that

**Test scenarios:**
- Happy path: All side-tab borders replaced, no `border-left: 3px` remains
- Happy path: Visual hierarchy preserved — cards still have clear boundaries
- Edge case: Components that used border-left as sole visual separator still distinguishable

**Verification:**
- `npx impeccable --json --fast client/src/` returns 0 side-tab findings
- `npm run build` passes clean

---

- U2. **Replace Inter font with design system variables**

**Goal:** Replace direct `font-family: Inter` with `var(--font-body)` or `var(--font-display)`

**Requirements:** R2

**Dependencies:** None

**Files:**
- Modify: `client/src/Components/CaseWorkspace/AIIntelligenceBrief.jsx`
- Modify: `client/src/Components/CaseWorkspace/AIIntelligenceBrief.scss`
- Modify: `client/src/Components/ChatPanel/ChatPanel.scss`

**Approach:**
- Replace `font-family: Inter` with `font-family: var(--font-body)` in JSX inline styles
- Replace `font-family: 'Inter', sans-serif` with `font-family: var(--font-body)` in SCSS
- Heading elements should use `var(--font-display)` (Fraunces)

**Patterns to follow:**
- `client/src/styles/components.css` defines `--font-body` and `--font-display`

**Test scenarios:**
- Happy path: No direct `font-family: Inter` remains in scanned files
- Happy path: Typography renders correctly with Fraunces headings, Inter body

**Verification:**
- `npx impeccable --json --fast client/src/` returns 0 overused-font findings
- `npm run build` passes clean

---

- U3. **Fix layout transitions and bounce easing**

**Goal:** Replace layout property animations with transform/opacity; replace bounce easing with smooth curves

**Requirements:** R3, R4

**Dependencies:** None

**Files:**
- Modify: `client/src/Components/CaseWorkspace/AIIntelligenceBrief.scss`
- Modify: `client/src/Components/FirDetails/CrimeGenomePanel.jsx`
- Modify: `client/src/Components/RetractionRatePanel.jsx`
- Modify: `client/src/Components/Shell/Sidebar.jsx`
- Modify: `client/src/Components/Shell/sidebar.scss`
- Modify: `client/src/Components/TheoryBoard/theoryboard.scss`
- Modify: `client/src/Components/ChatPanel/ChatPanel.scss`
- Modify: `client/src/Components/VoiceQuery.jsx`

**Approach:**
- Layout transitions: Replace `transition: height/width/max-height` with `transition: transform, opacity`
- Use `transform: scaleY(0)` → `transform: scaleY(1)` for collapse/expand
- Use `opacity: 0` → `opacity: 1` for fade effects
- Bounce easing: Replace `cubic-bezier` bounce with `cubic-bezier(0.25, 1, 0.5, 1)` (ease-out-quart)

**Patterns to follow:**
- `client/src/styles/components.css` defines `--ease-out` variable

**Test scenarios:**
- Happy path: All layout transitions replaced with transform/opacity
- Happy path: Bounce easing replaced with smooth curves
- Edge case: Sidebar collapse still animates smoothly
- Edge case: TheoryBoard status filter transitions still feel responsive

**Verification:**
- `npx impeccable --json --fast client/src/` returns 0 layout-transition and 0 bounce-easing findings
- `npm run build` passes clean

---

## System-Wide Impact

- **Interaction graph:** CSS-only changes — no component logic affected
- **Error propagation:** None — styling changes only
- **State lifecycle risks:** None
- **API surface parity:** No API changes
- **Unchanged invariants:** All component functionality preserved

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Side-tab removal reduces visual hierarchy | Use background tints and full borders instead |
| Layout transition fix changes animation feel | Test sidebar collapse and filter transitions manually |

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Side-tab removal reduces visual hierarchy | Use background tints and full borders instead |
| Layout transition fix changes animation feel | Test sidebar collapse and filter transitions manually |

## Post-Execution Notes

**CEO Review (2026-07-14) — HOLD SCOPE mode**

Accepted exemptions:
- Progress bar width/height transitions: Data visualization bars animate once on render — exempt from layout-animation rule
- Sidebar width transition: Collapsible sidebar requires width to reflow main content; `transform` would break layout. Easing standardized to `var(--easing)` in Sidebar.jsx
- DetailedFir 4px left borders: Replaced with 2px top borders — color distinction preserved
- EvidenceReview colored left borders: Status colors preserved through badges (`badge--success`/`--warning`/`--critical`)

## Sources & References

- Impeccable critique: 35 findings across 4 antipattern categories
- Scanner output: `npx impeccable --json --fast client/src/`
- Design system: `client/src/styles/components.css`
