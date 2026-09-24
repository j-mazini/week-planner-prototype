"use client";

import { memo } from 'react';

const SKELETON_ROWS = 10;

function SkeletonCell({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-4 rounded bg-slate-200/80 animate-pulse ${className}`}
      aria-hidden
    />
  );
}

/**
 * Skeleton for the vendors performance table — masks loading with a stable layout
 * so the user sees the page structure instead of a spinner.
 */
export const PerformanceTableSkeleton = memo(function PerformanceTableSkeleton() {
  return (
    <>
      {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
        <tr
          key={i}
          className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
          aria-hidden
        >
          <td className="py-2.5 px-2 align-middle">
            <div className="flex flex-col items-center gap-1">
              <SkeletonCell className="w-24 h-4" />
              <SkeletonCell className="w-32 h-3" />
            </div>
          </td>
          <td className="py-2.5 px-2 align-middle text-center">
            <SkeletonCell className="w-12 h-4 mx-auto" />
          </td>
          <td className="py-2.5 px-2 align-middle text-center">
            <SkeletonCell className="w-10 h-4 mx-auto" />
          </td>
          <td className="py-2.5 px-2 align-middle text-center">
            <SkeletonCell className="w-14 h-4 mx-auto" />
          </td>
          <td className="py-2.5 px-2 align-middle text-center">
            <SkeletonCell className="w-10 h-4 mx-auto" />
          </td>
          <td className="py-2.5 px-2 align-middle text-center">
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-lg bg-slate-200/80 animate-pulse" aria-hidden />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
});
