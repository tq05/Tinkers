# Tinkers — Pi Agent Harness UI — Design Document

> **Scope of this iteration:** A React + TypeScript (Vite) **clickable component scaffold** realizing the
> information architecture and the 7 v1 screens against **mock data and stubbed state**. No real backend,
> no pi runtime, no auth, no persistence. Section I documents the *deferred* backend so the design is
> complete — but it is **NOT** to be implemented now.
>
> Companion artefact: [`docs/prototype.html`](./prototype.html) — a single self-contained HTML file that
> locks the visual direction (app shell + Projects dashboard + Live session + Tinkers quick-ask overlay).
> It is the visual source of truth; this document is the implementation spec.

---

## 0. Product mental model

```
Top-level space
├── Global agents (not tied to a project)
│   └── ★ Tinkers  ← flagship, god-mode, full access, always-present dock + quick-ask overlay
│   └── (other global agents…)
└── Projects (each grounded in a local code repo/folder)
    └── Project
        ├── Agents (scoped to this project)
        └── Sessions (each belongs to one agent)
```

- A **Session** is a single working conversation with one agent (project-scoped or global).
- **Real-time activity is first-class**: running indicators, streaming output, and active-session badges
  appear in the sidebar, on cards, and inside the session view.

---

## A. Visual design system

Friendly, colorful, playful. Rounded everything, generous whitespace, soft shadows, clear affordances.

### A.1 Palette

Defined in **oklch** (with hex fallbacks) so we get perceptually even tints. Light theme is primary; a dark
theme is provided via a `[data-theme="dark"]` override (same token names).

| Token | Light (oklch) | Hex | Role |
|---|---|---|---|
| `--bg` | `oklch(0.985 0.005 280)` | `#f7f6fb` | App background |
| `--surface` | `oklch(1 0 0)` | `#ffffff` | Cards / panels |
| `--surface-2` | `oklch(0.975 0.008 280)` | `#f1eff8` | Inset / hover surface |
| `--fg` | `oklch(0.25 0.03 285)` | `#2a2740` | Primary text |
| `--fg-muted` | `oklch(0.55 0.02 285)` | `#726f88` | Secondary text |
| `--border` | `oklch(0.92 0.01 285)` | `#e6e3f0` | Hairline borders |
| `--primary` | `oklch(0.62 0.21 295)` | `#7c4dff` | Brand violet (primary actions) |
| `--primary-fg` | `oklch(0.99 0 0)` | `#ffffff` | Text on primary |
| `--primary-soft` | `oklch(0.94 0.05 295)` | `#ece3ff` | Primary tint (selected nav, chips) |
| `--accent` | `oklch(0.78 0.16 70)` | `#ffb24d` | Warm amber accent (Tinkers spark) |
| `--accent-2` | `oklch(0.72 0.15 200)` | `#33c4d6` | Teal secondary accent |

**Semantic / status:**

| Token | Hex | Role |
|---|---|---|
| `--positive` | `#22b07d` | Success, completed |
| `--running` | `#33c4d6` | Running / streaming (teal, animated) |
| `--idle` | `#9aa0b4` | Idle / neutral grey |
| `--warning` | `#f2a93b` | Warning |
| `--negative` | `#f0506b` | Error / destructive |
| `--info` | `#4d8cff` | Informational |

**Categorical chart / avatar palette** (assign per-agent / per-category, cycle through):

| Token | Hex |
|---|---|
| `--chart-1` | `#7c4dff` (violet) |
| `--chart-2` | `#33c4d6` (teal) |
| `--chart-3` | `#ffb24d` (amber) |
| `--chart-4` | `#f0506b` (coral) |
| `--chart-5` | `#22b07d` (green) |
| `--chart-6` | `#4d8cff` (blue) |

Tints: derive with `color-mix(in oklch, var(--chart-1) 14%, transparent)`.

### A.2 Radii (rounded)

```
--radius-xs: 6px;   --radius-sm: 10px;  --radius-md: 14px;
--radius-lg: 20px;  --radius-xl: 28px;  --radius-pill: 999px;
```
Cards use `--radius-lg`, buttons `--radius-pill` (or `--radius-md` for blocky), inputs `--radius-md`,
avatars `--radius-pill` (circular) or `--radius-md` (squircle for agents).

### A.3 Spacing scale (4px base)

```
--sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px;
--sp-5: 24px; --sp-6: 32px; --sp-7: 48px; --sp-8: 64px;
```

### A.4 Typography

Font stack (no external fonts required; system rounded faces read as friendly):
```
--font-sans: "Inter", "SF Pro Rounded", ui-rounded, system-ui, -apple-system,
             "Segoe UI", Roboto, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
```
Optionally load Inter + JetBrains Mono via CDN `<link>` in production; system fallback is acceptable for the
scaffold. (The prototype uses the system stack to stay fully self-contained.)

| Token | Size / line-height | Use |
|---|---|---|
| `--text-xs` | 12px / 16px | Badges, captions, token counts |
| `--text-sm` | 13px / 18px | Secondary text, metadata |
| `--text-base` | 15px / 22px | Body, chat |
| `--text-lg` | 18px / 26px | Card titles |
| `--text-xl` | 22px / 30px | Section headers |
| `--text-2xl` | 28px / 36px | Page titles |
| `--text-3xl` | 36px / 44px | Hero |

Weights: 400 body, 500 medium (labels), 600 semibold (titles), 700 headings.

### A.5 Elevation / shadows

```
--shadow-sm: 0 1px 2px rgba(42,39,64,.06), 0 1px 3px rgba(42,39,64,.05);
--shadow-md: 0 4px 12px rgba(42,39,64,.08), 0 2px 4px rgba(42,39,64,.04);
--shadow-lg: 0 12px 32px rgba(42,39,64,.12), 0 4px 8px rgba(42,39,64,.06);
--shadow-glow-running: 0 0 0 3px color-mix(in oklch, var(--running) 22%, transparent);
--shadow-glow-tinkers: 0 8px 28px color-mix(in oklch, var(--accent) 40%, transparent);
```

### A.6 Motion

```
--ease: cubic-bezier(.2,.7,.3,1);
--dur-fast: 120ms; --dur: 200ms; --dur-slow: 360ms;
```
Reduced-motion: gate all non-essential animation behind `@media (prefers-reduced-motion: no-preference)`.
The streaming caret and running pulse degrade to a static dot.

### A.7 Tokens delivery — `src/client/styles/tokens.ts`

Tokens live as CSS custom properties on `:root` (in `tokens.css`) AND mirrored as a typed object for use in
TS/inline styles:

```ts
// src/client/styles/tokens.ts
export const tokens = {
  color: {
    bg: "var(--bg)", surface: "var(--surface)", surface2: "var(--surface-2)",
    fg: "var(--fg)", fgMuted: "var(--fg-muted)", border: "var(--border)",
    primary: "var(--primary)", primarySoft: "var(--primary-soft)",
    accent: "var(--accent)", accent2: "var(--accent-2)",
    positive: "var(--positive)", running: "var(--running)", idle: "var(--idle)",
    warning: "var(--warning)", negative: "var(--negative)", info: "var(--info)",
    chart: ["var(--chart-1)","var(--chart-2)","var(--chart-3)",
            "var(--chart-4)","var(--chart-5)","var(--chart-6)"] as const,
  },
  radius: { xs:"6px", sm:"10px", md:"14px", lg:"20px", xl:"28px", pill:"999px" },
  space: (n: 1|2|3|4|5|6|7|8) => `var(--sp-${n})`,
} as const;
export type Tokens = typeof tokens;
```

### A.8 Component library spec

All components live in `src/client/components/`. Prop shapes below.

**Button** — `components/Button.tsx`
```ts
interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "tinkers"; // default "secondary"
  size?: "sm" | "md" | "lg";          // default "md"
  iconLeft?: ReactNode; iconRight?: ReactNode;
  loading?: boolean;                   // shows spinner, disables
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}
```
- `primary`: solid violet, white text, `--radius-pill`.
- `secondary`: surface fill, `--border` outline.
- `ghost`: transparent, hover `--surface-2`.
- `danger`: solid `--negative`.
- `tinkers`: amber→violet gradient + `--shadow-glow-tinkers` (reserved for Tinkers CTAs).

**Card** — `components/Card.tsx`
```ts
interface CardProps {
  interactive?: boolean;   // hover lift + cursor pointer
  accent?: string;         // left border / glow color (e.g. chart color)
  padding?: "sm" | "md" | "lg";
  onClick?: () => void;
  children: ReactNode;
}
```

**Badge** — `components/Badge.tsx`
```ts
type StatusKind = "idle" | "running" | "error" | "done" | "warning" | "info";
interface BadgeProps {
  kind?: StatusKind;        // drives color
  variant?: "soft" | "solid" | "outline"; // default "soft"
  dot?: boolean;            // leading status dot (animated pulse when kind="running")
  children: ReactNode;
}
// StatusBadge convenience: <StatusBadge status="running" /> → teal pulsing dot + "Running"
```

**Avatar** — `components/Avatar.tsx`
```ts
interface AvatarProps {
  name: string;
  emoji?: string;           // playful icon, e.g. "🛠️", "🐙"
  color?: string;           // chart color; falls back to hash(name)
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "squircle";   // agents=squircle, users=circle
  status?: StatusKind;      // small corner status dot
  ring?: boolean;           // glow ring (Tinkers / running)
}
```

**Panel** — `components/Panel.tsx` (titled container inside session view)
```ts
interface PanelProps {
  title: string; icon?: ReactNode;
  actions?: ReactNode;      // right-aligned header controls
  collapsible?: boolean; defaultCollapsed?: boolean;
  scroll?: boolean;         // body scrolls independently
  children: ReactNode;
}
```

**Tabs** — `components/Tabs.tsx`
```ts
interface TabItem { id: string; label: string; icon?: ReactNode; badge?: ReactNode; }
interface TabsProps { items: TabItem[]; active: string; onChange: (id: string) => void; }
```

**Input** — `components/Input.tsx` (+ `Textarea`, `Select`)
```ts
interface InputProps {
  label?: string; hint?: string; error?: string;
  value: string; onChange: (v: string) => void;
  placeholder?: string; iconLeft?: ReactNode; type?: string;
}
interface SelectProps<T extends string> {
  label?: string; value: T; onChange: (v: T) => void;
  options: { value: T; label: string; icon?: ReactNode }[];
}
```

**Modal / Overlay** — `components/Modal.tsx`
```ts
interface ModalProps {
  open: boolean; onClose: () => void;
  title?: string; size?: "sm" | "md" | "lg";
  footer?: ReactNode; children: ReactNode;
}
```
Backdrop blur + scrim, `--radius-xl`, centered, ESC + scrim click close, focus trap.
The **Tinkers quick-ask overlay** is a specialized variant: top-anchored command bar, `Cmd/Ctrl+K` summon.

Supporting primitives: `Spinner`, `StatusDot`, `Toolbar`, `EmptyState`, `Tooltip`, `Kbd`, `ProgressBar`,
`UsageMeter`, `FileTree`, `MessageBubble`, `ToolCallRow`.

---

## B. Information architecture & navigation

### B.1 App shell

```
┌──────────────────────────────────────────────────────────────────────┐
│ Sidebar (260px, collapsible)        │  Main pane (active screen)        │
│ ┌──────────────────────────────┐    │                                   │
│ │ Tinkers wordmark + ✨         │    │   <routed screen>                 │
│ ├──────────────────────────────┤    │                                   │
│ │ ⌂ Home                        │    │                                   │
│ │ ⚙ Settings                    │    │                                   │
│ ├── PROJECTS ─────────── + ─────┤    │                                   │
│ │ ▸ Acme Web App   ● (running)  │    │                                   │
│ │   ├ agents…                   │    │                                   │
│ │   └ sessions…                 │    │                                   │
│ │ ▸ Data Pipeline               │    │                                   │
│ │ ▸ Mobile Client               │    │                                   │
│ ├── GLOBAL AGENTS ──────────────┤    │                                   │
│ │ ★ Tinkers   (god-mode)        │    │                                   │
│ │ 🔎 Researcher                 │    │                                   │
│ │ 📝 Doc Writer                 │    │                                   │
│ └──────────────────────────────┘    │                                   │
│                                      │                                   │
│  [✨ Ask Tinkers]  ← persistent dock pinned bottom-left of viewport      │
└──────────────────────────────────────────────────────────────────────┘
```

- **Two regions**: `PROJECTS` (expandable tree → agents + sessions) and `GLOBAL AGENTS` (flat list, Tinkers
  pinned + starred at top).
- Each project/agent/session row shows a **status dot** when active (running=teal pulse).
- The **Ask Tinkers** dock is pinned to the viewport (bottom-left), present on every screen.
- Sidebar collapses to a 64px icon rail on narrow viewports (< 980px) / via toggle.

### B.2 Routing map

No router library required. Use a tiny client-side route state — a `useRoute()` hook over a discriminated
union held in context + `history.pushState` for back/forward. (You *may* swap in `react-router-dom` later;
the `Route` union below maps 1:1 to its paths, so migration is mechanical. For the scaffold we ship the
hand-rolled router to avoid a dependency.)

```ts
// src/client/router/routes.ts
export type Route =
  | { name: "home" }                                   // /
  | { name: "project"; projectId: string }             // /p/:projectId
  | { name: "session"; sessionId: string }             // /s/:sessionId
  | { name: "agentNew"; projectId?: string }            // /agents/new  (?project=)
  | { name: "agentConfig"; agentId: string }           // /agents/:agentId/config
  | { name: "globalAgents" }                           // /global
  | { name: "settings" }                               // /settings
  | { name: "projectNew" };                            // /projects/new

export const toPath = (r: Route): string => { /* serialise */ };
export const fromPath = (path: string): Route => { /* parse, fallback home */ };
```

```ts
// src/client/router/RouterContext.tsx
function useRoute(): { route: Route; navigate: (r: Route) => void; back: () => void };
```
- `navigate` updates state + `history.pushState(toPath(route))`.
- `popstate` listener syncs state from URL.
- The Tinkers quick-ask overlay and the persistent dock are **route-independent** (held in a separate
  `useTinkers()` context so they float above any screen).

---

## C. The 7 screens (v1)

Each screen is a component under `src/client/screens/`. All use mock data + stubbed handlers.

### C.1 Projects dashboard / home — `screens/HomeScreen.tsx`
- **Header**: greeting ("Welcome back ✨"), `New project` (primary) + `New agent` buttons.
- **Activity strip**: horizontal row of *active sessions across all projects* — running cards with a teal
  pulse + live token tick + "Resume" affordance. Empty → friendly empty state.
- **Project grid**: responsive cards (`Card interactive accent={chartColor}`), each showing project name,
  repo path (mono, e.g. `~/code/acme-web`), agent count, session count, and an aggregate status badge
  (running count). Click → project view.
- **Global agents teaser**: compact strip at bottom featuring Tinkers (tinkers gradient) + others; "See all".

### C.2 Single project view — `screens/ProjectScreen.tsx`
- **Header**: project name, editable repo path chip, branch chip, `New session` (primary), overflow menu
  (settings, remove).
- **Tabs**: `Sessions` | `Agents` | `Files` | `Settings` (`Tabs` component).
  - *Sessions tab*: list grouped by status — **Running** (teal, top), then **Idle/recent**. Each row:
    agent avatar, session title, last message preview, relative time, status badge, token/cost mini-stat.
    Click → session view.
  - *Agents tab*: grid of agent cards (avatar, model chip e.g. `claude-3.7-sonnet`, permission badge
    read-only/full, # sessions). `+ New agent` card. Click agent → start/continue session or config.
  - *Files tab*: read-only `FileTree` of the repo (mock).
- **Empty states** for no sessions / no agents with a primary CTA.

### C.3 Live agent session view — `screens/SessionScreen.tsx` (the core surface)
See **Section D** for the panel spec. Three-column working layout:
```
┌ session header: agent avatar+name, model chip, permission badge, StatusBadge, [Stop]/[Resume] ┐
├───────────────┬─────────────────────────────────────┬──────────────────────────┤
│ File tree     │  Chat transcript (scroll)            │  Right rail (Tabs):       │
│ (Panel,       │  • MessageBubble (user/agent)        │   • Tool calls            │
│  workspace)   │  • streaming bubble w/ caret + dots  │   • Usage (tokens+cost)   │
│               │  • ToolCallRow inline references     │                           │
│               │  ──────────────────────────────────  │                          │
│               │  Composer: textarea + Send + Stop    │                          │
└───────────────┴─────────────────────────────────────┴──────────────────────────┘
```
- On narrow viewports the file tree and right rail collapse into toggle drawers; chat is the priority column.

### C.4 Agent creation / config — `screens/AgentConfigScreen.tsx`
Modal-or-page (page for full create; reuse as modal from quick flows). Fields per **Section E**. Live
preview card on the right showing the avatar + name + model + permission as it will appear. `Create agent`
(primary) / `Save changes`. Scope toggle has an explicit explanatory callout for *full access* (god-mode
caution copy).

### C.5 Global agents view — `screens/GlobalAgentsScreen.tsx`
- **Tinkers hero** at top: large card, tinkers gradient, ✨, "God-mode • full access to all projects &
  tools", primary `Open Tinkers` + secondary `Quick ask (⌘K)`. Live status badge.
- Below: grid of other global agents (Researcher, Doc Writer…) + `New global agent` card.
- Copy clarifies global agents are not bound to a single repo and can span projects.

### C.6 Settings — `screens/SettingsScreen.tsx`
- **Tabs**: `Providers & Keys` | `Models` | `Appearance` | `About`.
  - *Providers & Keys*: rows for OpenAI / Anthropic / Google. Each: masked key input (`sk-…••••`), `Test`
    button (stubbed → success/fail toast), status badge. **Mock only** — note that keys are not persisted/
    sent anywhere in this iteration.
  - *Models*: default model per provider (Select), default permission scope, default avatar palette.
  - *Appearance*: theme (light/dark/system), reduced motion toggle, density.
  - *About*: version, links to pi, "deferred backend" note.

### C.7 New session / new project flow — `screens/NewSessionFlow.tsx`, `screens/NewProjectFlow.tsx`
Both presented as **Modal** wizards.
- **New project**: Step 1 pick local folder (mock file-picker → preset paths) + name; Step 2 detected repo
  info (branch, language chips — mock); Step 3 optionally create a first agent (or "use Tinkers"). Finish →
  navigate to new project view.
- **New session**: choose agent (existing project/global agent or `+ create`), optional title, optional
  starting prompt. Finish → navigate to session view (starts in *idle* or immediately *running* if a prompt
  was provided — demonstrating the running state).

---

## D. Agent session view — required panels

All under `src/client/components/session/`.

### D.1 Chat transcript — `MessageBubble.tsx`
- `role`: `user` | `agent` | `system`. User bubbles right-aligned, primary-soft fill; agent left-aligned,
  surface fill with agent avatar; system center, muted.
- Markdown + fenced code (mono, syntax-tinted background). Copy-on-hover for code.
- **Streaming bubble**: when the last agent message `streaming===true`, render incoming text + a blinking
  caret `▍` and a 3-dot "thinking" indicator above it while `toolRunning`. Auto-scroll to bottom unless the
  user has scrolled up (then show a "Jump to latest" pill).

### D.2 Tool calls / actions — `ToolCallRow.tsx` + Tool calls panel
- Each `ToolCall`: icon by `kind` (read/edit/bash/search/web), title (e.g. `edit  src/app.ts`), collapsible
  args + result preview, duration, and a status: `running` (teal spinner) / `done` (green check) /
  `error` (coral). Running tool calls also surface inline in the transcript as a compact chip.
- Panel header shows count + a filter (all / running / errors).

### D.3 Token + cost usage — `UsageMeter.tsx`
- Compact stat block: input tokens, output tokens, total, est. cost (USD). A small stacked bar
  (input vs output) using `--chart-1`/`--chart-2`. While running, numbers tick up live (mock increments).
- Per-session totals + a per-message micro-stat on hover.

### D.4 File tree / workspace browser — `FileTree.tsx`
- Collapsible tree of the project repo (mock). Files touched by the agent in this session get a colored dot
  (added=green, modified=amber, referenced=violet). Selecting a file opens a read-only preview pane (mock
  contents) — or, in the scaffold, a stub viewer. Folder/file emoji icons keep it friendly.

### D.5 Streaming + running representation (must-have)
- **Session header**: `StatusBadge status="running"` (teal pulsing dot + "Running"), `Stop` button replaces
  `Send` while active.
- **Transcript**: streaming caret + thinking dots (D.1).
- **Tool calls**: running spinner rows (D.2).
- **Usage**: live-ticking counters (D.3).
- **Sidebar**: the session/agent/project rows show a teal pulse dot; Home activity strip lists it.

---

## E. Agent creation / config fields

`AgentConfigScreen` form model:

```ts
interface AgentDraft {
  name: string;                       // required
  emoji: string;                      // avatar icon picker (playful set) — default "🤖"
  color: string;                      // avatar color (chart palette swatches)
  provider: "openai" | "anthropic" | "google";
  model: string;                      // options depend on provider (see modelsByProvider)
  systemPrompt: string;               // personality / instructions (Textarea, char count)
  permission: "read-only" | "full";   // scope toggle
  // global agents: projectId === null; project agents carry projectId
}

const modelsByProvider = {
  openai:    ["gpt-4o", "gpt-4o-mini", "o3", "o4-mini"],
  anthropic: ["claude-3.7-sonnet", "claude-3.5-haiku", "claude-opus-4"],
  google:    ["gemini-2.5-pro", "gemini-2.5-flash"],
};
```
- **Provider** select swaps **Model** options (provider logo emoji/letter on each option).
- **Permission scope**: segmented control. `full` reveals an amber caution callout
  ("Full access lets this agent read & write any file and run commands. Use with care.").
- **Live preview** Avatar+Card reflecting current draft.

---

## F. Tinkers (flagship global agent)

Tinkers is a **god-mode** global agent: full access, every tool enabled, spans all projects. Treated
specially in the UI.

### F.1 Persistent dock — `components/tinkers/TinkersDock.tsx`
- Pinned to the viewport bottom-left (above sidebar footer), present on **every** screen.
- Collapsed: a tinkers-gradient pill `✨ Ask Tinkers` with `⌘K` hint and a status dot (running if Tinkers
  has an active session).
- Click or `⌘K` → opens the **quick-ask overlay**. A small caret menu offers `Open full session`.

### F.2 Quick-ask overlay — `components/tinkers/TinkersQuickAsk.tsx`
- Command-bar Modal anchored near top-center, summonable from anywhere via `⌘K` / `Ctrl+K` (global key
  listener in `useTinkers()`), ESC to close.
- Single large input ("Ask Tinkers anything…"), optional context chip (current project/session auto-attached),
  recent prompts list, and a "↵ to send · ⇧↵ open full session" hint.
- Submitting shows an **inline streaming answer** in the overlay (mock), with a `Continue in full session`
  button that navigates to Tinkers' session view carrying the thread.

### F.3 Full session view
- Tinkers uses the same `SessionScreen` but with a **tinkers gradient header**, ✨ avatar with glow ring,
  and a permanent `God-mode • full access` badge. Its file tree shows an "all projects" root (mock).

### F.4 god-mode presentation
- Tinkers' avatar always has the glow ring; its permission badge reads `Full access` (not toggleable);
  appears starred + pinned atop the Global Agents region.

---

## G. Mock data model

Lives in `src/client/mock/`. Pure data + tiny stubbed "store" with React state; no network.

```ts
// src/client/mock/types.ts
export type StatusKind = "idle" | "running" | "error" | "done" | "warning" | "info";
export type Provider = "openai" | "anthropic" | "google";
export type Permission = "read-only" | "full";

export interface Project {
  id: string;
  name: string;
  repoPath: string;          // e.g. "~/code/acme-web"
  branch: string;            // e.g. "main"
  languages: string[];       // ["TypeScript","CSS"]
  agentIds: string[];
  sessionIds: string[];
  accentColor: string;       // chart color
  createdAt: string;         // ISO
}

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  color: string;             // chart color
  provider: Provider;
  model: string;
  systemPrompt: string;
  permission: Permission;
  projectId: string | null;  // null ⇒ global agent
  isTinkers?: boolean;       // flagship flag (forces full access + glow)
  status: StatusKind;        // current agent activity (idle/running/error)
}

export interface Session {
  id: string;
  title: string;
  agentId: string;
  projectId: string | null;  // mirrors agent scope
  status: StatusKind;        // "running" while streaming, else "idle"/"error"
  createdAt: string;
  updatedAt: string;
  messageIds: string[];
  usage: Usage;
  streaming?: boolean;       // true ⇒ last agent message is mid-stream
}

export interface Message {
  id: string;
  sessionId: string;
  role: "user" | "agent" | "system";
  content: string;           // markdown
  createdAt: string;
  streaming?: boolean;       // partial content being appended
  toolCallIds?: string[];    // tool calls attached to this turn
}

export interface ToolCall {
  id: string;
  sessionId: string;
  messageId: string;
  kind: "read" | "edit" | "bash" | "search" | "web" | "write";
  title: string;             // "edit src/App.tsx"
  args?: string;             // serialized preview
  result?: string;           // serialized preview
  status: "running" | "done" | "error";
  durationMs?: number;
  startedAt: string;
}

export interface Usage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;       // = input + output
  costUsd: number;
}

export interface FileNode {            // mock workspace tree
  name: string; path: string;
  type: "file" | "dir";
  children?: FileNode[];
  change?: "added" | "modified" | "referenced";
}
```

### G.1 Idle AND running representation in mock data
The seed (`src/client/mock/data.ts`) MUST include at least:
- One **running** session (`status:"running"`, `streaming:true`, a `Message` with `streaming:true`, and a
  `ToolCall` with `status:"running"`, live-ticking `usage`).
- One **idle** session (`status:"idle"`, completed tool calls `status:"done"`, final usage).
- One **error** session (`status:"error"`) to exercise the error badge/empty path.
- Tinkers as a global agent with `isTinkers:true`, `permission:"full"`, and (for demo) a running session.

### G.2 Stubbed store — `src/client/mock/store.tsx`
- A `MockStoreProvider` exposing `projects`, `agents`, `sessions`, selectors
  (`getProject`, `agentsForProject`, `sessionsForProject`, `messagesForSession`, …), and stubbed mutators
  (`sendMessage`, `stopSession`, `createAgent`, `createProject`, `createSession`).
- `sendMessage` simulates streaming: appends a `Message`, flips `streaming`, then uses a `setInterval` to
  append chunks and tick `usage`, finally clears `streaming` and marks tool calls `done`. This drives all the
  running-state visuals without a backend. `stopSession` clears streaming + sets `idle`.

---

## H. Idle vs Running states (cross-cutting)

| Surface | Idle | Running |
|---|---|---|
| Sidebar row | grey/no dot | teal pulsing `StatusDot` + subtle row tint |
| Session/agent/project card | `StatusBadge idle` (grey) | `StatusBadge running` (teal pulse) + card running glow |
| Session header | `Send` enabled, `Stop` hidden | `StatusBadge running`, `Stop` shown, `Send` → disabled/spinner |
| Transcript | static last message | streaming bubble: caret `▍` + thinking dots |
| Tool calls | rows show check/✓ done | running rows show teal spinner + elapsed timer |
| Usage | static totals | counters tick up live |
| Home activity strip | hidden if none | lists each running session with resume |
| Tinkers dock | gradient pill, idle dot | dock dot pulses teal |

Accessibility: every running state pairs color with a non-color signal (animated dot **and** the word
"Running", spinner glyph, live region announcing "Agent is responding…"). Honor `prefers-reduced-motion`
(pulse/caret become static).

---

## I. Backend architecture — DEFERRED (DO NOT IMPLEMENT THIS ITERATION)

> This section documents the *intended* future runtime so the design is complete. **None of it is built in
> this iteration.** The existing Fastify server (`src/server/`) and its `/api/health` endpoint + unit test
> (`src/server/app.test.ts`) remain untouched. The scaffold only adds client-side mock data.

**Pi subprocess lifecycle.** Each running session maps to one `pi` child process launched via
`@earendil-works/pi-coding-agent` in machine mode: `pi --mode rpc` (JSON messages over stdio). The backend
keeps a `SessionManager` map `sessionId → { child, status, lastSeq }`:
- *spawn*: on first user message for an idle session, fork the process with cwd = project repo path and the
  provider key in env; handshake, then forward the prompt.
- *supervise*: parse line-delimited JSON events from stdout (`message.delta`, `tool.start`, `tool.end`,
  `usage`, `done`, `error`); heartbeat/timeout watchdog.
- *kill*: `Stop` → send a cancel RPC, then `SIGTERM`, escalating to `SIGKILL` after a grace window.

**Fastify API surface (future).**
`GET /api/health` (exists); `GET /api/projects`, `POST /api/projects`; `GET /api/projects/:id/agents`,
`POST /api/agents`, `PATCH /api/agents/:id`; `GET /api/sessions/:id`, `POST /api/sessions`,
`POST /api/sessions/:id/stop`; `GET /api/settings`, `PUT /api/settings/keys` (secrets in OS keychain, never
the client). All current client mock mutators map 1:1 to these.

**WebSocket protocol (`/ws`).** Browser opens a WS per active session (or one multiplexed socket keyed by
`sessionId`). Server→client events mirror the pi event stream:
`{type:"message.delta", sessionId, messageId, text}`, `{type:"tool.start"|"tool.end", toolCall}`,
`{type:"usage", usage}`, `{type:"status", status}`, `{type:"error", message}`. Client→server:
`{type:"prompt", sessionId, text}`, `{type:"stop", sessionId}`. Events carry a monotonic `seq` for ordering
and resume.

**Edge cases (future).** Process crash → mark session `error`, surface coral badge + retry; backpressure →
server buffers/throttles deltas and coalesces ticks, client renders at most ~30fps; reconnection → client
reconnects WS and replays from `lastSeq` (server retains a bounded ring buffer per session); orphaned
processes reaped on server shutdown; provider-key missing → friendly setup prompt routing to Settings.

The client scaffold is built so that swapping `mock/store.tsx` for a WS-backed store is the *only* change
needed to go live — components consume the store interface, not mock arrays directly.

---

## J. Proposed file / component structure

Additive only. Existing files (`src/server/**`, `src/client/index.html`, `main.tsx`) are preserved;
`App.tsx` is rewritten to mount the router + providers + app shell (keeping a `/api/health` ping is optional,
not required).

```
src/client/
  main.tsx                      (exists — unchanged)
  index.html                    (exists — unchanged)
  App.tsx                       (rewritten: <MockStoreProvider><RouterProvider><TinkersProvider>
                                            <AppShell/></…>)
  styles/
    tokens.css                  CSS custom properties (:root + [data-theme="dark"])
    tokens.ts                   typed token mirror (A.7)
    global.css                  resets, base typography, scrollbars
  router/
    routes.ts                   Route union + toPath/fromPath (B.2)
    RouterContext.tsx           useRoute(), navigate(), back(), popstate sync
  shell/
    AppShell.tsx                sidebar + main pane + dock layout
    Sidebar.tsx                 Projects tree + Global agents region
    SidebarProjectTree.tsx
    TopBar.tsx                  optional breadcrumb/header
  components/
    Button.tsx Card.tsx Badge.tsx StatusBadge.tsx StatusDot.tsx Avatar.tsx
    Panel.tsx Tabs.tsx Input.tsx Textarea.tsx Select.tsx Modal.tsx
    Spinner.tsx EmptyState.tsx Tooltip.tsx Kbd.tsx ProgressBar.tsx Toolbar.tsx
    session/
      MessageBubble.tsx ToolCallRow.tsx UsageMeter.tsx FileTree.tsx Composer.tsx
    tinkers/
      TinkersDock.tsx TinkersQuickAsk.tsx TinkersProvider.tsx (useTinkers + ⌘K listener)
  screens/
    HomeScreen.tsx ProjectScreen.tsx SessionScreen.tsx
    AgentConfigScreen.tsx GlobalAgentsScreen.tsx SettingsScreen.tsx
    NewProjectFlow.tsx NewSessionFlow.tsx
  mock/
    types.ts                    interfaces (Section G)
    data.ts                     seed: projects/agents/sessions/messages/toolcalls/files
                                (incl. idle + running + error + Tinkers)
    store.tsx                   MockStoreProvider + selectors + stubbed streaming mutators
  lib/
    format.ts                   relative time, token/cost formatting, color hashing
```

**Implementation order:** tokens/global → primitives (Button/Card/Badge/Avatar/Panel/Tabs/Input/Modal) →
mock types/data/store → router + AppShell + Sidebar + TinkersDock → screens (Home → Project → Session →
GlobalAgents → AgentConfig → Settings → New flows) → quick-ask overlay → polish idle/running states.

**Guardrails:** do not modify `src/server/**`; keep `npm run check`, `npm run build`, `npm run test:unit`
green; no new runtime deps required (router is hand-rolled; fonts via system stack or optional CDN link).
```
