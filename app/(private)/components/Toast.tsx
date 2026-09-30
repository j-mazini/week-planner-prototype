"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./Toast.module.css";

type ToastOptions = { variant?: "default" | "import" };
const ToastContext = createContext<{ showToast: (message: string, options?: ToastOptions) => void } | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<ToastOptions["variant"]>("default");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const showToast = useCallback((next: string, options?: ToastOptions) => {
    clearTimeout(timer.current);
    setMessage(next);
    setVariant(options?.variant ?? "default");
    timer.current = setTimeout(() => setMessage(null), 2600);
  }, []);
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={`${styles.toast}${variant === "import" ? " " + styles.importToast : ""}`} role="status" aria-live="polite" hidden={message === null}>
        {variant === "import" && <span className={styles.successIcon} aria-hidden="true">✓</span>}
        <span>{message}</span>
        {variant === "import" && <button type="button" onClick={() => setMessage(null)} aria-label="Dismiss notification">×</button>}
      </div>
    </ToastContext.Provider>
  );
}
