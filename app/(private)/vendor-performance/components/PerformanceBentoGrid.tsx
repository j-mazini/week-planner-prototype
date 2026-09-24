"use client";

import { memo } from "react";

interface PerformanceBentoGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Bento-style grid: responsive grid with mixed card sizes.
 */
export const PerformanceBentoGrid = memo(function PerformanceBentoGrid({
  children,
  className = "",
}: PerformanceBentoGridProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 auto-rows-fr ${className}`}
      style={{ gridAutoRows: "minmax(120px, auto)" }}
    >
      {children}
    </div>
  );
});

export const BentoCard = memo(function BentoCard({
  children,
  className = "",
  span = 1,
  rowSpan = 1,
  glass = false,
}: {
  children: React.ReactNode;
  className?: string;
  span?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
  glass?: boolean;
}) {
  const baseClasses = glass
    ? [
        "relative overflow-hidden rounded-2xl border border-border/60",
        "bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55",
        "shadow-md shadow-black/5 overflow-hidden flex flex-col",
      ].join(" ")
    : "rounded-xl border border-slate-200/60 bg-white shadow-sm overflow-hidden flex flex-col";

  return (
    <div
      className={`${baseClasses} ${className}`}
      style={{
        gridColumn: span > 1 ? `span ${span}` : undefined,
        gridRow: rowSpan > 1 ? `span ${rowSpan}` : undefined,
      }}
    >
      {glass && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-60" />
          <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(99,102,241,0.14),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.10),transparent_50%)]" />
          </div>
        </>
      )}
      {glass ? (
        <div className="relative z-10 flex flex-col flex-1 min-h-0">{children}</div>
      ) : (
        children
      )}
    </div>
  );
});
