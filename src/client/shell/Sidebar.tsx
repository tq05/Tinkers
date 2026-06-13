// Sidebar (§B.1). Two regions — PROJECTS (expandable trees) and GLOBAL AGENTS
// (flat, Tinkers pinned + starred at top) — plus top-level Home / Settings nav
// and a New session affordance.

import { useStore } from "../mock/store";
import { useRoute } from "../router/RouterContext";
import type { Route } from "../router/routes";
import { Avatar } from "../components/Avatar";
import { StatusDot } from "../components/StatusDot";
import { SidebarProjectTree } from "./SidebarProjectTree";
import { useNewSession } from "./AppShell";

function isActive(route: Route, target: Route): boolean {
  return route.name === target.name;
}

export function Sidebar() {
  const store = useStore();
  const { route, navigate } = useRoute();
  const { openNewSession } = useNewSession();

  const globals = store.globalAgents();

  return (
    <aside className="tk-sidebar" aria-label="Primary navigation">
      <div className="tk-sidebar__brand">
        <span className="tk-sidebar__brand-mark" aria-hidden="true">
          ✨
        </span>
        <span className="tk-sidebar__brand-name">Tinkers</span>
      </div>

      <nav className="tk-sidebar__top">
        <button
          className={`tk-navitem${isActive(route, { name: "home" }) ? " is-active" : ""}`}
          onClick={() => navigate({ name: "home" })}
        >
          <span className="tk-navitem__ico" aria-hidden="true">
            ⌂
          </span>
          <span className="tk-navitem__label">Home</span>
        </button>
        <button
          className={`tk-navitem${
            isActive(route, { name: "settings" }) ? " is-active" : ""
          }`}
          onClick={() => navigate({ name: "settings" })}
        >
          <span className="tk-navitem__ico" aria-hidden="true">
            ⚙
          </span>
          <span className="tk-navitem__label">Settings</span>
        </button>
        <button className="tk-navitem" onClick={() => openNewSession()}>
          <span className="tk-navitem__ico" aria-hidden="true">
            ＋
          </span>
          <span className="tk-navitem__label">New session</span>
        </button>
      </nav>

      <div className="tk-sidebar__scroll">
        {/* PROJECTS ───────────────────────────────────────────── */}
        <div className="tk-sidebar__section">
          <div className="tk-sidebar__heading">
            <span>Projects</span>
            <button
              className="tk-sidebar__add"
              title="New project"
              aria-label="New project"
              onClick={() => navigate({ name: "projectNew" })}
            >
              ＋
            </button>
          </div>
          {store.projects.length === 0 ? (
            <p className="tk-sidebar__empty">No projects yet</p>
          ) : (
            store.projects.map((p) => <SidebarProjectTree key={p.id} project={p} />)
          )}
        </div>

        {/* GLOBAL AGENTS ──────────────────────────────────────── */}
        <div className="tk-sidebar__section">
          <div className="tk-sidebar__heading">
            <span>Global agents</span>
            <button
              className="tk-sidebar__add"
              title="New global agent"
              aria-label="New global agent"
              onClick={() => navigate({ name: "agentNew" })}
            >
              ＋
            </button>
          </div>
          <button
            className={`tk-navitem tk-navitem--sub${
              route.name === "globalAgents" ? " is-active" : ""
            }`}
            onClick={() => navigate({ name: "globalAgents" })}
          >
            <span className="tk-navitem__ico" aria-hidden="true">
              ✦
            </span>
            <span className="tk-navitem__label">All global agents</span>
          </button>
          {globals.map((agent) => {
            const running = store
              .runningSessions()
              .some((s) => s.agentId === agent.id);
            const active =
              route.name === "agentConfig" && route.agentId === agent.id;
            return (
              <button
                key={agent.id}
                className={`tk-agentrow${agent.isTinkers ? " is-tinkers" : ""}${
                  active ? " is-active" : ""
                }`}
                onClick={() => navigate({ name: "agentConfig", agentId: agent.id })}
              >
                <Avatar
                  name={agent.name}
                  emoji={agent.emoji}
                  color={agent.color}
                  size="xs"
                  ring={agent.isTinkers}
                />
                <span className="tk-agentrow__name">
                  {agent.isTinkers && (
                    <span className="tk-agentrow__star" aria-hidden="true">
                      ★
                    </span>
                  )}
                  {agent.name}
                </span>
                {running && <StatusDot status="running" size={8} />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
