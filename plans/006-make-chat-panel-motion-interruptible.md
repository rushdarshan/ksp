# 006 - Make chat panel motion interruptible

- **Status**: DONE
- **Commit**: 57598c0
- **Severity**: MEDIUM
- **Category**: Interruptibility
- **Estimated scope**: 2 files, medium

## Problem

The chat panel uses keyframe animations for open and close. Keyframes restart when toggled quickly, so repeated open/close actions can jump instead of retargeting from the current visual state.

```scss
// client/src/Components/ChatPanel/ChatPanel.scss:56 - current
.cp {
  animation: cp-slide-in 0.25s var(--easing) both;
}

@keyframes cp-slide-in {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes cp-slide-out {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(16px) scale(0.97); }
}

.cp.closing {
  animation: cp-slide-out 0.25s var(--easing) forwards;
}
```

## Target

Use transitions on persistent state classes so motion retargets mid-flight. Use strong ease-out and keep UI duration under 300ms.

```scss
.cp {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition:
    opacity 220ms cubic-bezier(0.23, 1, 0.32, 1),
    transform 220ms cubic-bezier(0.23, 1, 0.32, 1);
}

.cp.entering,
.cp.closing {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
}
```

The React component should mount with `entering`, remove it on the next animation frame, and apply `closing` before unmounting.

## Repo conventions to follow

- Chat panel styling lives in `client/src/Components/ChatPanel/ChatPanel.scss`.
- The chat panel component controls open/close state in `client/src/Components/ChatPanel/ChatPanel.jsx`.
- Existing motion uses `translateY(16px) scale(0.97)`; keep those values.

## Steps

1. In `client/src/Components/ChatPanel/ChatPanel.scss`, remove `animation: cp-slide-in...`, `@keyframes cp-slide-in`, and `@keyframes cp-slide-out`.
2. Add the Target `.cp`, `.cp.entering`, and `.cp.closing` transition rules.
3. In `client/src/Components/ChatPanel/ChatPanel.jsx`, find the state that renders `.cp` and the close handler.
4. Add an `entering` state initialized true when the panel mounts; remove it with `requestAnimationFrame(() => setEntering(false))`.
5. Ensure the rendered className includes `entering` while entering and `closing` while closing.
6. Keep the existing close timeout aligned to `220ms`; if it is currently `250ms`, change it to `220ms`.

## Boundaries

- Do NOT change chat copy, API calls, message rendering, or routing.
- Do NOT change the floating action button motion in this plan.
- Do NOT add dependencies.
- If `ChatPanel.jsx` has no closing state or timeout, STOP and report the current close flow instead of inventing a new one.

## Verification

- **Mechanical**: from `client/`, run `npm run build`; it should pass.
- **Feel check**: open and close the chat repeatedly as fast as possible; the panel should reverse smoothly without jumping from the initial keyframe.
- **Feel check**: in DevTools Animations at 10% speed, confirm the panel moves from its current position when interrupted.
- **Reduced motion check**: after plan 005, enable reduced motion and confirm chat panel movement is removed or minimized while opacity feedback remains.
- **Done when**: `.cp` no longer uses keyframe animation for open/close and rapid toggles retarget smoothly.
