import type { ReactNode } from "react";
import { Spinner } from "./Spinner";
import "./components.css";

export interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "tinkers";
  size?: "sm" | "md" | "lg";
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  title?: string;
  onClick?: () => void;
  children: ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  iconLeft,
  iconRight,
  loading = false,
  fullWidth = false,
  disabled = false,
  type = "button",
  title,
  onClick,
  children,
}: ButtonProps) {
  const className = [
    "tk-btn",
    `tk-btn--${variant}`,
    `tk-btn--${size}`,
    fullWidth ? "tk-btn--fullwidth" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={className}
      disabled={disabled || loading}
      title={title}
      onClick={onClick}
    >
      {loading ? <Spinner size={size === "lg" ? 18 : 14} /> : iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
