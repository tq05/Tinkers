import type { ReactNode } from "react";
import "./components.css";

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon = "✨", title, description, action }: EmptyStateProps) {
  return (
    <div className="tk-empty">
      <div className="tk-empty__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="tk-empty__title">{title}</div>
      {description && <p className="tk-empty__desc">{description}</p>}
      {action}
    </div>
  );
}
