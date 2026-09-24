import { useState, useCallback, useMemo } from 'react';
import { InsightRow } from '../types';
import { calculateRow, calculateTotalPaidStops } from '../utils';

interface UseTableSortingReturn {
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: string) => void;
  sortedData: InsightRow[];
}

export const useTableSorting = (data: InsightRow[]): UseTableSortingReturn => {
  // Default ordering requested by business: date, then route.
  const [sortField, setSortField] = useState<string | null>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const sortedData = useMemo(() => {
    if (!sortField) return data;

    const sorted = [...data].sort((a, b) => {
      let aValue: string | number | Date | null | undefined;
      let bValue: string | number | Date | null | undefined;

      if (sortField === 'total' || sortField === 'avgPerStop' || sortField === 'totalPaidStops') {
        if (sortField === 'total') {
          aValue = calculateRow(a).total;
          bValue = calculateRow(b).total;
        } else if (sortField === 'avgPerStop') {
          aValue = calculateRow(a).avgPerStop;
          bValue = calculateRow(b).avgPerStop;
        } else if (sortField === 'totalPaidStops') {
          aValue = calculateTotalPaidStops(a);
          bValue = calculateTotalPaidStops(b);
        }
      } else {
        aValue = a[sortField as keyof typeof a] as string | number | null | undefined;
        bValue = b[sortField as keyof typeof b] as string | number | null | undefined;
      }

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (sortField === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'stops' || sortField === 'rate' || sortField === 'sort' || sortField === 'adhoc' || sortField === 'extras' || sortField === 'total' || sortField === 'avgPerStop' || sortField === 'totalPaidStops') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase().trim();
        bValue = bValue.toLowerCase().trim();
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        // Already numbers
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;

      // Secondary ordering for date sorting: route name.
      if (sortField === 'date') {
        const routeA = String(a.route ?? '').toLowerCase().trim();
        const routeB = String(b.route ?? '').toLowerCase().trim();
        if (routeA < routeB) return sortDirection === 'asc' ? -1 : 1;
        if (routeA > routeB) return sortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });

    return sorted;
  }, [data, sortField, sortDirection]);

  return {
    sortField,
    sortDirection,
    handleSort,
    sortedData,
  };
};

