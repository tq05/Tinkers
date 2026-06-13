import "./components.css";

export interface TextareaProps {
  label?: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  autoFocus?: boolean;
}

export function Textarea({
  label,
  hint,
  error,
  value,
  onChange,
  placeholder,
  rows = 4,
  onKeyDown,
  autoFocus,
}: TextareaProps) {
  return (
    <label className="tk-field">
      {label && <span className="tk-field__label">{label}</span>}
      <textarea
        className={["tk-textarea", error ? "tk-textarea--error" : ""].filter(Boolean).join(" ")}
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
      />
      {error ? (
        <span className="tk-field__error">{error}</span>
      ) : (
        hint && <span className="tk-field__hint">{hint}</span>
      )}
    </label>
  );
}
