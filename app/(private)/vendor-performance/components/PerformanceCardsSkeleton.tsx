"use client";

import { memo } from 'react';

const SKELETON_CARDS = 6;

/**
 * Skeleton for mobile vendor cards — masks loading with card-shaped placeholders.
 */
export const PerformanceCardsSkeleton = memo(function PerformanceCardsSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: SKELETON_CARDS }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm animate-pulse"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 w-28 rounded bg-slate-200/80" />
              <div className="h-3 w-40 rounded bg-slate-200/60" />
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-200/80 shrink-0" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="space-y-1">
                <div className="h-3 w-12 rounded bg-slate-200/60" />
                <div className="h-4 w-14 rounded bg-slate-200/80" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});
