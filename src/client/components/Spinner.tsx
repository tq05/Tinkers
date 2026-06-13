import "./components.css";

export interface SpinnerProps {
  size?: number;
  color?: string;
}

export function Spinner({ size = 16, color }: SpinnerProps) {
  return (
    <span
      className="tk-spinner"
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size, color }}
    />
  );
}
