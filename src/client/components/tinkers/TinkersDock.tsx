// Persistent pinned Tinkers launcher (§F.1). Bottom-left on every screen:
// gradient pill "✨ Ask Tinkers" + ⌘K hint + status dot (pulses while a Tinkers
// session is running). Click → quick-ask overlay; caret menu → full session.

import { useEffect, useRef, useState } from "react";
import { useRoute } from "../../router/RouterContext";
import { useStore } from "../../mock/store";
import type { Agent, Session } from "../../mock/types";
import { Kbd } from "../Kbd";
import { StatusDot } from "../StatusDot";
import { useTinkers } from "./TinkersProvider";
import "./tinkers.css";

/** Find the Tinkers agent + a session to open (existing, else freshly created). */
function useTinkersTargets(): {
  agent: Agent | undefined;
  running: boolean;
  openFullSession: () => void;
} {
  const store = useStore();
  const { navigate } = useRoute();
  const agent = store.globalAgents().find((a) => a.isTinkers);

  const running =
    !!agent && store.runningSessions().some((s) => s.agentId === agent.id);

  const openFullSession = () => {
    if (!agent) return;
    const existing: Session | undefined = store.sessions.find(
      (s) => s.agentId === agent.id,
    );
    const session = existing ?? store.createSession({ agentId: agent.id });
    navigate({ name: "session", sessionId: session.id });
  };

  return { agent, running, openFullSession };
}

export function TinkersDock() {
  const { open } = useTinkers();
  const { agent, running, openFullSession } = useTinkersTargets();
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close the caret menu on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  if (!agent) return null;

  return (
    <div className="tk-dock" ref={rootRef}>
      {menuOpen && (
        <div className="tk-dock__menu" role="menu">
          <button
            className="tk-dock__menu-item"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              openFullSession();
            }}
          >
            Open full session
          </button>
          <button
            className="tk-dock__menu-item"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              open();
            }}
          >
            Quick ask…
          </button>
        </div>
      )}

      <div className="tk-dock__pill">
        <button
          className="tk-dock__main"
          onClick={() => open()}
          title="Ask Tinkers (⌘K)"
          aria-label="Ask Tinkers"
        >
          <span className="tk-dock__spark" aria-hidden="true">
            ✨
          </span>
          <span className="tk-dock__label">Ask Tinkers</span>
          <span className="tk-dock__status">
            <StatusDot status={running ? "running" : "idle"} size={8} />
          </span>
          <span className="tk-dock__kbd" aria-hidden="true">
            <Kbd>⌘K</Kbd>
          </span>
        </button>
        <button
          className="tk-dock__caret"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Tinkers menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          ▾
        </button>
      </div>
    </div>
  );
}
