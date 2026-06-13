import type { Usage } from "../../mock/types";
import { ProgressBar } from "../ProgressBar";
import { formatCost, formatTokens } from "../../lib/format";
import "../components.css";
import "./session.css";

export interface UsageMeterProps {
  usage: Usage;
  /** Show the live "ticking" indicator while the session streams. */
  live?: boolean;
}

export function UsageMeter({ usage, live = false }: UsageMeterProps) {
  const { inputTokens, outputTokens, totalTokens, costUsd } = usage;

  return (
    <div className="tk-usage">
      <div className="tk-usage__totals">
        <div className="tk-usage__total">
          {formatTokens(totalTokens)}
          <span className="tk-usage__total-label">tokens</span>
        </div>
        <div className="tk-usage__cost">{formatCost(costUsd)}</div>
      </div>

      <ProgressBar
        height={10}
        segments={[
          { value: inputTokens, color: "var(--chart-1)", label: `Input · ${inputTokens}` },
          { value: outputTokens, color: "var(--chart-2)", label: `Output · ${outputTokens}` },
        ]}
      />

      <div className="tk-usage__legend">
        <span className="tk-usage__leg">
          <span className="tk-usage__swatch" style={{ background: "var(--chart-1)" }} />
          Input <strong>{formatTokens(inputTokens)}</strong>
        </span>
        <span className="tk-usage__leg">
          <span className="tk-usage__swatch" style={{ background: "var(--chart-2)" }} />
          Output <strong>{formatTokens(outputTokens)}</strong>
        </span>
      </div>

      {live && (
        <span className="tk-usage__live" role="status" aria-live="polite">
          <span className="tk-dot tk-dot--pulse" style={{ width: 8, height: 8, background: "var(--running)" }} />
          Live · counting tokens…
        </span>
      )}
    </div>
  );
}
