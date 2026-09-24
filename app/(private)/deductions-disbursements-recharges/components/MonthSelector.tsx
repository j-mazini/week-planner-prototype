'use client';
import React, { memo, useMemo } from 'react';
import { IconRenderer } from './IconRenderer';

interface MonthSelectorProps {
  currentMonth: Date;
  onMonthChange: (newMonth: Date) => void;
}

const MonthSelector = memo(function MonthSelector({ currentMonth, onMonthChange }: MonthSelectorProps) {
  const monthLabel = useMemo(
    () => currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    [currentMonth]
  );

  const handleChangeMonth = (delta: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1);
    onMonthChange(newMonth);
  };

  return (
    <div className="inline-flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm">
        <button
          className="text-lg text-blue-600 cursor-pointer p-1 rounded hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-center"
          onClick={(e) => handleChangeMonth(-1, e)}
          aria-label="Previous month"
        >
          <IconRenderer iconName="bi-chevron-left" />
        </button>
        <span className="min-w-[160px] text-center font-semibold text-slate-700 text-sm md:text-base">
          {monthLabel}
        </span>
        <button
          className="text-lg text-blue-600 cursor-pointer p-1 rounded hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-center"
          onClick={(e) => handleChangeMonth(1, e)}
          aria-label="Next month"
        >
          <IconRenderer iconName="bi-chevron-right" />
        </button>
    </div>
  );
});

MonthSelector.displayName = 'MonthSelector';

export default MonthSelector;

