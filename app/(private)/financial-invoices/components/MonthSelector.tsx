'use client';
import React, { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { IconRenderer } from './IconRenderer';

interface MonthSelectorProps {
  currentMonth: Date;
  onMonthChange: (newMonth: Date) => void;
}

const MonthSelector = memo(function MonthSelector({ currentMonth, onMonthChange }: MonthSelectorProps) {
  const monthLabel = useMemo(
    () => format(currentMonth, 'MMMM yyyy', { locale: enUS }),
    [currentMonth]
  );

  const handleChangeMonth = (delta: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1);
    onMonthChange(newMonth);
  };

  return (
    <div className="flex justify-start mb-0">
      <div className="flex items-center gap-[10px] font-semibold text-slate-700 text-sm">
        <button
          className="text-xl text-blue-600 cursor-pointer p-1 transition-all duration-300 rounded-lg flex items-center justify-center w-9 h-9 hover:text-slate-700 hover:bg-blue-50 hover:scale-110 active:scale-95"
          onClick={(e) => handleChangeMonth(-1, e)}
          aria-label="Previous month"
        >
          <IconRenderer iconName="bi-chevron-left" />
        </button>
        <span className="min-w-[180px] text-center h-9 flex items-center justify-center border-2 border-gray-200 rounded-lg bg-white transition-all duration-300">{monthLabel}</span>
        <button
          className="text-xl text-blue-600 cursor-pointer p-1 transition-all duration-300 rounded-lg flex items-center justify-center w-9 h-9 hover:text-slate-700 hover:bg-blue-50 hover:scale-110 active:scale-95"
          onClick={(e) => handleChangeMonth(1, e)}
          aria-label="Next month"
        >
          <IconRenderer iconName="bi-chevron-right" />
        </button>
      </div>
    </div>
  );
});

MonthSelector.displayName = 'MonthSelector';

export default MonthSelector;

