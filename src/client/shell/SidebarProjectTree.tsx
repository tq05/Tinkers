// Expandable project node (§B.1): project row → its agents + sessions. Sessions
// show a teal pulse dot while running. Clicking the project navigates to it;
// clicking a session opens that session.

import { useState } from "react";
import { useStore } from "../mock/store";
import { useRoute } from "../router/RouterContext";
import type { Project } from "../mock/types";
import { Avatar } from "../components/Avatar";
import { StatusDot } from "../components/StatusDot";

export function SidebarProjectTree({ project }: { project: Project }) {
  const store = useStore();
  const { route, navigate } = useRoute();

  const sessions = store.sessionsForProject(project.id);
  const agents = store.agentsForProject(project.id);
  const projectRunning = sessions.some((s) => s.status === "running");

  const projectActive = route.name === "project" && route.projectId === project.id;
  // Auto-expand when this project (or one of its sessions) is in view.
  const sessionInProject =
    route.name === "session" &&
    sessions.some((s) => s.id === route.sessionId);
  const [expanded, setExpanded] = useState<boolean>(projectActive || sessionInProject);
  const open = expanded || projectActive || sessionInProject;

  return (
    <div className="tk-tree">
      <div className={`tk-tree__row${projectActive ? " is-active" : ""}`}>
        <button
          className="tk-tree__toggle"
          aria-label={open ? "Collapse" : "Expand"}
          aria-expanded={open}
          onClick={() => setExpanded((v) => !v)}
        >
          <span className={`tk-tree__caret${open ? " is-open" : ""}`}>▸</span>
        </button>
        <button
          className="tk-tree__name"
          onClick={() => navigate({ name: "project", projectId: project.id })}
        >
          <span className="tk-tree__label">{project.name}</span>
          {projectRunning ? (
            <StatusDot status="running" size={8} />
          ) : (
            <span className="tk-tree__count">{sessions.length}</span>
          )}
        </button>
      </div>

      {open && (
        <div className="tk-tree__children">
          {agents.length === 0 && sessions.length === 0 && (
            <p className="tk-tree__empty">No agents or sessions</p>
          )}

          {agents.map((agent) => (
            <button
              key={agent.id}
              className={`tk-tree__sub${
                route.name === "agentConfig" && route.agentId === agent.id
                  ? " is-active"
                  : ""
              }`}
              onClick={() => navigate({ name: "agentConfig", agentId: agent.id })}
            >
              <Avatar
                name={agent.name}
                emoji={agent.emoji}
                color={agent.color}
                size="xs"
              />
              <span className="tk-tree__sub-label">{agent.name}</span>
            </button>
          ))}

          {sessions.map((session) => {
            const active = route.name === "session" && route.sessionId === session.id;
            return (
              <button
                key={session.id}
                className={`tk-tree__sub${active ? " is-active" : ""}`}
                onClick={() => navigate({ name: "session", sessionId: session.id })}
              >
                <span className="tk-tree__sub-ico" aria-hidden="true">
                  💬
                </span>
                <span className="tk-tree__sub-label">{session.title}</span>
                {session.status === "running" && <StatusDot status="running" size={7} />}
                {session.status === "error" && <StatusDot status="error" size={7} pulse={false} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
