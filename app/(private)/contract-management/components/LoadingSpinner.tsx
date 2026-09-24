'use client';

import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-[3px]',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="bg-white/90 border border-slate-200/60 rounded-2xl p-8 text-center shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div 
            className={`${sizeClasses[size]} border-slate-200 border-t-blue-600 border-r-purple-600 rounded-full animate-spin`}
            role="status"
          >
            <span className="sr-only">Loading...</span>
          </div>
          <div 
            className={`${sizeClasses[size]} border-transparent border-t-pink-500 border-r-transparent rounded-full animate-spin absolute top-0 left-0`}
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          />
        </div>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
};

