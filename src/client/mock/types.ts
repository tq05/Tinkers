// Mock data model (§G). Pure data shapes; no network.

export type StatusKind = "idle" | "running" | "error" | "done" | "warning" | "info";
export type Provider = "openai" | "anthropic" | "google";
export type Permission = "read-only" | "full";

export interface Project {
  id: string;
  name: string;
  repoPath: string; // e.g. "~/code/acme-web"
  branch: string; // e.g. "main"
  languages: string[];
  agentIds: string[];
  sessionIds: string[];
  accentColor: string; // chart color
  createdAt: string; // ISO
}

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  color: string; // chart color
  provider: Provider;
  model: string;
  systemPrompt: string;
  permission: Permission;
  projectId: string | null; // null ⇒ global agent
  isTinkers?: boolean; // flagship flag (forces full access + glow)
  status: StatusKind; // current agent activity
}

export interface Usage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number; // = input + output
  costUsd: number;
}

export interface Session {
  id: string;
  title: string;
  agentId: string;
  projectId: string | null; // mirrors agent scope
  status: StatusKind; // "running" while streaming, else "idle"/"error"
  createdAt: string;
  updatedAt: string;
  messageIds: string[];
  usage: Usage;
  streaming?: boolean; // true ⇒ last agent message is mid-stream
}

export interface Message {
  id: string;
  sessionId: string;
  role: "user" | "agent" | "system";
  content: string; // markdown
  createdAt: string;
  streaming?: boolean; // partial content being appended
  toolCallIds?: string[]; // tool calls attached to this turn
}

export type ToolCallKind = "read" | "edit" | "bash" | "search" | "web" | "write";
export type ToolCallStatus = "running" | "done" | "error";

export interface ToolCall {
  id: string;
  sessionId: string;
  messageId: string;
  kind: ToolCallKind;
  title: string; // "edit src/App.tsx"
  args?: string; // serialized preview
  result?: string; // serialized preview
  status: ToolCallStatus;
  durationMs?: number;
  startedAt: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: FileNode[];
  change?: "added" | "modified" | "referenced";
}

/** Draft model used by the agent create/config screen (§E). */
export interface AgentDraft {
  name: string;
  emoji: string;
  color: string;
  provider: Provider;
  model: string;
  systemPrompt: string;
  permission: Permission;
}

export const modelsByProvider: Record<Provider, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "o3", "o4-mini"],
  anthropic: ["claude-3.7-sonnet", "claude-3.5-haiku", "claude-opus-4"],
  google: ["gemini-2.5-pro", "gemini-2.5-flash"],
};
