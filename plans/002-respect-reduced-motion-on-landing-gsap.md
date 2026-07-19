# 002 - Respect reduced motion on landing GSAP

- **Status**: DONE
- **Commit**: 57598c0
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 1 file, small

## Problem

The landing page runs movement-heavy GSAP animations without checking `prefers-reduced-motion`. This affects entrance movement, scroll-scrubbed word reveals, and stacked cards.

```jsx
// client/src/Pages/Homepage/Landingpage.jsx:28 - current
useGSAP(() => {
  gsap.from('.taste-nav', { y: -28, opacity: 0, duration: 0.8, ease: 'power3.out' });
  gsap.from('.hero-copy > *', { y: 38, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out' });
```

```jsx
// client/src/Pages/Homepage/Landingpage.jsx:44 - current
gsap.utils.toArray('.stack-card').forEach((card, index) => {
  gsap.fromTo(card, { y: 90 + index * 28, scale: 0.92, opacity: 0.3 }, {
    y: -index * 20,
    scale: 1,
    opacity: 1,
```

## Target

Use `window.matchMedia('(prefers-reduced-motion: reduce)')` inside `useGSAP`. When true, do only short opacity fades and do not register scroll-linked transforms.

```jsx
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion) {
  gsap.from('.taste-nav, .hero-copy > *', {
    opacity: 0,
    duration: 0.2,
    ease: 'power1.out',
    stagger: 0.03,
  });
  gsap.set('.scrub-word, .stack-card', { opacity: 1, clearProps: 'transform' });
  return;
}
```

## Repo conventions to follow

- GSAP landing motion is centralized in `client/src/Pages/Homepage/Landingpage.jsx:28`.
- Reduced-motion CSS exists in `client/src/App.scss:732`, but this plan handles JS-driven GSAP motion specifically.
- Use opacity-only feedback for reduced motion; do not remove all visual feedback.

## Steps

1. In `client/src/Pages/Homepage/Landingpage.jsx`, add `const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;` as the first line inside `useGSAP`.
2. Immediately after that line, add the reduced-motion branch shown in the Target section.
3. Leave the existing full GSAP sequence unchanged below the branch.
4. Do not add new dependencies.

## Boundaries

- Do NOT edit `client/src/Pages/Homepage/landingpage.css`.
- Do NOT change page markup or content.
- Do NOT remove GSAP or ScrollTrigger for normal motion users.
- If `useGSAP` no longer contains the cited code, STOP and report drift.

## Verification

- **Mechanical**: from `client/`, run `npm run build`; it should pass.
- **Feel check**: open `http://127.0.0.1:5173/#/`, enable reduced motion in browser Rendering settings, reload, and confirm hero content fades in without vertical movement.
- **Feel check**: scroll to the desire section with reduced motion enabled and confirm words/cards are visible without scrubbed translation or scale.
- **Done when**: reduced-motion users see no GSAP-driven translate or scale movement, while normal users keep the current landing motion.
