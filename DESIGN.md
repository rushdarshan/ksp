---
name: KSP Crime Analytics Dashboard
description: Investigative console for Karnataka State Police — classified-records aesthetic built from the actual subject matter, not borrowed imagery.
colors:
  text: "#0a0a0a"
  bg: "#fdfcfc"
  surface: "#ffffff"
  text-secondary: "#6b6b6b"
  border: "#e8e6e3"
  border-strong: "#d1cec9"
  accent: "#1a3a5c"
  accent-warm: "#b8860b"
  redaction-navy: "#1a2a3f"
  redaction-amber: "#8a6a1a"
  pastel-red: "#FDEBEC"
  pastel-red-text: "#9F2F2D"
  pastel-blue: "#E1F3FE"
  pastel-blue-text: "#1F6C9F"
  pastel-green: "#EDF3EC"
  pastel-green-text: "#346538"
  pastel-amber: "#FBF3DB"
  pastel-amber-text: "#956400"
typography:
  display:
    fontFamily: "'Fraunces', Georgia, serif"
    fontWeight: 500
    letterSpacing: "-0.02em"
  body:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "'JetBrains Mono', 'Courier New', monospace"
    fontWeight: 400
radius:
  card: 24px
  pill: 50px
  input: 12px
shadow:
  soft: "0px 4px 20px rgba(0,0,0,0.06)"
spacing:
  section: 96px
  card-padding: 32px
---

# KSP Crime Analytics Dashboard — Design System

## Design Philosophy

**The signature element is the redacted document.** Thin horizontal bars of varying width, rendered in a muted navy-to-amber gradient, used as hero background texture and as loading-state skeletons throughout. This motif is built from the actual subject matter — FIR records, case status, evidence chains — not borrowed from any brand. No other 2026 KSP hackathon entry will have it.

**The structure is monochrome restraint.** Near-black text on near-white background. Color used only for one accent element, never for UI chrome. Serif display type for headings (Fraunces), plain sans for data-heavy areas (Inter). One soft diffuse shadow reused everywhere. Generous whitespace. Tactile button feedback.

**What we do NOT use:** colorful gradient orbs, Waldenburg font, any 11labs brand-specific asset, dark CRT terminal aesthetics, generic SaaS card grids, decorative blobs, emoji as design elements.

## Color

### Base Palette (Monochrome Restraint)

| Token | Hex | Role |
|-------|-----|------|
| `--text` | `#0a0a0a` | Body text, headings |
| `--bg` | `#fdfcfc` | Page background (warm off-white) |
| `--surface` | `#ffffff` | Cards, panels, inputs |
| `--text-secondary` | `#6b6b6b` | Labels, captions, metadata |
| `--border` | `#e8e6e3` | Hairline borders (warm) |
| `--border-strong` | `#d1cec9` | Emphasized borders |

### Accent (Used Sparingly)

| Token | Hex | Role |
|-------|-----|------|
| `--accent` | `#1a3a5c` | Primary action, links (muted navy) |
| `--accent-warm` | `#b8860b` | Secondary accent, highlights (dark goldenrod) |

### Redaction Motif Gradient

| Token | Hex | Role |
|-------|-----|------|
| `--redaction-navy` | `#1a2a3f` | Start of redaction bar gradient |
| `--redaction-amber` | `#8a6a1a` | End of redaction bar gradient |

The gradient flows navy → amber across each bar, or across the bar collection as a whole. Both work. Test which reads better.

### Status Colors (Pastel, for Badge System)

| Token | Hex | Role |
|-------|-----|------|
| `--pastel-red` | `#FDEBEC` | Critical/fabricated background |
| `--pastel-red-text` | `#9F2F2D` | Critical/fabricated text |
| `--pastel-blue` | `#E1F3FE` | Info/neutral background |
| `--pastel-blue-text` | `#1F6C9F` | Info/neutral text |
| `--pastel-green` | `#EDF3EC` | Genuine/clear background |
| `--pastel-green-text` | `#346538` | Genuine/clear text |
| `--pastel-amber` | `#FBF3DB` | Warning/review background |
| `--pastel-amber-text` | `#956400` | Warning/review text |

### Color Rules

1. **Never use `#000` or `#fff`.** Text is `#0a0a0a` (near-black, warm). Surfaces are `#fdfcfc` or `#ffffff`.
2. **One accent per view.** Navy for primary actions, amber for secondary highlights. Never both at full strength on the same screen.
3. **Redaction gradient is texture, not color.** It lives in the background, never competes with content.
4. **Pastel badges only for status.** Never for UI chrome, buttons, or borders.

## Typography

### Font Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type Scale

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Hero display | Fraunces | `clamp(2.5rem, 5vw, 4rem)` | 500 | 1.05 | -0.03em |
| Section heading | Fraunces | 2rem (32px) | 500 | 1.15 | -0.02em |
| Card title | Fraunces | 1.25rem (20px) | 500 | 1.2 | -0.01em |
| Body | Inter | 1rem (16px) | 400 | 1.5 | 0 |
| Body small | Inter | 0.875rem (14px) | 400 | 1.5 | 0 |
| Caption | Inter | 0.75rem (12px) | 500 | 1.4 | 0.02em (uppercase) |
| Data label | Inter | 0.6875rem (11px) | 600 | 1.3 | 0.05em (uppercase) |
| Code/data | JetBrains Mono | 0.8125rem (13px) | 400 | 1.4 | 0 |

### Typography Rules

1. **Serif for display, sans for data.** Fraunces for all headings and hero copy. Inter for body, labels, tables, forms, buttons.
2. **Inter for data tables.** Tabular figures: `font-variant-numeric: tabular-nums` on all numeric table columns.
3. **Caption = uppercase + letter-spacing.** Section labels, metadata, timestamps use `text-transform: uppercase; letter-spacing: 0.02em` at 12px.
4. **No more than 3 weights per family.** Fraunces: 400/500/600. Inter: 400/500/600/700.
5. **Line length: 65-75ch** for body text. Wider is fine for data tables.

## The Redacted-Document Motif

### Concept

Horizontal bars of varying width that evoke redacted classified text. Each bar is a thin rectangle (4-12px height) with width varying between 30% and 100% of the container. The collection of bars creates a rhythm that reads as "document with classified sections."

### Implementation

```css
.redaction-bar {
  height: var(--bar-height, 8px);
  width: var(--bar-width, 100%);
  background: linear-gradient(90deg, var(--redaction-navy), var(--redaction-amber));
  border-radius: 2px;
  opacity: 0.12;
}
```

### Usage Locations

1. **Hero background texture** — A field of redaction bars behind the hero, low opacity (0.08-0.15), creating depth without competing with text.
2. **Loading skeletons** — Instead of generic shimmer animations, the skeleton IS the motif. Each skeleton element is a redaction bar. The loading state looks like a document being declassified.
3. **Panel dividers** — A single redaction bar between sections, full-width, low opacity.
4. **Empty states** — When no data, show a field of redaction bars with "No records available" in serif.

### What the Motif Is NOT

- NOT a colorful gradient orb
- NOT a decorative blob
- NOT a stock illustration
- NOT animated (it's static texture, not motion)

## Layout

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-section` | 96px | Between major page sections |
| `--space-xl` | 48px | Between cards in a grid |
| `--space-lg` | 32px | Card padding, between content blocks |
| `--space-md` | 24px | Between elements in a card |
| `--space-sm` | 16px | Between label and value |
| `--space-xs` | 8px | Inline spacing |

### Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-card` | 24px | Cards, panels |
| `--radius-pill` | 50px | Buttons, badges |
| `--radius-input` | 12px | Form inputs, search |
| `--radius-bar` | 2px | Redaction bars |

### Shadow

ONE shadow. Used everywhere. Never invent a second.

```css
--shadow-soft: 0px 4px 20px rgba(0,0,0,0.06);
```

### Layout Rules

1. **96px between sections.** Not 48, not 64. The whitespace IS the design.
2. **24px card radius.** Generous, soft, approachable. Not sharp.
3. **50px pill buttons.** Fully rounded. Tactile.
4. **Single shadow.** `0px 4px 20px rgba(0,0,0,0.06)`. Never add a second shadow for emphasis.
5. **Max content width: 1200px** for dashboards, 860px for editorial/landing.
6. **Cards earn their existence.** No decorative card grids. A card wraps content that needs visual containment.

## Components

### Buttons

```css
.btn {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 28px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: transform 0.1s ease-out, background-color 0.2s ease-out;
}
.btn:active {
  transform: scale(0.98);
}
.btn-primary {
  background: var(--accent);
  color: #fdfcfc;
}
.btn-secondary {
  background: transparent;
  color: var(--accent);
  border: 1px solid var(--accent);
}
.btn-ghost {
  background: transparent;
  color: var(--text);
}
```

### Cards

```css
.card {
  background: var(--surface);
  border-radius: 24px;
  padding: 32px;
  box-shadow: var(--shadow-soft);
  border: none;
}
```

### Tables

```css
.data-table {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}
.data-table th {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
  padding: 12px 16px;
}
.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  font-variant-numeric: tabular-nums;
}
```

### Loading Skeletons (Redaction Motif)

```css
.skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px;
}
.skeleton-bar {
  height: 8px;
  background: linear-gradient(90deg, var(--redaction-navy), var(--redaction-amber));
  border-radius: 2px;
  opacity: 0.12;
  animation: redaction-pulse 2s ease-in-out infinite;
}
.skeleton-bar:nth-child(1) { width: 100%; }
.skeleton-bar:nth-child(2) { width: 75%; }
.skeleton-bar:nth-child(3) { width: 90%; }
.skeleton-bar:nth-child(4) { width: 60%; }

@keyframes redaction-pulse {
  0%, 100% { opacity: 0.08; }
  50% { opacity: 0.16; }
}
```

## Motion

1. **`scale(0.98)` on button active.** Tactile, instant, no delay.
2. **Redaction pulse on skeletons.** 2s ease-in-out, opacity 0.08 → 0.16 → 0.08. Slow, breathing.
3. **No layout property animations.** Only `transform` and `opacity`.
4. **Ease-out for entrance, ease-in for exit.** Never bounce, never elastic.
5. **`prefers-reduced-motion` respected.** Disable pulse and transitions.

## Do's and Don'ts

### Do
- Use Fraunces for all headings and hero copy
- Use Inter for all body, data, forms, buttons
- Use the redaction motif as background texture and loading state
- Keep 96px between sections
- Use one shadow everywhere
- Use `scale(0.98)` on button active

### Don't
- Don't use `#000` or `#fff` — use `#0a0a0a` and `#fdfcfc`
- Don't use SF Pro, system-ui, or -apple-system as primary font
- Don't use colorful gradient orbs
- Don't use multiple shadows
- Don't use dark CRT terminal aesthetics
- Don't use ASCII brackets in labels (`[ LOCATION ]`)
- Don't use terminal prompt prefixes (`> GET_STARTED`)
- Don't use `//` comment syntax in copy
- Don't use cards decoratively — they must contain content
- Don't skip heading levels (h1 → h4 without h2/h3)
