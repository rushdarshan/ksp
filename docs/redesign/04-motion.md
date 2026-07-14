# Phase 4 — Motion System

## Core Principle
Every animation reinforces the investigation metaphor. No decorative motion.

## Investigation-Metaphor Animations

### Entity Graph Edges
- **Draw-in:** edges animate from source → target (like drawing a connection)
- **Duration:** 300ms, spring with `damping: 1.0, response: 0.3`
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (Apple's standard)

### Theory Board Cards
- **Settle:** cards drop into place with slight overshoot (like pinning evidence)
- **Duration:** 250ms, spring with `damping: 0.8, response: 0.25`
- **Bounce:** 0.15 (gentle settle, not playful bounce)

### Case Workspace Tabs
- **Underline slide:** tab indicator slides to active tab
- **Duration:** 200ms, `ease-out`
- **No bounce** — functional, not expressive

### MyDay Priority Queue
- **Card entrance:** staggered fade-in + translate-y from below
- **Duration:** 400ms per card, 60ms stagger
- **Opacity:** 0 → 1, y: 12px → 0

### ZIA Brief
- **Typing indicator:** three dots pulsing sequentially
- **Response reveal:** content fades in line by line
- **Duration:** 150ms per line, 50ms stagger

### Status Changes
- **Color transition:** 200ms ease for badge color changes
- **No flash** — subtle cross-fade, not blink

### Page Transitions
- **Enter:** opacity 0→1, y: 8px→0, 250ms
- **Exit:** opacity 1→0, y: 0→-8px, 150ms (faster exit)

## Timing Rules

| Interaction | Duration | Spring |
|-------------|----------|--------|
| Button press | 100ms | none (CSS transform) |
| Tab switch | 200ms | none (ease-out) |
| Card entrance | 250-400ms | damping 1.0, response 0.3 |
| Sheet/drawer | 300ms | damping 0.8, response 0.3 |
| Entity edge draw | 300ms | damping 1.0, response 0.3 |
| Theory card settle | 250ms | damping 0.8, response 0.25 |
| Page transition | 250ms | damping 1.0, response 0.3 |

## Forbidden Patterns
- No infinite loops (except loading indicators)
- No parallax scrolling
- No scroll-hijack
- No decorative motion without informational purpose
- No animation on data update that happens >3x per second

## Reduced Motion
All animations respect `prefers-reduced-motion: reduce`:
- Replace slides with opacity cross-fades
- Remove overshoot/bounce
- Keep color changes (they aid comprehension)

## Implementation
- Use CSS transitions for simple state changes (hover, focus, active)
- Use `@keyframes` for staggered entrances
- Use Motion library for gesture-driven interactions (drawer, sheet)
- Animate only `transform` and `opacity` (GPU composited)
