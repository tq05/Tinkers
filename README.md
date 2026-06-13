# Tinkers

A web harness for the [`pi`](https://github.com/earendil-works/pi) agent. Tinkers
spawns and supervises the `pi` coding agent as a subprocess and exposes it through
a web UI (React + Vite frontend, Fastify backend, WebSocket streaming between them).

## The pi agent

Tinkers drives `pi` via its published CLI package
[`@earendil-works/pi-coding-agent`](https://www.npmjs.com/package/@earendil-works/pi-coding-agent),
which provides the `pi` binary. The harness runs it in machine-readable mode
(`pi --mode rpc` over stdio).

Requires **Node >= 22.19.0**.

```bash
npm install            # installs deps incl. @earendil-works/pi-coding-agent
npm run dev            # start the harness (Vite + Fastify)
```

You will also need an LLM provider API key on the environment for `pi` to run
(see `.env.example`).

## Project layout

This repository is managed as a Bobbit project. Build/test/run commands and the
feature workflow are defined in `.bobbit/config/project.yaml`:

| Command | Script |
|---|---|
| Build | `npm run build` |
| Typecheck + lint | `npm run check` |
| Unit tests | `npm run test:unit` |
| E2E (browser) | `npm run test:e2e` |
| Dev server | `npm run dev` |

> The application code (Fastify backend, React UI, pi subprocess manager) is built
> via the `feature` workflow and is not yet present in this initial scaffold.
