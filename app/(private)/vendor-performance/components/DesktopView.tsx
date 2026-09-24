"use client";

import { memo } from 'react';
import { ModernPageHeader, type Metric } from "@/components/modern-page-header";
import { VendorsTable } from './VendorsTable';
import { ActionsBar } from './ActionsBar';
import { TableHeader } from './TableHeader';
import { DepotSelect } from './DepotSelect';
import { GeneralPerformanceDashboard } from './GeneralPerformanceDashboard';
import type { ProcessedVendor } from '../utils';
import type { PerformancePeriodOption } from '../hooks/useAvailablePerformancePeriods';
import type { DepositOption } from '../hooks/useDeposits';

interface DesktopViewProps {
  subtitle: string;
  headerMetrics: Metric[];
  tableYear: number;
  tableMonth: number;
  tableDay?: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onDateChange: (year: number, month: number) => void;
  filteredVendors: ProcessedVendor[];
  loading: boolean;
  error: string | null;
  onViewPerformance: (vendor: ProcessedVendor) => void;
  availablePeriods: PerformancePeriodOption[];
  periodsLoading: boolean;
  tableHeaders: Array<{ label: string }>;
  selectedDepotId: number | null;
  deposits: DepositOption[];
  depositsLoading: boolean;
  onDepotChange: (depotId: number | null) => void;
}

export const DesktopView = memo(function DesktopView({
  subtitle,
  headerMetrics,
  tableYear,
  tableMonth,
  tableDay: _tableDay,
  searchTerm,
  onSearchChange,
  onDateChange,
  filteredVendors,
  loading,
  error,
  onViewPerformance,
  availablePeriods,
  periodsLoading,
  tableHeaders,
  selectedDepotId,
  deposits,
  depositsLoading,
  onDepotChange,
}: DesktopViewProps) {
  const showVendorList = selectedDepotId != null;

  return (
    <main className="hidden md:block pt-6 space-y-4 md:space-y-6 relative overflow-visible">
      {/* Period + Depot filter bar (always visible) */}
      <div className="p-4 border border-slate-200/60 rounded-xl bg-white shadow-sm flex flex-wrap items-end gap-4">
        <DepotSelect
          deposits={deposits}
          value={selectedDepotId}
          onChange={onDepotChange}
          loading={depositsLoading}
          disabled={periodsLoading}
        />
        <ActionsBar
          tableYear={tableYear}
          tableMonth={tableMonth}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onDateChange={onDateChange}
          vendors={filteredVendors}
          availablePeriods={availablePeriods}
          periodsLoading={periodsLoading}
          showSearchAndExport={showVendorList}
        />
      </div>

      {!showVendorList ? (
        <GeneralPerformanceDashboard
          subtitle={subtitle}
          metrics={headerMetrics}
          loading={periodsLoading}
        />
      ) : (
        <>
          <div className="mb-4">
            <ModernPageHeader
              title="Vendor Performance"
              subtitle={subtitle}
              metrics={headerMetrics}
              gradientFrom="slate-900"
              gradientTo="indigo-600"
            />
          </div>

          {/* Table Container */}
          <div className="w-full bg-white border border-slate-200/60 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] backdrop-blur-sm relative max-w-full box-border">
            <div className="overflow-x-auto w-full -mx-1 max-w-full box-border touch-pan-x">
              <table className="w-full border-collapse min-w-full table-auto w-max">
                <TableHeader headers={tableHeaders} />
                <tbody>
                  <VendorsTable
                    vendors={filteredVendors}
                    loading={loading}
                    error={error}
                    onViewPerformance={onViewPerformance}
                  />
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </main>
  );
});

