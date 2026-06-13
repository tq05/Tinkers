// NewSessionFlow (§C.7). Controlled Modal: pick an agent, optional title, optional
// starting prompt. A prompt makes the session start running immediately. Exported
// as a self-contained component so any screen (e.g. ProjectScreen) can mount it.

import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { Select } from "../components/Select";
import { Textarea } from "../components/Textarea";
import { useRoute } from "../router/RouterContext";
import { useStore } from "../mock/store";
import "./screens-forms.css";

export interface NewSessionFlowProps {
  open: boolean;
  onClose: () => void;
  defaultAgentId?: string;
  /** Limits the selectable agents to a given project (plus global agents). */
  defaultProjectId?: string;
}

export function NewSessionFlow({
  open,
  onClose,
  defaultAgentId,
  defaultProjectId,
}: NewSessionFlowProps) {
  const { navigate } = useRoute();
  const store = useStore();

  const agentOptions = useMemo(() => {
    const projectAgents = defaultProjectId ? store.agentsForProject(defaultProjectId) : [];
    const globals = store.globalAgents();
    const seen = new Set<string>();
    const all = [...projectAgents, ...globals].filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
    return all.map((a) => ({
      value: a.id,
      label: `${a.name}${a.projectId === null ? " · global" : ""}`,
      icon: a.emoji,
    }));
  }, [store, defaultProjectId]);

  const firstAgentId = defaultAgentId ?? agentOptions[0]?.value ?? "";
  const [agentId, setAgentId] = useState(firstAgentId);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");

  // Keep selection valid when the modal (re)opens with a different default.
  const [lastDefault, setLastDefault] = useState(firstAgentId);
  if (open && firstAgentId && firstAgentId !== lastDefault && !agentId) {
    setAgentId(firstAgentId);
    setLastDefault(firstAgentId);
  }

  const canCreate = agentId.length > 0;

  const finish = () => {
    if (!canCreate) return;
    const session = store.createSession({
      agentId,
      title: title.trim() || undefined,
      prompt: prompt.trim() || undefined,
    });
    setTitle("");
    setPrompt("");
    onClose();
    navigate({ name: "session", sessionId: session.id });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New session"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!canCreate} onClick={finish}>
            {prompt.trim() ? "Start session" : "Create session"}
          </Button>
        </>
      }
    >
      <div className="tk-settings-stack">
        {agentOptions.length === 0 ? (
          <p className="tk-note">No agents available yet — create an agent first.</p>
        ) : (
          <>
            <Select
              label="Agent"
              value={agentId || firstAgentId}
              onChange={setAgentId}
              options={agentOptions}
            />
            <Input
              label="Title"
              placeholder="Optional — e.g. Fix flaky test"
              value={title}
              onChange={setTitle}
            />
            <Textarea
              label="Starting prompt"
              placeholder="Optional — provide a prompt to start the agent running right away."
              rows={4}
              value={prompt}
              onChange={setPrompt}
              hint={prompt.trim() ? "Session will start running immediately." : "Leave blank to start idle."}
            />
          </>
        )}
      </div>
    </Modal>
  );
}
