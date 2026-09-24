'use client';
import React, { memo, useMemo } from 'react';
import { ModernPageHeader, type Metric } from '@/components/modern-page-header';
import { format } from 'date-fns';
import MonthSelector from './MonthSelector';
import KpiGrid from './KpiGrid';
import DeductionsTable from './DeductionsTable';
import SearchBar from './SearchBar';
import { ExportButton, type ExportFormat } from '@/components/export-button';
import type { DisplayDeduction } from '../types';
import type { KPICard } from '../constants';

interface DesktopViewProps {
  currentMonth: Date;
  onMonthChange: (newMonth: Date) => void;
  kpiCards: KPICard[];
  kpiTotals: Record<string, number>;
  activeKpiFilter: string;
  onKpiFilterChange: (filterType: string) => void;
  onKpiAddClick: (card: KPICard, event: React.MouseEvent<HTMLButtonElement>) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredData: DisplayDeduction[];
  tableTotalAmount: number;
  loading: boolean;
  error: string | null;
  onView: (item: DisplayDeduction) => void | Promise<void>;
  onEdit: (item: DisplayDeduction) => void | Promise<void>;
  onDelete: (item: DisplayDeduction) => void;
  deductionsData: DisplayDeduction[];
  onExport?: (format: ExportFormat) => Promise<Blob | null>;
  hasActiveFilters?: boolean;
  servicePartners?: Array<{ servicePartnerId: number; partnerName: string }>;
  servicePartnerNameByUserId?: Map<number, string>;
  selectedServicePartnerId?: string;
  onServicePartnerChange?: (value: string) => void;
}

const DesktopView = memo(function DesktopView({
  currentMonth,
  onMonthChange,
  kpiCards,
  kpiTotals,
  activeKpiFilter,
  onKpiFilterChange,
  onKpiAddClick,
  searchQuery,
  onSearchChange,
  filteredData,
  tableTotalAmount,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  deductionsData,
  onExport,
  hasActiveFilters = false,
  servicePartners = [],
  servicePartnerNameByUserId,
  selectedServicePartnerId = '',
  onServicePartnerChange,
}: DesktopViewProps) {
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
    <div className="pt-6">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-white/90 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="space-y-[clamp(20px,1.5vw,24px)]">
        {/* Header Section */}
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

        {/* Month Selector + Service Partner Filter Section */}
        <div className="flex justify-end items-center gap-3 flex-wrap">
          {servicePartners.length > 0 && onServicePartnerChange && (
            <select
              value={selectedServicePartnerId}
              onChange={(e) => onServicePartnerChange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-56"
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

        {/* KPI Grid Section */}
        <div className="mb-2">
          <KpiGrid
            data={deductionsData}
            currentMonth={currentMonth}
            activeFilter={activeKpiFilter}
            onFilterChange={onKpiFilterChange}
            onAddEntry={() => {}}
            kpiCards={kpiCards}
            kpiTotals={kpiTotals}
            onKpiAddClick={onKpiAddClick}
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-sm" role="alert">
            <i className="bi bi-exclamation-triangle-fill mr-2" />
            {error}
          </div>
        )}

        {/* Search and Export Section */}
        <div className="flex flex-wrap items-stretch gap-3">
          <div className="flex-[1_1_420px] min-w-[260px]">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />
          </div>
          
          {onExport && (
            <div className="flex-[0_0_auto]">
              <ExportButton
                onExport={onExport}
                filename={`deductions-${new Date().toISOString().split('T')[0]}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                label="Export"
                showOnlyExcelAndPdf={true}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          )}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-[clamp(16px,1.6vw,24px)]">
            <DeductionsTable
              deductions={filteredData}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              totalAmount={tableTotalAmount}
              isLoading={loading}
              servicePartnerNameByUserId={servicePartnerNameByUserId}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default DesktopView;

