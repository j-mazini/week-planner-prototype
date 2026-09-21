"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface PlannerModalProps {
  title: string;
  description?: string;
  narrow?: boolean;
  primaryLabel: string;
  onCancel: () => void;
  onSubmit: () => void;
  children: ReactNode;
}

export default function PlannerModal({ title, description, narrow, primaryLabel, onCancel, onSubmit, children }: PlannerModalProps) {
  const scrimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onCancel]);

  return (
    <div
      className="scrim"
      ref={scrimRef}
      onMouseDown={(event) => {
        if (event.target === scrimRef.current) onCancel();
      }}
    >
      <div className={`dlg${narrow ? " narrow" : ""}`} role="dialog" aria-modal="true" aria-label={title.toUpperCase()}>
        <div className="dlghd">
          <h2>{title}</h2>
          <button type="button" className="xbtn" aria-label="Fechar" onClick={onCancel}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
        <div className="dlgbody">
          {description && <p className="dlgdesc">{description}</p>}
          {children}
        </div>
        <div className="dlgft">
          <button type="button" className="ghost" onClick={onCancel}>CANCEL</button>
          <button type="button" className="primary" onClick={onSubmit}>{primaryLabel}</button>
        </div>
      </div>
    </div>
  );
}
