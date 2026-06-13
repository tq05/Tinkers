# Tinkers Design System — Bobbit green/black theme

Tinkers ships a **dark-first, green-on-black** visual identity inspired by the Bobbit
agent harness: near-black layered surfaces, calm light text, and a single technical
green used for brand, primary actions, and positive states. The mood is a
**polished developer tool** — restrained, high-contrast, professional — not the
playful violet/light candy palette the scaffold originally shipped.

This folder is the design-system documentation. The **runtime source of truth** is
[`src/client/styles/tokens.css`](../../src/client/styles/tokens.css); these docs
explain, justify, and reference those values.

## Philosophy

- **Dark by default.** Agent work is long-running and terminal-adjacent; a dark canvas
  reduces glare and lets the green accent and live status colors pop. A light variant is
  preserved but is opt-in.
- **One green, many jobs — disambiguated by motion.** Green is the brand, the primary
  action color, *and* the positive/success color. To avoid "green-on-green" ambiguity, a
  running agent uses **teal + motion** rather than another green. See [color.md](./color.md).
- **Token-driven only.** Components never hardcode colors. Everything flows from the CSS
  custom properties in `tokens.css`, mirrored as typed `var()` references in
  [`tokens.ts`](../../src/client/styles/tokens.ts).
- **WCAG AA everywhere.** Text and interactive/large elements meet AA contrast
  (≥4.5:1 body text, ≥3:1 large text and UI affordances) on the dark surfaces.

## How theming works

Themes are selected by a `data-theme` attribute on `<html>`:

- `:root` — **dark, the default.** Applied with no attribute set.
- `[data-theme="dark"]` — explicit dark; identical to `:root` so an explicit dark choice
  still resolves even if defaults change.
- `[data-theme="light"]` — the light variant (green on off-white).

The in-app **Settings → Appearance** toggle writes `data-theme` (`system` removes the
attribute and falls back to `:root`/dark). Because everything is a CSS variable, the whole
UI re-themes instantly with no component changes.

## How to use the system

1. **Read tokens, never hex.** In CSS use `var(--primary)`, etc. In TS use the typed
   mirror: `import { tokens } from "./styles/tokens"` then `tokens.color.primary`.
2. **Pick the right semantic slot.** Use `--positive` for success, `--running` for live
   work, `--negative` for errors — not the categorical `--chart-*` palette.
3. **Use `--chart-1..6`** only for categorical/avatar coloring (charts, agent avatars).
4. **Never invent colors.** If you need a tint, derive it:
   `color-mix(in oklch, var(--primary) 14%, transparent)`.

## Documents

| Doc | What it covers |
| --- | --- |
| [color.md](./color.md) | Full token reference (dark + light), roles, contrast notes, how green is used |
| [decisions.md](./decisions.md) | ADR-style log of the design decisions and trade-offs |
| [tokens.md](./tokens.md) | Canonical token list, naming, Tinkers ↔ Bobbit mapping, non-color tokens |
| [components.md](./components.md) | How the theme lands on each component/state, before→after |

Interactive swatch / spec sheet: [`theme-preview.html`](../../theme-preview.html) (repo root).
