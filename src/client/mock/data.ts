// Seed mock data (§G.1). Includes idle + running + error sessions and Tinkers.
// All ids are stable strings so the router can deep-link.

import type {
  Agent,
  FileNode,
  Message,
  Project,
  Session,
  ToolCall,
} from "./types";

const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

// ── Projects ────────────────────────────────────────────────────────────────
export const projects: Project[] = [
  {
    id: "proj-acme",
    name: "Acme Web App",
    repoPath: "~/code/acme-web",
    branch: "main",
    languages: ["TypeScript", "CSS"],
    agentIds: ["agent-ada", "agent-rex"],
    sessionIds: ["sess-running", "sess-idle"],
    accentColor: "var(--chart-1)",
    createdAt: iso(40 * DAY),
  },
  {
    id: "proj-pipeline",
    name: "Data Pipeline",
    repoPath: "~/code/data-pipeline",
    branch: "develop",
    languages: ["Python", "SQL"],
    agentIds: ["agent-pip"],
    sessionIds: ["sess-error"],
    accentColor: "var(--chart-2)",
    createdAt: iso(18 * DAY),
  },
  {
    id: "proj-mobile",
    name: "Mobile Client",
    repoPath: "~/code/mobile-client",
    branch: "main",
    languages: ["Swift", "Kotlin"],
    agentIds: [],
    sessionIds: [],
    accentColor: "var(--chart-3)",
    createdAt: iso(6 * DAY),
  },
];

// ── Agents ──────────────────────────────────────────────────────────────────
export const agents: Agent[] = [
  // Project: Acme Web App
  {
    id: "agent-ada",
    name: "Ada",
    emoji: "🐙",
    color: "var(--chart-1)",
    provider: "anthropic",
    model: "claude-3.7-sonnet",
    systemPrompt:
      "You are Ada, a meticulous full-stack engineer. Prefer small, well-tested changes and explain your reasoning briefly.",
    permission: "full",
    projectId: "proj-acme",
    status: "running",
  },
  {
    id: "agent-rex",
    name: "Rex",
    emoji: "🦖",
    color: "var(--chart-4)",
    provider: "openai",
    model: "gpt-4o",
    systemPrompt:
      "You are Rex, a code reviewer. You read carefully and never modify files — read-only.",
    permission: "read-only",
    projectId: "proj-acme",
    status: "idle",
  },
  // Project: Data Pipeline
  {
    id: "agent-pip",
    name: "Pip",
    emoji: "🐍",
    color: "var(--chart-2)",
    provider: "google",
    model: "gemini-2.5-pro",
    systemPrompt:
      "You are Pip, a data engineer specializing in ETL pipelines and SQL optimization.",
    permission: "full",
    projectId: "proj-pipeline",
    status: "error",
  },
  // Global agents
  {
    id: "agent-tinkers",
    name: "Tinkers",
    emoji: "✨",
    color: "var(--accent)",
    provider: "anthropic",
    model: "claude-opus-4",
    systemPrompt:
      "You are Tinkers, a god-mode generalist with full access to every project and tool. Help with anything, anywhere.",
    permission: "full",
    projectId: null,
    isTinkers: true,
    status: "running",
  },
  {
    id: "agent-researcher",
    name: "Researcher",
    emoji: "🔎",
    color: "var(--chart-6)",
    provider: "openai",
    model: "o3",
    systemPrompt:
      "You are a research agent. You search the web and synthesize findings into concise briefs.",
    permission: "read-only",
    projectId: null,
    status: "idle",
  },
  {
    id: "agent-docwriter",
    name: "Doc Writer",
    emoji: "📝",
    color: "var(--chart-5)",
    provider: "google",
    model: "gemini-2.5-flash",
    systemPrompt:
      "You are a documentation specialist. You write clear, friendly docs and keep them up to date.",
    permission: "full",
    projectId: null,
    status: "idle",
  },
];

// ── Tool calls ────────────────────────────────────────────────────────────────
export const toolCalls: ToolCall[] = [
  // Running session — one in-flight tool call
  {
    id: "tc-run-1",
    sessionId: "sess-running",
    messageId: "msg-run-2",
    kind: "read",
    title: "read src/components/Cart.tsx",
    args: '{ "path": "src/components/Cart.tsx" }',
    result: "Loaded 142 lines.",
    status: "done",
    durationMs: 320,
    startedAt: iso(2 * MIN),
  },
  {
    id: "tc-run-2",
    sessionId: "sess-running",
    messageId: "msg-run-2",
    kind: "edit",
    title: "edit src/components/Cart.tsx",
    args: '{ "path": "src/components/Cart.tsx", "hunks": 2 }',
    status: "running",
    startedAt: iso(8 * 1000),
  },
  // Idle session — all done
  {
    id: "tc-idle-1",
    sessionId: "sess-idle",
    messageId: "msg-idle-2",
    kind: "search",
    title: "search 'useAuth'",
    args: '{ "query": "useAuth" }',
    result: "7 matches in 4 files.",
    status: "done",
    durationMs: 180,
    startedAt: iso(3 * HOUR),
  },
  {
    id: "tc-idle-2",
    sessionId: "sess-idle",
    messageId: "msg-idle-2",
    kind: "edit",
    title: "edit src/hooks/useAuth.ts",
    args: '{ "path": "src/hooks/useAuth.ts" }',
    result: "Applied 1 hunk.",
    status: "done",
    durationMs: 540,
    startedAt: iso(3 * HOUR),
  },
  {
    id: "tc-idle-3",
    sessionId: "sess-idle",
    messageId: "msg-idle-2",
    kind: "bash",
    title: "bash npm test",
    args: '{ "cmd": "npm test" }',
    result: "All 38 tests passing.",
    status: "done",
    durationMs: 4200,
    startedAt: iso(3 * HOUR),
  },
  // Error session — failed tool call
  {
    id: "tc-err-1",
    sessionId: "sess-error",
    messageId: "msg-err-2",
    kind: "bash",
    title: "bash python etl.py --full",
    args: '{ "cmd": "python etl.py --full" }',
    result: "Traceback: ConnectionError — could not reach warehouse at db:5432.",
    status: "error",
    durationMs: 1900,
    startedAt: iso(20 * MIN),
  },
  // Tinkers running session
  {
    id: "tc-tink-1",
    sessionId: "sess-tinkers",
    messageId: "msg-tink-2",
    kind: "web",
    title: "web search 'oklch color mixing'",
    args: '{ "query": "oklch color mixing" }',
    status: "running",
    startedAt: iso(5 * 1000),
  },
];

// ── Messages ──────────────────────────────────────────────────────────────────
export const messages: Message[] = [
  // Running session
  {
    id: "msg-run-1",
    sessionId: "sess-running",
    role: "user",
    content: "The cart total doesn't update when I change quantity. Can you fix it?",
    createdAt: iso(3 * MIN),
  },
  {
    id: "msg-run-2",
    sessionId: "sess-running",
    role: "agent",
    content:
      "Found it — the `useMemo` in `Cart.tsx` is missing `quantity` in its dependency array. Patching now",
    createdAt: iso(2 * MIN),
    streaming: true,
    toolCallIds: ["tc-run-1", "tc-run-2"],
  },
  // Idle session
  {
    id: "msg-idle-1",
    sessionId: "sess-idle",
    role: "user",
    content: "Add a `useAuth` hook and wire it into the login form.",
    createdAt: iso(3 * HOUR + 5 * MIN),
  },
  {
    id: "msg-idle-2",
    sessionId: "sess-idle",
    role: "agent",
    content:
      "Done! I added `src/hooks/useAuth.ts`, connected it to the login form, and the full test suite passes.\n\n```ts\nexport function useAuth() {\n  return useContext(AuthContext);\n}\n```",
    createdAt: iso(3 * HOUR),
    toolCallIds: ["tc-idle-1", "tc-idle-2", "tc-idle-3"],
  },
  // Error session
  {
    id: "msg-err-1",
    sessionId: "sess-error",
    role: "user",
    content: "Run the full ETL job against the warehouse.",
    createdAt: iso(22 * MIN),
  },
  {
    id: "msg-err-2",
    sessionId: "sess-error",
    role: "agent",
    content:
      "I tried to run the job but hit a connection error reaching the warehouse. The database may be down or unreachable from this environment.",
    createdAt: iso(20 * MIN),
    toolCallIds: ["tc-err-1"],
  },
  {
    id: "msg-err-3",
    sessionId: "sess-error",
    role: "system",
    content: "Session ended with an error.",
    createdAt: iso(20 * MIN),
  },
  // Tinkers session
  {
    id: "msg-tink-1",
    sessionId: "sess-tinkers",
    role: "user",
    content: "What's the best way to mix two oklch colors for a tint?",
    createdAt: iso(1 * MIN),
  },
  {
    id: "msg-tink-2",
    sessionId: "sess-tinkers",
    role: "agent",
    content: "Great question — let me check the current CSS spec for `color-mix`",
    createdAt: iso(30 * 1000),
    streaming: true,
    toolCallIds: ["tc-tink-1"],
  },
];

// ── Sessions ──────────────────────────────────────────────────────────────────
export const sessions: Session[] = [
  {
    id: "sess-running",
    title: "Fix cart total not updating",
    agentId: "agent-ada",
    projectId: "proj-acme",
    status: "running",
    createdAt: iso(4 * MIN),
    updatedAt: iso(8 * 1000),
    messageIds: ["msg-run-1", "msg-run-2"],
    streaming: true,
    usage: {
      inputTokens: 3120,
      outputTokens: 840,
      totalTokens: 3960,
      costUsd: 0.0214,
    },
  },
  {
    id: "sess-idle",
    title: "Add useAuth hook",
    agentId: "agent-rex",
    projectId: "proj-acme",
    status: "idle",
    createdAt: iso(3 * HOUR + 6 * MIN),
    updatedAt: iso(3 * HOUR),
    messageIds: ["msg-idle-1", "msg-idle-2"],
    usage: {
      inputTokens: 8450,
      outputTokens: 2310,
      totalTokens: 10_760,
      costUsd: 0.0712,
    },
  },
  {
    id: "sess-error",
    title: "Run full ETL job",
    agentId: "agent-pip",
    projectId: "proj-pipeline",
    status: "error",
    createdAt: iso(23 * MIN),
    updatedAt: iso(20 * MIN),
    messageIds: ["msg-err-1", "msg-err-2", "msg-err-3"],
    usage: {
      inputTokens: 1540,
      outputTokens: 420,
      totalTokens: 1960,
      costUsd: 0.0096,
    },
  },
  {
    id: "sess-tinkers",
    title: "oklch color mixing",
    agentId: "agent-tinkers",
    projectId: null,
    status: "running",
    createdAt: iso(2 * MIN),
    updatedAt: iso(30 * 1000),
    messageIds: ["msg-tink-1", "msg-tink-2"],
    streaming: true,
    usage: {
      inputTokens: 1820,
      outputTokens: 360,
      totalTokens: 2180,
      costUsd: 0.0331,
    },
  },
];

// ── Mock workspace file trees, keyed by projectId ("*" = Tinkers all-projects).
export const fileTrees: Record<string, FileNode[]> = {
  "proj-acme": [
    {
      name: "src",
      path: "src",
      type: "dir",
      children: [
        {
          name: "components",
          path: "src/components",
          type: "dir",
          children: [
            {
              name: "Cart.tsx",
              path: "src/components/Cart.tsx",
              type: "file",
              change: "modified",
            },
            { name: "Header.tsx", path: "src/components/Header.tsx", type: "file" },
          ],
        },
        {
          name: "hooks",
          path: "src/hooks",
          type: "dir",
          children: [
            {
              name: "useAuth.ts",
              path: "src/hooks/useAuth.ts",
              type: "file",
              change: "added",
            },
          ],
        },
        { name: "App.tsx", path: "src/App.tsx", type: "file", change: "referenced" },
        { name: "main.tsx", path: "src/main.tsx", type: "file" },
      ],
    },
    { name: "package.json", path: "package.json", type: "file" },
    { name: "README.md", path: "README.md", type: "file" },
  ],
  "proj-pipeline": [
    {
      name: "pipeline",
      path: "pipeline",
      type: "dir",
      children: [
        { name: "etl.py", path: "pipeline/etl.py", type: "file", change: "referenced" },
        { name: "transforms.py", path: "pipeline/transforms.py", type: "file" },
      ],
    },
    { name: "requirements.txt", path: "requirements.txt", type: "file" },
  ],
  "proj-mobile": [
    {
      name: "ios",
      path: "ios",
      type: "dir",
      children: [{ name: "App.swift", path: "ios/App.swift", type: "file" }],
    },
    {
      name: "android",
      path: "android",
      type: "dir",
      children: [{ name: "Main.kt", path: "android/Main.kt", type: "file" }],
    },
  ],
  // Tinkers god-mode: an "all projects" virtual root.
  "*": [
    {
      name: "All projects",
      path: "*",
      type: "dir",
      children: [
        { name: "acme-web", path: "*/acme-web", type: "dir" },
        { name: "data-pipeline", path: "*/data-pipeline", type: "dir" },
        { name: "mobile-client", path: "*/mobile-client", type: "dir" },
      ],
    },
  ],
};

/** Recent quick-ask prompts shown in the Tinkers overlay (mock). */
export const recentTinkersPrompts: string[] = [
  "Summarize what changed across all projects today",
  "Which sessions are currently running?",
  "Draft a release note for the cart fix",
];
