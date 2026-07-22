# 003 - Remove layout animation from landing accordion

- **Status**: DONE
- **Commit**: 57598c0
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 1 file, small

## Problem

The landing accordion animates `flex`, which causes layout recalculation during hover. This is visible on a large content band and can drop frames during pointer movement.

```css
/* client/src/Pages/Homepage/landingpage.css:244 - current */
.accordion-slice {
  flex: 1;
  overflow: hidden;
  padding: 28px;
  border-radius: 8px;
  background: rgba(247, 239, 226, 0.09);
  transition: flex 600ms cubic-bezier(0.16, 1, 0.3, 1), background 300ms ease;
}

.accordion-slice:hover {
  flex: 2.4;
  background: rgba(247, 239, 226, 0.16);
}
```

## Target

Keep layout stable and animate compositor-friendly properties only. Use the strong UI ease-out from the audit playbook.

```css
.accordion-slice {
  flex: 1;
  overflow: hidden;
  padding: 28px;
  border-radius: 8px;
  background: rgba(247, 239, 226, 0.09);
  transform: translateY(0) scale(1);
  transition:
    transform 220ms cubic-bezier(0.23, 1, 0.32, 1),
    background-color 220ms ease,
    border-color 220ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .accordion-slice:hover {
    transform: translateY(-6px) scale(1.015);
    background: rgba(247, 239, 226, 0.16);
  }
}
```

## Repo conventions to follow

- Landing page styles live in `client/src/Pages/Homepage/landingpage.css`.
- Existing buttons use hover transforms at `landingpage.css:78`; follow that interaction pattern, but use shorter targeted transitions.
- UI animation durations should stay under 300ms.

## Steps

1. In `client/src/Pages/Homepage/landingpage.css`, replace the `.accordion-slice` transition with the Target transition.
2. Replace the direct `.accordion-slice:hover` block with the media-gated hover block from Target.
3. Confirm no `transition: flex` remains in `landingpage.css`.

## Boundaries

- Do NOT change the accordion markup in `Landingpage.jsx`.
- Do NOT animate `width`, `height`, `margin`, `padding`, `top`, `left`, or `flex`.
- Do NOT add JavaScript for this interaction.
- If `.accordion-slice` no longer exists, STOP and report drift.

## Verification

- **Mechanical**: from `client/`, run `npm run build`; it should pass.
- **Feel check**: hover accordion slices on desktop and confirm cards lift crisply without neighboring cards resizing.
- **Feel check**: on touch/mobile emulation, confirm tapping does not trigger sticky hover movement.
- **Done when**: accordion hover uses only `transform`, `background-color`, and `border-color` transitions.
