"use client";

import React from "react";
import { cn } from "@/lib/utils";

type VrnPlateProps = {
  vrn?: string | null;
  className?: string;
  size?: "xs" | "sm" | "md";
  showBadge?: boolean;
  badgeVariant?: "blue" | "green";
};

function formatUkVrn(input?: string | null): string {
  const raw = String(input ?? "").trim();
  if (!raw) return "N/A";

  // Special-case for our "no vehicle" placeholder used in week-planner.
  // We must not run the UK-VRN heuristic formatting on this token.
  if (raw.toUpperCase() === "NOVEHICLE") return "NOVEHICLE";

  // Keep existing spacing if user already provided it.
  if (/\s/.test(raw)) return raw.toUpperCase().replace(/\s+/g, " ");

  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  // Simple heuristic (not a validator): add a space before last 3 chars.
  if (s.length >= 6) return `${s.slice(0, s.length - 3)} ${s.slice(-3)}`;
  return s;
}

export function VrnPlate({
  vrn,
  className,
  size = "md",
  showBadge = true,
  badgeVariant = "blue",
}: VrnPlateProps) {
  const text = formatUkVrn(vrn);

  const sizeClasses =
    size === "xs"
      ? "text-[9px] tracking-[0.12em] px-1.5 py-0.5 rounded"
      : size === "sm"
        ? "text-[11px] tracking-[0.18em] px-2 py-1 rounded-md"
        : "text-xs tracking-[0.18em] px-2.5 py-1.5 rounded-lg";

  return (
    <span
      className={cn(
        "inline-flex items-center select-none font-mono uppercase whitespace-nowrap",
        "border border-black/70 bg-[#FEDD00] text-black shadow-sm",
        "ring-1 ring-black/10",
        sizeClasses,
        className
      )}
      title={text}
      aria-label={`VRN ${text}`}
    >
      {showBadge && (
        <span
          className={cn(
            "inline-flex h-full items-center font-semibold tracking-normal text-white",
            size === "xs"
              ? "mr-1.5 -ml-0.5 rounded px-1 py-0.5 text-[8px]"
              : "mr-2 -ml-1 rounded-md px-1.5 py-0.5 text-[10px]",
            badgeVariant === "green" ? "bg-[#16a34a]" : "bg-[#1D4ED8]"
          )}
        >
          UK
        </span>
      )}
      <span className="leading-none">{text}</span>
    </span>
  );
}

export default VrnPlate;

