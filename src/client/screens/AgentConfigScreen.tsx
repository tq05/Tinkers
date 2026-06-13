// AgentConfigScreen (§C.4 + §E). Create (`agentNew`) / edit (`agentConfig`) an
// agent against the mock store, with a live-updating preview card.

import { useMemo, useState } from "react";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Textarea } from "../components/Textarea";
import { useRoute } from "../router/RouterContext";
import { useStore } from "../mock/store";
import type { AgentDraft, Permission, Provider } from "../mock/types";
import "./screens-forms.css";

// §E — model options swap by provider.
const modelsByProvider: Record<Provider, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "o3", "o4-mini"],
  anthropic: ["claude-3.7-sonnet", "claude-3.5-haiku", "claude-opus-4"],
  google: ["gemini-2.5-pro", "gemini-2.5-flash"],
};

const PROVIDER_OPTIONS: { value: Provider; label: string; icon: string }[] = [
  { value: "openai", label: "OpenAI", icon: "🟢" },
  { value: "anthropic", label: "Anthropic", icon: "🟣" },
  { value: "google", label: "Google", icon: "🔵" },
];

const EMOJIS = ["🤖", "🦊", "🐙", "🦉", "🐝", "🦄", "🐳", "🦦", "🚀", "🛠️", "✨", "🧪", "📦", "🎯", "🧠", "⚡"];
const SWATCHES = [1, 2, 3, 4, 5, 6].map((n) => `var(--chart-${n})`);

const PROMPT_MAX = 1200;

function emptyDraft(): AgentDraft {
  return {
    name: "",
    emoji: "🤖",
    color: "var(--chart-1)",
    provider: "anthropic",
    model: modelsByProvider.anthropic[0],
    systemPrompt: "",
    permission: "read-only",
  };
}

export function AgentConfigScreen() {
  const { route, navigate } = useRoute();
  const store = useStore();

  const editing = route.name === "agentConfig";
  const existing = editing ? store.getAgent(route.agentId) : undefined;
  const projectId = route.name === "agentNew" ? route.projectId : existing?.projectId ?? undefined;

  const [draft, setDraft] = useState<AgentDraft>(() =>
    existing
      ? {
          name: existing.name,
          emoji: existing.emoji,
          color: existing.color,
          provider: existing.provider,
          model: existing.model,
          systemPrompt: existing.systemPrompt,
          permission: existing.permission,
        }
      : emptyDraft(),
  );

  const set = <K extends keyof AgentDraft>(key: K, value: AgentDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setProvider = (provider: Provider) =>
    setDraft((d) => ({ ...d, provider, model: modelsByProvider[provider][0] }));

  const modelOptions = useMemo(
    () => modelsByProvider[draft.provider].map((m) => ({ value: m, label: m })),
    [draft.provider],
  );

  const nameValid = draft.name.trim().length > 0;

  const handleSave = () => {
    if (!nameValid) return;
    if (editing) {
      // No update mutator in the mock store; navigate back to scope after "saving".
      navigate(projectId ? { name: "project", projectId } : { name: "globalAgents" });
      return;
    }
    store.createAgent(draft, projectId ?? null);
    navigate(projectId ? { name: "project", projectId } : { name: "globalAgents" });
  };

  if (editing && !existing) {
    return (
      <div className="tk-form-screen">
        <p className="tk-form-screen__missing">Agent not found.</p>
        <Button variant="secondary" onClick={() => navigate({ name: "globalAgents" })}>
          Back to global agents
        </Button>
      </div>
    );
  }

  return (
    <div className="tk-form-screen">
      <header className="tk-form-screen__head">
        <div>
          <h1 className="tk-form-screen__title">
            {editing ? `Configure ${existing?.name}` : "New agent"}
          </h1>
          <p className="tk-form-screen__sub">
            {projectId ? "Project agent" : "Global agent"} · define its personality and access.
          </p>
        </div>
        <div className="tk-form-screen__head-actions">
          <Button variant="ghost" onClick={() => navigate(projectId ? { name: "project", projectId } : { name: "globalAgents" })}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!nameValid} onClick={handleSave}>
            {editing ? "Save changes" : "Create agent"}
          </Button>
        </div>
      </header>

      <div className="tk-form-screen__grid">
        <div className="tk-form-fields">
          <Input
            label="Name"
            placeholder="e.g. Refactor Buddy"
            value={draft.name}
            onChange={(v) => set("name", v)}
            autoFocus
          />

          <div className="tk-field">
            <span className="tk-field__label">Avatar</span>
            <div className="tk-emoji-grid" role="radiogroup" aria-label="Avatar emoji">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  role="radio"
                  aria-checked={draft.emoji === e}
                  className={`tk-emoji${draft.emoji === e ? " tk-emoji--active" : ""}`}
                  onClick={() => set("emoji", e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="tk-field">
            <span className="tk-field__label">Color</span>
            <div className="tk-swatches" role="radiogroup" aria-label="Avatar color">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={draft.color === c}
                  className={`tk-swatch${draft.color === c ? " tk-swatch--active" : ""}`}
                  style={{ background: c }}
                  onClick={() => set("color", c)}
                />
              ))}
            </div>
          </div>

          <div className="tk-form-row">
            <Select<Provider>
              label="Provider"
              value={draft.provider}
              onChange={setProvider}
              options={PROVIDER_OPTIONS}
            />
            <Select
              label="Model"
              value={draft.model}
              onChange={(v) => set("model", v)}
              options={modelOptions}
            />
          </div>

          <Textarea
            label="System prompt / personality"
            placeholder="Describe how this agent should behave…"
            rows={6}
            value={draft.systemPrompt}
            onChange={(v) => set("systemPrompt", v.slice(0, PROMPT_MAX))}
            hint={`${draft.systemPrompt.length} / ${PROMPT_MAX}`}
          />

          <div className="tk-field">
            <span className="tk-field__label">Permission scope</span>
            <div className="tk-segmented" role="radiogroup" aria-label="Permission scope">
              {(["read-only", "full"] as Permission[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={draft.permission === p}
                  className={`tk-segmented__opt${draft.permission === p ? " tk-segmented__opt--active" : ""}`}
                  onClick={() => set("permission", p)}
                >
                  {p === "read-only" ? "🔒 Read-only" : "🔓 Full access"}
                </button>
              ))}
            </div>
            {draft.permission === "full" && (
              <div className="tk-caution" role="note">
                <span aria-hidden="true">⚠️</span>
                <span>
                  Full access lets this agent edit files and run commands in the repo. Grant only to
                  agents you trust.
                </span>
              </div>
            )}
          </div>
        </div>

        <aside className="tk-form-preview">
          <span className="tk-form-preview__label">Live preview</span>
          <Card padding="lg" accent={draft.color}>
            <div className="tk-preview-card">
              <Avatar
                name={draft.name || "New agent"}
                emoji={draft.emoji}
                color={draft.color}
                size="lg"
                ring={draft.permission === "full"}
              />
              <div className="tk-preview-card__body">
                <div className="tk-preview-card__name">{draft.name || "New agent"}</div>
                <div className="tk-preview-card__chips">
                  <Badge kind="info" variant="outline">
                    {draft.model}
                  </Badge>
                  <Badge kind={draft.permission === "full" ? "warning" : "idle"}>
                    {draft.permission === "full" ? "Full access" : "Read-only"}
                  </Badge>
                </div>
                {draft.systemPrompt.trim() && (
                  <p className="tk-preview-card__prompt">{draft.systemPrompt.trim()}</p>
                )}
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
