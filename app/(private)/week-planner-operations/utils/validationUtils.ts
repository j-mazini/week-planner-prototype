/**
 * Validation utility functions for the planner
 */

import type { Assignment, Vendor, DayOffEntry } from '../types/planner';
import { formatDate, getWeekDates } from './dateUtils';

/**
 * Check if a vendor is off on a specific date
 */
export function isVendorOffOnDate(
  userId: number,
  dateStr: string,
  vendors: Vendor[],
  dayOffEntries: DayOffEntry[]
): boolean {
  const vendor = vendors.find(d => d.id === userId);
  if (!vendor) return false;
  
  // Verificar status do vendor
  if (vendor.status === 'on_leave' || vendor.status === 'inactive') {
    return true;
  }
  
  // Verificar day off entries
  return dayOffEntries.some(entry => {
    if (entry.userId !== userId) return false;
    
    // Check single date
    if (entry.date === dateStr) return true;
    
    // Check date range
    if (entry.endDate) {
      const entryStart = new Date(entry.date);
      const entryEnd = new Date(entry.endDate);
      const checkDate = new Date(dateStr);
      return checkDate >= entryStart && checkDate <= entryEnd;
    }
    
    return false;
  });
}

/**
 * Check if a vendor has an assignment on a specific date
 */
export function hasAssignmentForVendorOnDate(
  userId: number,
  dateStr: string,
  assignments: Assignment[],
  ignoreAssignmentId: string | number | null = null
): boolean {
  return assignments.some(assignment => 
    assignment.userId === userId &&
    assignment.date === dateStr &&
    assignment.id !== ignoreAssignmentId
  );
}

/**
 * Check if there's an assignment on a route for a specific date
 */
export function hasAssignmentOnRouteDate(
  routeId: number | string,
  dateStr: string,
  assignments: Assignment[],
  ignoreAssignmentId: string | number | null = null
): boolean {
  return assignments.some(assignment =>
    String(assignment.routeId) === String(routeId) &&
    assignment.date === dateStr &&
    assignment.id !== ignoreAssignmentId
  );
}

/**
 * Check if all core routes are complete for the week
 */
export function areAllCoreRoutesComplete(
  assignments: Assignment[],
  routes: { variant?: string; type?: string }[],
  displayDate: Date
): boolean {
  const weekDates = getWeekDates(displayDate);
  const weekDateKeys = weekDates.map(date => formatDate(date, 'yyyy-mm-dd'));
  
  // Obter todas as rotas CORE
  const allCoreRoutes = routes.filter(route => 
    route.variant === 'core' || route.type === 'core'
  );
  
  // Verificar cada rota CORE em cada dia
  for (const route of allCoreRoutes) {
    for (const dateKey of weekDateKeys) {
      const hasAssignment = assignments.some(
        assignment => String(assignment.routeId) === String(route.id) && assignment.date === dateKey
      );
      
      if (!hasAssignment) return false;
    }
  }
  
  return true;
}


