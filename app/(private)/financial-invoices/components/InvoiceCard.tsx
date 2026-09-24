import React, { memo } from 'react';
import { Invoice } from '../types';
import { formatDate, formatCurrency } from '../utils';

interface InvoiceCardProps {
  invoice: Invoice;
  onView: (invoiceId: number) => void;
}

export const InvoiceCard = memo<InvoiceCardProps>(({ invoice, onView }) => {
  return (
    <div 
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => onView(invoice.invoiceId)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm mb-0.5 truncate">
            {invoice.invoiceNumber}
          </h3>
          <p className="text-[10px] text-gray-500 truncate">{invoice.courier}</p>
          {invoice.servicePartnerName && (
            <p className="text-[10px] text-blue-600 truncate">{invoice.servicePartnerName}</p>
          )}
        </div>
      </div>
      <div className="space-y-1 text-[10px]">
        <div className="flex justify-between">
          <span className="text-gray-500">Period:</span>
          <span className="text-gray-800">{formatDate(invoice.referenceDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Amount:</span>
          <span className="text-gray-800 font-semibold">{formatCurrency(invoice.totalPayment.toString())}</span>
        </div>
      </div>
    </div>
  );
});

InvoiceCard.displayName = 'InvoiceCard';

