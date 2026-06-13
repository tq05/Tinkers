import { Fragment, type ReactNode } from "react";
import type { Agent, Message, ToolCall } from "../../mock/types";
import { Avatar } from "../Avatar";
import { relativeTime } from "../../lib/format";
import "../components.css";
import "./session.css";

export interface MessageBubbleProps {
  message: Message;
  /** Agent that authored an agent message (for the avatar). */
  agent?: Agent;
  /** Tool calls attached to this turn — rendered as inline chips. */
  toolCalls?: ToolCall[];
}

const TOOL_EMOJI: Record<ToolCall["kind"], string> = {
  read: "📖",
  edit: "✏️",
  bash: "▶",
  search: "🔍",
  web: "🌐",
  write: "📝",
};

/**
 * Minimal markdown rendering: fenced ``` code blocks + inline `code`.
 * Intentionally tiny (no runtime deps) — enough for the scaffold transcript.
 */
function renderContent(content: string): ReactNode[] {
  const parts = content.split(/```/);
  return parts.map((part, i) => {
    // Odd segments are fenced code blocks; drop a leading language line.
    if (i % 2 === 1) {
      const code = part.includes("\n") ? part.replace(/^[^\n]*\n/, "") : part;
      return (
        <pre className="tk-msg__code" key={i}>
          <code>{code}</code>
        </pre>
      );
    }
    if (!part) return <Fragment key={i} />;
    const paragraphs = part.split(/\n{2,}/).filter((p) => p.trim().length > 0);
    return (
      <Fragment key={i}>
        {paragraphs.map((para, j) => (
          <p key={j}>{renderInline(para)}</p>
        ))}
      </Fragment>
    );
  });
}

function renderInline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/).map((seg, i) => {
    if (seg.startsWith("`") && seg.endsWith("`") && seg.length > 1) {
      return (
        <code className="tk-inline-code" key={i}>
          {seg.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={i}>{seg}</Fragment>;
  });
}

export function MessageBubble({ message, agent, toolCalls }: MessageBubbleProps) {
  const { role, content, streaming } = message;
  const isAgent = role === "agent";
  const showThinking = streaming && content.trim().length === 0;
  const runningChips = (toolCalls ?? []).filter((t) => t.status === "running");

  return (
    <div className={`tk-msg tk-msg--${role}`}>
      {isAgent && agent && (
        <Avatar
          name={agent.name}
          emoji={agent.emoji}
          color={agent.color}
          size="sm"
          ring={agent.isTinkers}
        />
      )}
      <div className="tk-msg__body">
        <div className="tk-msg__bubble">
          {showThinking ? (
            <span
              className="tk-thinking"
              role="status"
              aria-label="Agent is responding"
            >
              <span className="tk-thinking__dot" />
              <span className="tk-thinking__dot" />
              <span className="tk-thinking__dot" />
            </span>
          ) : (
            <>
              {renderContent(content)}
              {streaming && (
                <span
                  className="tk-msg__caret tk-msg__caret--blink"
                  aria-hidden="true"
                >
                  ▍
                </span>
              )}
            </>
          )}
        </div>

        {runningChips.length > 0 && (
          <div className="tk-msg__chips">
            {runningChips.map((tc) => (
              <span className="tk-msg__chip" key={tc.id}>
                <span aria-hidden="true">{TOOL_EMOJI[tc.kind]}</span>
                {tc.title}
              </span>
            ))}
          </div>
        )}

        {!streaming && (
          <span className="tk-msg__meta">{relativeTime(message.createdAt)}</span>
        )}
      </div>
    </div>
  );
}
