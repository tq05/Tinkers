import type { ReactNode } from "react";
import "./components.css";

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="tk-kbd">{children}</kbd>;
}
