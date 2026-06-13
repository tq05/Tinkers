import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useStore } from "../mock/store";
import { useRoute } from "../router/RouterContext";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { FileTree } from "../components/FileTree";
import { StatusBadge } from "../components/StatusBadge";
import { Tabs } from "../components/Tabs";
import { MessageBubble } from "../components/session/MessageBubble";
import { ToolCallRow } from "../components/session/ToolCallRow";
import { UsageMeter } from "../components/session/UsageMeter";
import { Composer } from "../components/session/Composer";
import "../components/session/session.css";

type RailTab = "tools" | "usage";
type ToolFilter = "all" | "running" | "errors";

export function SessionScreen() {
  const store = useStore();
  const { route, navigate } = useRoute();
  const sessionId = route.name === "session" ? route.sessionId : undefined;
  const session = sessionId ? store.getSession(sessionId) : undefined;

  const [railTab, setRailTab] = useState<RailTab>("tools");
  const [toolFilter, setToolFilter] = useState<ToolFilter>("all");
  const [selectedPath, setSelectedPath] = useState<string | undefined>();
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // ── Auto-scroll transcript + "jump to latest" pill ──────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);

  const messages = session ? store.messagesForSession(session.id) : [];
  const streamingContent = messages.map((m) => m.content).join("");

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setPinned(atBottom);
  };

  useLayoutEffect(() => {
    if (!pinned) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    // re-run while streaming appends content
  }, [messages.length, streamingContent, pinned, sessionId]);

  // reset transient UI when switching sessions
  useEffect(() => {
    setSelectedPath(undefined);
    setPinned(true);
    setLeftOpen(false);
    setRightOpen(false);
  }, [sessionId]);

  if (!session) {
    return (
      <div className="tk-session">
        <EmptyState
          icon="🧭"
          title="Session not found"
          description="This session may have been closed. Pick another from the sidebar."
          action={<Button variant="primary" onClick={() => navigate({ name: "home" })}>Go home</Button>}
        />
      </div>
    );
  }

  const agent = store.getAgent(session.agentId);
  const running = session.status === "running";
  const fileNodes = store.fileTreeForProject(session.projectId);
  const toolCalls = store.toolCallsForSession(session.id);
  const filteredTools = toolCalls.filter((t) =>
    toolFilter === "all" ? true : toolFilter === "running" ? t.status === "running" : t.status === "error",
  );
  const runningCount = toolCalls.filter((t) => t.status === "running").length;
  const errorCount = toolCalls.filter((t) => t.status === "error").length;

  const permissionLabel = agent?.permission === "full" ? "Full access" : "Read-only";

  return (
    <div className="tk-session">
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="tk-session__header">
        <div className="tk-session__id">
          {agent && (
            <Avatar
              name={agent.name}
              emoji={agent.emoji}
              color={agent.color}
              size="md"
              status={session.status}
              ring={agent.isTinkers || running}
            />
          )}
          <div className="tk-session__titles">
            <span className="tk-session__title">{session.title}</span>
            <span className="tk-session__sub">
              {agent && <span>{agent.name}</span>}
              {agent && <span className="tk-chip">{agent.model}</span>}
              {agent && (
                <Badge kind={agent.permission === "full" ? "warning" : "idle"} variant="soft">
                  {permissionLabel}
                </Badge>
              )}
            </span>
          </div>
        </div>

        <span className="tk-session__spacer" />

        <div className="tk-session__header-actions">
          <button
            className="tk-btn tk-btn--ghost tk-btn--sm tk-session__drawer-toggle"
            onClick={() => setLeftOpen((o) => !o)}
            type="button"
          >
            📁 Files
          </button>
          <StatusBadge status={session.status} />
          {running && (
            <Button variant="danger" onClick={() => store.stopSession(session.id)}>
              Stop
            </Button>
          )}
          <button
            className="tk-btn tk-btn--ghost tk-btn--sm tk-session__drawer-toggle"
            onClick={() => setRightOpen((o) => !o)}
            type="button"
          >
            📊 Activity
          </button>
        </div>
      </header>

      {/* ── 3-column body ────────────────────────────────────────────────────── */}
      <div className="tk-session__body">
        {(leftOpen || rightOpen) && (
          <div
            className="tk-session__scrim"
            onClick={() => {
              setLeftOpen(false);
              setRightOpen(false);
            }}
          />
        )}

        {/* Left: workspace file tree */}
        <aside className="tk-session__col tk-session__col--left" data-open={leftOpen}>
          <div className="tk-session__col-head">📂 Workspace</div>
          <div className="tk-session__col-body">
            <FileTree nodes={fileNodes} selectedPath={selectedPath} onSelect={setSelectedPath} />
          </div>
        </aside>

        {/* Center: transcript + composer */}
        <section className="tk-session__col tk-session__center">
          <div className="tk-transcript" ref={scrollRef} onScroll={onScroll}>
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                agent={m.role === "agent" ? agent : undefined}
                toolCalls={m.toolCallIds ? store.toolCallsForMessage(m.id) : undefined}
              />
            ))}
            {!pinned && (
              <div className="tk-transcript__jump">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const el = scrollRef.current;
                    if (el) el.scrollTop = el.scrollHeight;
                    setPinned(true);
                  }}
                >
                  ↓ Jump to latest
                </Button>
              </div>
            )}
          </div>
          <Composer
            running={running}
            onSend={(text) => store.sendMessage(session.id, text)}
            onStop={() => store.stopSession(session.id)}
          />
        </section>

        {/* Right rail: tool calls / usage */}
        <aside className="tk-session__col tk-session__col--right" data-open={rightOpen}>
          <div className="tk-session__rail-tabs">
            <Tabs
              active={railTab}
              onChange={(id) => setRailTab(id as RailTab)}
              items={[
                {
                  id: "tools",
                  label: "Tool calls",
                  badge: toolCalls.length > 0 ? <Badge variant="soft">{toolCalls.length}</Badge> : undefined,
                },
                { id: "usage", label: "Usage" },
              ]}
            />
          </div>
          <div className="tk-session__col-body">
            {railTab === "tools" ? (
              toolCalls.length === 0 ? (
                <EmptyState icon="🛠️" title="No tool calls yet" description="Actions the agent runs will appear here." />
              ) : (
                <>
                  <Tabs
                    active={toolFilter}
                    onChange={(id) => setToolFilter(id as ToolFilter)}
                    items={[
                      { id: "all", label: "All" },
                      {
                        id: "running",
                        label: "Running",
                        badge: runningCount > 0 ? <Badge kind="running" variant="soft">{runningCount}</Badge> : undefined,
                      },
                      {
                        id: "errors",
                        label: "Errors",
                        badge: errorCount > 0 ? <Badge kind="error" variant="soft">{errorCount}</Badge> : undefined,
                      },
                    ]}
                  />
                  <div style={{ marginTop: "var(--sp-3)" }}>
                    {filteredTools.length === 0 ? (
                      <EmptyState icon="✅" title="Nothing here" description="No tool calls match this filter." />
                    ) : (
                      filteredTools.map((tc) => (
                        <ToolCallRow key={tc.id} toolCall={tc} defaultOpen={tc.status === "error"} />
                      ))
                    )}
                  </div>
                </>
              )
            ) : (
              <UsageMeter usage={session.usage} live={running} />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
