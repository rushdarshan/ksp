---
title: "refactor: Fix audit findings — a11y, memo, theming, responsive"
type: refactor
status: active
date: 2026-07-14
origin: audit (2026-07-14), score 7/20
---

# Fix Audit Findings

## Overview

Address the 4 lowest-scoring dimensions from the audit: accessibility (1/4), performance (1/4), theming (1/4), and responsive (1/4). Fix the highest-impact issues in each dimension — P0/P1 only. The anti-patterns dimension (3/4) already has most issues resolved from prior work.

---

## Problem Frame

The project scored 7/20 on technical audit. The redesign components score well (3-4/4) but the older 30+ panels carry heavy debt: zero React.memo, 1,400+ inline styles, 500+ hardcoded colors, no form labels, 18 ad-hoc breakpoints. Fixing these brings the floor up to the level of the new components.

---

## Requirements Trace

- R1. All form inputs have associated `<label>` elements or `aria-label`
- R2. All icon-only buttons have `aria-label`
- R3. Top 5 inline-style-heavy panels use React.memo
- R4. 8 most-repeated hex colors replaced with CSS custom properties
- R5. Tablet breakpoint (768-1050px) has responsive coverage
- R6. Sidebar touch targets meet 44px minimum
- R7. Build must pass clean

---

## Scope Boundaries

- Only fix P0/P1 audit findings. P2/P3 deferred.
- Do not restructure components or change functionality
- Do not rewrite panels — only surface-level fixes (memo wrappers, color swaps, attribute additions)
- The 1,400+ inline style extraction is deferred — too large for this pass

### Deferred to Follow-Up Work

- Extract all inline styles to CSS classes (1,400+ instances across 37 files)
- Full 500+ hardcoded color replacement (this pass covers the 8 most-repeated only)
- Comprehensive responsive system (this pass adds tablet coverage only)

---

## Implementation Units

- U1. **A11y fixes — form labels and icon buttons**

**Goal:** Add missing form labels and icon button aria-labels

**Requirements:** R1, R2

**Dependencies:** None

**Files:**
- Modify: `client/src/Components/VictimRiskPanel.jsx`
- Modify: `client/src/Components/FilterBar.jsx`
- Modify: `client/src/Components/VeracityPanel.jsx`
- Modify: `client/src/ui/Popup/Popup.jsx`
- Modify: `client/src/Components/InspectorDash/Components/Body Section/Powerbi/Powerbi.jsx`
- Modify: `client/src/Components/Dashboard/Components/Body Section/Powerbi/Powerbi.jsx`
- Modify: `client/src/Components/SubInspectorDash/Components/Body Section/Powerbi/Powerbi.jsx`

**Approach:**
- Add `<label htmlFor="...">` elements wrapping or preceding each unlabeled input
- Add `id` attributes to inputs and `htmlFor` on labels for programmatic association
- Add `aria-label="..."` to icon-only buttons (notification bell, kebab menu, search icon)
- Wrap clickable `<div>` elements with `role="button"` and `tabIndex={0}` and `onKeyDown` handler

**Patterns to follow:**
- Existing inputs with labels (search for `htmlFor` in codebase)

**Test scenarios:**
- Happy path: All 6 unlabeled inputs now have associated labels
- Happy path: All 4 icon-only buttons have `aria-label`
- Edge case: Clickable divs accept keyboard activation (Enter/Space)

**Verification:**
- `npm run build` passes
- No `<input>` without associated `<label>` or `aria-label` in targeted files

---

- U2. **React.memo on top 5 panel components**

**Goal:** Wrap the 5 heaviest panel components in React.memo to prevent unnecessary re-renders

**Requirements:** R3

**Dependencies:** None

**Files:**
- Modify: `client/src/Components/BeatOptimizerPanel.jsx`
- Modify: `client/src/Components/FirDetails/CrimeGenomePanel.jsx`
- Modify: `client/src/Components/FirDetails/DetailedFir.jsx`
- Modify: `client/src/Components/GbvPanel.jsx`
- Modify: `client/src/Components/VictimRiskPanel.jsx`

**Approach:**
- Add `const ComponentName = React.memo(function ComponentName(...) { ... })` or wrap the default export
- Use `React.memo` on the default export: `export default React.memo(ComponentName)`
- Remove arrow-function default export and use named function instead

**Patterns to follow:**
- Check if any existing component uses React.memo (import may already exist)

**Test scenarios:**
- Happy path: All 5 panel components wrapped in React.memo
- Happy path: Components still render correctly (no prop changes)
- Edge case: Components with object/array props still work (shallow comparison)

**Verification:**
- `npm run build` passes
- Each component's export line includes `React.memo()`

---

- U3. **Replace 8 most-repeated hex colors with CSS custom properties**

**Goal:** Replace the 8 most-repeated hex values with existing or new CSS custom properties

**Requirements:** R4

**Dependencies:** None

**Files:**
- Modify: `client/src/App.scss` (add new CSS custom properties if needed)
- Modify: 45+ .jsx and .scss files across `client/src/Components/`

**Approach:**
- Define 8 new CSS custom properties in `:root` in `App.scss` for the most-repeated colors:
  - `#dc2626` → `--color-red`
  - `#22c55e` / `#4ade80` → `--color-green`
  - `#d97706` / `#facc15` → `--color-amber`
  - `#f87171` → `--color-red-soft`
  - `#6b7280` → `--color-gray-500`
  - `#94a3b8` → `--color-gray-400`
  - `#f8fafc` → `--color-surface-50`
  - `#e2e8f0` → `--color-border-200`
- Replace all occurrences of these hex values across the codebase with the new variables
- Inline styles: use `'var(--color-red)'` syntax
- SCSS: use `var(--color-red)` syntax

**Execution note:** This is a bulk find-and-replace operation. Use replaceAll across all files for each color.

**Patterns to follow:**
- Existing token conventions in `App.scss`: `--text`, `--surface`, `--border`, `--accent`

**Test scenarios:**
- Happy path: No instances of the 8 hex values remain in source files
- Happy path: Colors render identically at runtime (CSS vars resolve to same hex)

**Verification:**
- `npm run build` passes
- `rg "#dc2626" client/src/ --include="*.jsx" --include="*.scss"` returns 0 for each of the 8 colors (except in comments or test files)

---

- U4. **Responsive fixes — tablet breakpoint and touch targets**

**Goal:** Add responsive coverage for 768-1050px tablet range, bump sidebar touch targets to 44px

**Requirements:** R5, R6

**Dependencies:** None

**Files:**
- Modify: `client/src/Components/Shell/sidebar.scss`
- Modify: `client/src/styles/mobile.css`

**Approach:**
- Move the `min-height: 44px` rule from `mobile.css` (currently `max-width: 767px`) to extend to `max-width: 1050px` so tablet landscape is covered
- Bump sidebar `.menuLink` padding/min-height from 40px to 44px
- Bump `.sidebar-section-header` padding/min-height from 40px to 44px

**Patterns to follow:**
- Existing `mobile.css` pattern for setting touch targets

**Test scenarios:**
- Happy path: Touch targets on sidebar links are ≥44px at all viewport widths
- Happy path: Tablet viewport (768-1050px) has touch target coverage

**Verification:**
- `npm run build` passes
- `rg "min-height" client/src/Components/Shell/sidebar.scss` shows 44px

---

## System-Wide Impact

- **Interaction graph:** A11y changes add keyboard handlers to existing click handlers — no logic changes
- **Error propagation:** None — styling changes, attribute additions, memo wrappers
- **State lifecycle risks:** None
- **API surface parity:** No API changes
- **Unchanged invariants:** All component functionality preserved

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| React.memo breaks component with complex props | Test render after wrapping; use arePropsEqual if needed |
| Bulk color replacement misses edge cases | Use breadth-first search per color; verify build passes |
| A11y label text may be imprecise | Use existing text content or aria-label from context |
| Touch target changes affect sidebar layout | Test at multiple viewports |
