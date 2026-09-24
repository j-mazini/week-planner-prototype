import React, { memo } from 'react';
import { InvoiceCard } from './InvoiceCard';
import { Invoice } from '../types';

interface MobileInvoiceListProps {
  invoices: Invoice[];
  isLoading: boolean;
  onViewInvoice: (invoiceId: number) => void;
}

export const MobileInvoiceList = memo<MobileInvoiceListProps>(({ 
  invoices, 
  isLoading, 
  onViewInvoice 
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-6 text-gray-600 text-xs">
        <div className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
        Loading...
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-6 text-gray-600 text-xs">
        No invoices found.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {invoices.map((invoice) => (
        <InvoiceCard
          key={invoice.invoiceId}
          invoice={invoice}
          onView={onViewInvoice}
        />
      ))}
    </div>
  );
});

MobileInvoiceList.displayName = 'MobileInvoiceList';

