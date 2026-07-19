# 005 - Replace global reduced motion nuke

- **Status**: DONE
- **Commit**: 57598c0
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 file, small

## Problem

The global reduced-motion rule forces every animation and transition to `0.01ms`. That removes useful opacity, color, and focus feedback instead of only dropping movement.

```scss
// client/src/App.scss:731 - current
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .stagger > * {
    animation-delay: 0ms !important;
  }

  .pressable:active {
    transform: none !important;
  }

  .page-enter {
    animation: none !important;
  }
}
```

## Target

Preserve opacity/color feedback and remove movement-heavy animations explicitly.

```scss
@media (prefers-reduced-motion: reduce) {
  html:focus-within {
    scroll-behavior: auto;
  }

  .page-enter,
  .stagger > * {
    animation: fadeIn 0.2s ease-out both !important;
    transform: none !important;
  }

  .pressable,
  .hover-lift,
  .btn {
    transition:
      background-color 160ms ease,
      color 160ms ease,
      border-color 160ms ease,
      opacity 160ms ease !important;
  }

  .pressable:active,
  .hover-lift:hover,
  .btn:active {
    transform: none !important;
  }
}
```

## Repo conventions to follow

- Global keyframes and utilities are in `client/src/App.scss:562`.
- `fadeIn` already exists in `client/src/App.scss:568`; reuse it.
- Reduced motion should mean less movement, not zero feedback.

## Steps

1. In `client/src/App.scss`, replace the entire `@media (prefers-reduced-motion: reduce)` block beginning at line 731 with the Target block.
2. Keep the existing `fadeIn` keyframe unchanged.
3. Do not add broad `transition-duration: 0.01ms` rules elsewhere.

## Boundaries

- Do NOT edit component-specific styles in this plan.
- Do NOT remove `.page-enter`, `.stagger`, `.pressable`, or `.hover-lift`.
- Do NOT change non-motion colors or layout.
- If the reduced-motion block has already been replaced, STOP and compare against the Target instead of layering duplicate rules.

## Verification

- **Mechanical**: from `client/`, run `npm run build`; it should pass.
- **Feel check**: enable reduced motion, navigate between dashboard routes, and confirm page content fades without translating upward.
- **Feel check**: press buttons and confirm color/opacity feedback remains while scale movement is removed.
- **Done when**: reduced motion no longer globally kills all transitions, and movement utilities no longer move.
