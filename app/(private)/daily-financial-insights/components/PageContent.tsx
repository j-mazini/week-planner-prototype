"use client";

import React, { memo } from 'react';
import { ModernPageHeader, type Metric } from "@/components/modern-page-header";
import { FilterBar } from './FilterBar';
import { FilterToggles } from './FilterToggles';
import { InsightsTable } from './InsightsTable';
import { Pagination } from './Pagination';
import { InsightRow, PageTotals, FilterState, PaginationState } from '../types';
import { CostModel } from '@/lib/cost-models';
import type { ServicePartnerDTO } from '@/lib/service-partners-api';
import { dailyFinancialInsightsStyles } from '../styles';

interface PageContentProps {
  subtitle: string | undefined;
  headerMetrics: Metric[];
  servicePartners: ServicePartnerDTO[];
  selectedServicePartnerId: string;
  onServicePartnerChange: (value: string) => void;
  filters: FilterState;
  searchInput: string;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onSearchClear?: () => void;
  onAddNewRegister: () => void;
  uniqueLoops: string[];
  uniqueDepots: string[];
  costModels: CostModel[];
  onToggle: (key: keyof FilterState, value: string) => void;
  onClearFilters?: () => void;
  loading: boolean;
  filteredData: InsightRow[];
  pageTotals: PageTotals;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  getVrnBadgeVariant?: (vrn?: string | null) => 'green' | 'blue';
  pagination: PaginationState;
  itemsPerPage: number;
  onPageChange: (newPage: number) => void;
  onItemsPerPageChange: (newItemsPerPage: number) => void;
  onEditOperationRow?: (row: InsightRow) => void;
  onDeleteOperationRow?: (row: InsightRow) => void;
}

export const PageContent = memo(function PageContent({
  subtitle,
  headerMetrics,
  servicePartners,
  selectedServicePartnerId,
  onServicePartnerChange,
  filters,
  searchInput,
  onDateChange,
  onSearchInputChange,
  onSearchKeyPress,
  onSearchClear,
  onAddNewRegister,
  uniqueLoops,
  uniqueDepots,
  costModels,
  onToggle,
  onClearFilters,
  loading,
  filteredData,
  pageTotals,
  sortField,
  sortDirection,
  onSort,
  getVrnBadgeVariant,
  pagination,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onEditOperationRow,
  onDeleteOperationRow,
}: PageContentProps) {
  return (
    <div className="space-y-3 sm:space-y-3.5 md:space-y-4">
      <div className="mb-3 sm:mb-3.5 md:mb-4">
        <ModernPageHeader
          title="Daily Financial Insights"
          subtitle={subtitle}
          metrics={headerMetrics}
          gradientFrom="slate-900"
          gradientTo="indigo-600"
          metricsLayout="grid2x2"
        />
      </div>

      {servicePartners.length > 0 && (
        <div className="flex justify-start px-1 pb-2">
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-56"
            value={selectedServicePartnerId}
            onChange={(e) => onServicePartnerChange(e.target.value)}
          >
            <option value="">All Service Partners</option>
            {servicePartners.map((sp) => (
              <option key={sp.servicePartnerId} value={String(sp.servicePartnerId)}>
                {sp.partnerName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={dailyFinancialInsightsStyles.filtersContainer}>
        <div className={dailyFinancialInsightsStyles.filtersInner}>
          <FilterBar
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            search={searchInput}
            onDateChange={onDateChange}
            onSearchChange={onSearchInputChange}
            onSearchKeyPress={onSearchKeyPress}
            onSearchClear={onSearchClear}
            onAddNewRegister={onAddNewRegister}
          />
        </div>
        <div className={dailyFinancialInsightsStyles.filtersTogglesContainer}>
          <FilterToggles
            filters={filters}
            availableLoops={uniqueLoops}
            uniqueDepots={uniqueDepots}
            costModels={costModels}
            onToggle={onToggle}
            onClearFilters={onClearFilters}
          />
        </div>
      </div>

      <div className={dailyFinancialInsightsStyles.dataTableContainer}>
        <div className={dailyFinancialInsightsStyles.dataTableScroll}>
          <InsightsTable
            loading={loading}
            filteredData={filteredData}
            pageTotals={pageTotals}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
            costModels={costModels}
            getVrnBadgeVariant={getVrnBadgeVariant}
            onEditRow={onEditOperationRow}
            onDeleteRow={onDeleteOperationRow}
          />
        </div>
        <Pagination
          pagination={pagination}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
          loading={loading}
        />
      </div>
    </div>
  );
});
