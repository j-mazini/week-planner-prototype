/**
 * Planner calculation utilities
 */

import type { Assignment, Vendor, DayOffEntry } from '../types/planner';
import { formatDate, isWeekend } from './dateUtils';

export interface PlannerMetrics {
  assignments: number;
  vendors: number;
  weekRange: string;
  weekNumber: string;
}

/**
 * Calculate metrics for the planner header
 */
export function calculateMetrics(
  assignments: Assignment[],
  weekDates: Date[],
  weekStart: Date,
  weekEnd: Date
): PlannerMetrics {
  const weekDateStrs = weekDates.map(d => formatDate(d, 'yyyy-mm-dd'));
  const assignmentsCount = assignments.filter(a => weekDateStrs.includes(a.date)).length;
  
  const uniqueVendors = new Set(
    assignments
      .filter(a => weekDateStrs.includes(a.date))
      .map(a => a.userId)
  ).size;

  const weekRange = `${formatDate(weekStart, 'dd/mm')} - ${formatDate(weekEnd, 'dd/mm')}`;
  const weekNumber = getISOWeekNumber(weekStart);

  return {
    assignments: assignmentsCount,
    vendors: uniqueVendors,
    weekRange,
    weekNumber,
  };
}

/**
 * Get ISO week number for a date
 */
export function getISOWeekNumber(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.valueOf())) {
    return '00';
  }
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return Number.isFinite(weekNumber) ? weekNumber.toString().padStart(2, '0') : '00';
}

/**
 * Check if a week is complete (all assignments submitted)
 */
export function isWeekComplete(
  assignments: Assignment[],
  weekDates: Date[]
): boolean {
  // This is a simplified check - you may want to add more logic
  const weekDateStrs = weekDates.map(d => formatDate(d, 'yyyy-mm-dd'));
  const weekAssignments = assignments.filter(a => weekDateStrs.includes(a.date));
  
  // Check if all assignments have required fields
  return weekAssignments.every(a => 
    a.userId && 
    a.routeId && 
    a.date &&
    a.status !== 'pending'
  );
}

/**
 * Count assignments by day
 */
export function countAssignmentsByDay(
  assignments: Assignment[],
  date: string
): number {
  return assignments.filter(a => a.date === date).length;
}

/**
 * Get vendors available for a specific date
 */
export function getAvailableVendors(
  allVendors: Vendor[],
  assignments: Assignment[],
  dayOffEntries: DayOffEntry[],
  date: string
): Vendor[] {
  const assignedVendorIds = new Set(
    assignments
      .filter(a => a.date === date)
      .map(a => a.userId)
  );

  const offVendorIds = new Set(
    dayOffEntries
      .filter(entry => {
        if (entry.date === date) return true;
        if (entry.endDate) {
          const entryStart = new Date(entry.date);
          const entryEnd = new Date(entry.endDate);
          const checkDate = new Date(date);
          return checkDate >= entryStart && checkDate <= entryEnd;
        }
        return false;
      })
      .map(entry => entry.userId)
  );

  return allVendors.filter(vendor => 
    !assignedVendorIds.has(vendor.id) && 
    !offVendorIds.has(vendor.id)
  );
}

/**
 * Get vendors on day off for a specific date
 */
export function getDayOffVendors(
  allVendors: Vendor[],
  dayOffEntries: DayOffEntry[],
  date: string
): Vendor[] {
  const offVendorIds = new Set(
    dayOffEntries
      .filter(entry => {
        if (entry.date === date) return true;
        if (entry.endDate) {
          const entryStart = new Date(entry.date);
          const entryEnd = new Date(entry.endDate);
          const checkDate = new Date(date);
          return checkDate >= entryStart && checkDate <= entryEnd;
        }
        return false;
      })
      .map(entry => entry.userId)
  );

  return allVendors.filter(vendor => offVendorIds.has(vendor.id));
}

/**
 * Filter weekend dates if weekend visibility is disabled
 */
export function filterWeekendDates(dates: Date[], showWeekends: boolean): Date[] {
  if (showWeekends) return dates;
  return dates.filter(d => !isWeekend(d));
}


