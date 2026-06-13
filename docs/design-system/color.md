# Color reference

Full token reference for both themes. **Source of truth:**
[`src/client/styles/tokens.css`](../../src/client/styles/tokens.css). Dark is the default
(`:root`); light is `[data-theme="light"]`.

All role/text pairs target **WCAG AA**: ≥4.5:1 for body text, ≥3:1 for large text (≥18px
bold / ≥24px) and non-text UI affordances (borders, focus rings, dots).

## Dark theme (default)

### Surfaces & text

| Token | Hex | Role / when to use |
| --- | --- | --- |
| `--bg` | `#0b0f0d` | App background — the lowest layer, near-black with a green cast |
| `--surface` | `#121815` | Cards, panels, the elevated default surface |
| `--surface-2` | `#1a221d` | Inset / nested surfaces (rows inside cards, code wells) |
| `--fg` | `#e8efe9` | Primary text and icons. ~14:1 on `--bg` |
| `--fg-muted` | `#8b978f` | Secondary text, captions, placeholders. ≥4.5:1 on `--bg`/`--surface` |
| `--border` | `#28332c` | Hairlines, dividers, control outlines, card edges |

### Brand / primary

| Token | Hex | Role / when to use |
| --- | --- | --- |
| `--primary` | `#3fdc7f` | Brand & primary interactive color: primary buttons, focus rings, key highlights, active nav |
| `--primary-fg` | `#04130a` | Text/icon **on** a filled `--primary` surface (dark label on green) |
| `--primary-soft` | `#133024` | Low-emphasis primary fill: soft badges, selected rows, subtle highlights |
| `--accent` | `#7ee787` | Brighter green accent for decorative emphasis / glows |
| `--accent-2` | `#2dd4bf` | Teal companion accent (pairs with the running color) |

### Semantic / status

| Token | Hex | Role / when to use |
| --- | --- | --- |
| `--positive` | `#56d364` | Success / done — **static green** |
| `--running` | `#2dd4bf` | Live / in-progress — **teal, always paired with motion** |
| `--idle` | `#6e7d74` | Idle / inactive / disabled status |
| `--warning` | `#d8a235` | Caution, non-blocking warnings |
| `--negative` | `#f85149` | Errors, destructive actions, failures |
| `--info` | `#58a6ff` | Neutral informational notices |

### Categorical (charts / avatars)

| Token | Hex | |
| --- | --- | --- |
| `--chart-1` | `#3fdc7f` | green (brand) |
| `--chart-2` | `#2dd4bf` | teal |
| `--chart-3` | `#58a6ff` | blue |
| `--chart-4` | `#d8a235` | amber |
| `--chart-5` | `#f85149` | red |
| `--chart-6` | `#bc8cff` | violet |

### On-brand & overlay

| Token | Hex / value | Role / when to use |
| --- | --- | --- |
| `--fg-on-brand` | `#ffffff` | Text/icons on **saturated** brand surfaces (the Tinkers gradient hero/dock). Distinct from `--primary-fg`, which is the dark label used on the flat bright-green button |
| `--scrim` | `rgba(11,15,13,0.5)` | Modal/overlay backdrop dimming |

## Light theme (`[data-theme="light"]`)

The light variant keeps the same green identity on an off-white canvas. Greens are
**darkened** (`#157f4b`) so they stay AA against white surfaces.

### Surfaces & text

| Token | Hex | Role |
| --- | --- | --- |
| `--bg` | `#f4f7f4` | App background (faint green-tinted off-white) |
| `--surface` | `#ffffff` | Cards / panels |
| `--surface-2` | `#e9efe9` | Inset / nested surfaces |
| `--fg` | `#0e1712` | Primary text |
| `--fg-muted` | `#4f5e55` | Secondary text |
| `--border` | `#d4ddd6` | Hairlines / dividers |

### Brand / primary

| Token | Hex | Role |
| --- | --- | --- |
| `--primary` | `#157f4b` | Brand / primary interactive (dark green for AA on white) |
| `--primary-fg` | `#ffffff` | Text on filled primary (white on dark green) |
| `--primary-soft` | `#d8f0e2` | Low-emphasis primary fill |
| `--accent` | `#157f4b` | Decorative green accent |
| `--accent-2` | `#0d9488` | Teal companion accent |

### Semantic / status

| Token | Hex | Role |
| --- | --- | --- |
| `--positive` | `#157f4b` | Success / done (static green) |
| `--running` | `#0d9488` | Live (teal + motion) |
| `--idle` | `#7c8a81` | Idle / inactive |
| `--warning` | `#9a6700` | Warning |
| `--negative` | `#cf222e` | Error / destructive |
| `--info` | `#0969da` | Info |

### Categorical

| Token | Hex |
| --- | --- |
| `--chart-1` | `#157f4b` |
| `--chart-2` | `#0d9488` |
| `--chart-3` | `#0969da` |
| `--chart-4` | `#9a6700` |
| `--chart-5` | `#cf222e` |
| `--chart-6` | `#8250df` |

### On-brand & overlay

| Token | Hex / value | Role |
| --- | --- | --- |
| `--fg-on-brand` | `#ffffff` | Text on the (shared) green→teal gradient |
| `--scrim` | `rgba(11,15,13,0.4)` | Overlay backdrop |

## Contrast notes (WCAG AA)

- `--fg` on `--bg` / `--surface` is far above AA for body text (dark theme ~14:1).
- `--fg-muted` is tuned to clear ≥4.5:1 on the dark surfaces, so captions stay legible.
- `--primary` `#3fdc7f` is a bright green used as a **fill** (with the dark `--primary-fg`
  label) or as a large/UI accent — both meet AA. It is *not* used as small body text on
  dark, where a bright green can fall short.
- **Gradient hero/dock:** white `--fg-on-brand` text rides the darkened Tinkers gradient,
  not the bright `--primary`. White on `#1a6e4b` = **6.2:1**, on `#0d4f4a` = **9.4:1** —
  both clear AA comfortably. See [decisions.md](./decisions.md) for why the gradient stops
  are darkened.
- Status colors are paired with **a dot and a word** (never color alone) so meaning never
  depends on hue perception — important for color-blind users.

## How green is used

Green carries three jobs. They never collide because each has a distinct treatment:

| Meaning | Color | Treatment | Example |
| --- | --- | --- | --- |
| **Primary / interactive** | `--primary` green | Solid fill + dark label, or focus ring | Primary button, active nav |
| **Positive / done** | `--positive` green | **Static** badge/dot | "Done" status |
| **Running / live** | `--running` **teal** | **Motion** — pulse or spinner | Running agent, streaming |

**The disambiguation rule:** *running = teal + motion · positive = green + static ·
primary = green + interactive.* If two green meanings would sit side by side, the live one
shifts to teal and animates, so no two green meanings are confused.

### Do

- Use semantic tokens (`--positive`, `--running`, `--negative`, …) for status.
- Use `--primary` for the single most important action in a view.
- Derive tints with `color-mix(in oklch, var(--primary) 14%, transparent)`.
- Pair every status color with text/an icon, never color alone.

### Don't

- Don't use `--positive` (static green) for in-progress work — use `--running` (teal) + motion.
- Don't put bright `--primary` as small text on `--bg`; use it as a fill/accent.
- Don't use `--chart-*` for status meaning, or semantic tokens for categorical charts.
- Don't hardcode hex in components — always go through tokens.
- Don't render white text on the flat `--primary` button; use `--primary-fg` (dark). White
  is only for the darkened gradient surfaces (`--fg-on-brand`).
