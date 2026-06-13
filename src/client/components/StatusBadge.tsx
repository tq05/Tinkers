import type { StatusKind } from "../mock/types";
import { Badge } from "./Badge";

const LABEL: Record<StatusKind, string> = {
  idle: "Idle",
  running: "Running",
  error: "Error",
  done: "Done",
  warning: "Warning",
  info: "Info",
};

export interface StatusBadgeProps {
  status: StatusKind;
  variant?: "soft" | "solid" | "outline";
  label?: string; // override default text
}

/**
 * Convenience over Badge: pairs the status color with a dot AND the word
 * (accessibility — never color alone). Running pulses + announces politely.
 */
export function StatusBadge({ status, variant = "soft", label }: StatusBadgeProps) {
  const text = label ?? LABEL[status];
  return (
    <span
      role={status === "running" ? "status" : undefined}
      aria-live={status === "running" ? "polite" : undefined}
    >
      <Badge kind={status} variant={variant} dot>
        {text}
      </Badge>
    </span>
  );
}
