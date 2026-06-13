// Typed mirror of the CSS custom properties in tokens.css (§A.7).
// Components reference these instead of hardcoding values.

export const tokens = {
  color: {
    bg: "var(--bg)",
    surface: "var(--surface)",
    surface2: "var(--surface-2)",
    fg: "var(--fg)",
    fgMuted: "var(--fg-muted)",
    border: "var(--border)",
    primary: "var(--primary)",
    primaryFg: "var(--primary-fg)",
    primarySoft: "var(--primary-soft)",
    accent: "var(--accent)",
    accent2: "var(--accent-2)",
    positive: "var(--positive)",
    running: "var(--running)",
    idle: "var(--idle)",
    warning: "var(--warning)",
    negative: "var(--negative)",
    info: "var(--info)",
    chart: [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
      "var(--chart-6)",
    ] as const,
  },
  radius: {
    xs: "var(--radius-xs)",
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
    pill: "var(--radius-pill)",
  },
  space: (n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) => `var(--sp-${n})`,
  font: {
    sans: "var(--font-sans)",
    mono: "var(--font-mono)",
  },
  text: {
    xs: "var(--text-xs)",
    sm: "var(--text-sm)",
    base: "var(--text-base)",
    lg: "var(--text-lg)",
    xl: "var(--text-xl)",
    "2xl": "var(--text-2xl)",
    "3xl": "var(--text-3xl)",
  },
  weight: {
    regular: "var(--fw-regular)",
    medium: "var(--fw-medium)",
    semibold: "var(--fw-semibold)",
    bold: "var(--fw-bold)",
  },
  shadow: {
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)",
    glowRunning: "var(--shadow-glow-running)",
    glowTinkers: "var(--shadow-glow-tinkers)",
  },
  motion: {
    ease: "var(--ease)",
    durFast: "var(--dur-fast)",
    dur: "var(--dur)",
    durSlow: "var(--dur-slow)",
  },
  gradientTinkers: "var(--gradient-tinkers)",
} as const;

export type Tokens = typeof tokens;

/** Pick a categorical chart color by index (cycles through the 6-color palette). */
export const chartColor = (i: number): string =>
  tokens.color.chart[((i % 6) + 6) % 6];
