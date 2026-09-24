"use client";

import React, { memo, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const baseGroupClass =
  'flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0';
const baseLabelClass =
  'text-xs sm:text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600 whitespace-nowrap';
const baseInputClass =
  'px-2 sm:px-3 md:px-4 py-1.5 sm:py-1.5 md:py-2 border border-gray-200 rounded-md text-xs sm:text-sm max-w-[120px] sm:max-w-[140px] md:max-w-[150px] transition-all duration-200 bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 hover:border-gray-400 disabled:opacity-60 disabled:cursor-not-allowed';

/** Styles for mobile layout (e.g. filter card) */
const mobileGroupClass = 'space-y-1';
const mobileLabelClass = 'text-[10px] font-semibold text-gray-500 uppercase';
const mobileInputClass =
  'flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100';
const mobileDateRowClass = 'flex items-center gap-2';

/** Single date popover trigger - uses Calendar (English locale) instead of native input */
function DatePopoverInput({
  value,
  name,
  min,
  disabled,
  onSelect,
  className,
  mobileLayout,
}: {
  value: string;
  name: 'dateFrom' | 'dateTo';
  min?: string;
  disabled?: boolean;
  onSelect: (value: string) => void;
  className?: string;
  mobileLayout?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dateValue = value?.trim() ? parseISO(value) : undefined;

  const handleSelect = (d: Date | undefined) => {
    if (!d) return;
    const iso = format(d, 'yyyy-MM-dd');
    onSelect(iso);
    setOpen(false);
  };

  const displayValue = value?.trim() ? format(parseISO(value), 'dd MMM yyyy', { locale: enUS }) : '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
        className={cn(
          mobileLayout ? mobileInputClass : baseInputClass,
          'text-left cursor-pointer min-w-0',
          !value && 'text-gray-400',
          className
        )}
          aria-label={`${name === 'dateFrom' ? 'Start' : 'End'} date`}
        >
          {displayValue || (name === 'dateFrom' ? 'Start' : 'End')}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          defaultMonth={dateValue}
          disabled={(d) => (min?.trim() ? d < parseISO(min) : false)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

/** Month popover - uses Calendar (English locale) instead of native input type="month" */
function MonthPopoverInput({
  year,
  month,
  min,
  max,
  disabled,
  onSelect,
  labelPeriod,
  className,
  mobileLayout,
}: {
  year: number;
  month: number;
  min?: string;
  max?: string;
  disabled?: boolean;
  onSelect: (year: number, month: number) => void;
  labelPeriod: string;
  className?: string;
  mobileLayout?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const displayDate = new Date(year, month, 1);
  const displayValue = format(displayDate, 'MMM yyyy', { locale: enUS });

  const minDate = useMemo(() => (min?.trim() ? parseISO(min + '-01') : undefined), [min]);
  const maxDate = useMemo(() => {
    if (!max?.trim()) return undefined;
    const [y, m] = max.split('-').map(Number);
    return new Date(y, m - 1, new Date(y, m, 0).getDate());
  }, [max]);

  const handleSelect = (selected: Date | undefined, clicked: Date) => {
    const d = selected ?? clicked;
    if (!d) return;
    onSelect(d.getFullYear(), d.getMonth());
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            mobileLayout ? mobileInputClass : baseInputClass,
            'text-left cursor-pointer min-w-0',
            className
          )}
          aria-label={labelPeriod}
        >
          {displayValue}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={displayDate}
          onSelect={handleSelect}
          defaultMonth={displayDate}
          disabled={(d) => {
            if (minDate && d < minDate) return true;
            if (maxDate && d > maxDate) return true;
            return false;
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export type PeriodPickerVariant = 'range' | 'month';

export interface PeriodPickerRangeProps {
  variant: 'range';
  dateFrom: string;
  dateTo: string;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labelPeriod?: string;
  labelTo?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  /** true = compact layout (smaller labels, inputs in a row) e.g. for mobile cards */
  mobileLayout?: boolean;
}

export interface PeriodPickerMonthProps {
  variant: 'month';
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  min?: string;
  max?: string;
  labelPeriod?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  mobileLayout?: boolean;
}

export type PeriodPickerProps = PeriodPickerRangeProps | PeriodPickerMonthProps;

/**
 * Reusable period selector: date range (range) or single month (month).
 * Default labels in English. Same visual style as daily-operations-reports.
 */
export const PeriodPicker = memo(function PeriodPicker(props: PeriodPickerProps) {
  const minProp = props.variant === 'month' ? props.min : undefined;
  const maxProp = props.variant === 'month' ? props.max : undefined;

  const { min, max } = useMemo(() => {
    if (minProp && maxProp) return { min: minProp, max: maxProp };
    const today = new Date();
    const maxDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const minDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);
    return {
      min: minProp ?? `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}`,
      max: maxProp ?? `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}`,
    };
  }, [minProp, maxProp]);

  if (props.variant === 'range') {
    const {
      dateFrom,
      dateTo,
      onDateChange,
      labelPeriod = 'Period',
      labelTo = 'to',
      disabled = false,
      className = '',
      inputClassName = '',
      mobileLayout = false,
    } = props;

    const labelClass = mobileLayout ? mobileLabelClass : baseLabelClass;

    const emitDateChange = (name: 'dateFrom' | 'dateTo', value: string) => {
      onDateChange({ target: { name, value } } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
      <div className={className} lang="en">
        {mobileLayout && <label className={labelClass}>{labelPeriod}</label>}
        <div className={mobileLayout ? mobileDateRowClass : baseGroupClass}>
          {!mobileLayout && (
            <label htmlFor="period-dateFrom" className={labelClass}>
              {labelPeriod}:
            </label>
          )}
          <DatePopoverInput
            value={dateFrom}
            name="dateFrom"
            disabled={disabled}
            onSelect={(v) => emitDateChange('dateFrom', v)}
            className={inputClassName}
            mobileLayout={mobileLayout}
          />
          <span className={mobileLayout ? 'text-[10px] text-gray-500' : labelClass}>
            {labelTo}
          </span>
          <DatePopoverInput
            value={dateTo}
            name="dateTo"
            min={dateFrom || undefined}
            disabled={disabled}
            onSelect={(v) => emitDateChange('dateTo', v)}
            className={inputClassName}
            mobileLayout={mobileLayout}
          />
        </div>
      </div>
    );
  }

  const {
    year,
    month,
    onMonthChange,
    labelPeriod = 'Period',
    disabled = false,
    className = '',
    inputClassName = '',
    mobileLayout = false,
  } = props;

  const labelClass = mobileLayout ? mobileLabelClass : baseLabelClass;

  return (
    <div className={className} lang="en">
      <div className={mobileLayout ? mobileGroupClass : baseGroupClass}>
        <label
          htmlFor="period-month"
          className={labelClass}
        >
          {labelPeriod}{!mobileLayout ? ':' : ''}
        </label>
        <MonthPopoverInput
          year={year}
          month={month}
          min={min}
          max={max}
          disabled={disabled}
          onSelect={onMonthChange}
          labelPeriod={labelPeriod}
          className={inputClassName}
          mobileLayout={mobileLayout}
        />
      </div>
    </div>
  );
});
