// ProjectScreen (§C.2) — header + Tabs(Sessions|Agents|Files|Settings).
// Sessions grouped Running/Idle; Agents grid; read-only FileTree; settings stub.

import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { FileTree } from "../components/FileTree";
import { Panel } from "../components/Panel";
import { StatusBadge } from "../components/StatusBadge";
import { Tabs } from "../components/Tabs";
import { formatTokens, relativeTime } from "../lib/format";
import type { Agent, Session } from "../mock/types";
import { useStore } from "../mock/store";
import { useRoute } from "../router/RouterContext";
import "./screens-overview.css";

const TABS = [
  { id: "sessions", label: "Sessions", icon: <span aria-hidden="true">💬</span> },
  { id: "agents", label: "Agents", icon: <span aria-hidden="true">🤖</span> },
  { id: "files", label: "Files", icon: <span aria-hidden="true">📂</span> },
  { id: "settings", label: "Settings", icon: <span aria-hidden="true">⚙️</span> },
];

export function ProjectScreen({ projectId }: { projectId: string }) {
  const store = useStore();
  const { navigate } = useRoute();
  const [tab, setTab] = useState("sessions");
  const [selectedFile, setSelectedFile] = useState<string | undefined>();

  const project = store.getProject(projectId);
  if (!project) {
    return (
      <div className="tk-screen">
        <EmptyState
          icon="🤷"
          title="Project not found"
          description="This project doesn't exist or was removed."
          action={
            <Button variant="primary" onClick={() => navigate({ name: "home" })}>
              Back home
            </Button>
          }
        />
      </div>
    );
  }

  const sessions = store.sessionsForProject(projectId);
  const agents = store.agentsForProject(projectId);

  const startSession = () => {
    const firstSession = sessions[0];
    if (firstSession) {
      navigate({ name: "session", sessionId: firstSession.id });
    } else if (agents[0]) {
      const created = store.createSession({ agentId: agents[0].id });
      navigate({ name: "session", sessionId: created.id });
    } else {
      navigate({ name: "agentNew", projectId });
    }
  };

  return (
    <div className="tk-screen">
      <header className="tk-screen__head">
        <div>
          <h1 className="tk-screen__greeting">{project.name}</h1>
          <div className="tk-chips" style={{ marginTop: "var(--sp-3)" }}>
            <span className="tk-chip tk-chip--mono">📁 {project.repoPath}</span>
            <span className="tk-chip tk-chip--mono">⎇ {project.branch}</span>
            {project.languages.map((lang) => (
              <span key={lang} className="tk-chip">
                {lang}
              </span>
            ))}
          </div>
        </div>
        <div className="tk-screen__actions">
          <Button
            variant="primary"
            iconLeft={<span aria-hidden="true">＋</span>}
            onClick={startSession}
          >
            New session
          </Button>
        </div>
      </header>

      <Tabs items={TABS} active={tab} onChange={setTab} />

      <div className="tk-tabbody">
        {tab === "sessions" && (
          <SessionsTab projectId={projectId} sessions={sessions} hasAgents={agents.length > 0} />
        )}
        {tab === "agents" && <AgentsTab projectId={projectId} agents={agents} />}
        {tab === "files" && (
          <Panel title="Workspace" icon={<span aria-hidden="true">📂</span>} scroll>
            <FileTree
              nodes={store.fileTreeForProject(projectId)}
              selectedPath={selectedFile}
              onSelect={setSelectedFile}
            />
          </Panel>
        )}
        {tab === "settings" && <SettingsTab projectId={project.id} />}
      </div>
    </div>
  );
}

function SessionsTab({
  projectId,
  sessions,
  hasAgents,
}: {
  projectId: string;
  sessions: Session[];
  hasAgents: boolean;
}) {
  const { navigate } = useRoute();
  if (sessions.length === 0) {
    return (
      <EmptyState
        icon="💬"
        title="No sessions yet"
        description={
          hasAgents
            ? "Kick off a session with one of this project's agents."
            : "Create an agent first, then start a session."
        }
        action={
          <Button
            variant="primary"
            onClick={() =>
              hasAgents ? navigate({ name: "home" }) : navigate({ name: "agentNew", projectId })
            }
          >
            {hasAgents ? "New session" : "New agent"}
          </Button>
        }
      />
    );
  }

  const running = sessions.filter((s) => s.status === "running");
  const rest = sessions.filter((s) => s.status !== "running");

  return (
    <>
      {running.length > 0 && (
        <div className="tk-group">
          <div className="tk-group__label">
            <span aria-hidden="true">🟢</span> Running
          </div>
          <div className="tk-stack">
            {running.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        </div>
      )}
      {rest.length > 0 && (
        <div className="tk-group">
          <div className="tk-group__label">
            <span aria-hidden="true">💤</span> Idle
          </div>
          <div className="tk-stack">
            {rest.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function SessionRow({ session }: { session: Session }) {
  const store = useStore();
  const { navigate } = useRoute();
  const agent = store.getAgent(session.agentId);
  const messages = store.messagesForSession(session.id);
  const last = messages[messages.length - 1];
  const preview = last?.content.replace(/\s+/g, " ").trim() ?? "No messages yet";

  return (
    <Card
      interactive
      accent={session.status === "running" ? "var(--running)" : undefined}
      onClick={() => navigate({ name: "session", sessionId: session.id })}
    >
      <div className="tk-session-row">
        <Avatar
          name={agent?.name ?? "Agent"}
          emoji={agent?.emoji}
          color={agent?.color}
          size="md"
          status={session.status}
          ring={agent?.isTinkers}
        />
        <div className="tk-card-grow">
          <p className="tk-card-title tk-truncate" style={{ fontSize: "var(--text-base, 15px)" }}>
            {session.title}
          </p>
          <p className="tk-session-row__preview tk-truncate">{preview}</p>
        </div>
        <div className="tk-meta" style={{ flexDirection: "column", alignItems: "flex-end", gap: "var(--sp-2)" }}>
          <StatusBadge status={session.status} />
          <span className="tk-mono">
            ⚡ {formatTokens(session.usage.totalTokens)} · {relativeTime(session.updatedAt)}
          </span>
        </div>
      </div>
    </Card>
  );
}

function AgentsTab({ projectId, agents }: { projectId: string; agents: Agent[] }) {
  const { navigate } = useRoute();
  return (
    <div className="tk-grid">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
      <button
        className="tk-new-card"
        onClick={() => navigate({ name: "agentNew", projectId })}
      >
        <span className="tk-new-card__plus" aria-hidden="true">
          ＋
        </span>
        New agent
      </button>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const store = useStore();
  const { navigate } = useRoute();
  const sessionCount = store.sessions.filter((s) => s.agentId === agent.id).length;

  return (
    <Card interactive onClick={() => navigate({ name: "agentConfig", agentId: agent.id })}>
      <div className="tk-agent-card">
        <div className="tk-card-head" style={{ marginBottom: 0 }}>
          <Avatar
            name={agent.name}
            emoji={agent.emoji}
            color={agent.color}
            size="lg"
            status={agent.status}
            ring={agent.isTinkers}
          />
          <div className="tk-card-grow">
            <p className="tk-card-title tk-truncate">{agent.name}</p>
            <span className="tk-mono tk-truncate">{agent.provider}</span>
          </div>
        </div>
        <div className="tk-chips">
          <span className="tk-chip tk-chip--mono">{agent.model}</span>
          <Badge
            kind={agent.permission === "full" ? "warning" : "info"}
            variant="soft"
          >
            {agent.permission === "full" ? "Full access" : "Read-only"}
          </Badge>
        </div>
        <div className="tk-card-foot">
          <span className="tk-meta__item">
            💬 {sessionCount} session{sessionCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </Card>
  );
}

function SettingsTab({ projectId }: { projectId: string }) {
  const store = useStore();
  const project = store.getProject(projectId);
  return (
    <Panel title="Project settings" icon={<span aria-hidden="true">⚙️</span>}>
      <div className="tk-settings-stub">
        <div className="tk-settings-stub__row">
          <span className="tk-settings-stub__label">Name</span>
          <span>{project?.name}</span>
        </div>
        <div className="tk-settings-stub__row">
          <span className="tk-settings-stub__label">Repository</span>
          <span className="tk-mono">{project?.repoPath}</span>
        </div>
        <div className="tk-settings-stub__row">
          <span className="tk-settings-stub__label">Branch</span>
          <span className="tk-mono">{project?.branch}</span>
        </div>
        <div className="tk-settings-stub__row">
          <span className="tk-settings-stub__label">Languages</span>
          <span>{project?.languages.join(", ") || "—"}</span>
        </div>
      </div>
    </Panel>
  );
}
