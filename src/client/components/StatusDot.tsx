import type { StatusKind } from "../mock/types";
import "./components.css";

const STATUS_COLOR: Record<StatusKind, string> = {
  idle: "var(--idle)",
  running: "var(--running)",
  error: "var(--negative)",
  done: "var(--positive)",
  warning: "var(--warning)",
  info: "var(--info)",
};

export function statusColor(status: StatusKind): string {
  return STATUS_COLOR[status];
}

export interface StatusDotProps {
  status: StatusKind;
  size?: number;
  pulse?: boolean; // defaults to true for running
}

export function StatusDot({ status, size = 9, pulse }: StatusDotProps) {
  const shouldPulse = pulse ?? status === "running";
  return (
    <span
      className={`tk-dot${shouldPulse ? " tk-dot--pulse" : ""}`}
      style={{ width: size, height: size, background: STATUS_COLOR[status] }}
      aria-hidden="true"
    />
  );
}
