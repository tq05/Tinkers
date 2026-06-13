// NewProjectFlow (§C.7). Modal wizard: folder + name → detected repo info →
// optional first agent. Driven by the `projectNew` route; closing returns home.

import { useMemo, useState } from "react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { Select } from "../components/Select";
import { useRoute } from "../router/RouterContext";
import { useStore } from "../mock/store";
import "./screens-forms.css";

// Mock preset folders the user could "pick" — no real filesystem access.
const PRESET_FOLDERS = [
  "~/code/acme-web",
  "~/code/payments-api",
  "~/code/design-system",
  "~/projects/ml-pipeline",
  "~/work/mobile-app",
];

// Pretend repo detection keyed by folder.
const DETECTED: Record<string, { branch: string; languages: string[] }> = {
  "~/code/acme-web": { branch: "main", languages: ["TypeScript", "CSS"] },
  "~/code/payments-api": { branch: "develop", languages: ["Go", "SQL"] },
  "~/code/design-system": { branch: "main", languages: ["TypeScript", "MDX"] },
  "~/projects/ml-pipeline": { branch: "main", languages: ["Python"] },
  "~/work/mobile-app": { branch: "release", languages: ["Swift", "Kotlin"] },
};

const EMOJIS = ["🤖", "🦊", "🐙", "🦉", "🚀", "🛠️", "✨"];

export function NewProjectFlow() {
  const { route, navigate } = useRoute();
  const store = useStore();
  const open = route.name === "projectNew";

  const [step, setStep] = useState(1);
  const [folder, setFolder] = useState(PRESET_FOLDERS[0]);
  const [name, setName] = useState("");
  const [withAgent, setWithAgent] = useState(true);
  const [agentName, setAgentName] = useState("Pair Programmer");
  const [agentEmoji, setAgentEmoji] = useState("🤖");

  const detected = useMemo(() => DETECTED[folder] ?? { branch: "main", languages: [] }, [folder]);
  const derivedName = name.trim() || folder.split("/").pop() || "New project";

  const close = () => {
    setStep(1);
    navigate({ name: "home" });
  };

  const finish = () => {
    const project = store.createProject({
      name: derivedName,
      repoPath: folder,
      branch: detected.branch,
      languages: detected.languages,
    });
    if (withAgent && agentName.trim()) {
      store.createAgent(
        {
          name: agentName.trim(),
          emoji: agentEmoji,
          color: "var(--chart-1)",
          provider: "anthropic",
          model: "claude-3.7-sonnet",
          systemPrompt: "",
          permission: "read-only",
        },
        project.id,
      );
    }
    setStep(1);
    navigate({ name: "project", projectId: project.id });
  };

  const footer =
    step === 1 ? (
      <>
        <Button variant="ghost" onClick={close}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => setStep(2)}>
          Next
        </Button>
      </>
    ) : step === 2 ? (
      <>
        <Button variant="ghost" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button variant="primary" onClick={() => setStep(3)}>
          Next
        </Button>
      </>
    ) : (
      <>
        <Button variant="ghost" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button variant="primary" onClick={finish}>
          Create project
        </Button>
      </>
    );

  return (
    <Modal open={open} onClose={close} title="New project" size="md" footer={footer}>
      <div className="tk-wizard__steps" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`tk-wizard__step${step >= n ? " tk-wizard__step--on" : ""}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="tk-settings-stack">
          <Select
            label="Repository folder"
            value={folder}
            onChange={setFolder}
            options={PRESET_FOLDERS.map((f) => ({ value: f, label: f, icon: "📁" }))}
          />
          <Input
            label="Project name"
            placeholder={folder.split("/").pop()}
            value={name}
            onChange={setName}
            hint="Defaults to the folder name."
          />
        </div>
      )}

      {step === 2 && (
        <div className="tk-settings-stack">
          <p className="tk-note">📦 Detected repository details:</p>
          <div className="tk-detected">
            <div className="tk-detected__row">
              <span className="tk-detected__key">Path</span>
              <code className="tk-mono">{folder}</code>
            </div>
            <div className="tk-detected__row">
              <span className="tk-detected__key">Branch</span>
              <Badge kind="info" variant="outline">⎇ {detected.branch}</Badge>
            </div>
            <div className="tk-detected__row">
              <span className="tk-detected__key">Languages</span>
              <span className="tk-chips">
                {detected.languages.length ? (
                  detected.languages.map((l) => (
                    <Badge key={l} kind="idle">
                      {l}
                    </Badge>
                  ))
                ) : (
                  <span className="tk-field__hint">None detected</span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="tk-settings-stack">
          <label className="tk-toggle-row">
            <input
              type="checkbox"
              checked={withAgent}
              onChange={(e) => setWithAgent(e.target.checked)}
            />
            <span>
              <span className="tk-toggle-row__title">Create a first agent</span>
              <span className="tk-toggle-row__hint">Optional — get started with a default agent.</span>
            </span>
          </label>
          {withAgent && (
            <>
              <Input label="Agent name" value={agentName} onChange={setAgentName} />
              <div className="tk-field">
                <span className="tk-field__label">Avatar</span>
                <div className="tk-emoji-grid" role="radiogroup" aria-label="Agent avatar">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      role="radio"
                      aria-checked={agentEmoji === e}
                      className={`tk-emoji${agentEmoji === e ? " tk-emoji--active" : ""}`}
                      onClick={() => setAgentEmoji(e)}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
