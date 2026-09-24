import { memo } from 'react';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

export const EmptyState = memo(function EmptyState({ 
  message, 
  icon 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
      {icon && <div className="text-4xl mb-3">{icon}</div>}
      <p className="text-sm">{message}</p>
    </div>
  );
});

