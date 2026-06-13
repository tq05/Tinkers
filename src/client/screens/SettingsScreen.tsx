// SettingsScreen (§C.6). Tabs: Providers & Keys | Models | Appearance | About.
// All values are local UI state only — explicitly mock, nothing is persisted.

import { useState } from "react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Tabs } from "../components/Tabs";
import type { Permission, Provider } from "../mock/types";
import "./screens-forms.css";

type TabId = "keys" | "models" | "appearance" | "about";
type Theme = "light" | "dark" | "system";
type Density = "comfortable" | "compact";
type TestState = "untested" | "ok" | "fail";

const PROVIDERS: { id: Provider; label: string; placeholder: string }[] = [
  { id: "openai", label: "OpenAI", placeholder: "sk-…" },
  { id: "anthropic", label: "Anthropic", placeholder: "sk-ant-…" },
  { id: "google", label: "Google", placeholder: "AIza…" },
];

const modelsByProvider: Record<Provider, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "o3", "o4-mini"],
  anthropic: ["claude-3.7-sonnet", "claude-3.5-haiku", "claude-opus-4"],
  google: ["gemini-2.5-pro", "gemini-2.5-flash"],
};

function applyTheme(theme: Theme) {
  const el = document.documentElement;
  if (theme === "system") {
    delete el.dataset.theme;
  } else {
    el.dataset.theme = theme;
  }
}

export function SettingsScreen() {
  const [tab, setTab] = useState<TabId>("keys");

  // Providers & Keys (local only)
  const [keys, setKeys] = useState<Record<Provider, string>>({
    openai: "",
    anthropic: "",
    google: "",
  });
  const [tested, setTested] = useState<Record<Provider, TestState>>({
    openai: "untested",
    anthropic: "untested",
    google: "untested",
  });

  // Models defaults
  const [defaultProvider, setDefaultProvider] = useState<Provider>("anthropic");
  const [defaultModel, setDefaultModel] = useState<string>(modelsByProvider.anthropic[0]);
  const [defaultPermission, setDefaultPermission] = useState<Permission>("read-only");
  const [defaultPalette, setDefaultPalette] = useState<string>("var(--chart-1)");

  // Appearance
  const [theme, setTheme] = useState<Theme>("system");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [density, setDensity] = useState<Density>("comfortable");

  const handleTest = (id: Provider) => {
    setTested((prev) => ({ ...prev, [id]: keys[id].trim().length > 0 ? "ok" : "fail" }));
  };

  const setTheme2 = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
  };

  return (
    <div className="tk-form-screen">
      <header className="tk-form-screen__head">
        <div>
          <h1 className="tk-form-screen__title">Settings</h1>
          <p className="tk-form-screen__sub">Configure providers, defaults and appearance.</p>
        </div>
      </header>

      <Tabs
        active={tab}
        onChange={(id) => setTab(id as TabId)}
        items={[
          { id: "keys", label: "Providers & Keys", icon: "🔑" },
          { id: "models", label: "Models", icon: "🧠" },
          { id: "appearance", label: "Appearance", icon: "🎨" },
          { id: "about", label: "About", icon: "ℹ️" },
        ]}
      />

      <div className="tk-settings-body">
        {tab === "keys" && (
          <div className="tk-settings-stack">
            <p className="tk-note">🔒 Mock only — keys are kept in component state and never persisted or sent anywhere.</p>
            {PROVIDERS.map((p) => (
              <Card key={p.id} padding="lg">
                <div className="tk-keyrow">
                  <div className="tk-keyrow__head">
                    <span className="tk-keyrow__name">{p.label}</span>
                    {tested[p.id] === "ok" && <Badge kind="done" dot>Connected</Badge>}
                    {tested[p.id] === "fail" && <Badge kind="error" dot>No key</Badge>}
                    {tested[p.id] === "untested" && <Badge kind="idle">Untested</Badge>}
                  </div>
                  <div className="tk-keyrow__input">
                    <Input
                      type="password"
                      placeholder={p.placeholder}
                      value={keys[p.id]}
                      onChange={(v) => {
                        setKeys((prev) => ({ ...prev, [p.id]: v }));
                        setTested((prev) => ({ ...prev, [p.id]: "untested" }));
                      }}
                    />
                    <Button variant="secondary" onClick={() => handleTest(p.id)}>
                      Test
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === "models" && (
          <Card padding="lg">
            <div className="tk-settings-stack">
              <Select<Provider>
                label="Default provider"
                value={defaultProvider}
                onChange={(v) => {
                  setDefaultProvider(v);
                  setDefaultModel(modelsByProvider[v][0]);
                }}
                options={PROVIDERS.map((p) => ({ value: p.id, label: p.label }))}
              />
              <Select
                label="Default model"
                value={defaultModel}
                onChange={setDefaultModel}
                options={modelsByProvider[defaultProvider].map((m) => ({ value: m, label: m }))}
              />
              <div className="tk-field">
                <span className="tk-field__label">Default permission</span>
                <div className="tk-segmented" role="radiogroup" aria-label="Default permission">
                  {(["read-only", "full"] as Permission[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      role="radio"
                      aria-checked={defaultPermission === p}
                      className={`tk-segmented__opt${defaultPermission === p ? " tk-segmented__opt--active" : ""}`}
                      onClick={() => setDefaultPermission(p)}
                    >
                      {p === "read-only" ? "🔒 Read-only" : "🔓 Full access"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="tk-field">
                <span className="tk-field__label">Default palette</span>
                <div className="tk-swatches" role="radiogroup" aria-label="Default palette">
                  {[1, 2, 3, 4, 5, 6].map((n) => {
                    const c = `var(--chart-${n})`;
                    return (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={defaultPalette === c}
                        className={`tk-swatch${defaultPalette === c ? " tk-swatch--active" : ""}`}
                        style={{ background: c }}
                        onClick={() => setDefaultPalette(c)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        )}

        {tab === "appearance" && (
          <Card padding="lg">
            <div className="tk-settings-stack">
              <div className="tk-field">
                <span className="tk-field__label">Theme</span>
                <div className="tk-segmented" role="radiogroup" aria-label="Theme">
                  {(["light", "dark", "system"] as Theme[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={theme === t}
                      className={`tk-segmented__opt${theme === t ? " tk-segmented__opt--active" : ""}`}
                      onClick={() => setTheme2(t)}
                    >
                      {t === "light" ? "☀️ Light" : t === "dark" ? "🌙 Dark" : "🖥️ System"}
                    </button>
                  ))}
                </div>
              </div>

              <label className="tk-toggle-row">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                />
                <span>
                  <span className="tk-toggle-row__title">Reduced motion</span>
                  <span className="tk-toggle-row__hint">Minimize animations and live pulses.</span>
                </span>
              </label>

              <div className="tk-field">
                <span className="tk-field__label">Density</span>
                <div className="tk-segmented" role="radiogroup" aria-label="Density">
                  {(["comfortable", "compact"] as Density[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      role="radio"
                      aria-checked={density === d}
                      className={`tk-segmented__opt${density === d ? " tk-segmented__opt--active" : ""}`}
                      onClick={() => setDensity(d)}
                    >
                      {d === "comfortable" ? "Comfortable" : "Compact"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {tab === "about" && (
          <Card padding="lg">
            <div className="tk-settings-stack tk-about">
              <div className="tk-about__brand">
                <span className="tk-about__spark" aria-hidden="true">✨</span>
                <span className="tk-about__name">Tinkers</span>
                <Badge kind="info" variant="outline">v0.1.0</Badge>
              </div>
              <p>
                A friendly UI for the open-source{" "}
                <a className="tk-link" href="https://github.com/earendil-works/pi" target="_blank" rel="noreferrer">
                  pi agent harness
                </a>
                .
              </p>
              <p className="tk-note">
                This is a clickable design scaffold. The real pi runtime, backend services, and
                persistence are deferred to a later iteration.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
