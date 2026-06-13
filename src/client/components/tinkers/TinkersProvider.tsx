// Tinkers context + global Cmd/Ctrl+K listener (§F.2). Route-independent: the
// quick-ask overlay floats above any screen. Wraps children and exposes
// useTinkers() — consumed by TinkersDock and TinkersQuickAsk.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { TinkersQuickAsk } from "./TinkersQuickAsk";

export interface TinkersContextValue {
  /** Whether the quick-ask overlay is open. */
  isOpen: boolean;
  /** Open the quick-ask overlay (optionally prefilling the prompt). */
  open: (prefill?: string) => void;
  /** Close the quick-ask overlay. */
  close: () => void;
  /** Toggle the quick-ask overlay. */
  toggle: () => void;
  /** Open the overlay prefilled with `text` (e.g. a recent prompt). */
  ask: (text: string) => void;
  /** Prefill text the overlay should adopt when it opens. */
  prefill: string;
}

const TinkersContext = createContext<TinkersContextValue | null>(null);

export function TinkersProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefill, setPrefill] = useState("");

  const open = useCallback((next?: string) => {
    setPrefill(next ?? "");
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const ask = useCallback((text: string) => {
    setPrefill(text);
    setIsOpen(true);
  }, []);

  // Global Cmd/Ctrl+K listener — summons / dismisses the overlay anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setPrefill("");
        setIsOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<TinkersContextValue>(
    () => ({ isOpen, open, close, toggle, ask, prefill }),
    [isOpen, open, close, toggle, ask, prefill],
  );

  return (
    <TinkersContext.Provider value={value}>
      {children}
      <TinkersQuickAsk />
    </TinkersContext.Provider>
  );
}

export function useTinkers(): TinkersContextValue {
  const ctx = useContext(TinkersContext);
  if (!ctx) throw new Error("useTinkers must be used within a TinkersProvider");
  return ctx;
}
