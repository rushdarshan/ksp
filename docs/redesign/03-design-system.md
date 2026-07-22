# Phase 3 — Design System Tokens

## Type System (from DESIGN.md, tightened)

### Scale
| Token | Size | Line Height | Use |
|-------|------|-------------|-----|
| `--type-display` | 2.5rem (40px) | 1.1 | Hero headlines, page titles |
| `--type-h1` | 2rem (32px) | 1.2 | Section headings |
| `--type-h2` | 1.5rem (24px) | 1.3 | Card titles, panel headers |
| `--type-h3` | 1.125rem (18px) | 1.4 | Subsection headings |
| `--type-body` | 1rem (16px) | 1.6 | Body text, descriptions |
| `--type-small` | 0.875rem (14px) | 1.5 | Labels, metadata |
| `--type-caption` | 0.75rem (12px) | 1.4 | Timestamps, badges |

### Font Stack
- **Display/Headings:** Fraunces (serif) — warm, authoritative
- **Body/UI:** Inter (sans) — neutral, readable
- **Data/Code:** JetBrains Mono — tabular, technical

### Rules
- No font below 12px (accessibility)
- Body text max-width: 65ch
- Headings: tighter line-height (1.1–1.3)
- Numbers in data tables: `font-variant-numeric: tabular-nums`

## Spacing Scale

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | 4px | Inline gaps, icon padding |
| `--space-2` | 8px | Tight grouping (related items) |
| `--space-3` | 12px | Card internal padding |
| `--space-4` | 16px | Standard component padding |
| `--space-5` | 20px | Section internal spacing |
| `--space-6` | 24px | Card gaps, sidebar width |
| `--space-8` | 32px | Section separation |
| `--space-10` | 40px | Major section breaks |
| `--space-12` | 48px | Page-level spacing |
| `--space-16` | 64px | Hero/landing section gaps |

### Rules
- Use `gap` for sibling spacing (not margins)
- Related elements: 8–12px
- Distinct sections: 32–48px
- Never equal spacing everywhere — rhythm requires variation

## Color System

### Semantic Tokens (not raw hex)
```css
:root {
  /* Base */
  --bg-app: #f8f9fa;
  --bg-surface: #ffffff;
  --bg-elevated: #ffffff;
  --bg-sunken: #f1f3f5;

  /* Text */
  --text-primary: #1a1a2e;
  --text-secondary: #6c757d;
  --text-tertiary: #adb5bd;
  --text-inverse: #ffffff;

  /* Navy (primary brand) */
  --navy-50: #f0f4f8;
  --navy-100: #d9e2ec;
  --navy-500: #334e68;
  --navy-600: #243b53;
  --navy-700: #1a3a5c;
  --navy-800: #102a43;
  --navy-900: #0a1929;

  /* Amber (accent) */
  --amber-50: #fff8e1;
  --amber-100: #ffecb3;
  --amber-500: #b8860b;
  --amber-600: #996515;
  --amber-700: #7a4f0f;

  /* Status */
  --status-investigation: #334e68;
  --status-court: #b8860b;
  --status-closed: #6c757d;
  --status-urgent: #e53e3e;
  --status-success: #38a169;

  /* Severity */
  --severity-critical: #e53e3e;
  --severity-high: #dd6b20;
  --severity-medium: #d69e2e;
  --severity-low: #38a169;

  /* Spacing */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}
```

### Rules
- One accent color (amber) — no competing accents
- Status colors map to investigation workflow states
- Severity colors for alerts/flags
- No raw hex in components — always use tokens

## Navigation System

### Sidebar (left, 260px)
- **Always visible** on desktop (≥1024px)
- Collapsible on tablet (768–1023px)
- Hidden on mobile (slide-in drawer)
- Sections: MyDay, Investigate, Analytics (collapsed), Admin (collapsed)
- Active state: navy background tint, left border accent

### TopBar (top, 64px)
- Breadcrumb: `MyDay > Case #1234 > Evidence`
- Right side: Search, Notifications, Profile
- Glass blur on scroll (existing)

### RightSidebar (right, 320px)
- Live Alerts feed
- ZIA quick suggestions
- Collapsible

### Rules
- Sidebar is primary nav on desktop
- Breadcrumbs always show location
- No hidden nav items — collapse, don't hide

## Component Hierarchy

### Primitives (existing, keep)
- `PanelCard` — container with border, shadow, radius
- `PanelHeader` — title + icon + optional action
- `PanelBadge` — status/severity indicator
- `PanelChart` — chart container
- `PanelTable` — data table wrapper

### New Components (Phase 5)
- `PriorityQueue` — MyDay case list (not grid)
- `Breadcrumb` — location indicator
- `CommandPalette` — ⌘K search (Phase 5)
- `EntityCard` — person/place/vehicle card
- `TheoryCard` — hypothesis tracking card
- `StatusBadge` — investigation state indicator

### Rules
- One primitive per visual concern
- No nesting cards inside cards
- Components use semantic tokens only
