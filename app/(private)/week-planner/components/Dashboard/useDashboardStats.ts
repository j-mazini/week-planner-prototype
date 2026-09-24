"use client";

import { useMemo } from 'react';
import { formatDate, getWeekDates, isWeekend } from '../../utils/dateUtils';
import type { WeekPlannerRecord } from '../../contexts/PlannerContext';
import type { Route } from '@/lib/api/routes';
import type { Vendor } from '@/lib/vendors';

type DashboardData = {
  assignments: WeekPlannerRecord[];
  routes: Route[];
  vendors: Vendor[];
};

export type DashboardStats = {
  totalAssignments: number;
  uniqueVendors: number;
  uniqueRoutes: number;
  totalRoutes: number;
  totalVendors: number;
  assignmentsByDay: Array<{
    date: string;
    dayName: string;
    count: number;
    isWeekend: boolean;
  }>;
  routesWithoutAssignments: number;
  vendorsWithoutAssignments: number;
  totalCost: number;
};

export const useDashboardStats = (
  date: string,
  data: DashboardData
): DashboardStats => {
  const weekDates = useMemo(() => getWeekDates(date), [date]);

  return useMemo(() => {
    // Filter assignments for the current week
    const weekAssignments = data.assignments.filter(a => {
      const assignmentDate = a.date;
      return weekDates.some(d => formatDate(d, 'yyyy-mm-dd') === assignmentDate);
    });

    // Basic counts
    const totalAssignments = weekAssignments.length;
    const uniqueVendors = new Set(weekAssignments.map(a => a.name)).size;
    
    // Unique routes calculation
    const uniqueRoutes = new Set(
      weekAssignments.map(a => {
        const route = data.routes.find(
          r => 
            String(r.routeId) === String(a.route) ||
            String(r.routeDefaultId) === String(a.route) ||
            r.routeName === a.route
        );
        return route?.routeId || a.route;
      })
    ).size;

    // Assignments by day
    const assignmentsByDay = weekDates.map(day => {
      const dayStr = formatDate(day, 'yyyy-mm-dd');
      const dayAssignments = weekAssignments.filter(a => a.date === dayStr);
      return {
        date: dayStr,
        dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayAssignments.length,
        isWeekend: isWeekend(dayStr),
      };
    });

    // Routes without assignments
    const routesWithAssignments = new Set(
      weekAssignments.map(a => {
        const route = data.routes.find(
          r => 
            String(r.routeId) === String(a.route) ||
            String(r.routeDefaultId) === String(a.route) ||
            r.routeName === a.route
        );
        return route?.routeId || a.route;
      })
    );
    const routesWithoutAssignments = data.routes.filter(
      r => !routesWithAssignments.has(r.routeId || 0)
    ).length;

    // Total cost calculation.
    // New DTO no longer includes routeCost / rate at the top level; try adhoc payment fields instead.
    const totalCost = weekAssignments.reduce((sum, a) => {
      const raw = a.raw as Record<string, unknown> | undefined;
      // Legacy flat fields (old DTO)
      const legacyCost = Number(raw?.routeCost) || Number(raw?.rate) || 0;
      if (legacyCost) return sum + legacyCost;
      // New DTO: adhocService.adhocReceivedPayment
      const adhocObj = raw?.adhocService && typeof raw.adhocService === 'object'
        ? (raw.adhocService as Record<string, unknown>)
        : null;
      const adhocCost = Number(adhocObj?.adhocReceivedPayment) || 0;
      return sum + adhocCost;
    }, 0);

    // Vendors without assignments
    const vendorsWithAssignments = new Set(weekAssignments.map(a => a.name));
    const vendorsWithoutAssignments = data.vendors.filter(
      d => !vendorsWithAssignments.has(d.fullName || String(d.userId))
    ).length;

    return {
      totalAssignments,
      uniqueVendors,
      uniqueRoutes,
      totalRoutes: data.routes.length,
      totalVendors: data.vendors.length,
      assignmentsByDay,
      routesWithoutAssignments,
      vendorsWithoutAssignments,
      totalCost,
    };
  }, [data, weekDates]);
};





