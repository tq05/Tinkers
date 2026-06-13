# Tinkers UI scaffold

This document describes the React + TypeScript UI scaffold that lives under
`src/client/`. It is the implementation companion to the full design spec in
[`design.md`](design.md): where the design doc is the *plan*, this doc explains
*what exists* and *how the pieces fit*.

**Scope reminder.** This iteration is a **clickable scaffold on mock data**.
Every screen is navigable and the running/streaming visuals animate, but nothing
talks to a server. The pi runtime, Fastify API, WebSocket streaming, auth, and
persistence are deferred — documented in [`design.md`](design.md) §I. The whole
point of the scaffold's structure (see [Why this shape](#why-this-shape)) is to
make that backend swap a localized change.

---

## Product mental model

```
Top-level space
├── Global agents (not tied to a project)
│   ├── ★ Tinkers   ← flagship, god-mode, full access, always-present
│   └── (other global agents…)
└── Projects (each grounded in a local code repo/folder)
    └── Project
        ├── Agents (scoped to this project)
        └── Sessions (each belongs to one agent)
```

- A **Session** is one working conversation with a single agent (project-scoped
  or global).
- **Tinkers** is the flagship global agent, presented as god-mode (full access,
  every tool enabled, spans all projects). It is always reachable via a pinned
  dock and a `Cmd/Ctrl+K` quick-ask overlay.
- **Real-time activity is first-class.** Running indicators, streaming output,
  and active-session badges appear in the sidebar, on cards, and inside the
  session view. Idle, running, and error states are all represented.

---

## Architecture at a glance

The app is a provider stack wrapping an app shell. `src/client/App.tsx`:

```
<MockStoreProvider>      // in-memory data + stubbed mutators (mock/store.tsx)
  <RouterProvider>       // hand-rolled client-side routing (router/)
    <TinkersProvider>    // Tinkers overlay state + global ⌘K listener
      <AppShell />       // sidebar + main pane (renders the active screen)
      <TinkersDock />    // persistent launcher pinned to the viewport
```

Data flows one way: screens and components read from the **store interface**
(`useStore()`) and call its mutators; the store owns all state and drives the
animated streaming. Routing is independent of Tinkers, so the dock and overlay
float above whatever screen is active.

Directory map under `src/client/`:

| Area | Path | Role |
|---|---|---|
| App root | `App.tsx`, `main.tsx`, `index.html` | mounts the provider stack |
| Design tokens | `styles/` | CSS custom properties + typed mirror + globals |
| Component library | `components/` | reusable primitives + session/Tinkers parts |
| App shell | `shell/` | sidebar, project tree, main-pane layout |
| Routing | `router/` | `Route` union + `useRoute()` context |
| Screens | `screens/` | the 7 v1 screens |
| Mock data | `mock/` | types, seed data, stubbed store |
| Helpers | `lib/format.ts` | relative time, token/cost formatting, color hashing |

---

## Design system: tokens + components

### Tokens — `src/client/styles/`

The visual direction is *friendly and approachable*: rounded, colorful, playful,
generous whitespace, soft shadows.

- `tokens.css` — CSS custom properties on `:root`, with a `[data-theme="dark"]`
  override using the same token names. Covers palette (oklch with hex
  fallbacks), semantic/status colors (`--running` teal, `--idle`, `--positive`,
  `--negative`, …), a 6-way categorical chart/avatar palette, radii, spacing
  (4px base), typography scale, shadows, and motion easings.
- `tokens.ts` — a typed object mirroring the CSS variables (`tokens.color.*`,
  `tokens.radius.*`, `tokens.space(n)`) so TS/inline styles reference the same
  tokens instead of hardcoding values.
- `global.css` — resets, base typography, scrollbar styling.

Why both CSS and TS: CSS variables keep theming dynamic (one `data-theme`
switch re-themes everything), while the typed mirror gives autocomplete and
type-safety in component code. See [`design.md`](design.md) §A for the full
token tables and rationale.

### Component library — `src/client/components/`

Reusable primitives, each a small focused component styled via
`components.css`:

- **Primitives**: `Button`, `Card`, `Badge` / `StatusBadge` / `StatusDot`,
  `Avatar`, `Panel`, `Tabs`, `Input` / `Textarea` / `Select`, `Modal`,
  `Spinner`, `EmptyState`, `Tooltip`, `Kbd`, `ProgressBar`, `Toolbar`,
  `FileTree`.
- **Session parts** (`components/session/`, styled by `session.css`):
  `MessageBubble`, `ToolCallRow`, `UsageMeter`, `Composer`.
- **Tinkers parts** (`components/tinkers/`, styled by `tinkers.css`):
  `TinkersProvider`, `TinkersDock`, `TinkersQuickAsk`.

Notable variants that carry the brand: `Button variant="tinkers"` (amber→violet
gradient + glow) for Tinkers CTAs, and `StatusBadge` / `StatusDot` which pulse
teal for the running state. See [`design.md`](design.md) §A.8 for prop shapes.

---

## Information architecture & navigation

### App shell — `src/client/shell/`

- `AppShell.tsx` — overall layout: a left **Sidebar** plus a main pane that
  renders the active screen based on the current route.
- `Sidebar.tsx` + `SidebarProjectTree.tsx` — the sidebar's two regions:
  1. **Projects** — an expandable tree drilling into each project's agents and
     sessions.
  2. **Global agents** — a flat list with Tinkers pinned and starred at the top.
  Active rows show a teal pulsing status dot.

### Routing — `src/client/router/`

Routing is **hand-rolled** (no router dependency) to keep the scaffold
self-contained. `routes.ts` defines a discriminated-union `Route` type with
`toPath` / `fromPath` serializers; the paths map 1:1 to a future
`react-router-dom` migration, so swapping it in later is mechanical.

| Route | Path | Screen |
|---|---|---|
| `home` | `/` | `HomeScreen` |
| `project` | `/p/:projectId` | `ProjectScreen` |
| `session` | `/s/:sessionId` | `SessionScreen` |
| `agentNew` | `/agents/new` (`?project=`) | `AgentConfigScreen` (create) |
| `agentConfig` | `/agents/:agentId/config` | `AgentConfigScreen` (edit) |
| `globalAgents` | `/global` | `GlobalAgentsScreen` |
| `settings` | `/settings` | `SettingsScreen` |
| `projectNew` | `/projects/new` | `NewProjectFlow` |

`RouterContext.tsx` exposes `useRoute()` → `{ route, navigate, back }`.
`navigate` updates state and calls `history.pushState`; a `popstate` listener
syncs state back from the URL, so browser back/forward work. Unknown paths fall
back to `home`.

---

## The 7 screens — `src/client/screens/`

Shared styling lives in `screens-overview.css` (dashboard/grid screens) and
`screens-forms.css` (config + wizard flows).

1. **Home / Projects dashboard** — `HomeScreen.tsx`. Greeting header with `New
   project` / `New agent` CTAs; an **activity strip** of running sessions across
   all projects (teal pulse + live token tick + resume); a responsive **project
   grid** (name, repo path, agent/session counts, aggregate status); and a
   compact global-agents teaser featuring Tinkers.
2. **Single project** — `ProjectScreen.tsx`. Project header (repo path + branch
   chips, `New session`) and tabs for **Sessions** (grouped running-first),
   **Agents** (cards with model + permission badges), and **Files** (read-only
   `FileTree`). Empty states with CTAs.
3. **Live session** — `SessionScreen.tsx`. The core working surface; see
   [below](#live-session-view).
4. **Agent creation / config** — `AgentConfigScreen.tsx`. Form for name, emoji +
   color avatar, provider + model (model options swap with provider), system
   prompt, and a permission segmented control. Selecting **full access** reveals
   an amber caution callout. A live preview card reflects the draft. Serves both
   the create (`agentNew`) and edit (`agentConfig`) routes.
5. **Global agents** — `GlobalAgentsScreen.tsx`. A Tinkers hero card (gradient,
   god-mode badge, `Open Tinkers` + `Quick ask ⌘K`) above a grid of other global
   agents and a `New global agent` card. Copy clarifies global agents span
   projects.
6. **Settings** — `SettingsScreen.tsx`. Tabs for **Providers & Keys** (masked
   key inputs + stubbed `Test` buttons for OpenAI/Anthropic/Google), **Models**,
   **Appearance** (theme, reduced motion), and **About**. Keys are mock-only —
   nothing is persisted or sent anywhere this iteration.
7. **New project / new session flows** — `NewProjectFlow.tsx`,
   `NewSessionFlow.tsx`. Modal wizards. New project: pick a (mock) folder +
   name, review detected repo info, optionally create a first agent. New
   session: choose an agent, optional title, optional starting prompt — if a
   prompt is given the session **starts running immediately**, demonstrating the
   streaming state.

### Live session view

`SessionScreen.tsx` is a three-column layout (file tree · transcript · right
rail). Its panels:

- **Chat transcript** — `MessageBubble` rows for user/agent/system messages with
  markdown + fenced code. The streaming agent message renders incoming text plus
  a blinking caret and thinking dots. The transcript auto-scrolls while
  streaming unless the user scrolls up, in which case a "jump to latest" pill
  appears. A `Composer` sits below for input.
- **Tool calls** — `ToolCallRow` entries (icon by kind: read/edit/bash/search/
  web/write), each with collapsible args/result, duration, and a status
  (running spinner / done check / error). The panel offers an all/running/errors
  filter.
- **Usage** — `UsageMeter` shows input/output/total tokens and estimated USD
  cost; the numbers tick up live while the session is running.
- **File tree** — `FileTree` shows the (mock) project workspace, with colored
  dots marking files the agent added/modified/referenced; selecting a file opens
  a stub preview.

On narrow viewports the file tree and right rail collapse into toggle drawers so
the chat stays the priority column.

### Idle vs running representation

Running state is signaled redundantly (color **and** a non-color cue) across the
UI: a teal pulsing dot plus the word "Running" on badges, a streaming caret +
thinking dots in the transcript, spinner rows on running tool calls, live-
ticking usage counters, sidebar row pulses, and the Home activity strip. The
Tinkers dock dot pulses when Tinkers has an active session. See
[`design.md`](design.md) §H for the full idle/running matrix and the
`prefers-reduced-motion` degradations.

---

## Tinkers dock + quick-ask overlay

`components/tinkers/` realizes the flagship agent as a route-independent layer:

- **`TinkersProvider`** — holds overlay open/close state and installs the global
  `Cmd/Ctrl+K` key listener; exposes a `useTinkers()` hook. Living outside the
  router is deliberate — Tinkers must be summonable from any screen.
- **`TinkersDock`** — a tinkers-gradient `✨ Ask Tinkers` pill pinned to the
  viewport, present on every screen, showing a status dot and a `⌘K` hint.
- **`TinkersQuickAsk`** — a command-bar `Modal` anchored near the top, opened via
  the dock or `Cmd/Ctrl+K` (ESC to close). A single large input, an optional
  context chip for the current project/session, and an inline (mock) streaming
  answer, with a "continue in full session" path into Tinkers' `SessionScreen`.

Tinkers' full session reuses `SessionScreen` with brand treatment (gradient
header, glow-ring avatar, permanent `Full access` badge).

---

## Mock data model + store — `src/client/mock/`

- **`types.ts`** — the data contract: `Project`, `Agent`, `Session`, `Message`,
  `ToolCall`, `Usage`, `FileNode`, plus `AgentDraft` and the shared `StatusKind`
  / `Provider` / `Permission` unions. An `Agent` with `projectId: null` is
  global; `isTinkers: true` marks the flagship. A `Session` carries `status` and
  `streaming` flags; a `Message` and `ToolCall` carry their own streaming/running
  status. These mirror the future API payloads on purpose.
- **`data.ts`** — seed data that deliberately exercises every state: at least one
  **running** session (streaming message + running tool call + ticking usage),
  one **idle** session (completed tool calls + final usage), one **error**
  session, and **Tinkers** as a global agent with `isTinkers` / full access and a
  running session. This guarantees the scaffold demonstrates idle, running, and
  error visuals without any user interaction.
- **`store.tsx`** — `MockStoreProvider` exposes the `MockStore` interface:
  collections, **selectors** (`getProject`, `agentsForProject`,
  `messagesForSession`, `globalAgents`, `runningSessions`,
  `fileTreeForProject`, …), and **mutators** (`sendMessage`, `stopSession`,
  `createAgent`, `createProject`, `createSession`), reached via `useStore()`.

  `sendMessage` simulates streaming: it appends the user message and an empty
  streaming agent message, flips the session to `running`, then a `setInterval`
  appends text chunks and ticks `usage` upward; when the chunks are exhausted it
  clears `streaming`, marks running tool calls `done`, and returns the session to
  `idle`. `stopSession` cancels that timer and resets state immediately. Timers
  are tracked per session and cleaned up on unmount. This is what drives all the
  live running-state visuals with no backend.

---

## Why this shape

The components never touch the seed arrays directly — they consume the
`MockStore` **interface** through `useStore()`. The mutators (`sendMessage`,
`stopSession`, `createSession`, …) map 1:1 onto the deferred Fastify endpoints
and WebSocket events documented in [`design.md`](design.md) §I.

The intended consequence: **going live should require swapping
`mock/store.tsx` for a WebSocket-backed implementation of the same interface —
and nothing else.** Streaming already flows through `sendMessage` updating store
state, which is exactly how incoming `message.delta` / `tool.*` / `usage` WS
events would update it. Routing, the design system, and all screens are agnostic
to where the data comes from. That is the core architectural bet of this
iteration; everything else is deliberately deferred.
