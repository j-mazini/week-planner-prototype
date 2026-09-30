"use client";

import React, { memo } from 'react';
import { ModernPageHeader, type Metric } from "@/components/modern-page-header";
import { ActionsBar } from './ActionsBar';
import { FilterBar } from './FilterBar';
import { SearchInput } from './SearchInput';
import { InvoiceTable } from './InvoiceTable';
import type { Invoice, SortField, SortDirection } from '../types';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

interface DesktopViewProps {
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
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onViewInvoice: (invoiceId: number) => void;
  selectedMonth: Date | null;
  onNewInvoice: () => void;
  onMultipleInvoices: () => void;
  spmsValidationEnabled: boolean;
  onSpmsValidationToggle: () => void;
  totalValue: string;
}

export const DesktopView = memo(function DesktopView({
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
  sortField,
  sortDirection,
  onSort,
  onViewInvoice,
  selectedMonth,
  onNewInvoice,
  onMultipleInvoices,
  spmsValidationEnabled,
  onSpmsValidationToggle,
}: DesktopViewProps) {
  return (
    <main className="hidden md:block pt-6 space-y-4">
      <div className="mb-4">
        <ModernPageHeader
          title="Financial Invoices"
          subtitle={subtitle}
          metrics={headerMetrics}
          gradientFrom="slate-900"
          gradientTo="indigo-600"
        />
      </div>

      {/* Filters and Actions Bar */}
      <div className="
        bg-gradient-to-br from-white to-gray-50 
        rounded-xl px-6 py-3
        shadow-md mb-6 border border-gray-200 
        relative overflow-visible
      ">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10 min-h-[44px]">
          <div className="flex min-w-0 flex-wrap items-center gap-3 min-h-[44px]">
            <SearchInput 
              value={searchTerm}
              onChange={onSearchChange}
            />
            <FilterBar
              userTypeId={userTypeId}
              selectedPeriod={selectedPeriod}
              availableMonths={availableMonths}
              onPeriodChange={onPeriodChange}
            />
          </div>
          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 min-h-[44px]">
            <ActionsBar
              userTypeId={userTypeId}
              invoices={sortedInvoices}
              selectedMonth={selectedMonth}
              onNewInvoice={onNewInvoice}
              onMultipleInvoices={onMultipleInvoices}
              spmsValidationEnabled={spmsValidationEnabled}
              onSpmsValidationToggle={onSpmsValidationToggle}
            />
          </div>
        </div>
      </div>

      {/* Invoice Table - Admin Only */}
      {userTypeId === BUSINESS_RULES.USER_TYPE.ADMIN && (
        <InvoiceTable
          invoices={sortedInvoices}
          isLoading={isLoading}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
          onViewInvoice={onViewInvoice}
        />
      )}
    </main>
  );
});
