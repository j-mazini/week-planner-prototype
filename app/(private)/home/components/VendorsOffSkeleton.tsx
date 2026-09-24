"use client";

import React from 'react';

const ShimmerSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={`overflow-hidden bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-md ${className}`}
    />
  );
};

export function VendorsOffSkeleton() {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <ShimmerSkeleton className="h-6 w-40" />
        <ShimmerSkeleton className="h-5 w-20" />
      </div>

      {/* Skeleton items */}
      <div className="space-y-2">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
          >
            <div className="flex-1 space-y-2">
              <ShimmerSkeleton className="h-4 w-32" />
              <ShimmerSkeleton className="h-3 w-24" />
            </div>
            <div className="ml-4">
              <ShimmerSkeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
