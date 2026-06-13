import type { ReactNode } from "react";
import "./components.css";

export interface TooltipProps {
  label: string;
  children: ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
  return (
    <span className="tk-tooltip" tabIndex={0}>
      {children}
      <span className="tk-tooltip__bubble" role="tooltip">
        {label}
      </span>
    </span>
  );
}
