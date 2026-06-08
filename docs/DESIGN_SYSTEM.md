# Design System

The design system lives in [`src/presentation/styles/main.css`](../src/presentation/styles/main.css)
and is built on **CSS custom properties** consumed both directly and through
Tailwind v4 arbitrary-value utilities (e.g. `bg-[var(--color-surface-overlay)]`).

Tokens are organized in three layers:

1. **Core palette** (`--palette-*`) — raw values, the single source of truth.
2. **Semantic tokens** (`--color-*`, `--text-*`, `--radius-*`, `--z-*`, …) —
   reference the palette and express intent. **Use these in components.**
3. **Legacy aliases** — kept for back-compat (e.g. `--color-wood-*`,
   `--color-terminal-green`). Don't use them in new code.

> Changing a brand color should mean editing one `--palette-*` value.

## Color

| Token | Purpose |
| --- | --- |
| `--color-bg-primary` … `--color-bg-elevated` | Solid background depths |
| `--color-surface-overlay` / `-strong` | Translucent floating controls (toggles, HUD) |
| `--color-surface-glass` | Glass-morphism panels |
| `--color-accent-primary` / `-secondary` / `-tertiary` | Brand purple/indigo |
| `--color-success` / `-warning` / `-danger` / `-info` | Status feedback |
| `--color-text-primary` / `-secondary` / `-muted` | Text hierarchy |
| `--color-border` / `-border-hover` | Borders |

Domain accents (`--color-team-orange`, `--color-book-amber`, `--color-led-*`, …)
are used by individual resume sections.

## Typography

Fonts: `--font-display` / `--font-code` (JetBrains Mono), `--font-body` (Nunito),
`--font-hand` (Amatic SC, for hand-drawn labels).

Fluid type scale: `--text-xs` … `--text-2xl`, plus heading sizes
`--text-h1`/`--text-h2`/`--text-h3` (applied to `h1`–`h3`).

## Spacing, Radius, Z-index

- **Spacing:** `--spacing-unit` (4px base); `--space-section` drives the
  `.section-padding` utility (replaces the old `p-3 sm:p-4 md:p-8 …` chains).
- **Radius:** `--radius-sm` (4px) → `--radius-xl` (16px), `--radius-full`.
- **Z-index:** layered scale — `--z-canvas` (1), `--z-content` (10),
  `--z-overlay` (50), `--z-header` (100), `--z-toast` (1000), `--z-modal` (1100).

## Shadows & Transitions

- Glows: `--shadow-glow-accent`, `--shadow-glow-orange`, `--shadow-glow-gold`,
  plus `--shadow-elevated`.
- Transitions: `--transition-fast` / `-normal` / `-slow` / `-bounce`.

## Reusable utility classes

| Class | Use |
| --- | --- |
| `.section-padding` | Consistent fluid section padding |
| `.surface-overlay` | Floating control surface (blur + border + hover) |
| `.glass` | Glass-morphism panel |
| `.label-hand` | Hand-drawn annotation labels |
| `.btn` / `.btn-primary` / `.btn-secondary` | Buttons |

## Conventions

- Prefer semantic tokens over Tailwind arbitrary hex values
  (`bg-[var(--color-surface-overlay)]`, not `bg-[#1E1E1E]/80`).
- Reach for the z-index scale instead of literal numbers.
- 3D / Three.js scene colors are still hardcoded per-component — a future
  improvement is to centralize those into a shared scene palette.
