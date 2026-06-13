// Stubbed in-memory store (§G.2). MockStoreProvider exposes selectors + mutators.
// Components consume this interface, not raw arrays — so a WS-backed store can be
// swapped in later with no component changes.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  agents as seedAgents,
  fileTrees as seedFileTrees,
  messages as seedMessages,
  projects as seedProjects,
  sessions as seedSessions,
  toolCalls as seedToolCalls,
} from "./data";
import type {
  Agent,
  AgentDraft,
  FileNode,
  Message,
  Project,
  Session,
  ToolCall,
} from "./types";

let idCounter = 1000;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

export interface CreateSessionInput {
  agentId: string;
  title?: string;
  prompt?: string; // when provided, the session starts running (demonstrates streaming)
}

export interface MockStore {
  // raw collections (rarely needed directly; prefer selectors)
  projects: Project[];
  agents: Agent[];
  sessions: Session[];

  // selectors
  getProject: (id: string) => Project | undefined;
  getAgent: (id: string) => Agent | undefined;
  getSession: (id: string) => Session | undefined;
  agentsForProject: (projectId: string) => Agent[];
  sessionsForProject: (projectId: string) => Session[];
  messagesForSession: (sessionId: string) => Message[];
  toolCallsForSession: (sessionId: string) => ToolCall[];
  toolCallsForMessage: (messageId: string) => ToolCall[];
  globalAgents: () => Agent[];
  runningSessions: () => Session[];
  fileTreeForProject: (projectId: string | null) => FileNode[];

  // mutators
  sendMessage: (sessionId: string, text: string) => void;
  stopSession: (sessionId: string) => void;
  createAgent: (draft: AgentDraft, projectId: string | null) => Agent;
  createProject: (input: {
    name: string;
    repoPath: string;
    branch?: string;
    languages?: string[];
  }) => Project;
  createSession: (input: CreateSessionInput) => Session;
}

const StoreContext = createContext<MockStore | null>(null);

// Mock streaming text the agent "produces" chunk-by-chunk.
const STREAM_CHUNKS = [
  "Looking into this",
  " now. ",
  "I'll trace the data flow ",
  "and apply a minimal fix. ",
  "Done — verifying the change ",
  "compiles cleanly. ✅",
];

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => seedProjects.map((p) => ({ ...p })));
  const [agents, setAgents] = useState<Agent[]>(() => seedAgents.map((a) => ({ ...a })));
  const [sessions, setSessions] = useState<Session[]>(() => seedSessions.map((s) => ({ ...s })));
  const [messages, setMessages] = useState<Message[]>(() => seedMessages.map((m) => ({ ...m })));
  const [toolCalls, setToolCalls] = useState<ToolCall[]>(() =>
    seedToolCalls.map((t) => ({ ...t })),
  );

  // Active streaming timers keyed by sessionId, cleaned up on stop/unmount.
  const timers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  const clearTimer = useCallback((sessionId: string) => {
    const t = timers.current.get(sessionId);
    if (t) {
      clearInterval(t);
      timers.current.delete(sessionId);
    }
  }, []);

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearInterval(t));
      map.clear();
    };
  }, []);

  // ── selectors ──────────────────────────────────────────────────────────────
  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects],
  );
  const getAgent = useCallback((id: string) => agents.find((a) => a.id === id), [agents]);
  const getSession = useCallback(
    (id: string) => sessions.find((s) => s.id === id),
    [sessions],
  );
  const agentsForProject = useCallback(
    (projectId: string) => agents.filter((a) => a.projectId === projectId),
    [agents],
  );
  const sessionsForProject = useCallback(
    (projectId: string) => sessions.filter((s) => s.projectId === projectId),
    [sessions],
  );
  const messagesForSession = useCallback(
    (sessionId: string) =>
      messages
        .filter((m) => m.sessionId === sessionId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [messages],
  );
  const toolCallsForSession = useCallback(
    (sessionId: string) => toolCalls.filter((t) => t.sessionId === sessionId),
    [toolCalls],
  );
  const toolCallsForMessage = useCallback(
    (messageId: string) => toolCalls.filter((t) => t.messageId === messageId),
    [toolCalls],
  );
  const globalAgents = useCallback(
    () =>
      agents
        .filter((a) => a.projectId === null)
        .sort((a, b) => Number(Boolean(b.isTinkers)) - Number(Boolean(a.isTinkers))),
    [agents],
  );
  const runningSessions = useCallback(
    () => sessions.filter((s) => s.status === "running"),
    [sessions],
  );
  const fileTreeForProject = useCallback(
    (projectId: string | null) => seedFileTrees[projectId ?? "*"] ?? seedFileTrees["*"],
    [],
  );

  // ── mutators ─────────────────────────────────────────────────────────────────
  const stopSession = useCallback(
    (sessionId: string) => {
      clearTimer(sessionId);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, status: "idle", streaming: false, updatedAt: new Date().toISOString() } : s,
        ),
      );
      setMessages((prev) =>
        prev.map((m) => (m.sessionId === sessionId ? { ...m, streaming: false } : m)),
      );
      setToolCalls((prev) =>
        prev.map((t) =>
          t.sessionId === sessionId && t.status === "running"
            ? { ...t, status: "done", durationMs: t.durationMs ?? 1000 }
            : t,
        ),
      );
    },
    [clearTimer],
  );

  const sendMessage = useCallback(
    (sessionId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const nowIso = new Date().toISOString();
      const userMsgId = nextId("msg");
      const agentMsgId = nextId("msg");

      const userMsg: Message = {
        id: userMsgId,
        sessionId,
        role: "user",
        content: trimmed,
        createdAt: nowIso,
      };
      const agentMsg: Message = {
        id: agentMsgId,
        sessionId,
        role: "agent",
        content: "",
        createdAt: new Date(Date.now() + 1).toISOString(),
        streaming: true,
      };

      setMessages((prev) => [...prev, userMsg, agentMsg]);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                status: "running",
                streaming: true,
                updatedAt: nowIso,
                messageIds: [...s.messageIds, userMsgId, agentMsgId],
              }
            : s,
        ),
      );

      // Stream chunks into the agent message + tick usage.
      let i = 0;
      clearTimer(sessionId);
      const timer = setInterval(() => {
        if (i < STREAM_CHUNKS.length) {
          const chunk = STREAM_CHUNKS[i];
          i++;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === agentMsgId ? { ...m, content: m.content + chunk } : m,
            ),
          );
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== sessionId) return s;
              const out = s.usage.outputTokens + 24;
              const inp = s.usage.inputTokens + 6;
              return {
                ...s,
                usage: {
                  inputTokens: inp,
                  outputTokens: out,
                  totalTokens: inp + out,
                  costUsd: Number(((inp * 3 + out * 15) / 1_000_000).toFixed(4)),
                },
              };
            }),
          );
        } else {
          // Finish: clear streaming + mark tool calls done + session idle.
          clearTimer(sessionId);
          setMessages((prev) =>
            prev.map((m) => (m.id === agentMsgId ? { ...m, streaming: false } : m)),
          );
          setToolCalls((prev) =>
            prev.map((t) =>
              t.sessionId === sessionId && t.status === "running"
                ? { ...t, status: "done", durationMs: t.durationMs ?? 800 }
                : t,
            ),
          );
          setSessions((prev) =>
            prev.map((s) =>
              s.id === sessionId
                ? { ...s, status: "idle", streaming: false, updatedAt: new Date().toISOString() }
                : s,
            ),
          );
        }
      }, 420);
      timers.current.set(sessionId, timer);
    },
    [clearTimer],
  );

  const createAgent = useCallback(
    (draft: AgentDraft, projectId: string | null) => {
      const agent: Agent = {
        id: nextId("agent"),
        name: draft.name,
        emoji: draft.emoji,
        color: draft.color,
        provider: draft.provider,
        model: draft.model,
        systemPrompt: draft.systemPrompt,
        permission: draft.permission,
        projectId,
        status: "idle",
      };
      setAgents((prev) => [...prev, agent]);
      if (projectId) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId ? { ...p, agentIds: [...p.agentIds, agent.id] } : p,
          ),
        );
      }
      return agent;
    },
    [],
  );

  const createProject = useCallback(
    (input: {
      name: string;
      repoPath: string;
      branch?: string;
      languages?: string[];
    }) => {
      const project: Project = {
        id: nextId("proj"),
        name: input.name,
        repoPath: input.repoPath,
        branch: input.branch ?? "main",
        languages: input.languages ?? [],
        agentIds: [],
        sessionIds: [],
        accentColor: `var(--chart-${(projects.length % 6) + 1})`,
        createdAt: new Date().toISOString(),
      };
      setProjects((prev) => [...prev, project]);
      return project;
    },
    [projects.length],
  );

  const createSession = useCallback(
    (input: CreateSessionInput) => {
      const agent = agents.find((a) => a.id === input.agentId);
      const projectId = agent?.projectId ?? null;
      const nowIso = new Date().toISOString();
      const session: Session = {
        id: nextId("sess"),
        title: input.title?.trim() || "New session",
        agentId: input.agentId,
        projectId,
        status: "idle",
        createdAt: nowIso,
        updatedAt: nowIso,
        messageIds: [],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, costUsd: 0 },
      };
      setSessions((prev) => [...prev, session]);
      if (projectId) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId ? { ...p, sessionIds: [...p.sessionIds, session.id] } : p,
          ),
        );
      }
      // Optional starting prompt → immediately starts streaming (running state demo).
      if (input.prompt && input.prompt.trim()) {
        // defer so the session exists in state before streaming begins
        setTimeout(() => sendMessage(session.id, input.prompt!.trim()), 0);
      }
      return session;
    },
    [agents, sendMessage],
  );

  const value = useMemo<MockStore>(
    () => ({
      projects,
      agents,
      sessions,
      getProject,
      getAgent,
      getSession,
      agentsForProject,
      sessionsForProject,
      messagesForSession,
      toolCallsForSession,
      toolCallsForMessage,
      globalAgents,
      runningSessions,
      fileTreeForProject,
      sendMessage,
      stopSession,
      createAgent,
      createProject,
      createSession,
    }),
    [
      projects,
      agents,
      sessions,
      getProject,
      getAgent,
      getSession,
      agentsForProject,
      sessionsForProject,
      messagesForSession,
      toolCallsForSession,
      toolCallsForMessage,
      globalAgents,
      runningSessions,
      fileTreeForProject,
      sendMessage,
      stopSession,
      createAgent,
      createProject,
      createSession,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): MockStore {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a MockStoreProvider");
  return ctx;
}
