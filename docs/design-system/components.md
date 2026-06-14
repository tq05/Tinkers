# Components under the theme

How the Bobbit green/black theme lands on key components and states. Components were already
token-driven, so the re-theme changed token *values*, not component code. "Before → after"
notes describe the visual shift from the old violet/light scaffold.

## Buttons (`Button.tsx`)

Variants: `primary`, `secondary`, `ghost`, `danger`, `tinkers`.

- **Primary** — solid `--primary` green fill with a **dark `--primary-fg` label** (`#04130a`),
  not white. Before: violet fill, white label. After: bright green fill, dark label — the
  dark label is what keeps the bright green AA-legible.
- **Secondary / ghost** — `--surface` / transparent with `--border` and `--fg`; unchanged in
  structure, now reads on dark.
- **Danger** — `--negative` red.
- **Tinkers** — the darkened `--gradient-tinkers` (green→teal) with white `--fg-on-brand`
  text and a `--shadow-glow-tinkers` glow. Before: violet gradient. After: green→teal,
  darkened for AA (ADR-4).
- `loading` swaps the leading icon for a `Spinner`.

## Status: `StatusDot` & `StatusBadge`

Status colors map by kind (`StatusDot.tsx`):

| Kind | Token |
| --- | --- |
| `idle` | `--idle` |
| `running` | `--running` (teal) |
| `done` | `--positive` (green) |
| `warning` | `--warning` |
| `error` | `--negative` |
| `info` | `--info` |

- **`StatusDot`** pulses by default **only when `running`** (`tk-dot--pulse`) — this is the
  motion half of the running=teal+motion rule (ADR-5). Other states are static dots.
- **`StatusBadge`** always pairs the dot **with the word** (Done/Running/Error/…), so meaning
  never relies on color alone. Variants: `soft` (tinted fill via `color-mix`), `solid`,
  `outline`. Running badges get `role="status"` + `aria-live="polite"` so screen readers
  announce live work.
- Before → after: the same badge shapes now use green for done, **teal** for running (was
  ambiguous/single-hue before), keeping running visually distinct from positive.

## Cards & panels (`Card.tsx`, `Panel.tsx`)

Three-layer surface stack: `--bg` (app) → `--surface` (card) → `--surface-2` (inset). Borders
use `--border`; elevation uses `--shadow-*`. Before: light cards on lighter bg. After: layered
near-black with subtle dark shadows, so depth reads through luminance steps rather than heavy
borders.

## Tinkers dock & QuickAsk (`tinkers/TinkersDock.tsx`)

The signature god-mode surface. Uses `--gradient-tinkers` (green→teal) with white
`--fg-on-brand` text and the `--shadow-glow-tinkers` accent glow. A `StatusDot` shows
`running`/`idle`. Before: violet hero. After: deep green→teal, AA-safe white text, green glow —
the strongest expression of the Bobbit identity.

## Running / streaming indicators

Live work always combines **teal + motion**:

- `Spinner` rendered with `color="var(--running)"` on streaming tool-call rows
  (`session/ToolCallRow.tsx`).
- Pulsing `--running` dots in usage meters (`session/UsageMeter.tsx`) and sidebar entries.
- `--shadow-glow-running` ring on actively running elements.

This is the disambiguation guarantee: anything live is teal *and* animated, never static
green (which means "done").

## Sidebar / shell active states (`shell/Sidebar.tsx`)

Active nav/selection uses `--primary` (or `--primary-soft` for low-emphasis selected rows)
against the dark chrome; running projects/sessions surface a teal pulsing `StatusDot`. Before:
violet active states. After: green active states consistent with primary buttons.

## Settings → Appearance (`screens/SettingsScreen.tsx`)

A segmented control toggles theme between `light`, `dark`, and `system`, defaulting to
**`dark`**. Selecting an option calls `applyTheme`, which sets `document.documentElement
.dataset.theme` (`system` deletes it, falling back to `:root`/dark). Because the whole UI is
token-driven, the switch re-themes instantly. Also exposes reduced-motion and density toggles.
