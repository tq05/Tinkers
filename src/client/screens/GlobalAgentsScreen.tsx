// GlobalAgentsScreen (§C.5) — Tinkers hero at top + grid of other global agents
// and a "New global agent" CTA card.

import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Kbd } from "../components/Kbd";
import { StatusBadge } from "../components/StatusBadge";
import type { Agent } from "../mock/types";
import { useStore } from "../mock/store";
import { useRoute } from "../router/RouterContext";
import "./screens-overview.css";

export function GlobalAgentsScreen() {
  const store = useStore();
  const { navigate } = useRoute();
  const globals = store.globalAgents();
  const tinkers = globals.find((a) => a.isTinkers);
  const others = globals.filter((a) => !a.isTinkers);
  const tinkersSession = tinkers
    ? store.sessions.find((s) => s.agentId === tinkers.id)
    : undefined;

  return (
    <div className="tk-screen">
      <header className="tk-screen__head">
        <div>
          <h1 className="tk-screen__greeting">Global agents</h1>
          <p className="tk-screen__sub">
            Overarching agents that aren't tied to any single project.
          </p>
        </div>
      </header>

      {tinkers && (
        <div className="tk-tinkers-hero">
          <div className="tk-tinkers-hero__glow" aria-hidden="true">
            ✨
          </div>
          <div className="tk-tinkers-hero__body">
            <span className="tk-tinkers-hero__tag">⭐ Flagship · always-on</span>
            <h2 className="tk-tinkers-hero__title">
              {tinkers.name}
              <StatusBadge status={tinkers.status} variant="solid" />
            </h2>
            <p className="tk-tinkers-hero__copy">
              God-mode · full access to every project, file and tool. Summon Tinkers
              from anywhere — a full dedicated session or the quick-ask command bar.
            </p>
            <div className="tk-tinkers-hero__actions">
              <Button
                variant="secondary"
                onClick={() =>
                  tinkersSession
                    ? navigate({ name: "session", sessionId: tinkersSession.id })
                    : navigate({ name: "agentConfig", agentId: tinkers.id })
                }
              >
                Open Tinkers
              </Button>
              <Button
                variant="ghost"
                iconRight={<Kbd>⌘K</Kbd>}
                onClick={() => navigate({ name: "agentConfig", agentId: tinkers.id })}
              >
                Quick ask
              </Button>
            </div>
          </div>
        </div>
      )}

      <section className="tk-section">
        <div className="tk-section__head">
          <h2 className="tk-section__title">Other global agents</h2>
          <span className="tk-section__count">
            {others.length} agent{others.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="tk-grid">
          {others.map((agent) => (
            <GlobalAgentCard key={agent.id} agent={agent} />
          ))}
          <button className="tk-new-card" onClick={() => navigate({ name: "agentNew" })}>
            <span className="tk-new-card__plus" aria-hidden="true">
              ＋
            </span>
            New global agent
          </button>
        </div>
      </section>
    </div>
  );
}

function GlobalAgentCard({ agent }: { agent: Agent }) {
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
          />
          <div className="tk-card-grow">
            <p className="tk-card-title tk-truncate">{agent.name}</p>
            <span className="tk-mono tk-truncate">{agent.provider}</span>
          </div>
          {agent.status !== "idle" && <StatusBadge status={agent.status} />}
        </div>
        <div className="tk-chips">
          <span className="tk-chip tk-chip--mono">{agent.model}</span>
          <Badge kind={agent.permission === "full" ? "warning" : "info"} variant="soft">
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
