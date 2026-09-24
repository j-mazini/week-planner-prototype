import { memo } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingSpinner = memo(function LoadingSpinner({ 
  size = 'md', 
  message 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full animate-spin`}></div>
      {message && (
        <div className="text-lg text-slate-500 font-medium">
          {message}
        </div>
      )}
    </div>
  );
});

