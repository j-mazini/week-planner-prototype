"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./Modal.module.css";

type ModalClasses = { overlay: string; panel: string; header: string; body: string; footer: string; close?: string };

export default function Modal({ title, onClose, children, footer, classes }: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  classes: ModalClasses;
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); close.current(); }
      if (event.key !== "Tab" || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'))
        .filter((item) => !item.closest('[hidden], [inert]') && getComputedStyle(item).display !== "none" && getComputedStyle(item).visibility !== "hidden");
      const first = items[0], last = items[items.length - 1];
      if (!first) { event.preventDefault(); panel.current.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !panel.current.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panel.current.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  return (
    <div className={`${classes.overlay} ${styles.overlay}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={`${classes.panel} ${styles.panel}`} role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panel} tabIndex={-1}>
        <div className={`${classes.header} ${styles.header}`}>
          <h2 id={titleId}>{title}</h2>
          <button type="button" className={`${classes.close ?? ""} ${styles.close}`} aria-label="Close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" /></svg>
          </button>
        </div>
        <div className={`${classes.body} ${styles.body}`}>{children}</div>
        {footer && <div className={`${classes.footer} ${styles.footer}`}>{footer}</div>}
      </div>
    </div>
  );
}
