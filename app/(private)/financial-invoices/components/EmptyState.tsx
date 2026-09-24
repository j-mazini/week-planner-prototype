import React, { memo } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';

interface EmptyStateProps {
  colSpan: number;
  message?: string;
}

export const EmptyState = memo<EmptyStateProps>(({ 
  colSpan, 
  message = "No invoices found for this period." 
}) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-10 text-muted-foreground">
        {message}
      </TableCell>
    </TableRow>
  );
});

EmptyState.displayName = 'EmptyState';

