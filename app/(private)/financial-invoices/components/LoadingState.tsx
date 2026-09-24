import React, { memo } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';

interface LoadingStateProps {
  colSpan: number;
  message?: string;
}

export const LoadingState = memo<LoadingStateProps>(({ 
  colSpan, 
  message = "Loading invoices..." 
}) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-10 text-muted-foreground animate-pulse">
        {message}
      </TableCell>
    </TableRow>
  );
});

LoadingState.displayName = 'LoadingState';

