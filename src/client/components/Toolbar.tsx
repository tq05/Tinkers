import type { CSSProperties, ReactNode } from "react";
import "./components.css";

export interface ToolbarProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function Toolbar({ children, style }: ToolbarProps) {
  return (
    <div className="tk-toolbar" style={style}>
      {children}
    </div>
  );
}

/** Pushes subsequent toolbar items to the right. */
export function ToolbarSpacer() {
  return <div className="tk-toolbar__spacer" />;
}
