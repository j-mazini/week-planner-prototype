"use client";

import React, { useState } from 'react';
import { getWeekDates, formatDate } from '../utils/dateUtils';
import type { WeekPlannerRecord } from '../contexts/PlannerContext';
import type { Route } from '@/lib/api/routes';
import type { Vendor } from '@/lib/vendors';
import type { DayOffEntry } from './DayOffModal';
import RouteLabel from './Common/RouteLabel';
import DayCell from './WeeklyView/DayCell';
import { useDragAndDrop, type DragItem } from '../hooks/useDragAndDrop';
import { Plus } from 'lucide-react';

type WeeklyViewProps = {
  date: string; // YYYY-MM-DD format
  data: {
    assignments: WeekPlannerRecord[];
    routes: Route[];
    vendors: Vendor[];
  };
  dayOffEntries?: DayOffEntry[];
  onDrop: (e: React.DragEvent<HTMLDivElement>, routeId: number, dateStr: string) => void;
  onEdit: (assignment: WeekPlannerRecord) => void;
  onAssignVendor?: (userId: number, routeId: number, date: string) => void;
};

type RouteWithTemporary = Route & { isTemporary?: boolean };

const WeeklyView: React.FC<WeeklyViewProps> = ({ 
  date, 
  data,
  dayOffEntries: _dayOffEntries = [],
  onDrop, 
  onEdit,
  onAssignVendor: _onAssignVendor 
}) => {
  const weekDates = getWeekDates(date);
  const { draggedItem, handleDragStart } = useDragAndDrop();
  const [draggedFromCell, setDraggedFromCell] = useState<HTMLElement | null>(null);
  // State to store temporary Flex routes in memory
  const [tempFlexRoutes, setTempFlexRoutes] = useState<Map<number, RouteWithTemporary[]>>(new Map());

  const handleCardDragStart = (e: React.DragEvent, data: DragItem, cell: HTMLElement) => {
    setDraggedFromCell(cell);
    if (handleDragStart) {
      handleDragStart(e, data);
    }
  };

  // Function to add a temporary Flex route for a deposit
  const handleAddFlexRoute = (depositId: number) => {
    const tempRoutes = tempFlexRoutes.get(depositId) || [];
    const newFlexRoute: RouteWithTemporary = {
      routeId: -(Date.now() + Math.random()), // Negative ID to indicate temporary route
      routeName: `Flex ${tempRoutes.length + 1}`,
      depositId: depositId,
      active: true,
      isFlex: true,
      isTemporary: true, // Flag to indicate this is a temporary route
    };
    
    const updatedRoutes = [...tempRoutes, newFlexRoute];
    const newMap = new Map(tempFlexRoutes);
    newMap.set(depositId, updatedRoutes);
    setTempFlexRoutes(newMap);
  };

  // Helper function to check if a route has any assignments
  const hasAssignments = (route: Route): boolean => {
    const routeId = route.routeId;
    const routeName = route.routeName;
    if (!routeId && !routeName) return false;
    
    // Check if there are any assignments for this route in the current week
    return data.assignments.some(assignment => {
      const assignmentRoute = assignment.route;
      
      // Check if assignment route matches (could be routeId, routeName, or route object)
      if (typeof assignmentRoute === 'number') {
        return assignmentRoute === routeId;
      }
      if (typeof assignmentRoute === 'string') {
        return assignmentRoute === routeName || assignmentRoute === String(routeId);
      }
      // If it's an object, check routeId
      if (assignmentRoute && typeof assignmentRoute === 'object') {
        const routeObj = assignmentRoute as { routeId?: number; routeName?: string };
        return routeObj.routeId === routeId || routeObj.routeName === routeName;
      }
      
      // Also check in raw data
      const rawRoute = assignment.raw?.route;
      if (rawRoute) {
        if (typeof rawRoute === 'object') {
          const rawRouteObj = rawRoute as { routeId?: number; routeName?: string };
          return rawRouteObj.routeId === routeId || rawRouteObj.routeName === routeName;
        }
        if (typeof rawRoute === 'string') {
          return rawRoute === routeName || rawRoute === String(routeId);
        }
        if (typeof rawRoute === 'number') {
          return rawRoute === routeId;
        }
      }
      
      return false;
    });
  };

  // Helper to group routes by deposit and render
  const renderSectionByDeposit = (
    title: string, 
    routes: Route[], 
    filterFn?: (route: Route) => boolean
  ) => {
    let filteredRoutes: RouteWithTemporary[] = (filterFn ? routes.filter(filterFn) : routes).map(
      (route) => route as RouteWithTemporary
    );
    
    // Filter out Flex routes that don't have assignments (except temporary ones)
    filteredRoutes = filteredRoutes.filter(route => {
      const isFlexRoute = route.routeName?.toLowerCase().startsWith('flex');
      const isTemporary = route.isTemporary === true;
      if (isFlexRoute && !isTemporary) {
        // Only show Flex routes if they have assignments (unless temporary)
        return hasAssignments(route);
      }
      // Show all non-Flex routes and temporary Flex routes
      return true;
    });

    // Deposit name mapping (fallback if deposits not available)
    const depositNames: Record<number, string> = {
      1: 'LCY - DOCKLANDS',
      2: 'MSE - MAIDSTONE',
      3: 'LSE - LAMBETH',
      4: 'OFF - OFF',
      5: 'GEN - GENERAL BA EXPRESS',
      6: 'GDH - GENERAL DHL',
      7: 'BAOP - BA CENTER COST',
    };

    // Group routes by depositId
    const routesByDeposit = new Map<number, Route[]>();
    filteredRoutes.forEach(route => {
      const depositId = route.depositId ?? 0;
      if (!routesByDeposit.has(depositId)) {
        routesByDeposit.set(depositId, []);
      }
      routesByDeposit.get(depositId)!.push(route);
    });
    
    // Add temporary Flex routes to their respective deposits
    tempFlexRoutes.forEach((tempRoutes, depositId) => {
      if (!routesByDeposit.has(depositId)) {
        routesByDeposit.set(depositId, []);
      }
      routesByDeposit.get(depositId)!.push(...tempRoutes);
    });

    // Get all deposit IDs from routes, temp routes, and known deposits
    const allDepositIds = new Set<number>();
    
    // Add deposit IDs from routes
    filteredRoutes.forEach(route => {
      if (route.depositId) {
        allDepositIds.add(route.depositId);
      }
    });
    
    // Add deposit IDs from temp routes
    tempFlexRoutes.forEach((_, depositId) => {
      allDepositIds.add(depositId);
    });
    
    // Add all known deposits to ensure they're always shown
    Object.keys(depositNames).forEach(key => {
      allDepositIds.add(Number(key));
    });

    // Sort deposits by depositId
    const sortedDepositIds = Array.from(allDepositIds).sort((a, b) => a - b);
    
    // If no deposits to show, return null
    if (sortedDepositIds.length === 0) return null;

    return (
      <div className="mb-6">
        {sortedDepositIds.map(depositId => {
          const depositRoutes = routesByDeposit.get(depositId) || [];
          
          // Sort routes within deposit by routeName
          // Temporary routes should appear at the end
          const sortedRoutes = depositRoutes.sort((a, b) => {
            const aIsTemp = (a as RouteWithTemporary).isTemporary === true;
            const bIsTemp = (b as RouteWithTemporary).isTemporary === true;
            
            // Temporary routes go to the end
            if (aIsTemp && !bIsTemp) return 1;
            if (!aIsTemp && bIsTemp) return -1;
            
            // Both temporary or both not temporary, sort by name
            const nameA = a.routeName || '';
            const nameB = b.routeName || '';
            return nameA.localeCompare(nameB);
          });

          const depositName = depositNames[depositId] || `Deposit ${depositId}`;

          return (
            <div key={depositId} className="mb-4">
              <div className="bg-slate-100 px-3 py-2 border-b border-slate-300" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="text-sm font-semibold text-slate-700">{depositName}</div>
                <button
                  type="button"
                  onClick={() => handleAddFlexRoute(depositId)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  title="Add Flex Route"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Flex</span>
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                {/* Grid - Using planner-grid class for consistency */}
                <div className="planner-grid planner-weekly-grid">
                  {/* Header Row */}
                  <div className="grid-header label-header">Route</div>
                  {weekDates.map((d, i) => {
                    const isWeekendDay = i === 5 || i === 6; // Saturday or Sunday
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                    const dateNum = formatDate(d, 'dd/mm');
                    return (
                      <div
                        key={i}
                        className={`grid-header ${isWeekendDay ? 'weekend' : ''}`}
                      >
                        {`${dayName} (${dateNum})`}
                      </div>
                    );
                  })}

                  {/* Route Rows */}
                  {sortedRoutes.map((route) => (
                    <React.Fragment key={route.routeId}>
                      <RouteLabel route={route} />
                      {weekDates.map((dayDate, i) => {
                        const isWeekendDay = i === 5 || i === 6;
                        return (
                          <DayCell
                            key={`${route.routeId}-${formatDate(dayDate, 'yyyy-mm-dd')}`}
                            route={route}
                            date={dayDate}
                            isWeekend={isWeekendDay}
                            assignments={data.assignments}
                            vendors={data.vendors}
                            routes={data.routes}
                            onEditAssignment={onEdit}
                            onDrop={(data, routeId, dateStr, e) => {
                              setDraggedFromCell(null);
                              onDrop(e as React.DragEvent<HTMLDivElement>, routeId, dateStr);
                            }}
                            draggedItem={draggedItem}
                            draggedFromCell={draggedFromCell}
                            onDragStart={(e, data, cell) => handleCardDragStart(e, data, cell)}
                          />
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Helper to filter and render routes by section (kept for backward compatibility)
  const _renderSection = (
    title: string, 
    routes: Route[], 
    filterFn?: (route: Route) => boolean
  ) => {
    let filteredRoutes = filterFn ? routes.filter(filterFn) : routes;
    
    // Sort by depositId, then by routeName
    filteredRoutes = filteredRoutes.sort((a, b) => {
      const depositIdA = a.depositId ?? 0;
      const depositIdB = b.depositId ?? 0;
      
      // First sort by depositId
      if (depositIdA !== depositIdB) {
        return depositIdA - depositIdB;
      }
      
      // If same depositId, sort by routeName
      const nameA = a.routeName || '';
      const nameB = b.routeName || '';
      return nameA.localeCompare(nameB);
    });
    
    if (filteredRoutes.length === 0) return null;

    return (
      <div className="mb-6">
        <h6 className="text-lg font-semibold text-slate-800 mb-3 px-2">{title}</h6>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {/* Grid - Using planner-grid class for consistency */}
          <div className="planner-grid planner-weekly-grid">
            {/* Header Row */}
            <div className="grid-header label-header">Route</div>
            {weekDates.map((d, i) => {
              const isWeekendDay = i === 5 || i === 6; // Saturday or Sunday
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
              const dateNum = formatDate(d, 'dd/mm');
              return (
                <div
                  key={i}
                  className={`grid-header ${isWeekendDay ? 'weekend' : ''}`}
                >
                  {`${dayName} (${dateNum})`}
                </div>
              );
            })}

            {/* Route Rows */}
            {filteredRoutes.map((route) => (
              <React.Fragment key={route.routeId}>
                <RouteLabel route={route} />
                {weekDates.map((dayDate, i) => {
                  const isWeekendDay = i === 5 || i === 6;
                  return (
                    <DayCell
                      key={`${route.routeId}-${formatDate(dayDate, 'yyyy-mm-dd')}`}
                      route={route}
                      date={dayDate}
                      isWeekend={isWeekendDay}
                      assignments={data.assignments}
                      vendors={data.vendors}
                      routes={data.routes}
                      onEditAssignment={onEdit}
                      onDrop={(data, routeId, dateStr, e) => {
                        setDraggedFromCell(null);
                        onDrop(e as React.DragEvent<HTMLDivElement>, routeId, dateStr);
                      }}
                      draggedItem={draggedItem}
                      draggedFromCell={draggedFromCell}
                      onDragStart={(e, data, cell) => handleCardDragStart(e, data, cell)}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Combine all routes (excluding management and ad_hoc for now, they can be added separately if needed)
  const allRoutes = data.routes.filter((r) => 
    !(r.category === 'management') &&
    !(r.category === 'ad_hoc')
  );

  const managementRoutes = data.routes.filter((r) => 
    r.category === 'management'
  );

  const adHocRoutes = data.routes.filter((r) => 
    r.category === 'ad_hoc'
  );

  return (
    <div id="weekly-planner-view" className="space-y-6">
      {renderSectionByDeposit('', allRoutes)}
      {managementRoutes.length > 0 && renderSectionByDeposit('Management Routes', managementRoutes)}
      {adHocRoutes.length > 0 && renderSectionByDeposit('Ad-hoc Services', adHocRoutes)}
    </div>
  );
};

export default WeeklyView;



