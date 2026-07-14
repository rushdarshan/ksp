---
name: crime-genome-redesign
description: >
  Transform Crime Genome into a premium Investigation Operating System.
  Runs a design/product front-end (strategy, UX, design system, motion, QA)
  around lfg's shipping pipeline. Degrades gracefully when boutique skills
  aren't installed on the host, and never hardcodes a single plugin ecosystem
  for planning/implementation/shipping.
argument-hint: "[optional focus area]"
---

CRITICAL: You MUST execute the phases below IN ORDER. Do not begin implementation
(Phase 5+) until Phases 1–4 (product + design) are complete.

**Skill-resolution guard (applies to every phase below):**
For every phase's skill list, check the available-skills list the host
platform provides. **If a candidate name appears there (verbatim or
namespaced, e.g. `some-plugin:ceo-review`), you MUST actually call it via
the Skill/Task tool before doing anything else for that phase.** Listing in
available-skills is not itself permission to skip — it's the trigger to
invoke. Do not reason your way out of calling it ("this might need a
specific invocation pattern", "it may or may not resolve in this context",
"let me just do this myself instead") — that reasoning is exactly the
failure mode this guard exists to prevent. Call it and see what comes back.

Only treat a candidate as unresolved, and move to the next one in the list,
when one of these actually happened:
- it does not appear in available-skills at all, or
- you called it and the tool call itself errored or returned "not found."

**If every candidate in a phase's list is absent from available-skills**
(not: present-but-untried), skip straight to that phase's fallback checklist
— no need to call something that isn't listed. If you tried a listed
candidate and it errored, log the error and move to the next candidate; only
fall back to the checklist once every listed candidate has been tried and
failed. In your phase output, always state one of: which skill you
successfully invoked, which candidates you tried and their errors, or that
none were listed so you went straight to fallback — never silently do
fallback work while a listed skill sits unused.

==================================================
STEP 1 — Product Strategy
==================================================
Try (first match wins, invoke as many distinct ones as resolve):
`ceo-review`, `office-hours`, `plan-ceo-review`, `ce-ideate`, `shape`

Fallback checklist (if none resolve): challenge the current feature list
against real investigator workflows (case intake → correlation → theory
building → report), cut anything that doesn't serve the Karnataka State
Police Datathon judging criteria, and produce a written product + workflow
audit yourself.

Output: Product audit, workflow audit, prioritized improvements.

==================================================
STEP 2 — Enterprise UX Audit
==================================================
Try: `design-consultation`, `design-taste-frontend`, `stitch-design-taste`,
`frontend-design`, `emil-design-eng`

If `frontend-design` (the built-in skill under /mnt/skills/public/frontend-design)
is available, always include it — it's the one candidate here most likely to
actually exist on this host.

Benchmark against (principles, not visuals): Palantir Gotham, IBM i2, Linear,
Apple, Raycast, Arc, Microsoft Defender. Do NOT copy visuals — extract
information-density, hierarchy, and navigation principles.

Fallback checklist (if only `frontend-design` or nothing resolves): write the
UX report yourself — information architecture, visual hierarchy, and a gap
list against the benchmarks above.

Output: UX report, IA report, visual hierarchy report.

==================================================
STEP 3 — Design System
==================================================
Try: `layout`, `typeset`, `colorize`, `bolder`, `clarify`, `distill`, `adapt`

Fallback checklist: define directly — type scale, spacing scale, color
system (with semantic tokens, not raw hex in components), navigation system,
component hierarchy. Write these as a short design-tokens doc that Phase 5
implementation will consume.

Output: typography system, layout system, spacing scale, color system,
navigation system, component hierarchy.

==================================================
STEP 4 — Motion
==================================================
Try: `apple-design`, `improve-animations`, `review-animations`, `animate`,
`overdrive`, `delight`

Fallback checklist: define motion rules inline — every animation must
reinforce the investigation metaphor (e.g. entity-graph edges draw in,
theory-board cards settle), keep durations short (120–250ms) and easing
consistent, no decorative motion with no informational purpose.

==================================================
STEP 5 — Implementation Planning + Build (per phase)
==================================================
Phases to build, in order:
1. Mission Control shell
2. Navigation redesign
3. Case Workspace
4. ZIA Intelligence
5. Theory Board
6. Entity Graph
7. Final polish

**Do not hand-roll plan/implement/ship here.** For each phase above, invoke
`lfg` with that phase's description as its argument (folding in the Phase
1–4 audits and design-system doc as context). `lfg` already owns the full
plan-gate → implement → simplify → review → apply-fixes → residual-handoff →
ship → CI-babysit pipeline, including the same skill-resolution guard, and
is not tied to any one design-tool ecosystem — it only depends on the
compound-engineering primitives (`ce-plan`, `ce-work`, `ce-code-review`,
`ce-commit-push-pr`, etc.), which are the actual portable core here.

If `lfg` itself isn't available on this host, fall back to invoking
`ce-plan` then `ce-work` directly for the phase, and handle commit/push/PR
yourself per that project's normal workflow — but prefer `lfg` whenever it
resolves, since the fallback loses review-fix application, residual
ticketing, and CI babysitting.

Constraints for every phase: reuse existing components, delete duplicate UI,
merge unnecessary screens, never break existing Zoho Catalyst APIs.

Wait for each phase's `lfg` run to report `DONE` (or its local-only
equivalent) before starting the next phase.

==================================================
STEP 6 — Engineering Review
==================================================
Try: `react-best-practices`, `vercel-react-best-practices`, `best-practices`,
`optimize`, `core-web-vitals`

Fallback checklist: manually check for unnecessary re-renders, bundle size
regressions, unmemoized expensive computations (graph layout, correlation
scoring), and Core Web Vitals (LCP/INP/CLS) on the heaviest screens
(Entity Graph, Theory Board).

==================================================
STEP 7 — Quality Review
==================================================
Try: `impeccable`, `audit`, `critique`, `design-review`, `web-quality-audit`

If the interface still resembles a generic admin dashboard, return to Step 2.

Fallback checklist: hold every screen against the Step 2 benchmarks again —
if a screen could be mistaken for a stock CRUD admin panel, it fails this
gate and needs another design-system pass.

==================================================
STEP 8 — Final Verification
==================================================
Try: `benchmark`, `qa`, `verify-before-complete`

Fallback checklist (always run this regardless of whether the above resolve):
- Looks like an Investigation OS, not a generic dashboard
- A judge understands the workflow in 30 seconds
- Premium typography, enterprise-grade navigation
- Strong end-to-end workflow (intake → correlation → theory → report)
- Backend/Catalyst APIs preserved, no contract breaks

Output `DONE` only after all phases complete and the verification checklist
passes. If any phase fell back to inline work because no skill resolved,
list which phases substituted inline work for named skills, so future runs
on a better-equipped host know what to re-check.
