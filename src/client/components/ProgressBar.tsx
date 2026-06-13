import "./components.css";

export interface ProgressSegment {
  value: number;
  color: string;
  label?: string;
}

export interface ProgressBarProps {
  segments: ProgressSegment[];
  height?: number;
}

/** Stacked proportional bar (e.g. input vs output tokens). */
export function ProgressBar({ segments, height = 8 }: ProgressBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  return (
    <div className="tk-progress" style={{ height }} role="img">
      {segments.map((s, i) => (
        <span
          key={i}
          className="tk-progress__seg"
          title={s.label}
          style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
        />
      ))}
    </div>
  );
}
