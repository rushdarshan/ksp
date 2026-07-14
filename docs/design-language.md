---
date: 2026-07-14
topic: design-language
status: active
---

# KSP Crime Genome — Design Language (Intelligence Workbench)

## Source of Truth

`App.scss :root` (lines 11-94) is the canonical token system. DESIGN.md documents the same tokens in prose. No other file may redefine tokens.

## What Changes

### DELETE
- `client/src/styles/panel-tokens.css` — 367-line `!important` override layer that fights the light theme

### KEEP
- `App.scss :root` tokens (unchanged)
- `DESIGN.md` (unchanged)
- `mobile.css` (unchanged — responsive overrides are separate concern)

### CREATE
- `client/src/styles/components.css` — shared component classes (panel shells, cards, status badges, timeline ribbon)
- Per-component `.scss` files where inline styles are currently used

## Component Classes

### Panel Shell (replaces inline-styled panel containers)
```css
.panel-shell {
  background: var(--surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  padding: var(--space-lg);
  box-shadow: var(--shadow-soft);
}

.panel-shell--compact {
  padding: var(--space-md);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.panel-title {
  font-family: var(--font-display);
  font-size: var(--size-h3);
  font-weight: 500;
  color: var(--text);
  letter-spacing: -0.01em;
}

.panel-subtitle {
  font-size: var(--size-sub);
  color: var(--text-secondary);
  margin-top: var(--space-xs);
}
```

### Status Badges
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--size-caption);
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.badge--critical { background: var(--pastel-red); color: var(--pastel-red-text); }
.badge--warning { background: var(--pastel-amber); color: var(--pastel-amber-text); }
.badge--info { background: var(--pastel-blue); color: var(--pastel-blue-text); }
.badge--clear { background: var(--pastel-green); color: var(--pastel-green-text); }
```

### KPI Cards (for MyDayDashboard)
```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
}

.kpi-card {
  background: var(--surface);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  border: 1px solid var(--border-light);
}

.kpi-value {
  font-family: var(--font-display);
  font-size: var(--size-h2);
  font-weight: 500;
  color: var(--text);
}

.kpi-label {
  font-size: var(--size-caption);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: var(--space-xs);
}
```

### Timeline Ribbon (Intelligence Workbench signature)
```css
.timeline-ribbon {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  padding: var(--space-md) 0;
  overflow-x: auto;
  border-top: 1px solid var(--border-light);
}

.timeline-bar {
  flex-shrink: 0;
  height: var(--bar-height, 8px);
  min-width: 4px;
  background: linear-gradient(90deg, var(--redaction-navy), var(--redaction-amber));
  border-radius: var(--radius-bar);
  opacity: 0.3;
  transition: opacity 0.2s var(--easing);
}

.timeline-bar:hover {
  opacity: 0.7;
}
```

### Toolbar Tabs (Intelligence Workbench navigation)
```css
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--border-light);
}

.toolbar-tab {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--size-sub);
  font-weight: 500;
  color: var(--text-secondary);
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.2s var(--easing), border-color 0.2s var(--easing);
}

.toolbar-tab:hover {
  color: var(--text);
}

.toolbar-tab--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
```

### Case Header (Intelligence Workbench signature)
```css
.case-header {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  background: var(--surface);
  border-bottom: 1px solid var(--border-light);
}

.case-fir {
  font-family: var(--font-mono);
  font-size: var(--size-sub);
  color: var(--accent);
  font-weight: 500;
}

.case-accused {
  font-family: var(--font-display);
  font-size: var(--size-h3);
  font-weight: 500;
}

.case-status {
  margin-left: auto;
}
```

## Rules

1. **No inline styles for visual properties.** Colors, spacing, typography, borders, shadows come from tokens via CSS classes.
2. **One exception:** dynamic values (widths from data, calculated positions) may use inline styles with `var()` references where possible.
3. **All panels use `.panel-shell`** — no custom container styles per panel.
4. **Status badges use `.badge--{status}`** — never custom colored spans.
5. **Transitions use `var(--easing)` and `var(--duration-base)`** — never custom cubic-bezier or durations.
