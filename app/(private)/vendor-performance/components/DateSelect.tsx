"use client";

import { memo, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateSelectProps {
  year: number;
  month: number; // 0-based
  day?: number; // Optional day
  onDateChange: (year: number, month: number, day?: number) => void;
  availablePeriods?: Array<{ year: number; month: number; value: string; label: string }>;
  loading?: boolean;
  className?: string;
}

export const DateSelect = memo(function DateSelect({
  year,
  month,
  day,
  onDateChange,
  availablePeriods = [],
  loading = false,
  className = "",
}: DateSelectProps) {
  const today = useMemo(() => new Date(), []);
  
  // Generate years (current year and previous 2 years)
  const years = useMemo(() => {
    const currentYear = today.getFullYear();
    return Array.from({ length: 3 }, (_, i) => currentYear - i);
  }, [today]);

  // Generate months
  const months = useMemo(() => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames.map((name, index) => ({
      value: index,
      label: name,
    }));
  }, []);

  // Generate days based on selected month and year
  const days = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [year, month]);

  // Filter available periods if provided
  const availableYears = useMemo(() => {
    if (availablePeriods.length === 0) return years;
    const uniqueYears = [...new Set(availablePeriods.map(p => p.year))].sort((a, b) => b - a);
    return uniqueYears.length > 0 ? uniqueYears : years;
  }, [availablePeriods, years]);

  const availableMonths = useMemo(() => {
    if (availablePeriods.length === 0) return months;
    const periodsForYear = availablePeriods.filter(p => p.year === year);
    if (periodsForYear.length === 0) return months;
    const uniqueMonths = [...new Set(periodsForYear.map(p => p.month))].sort((a, b) => a - b);
    return uniqueMonths.map(m => {
      const monthData = months.find(mm => mm.value === m);
      return {
        value: m,
        label: monthData?.label || `Month ${m + 1}`,
      };
    });
  }, [availablePeriods, year, months]);

  const handleYearChange = (newYear: string) => {
    const yearNum = parseInt(newYear, 10);
    // If changing year, try to keep the same month if available, otherwise use first available
    const availableMonthsForYear = availablePeriods.length > 0
      ? availablePeriods.filter(p => p.year === yearNum).map(p => p.month)
      : [month];
    const newMonth = availableMonthsForYear.includes(month) ? month : (availableMonthsForYear[0] ?? 0);
    // Validate day for new month/year
    const daysInNewMonth = new Date(yearNum, newMonth + 1, 0).getDate();
    const validDay = day ? Math.min(day, daysInNewMonth) : 1;
    onDateChange(yearNum, newMonth, validDay);
  };

  const handleMonthChange = (newMonth: string) => {
    const monthNum = parseInt(newMonth, 10);
    // Validate day for new month
    const daysInNewMonth = new Date(year, monthNum + 1, 0).getDate();
    const validDay = day ? Math.min(day, daysInNewMonth) : 1;
    onDateChange(year, monthNum, validDay);
  };

  const handleDayChange = (newDay: string) => {
    const dayNum = parseInt(newDay, 10);
    onDateChange(year, month, dayNum);
  };

  const selectedYearValue = year.toString();
  const selectedMonthValue = month.toString();
  // Ensure day is valid for the selected month/year
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = day ? Math.min(day, daysInMonth) : 1;
  const selectedDayValue = currentDay.toString();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Day Select */}
      <Select
        value={selectedDayValue}
        onValueChange={handleDayChange}
        disabled={loading}
      >
        <SelectTrigger className="w-20 h-10">
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={d.toString()}>
              {String(d).padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month Select */}
      <Select
        value={selectedMonthValue}
        onValueChange={handleMonthChange}
        disabled={loading}
      >
        <SelectTrigger className="w-36 h-10">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {availableMonths.map((m) => (
            <SelectItem key={m.value} value={m.value.toString()}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year Select */}
      <Select
        value={selectedYearValue}
        onValueChange={handleYearChange}
        disabled={loading}
      >
        <SelectTrigger className="w-24 h-10">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

