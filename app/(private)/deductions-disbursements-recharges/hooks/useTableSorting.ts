'use client';
import { useState, useMemo, useCallback } from 'react';
import type { DisplayDeduction } from '../types';

type SortField = 'id' | 'dateOfIncident' | 'courierName' | 'type' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  field: SortField | null;
  direction: SortDirection;
}

export const useTableSorting = (data: DisplayDeduction[]) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: null,
  });

  const handleSort = useCallback((field: SortField) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        // Se já está ordenando por este campo, alterna a direção
        if (prev.direction === 'asc') {
          return { field, direction: 'desc' };
        } else if (prev.direction === 'desc') {
          // Se já está em desc, remove a ordenação
          return { field: null, direction: null };
        }
      }
      // Novo campo, começa com asc
      return { field, direction: 'asc' };
    });
  }, []);

  const sortedData = useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      let aValue: string | number | Date | null | undefined;
      let bValue: string | number | Date | null | undefined;

      switch (sortConfig.field) {
        case 'id':
          aValue = a.id || '';
          bValue = b.id || '';
          // Tenta extrair número do ID para ordenação numérica se possível
          const aNum = typeof aValue === 'string' ? parseInt(aValue.replace(/\D/g, '')) || 0 : 0;
          const bNum = typeof bValue === 'string' ? parseInt(bValue.replace(/\D/g, '')) || 0 : 0;
          if (aNum !== 0 || bNum !== 0) {
            return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
          }
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
          break;

        case 'dateOfIncident':
          aValue = a.dateOfIncident ? new Date(a.dateOfIncident).getTime() : 0;
          bValue = b.dateOfIncident ? new Date(b.dateOfIncident).getTime() : 0;
          break;

        case 'courierName':
          aValue = (a.courierName || '').toLowerCase();
          bValue = (b.courierName || '').toLowerCase();
          break;

        case 'type':
          aValue = (a.type || '').toLowerCase();
          bValue = (b.type || '').toLowerCase();
          break;

        case 'amount':
          aValue = typeof a.amount === 'number' ? a.amount : parseFloat(String(a.amount)) || 0;
          bValue = typeof b.amount === 'number' ? b.amount : parseFloat(String(b.amount)) || 0;
          break;

        case 'status':
          aValue = (a.status || '').toLowerCase();
          bValue = (b.status || '').toLowerCase();
          break;

        default:
          return 0;
      }

      // Tratamento de valores nulos/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Comparação
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortConfig]);

  return {
    sortField: sortConfig.field,
    sortDirection: sortConfig.direction,
    handleSort,
    sortedData,
  };
};

