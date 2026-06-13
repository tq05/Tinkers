import { useState } from "react";
import { Button } from "../Button";
import { Textarea } from "../Textarea";
import { Kbd } from "../Kbd";
import "../components.css";
import "./session.css";

export interface ComposerProps {
  /** Send the composed text. Cleared on success. */
  onSend: (text: string) => void;
  /** Stop the running session (shown in place of Send while running). */
  onStop?: () => void;
  /** True while the agent is streaming — swaps Send → Stop. */
  running?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function Composer({
  onSend,
  onStop,
  running = false,
  disabled = false,
  placeholder = "Message the agent…  (↵ to send · ⇧↵ for newline)",
}: ComposerProps) {
  const [text, setText] = useState("");
  const canSend = text.trim().length > 0 && !disabled;

  const submit = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="tk-composer">
      <div className="tk-composer__row">
        <div className="tk-composer__field">
          <Textarea
            value={text}
            onChange={setText}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            rows={2}
          />
        </div>
        {running ? (
          <Button variant="danger" onClick={onStop} iconLeft={<span aria-hidden="true">■</span>}>
            Stop
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={submit}
            disabled={!canSend}
            iconLeft={<span aria-hidden="true">➤</span>}
          >
            Send
          </Button>
        )}
      </div>
      <div className="tk-composer__hint">
        {running ? (
          <span role="status" aria-live="polite">
            Agent is responding… press Stop to interrupt.
          </span>
        ) : (
          <>
            <Kbd>↵</Kbd> send · <Kbd>⇧↵</Kbd> newline
          </>
        )}
      </div>
    </div>
  );
}
