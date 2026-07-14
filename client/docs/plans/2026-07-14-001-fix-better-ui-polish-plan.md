---
title: 'fix: Apply better-ui polish to KSP Dashboard'
type: refactor
status: active
date: 2026-07-14
---

# fix: Apply better-ui polish to KSP Dashboard

## Overview

Apply the better-ui design engineering principles to the KSP Crime Genome dashboard — fixing scale-on-press values, removing `transition: all`, adding image outlines, fixing hit areas, adding exit animations, icon transitions, and extending stagger coverage.

---

## Problem Frame

The better-ui audit identified 12 specific violations across 8 CSS/SCSS files. These are low-risk, purely cosmetic/CSS fixes that improve visual polish without altering behavior.

---

## Requirements Trace

- R1. Scale-on-press values must be consistently `scale(0.96)` everywhere
- R2. No `transition: all` — each must specify exact properties
- R3. Images must have a `1px` outline with `oklch(0 0 0 / 0.1)`
- R4. Desktop interactive elements must meet minimum 40px hit area
- R5. ChatPanel must have an exit animation
- R6. Icon state changes must use opacity/scale/blur transitions
- R7. Stagger animation coverage must extend beyond 6 children

---

## Scope Boundaries

- CSS/SCSS only — no JSX logic changes, no new components, no dependencies
- No behavioral changes — visual polish only

---

## Implementation Units

- U1. **[Fix scale-on-press consistency]**

**Goal:** Normalize all `:active` scale values to `0.96`

**Dependencies:** None

**Files:**
- Modify: `src/App.scss`
- Modify: `src/Components/ChatPanel/ChatPanel.scss`
- Modify: `src/Pages/Homepage/landingpage.css`

**Approach:**
- `.btn:active` in App.scss: `scale(0.98)` → `scale(0.96)`
- `.pressable:active` in App.scss: `scale(0.97)` → `scale(0.96)`
- `.cp__send:active` in ChatPanel.scss: `scale(0.94)` → `scale(0.96)`
- `.cp__fab:active` in ChatPanel.scss: `scale(0.97)` → `scale(0.96)`
- Landing page buttons: `scale(0.97)` → `scale(0.96)`

**Test scenarios:**
- Verify all `:active` scale values are exactly `0.96` across the codebase

**Verification:**
- `grep` for `scale\(0\.` in `src/` — should only show `scale(0.96)` and `scaleIn` keyframe

- U2. **[Remove `transition: all` violations]**

**Goal:** Replace every `transition: all` with specific property transitions

**Dependencies:** None

**Files:**
- Modify: `src/Components/Shell/sidebar.scss` (lines 53, 154)
- Modify: `src/Components/TheoryBoard/theoryboard.scss` (line 18)
- Modify: `src/Components/CaseWorkspace/TheoryBoard.scss` (lines 64, 400)
- Modify: `src/Components/FirDetails/firdetails.module.css` (line 146)
- Modify: `src/ui/Popup/popup.module.css` (line 40)

**Approach:**
- `sidebar.scss` line 53: `transition: all` → `transition: background-color, color`
- `sidebar.scss` line 154: `transition: all` → `transition: color, background-color`
- `theoryboard.scss` line 18: `transition: all` → specific properties
- `TheoryBoard.scss` lines 64, 400: `transition: all` → specific properties
- `firdetails.module.css` line 146: `transition: all` → specific properties
- `popup.module.css` line 40: `transition: all` → `transition: transform, opacity`

**Test scenarios:**
- Verify no `transition: all` remains in `src/`

**Verification:**
- `grep` for `transition:\s*all` in `src/` returns zero matches

- U3. **[Add image outlines]**

**Goal:** Add subtle `1px` outline to all images

**Dependencies:** None

**Files:**
- Modify: `src/App.scss`

**Approach:**
- Add `outline: 1px solid oklch(0 0 0 / 0.1)` to the global `img` rule in App.scss

**Test scenarios:**
- Images render with a visible subtle 1px outline

**Verification:**
- All `<img>` elements have the outline style applied

- U4. **[Fix desktop minimum hit areas]**

**Goal:** Ensure interactive elements meet 40x40px minimum on desktop

**Dependencies:** None

**Files:**
- Modify: `src/ui/Dropdown/dropdown.css`
- Modify: `src/Components/ChatPanel/ChatPanel.scss`
- Modify: `src/Components/Shell/sidebar.scss`

**Approach:**
- `.IconButton` in dropdown.css: `height: 30px` → `min-height: 40px`
- `.cp__send` in ChatPanel.scss: `36px` → `min-height: 40px`
- `.cp__header-btn` in ChatPanel.scss: `32px` → `min-height: 40px`
- `.menuLink` in sidebar.scss: add `min-height: 40px`
- `.sidebar-section-header` in sidebar.scss: add `min-height: 40px`

**Test scenarios:**
- Affected elements have min-height >= 40px

**Verification:**
- All targeted elements meet 40px minimum height

- U5. **[Add ChatPanel exit animation]**

**Goal:** ChatPanel slides out on close

**Dependencies:** None

**Files:**
- Modify: `src/Components/ChatPanel/ChatPanel.scss`
- Modify: `src/Components/ChatPanel/ChatPanel.jsx`

**Approach:**
- Add `cp-slide-out` keyframe that reverses `cp-slide-in`
- Add `.cp.closing` class with exit animation (opacity 0, translateY 16px)
- In ChatPanel.jsx: on close, add closing state, animate out, unmount after 250ms

**Test scenarios:**
- Closing chat panel triggers visible reverse-slide animation

**Verification:**
- Chat panel exit animates rather than disappearing instantly

- U6. **[Extend stagger animation coverage]**

**Goal:** Stagger class covers more children

**Dependencies:** None

**Files:**
- Modify: `src/App.scss`

**Approach:**
- Extend `.stagger > *:nth-child` from 6 to 12 children with 40ms increments

**Test scenarios:**
- Pages with >6 staggered items animate correctly

**Verification:**
- All 12 stagger delay rules present in App.scss

- U7. **[Icon cross-fade transitions in sidebar]**

**Goal:** Animate icon state changes with opacity/scale/blur

**Dependencies:** None

**Files:**
- Modify: `src/Components/Shell/sidebar.scss`

**Approach:**
- Add `transition: opacity 0.2s var(--easing)` to the `.icon` class in sidebar.scss
- The `.menuLink:hover .icon` already has `opacity: 1` — just needs the transition

**Test scenarios:**
- Icons smoothly fade opacity on hover

**Verification:**
- Icon opacity changes are interpolated

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Hit area changes could shift layout | Use `min-height` not `height` where possible to avoid breaking existing layouts |
| Exit animation timing mismatch | Match animation duration (250ms) to the timeout before unmount |

---

## Verification

After all units:
1. `grep -r "transition: all" src/` — 0 matches
2. `grep -r "scale(0\.\(9[4-8]\|98\))" src/` — only `scale(0.96)` and keyframes remain
3. `grep -r "outline.*oklch" src/App.scss` — image outline present
