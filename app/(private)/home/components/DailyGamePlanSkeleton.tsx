"use client";

import React from 'react';

const ShimmerSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={`overflow-hidden bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-md ${className}`}
    />
  );
};

export function DailyGamePlanSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <ShimmerSkeleton className="h-6 w-48" />
        <ShimmerSkeleton className="h-5 w-24" />
      </div>

      {/* Status groups skeleton */}
      <div className="space-y-3">
        {['waiting', 'started', 'finished'].map((status) => (
          <div key={status} className="space-y-2">
            {/* Status header */}
            <div className="flex items-center gap-2 mb-2">
              <ShimmerSkeleton className="h-4 w-4 rounded-full" />
              <ShimmerSkeleton className="h-4 w-40" />
            </div>

            {/* Deposit items */}
            <div className="space-y-2">
              {[1, 2].map((itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white"
                >
                  <div className="flex items-center gap-2">
                    <ShimmerSkeleton className="h-5 w-5 rounded-full" />
                    <ShimmerSkeleton className="h-4 w-32" />
                  </div>
                  <ShimmerSkeleton className="h-6 w-28 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
