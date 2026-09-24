"use client";

import React, { memo, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { PeriodPicker } from '@/components/period-picker';
import NewButton from '@/components/new-button';
import { FilterState } from '../types';
import { CostModel } from '@/lib/cost-models';
import { dailyFinancialInsightsStyles } from '../styles';
import { cn } from '@/lib/utils';

const costModelID_TO_FILTER_VALUE: Record<number, string> = {
  1: '1',
  2: 'DR',
  3: 'FSR',
  4: 'VSR',
  7: '7',
};

const costModel_DISPLAY_NAME: Partial<Record<number, string>> = {
  7: 'Hourly Rate',
};

interface MobileFiltersProps {
  dateFrom: string;
  dateTo: string;
  search: string;
  filters: FilterState;
  uniqueDepots: string[];
  uniqueLoops: string[];
  costModels: CostModel[];
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchClear?: () => void;
  onToggle: (key: keyof FilterState, value: string) => void;
  onAddNewRegister: () => void;
}

export const MobileFilters = memo<MobileFiltersProps>(function MobileFilters({
  dateFrom,
  dateTo,
  search,
  filters,
  uniqueDepots,
  uniqueLoops,
  costModels,
  onDateChange,
  onSearchChange,
  onSearchClear,
  onToggle,
  onAddNewRegister,
}) {
  const paymentOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [{ value: 'All', label: 'All' }];
    [...costModels].sort((a, b) => a.costModelId - b.costModelId).forEach((cm) => {
      const value = costModelID_TO_FILTER_VALUE[cm.costModelId] ?? String(cm.costModelId);
      const label = costModel_DISPLAY_NAME[cm.costModelId] ?? cm.name ?? String(cm.costModelId);
      options.push({ value, label });
    });
    return options;
  }, [costModels]);

  const hasSearch = search.trim().length > 0;
  const btn = (active: boolean) =>
    cn(
      dailyFinancialInsightsStyles.mobileFiltersButton,
      active ? dailyFinancialInsightsStyles.mobileFiltersButtonActive : dailyFinancialInsightsStyles.mobileFiltersButtonInactive
    );

  return (
    <div className={dailyFinancialInsightsStyles.mobileFiltersCard}>
      {/* Search – topo */}
      <div className={dailyFinancialInsightsStyles.mobileFiltersSearchSection}>
        <div className={dailyFinancialInsightsStyles.mobileFiltersSearchWrap}>
          <Search className={dailyFinancialInsightsStyles.mobileFiltersSearchIcon} aria-hidden />
          <input
            type="text"
            placeholder="Route, vehicle, vendor..."
            value={search}
            onChange={onSearchChange}
            className={dailyFinancialInsightsStyles.mobileFiltersSearchInput}
            aria-label="Search"
          />
          {hasSearch && onSearchClear && (
            <button
              type="button"
              onClick={onSearchClear}
              className={dailyFinancialInsightsStyles.mobileFiltersSearchClear}
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Period + New */}
      <div className={dailyFinancialInsightsStyles.mobileFiltersActionsRow}>
        <div className="flex-1 min-w-0">
          <PeriodPicker
            variant="range"
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateChange={onDateChange}
            labelPeriod="Period"
            labelTo="to"
            mobileLayout
          />
        </div>
        <NewButton onClick={onAddNewRegister} label="New" variant="primary" size="sm" />
      </div>

      {/* Depot */}
      <div className={dailyFinancialInsightsStyles.mobileFiltersGroup}>
        <label className={dailyFinancialInsightsStyles.mobileFiltersLabel}>Depot</label>
        <div className={dailyFinancialInsightsStyles.mobileFiltersButtons}>
          <button type="button" className={btn(filters.depot === 'All')} onClick={() => onToggle('depot', 'All')}>
            All
          </button>
          {uniqueDepots.slice(0, 5).map((d) => (
            <button key={d} type="button" className={btn(filters.depot === d)} onClick={() => onToggle('depot', d)}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Loop */}
      <div className={dailyFinancialInsightsStyles.mobileFiltersGroup}>
        <label className={dailyFinancialInsightsStyles.mobileFiltersLabel}>Loop</label>
        <div className={dailyFinancialInsightsStyles.mobileFiltersButtons}>
          <button type="button" className={btn(filters.loop === 'All')} onClick={() => onToggle('loop', 'All')}>
            All
          </button>
          {uniqueLoops.filter((l) => l !== 'All').slice(0, 5).map((loop) => (
            <button key={loop} type="button" className={btn(filters.loop === loop)} onClick={() => onToggle('loop', loop)}>
              {loop}
            </button>
          ))}
        </div>
      </div>

      {/* Payment */}
      <div className={dailyFinancialInsightsStyles.mobileFiltersGroup}>
        <label className={dailyFinancialInsightsStyles.mobileFiltersLabel}>Payment</label>
        <div className={dailyFinancialInsightsStyles.mobileFiltersButtons}>
          {paymentOptions.slice(0, 5).map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={btn((filters.payment ?? 'All') === opt.value)}
              onClick={() => onToggle('payment', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

