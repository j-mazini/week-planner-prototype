/**
 * Date utility functions for weekly planner
 */

/**
 * Get the week dates (Monday to Sunday) for a given date
 * @param date - The date to get the week for
 * @returns Array of 7 dates (Monday to Sunday)
 */
export function getWeekDates(date: Date | string): Date[] {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const weekDates: Date[] = [];
  const current = new Date(d);
  const day = current.getDay(); // 0 = Domingo, 1 = Segunda
  const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Ajusta para Segunda-feira
  
  const monday = new Date(current);
  monday.setDate(diff);
  
  for (let i = 0; i < 7; i++) {
    const weekDay = new Date(monday);
    weekDay.setDate(monday.getDate() + i);
    weekDates.push(weekDay);
  }
  
  return weekDates;
}

/**
 * Format a date to a specific format
 * @param date - The date to format
 * @param format - Format string: 'dd/mm', 'yyyy-mm-dd', 'dd/mm/yyyy', etc.
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: string = 'yyyy-mm-dd'): string {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  switch (format) {
    case 'dd/mm':
      return `${day}/${month}`;
    case 'dd/mm/yyyy':
      return `${day}/${month}/${year}`;
    case 'yyyy-mm-dd':
      return `${year}-${month}-${day}`;
    case 'mm/dd':
      return `${month}/${day}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param date - The date to check
 * @returns True if the date is a weekend
 */
export function isWeekend(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const day = d.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Get the start of the week (Monday) for a given date
 * @param date - The date to get the week start for
 * @returns Date object representing Monday of that week
 */
export function getWeekStart(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Get the end of the week (Sunday) for a given date
 * @param date - The date to get the week end for
 * @returns Date object representing Sunday of that week
 */
export function getWeekEnd(date: Date | string): Date {
  const monday = getWeekStart(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/**
 * Get ISO week number for a date
 * @param date - The date to get the week number for
 * @returns ISO week number
 */
export function getISOWeekNumber(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNumber = target.getUTCDay() || 7; // Segunda = 1, Domingo = 7
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNumber;
}

/**
 * Format week range label (ex: "01 - 07 Nov 2024" or "28 Oct - 03 Nov 2024")
 * @param weekDates - Array of week dates
 * @returns Formatted week range string
 */
export function formatWeekRangeLabel(weekDates: Date[]): string {
  const sortedDates = weekDates.slice().sort((a, b) => a.getTime() - b.getTime());
  const start = sortedDates[0];
  const end = sortedDates[sortedDates.length - 1];
  
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  
  const startLabel = start.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: sameYear ? undefined : 'numeric'
  });
  
  const endLabel = end.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  
  return sameMonth ? `${start.getDate()} - ${endLabel}` : `${startLabel} - ${endLabel}`;
}

/**
 * Expand a date range to an array of all inclusive dates
 * @param startDateStr - Start date string (YYYY-MM-DD)
 * @param endDateStr - End date string (YYYY-MM-DD)
 * @returns Array of date strings
 */
export function expandDateRange(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  if (start > end) return dates;
  
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(formatDate(cursor, 'yyyy-mm-dd'));
    cursor.setDate(cursor.getDate() + 1);
  }
  
  return dates;
}

