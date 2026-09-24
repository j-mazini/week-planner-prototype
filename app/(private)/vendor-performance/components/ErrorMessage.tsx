import { memo } from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = memo(function ErrorMessage({ 
  message, 
  onRetry 
}: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <div className="flex items-center justify-between">
        <p className="text-sm">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 text-sm font-medium text-red-700 hover:text-red-800 underline"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
});

