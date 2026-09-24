import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  /** When 'block', renders a div (for use outside tables). Default 'table' renders <tr> for table body. */
  variant?: 'table' | 'block';
  size?: 'sm' | 'md' | 'lg';
}

const spinnerContent = (message: string, size: 'sm' | 'md' | 'lg') => {
  const sizeClass = size === 'sm' ? 'w-6 h-6 border-2' : size === 'lg' ? 'w-10 h-10 border-4' : 'w-8 h-8 border-4';
  return (
    <div className="flex justify-center items-center gap-3">
      <div className={`${sizeClass} border-blue-500 border-t-transparent rounded-full animate-spin`} />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(({
  message = 'Loading records, please wait...',
  variant = 'table',
  size = 'md',
}) => {
  const content = spinnerContent(message, size);

  if (variant === 'block') {
    return (
      <div className="flex justify-center py-12 text-gray-600">
        {content}
      </div>
    );
  }

  return (
    <tr>
      <td colSpan={15} className="text-center py-8 text-gray-600">
        {content}
      </td>
    </tr>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';
