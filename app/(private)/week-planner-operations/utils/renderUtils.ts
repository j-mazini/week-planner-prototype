/**
 * Rendering utility functions
 */

import type { Assignment, Vendor, Route, DayOffEntry } from '../types/planner';
import { formatDate, formatWeekRangeLabel } from './dateUtils';
import { isVendorOffOnDate } from './validationUtils';

/**
 * Get vendors classified as OFF for a specific date
 */
export function getOffVendors(
  dateStr: string,
  vendors: Vendor[],
  dayOffEntries: DayOffEntry[]
): Vendor[] {
  return vendors.filter(vendor => 
    isVendorOffOnDate(vendor.id, dateStr, vendors, dayOffEntries)
  );
}

/**
 * Get vendors classified as HOLD (available) for a specific date
 */
export function getHoldVendors(
  dateStr: string,
  vendors: Vendor[],
  assignments: Assignment[],
  dayOffEntries: DayOffEntry[]
): Vendor[] {
  const assignedVendorIds = assignments
    .filter(a => a.date === dateStr)
    .map(a => a.userId);
    
  return vendors.filter(vendor => 
    !isVendorOffOnDate(vendor.id, dateStr, vendors, dayOffEntries) &&
    !assignedVendorIds.includes(vendor.id) &&
    vendor.status === 'active'
  );
}

/**
 * Get assignments for a specific route and date
 */
export function getAssignmentsForRouteDate(
  routeId: number | string,
  dateStr: string,
  assignments: Assignment[]
): Assignment[] {
  return assignments.filter(a => 
    String(a.routeId) === String(routeId) && a.date === dateStr
  );
}

/**
 * Calculate header metrics for weekly view
 */
export function calculateWeeklyMetrics(
  assignments: Assignment[],
  weekDates: Date[]
): { assignments: number; vendors: number; dateRange: string } {
  const weekDateKeys = weekDates.map(date => formatDate(date, 'yyyy-mm-dd'));
  const assignmentsForWeek = assignments.filter(a => weekDateKeys.includes(a.date));
  const uniqueVendorsForWeek = new Set(assignmentsForWeek.map(a => a.userId));
  
  return {
    assignments: assignmentsForWeek.length,
    vendors: uniqueVendorsForWeek.size,
    dateRange: formatWeekRangeLabel(weekDates)
  };
}

/**
 * Calculate header metrics for daily view
 */
export function calculateDailyMetrics(
  assignments: Assignment[],
  date: Date
): { assignments: number; vendors: number; dateRange: string } {
  const dateStr = formatDate(date, 'yyyy-mm-dd');
  const assignmentsForDay = assignments.filter(a => a.date === dateStr);
  const uniqueVendorsForDay = new Set(assignmentsForDay.map(a => a.userId));
  
  return {
    assignments: assignmentsForDay.length,
    vendors: uniqueVendorsForDay.size,
    dateRange: formatDate(date, 'dd/mm/yyyy')
  };
}

/**
 * Filter routes by section/category
 */
export function filterRoutesBySection(
  routes: Route[],
  sectionKey: string,
  filterFn?: (route: Route) => boolean
): Route[] {
  if (filterFn) {
    return routes.filter(filterFn);
  }
  
  // Default filters based on section key
  switch (sectionKey) {
    case 'dy1':
      return routes.filter(r => r.loopType === 'DY1');
    case 'dy2':
      return routes.filter(r => r.loopType === 'DY2');
    case 'lse':
      return routes.filter(r => r.depot === 'LSE');
    case 'mse':
      return routes.filter(r => r.depot === 'MSE');
    case 'management':
      return routes.filter(r => r.type === 'management');
    default:
      return [];
  }
}

/**
 * Get default sort status for a route
 */
export function getDefaultSortStatus(route: Route | null): string {
  if (!route) return 'no';
  
  // Logic to determine default sort status based on route
  if (route.type === 'ad-hoc') return 'no';
  if (route.variant === 'core') return 'yes';
  
  return 'no';
}


