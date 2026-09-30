"use client";

import type { ButtonHTMLAttributes } from "react";

export default function ActionButton({ className = "", busy = false, disabled, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return <button {...props} type={type} className={`action-button ${className}`} aria-busy={busy || undefined} disabled={disabled || busy} />;
}
