"use client";

import * as React from "react";
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface MonthPickerProps {
  date: Date;
  setDate: (date: Date) => void;
}

export function MonthPicker({ date, setDate }: MonthPickerProps) {
  const handlePrevMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() - 1);
    setDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() + 1);
    setDate(newDate);
  };

  // Check if we can go to previous month (limit to 12 months back from current)
  const currentDate = new Date();
  const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const selectedMonthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  
  // Calculate months difference
  const monthsDiff = (currentDate.getFullYear() - date.getFullYear()) * 12 + (currentDate.getMonth() - date.getMonth());
  
  // Can go previous if not already 12 months back
  const canGoPrev = monthsDiff < 12;
  // Can go next if not already at current month
  const canGoNext = selectedMonthStart < currentMonthStart;

  return (
    <div className="flex items-center justify-between gap-[clamp(0.5rem,2vw,0.75rem)] font-semibold text-slate-700 text-sm flex-[0_0_60%] min-w-0 px-[clamp(0.75rem,3vw,1rem)] py-[clamp(0.625rem,2.5vw,0.75rem)] bg-white border border-slate-100 rounded-xl min-h-[clamp(3rem,10vw,3.25rem)] shadow-sm hover:shadow-md transition-all duration-300">
      <button
        type="button"
        onClick={handlePrevMonth}
        disabled={!canGoPrev}
        aria-label="Previous month"
        className="w-[clamp(1.75rem,7vw,2rem)] h-[clamp(1.75rem,7vw,2rem)] rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center cursor-pointer hover:shadow-md transition-all duration-300 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i className="bi bi-chevron-left text-[clamp(0.75rem,3vw,0.875rem)]"></i>
      </button>
      
      <span className="flex-1 text-center border-none outline-none whitespace-nowrap overflow-hidden text-ellipsis text-[clamp(0.9rem,3.6vw,1.125rem)] font-bold text-slate-800 min-w-0">
        {format(date, "MMMM yyyy", { locale: enUS })}
      </span>
      
      <button
        type="button"
        onClick={handleNextMonth}
        disabled={!canGoNext}
        aria-label="Next month"
        className="w-[clamp(1.75rem,7vw,2rem)] h-[clamp(1.75rem,7vw,2rem)] rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center cursor-pointer hover:shadow-md transition-all duration-300 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i className="bi bi-chevron-right text-[clamp(0.75rem,3vw,0.875rem)]"></i>
      </button>
    </div>
  );
} 