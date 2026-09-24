"use client";

import React, { memo } from 'react';
import { PeriodPicker } from '@/components/period-picker';

export interface MonthSelectProps {
  /** Selected year */
  year: number;
  /** Selected month (0-based: 0 = January, 11 = December) */
  month: number;
  /** Called when month/year changes */
  onMonthChange: (year: number, month: number) => void;
  /** Minimum selectable month in YYYY-MM format */
  min?: string;
  /** Maximum selectable month in YYYY-MM format */
  max?: string;
  /** Label for the month input. Default: "Month" */
  label?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional CSS class for the container */
  className?: string;
  /** Additional CSS class for the input */
  inputClassName?: string;
  /** Use compact layout for mobile cards */
  mobileLayout?: boolean;
}

/**
 * Reusable month selector component. English labels by default.
 * Use across pages: daily-operations-reports, vendor-performance, etc.
 */
export const MonthSelect = memo(function MonthSelect({
  year,
  month,
  onMonthChange,
  min,
  max,
  label = 'Month',
  disabled = false,
  className = '',
  inputClassName = '',
  mobileLayout = false,
}: MonthSelectProps) {
  return (
    <PeriodPicker
      variant="month"
      year={year}
      month={month}
      onMonthChange={onMonthChange}
      min={min}
      max={max}
      labelPeriod={label}
      disabled={disabled}
      className={className}
      inputClassName={inputClassName}
      mobileLayout={mobileLayout}
    />
  );
});
