'use client';
import { useState, useMemo, useEffect } from 'react';
import type { DisplayDeduction } from '../types';
import { formatMonthKey } from '../utils';

// Custom hook for debounce
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useFilters = (deductionsData: DisplayDeduction[], currentMonth: Date) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKpiFilter, setActiveKpiFilter] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState(() => formatMonthKey(new Date()));
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    setSelectedMonthFilter(formatMonthKey(currentMonth));
    // Não resetar o filtro ativo ao trocar de mês - preservar o estado do carrossel
  }, [currentMonth]);

  const handleKpiFilterChange = (filterType: string) => {
    if (filterType === 'All') {
      setActiveKpiFilter('');
    } else {
      setActiveKpiFilter(filterType);
    }
  };

  // Combined filter function - single pass through data
  const filteredData = useMemo(() => {
    const data = deductionsData;
    const loweredQuery = debouncedSearchQuery.toLowerCase();
    const hasSearchQuery = debouncedSearchQuery.length > 0;
    const hasKpiFilter = activeKpiFilter.length > 0;
    const hasDateFilter = selectedDateFilter !== null;
    const hasMonthFilter = selectedMonthFilter.length > 0 && !hasDateFilter;

    if (!hasSearchQuery && !hasKpiFilter && !hasDateFilter && !hasMonthFilter) {
      return data;
    }

    const filtered: DisplayDeduction[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      
      if (hasDateFilter) {
        if (item.dateOfIncident !== selectedDateFilter) continue;
      } else if (hasMonthFilter) {
        // Incluir installments ou itens que correspondem ao mês selecionado
        if (!item.isInstallment && (!item.dateOfIncident || !item.dateOfIncident.startsWith(selectedMonthFilter))) {
          continue;
        }
      }
      
      if (hasKpiFilter && item.type !== activeKpiFilter) continue;
      
      if (hasSearchQuery) {
        const matchesSearch = 
          item.courierName.toLowerCase().includes(loweredQuery) ||
          item.id.toLowerCase().includes(loweredQuery);
        if (!matchesSearch) continue;
      }
      
      filtered.push(item);
    }
    
    return filtered;
  }, [deductionsData, debouncedSearchQuery, activeKpiFilter, selectedDateFilter, selectedMonthFilter]);

  const dataFilteredByDateOrMonth = useMemo(() => {
    const data = deductionsData;
    const hasDateFilter = selectedDateFilter !== null;
    const hasMonthFilter = selectedMonthFilter.length > 0 && !hasDateFilter;

    if (!hasDateFilter && !hasMonthFilter) {
      return data;
    }

    const filtered: DisplayDeduction[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      
      if (hasDateFilter) {
        if (item.dateOfIncident === selectedDateFilter) {
          filtered.push(item);
        }
      } else if (hasMonthFilter) {
        if (
          (item.isInstallment) ||
          (item.dateOfIncident && item.dateOfIncident.startsWith(selectedMonthFilter))
        ) {
          filtered.push(item);
        }
      }
    }
    
    return filtered;
  }, [deductionsData, selectedDateFilter, selectedMonthFilter]);

  const tableTotalAmount = useMemo(() => {
    let total = 0;
    for (let i = 0; i < filteredData.length; i++) {
      const amount = Number(filteredData[i].amount);
      // Garantir que apenas valores válidos e positivos sejam somados
      if (!Number.isNaN(amount) && Number.isFinite(amount) && amount > 0) {
        total += amount;
      }
    }
    return total;
  }, [filteredData]);

  const kpiTotals = useMemo(() => {
    const totals: Record<string, number> = {
      Total: 0,
      'Repairs & Damages': 0,
      'Pre-Payments': 0,
      'Liquidation Damages': 0,
      'Traffic Penalties': 0,
      Other: 0
    };

    for (let i = 0; i < dataFilteredByDateOrMonth.length; i++) {
      const item = dataFilteredByDateOrMonth[i];
      const amount = Number(item.amount);
      // Garantir que apenas valores válidos e positivos sejam somados
      if (!Number.isNaN(amount) && Number.isFinite(amount) && amount > 0) {
        totals.Total += amount;
        const type = item.type;
        if (type in totals) {
          totals[type] += amount;
        }
      }
    }

    return totals;
  }, [dataFilteredByDateOrMonth]);

  return {
    searchQuery,
    setSearchQuery,
    activeKpiFilter,
    handleKpiFilterChange,
    selectedDateFilter,
    setSelectedDateFilter,
    selectedMonthFilter,
    setSelectedMonthFilter,
    filteredData,
    dataFilteredByDateOrMonth,
    tableTotalAmount,
    kpiTotals,
  };
};

