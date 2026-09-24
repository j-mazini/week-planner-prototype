'use client';

import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = '📊',
  title, 
  subtitle,
  action
}) => {
  return (
    <div className="bg-white/90 border border-slate-200/60 rounded-2xl p-10 text-center shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur">
      {icon && (
        <div className="text-4xl mb-4 opacity-50">{icon}</div>
      )}
      <p className="text-base font-semibold text-slate-800 mb-1">{title}</p>
      {subtitle && (
        <p className="text-sm text-slate-500 mb-0">{subtitle}</p>
      )}
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  );
};

