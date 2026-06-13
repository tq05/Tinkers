// HomeScreen (§C.1) — greeting, primary CTAs, live activity strip, project grid,
// and a global-agents teaser featuring Tinkers. Mock data via useStore.

import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { StatusDot } from "../components/StatusDot";
import { formatCost, formatTokens } from "../lib/format";
import type { Project, Session, StatusKind } from "../mock/types";
import { useStore } from "../mock/store";
import { useRoute } from "../router/RouterContext";
import "./screens-overview.css";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** Aggregate a project's status from its sessions: running ≻ error ≻ idle. */
function projectStatus(sessions: Session[]): StatusKind {
  if (sessions.some((s) => s.status === "running")) return "running";
  if (sessions.some((s) => s.status === "error")) return "error";
  return "idle";
}

export function HomeScreen() {
  const store = useStore();
  const { navigate } = useRoute();
  const running = store.runningSessions();
  const tinkers = store.globalAgents().find((a) => a.isTinkers);
  const otherGlobals = store.globalAgents().filter((a) => !a.isTinkers);

  return (
    <div className="tk-screen">
      <header className="tk-screen__head">
        <div>
          <h1 className="tk-screen__greeting">{greeting()} 👋</h1>
          <p className="tk-screen__sub">
            {store.projects.length} projects · {store.agents.length} agents ·{" "}
            {running.length} running now
          </p>
        </div>
        <div className="tk-screen__actions">
          <Button
            variant="ghost"
            iconLeft={<span aria-hidden="true">🤖</span>}
            onClick={() => navigate({ name: "agentNew" })}
          >
            New agent
          </Button>
          <Button
            variant="primary"
            iconLeft={<span aria-hidden="true">＋</span>}
            onClick={() => navigate({ name: "projectNew" })}
          >
            New project
          </Button>
        </div>
      </header>

      {/* Active-sessions activity strip */}
      <section className="tk-section">
        <div className="tk-section__head">
          <h2 className="tk-section__title">Active now</h2>
          {running.length > 0 && (
            <span className="tk-section__count">
              {running.length} running session{running.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        {running.length === 0 ? (
          <EmptyState
            icon="🌙"
            title="All quiet"
            description="No sessions are running right now. Start one and the live activity will show up here."
            action={
              <Button variant="primary" onClick={() => navigate({ name: "projectNew" })}>
                New project
              </Button>
            }
          />
        ) : (
          <div className="tk-strip">
            {running.map((session) => {
              const agent = store.getAgent(session.agentId);
              const project = session.projectId
                ? store.getProject(session.projectId)
                : undefined;
              return (
                <Card
                  key={session.id}
                  interactive
                  accent="var(--running)"
                  onClick={() => navigate({ name: "session", sessionId: session.id })}
                  style={{ boxShadow: "var(--shadow-glow-running)" }}
                >
                  <div className="tk-activity-card">
                    <div className="tk-activity-card__top">
                      <Avatar
                        name={agent?.name ?? "Agent"}
                        emoji={agent?.emoji}
                        color={agent?.color}
                        size="md"
                        status="running"
                        ring={agent?.isTinkers}
                      />
                      <div className="tk-card-grow">
                        <p className="tk-card-title tk-truncate">{session.title}</p>
                        <span className="tk-mono tk-truncate">
                          {agent?.name}
                          {project ? ` · ${project.name}` : " · Global"}
                        </span>
                      </div>
                      <StatusDot status="running" />
                    </div>
                    <div className="tk-card-foot">
                      <span className="tk-activity-card__live">
                        ⚡ {formatTokens(session.usage.totalTokens)} tokens ·{" "}
                        {formatCost(session.usage.costUsd)}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate({ name: "session", sessionId: session.id })}
                      >
                        Resume
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Project grid */}
      <section className="tk-section">
        <div className="tk-section__head">
          <h2 className="tk-section__title">Projects</h2>
          <button
            className="tk-link-btn"
            onClick={() => navigate({ name: "projectNew" })}
          >
            New project →
          </button>
        </div>
        {store.projects.length === 0 ? (
          <EmptyState
            icon="📁"
            title="No projects yet"
            description="Connect a local repo to spin up agents and sessions."
            action={
              <Button variant="primary" onClick={() => navigate({ name: "projectNew" })}>
                New project
              </Button>
            }
          />
        ) : (
          <div className="tk-grid">
            {store.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* Global agents teaser */}
      <section className="tk-section">
        <div className="tk-section__head">
          <h2 className="tk-section__title">Global agents</h2>
          <button
            className="tk-link-btn"
            onClick={() => navigate({ name: "globalAgents" })}
          >
            View all →
          </button>
        </div>
        <Card
          interactive
          accent="var(--accent)"
          onClick={() => navigate({ name: "globalAgents" })}
          style={{
            background: "var(--gradient-tinkers)",
            color: "var(--fg-on-brand)",
            border: "none",
          }}
        >
          <div className="tk-card-head" style={{ marginBottom: 0 }}>
            <Avatar
              name={tinkers?.name ?? "Tinkers"}
              emoji={tinkers?.emoji ?? "✨"}
              color="var(--accent)"
              size="lg"
              ring
              status={tinkers?.status}
            />
            <div className="tk-card-grow">
              <p className="tk-card-title" style={{ color: "var(--fg-on-brand)" }}>
                ✨ Tinkers
              </p>
              <span style={{ fontSize: "var(--text-sm, 13px)", opacity: 0.95 }}>
                God-mode · full access · {otherGlobals.length} more global agents
              </span>
            </div>
            <span aria-hidden="true" style={{ fontSize: 22 }}>
              →
            </span>
          </div>
        </Card>
      </section>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const store = useStore();
  const { navigate } = useRoute();
  const agents = store.agentsForProject(project.id);
  const sessions = store.sessionsForProject(project.id);
  const status = projectStatus(sessions);

  return (
    <Card
      interactive
      accent={project.accentColor}
      onClick={() => navigate({ name: "project", projectId: project.id })}
    >
      <div className="tk-card-head">
        <div className="tk-card-grow">
          <p className="tk-card-title tk-truncate">{project.name}</p>
          <span className="tk-mono tk-truncate">{project.repoPath}</span>
        </div>
        {status !== "idle" && <StatusBadge status={status} />}
      </div>
      <div className="tk-chips">
        <span className="tk-chip tk-chip--mono">⎇ {project.branch}</span>
        {project.languages.map((lang) => (
          <span key={lang} className="tk-chip">
            {lang}
          </span>
        ))}
      </div>
      <div className="tk-card-foot">
        <div className="tk-meta">
          <span className="tk-meta__item">🤖 {agents.length} agents</span>
          <span className="tk-meta__item">💬 {sessions.length} sessions</span>
        </div>
      </div>
    </Card>
  );
}
