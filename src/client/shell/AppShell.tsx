// App shell (§B.1). Sidebar + main pane layout, route→screen switch, and the
// controlled NewSessionFlow / self-gating NewProjectFlow modals. A small context
// lets any descendant (Sidebar, screens) open the New session wizard.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useRoute } from "../router/RouterContext";
import { HomeScreen } from "../screens/HomeScreen";
import { ProjectScreen } from "../screens/ProjectScreen";
import { SessionScreen } from "../screens/SessionScreen";
import { AgentConfigScreen } from "../screens/AgentConfigScreen";
import { GlobalAgentsScreen } from "../screens/GlobalAgentsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { NewProjectFlow } from "../screens/NewProjectFlow";
import { NewSessionFlow } from "../screens/NewSessionFlow";
import { Sidebar } from "./Sidebar";
import "./shell.css";

interface NewSessionRequest {
  defaultProjectId?: string;
  defaultAgentId?: string;
}

interface NewSessionContextValue {
  openNewSession: (req?: NewSessionRequest) => void;
}

const NewSessionContext = createContext<NewSessionContextValue | null>(null);

/** Open the New session wizard from anywhere inside the shell. */
export function useNewSession(): NewSessionContextValue {
  const ctx = useContext(NewSessionContext);
  if (!ctx) throw new Error("useNewSession must be used within the AppShell");
  return ctx;
}

function ActiveScreen() {
  const { route } = useRoute();
  switch (route.name) {
    case "home":
      return <HomeScreen />;
    case "project":
      return <ProjectScreen projectId={route.projectId} />;
    case "session":
      return <SessionScreen />;
    case "agentNew":
    case "agentConfig":
      // AgentConfigScreen reads the route itself (handles both modes).
      return <AgentConfigScreen />;
    case "globalAgents":
      return <GlobalAgentsScreen />;
    case "settings":
      return <SettingsScreen />;
    case "projectNew":
      // The New project wizard is a modal; render Home underneath it.
      return <HomeScreen />;
    default:
      return <HomeScreen />;
  }
}

export function AppShell() {
  const { route } = useRoute();
  const [newSession, setNewSession] = useState<{
    open: boolean;
    defaultProjectId?: string;
    defaultAgentId?: string;
  }>({ open: false });

  const openNewSession = useCallback((req?: NewSessionRequest) => {
    setNewSession({
      open: true,
      defaultProjectId: req?.defaultProjectId,
      defaultAgentId: req?.defaultAgentId,
    });
  }, []);

  const closeNewSession = useCallback(
    () => setNewSession((s) => ({ ...s, open: false })),
    [],
  );

  const ctx = useMemo<NewSessionContextValue>(() => ({ openNewSession }), [openNewSession]);

  // Default the New session project scope to the project currently in view.
  const sessionProjectDefault =
    newSession.defaultProjectId ??
    (route.name === "project" ? route.projectId : undefined);

  return (
    <NewSessionContext.Provider value={ctx}>
      <div className="tk-shell">
        <Sidebar />
        <main className="tk-shell__main">
          <ActiveScreen />
        </main>
      </div>

      {/* Self-gates on route === projectNew. */}
      <NewProjectFlow />

      {/* Controlled by shell state; reachable from the sidebar / screens. */}
      <NewSessionFlow
        open={newSession.open}
        onClose={closeNewSession}
        defaultAgentId={newSession.defaultAgentId}
        defaultProjectId={sessionProjectDefault}
      />
    </NewSessionContext.Provider>
  );
}
