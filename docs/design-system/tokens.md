# Tokens — canonical list, naming & mapping

The design system is expressed entirely as CSS custom properties in
[`src/client/styles/tokens.css`](../../src/client/styles/tokens.css), with a typed mirror in
[`tokens.ts`](../../src/client/styles/tokens.ts). This page is the canonical naming reference
and the Tinkers ↔ Bobbit mapping.

## Naming conventions

- **Color roles**, not literal hues: `--primary`, `--positive`, `--running` — never
  `--green` / `--teal`. The hue can change per theme; the role does not.
- **`-fg` suffix** = foreground meant to sit on the matching surface: `--primary-fg` is the
  label on a `--primary` fill; `--fg-on-brand` is the label on saturated gradient surfaces.
- **`-soft` suffix** = low-emphasis tint of a role: `--primary-soft`.
- **Numeric scales** ascend in magnitude: `--surface` → `--surface-2` (more inset),
  `--sp-1..8`, `--text-xs..3xl`, `--chart-1..6`.

## Color tokens

See [color.md](./color.md) for every hex value in both themes and the role descriptions.
The full color token set:

`--bg`, `--surface`, `--surface-2`, `--fg`, `--fg-muted`, `--border`,
`--primary`, `--primary-fg`, `--primary-soft`, `--accent`, `--accent-2`,
`--positive`, `--running`, `--idle`, `--warning`, `--negative`, `--info`,
`--chart-1` … `--chart-6`, `--fg-on-brand`, `--scrim`.

## Tinkers ↔ Bobbit CSS-custom-property mapping

Tinkers uses short role names; the Bobbit/shadcn convention uses longer descriptive names.
This table maps the equivalents so values can be cross-referenced.

| Tinkers token | Bobbit / shadcn equivalent | Role |
| --- | --- | --- |
| `--bg` | `--background` | App background |
| `--surface` | `--card` | Card / panel surface |
| `--surface-2` | `--muted` (surface use) | Inset / nested surface |
| `--fg` | `--foreground` | Primary text |
| `--fg-muted` | `--muted-foreground` | Secondary text |
| `--border` | `--border` | Hairlines / dividers |
| `--primary` | `--primary` | Brand / primary interactive |
| `--primary-fg` | `--primary-foreground` | Label on primary fill |
| `--positive` | `--positive` | Success / done |
| `--running` | *(no direct equiv)* | Live / in-progress (teal + motion) |
| `--warning` | `--warning` | Caution |
| `--negative` | `--negative` / `--destructive` | Error / destructive |
| `--info` | `--info` | Informational |
| `--chart-1` … `--chart-6` | `--chart-1` … `--chart-6` | Categorical palette |
| `--fg-on-brand` | *(new)* | Text on saturated gradient surfaces |
| `--scrim` | *(overlay)* | Modal/overlay backdrop |

`--running`, `--fg-on-brand`, and `--scrim` have no direct Bobbit equivalent — they are
Tinkers additions: `--running` carries the teal+motion live state (ADR-5), `--fg-on-brand`
and `--scrim` support the gradient hero/dock and overlays.

## Non-color tokens

These are theme-independent (defined once in `:root`) and shape the friendly, spacious
layout that is preserved from the original scaffold.

| Group | Tokens | Notes |
| --- | --- | --- |
| **Radii** | `--radius-xs` 6px · `--radius-sm` 10px · `--radius-md` 14px · `--radius-lg` 20px · `--radius-xl` 28px · `--radius-pill` 999px | Generous rounding; `--radius-pill` for badges/buttons |
| **Spacing** | `--sp-1` 4px … `--sp-8` 64px | 4px base scale |
| **Type family** | `--font-sans` (Inter / rounded), `--font-mono` (JetBrains Mono) | |
| **Type scale** | `--text-xs` 12px … `--text-3xl` 36px, with matching `--lh-*` line heights | |
| **Weights** | `--fw-regular` 400 · `--fw-medium` 500 · `--fw-semibold` 600 · `--fw-bold` 700 | |
| **Shadows** | `--shadow-sm/md/lg`, `--shadow-glow-running`, `--shadow-glow-tinkers` | Glows derive from `--running`/`--accent` via `color-mix` |
| **Gradient** | `--gradient-tinkers` = `linear-gradient(135deg, #1a6e4b 0%, #0d4f4a 100%)` | Darkened for AA white text (ADR-4) |
| **Motion** | `--ease` `cubic-bezier(0.2,0.7,0.3,1)`, `--dur-fast` 120ms · `--dur` 200ms · `--dur-slow` 360ms | |

Shadows are re-tinted per theme: dark uses black alphas; light uses low-opacity green-black
(`rgba(11,15,13,…)`) alphas.

## The typed mirror (`tokens.ts`)

`tokens.ts` does **not** duplicate hex values — it exposes each token as a `var()` string so
TypeScript/React code stays driven by the CSS at runtime:

```ts
import { tokens, chartColor } from "./styles/tokens";

tokens.color.primary;   // "var(--primary)"
tokens.color.running;   // "var(--running)"
tokens.space(4);        // "var(--sp-4)"
tokens.gradientTinkers; // "var(--gradient-tinkers)"
chartColor(7);          // cycles the 6-color categorical palette
```

Because the values are `var()` references, changing a token in `tokens.css` (or switching
`data-theme`) updates every consumer with no code changes. `chartColor(i)` wraps the index
modulo 6 so categorical coloring (avatars, charts) never runs off the palette.
