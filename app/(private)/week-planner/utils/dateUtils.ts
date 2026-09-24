/**
 * Date utility functions for weekly planner
 */

/**
 * Parse a date string in YYYY-MM-DD format to a Date object using local timezone
 * This avoids timezone issues when parsing date strings
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object in local timezone
 */
export function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    return new Date(dateStr); // Fallback to default parsing
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

/**
 * Get the week dates (Monday to Sunday) for a given date
 * @param date - The date to get the week for
 * @returns Array of 7 dates (Monday to Sunday)
 */
export function getWeekDates(date: Date | string): Date[] {
  const d = typeof date === 'string' ? parseLocalDate(date) : new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  
  // Create a new date object to avoid mutation
  const monday = new Date(d);
  monday.setDate(diff);
  
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(monday);
    weekDate.setDate(monday.getDate() + i);
    weekDates.push(weekDate);
  }
  
  return weekDates;
}

/**
 * Get week dates optionally excluding weekends (Saturday, Sunday)
 * @param date - The date to get the week for
 * @param includeWeekends - If false, returns only Monday-Friday (5 days)
 */
export function getWeekDatesFiltered(date: Date | string, includeWeekends: boolean): Date[] {
  const all = getWeekDates(date);
  return includeWeekends ? all : all.filter((_, index) => index < 5); // Mon-Fri only
}

/**
 * Format a date to a specific format
 * @param date - The date to format
 * @param format - Format string: 'dd/mm', 'yyyy-mm-dd', 'dd/mm/yyyy', etc.
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: string = 'yyyy-mm-dd'): string {
  const d = typeof date === 'string' ? parseLocalDate(date) : new Date(date);
  
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
 * Get day of week name in English (e.g. Monday, Tuesday)
 * @param date - The date to get the day name for
 * @returns Day name in English
 */
export function getDayNameEn(date: Date | string): string {
  const d = typeof date === 'string' ? parseLocalDate(date) : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { weekday: 'long' });
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param date - The date to check
 * @returns True if the date is a weekend
 */
export function isWeekend(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseLocalDate(date) : new Date(date);
  const day = d.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Get the start of the week (Monday) for a given date
 * @param date - The date to get the week start for
 * @returns Date object representing Monday of that week
 */
export function getWeekStart(date: Date | string): Date {
  const d = typeof date === 'string' ? parseLocalDate(date) : new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Get ISO week number for a given date
 * @param date - The date to get the week number for
 * @returns ISO week number (1-53) or null if invalid
 */
export function getISOWeekNumber(date: Date | string): number | null {
  const d = typeof date === 'string' ? parseLocalDate(date) : new Date(date);
  if (!(d instanceof Date) || Number.isNaN(d.valueOf())) return null;
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNumber = target.getUTCDay() || 7; // Sunday = 7
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return Number.isFinite(weekNumber) ? weekNumber : null;
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

