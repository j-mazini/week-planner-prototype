import { formatDateToString } from "./deduction-installments";

/**
 * Returns the nearest weekday on or after `dateStr` (skips Sat/Sun only).
 * Used when bank holidays are not loaded yet.
 */
export function getNextBusinessDayString(dateStr: string): string {
  // Append T00:00:00 to force local time parsing and avoid UTC offset shifting the date
  const d = new Date(dateStr.length === 10 ? dateStr + 'T00:00:00' : dateStr);
  if (isNaN(d.getTime())) return dateStr;
  d.setHours(0, 0, 0, 0);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  return formatDateToString(d);
}
