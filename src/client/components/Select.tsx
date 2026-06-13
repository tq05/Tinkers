import "./components.css";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
}

export interface SelectProps<T extends string> {
  label?: string;
  hint?: string;
  value: T;
  onChange: (v: T) => void;
  options: SelectOption<T>[];
}

export function Select<T extends string>({
  label,
  hint,
  value,
  onChange,
  options,
}: SelectProps<T>) {
  return (
    <label className="tk-field">
      {label && <span className="tk-field__label">{label}</span>}
      <select
        className="tk-select"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.icon ? `${o.icon}  ${o.label}` : o.label}
          </option>
        ))}
      </select>
      {hint && <span className="tk-field__hint">{hint}</span>}
    </label>
  );
}
