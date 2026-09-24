'use client';
import React, { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { ModernPageHeader, type Metric } from '@/components/modern-page-header';
import MonthSelector from './MonthSelector';
import type { DisplayDeduction } from '../types';
import type { KPICard } from '../constants';
import { formatCurrency } from '../formState';
import { useTableSorting } from '../hooks/useTableSorting';
import ServicePartnerBadge from '@/components/service-partner-badge';

interface MobileViewProps {
  currentMonth: Date;
  onMonthChange: (newMonth: Date) => void;
  kpiCards: KPICard[];
  kpiTotals: Record<string, number>;
  activeKpiFilter: string;
  onKpiFilterChange: (filterType: string) => void;
  onOpenModalForNewEntry: (type: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredData: DisplayDeduction[];
  tableTotalAmount: number;
  loading: boolean;
  error: string | null;
  onView: (item: DisplayDeduction) => void | Promise<void>;
  onEdit: (item: DisplayDeduction) => void | Promise<void>;
  onDelete: (item: DisplayDeduction) => void;
  servicePartners?: Array<{ servicePartnerId: number; partnerName: string }>;
  servicePartnerNameByUserId?: Map<number, string>;
  selectedServicePartnerId?: string;
  onServicePartnerChange?: (value: string) => void;
}

const MobileView = memo(function MobileView({
  currentMonth,
  onMonthChange,
  kpiCards,
  kpiTotals,
  activeKpiFilter,
  onKpiFilterChange,
  onOpenModalForNewEntry,
  searchQuery,
  onSearchChange,
  filteredData,
  tableTotalAmount,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  servicePartners = [],
  servicePartnerNameByUserId,
  selectedServicePartnerId = '',
  onServicePartnerChange,
}: MobileViewProps) {
  const { sortedData } = useTableSorting(filteredData);

  // Calcular métricas para o header
  const headerMetrics: Metric[] = useMemo(() => {
    const totalRecords = filteredData.length;
    const uniqueTypes = new Set(filteredData.map(d => d.type).filter(Boolean)).size;
    const uniqueCouriers = new Set(filteredData.map(d => d.courierName).filter(Boolean)).size;
    return [
      { label: 'Total Records', value: totalRecords },
      { label: 'Total Amount', value: `£${tableTotalAmount.toFixed(2)}` },
      { label: 'Types', value: uniqueTypes },
      { label: 'Couriers', value: uniqueCouriers },
    ];
  }, [filteredData, tableTotalAmount]);

  // Formatar subtitle com o mês selecionado
  const subtitle = useMemo(() => {
    return `Period: ${format(currentMonth, 'MMM yyyy')}`;
  }, [currentMonth]);

  return (
    <div className="pt-16 pb-20 space-y-[clamp(8px,1vw,12px)]">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-white/90 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="mb-4">
        <ModernPageHeader
          title="Deductions & Recharges"
          subtitle={subtitle}
          metrics={headerMetrics}
          gradientFrom="slate-900"
          gradientTo="indigo-600"
          metricsLayout="grid2x2"
        />
      </div>

      {/* Month Selector + Service Partner Filter */}
      <div className="bg-white rounded-lg p-3 shadow-sm">
        <div className="flex justify-center items-center gap-2 flex-wrap">
          {servicePartners.length > 0 && onServicePartnerChange && (
            <select
              value={selectedServicePartnerId}
              onChange={(e) => onServicePartnerChange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-44"
            >
              <option value="">All Service Partners</option>
              {servicePartners.map((sp) => (
                <option key={sp.servicePartnerId} value={String(sp.servicePartnerId)}>
                  {sp.partnerName}
                </option>
              ))}
            </select>
          )}
          <MonthSelector
            currentMonth={currentMonth}
            onMonthChange={onMonthChange}
          />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-2">
        {kpiCards.filter(card => card.filterType !== 'All').map((card) => (
          <div
            key={card.filterType}
            className={`bg-white rounded-lg p-2.5 shadow-sm border transition-colors ${
              activeKpiFilter === card.filterType ? 'border-gray-300' : 'border-transparent'
            }`}
            onClick={() => onKpiFilterChange(card.filterType)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500 truncate">{card.filterType}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenModalForNewEntry(card.filterType);
                }}
                className="text-blue-500 p-0.5 hover:text-blue-600"
              >
                <i className="bi bi-plus-lg text-xs"></i>
              </button>
            </div>
            <div className="text-base font-bold text-gray-800">
              {formatCurrency(String(kpiTotals[card.filterType] || 0))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-xs">
          <i className="bi bi-exclamation-triangle-fill me-1" />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg p-3 shadow-sm">
        <input
          type="search"
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Cards */}
      {loading ? (
        <div className="text-center py-6 text-gray-500 text-xs">
          <div className="inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin me-2"></div>
          Loading...
        </div>
      ) : sortedData.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-xs">
          No deductions found.
        </div>
      ) : (
        <div className="space-y-2">
          {sortedData.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onView(item)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm mb-0.5 flex items-center gap-1.5 min-w-0">
                    <span className="truncate">{item.courierName}</span>
                    {(() => {
                      const spName = item.userId ? servicePartnerNameByUserId?.get(Number(item.userId)) ?? null : null;
                      return spName !== null ? <ServicePartnerBadge partnerName={spName} size="xs" className="flex-shrink-0" /> : null;
                    })()}
                  </h3>
                  <p className="text-[10px] text-gray-500 truncate">{item.id}</p>
                </div>
                <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onEdit(item)}
                    className="text-blue-500 p-1.5 rounded hover:bg-blue-50 transition-colors"
                  >
                    <i className="bi bi-pencil-fill text-sm"></i>
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors"
                  >
                    <i className="bi bi-trash-fill text-sm"></i>
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="text-gray-800 font-medium truncate ml-2">{item.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount:</span>
                  <span className="text-gray-800 font-semibold">{formatCurrency(String(item.amount))}</span>
                </div>
                {item.backendType === 'pre-payment' && item.fee_value != null && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fee:</span>
                    <span className="text-gray-800 font-medium">{formatCurrency(String(item.fee_value))}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status:</span>
                  <span>
                    {item.status === 'Paid' ? (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-[9px] font-medium">Paid</span>
                    ) : item.status === 'Pending' ? (
                      <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded text-[9px] font-medium">Pending</span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded text-[9px] font-medium">Disputed</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {sortedData.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Total:</span>
                <span className="text-sm font-semibold text-gray-800">{formatCurrency(String(tableTotalAmount))}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default MobileView;

