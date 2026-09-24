/**
 * Vendor classification utilities
 * Classifies vendors into HOLD, OFF, or ASSIGNED categories for a specific date
 */

import type { Vendor } from '@/lib/vendors';
import type { DayOffEntry } from '../components/DayOffModal';
import { formatDate } from './dateUtils';

export type VendorCategory = 'hold' | 'off' | 'assigned';

export type ClassifiedVendor = Vendor & {
  category: VendorCategory;
  reason?: 'day_off' | 'inactive' | 'on_leave';
};

/**
 * Classifies vendors for a specific date
 * @param allVendors - All available vendors
 * @param assignments - Array of assignments with userId and date
 * @param dayOffEntries - Array of day off entries
 * @param targetDate - The date to classify for (Date or string)
 * @returns Array of classified vendors
 */
export function classifyVendorsForDate(
  allVendors: Vendor[],
  assignments: Array<{ userId?: number; name?: string; date: string }>,
  dayOffEntries: DayOffEntry[],
  targetDate: Date | string
): ClassifiedVendor[] {
  const dateStr = formatDate(targetDate, 'yyyy-mm-dd');

  return allVendors.map((vendor) => {
    // Check if vendor has day-off
    const hasDayOff = dayOffEntries.some(
      (entry) => entry.userId === vendor.userId && entry.date === dateStr
    );

    // Check if vendor has assignment
    const hasAssignment = assignments.some(
      (assignment) =>
        assignment.userId === vendor.userId && assignment.date === dateStr
    );

    // Check vendor status
    const isInactive = vendor.status === 'inactive' || vendor.status === 'on_leave';

    // Classify vendor
    if (hasDayOff || isInactive) {
      return {
        ...vendor,
        category: 'off' as VendorCategory,
        reason: hasDayOff ? 'day_off' : (vendor.status === 'inactive' ? 'inactive' : 'on_leave'),
      };
    } else if (!hasAssignment) {
      return {
        ...vendor,
        category: 'hold' as VendorCategory,
      };
    } else {
      return {
        ...vendor,
        category: 'assigned' as VendorCategory,
      };
    }
  });
}

/**
 * Get vendor assignment for a specific date
 * @param userId - Vendor ID
 * @param assignments - Array of assignments
 * @param dateStr - Date string in yyyy-mm-dd format
 * @returns Assignment object or undefined
 */
export function getVendorAssignmentForDate(
  userId: number,
  assignments: Array<{ userId?: number; name?: string; date: string }>,
  dateStr: string
) {
  return assignments.find(
    (assignment) => assignment.userId === userId && assignment.date === dateStr
  );
}

/**
 * Get vendor day-off for a specific date
 * @param userId - Vendor ID
 * @param dayOffEntries - Array of day off entries
 * @param dateStr - Date string in yyyy-mm-dd format
 * @returns Day off entry or undefined
 */
export function getVendorDayOffForDate(
  userId: number,
  dayOffEntries: DayOffEntry[],
  dateStr: string
): DayOffEntry | undefined {
  return dayOffEntries.find(
    (entry) => entry.userId === userId && entry.date === dateStr
  );
}



