import { useState, type ReactNode } from "react";
import "./components.css";

export interface PanelProps {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  scroll?: boolean;
  style?: React.CSSProperties;
  children: ReactNode;
}

export function Panel({
  title,
  icon,
  actions,
  collapsible = false,
  defaultCollapsed = false,
  scroll = false,
  style,
  children,
}: PanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <section className="tk-panel" style={style}>
      <header className="tk-panel__head">
        <div className="tk-panel__title">
          {icon}
          {title}
        </div>
        <div className="tk-panel__actions">
          {actions}
          {collapsible && (
            <button
              className="tk-panel__caret"
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand" : "Collapse"}
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed ? "▸" : "▾"}
            </button>
          )}
        </div>
      </header>
      {!collapsed && (
        <div className={`tk-panel__body${scroll ? " tk-panel__body--scroll" : ""}`}>
          {children}
        </div>
      )}
    </section>
  );
}
