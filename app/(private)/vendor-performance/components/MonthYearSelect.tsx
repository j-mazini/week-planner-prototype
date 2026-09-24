"use client";

import React, { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

/** Styling (reused from period-picker) - month/year only, no day selection */
const baseGroupClass = 'flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0';
const baseLabelClass =
  'text-xs sm:text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600 whitespace-nowrap';
const baseSelectClass =
  'px-2 sm:px-3 md:px-4 py-1.5 sm:py-1.5 md:py-2 border border-gray-200 rounded-md text-xs sm:text-sm max-w-[100px] sm:max-w-[110px] transition-all duration-200 bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 hover:border-gray-400 disabled:opacity-60 disabled:cursor-not-allowed';

const mobileGroupClass = 'flex flex-col gap-1';
const mobileSelectsRow = 'flex gap-2';
const mobileLabelClass = 'text-[10px] font-semibold text-gray-500 uppercase';
const mobileSelectClass =
  'flex-1 min-w-0 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface MonthYearSelectProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  min?: string;
  max?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  mobileLayout?: boolean;
}

/**
 * Month + Year selector only (no day selection).
 * Uses month dropdown + year dropdown instead of calendar.
 * Vendor-performance specific - same styling as period-picker.
 */
export const MonthYearSelect = memo(function MonthYearSelect({
  year,
  month,
  onMonthChange,
  min,
  max,
  label = 'Month',
  disabled = false,
  className = '',
  mobileLayout = false,
}: MonthYearSelectProps) {
  const years = useMemo(() => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const minDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);
    let minY = minDate.getFullYear();
    let maxY = maxDate.getFullYear();
    if (min?.trim()) {
      const [mY] = min.split('-').map(Number);
      minY = mY;
    }
    if (max?.trim()) {
      const [mY] = max.split('-').map(Number);
      maxY = mY;
    }
    const yearsList: number[] = [];
    for (let y = minY; y <= maxY; y++) yearsList.push(y);
    return yearsList;
  }, [min, max]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = Number(e.target.value);
    if (!isNaN(m)) onMonthChange(year, m);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const y = Number(e.target.value);
    if (!isNaN(y)) onMonthChange(y, month);
  };

  const labelClass = mobileLayout ? mobileLabelClass : baseLabelClass;
  const selectClass = mobileLayout ? mobileSelectClass : baseSelectClass;

  const selects = (
    <>
      <select
        id="month-select"
        value={month}
        onChange={handleMonthChange}
        disabled={disabled}
        className={cn(selectClass, mobileLayout && 'flex-1')}
        aria-label="Month"
      >
        {MONTHS.map((name, i) => (
          <option key={name} value={i}>
            {name}
          </option>
        ))}
      </select>
      <select
        id="year-select"
        value={year}
        onChange={handleYearChange}
        disabled={disabled}
        className={cn(selectClass, mobileLayout && 'flex-1')}
        aria-label="Year"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </>
  );

  return (
    <div className={cn(className, mobileLayout ? mobileGroupClass : baseGroupClass)} lang="en">
      <label htmlFor="month-select" className={labelClass}>
        {label}{!mobileLayout ? ':' : ''}
      </label>
      {mobileLayout ? <div className={mobileSelectsRow}>{selects}</div> : selects}
    </div>
  );
});
