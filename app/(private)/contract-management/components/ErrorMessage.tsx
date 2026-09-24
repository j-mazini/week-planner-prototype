'use client';

import React from 'react';

interface ErrorMessageProps {
  message: string;
  title?: string;
  variant?: 'warning' | 'error';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  title,
  variant = 'warning'
}) => {
  const styles = {
    warning: {
      container: 'border-amber-200 bg-gradient-to-br from-amber-50 via-amber-50/80 to-yellow-50 text-amber-900',
      icon: 'bi-exclamation-triangle-fill',
    },
    error: {
      container: 'border-rose-200 bg-gradient-to-br from-rose-50 via-rose-50/80 to-rose-100 text-rose-900',
      icon: 'bi-x-circle-fill',
    },
  };

  const style = styles[variant];

  return (
    <div className={`flex gap-3 p-4 rounded-2xl border ${style.container} mb-6`}>
      <div className="w-10 h-10 rounded-xl bg-white/70 grid place-items-center text-lg">
        <i className={`bi ${style.icon} text-lg`} />
      </div>
      <div>
        <strong className="block text-sm mb-1">
          {title || (variant === 'warning' ? 'API Connection Warning' : 'Error loading data')}
        </strong>
        <p className="mb-0 text-xs">{message}</p>
      </div>
    </div>
  );
};

