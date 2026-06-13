import type { ReactNode } from "react";
import "./components.css";

export interface InputProps {
  label?: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  iconLeft?: ReactNode;
  type?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
}

export function Input({
  label,
  hint,
  error,
  value,
  onChange,
  placeholder,
  iconLeft,
  type = "text",
  onKeyDown,
  autoFocus,
}: InputProps) {
  return (
    <label className="tk-field">
      {label && <span className="tk-field__label">{label}</span>}
      <span className="tk-input-wrap">
        {iconLeft && <span className="tk-input-wrap__icon">{iconLeft}</span>}
        <input
          className={[
            "tk-input",
            iconLeft ? "tk-input--with-icon" : "",
            error ? "tk-input--error" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
        />
      </span>
      {error ? (
        <span className="tk-field__error">{error}</span>
      ) : (
        hint && <span className="tk-field__hint">{hint}</span>
      )}
    </label>
  );
}
