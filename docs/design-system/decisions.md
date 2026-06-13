# Design decisions (ADR log)

ADR-style record of the choices behind the Bobbit green/black theme and their trade-offs.
Each entry: context → decision → consequences.

## ADR-1: Green-on-black as the identity

**Context.** Tinkers is an agent harness — a developer tool that runs long, terminal-like
sessions. The original scaffold shipped a friendly violet/light palette that read as
consumer/playful rather than as a professional engineering surface. The user wanted the
Bobbit look they were already using and liked: technical green on near-black.

**Decision.** Adopt a calm, technical green (`#3fdc7f` dark / `#157f4b` light) as the brand
and primary color over layered near-black surfaces (`#0b0f0d` → `#121815` → `#1a221d`).

**Consequences.** The UI reads as a polished developer tool. Green doubles as the positive
color (see ADR-5). High contrast and a restrained palette mean the few accent colors carry
real meaning. Trade-off: green is a heavily loaded hue (brand + primary + success), so we
needed an explicit disambiguation strategy (ADR-5).

## ADR-2: Dark is the default

**Context.** Agent work is long-running and often sits next to a terminal/editor. Glare and
eye strain matter, and live status colors (green/teal/red) pop more on a dark canvas.

**Decision.** Make dark the default theme. `:root` *is* the dark palette. `[data-theme="dark"]`
duplicates `:root` so an explicit dark selection still resolves even if the default ever
changes. `[data-theme="light"]` is the opt-in light variant. Settings → Appearance defaults
to `dark`; `system` removes the attribute and falls back to `:root` (dark).

**Consequences.** Zero-config users get the intended look immediately. Trade-off: a light
variant must still be fully maintained and AA-checked, doubling the color surface to verify.

## ADR-3: What changed from the old violet/amber theme

**Context.** The previous theme used violet primary + light surfaces + amber accents.

**Decision.** Replace violet primary with green, light surfaces with layered near-black,
and re-tint neutral chrome (shadows, scrim) from violet to a green-black cast. Amber is
**retained but demoted** to the `--warning`/`--chart-4` slot only — it is no longer a brand
accent. The categorical palette keeps blue/amber/red/violet as `--chart-3..6` for chart and
avatar variety, but green/teal lead (`--chart-1/2`).

**Consequences.** The brand mood shifts decisively to Bobbit. Existing components needed no
structural change because they already read tokens — only the token *values* changed.
Trade-off: any muscle memory tied to "violet = Tinkers" is gone; docs and screenshots that
referenced the old palette are now stale.

## ADR-4: Darkened gradient for AA white text

**Context.** The Tinkers god-mode hero/dock uses a saturated green→teal gradient with white
text. White on the *bright* `--primary`/`--accent` greens (`#3fdc7f`/`#7ee787`) fails AA —
those greens are too light to carry white text.

**Decision.** Use a dedicated, intentionally **darkened** gradient
`linear-gradient(135deg, #1a6e4b 0%, #0d4f4a 100%)` (deep green → teal) for any surface that
carries white `--fg-on-brand` text. Measured: white on `#1a6e4b` = 6.2:1, on `#0d4f4a` =
9.4:1 — both ≥4.5:1.

**Consequences.** The hero/dock keep the green→teal brand feel while staying AA. Trade-off:
the gradient stops are darker than the brand `--primary`, so the gradient is *not* a literal
interpolation of the palette greens — it is a separate, hand-tuned token. We also keep two
distinct "on-brand foreground" tokens: dark `--primary-fg` for the flat bright-green button,
white `--fg-on-brand` for the darkened gradient.

## ADR-5: Primary and positive both green; running is teal

**Context.** Green is simultaneously the brand/primary and the natural success color. If a
"running" indicator were also green, a card showing a green primary button, a green "done"
badge, and a green "running" dot would be visually ambiguous.

**Decision.** Keep **primary and positive both green** (they rarely conflict in meaning —
one is an action, one is an outcome), but make **running teal (`--running` `#2dd4bf`) and
always pair it with motion** (pulse on dots, spinner on rows). Encode the rule as:
*running = teal + motion · positive = green + static · primary = green + interactive.*

**Consequences.** No two green meanings collide on screen. Teal sits next to green
harmoniously (it is also `--accent-2`/`--chart-2`), so the live state feels part of the
family rather than a foreign alert color. Trade-off: "running" is not green, which a user
might naively expect; the motion cue and the always-present text label ("Running") resolve
this. Color is never the sole signal.
