# Tinkers

A web harness for the [`pi`](https://github.com/earendil-works/pi) agent — a
self-extensible coding-agent toolkit. The product mental model is **Projects**
(each grounded in a local code repository) that contain **Agents** and
**Sessions**, plus a **top-level space** of global agents not tied to any
project — the flagship being **Tinkers**, a god-mode general-purpose agent with
access to everything.

## Current status: clickable UI scaffold (mock data)

This iteration ships a **React + TypeScript (Vite) clickable UI scaffold**: the
full information architecture and all 7 v1 screens, navigable end-to-end against
**mock data and stubbed state**. There is **no real backend yet** — the pi
runtime, the Fastify API/WebSocket streaming layer, auth, and persistence are
**deferred**. See [`docs/design.md`](docs/design.md) §I for the intended runtime
and [`docs/ui-scaffold.md`](docs/ui-scaffold.md) for what was actually built.

Because everything runs on an in-memory mock store, **you do not need an LLM
provider API key or a local `pi` install to explore the scaffold.** Running
state, streaming output, tool calls, and token/cost meters are all simulated in
the client.

The repository does still contain a minimal Fastify server (a `/api/health`
endpoint and static-file serving for production builds); it is the seed of the
deferred backend and is not required to view the UI in dev.

## Requirements

- **Node >= 22.19.0**

## Running it

```bash
npm install     # install dependencies

# Dev: Vite client (with HMR) + Fastify server, run concurrently.
# The Vite dev server proxies /api and /ws to Fastify on port 3000.
npm run dev

# Production-style: build the client, then serve it from Fastify.
npm run build
npm start        # Fastify serves dist/client and /api on port 3000
```

In dev, open the URL Vite prints (default `http://localhost:5173`). The mock
scaffold is fully functional there on its own.

## Commands

Build/test/run commands and the feature workflow are defined in
`.bobbit/config/project.yaml`:

| Command | Script | Purpose |
|---|---|---|
| Build | `npm run build` | Vite build → `dist/client` |
| Typecheck | `npm run check` | `tsc --noEmit` |
| Unit tests | `npm run test:unit` | Vitest (server `app.test.ts`) |
| E2E (browser) | `npm run test:e2e` | placeholder script |
| Dev server | `npm run dev` | Vite client + Fastify, concurrently |

## Project layout

```
src/
  client/   React + TS UI scaffold (substrate, components, screens, Tinkers dock)
  server/   minimal Fastify app (/api/health + static serving) — backend deferred
docs/
  design.md       full design spec (incl. deferred backend, §I)
  ui-scaffold.md  what the scaffold implements + how the pieces fit
  prototype.html  single-file visual source of truth
```

This repository is managed as a Bobbit project; the UI was built via the
`feature` workflow.
