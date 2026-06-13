import type { CSSProperties, ReactNode } from "react";
import "./components.css";

export interface CardProps {
  interactive?: boolean;
  accent?: string; // left border / glow color (e.g. a chart color)
  padding?: "sm" | "md" | "lg";
  onClick?: () => void;
  style?: CSSProperties;
  children: ReactNode;
}

export function Card({
  interactive = false,
  accent,
  padding = "md",
  onClick,
  style,
  children,
}: CardProps) {
  const className = [
    "tk-card",
    `tk-card--pad-${padding}`,
    interactive ? "tk-card--interactive" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const accentStyle: CSSProperties = accent
    ? { borderLeft: `4px solid ${accent}` }
    : {};

  return (
    <div
      className={className}
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive && onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{ ...accentStyle, ...style }}
    >
      {children}
    </div>
  );
}
