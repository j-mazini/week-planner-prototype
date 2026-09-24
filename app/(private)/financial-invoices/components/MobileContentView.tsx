"use client";

import React, { memo } from 'react';
import { ModernPageHeader, type Metric } from '@/components/modern-page-header';
import { FilterBar } from './FilterBar';
import { ActionsBar } from './ActionsBar';
import { MobileInvoiceList } from './MobileInvoiceList';
import { MobileStatCard } from './MobileStatCard';
import type { Invoice } from '../types';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

interface MobileContentViewProps {
  subtitle: string | undefined;
  headerMetrics: Metric[];
  userTypeId: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedPeriod: string;
  availableMonths: Array<{ value: string; label: string; date: Date }>;
  onPeriodChange: (value: string) => void;
  sortedInvoices: Invoice[];
  isLoading: boolean;
  onViewInvoice: (invoiceId: number) => void;
  selectedMonth: Date;
  onNewInvoice: () => void;
  onMultipleInvoices: () => void;
  spmsValidationEnabled: boolean;
  onSpmsValidationToggle: () => void;
  totalValue: string;
}

export const MobileContentView = memo(function MobileContentView({
  subtitle,
  headerMetrics,
  userTypeId,
  searchTerm,
  onSearchChange,
  selectedPeriod,
  availableMonths,
  onPeriodChange,
  sortedInvoices,
  isLoading,
  onViewInvoice,
  selectedMonth,
  onNewInvoice,
  onMultipleInvoices,
  spmsValidationEnabled,
  onSpmsValidationToggle,
  totalValue,
}: MobileContentViewProps) {
  return (
    <main className="block md:hidden pb-20 space-y-2">
      <div className="mb-4">
        <ModernPageHeader
          title="Financial Invoices"
          subtitle={subtitle}
          metrics={headerMetrics}
          gradientFrom="slate-900"
          gradientTo="indigo-600"
        />
      </div>

      {/* Mobile Filters */}
      <div className="relative flex flex-col gap-3 overflow-hidden rounded-lg border border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55 p-3 text-foreground shadow-md shadow-black/5">
        {/* Glass highlights */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-60" />
        <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(99,102,241,0.14),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.10),transparent_50%)]" />
        </div>
        <div className="relative z-10 space-y-2">
          <input
            type="search"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <FilterBar
            userTypeId={userTypeId}
            selectedPeriod={selectedPeriod}
            availableMonths={availableMonths}
            onPeriodChange={onPeriodChange}
          />
          {userTypeId === BUSINESS_RULES.USER_TYPE.ADMIN && (
            <ActionsBar
              userTypeId={userTypeId}
              invoices={sortedInvoices}
              selectedMonth={selectedMonth}
              onNewInvoice={onNewInvoice}
              onMultipleInvoices={onMultipleInvoices}
              spmsValidationEnabled={spmsValidationEnabled}
              onSpmsValidationToggle={onSpmsValidationToggle}
            />
          )}
        </div>
      </div>

      {/* Mobile Stat Card */}
      {userTypeId === BUSINESS_RULES.USER_TYPE.ADMIN && <MobileStatCard value={totalValue} />}

      {/* Mobile Invoice Cards */}
      <MobileInvoiceList
        invoices={sortedInvoices}
        isLoading={isLoading}
        onViewInvoice={onViewInvoice}
      />
    </main>
  );
});
