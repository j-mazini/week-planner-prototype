import React, { memo } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Invoice } from '../types';
import { formatDate, formatCurrency } from '../utils';

interface InvoiceTableRowProps {
  invoice: Invoice;
  onView: (invoiceId: number) => void;
}

export const InvoiceTableRow = memo<InvoiceTableRowProps>(({ invoice, onView }) => {
  return (
    <TableRow className="hover:bg-gray-50 transition-colors">
      <TableCell className="whitespace-nowrap text-left font-medium">
        {invoice.invoiceNumber}
      </TableCell>
      <TableCell className="whitespace-nowrap text-left">
        {invoice.courier}
      </TableCell>
      <TableCell className="whitespace-nowrap text-left text-muted-foreground text-xs">
        {invoice.servicePartnerName ?? '—'}
      </TableCell>
      <TableCell className="whitespace-nowrap text-left text-muted-foreground">
        {formatDate(invoice.referenceDate)}
      </TableCell>
      <TableCell className="whitespace-nowrap text-left text-muted-foreground">
        {formatDate(invoice.invoiceCreatedOn)}
      </TableCell>
      <TableCell className="whitespace-nowrap text-left font-semibold">
        {formatCurrency(invoice.totalPayment.toString())}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          className="hover:cursor-pointer hover:text-blue-600 hover:bg-blue-50"
          onClick={() => onView(invoice.invoiceId)}
        >
          View
        </Button>
      </TableCell>
    </TableRow>
  );
});

InvoiceTableRow.displayName = 'InvoiceTableRow';

