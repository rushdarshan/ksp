---
title: Reconcile KSP dashboard interior with the design system
type: refactor
status: active
date: 2026-07-07
origin: docs/brainstorms/ (none — derived from `impeccable critique` findings and code verification)
---

# Reconcile KSP dashboard interior with the design system

## Overview

The KSP Crime Analytics Dashboard has a strong, distinctive landing page (Fraunces + navy/gold restraint + redaction-bar motif) but the authenticated dashboard interior was built by a different process and never reconciled to `DESIGN.md`. The result reads as generic enterprise SaaS: hardcoded Tailwind/Apple colors, a broken sidebar token (`--accent-dim` undefined so the active-nav highlight is invisible), default-chart blues, a rainbow network graph, and a 23+ item sidebar wall. This plan reconciles the interior to the existing design system, using the landing page and the `PanelCard`/`panel-tokens.css` primitives as the reference implementation.

Scope is the **dashboard shell + charts + nav IA + loading motif**. It does NOT rebuild all ~50 feature panels onto `PanelCard` (that is explicitly deferred). The plan makes the interior consistently on-brand and fixes the functional token bug, which is the highest-leverage work identified by the critique.

---

## Problem Frame

A command officer, SCRB analyst, or sub-inspector logs in expecting the same "authoritative classified command center" they saw on the landing page. Instead they get a different-looking app: a sidebar where the current page is not visually marked (broken `--accent-dim`), a flood of hardcoded blue/red/green, a rainbow node graph, and a home screen that is only a Power BI iframe. The design system exists and is excellent at the edges, but it is not actually applied inside the authenticated experience. This undermines the product's core promise of "authority through precision."

---

## Requirements Trace

- R1. Every surface inside the authenticated app uses the KSP token palette (`--accent` navy, `--accent-warm` gold, warm monochrome), not hardcoded Tailwind/Apple hex.
- R2. The active navigation item is clearly visible (the `--accent-dim` token bug is fixed).
- R3. Charts and data viz use the navy/gold categorical scale, not Apple `#0071e3` or rainbow `hsl()`.
- R4. Loading and Suspense states use the redaction-bar skeleton motif, not bare "Loading…".
- R5. Primary navigation is scannable (high-frequency tasks surfaced, search-first for the rest), not a 23-item flat wall.
- R6. Glassmorphism is removed from app chrome in favor of solid `--surface`, per the flat-minimalism intent.

---

## Scope Boundaries

- Fix the dashboard shell, `PanelChart`, `NetworkGraph`, sidebar/nav IA, and loading motif.
- Extend `panel-tokens.css` coverage to catch the missed slate selectors the critique found.
- Do NOT rebuild every feature panel (`DeterrenceDashboard`, `VoiceQuery`, `TriagePanel`, `FilterBar`, etc.) onto `PanelCard`. Those inherit the token fixes and `panel-tokens.css` normalization; a full panel migration is a separate follow-up.
- Do NOT change the landing page (already on-brand).
- Do NOT alter backend APIs, auth, or data shapes.

### Deferred to Follow-Up Work

- Full feature-panel migration onto `PanelCard` + token colors (separate PR after shell is stable).
- Real KSP district names in `DeterrenceDashboard` (data/labeling task).
- Optional-chaining hardening for fragile API-shape assumptions in `DeterrenceDashboard` (separate fix).

---

## Context & Research

### Relevant Code and Patterns

- `client/src/App.scss` — `:root` token block (lines ~11-77) defines `--bg`, `--surface`, `--surface-alt`, `--text`, `--text-secondary`, `--accent` (+hover/active/text), `--accent-warm`, `--border-light`, `--font-display`, `--font-body`, `--radius-md` (24px). **Missing:** `--accent-dim`, `--h2FontSize`, `--smallFontSize`.
- `client/src/styles/panel-tokens.css` — defensive normalization layer that forces `.panel`/`.panel-box` to use `--surface`/`--text`/`--font-body` and kills dark backgrounds. This is the right pattern to extend, not replace.
- `client/src/Components/panels/PanelCard.tsx`, `PanelHeader.tsx`, `PanelBadge.tsx`, `PanelTable.tsx` — clean, token-driven primitives. The reference for how panels *should* look.
- `client/src/Pages/Homepage/landingpage.css` + `Hero.jsx` — the on-brand reference: `.redaction-bar` motif (navy→amber gradient, low opacity), Fraunces headings.
- `client/src/Components/Shell/Sidebar.jsx` — 35 nav references across Analytics/Operations/Quick groups; search (`/`) shortcut exists.
- `client/src/Components/Dashboard/Components/Body Section/Body.jsx` — home renders only `<Powerbi/>`; `Top`/`Listing`/`Activity` are commented out.

### Institutional Learnings

- None found in `docs/solutions/` relevant to this styling reconciliation.

### External References

- None required. The codebase has strong local patterns (landing page, `panel-tokens.css`, `PanelCard` primitives); this plan follows them rather than introducing external conventions.

---

## Key Technical Decisions

- **Extend `panel-tokens.css`, don't rewrite it.** It already rescues most inline-hex slop via `!important`. Add the missed slate selectors (`#f8fafc`, `#e2e8f0`, `#f3f4f6`, `#fafafa`, `#fef2f2`) to its dark/neutral-background kill list and map known status hexes to the pastel tokens. This is the cheapest way to pull feature panels on-palette without touching ~50 files.
- **Define the missing tokens in `App.scss :root`** (`--accent-dim: #eef2f6`, `--h2FontSize`, `--smallFontSize`) rather than editing each consuming SCSS file. Single source of truth, fixes the invisible active-nav bug at the root.
- **Categorical color scale for viz.** Replace `PanelChart.tsx:35` `['#0071e3','#34c759','#6e6e73','#1d1d1f']` with a navy→gold→neutral ramp using the existing tokens. Replace `NetworkGraph.jsx:26` `hsl(community*60,70%,50%)` rainbow with a small fixed accent-based categorical array (navy, gold, and 2-3 muted tints) indexed by `node.community % N`.
- **Nav IA: primary rail + search drawer, not a flat 23-item list.** Keep role-based filtering; surface ~6 high-frequency tasks (Dashboard, FIR, Officers, Map, Triage, Quick FIR) as a primary rail and move the rest behind the existing `/` search. This honors the existing search affordance instead of building new nav infra.
- **Redaction skeleton as the loading contract.** Add a `RedactionSkeleton` component (reusing `.redaction-bar` from landingpage.css / a shared token) and use it as the `Loader` fallback and `App.jsx` Suspense fallback.

---

## Open Questions

### Resolved During Planning

- Is the landing page the right reference? Yes — verified on-brand and distinctive; it defines the intended interior tone.
- Should we rebuild all panels now? No — deferred; shell + token fixes give ~80% of the visual win at a fraction of the risk.

### Deferred to Implementation

- Exact primary-rail task list per role (depends on role-permission map in `AuthContext`/`PanelGuard`).
- Final categorical color array length for `NetworkGraph` (depends on observed community count).

---

## Implementation Units

- U1. **Define missing design tokens in `App.scss`**

**Goal:** Fix the broken/undefined tokens so the active-nav highlight and label sizing render correctly.

**Requirements:** R2

**Dependencies:** None

**Files:**
- Modify: `client/src/App.scss`

**Approach:**
- Add `--accent-dim: #eef2f6` (subtle navy-tinted surface for active nav) to `:root`.
- Add `--h2FontSize: 2rem` and `--smallFontSize: 0.875rem` to match the DESIGN.md type scale, so `sidebar.scss` and `top.scss` resolve without local redefinitions.
- Remove the `#1a0808` near-black Help card background in `Components/Dashboard/Components/SideBar Section/sidebar.scss` (lines ~137-138); use `--surface-alt` or `--accent-dim` instead.

**Patterns to follow:**
- Existing `:root` block in `App.scss` (lines 11-77) uses the same `--token: value;` convention.

**Test scenarios:**
- Happy path: After change, `Sidebar.jsx` active item background resolves to `--accent-dim` (visible tint), not transparent.
- Edge case: Label elements referencing `--h2FontSize`/`--smallFontSize` render at the DESIGN.md sizes, not browser defaults.
- Test expectation: none -- pure CSS token addition; verify via visual/computed-style check in browser.

**Verification:**
- Computed style of an active sidebar item shows a non-transparent background; no `var()` resolves to invalid in the dashboard path.

---

- U2. **Extend `panel-tokens.css` to catch missed slate/neutral hex**

**Goal:** Pull the hardcoded Tailwind neutral backgrounds (`#f8fafc`, `#e2e8f0`, `#f3f4f6`, `#fafafa`) and status reds into the token system without editing each panel.

**Requirements:** R1

**Dependencies:** None

**Files:**
- Modify: `client/src/styles/panel-tokens.css`

**Approach:**
- Extend the existing "Kill dark backgrounds" block to also catch the slate/neutral hexes the critique found in `DeterrenceDashboard`, `FilterBar`, `TriagePanel` (e.g. `[style*="background: #f8fafc"]`, `#e2e8f0`, `#f3f4f6`, `#fafafa`).
- Add a pastel-status mapping so known status hexes (`#dc2626`, `#22c55e`, `#d97706`) map to the `--pastel-*`/`--pastel-*-text` tokens where they appear as inline badges.
- Keep the `!important` strategy consistent with the existing file.

**Patterns to follow:**
- The existing dark-bg kill list in `panel-tokens.css` (same selector shape, same `!important` override).

**Test scenarios:**
- Happy path: A panel containing `style={{background:'#f8fafc'}}` (as in `DeterrenceDashboard`) renders with `--surface`, not slate.
- Edge case: Inline status reds/greens fall back to pastel tokens, not raw saturated hex.
- Test expectation: none -- CSS normalization; verify by rendering a representative panel and inspecting computed background.

**Verification:**
- Feature panels with hardcoded slate backgrounds now render on the warm monochrome surface; no raw `#f8fafc`/`#e2e8f0` visible in the authenticated app.

---

- U3. **Fix chart and network categorical colors**

**Goal:** Replace Apple-blue chart series and rainbow network nodes with the navy/gold categorical scale.

**Requirements:** R1, R3

**Dependencies:** U1 (tokens available)

**Files:**
- Modify: `client/src/Components/panels/PanelChart.tsx`
- Modify: `client/src/Components/NetworkGraph.jsx`

**Approach:**
- `PanelChart.tsx:35`: replace `['#0071e3', '#34c759', '#6e6e73', '#1d1d1f']` with a ramp built from tokens: `['var(--accent)', 'var(--accent-warm)', 'var(--text-secondary)', 'var(--border-strong)']` (or equivalent resolved hex). Keep the `#6e6e73` label color but map to `--text-secondary`.
- `NetworkGraph.jsx:26`: replace `hsl(${node.community*60},70%,50%)` with a fixed categorical array indexed by `node.community % N` (e.g. navy, gold, and 2-3 muted tints derived from `--accent`/`--accent-warm`). Fallback to `var(--accent)` when `community` is absent.

**Patterns to follow:**
- `App.scss` token values for `--accent` (#1a3a5c) and `--accent-warm` (#b8860b).
- `HotspotMap.jsx` already uses the pastel tokens correctly — mirror its restraint.

**Test scenarios:**
- Happy path: A multi-series `PanelChart` renders series in navy then gold then neutral, not Apple blue/green.
- Happy path: `NetworkGraph` with 5 communities renders 5 distinct but on-palette hues from the categorical array, no rainbow saturation.
- Edge case: Node with no `community` renders in `--accent` (single color), not undefined fill.
- Test expectation: none -- visual; verify rendered colors against the token palette.

**Verification:**
- No `#0071e3` or `hsl()` rainbow appears in any chart/network in the authenticated app.

---

- U4. **Reduce sidebar nav to a scannable primary rail + search drawer**

**Goal:** Cut cognitive load from a 23+ item flat wall to a scannable primary rail, keeping the existing `/` search for the rest.

**Requirements:** R5

**Dependencies:** None

**Files:**
- Modify: `client/src/Components/Shell/Sidebar.jsx`
- Modify: `client/src/Components/Dashboard/Components/SideBar Section/sidebar.scss` (and sibling InspectorDash/SubInspectorDash sidebars if they share the pattern)

**Approach:**
- Group nav items into a primary rail of ~6 high-frequency tasks (Dashboard, FIR, Officers, Map, Triage, Quick FIR) shown by default.
- Keep the full set behind the existing `/` search affordance (already present at `Sidebar.jsx` keyboard handler) plus collapsible "All tools" group.
- Preserve role-based filtering from `AuthContext`/`PanelGuard`.
- Ensure active state uses the now-fixed `--accent-dim` (U1).

**Patterns to follow:**
- Existing `/` search shortcut in `Sidebar.jsx` (reuse, don't rebuild).
- Role filtering already in `PanelGuard.jsx` / `ADMIN_PANELS`.

**Test scenarios:**
- Happy path: On load, sidebar shows ≤6 primary items; pressing `/` opens search that can reach all tools.
- Edge case: A role without "Officers" permission sees the primary rail adjusted to its permitted high-frequency tasks.
- Error path: Search with no match shows an empty state, not a broken list.
- Test expectation: none -- interaction/IA; verify by clicking through roles in browser.

**Verification:**
- No role sees more than ~6 unprompted nav items; all tools remain reachable via `/` search.

---

- U5. **Add redaction-skeleton loading motif**

**Goal:** Replace bare "Loading…" / `<Loader/>` with the signature redaction-bar skeleton across route and panel loading.

**Requirements:** R4

**Dependencies:** None

**Files:**
- Create: `client/src/Components/Shell/RedactionSkeleton.tsx` (or extend `client/src/ui/Dropdown/Loader.jsx`)
- Modify: `client/src/Components/Dashboard/Components/Body Section/Body.jsx` (use skeleton instead of `<Loader/>`)
- Modify: `client/src/App.jsx` (Suspense fallback)

**Approach:**
- Create a `RedactionSkeleton` component rendering several `.redaction-bar` elements (navy→amber gradient, low opacity, optional `redaction-pulse` respecting `prefers-reduced-motion`) — reuse the motif already defined in `landingpage.css`/DESIGN.md.
- Use it as the `navigation.state === "loading"` fallback in `Body.jsx` and as the `App.jsx` `<Suspense fallback>`.
- Respect `prefers-reduced-motion` (disable pulse), per DESIGN.md motion rules.

**Patterns to follow:**
- `.redaction-bar` implementation in `landingpage.css` (navy→amber gradient, `opacity: 0.12`).
- `redaction-pulse` keyframe in DESIGN.md (opacity 0.08→0.16→0.08, 2s).

**Test scenarios:**
- Happy path: Navigating between routes shows the redaction-bar skeleton, not the text "Loading…".
- Edge case: With `prefers-reduced-motion: reduce`, the skeleton renders static (no pulse).
- Test expectation: none -- visual; verify in browser with motion emulation.

**Verification:**
- Every route transition and panel load shows the redaction skeleton; no bare "Loading…" string in the authenticated app.

---

- U6. **Remove glassmorphism from app chrome**

**Goal:** Replace frosted sticky headers with solid `--surface` to match flat minimalism.

**Requirements:** R6

**Dependencies:** U1

**Files:**
- Modify: `client/src/Components/Shell/top.scss` (lines 9-10 `backdrop-filter`)
- Modify: `client/src/Components/Dashboard/Components/SideBar Section/sidebar.scss` if it uses blur
- Modify: sibling `InspectorDash`/`SubInspectorDash` top.scss if they use `backdrop-filter`

**Approach:**
- Remove `backdrop-filter: saturate(180%) blur(20px)` from `Shell/top.scss`; set header background to solid `var(--surface)` with the single soft shadow (`--shadow-soft`) if separation is needed.
- Verify siblings and remove the same pattern.

**Patterns to follow:**
- `App.scss --shadow-soft: 0px 4px 20px rgba(0,0,0,0.06)` (the one allowed shadow).

**Test scenarios:**
- Happy path: Sticky header renders solid `--surface`, no blur, content behind it is not visible through the bar.
- Test expectation: none -- visual; verify in browser.

**Verification:**
- No `backdrop-filter` remains in authenticated app chrome; headers are solid surfaces.

---

## System-Wide Impact

- **Interaction graph:** Sidebar nav structure changes (U4) affect every route entry point; `PanelChart`/`NetworkGraph` color changes (U3) affect every panel that uses them.
- **Error propagation:** No behavior change; token additions (U1) are additive and cannot break existing resolves.
- **State lifecycle risks:** None — pure styling and one new presentational component.
- **API surface parity:** None.
- **Integration coverage:** U4 nav change should be clicked through per role; U3 colors should be eyeballed on at least one chart + one network panel.
- **Unchanged invariants:** Backend, auth, data shapes, landing page, and `PanelCard` primitives are untouched. Feature panels keep working via `panel-tokens.css` normalization.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `panel-tokens.css` `!important` overrides may over-flatten intentional panel accents | Review a sample of panels after U2; scope selectors to known slate/status hexes only |
| Primary-rail task selection may not match each role's real frequency | Defer exact list to implementation; keep full set reachable via `/` search so nothing is lost |
| NetworkGraph community count may exceed categorical array length | Index with `% N` so it wraps; acceptable for a network overview |

---

## Documentation / Operational Notes

- No runbook changes. This is a visual reconciliation; no new env vars, APIs, or CI changes.
- After implementation, re-run `impeccable critique` to confirm the design-health score climbs from 21/40.

---

## Sources & References

- Origin: `impeccable critique` findings (this session) on `client/src`
- Design system: `client/src/DESIGN.md`, `PRODUCT.md`
- Reference implementation: `client/src/Pages/Homepage/landingpage.css`, `client/src/Components/panels/PanelCard.tsx`, `client/src/styles/panel-tokens.css`
- Related code: `client/src/App.scss`, `client/src/Components/Shell/Sidebar.jsx`, `client/src/Components/panels/PanelChart.tsx`, `client/src/Components/NetworkGraph.jsx`
