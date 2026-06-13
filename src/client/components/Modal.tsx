import { useEffect, useRef, type ReactNode } from "react";
import "./components.css";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg";
  anchor?: "center" | "top"; // "top" = command-bar style (Tinkers quick-ask)
  footer?: ReactNode;
  children: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  size = "md",
  anchor = "center",
  footer,
  children,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // focus the modal for the focus trap entry point
    ref.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`tk-modal__scrim tk-modal__scrim--${anchor === "top" ? "top" : "center"}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className={`tk-modal tk-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        {title && (
          <header className="tk-modal__head">
            <h2 className="tk-modal__title">{title}</h2>
            <button className="tk-modal__close" aria-label="Close" onClick={onClose}>
              ✕
            </button>
          </header>
        )}
        <div className="tk-modal__body">{children}</div>
        {footer && <footer className="tk-modal__footer">{footer}</footer>}
      </div>
    </div>
  );
}
