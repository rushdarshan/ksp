# Implementation Plans

Execute in the order below unless dependencies say otherwise. Each executor should read the target plan fully before starting, honor its STOP conditions, and update the status row when done.

## Execution order & status

| Plan | Title | Severity | Status | Depends on |
|------|-------|----------|--------|------------|
| 001 | Rewrite README to match current project state | P1 | DONE | - |
| 002 | Respect reduced motion on landing GSAP | HIGH | DONE | - |
| 003 | Remove layout animation from landing accordion | HIGH | DONE | - |
| 004 | Tighten bento hover motion | MEDIUM | DONE | - |
| 005 | Replace global reduced motion nuke | MEDIUM | DONE | - |
| 006 | Make chat panel motion interruptible | MEDIUM | DONE | 005 recommended first |

## Dependency notes

- Run `005` before `006` if possible so the chat panel can inherit the corrected reduced-motion behavior.
- Plans `002`, `003`, and `004` are independent landing-page motion improvements and can run in any order.

## Findings considered and rejected

- None. All audited findings from the animation pass were converted into plans.
