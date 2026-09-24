"use client";

import { memo } from 'react';
import { motion } from 'framer-motion';
import { ModernPageHeader, type Metric } from '@/components/modern-page-header';
import { MonthYearSelect } from './MonthYearSelect';
import { DepotSelect } from './DepotSelect';
import { GeneralPerformanceDashboard } from './GeneralPerformanceDashboard';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';
import { MobileVendorCard } from './MobileVendorCard';
import { PerformanceCardsSkeleton } from './PerformanceCardsSkeleton';
import type { ProcessedVendor } from '../utils';
import type { PerformancePeriodOption } from '../hooks/useAvailablePerformancePeriods';
import type { DepositOption } from '../hooks/useDeposits';

interface MobileViewProps {
  subtitle: string;
  headerMetrics: Metric[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  tableYear: number;
  tableMonth: number;
  onDateChange: (year: number, month: number) => void;
  filteredVendors: ProcessedVendor[];
  loading: boolean;
  error: string | null;
  onViewPerformance: (vendor: ProcessedVendor) => void;
  availablePeriods: PerformancePeriodOption[];
  periodsLoading: boolean;
  selectedDepotId: number | null;
  deposits: DepositOption[];
  depositsLoading: boolean;
  onDepotChange: (depotId: number | null) => void;
}

export const MobileView = memo(function MobileView({
  subtitle,
  headerMetrics,
  searchTerm,
  onSearchChange,
  tableYear,
  tableMonth,
  onDateChange,
  filteredVendors,
  loading,
  error,
  onViewPerformance,
  availablePeriods,
  periodsLoading,
  selectedDepotId,
  deposits,
  depositsLoading,
  onDepotChange,
}: MobileViewProps) {
  const showVendorList = selectedDepotId != null;

  return (
    <main className="block md:hidden pt-16 pb-20 min-h-screen">
      <div className="md:hidden h-[env(safe-area-inset-top,0px)] min-h-[env(safe-area-inset-top,0px)]" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="px-4 pt-4 pb-3"
      >
        <div className="mb-4">
          <ModernPageHeader
            title="Vendor Performance"
            subtitle={subtitle}
            metrics={headerMetrics}
            gradientFrom="slate-900"
            gradientTo="indigo-600"
            metricsLayout="grid2x2"
          />
        </div>
      </motion.div>

      {/* Filters: Depot + Period (and search when depot selected) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="px-4 mb-4"
      >
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 space-y-3">
          <DepotSelect
            deposits={deposits}
            value={selectedDepotId}
            onChange={onDepotChange}
            loading={depositsLoading}
            disabled={periodsLoading}
          />
          <div>
            <MonthYearSelect
              year={tableYear}
              month={tableMonth}
              onMonthChange={onDateChange}
              min={availablePeriods?.length ? [...availablePeriods].map((p) => p.value).sort()[0] : undefined}
              max={availablePeriods?.length ? [...availablePeriods].map((p) => p.value).sort().pop() : undefined}
              label="Month"
              disabled={periodsLoading}
              mobileLayout
            />
          </div>
          {showVendorList && (
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          )}
        </div>
      </motion.div>

      {!showVendorList ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="px-4"
        >
          <GeneralPerformanceDashboard
            subtitle={subtitle}
            metrics={headerMetrics}
            loading={periodsLoading}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="px-4"
        >
          {loading ? (
            <PerformanceCardsSkeleton />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : filteredVendors.length === 0 ? (
            <EmptyState message="No vendors found for this depot." />
          ) : (
            <div className="space-y-3">
              {filteredVendors.map((vendor, index) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <MobileVendorCard
                    vendor={vendor}
                    onViewPerformance={onViewPerformance}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <div className="md:hidden h-[env(safe-area-inset-bottom,0px)] min-h-[env(safe-area-inset-bottom,0px)]" />
    </main>
  );
});

