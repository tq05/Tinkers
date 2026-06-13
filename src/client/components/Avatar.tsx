import type { CSSProperties } from "react";
import type { StatusKind } from "../mock/types";
import { colorForName, initials } from "../lib/format";
import { statusColor } from "./StatusDot";
import "./components.css";

export interface AvatarProps {
  name: string;
  emoji?: string;
  color?: string; // chart color; falls back to hash(name)
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "squircle";
  status?: StatusKind;
  ring?: boolean; // glow ring (Tinkers / running)
}

const SIZE_PX: Record<NonNullable<AvatarProps["size"]>, number> = {
  xs: 22,
  sm: 28,
  md: 38,
  lg: 52,
  xl: 72,
};

export function Avatar({
  name,
  emoji,
  color,
  size = "md",
  shape = "squircle",
  status,
  ring = false,
}: AvatarProps) {
  const px = SIZE_PX[size];
  const bg = color ?? colorForName(name);
  const radius = shape === "circle" ? "var(--radius-pill)" : "var(--radius-md)";
  const fontSize = Math.round(px * (emoji ? 0.5 : 0.4));

  const style: CSSProperties = {
    width: px,
    height: px,
    borderRadius: radius,
    background: emoji ? `color-mix(in oklch, ${bg} 22%, var(--surface))` : bg,
    fontSize,
  };

  const dotSize = Math.max(8, Math.round(px * 0.26));

  return (
    <span
      className={`tk-avatar${ring ? " tk-avatar--ring" : ""}`}
      style={style}
      title={name}
      aria-label={name}
    >
      {emoji ? <span aria-hidden="true">{emoji}</span> : initials(name)}
      {status && (
        <span
          className="tk-avatar__status"
          style={{
            width: dotSize,
            height: dotSize,
            background: statusColor(status),
          }}
        />
      )}
    </span>
  );
}
