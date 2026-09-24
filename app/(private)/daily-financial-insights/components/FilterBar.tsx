"use client";

import React, { memo, ChangeEvent, KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { PeriodPicker } from '@/components/period-picker';
import NewButton from '@/components/new-button';
import { dailyFinancialInsightsStyles } from '../styles';

interface FilterBarProps {
  dateFrom: string;
  dateTo: string;
  search: string;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchClear?: () => void;
  onSearchKeyPress?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onAddNewRegister: () => void;
}

export const FilterBar = memo<FilterBarProps>(function FilterBar({
  dateFrom,
  dateTo,
  search,
  onDateChange,
  onSearchChange,
  onSearchClear,
  onSearchKeyPress,
  onAddNewRegister,
}) {
  const hasSearch = search.trim().length > 0;

  return (
    <nav className={dailyFinancialInsightsStyles.filterBarEmbedded}>
      <div className={dailyFinancialInsightsStyles.filterBarDateGroup}>
        <PeriodPicker
          variant="range"
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateChange={onDateChange}
          labelPeriod="Period"
          labelTo="to"
        />
      </div>
      <div className={dailyFinancialInsightsStyles.filterBarSearchGroup}>
        <Search className={dailyFinancialInsightsStyles.filterBarSearchIcon} aria-hidden />
        <input
          type="text"
          id="searchInput"
          placeholder="Route, vehicle, vendor..."
          value={search}
          onChange={onSearchChange}
          onKeyPress={onSearchKeyPress}
          className={dailyFinancialInsightsStyles.filterBarSearchInput}
          aria-label="Search"
        />
        {hasSearch && onSearchClear && (
          <button
            type="button"
            onClick={onSearchClear}
            className={dailyFinancialInsightsStyles.filterBarSearchClear}
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className={dailyFinancialInsightsStyles.filterBarActions}>
        <NewButton onClick={onAddNewRegister} label="New" variant="primary" />
      </div>
    </nav>
  );
});
