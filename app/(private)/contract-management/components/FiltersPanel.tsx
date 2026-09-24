'use client';

import React from 'react';

interface FiltersPanelProps {
  title?: string;
  onClear: () => void;
  children: React.ReactNode;
  /** Optional export button to display in the filter header */
  exportButton?: React.ReactNode;
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({ 
  title = 'Smart Filters', 
  onClear, 
  children,
  exportButton,
}) => {
  return (
    <div
      className={[
        "relative flex flex-col gap-4 overflow-hidden rounded-2xl",
        "border border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55",
        "p-6 text-foreground shadow-md shadow-black/5",
      ].join(" ")}
    >
      {/* Glass highlights (match ModernPageHeader) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-60" />
      <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(99,102,241,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.10),transparent_50%)]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Scope</p>
            <h3 className="text-lg font-semibold text-foreground mb-0">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {exportButton}
            <button
              className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-background/80 border border-border/60 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={onClear}
            >
              Clear
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

