"use client";

import React, { memo } from 'react';
import { InsightRow, PageTotals } from '../types';
import { formatCurrency } from '../utils';
import { MobileCard } from './MobileCard';
import { LoadingSpinner } from './LoadingSpinner';
import { CostModel } from '@/lib/cost-models';
import { dailyFinancialInsightsStyles } from '../styles';

interface MobileViewProps {
  data: InsightRow[];
  loading: boolean;
  pageTotals: PageTotals;
  costModels: CostModel[];
  getVrnBadgeVariant?: (vrn?: string | null) => 'green' | 'blue';
  pagination?: { currentPage: number; totalPages: number; totalItems: number };
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onEditOperationRow?: (row: InsightRow) => void;
  onDeleteOperationRow?: (row: InsightRow) => void;
}

export const MobileView = memo<MobileViewProps>(function MobileView({
  data,
  loading,
  pageTotals,
  costModels,
  getVrnBadgeVariant,
  pagination,
  itemsPerPage: _itemsPerPage = 10,
  onPageChange,
  onEditOperationRow,
  onDeleteOperationRow,
}) {
  if (loading) {
    return (
      <div className={dailyFinancialInsightsStyles.mobileViewContainer}>
        <LoadingSpinner variant="block" size="md" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={dailyFinancialInsightsStyles.mobileViewContainer}>
        <div className={dailyFinancialInsightsStyles.mobileViewEmpty}>
          No records found for the selected filters.
        </div>
      </div>
    );
  }

  return (
    <div className={dailyFinancialInsightsStyles.mobileViewContainer}>
      <div className={`${dailyFinancialInsightsStyles.mobileViewList} ${dailyFinancialInsightsStyles.mobileViewListLoaded}`}>
        {data.map((row, index) => (
          <MobileCard
            key={`${row.date}-${row.vrm}-${row.courier}-${row.route}-${index}`}
            row={row}
            index={index}
            costModels={costModels}
            badgeVariant={getVrnBadgeVariant?.(row.vrm)}
            onEditRow={onEditOperationRow}
            onDeleteRow={onDeleteOperationRow}
          />
        ))}
        <div className={dailyFinancialInsightsStyles.mobileViewTotals}>
          <div className={dailyFinancialInsightsStyles.mobileViewTotalsRow}>
            <span className={dailyFinancialInsightsStyles.mobileViewTotalsLabel}>Page total</span>
            <span className={dailyFinancialInsightsStyles.mobileViewTotalsValue}>{formatCurrency(pageTotals.total)}</span>
          </div>
          <div className={dailyFinancialInsightsStyles.mobileViewTotalsRow}>
            <span className={dailyFinancialInsightsStyles.mobileViewTotalsLabel}>Avg/stop</span>
            <span className={dailyFinancialInsightsStyles.mobileViewTotalsValue}>{formatCurrency(pageTotals.avg)}</span>
          </div>
        </div>

        {pagination && onPageChange && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-700"
              disabled={pagination.currentPage <= 1}
              onClick={() => onPageChange(pagination.currentPage - 1)}
            >
              Previous
            </button>
            <span className="text-xs text-slate-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-700"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => onPageChange(pagination.currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
