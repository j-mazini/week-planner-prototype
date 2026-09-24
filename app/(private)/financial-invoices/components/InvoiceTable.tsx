import React, { memo } from 'react';
import { TableBody } from '@/components/ui/table';
import { TableHeader } from '@/components/table-header';
import { Reveal } from './Reveal';
import { InvoiceTableRow } from './InvoiceTableRow';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { Invoice, SortField, SortDirection } from '../types';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onViewInvoice: (invoiceId: number) => void;
}

export const InvoiceTable = memo<InvoiceTableProps>(({
  invoices,
  isLoading,
  sortField,
  sortDirection,
  onSort,
  onViewInvoice
}) => {
  return (
    <Reveal className="reveal">
      <div className="
        border border-gray-200 rounded-xl 
        shadow-md bg-white 
        animate-scaleIn transition-all duration-300 
        hover:-translate-y-1 hover:shadow-lg 
        overflow-hidden
      ">
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="mb-0 align-middle w-full animate-fadeInUp">
              <thead>
                <tr>
                  <TableHeader 
                    variant="standard"
                    sortable
                    sortDirection={sortField === 'invoiceNumber' ? sortDirection : null}
                    onClick={() => onSort('invoiceNumber')}
                  >
                    Record ID
                  </TableHeader>
                  <TableHeader
                    variant="standard"
                    sortable
                    sortDirection={sortField === 'courier' ? sortDirection : null}
                    onClick={() => onSort('courier')}
                  >
                    Vendor
                  </TableHeader>
                  <TableHeader variant="standard">
                    Service Partner
                  </TableHeader>
                  <TableHeader
                    variant="standard"
                    sortable
                    sortDirection={sortField === 'referenceDate' ? sortDirection : null}
                    onClick={() => onSort('referenceDate')}
                  >
                    Period
                  </TableHeader>
                  <TableHeader 
                    variant="standard"
                    sortable
                    sortDirection={sortField === 'invoiceCreatedOn' ? sortDirection : null}
                    onClick={() => onSort('invoiceCreatedOn')}
                  >
                    Created On
                  </TableHeader>
                  <TableHeader 
                    variant="standard"
                    sortable
                    sortDirection={sortField === 'totalPayment' ? sortDirection : null}
                    onClick={() => onSort('totalPayment')}
                  >
                    Amount
                  </TableHeader>
                  <TableHeader variant="standard" className="text-right">Actions</TableHeader>

                </tr>
              </thead>
              <TableBody>
                {isLoading ? (
                  <LoadingState colSpan={7} />
                ) : invoices.length === 0 ? (
                  <EmptyState colSpan={7} />
                ) : (
                  invoices.map((invoice) => (
                    <InvoiceTableRow
                      key={invoice.invoiceId}
                      invoice={invoice}
                      onView={onViewInvoice}
                    />
                  ))
                )}
              </TableBody>
            </table>
          </div>
        </div>
      </div>
    </Reveal>
  );
});

InvoiceTable.displayName = 'InvoiceTable';

