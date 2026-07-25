---
title: "refactor: Safe cuts from ponytail audit"
type: refactor
status: active
date: 2026-07-25
origin: ponytail audit (2026-07-25), score: ~1000 lines removable
---

# Safe Cuts from Ponytail Audit

## Overview

Remove dead code, consolidate synthetic-only mock functions, and replace large if-chains with lookup objects. Only the zero-risk findings from the audit — nothing that would break the demo.

---

## Problem Frame

The ponytail audit found ~20 over-engineering issues totaling ~1000 removable lines. The ADHD analysis confirmed that 3 categories are safe to fix immediately: deleting empty artifacts (zero risk), replacing if-chains with lookups (pure refactor), and extracting static inline styles to CSS (visual only, no behavior change). The 6 synthetic mock functions are NOT safe to merge before demo — frontend components depend on specific response shapes.

---

## Requirements Trace

- R1. Delete `functions/shared/package.json` — zero dependencies
- R2. Replace 31 if-statements in `crime_chat/index.js` with lookup object
- R3. Remove empty `.opencode/` temp scripts and `.context/` artifact dirs
- R4. Extract static inline styles to CSS in 3 highest-density components (DetailedFir, CrimeGenomePanel, Firdetails)
- R5. Build must pass clean

---

## Scope Boundaries

- Do NOT merge the 6 synthetic mock functions (risky before demo)
- Do NOT delete any Catalyst function (breaks frontend panels)
- Do NOT touch dynamic inline styles that use JS variables (`translateX`, conditional colors)
- Deferred: full inline style extraction across all 20 findings

---

## Implementation Units

- U1. **Delete dead files and empty artifacts**

**Goal:** Remove `functions/shared/package.json`, temp scripts, empty artifact dirs

**Requirements:** R1, R3

**Dependencies:** None

**Files:**
- Delete: `functions/shared/package.json`
- Delete: `.opencode/recon.py` (and `replace-colors.py`, `count-hex.py`, `fix-alpha.py`)
- Delete: empty `.context/` subdirectories (not the code-review artifacts that may still be useful)

**Approach:**
- Verify each file has no imports or references before deleting
- `functions/shared/package.json` has no dependencies listed — safe to remove
- Temp scripts are dev artifacts never referenced by the app

**Verification:**
- `npm run build` passes
- No remaining references to deleted files in source code

---

- U2. **Replace if-chain with lookup object in crime_chat**

**Goal:** Replace 31 if-statements with a handler lookup object

**Requirements:** R2

**Dependencies:** U1

**Files:**
- Modify: `functions/crime_chat/index.js`

**Approach:**
- Define `const HANDLERS = { case_summary: caseSummary, evidence_gaps: investigativeSupport, ... }` mapping intent strings to handler functions
- Replace the if-chain with `const fn = HANDLERS[intent]; if (fn) result = await fn(...)`
- Keep the existing fallback path for undefined intents
- Ensure `legal` and `aggregateIntelligence` handlers are included in the lookup

**Verification:**
- `npm run build` passes (no backend build needed, but verify the app starts)
- Every intent keyword in the original code has a corresponding key in the lookup

---

- U3. **Extract static inline styles in top 3 components**

**Goal:** Move static inline styles (colors, padding, borders, font) to CSS classes in DetailedFir.jsx, CrimeGenomePanel.jsx, Firdetails.jsx

**Requirements:** R4

**Dependencies:** None

**Files:**
- Modify: `client/src/Components/FirDetails/DetailedFir.jsx`
- Modify: `client/src/Components/FirDetails/CrimeGenomePanel.jsx`
- Modify: `client/src/Components/FirDetails/Firdetails.jsx`
- Create: `client/src/styles/detailed-fir.css` (new CSS for extracted styles)

**Approach:**
- Scan each file for `style={{ ... }}` where ALL values are static strings/numbers (not JS variables or state)
- Extract those to CSS classes in new CSS files
- Leave inline any style that uses JS variables, state, props, or expressions like `translateX(${x}px)`
- Apply classes with `className` on the JSX elements

**Verification:**
- `npm run build` passes
- Visual comparison: component renders identically (no visible change)
