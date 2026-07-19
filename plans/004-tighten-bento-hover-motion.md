# 004 - Tighten bento hover motion

- **Status**: DONE
- **Commit**: 57598c0
- **Severity**: MEDIUM
- **Category**: Easing & Duration
- **Estimated scope**: 1 file, small

## Problem

The bento card image hover scales over 700ms with bare `ease`. For a card grid users scan repeatedly, this feels slow and decorative.

```css
/* client/src/Pages/Homepage/landingpage.css:196 - current */
.bento-card:hover .card-media {
  transform: scale(1.06);
}

/* client/src/Pages/Homepage/landingpage.css:200 - current */
.card-media {
  position: absolute;
  inset: 0;
  opacity: 0.2;
  background-image: url('https://picsum.photos/seed/data-grid/900/700');
  background-size: cover;
  background-position: center;
  filter: grayscale(1) contrast(1.2);
  transition: transform 700ms ease;
}
```

## Target

Use a fast, targeted hover transition and gate hover transforms to devices that actually hover.

```css
.card-media {
  position: absolute;
  inset: 0;
  opacity: 0.2;
  background-image: url('https://picsum.photos/seed/data-grid/900/700');
  background-size: cover;
  background-position: center;
  filter: grayscale(1) contrast(1.2);
  transition: transform 220ms cubic-bezier(0.23, 1, 0.32, 1);
  will-change: transform;
}

@media (hover: hover) and (pointer: fine) {
  .bento-card:hover .card-media {
    transform: scale(1.04);
  }
}
```

## Repo conventions to follow

- The landing page already uses image hover on `.card-media`; keep the same selector and visual intent.
- Use `cubic-bezier(0.23, 1, 0.32, 1)` for strong ease-out UI hover.
- Keep hover motion under 300ms.

## Steps

1. In `client/src/Pages/Homepage/landingpage.css`, change `.card-media` transition to `transform 220ms cubic-bezier(0.23, 1, 0.32, 1)`.
2. Add `will-change: transform;` to `.card-media`.
3. Wrap the `.bento-card:hover .card-media` rule in `@media (hover: hover) and (pointer: fine)`.
4. Reduce hover scale from `1.06` to `1.04`.

## Boundaries

- Do NOT change bento layout, copy, or image URLs.
- Do NOT add JavaScript.
- Do NOT introduce `transition: all`.
- If `.card-media` no longer exists, STOP and report drift.

## Verification

- **Mechanical**: from `client/`, run `npm run build`; it should pass.
- **Feel check**: hover bento cards on desktop and confirm image response feels immediate, not slow.
- **Feel check**: use mobile emulation and confirm touch does not leave a stuck hover transform.
- **Done when**: bento hover is fine-pointer-only, under 300ms, and uses the exact target curve.
