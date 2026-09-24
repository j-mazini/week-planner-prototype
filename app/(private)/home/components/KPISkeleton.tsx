"use client";

import React from 'react';
import { motion } from 'framer-motion';

const ShimmerSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-md ${className}`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

interface KPISkeletonProps {
  count?: number;
  isSidebarOpen?: boolean;
}

export function KPISkeleton({ count = 4, isSidebarOpen = false }: KPISkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: index * 0.05, 
            duration: 0.3 
          }}
          className={`
            w-full bg-white border border-slate-100 rounded-2xl shadow-sm 
            flex items-center gap-4 relative overflow-hidden
            ${isSidebarOpen ? 'p-3 sm:p-3.5' : 'p-3.5 sm:p-4'}
          `}
        >
          {/* Icon skeleton */}
          <ShimmerSkeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
          
          {/* Content skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            <ShimmerSkeleton className={`h-3 w-24 ${isSidebarOpen ? 'w-20' : ''}`} />
            <ShimmerSkeleton className={`h-6 ${isSidebarOpen ? 'h-5' : 'h-7'} w-32`} />
            <ShimmerSkeleton className="h-3 w-16" />
          </div>
        </motion.div>
      ))}
    </>
  );
}

