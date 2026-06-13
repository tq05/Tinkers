// Tinkers quick-ask command bar (§F.2). Top-anchored overlay summoned via ⌘K
// (listener lives in TinkersProvider). Large input, optional context chip for
// the current route, recent prompts, and an inline mock streaming answer with
// "Continue in full session".

import { useEffect, useRef, useState } from "react";
import { useRoute } from "../../router/RouterContext";
import { useStore } from "../../mock/store";
import type { Session } from "../../mock/types";
import { recentTinkersPrompts } from "../../mock/data";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { Kbd } from "../Kbd";
import { Modal } from "../Modal";
import { Spinner } from "../Spinner";
import { useTinkers } from "./TinkersProvider";
import "./tinkers.css";

// Mock answer streamed chunk-by-chunk to demonstrate live output.
const ANSWER_CHUNKS = [
  "On it ✨ — ",
  "scanning every project and session… ",
  "Here's the short version: things look healthy, ",
  "one session is actively running. ",
  "Open a full session for the deep dive.",
];

/** Human label for the context auto-attached to the ask, based on the route. */
function useContextChip(): string | null {
  const { route } = useRoute();
  const store = useStore();
  if (route.name === "project") {
    return store.getProject(route.projectId)?.name ?? null;
  }
  if (route.name === "session") {
    return store.getSession(route.sessionId)?.title ?? null;
  }
  return null;
}

export function TinkersQuickAsk() {
  const { isOpen, close, prefill } = useTinkers();
  const { navigate } = useRoute();
  const store = useStore();
  const contextLabel = useContextChip();

  const [text, setText] = useState("");
  const [answer, setAnswer] = useState("");
  const [streaming, setStreaming] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Reset transient state each time the overlay opens; adopt any prefill.
  useEffect(() => {
    if (isOpen) {
      setText(prefill);
      setAnswer("");
      setStreaming(false);
      const id = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(id);
    }
    clearTimer();
    return undefined;
  }, [isOpen, prefill]);

  useEffect(() => () => clearTimer(), []);

  const tinkers = store.globalAgents().find((a) => a.isTinkers);

  const openFullSession = (seedPrompt?: string) => {
    if (!tinkers) return;
    const existing: Session | undefined = store.sessions.find(
      (s) => s.agentId === tinkers.id,
    );
    const session =
      existing ??
      store.createSession({ agentId: tinkers.id, prompt: seedPrompt });
    if (existing && seedPrompt) store.sendMessage(existing.id, seedPrompt);
    close();
    navigate({ name: "session", sessionId: session.id });
  };

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    setAnswer("");
    setStreaming(true);
    let i = 0;
    clearTimer();
    timerRef.current = setInterval(() => {
      if (i < ANSWER_CHUNKS.length) {
        setAnswer((prev) => prev + ANSWER_CHUNKS[i]);
        i++;
      } else {
        clearTimer();
        setStreaming(false);
      }
    }, 280);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        openFullSession(text.trim() || undefined);
      } else {
        submit();
      }
    }
  };

  if (!tinkers) return null;
  const hasAnswer = answer.length > 0 || streaming;

  return (
    <Modal open={isOpen} onClose={close} anchor="top" size="lg">
      <div className="tk-qa">
        <div className="tk-qa__head">
          <Avatar
            name={tinkers.name}
            emoji={tinkers.emoji}
            color={tinkers.color}
            size="sm"
            ring
          />
          <textarea
            ref={inputRef}
            className="tk-qa__input"
            value={text}
            rows={1}
            placeholder="Ask Tinkers anything…"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>

        <div className="tk-qa__meta">
          {contextLabel && (
            <span className="tk-qa__chip" title="Auto-attached context">
              <span aria-hidden="true">📎</span> {contextLabel}
            </span>
          )}
          <span className="tk-qa__hint">
            <Kbd>↵</Kbd> send · <Kbd>⇧↵</Kbd> open full session
          </span>
        </div>

        {hasAnswer ? (
          <div className="tk-qa__answer" aria-live="polite">
            {answer}
            {streaming && <span className="tk-qa__caret" aria-hidden="true" />}
            {streaming && (
              <span className="tk-qa__thinking">
                <Spinner size={12} /> Tinkers is responding…
              </span>
            )}
          </div>
        ) : (
          <div className="tk-qa__recent">
            <div className="tk-qa__recent-label">Recent</div>
            {recentTinkersPrompts.map((p) => (
              <button
                key={p}
                className="tk-qa__recent-item"
                onClick={() => setText(p)}
              >
                <span aria-hidden="true">🕘</span> {p}
              </button>
            ))}
          </div>
        )}

        <div className="tk-qa__actions">
          <Button variant="ghost" size="sm" onClick={close}>
            Close
          </Button>
          <Button
            variant="tinkers"
            size="sm"
            onClick={() => openFullSession(text.trim() || undefined)}
          >
            Continue in full session
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={submit}
            loading={streaming}
            disabled={!text.trim()}
          >
            Ask
          </Button>
        </div>
      </div>
    </Modal>
  );
}
