"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

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
  const [mounted, setMounted] = useState(false);

  useBodyScrollLock(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onCancel]);

  const overlay = (
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
          <button type="button" className="xbtn" aria-label="Close" onClick={onCancel}>
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

  // Hosted on <body>, not inside the page shell. The scrim is `position: fixed`,
  // so any transformed ancestor becomes its containing block and it stops
  // covering the viewport — which is exactly what the shell's entrance animation
  // used to do. Portalling makes that impossible to regress. Out here the scrim
  // no longer inherits the screen's tokens through the tree, so styles.css names
  // `.scrim` alongside `.week-planner-page` wherever that scope is declared.
  if (!mounted) return null;
  return createPortal(overlay, document.body);
}
