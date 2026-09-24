import { useMemo, useState } from 'react';
import { Invoice, SortField, SortDirection } from '../types';

export const useInvoiceSorting = (invoices: Invoice[]) => {
  const [sortField, setSortField] = useState<SortField>('courier');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => {
      if (!sortDirection) return 0;

      let comparison = 0;
      
      switch (sortField) {
        case 'invoiceNumber':
          comparison = (a.invoiceNumber || '').localeCompare(b.invoiceNumber || '');
          break;
        case 'courier':
          comparison = (a.courier || '').toLowerCase().localeCompare((b.courier || '').toLowerCase());
          break;
        case 'referenceDate':
          comparison = new Date(a.referenceDate || 0).getTime() - new Date(b.referenceDate || 0).getTime();
          break;
        case 'invoiceCreatedOn':
          comparison = new Date(a.invoiceCreatedOn || 0).getTime() - new Date(b.invoiceCreatedOn || 0).getTime();
          break;
        case 'totalPayment':
          comparison = (a.totalPayment || 0) - (b.totalPayment || 0);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [invoices, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction: asc -> desc -> null (remove sort)
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField('courier'); // Reset to default
      } else {
        setSortDirection('asc');
      }
    } else {
      // New field, start with asc
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return {
    sortedInvoices,
    sortField,
    sortDirection,
    handleSort
  };
};

