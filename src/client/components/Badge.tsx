import type { CSSProperties, ReactNode } from "react";
import type { StatusKind } from "../mock/types";
import { StatusDot, statusColor } from "./StatusDot";
import "./components.css";

export interface BadgeProps {
  kind?: StatusKind;
  variant?: "soft" | "solid" | "outline";
  dot?: boolean;
  children: ReactNode;
}

export function Badge({ kind = "info", variant = "soft", dot = false, children }: BadgeProps) {
  const color = statusColor(kind);
  let style: CSSProperties;
  if (variant === "solid") {
    style = { background: color, color: "#fff" };
  } else if (variant === "outline") {
    style = { color, border: `1px solid ${color}`, background: "transparent" };
  } else {
    style = {
      color,
      background: `color-mix(in oklch, ${color} 14%, transparent)`,
    };
  }

  return (
    <span className="tk-badge" style={style}>
      {dot && <StatusDot status={kind} size={7} />}
      {children}
    </span>
  );
}
