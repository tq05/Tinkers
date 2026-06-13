import { useState } from "react";
import type { ToolCall } from "../../mock/types";
import { Spinner } from "../Spinner";
import { StatusDot } from "../StatusDot";
import "../components.css";
import "./session.css";

export interface ToolCallRowProps {
  toolCall: ToolCall;
  /** Start expanded (defaults to collapsed). */
  defaultOpen?: boolean;
}

const TOOL_EMOJI: Record<ToolCall["kind"], string> = {
  read: "📖",
  edit: "✏️",
  bash: "▶",
  search: "🔍",
  web: "🌐",
  write: "📝",
};

function formatDuration(ms?: number): string {
  if (ms == null) return "";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)}s`;
}

export function ToolCallRow({ toolCall, defaultOpen = false }: ToolCallRowProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { kind, title, args, result, status, durationMs } = toolCall;
  const hasDetail = Boolean(args || result);
  const running = status === "running";

  return (
    <div className="tk-tool">
      <button
        className="tk-tool__row"
        onClick={() => hasDetail && setOpen((o) => !o)}
        aria-expanded={hasDetail ? open : undefined}
        type="button"
      >
        <span className="tk-tool__icon" aria-hidden="true">
          {TOOL_EMOJI[kind]}
        </span>
        <span className="tk-tool__title">{title}</span>
        {durationMs != null && !running && (
          <span className="tk-tool__dur">{formatDuration(durationMs)}</span>
        )}
        <span
          className="tk-tool__status"
          title={status === "done" ? "Done" : status === "error" ? "Error" : "Running"}
        >
          {running ? (
            <Spinner size={13} color="var(--running)" />
          ) : status === "error" ? (
            <StatusDot status="error" />
          ) : (
            <StatusDot status="done" pulse={false} />
          )}
        </span>
        <span className="tk-tool__caret" aria-hidden="true">
          {hasDetail ? (open ? "▾" : "▸") : ""}
        </span>
      </button>

      {open && hasDetail && (
        <div className="tk-tool__detail">
          {args && (
            <div>
              <div className="tk-tool__label">Arguments</div>
              <pre className="tk-tool__pre">{args}</pre>
            </div>
          )}
          {result && (
            <div>
              <div className="tk-tool__label">{status === "error" ? "Error" : "Result"}</div>
              <pre
                className={`tk-tool__pre${status === "error" ? " tk-tool__pre--error" : ""}`}
              >
                {result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
