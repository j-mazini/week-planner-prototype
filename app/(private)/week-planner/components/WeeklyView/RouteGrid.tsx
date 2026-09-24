"use client";

import React, { useMemo } from 'react';
import { formatDate, isWeekend } from '../../utils/dateUtils';
import type { Route } from '@/lib/api/routes';
import type { Vendor } from '@/lib/vendors';
import type { WeekPlannerRecord } from '../../contexts/PlannerContext';
import type { DragItem } from '../../hooks/useDragAndDrop';
import { isFlexRoute } from '../../utils/depotOrganizationUtils';
import RouteLabel from '../Common/RouteLabel';
import DayCell from './DayCell';

export interface RouteGridProps {
  weekDates: Date[];
  showWeekends: boolean;
  organized: {
    core: Route[];
    flex: Route[];
  };
  shouldShowFlex: boolean;
  data: {
    assignments: WeekPlannerRecord[];
    routes: Route[];
    vendors: Vendor[];
  };
  onDrop: (e: React.DragEvent<HTMLDivElement>, routeId: number, dateStr: string) => void;
  onEdit: (assignment: WeekPlannerRecord) => void;
  draggedItem: unknown;
  draggedFromCell: HTMLElement | null;
  onDragStart: (e: React.DragEvent, data: unknown, cell: HTMLElement) => void;
  onRemoveFlexRoute?: (routeId: number) => void;
  onSwitchWeekPlanner?: (
    weekPlannerId: number,
    type: 'date' | 'route',
    direction: 'prev' | 'next',
    currentDate?: string,
    currentRouteId?: number
  ) => Promise<void>;
  onRemoveVendorFromRoute?: (weekPlannerId: number) => Promise<void>;
  onRemoveVendorFromWeek?: (userId: number, weekStartDate: string) => Promise<void>;
  isAdHoc?: boolean;
  onRemoveAdHocRoute?: (routeId: number) => void;
}

// Constants
const HEADER_HEIGHT = 'h-[30px] min-h-[30px] max-h-[30px]';
const BASE_HEADER_CLASSES = 'px-3 py-2.5 text-[0.7rem] font-bold text-center border-r border-slate-300/30 border-b border-slate-300/30 uppercase tracking-[0.05em] flex items-center justify-center transition-all duration-200 box-border';
const FLEX_HEADER_CLASSES = 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/80 border-b-2 border-b-orange-500/60';

const RouteGrid: React.FC<RouteGridProps> = ({
  weekDates,
  showWeekends,
  organized,
  shouldShowFlex,
  data,
  onDrop,
  onEdit,
  draggedItem,
  draggedFromCell,
  onDragStart,
  onRemoveFlexRoute,
  onSwitchWeekPlanner: _onSwitchWeekPlanner,
  onRemoveVendorFromRoute: _onRemoveVendorFromRoute,
  onRemoveVendorFromWeek: _onRemoveVendorFromWeek,
  isAdHoc: _isAdHoc = false,
  onRemoveAdHocRoute,
}) => {
  const assignmentsByDate = useMemo(() => {
    const map = new Map<string, WeekPlannerRecord[]>();
    for (const a of data.assignments) {
      const key = a.date;
      const list = map.get(key);
      if (list) list.push(a);
      else map.set(key, [a]);
    }
    return map;
  }, [data.assignments]);

  // Memoized computed values
  const gridColumns = useMemo(() =>
    !showWeekends 
      ? 'grid-cols-[140px_repeat(5,160px)] md:grid-cols-[120px_repeat(5,minmax(0,1fr))]' 
      : 'grid-cols-[140px_repeat(7,160px)] md:grid-cols-[120px_repeat(7,minmax(0,1fr))]',
    [showWeekends]
  );

  // Memoize weekend calculations for each date
  const dateInfo = useMemo(() => 
    weekDates.map((date) => ({
      date,
      dateStr: formatDate(date, 'yyyy-mm-dd'),
      isWeekendDay: isWeekend(date),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      dateNum: formatDate(date, 'dd/mm'),
    })),
    [weekDates]
  );

  // Render route row helper
  const renderRouteRow = (route: Route, isFlexParam: boolean = false, index?: number) => {
    // Determine if route is flex: use parameter first, then check with utility function
    const routeIsFlex = isFlexParam || isFlexRoute(route);
    
    // Create unique key combining routeId, flex status, and index to avoid duplicates
    const uniqueKey = `route-${route.routeId}-${routeIsFlex ? 'flex' : 'core'}${index !== undefined ? `-${index}` : ''}`;
    
    return (
      <React.Fragment key={uniqueKey}>
        <RouteLabel 
          route={routeIsFlex ? { ...route, isFlex: true } : route}
          onRemoveFlexRoute={routeIsFlex ? onRemoveFlexRoute : undefined}
          onRemoveAdHoc={routeIsFlex ? onRemoveAdHocRoute : undefined}
        />
      {dateInfo.map(({ date, dateStr, isWeekendDay }) => (
        <DayCell
          key={`${route.routeId}-${dateStr}`}
          route={route}
          date={date}
          isWeekend={isWeekendDay}
          assignments={assignmentsByDate.get(dateStr) || []}
          vendors={data.vendors}
          routes={data.routes}
          onEditAssignment={onEdit}
          onDrop={(dropData, routeId, dateStr, e) => {
            onDrop(e as React.DragEvent<HTMLDivElement>, routeId, dateStr);
          }}
          draggedItem={draggedItem as DragItem | null}
          draggedFromCell={draggedFromCell}
          onDragStart={(e, dragData, cell) => onDragStart(e, dragData, cell)}
        />
      ))}
    </React.Fragment>
    );
  };

  return (
    <div className="w-full overflow-x-auto md:overflow-visible pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className={`grid gap-0 items-stretch border border-slate-300/30 rounded-xl overflow-hidden bg-white ${gridColumns} text-[0.85em] shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.02)] w-max min-w-full md:w-full`}>
        {/* Header Row - fundo branco s�lido para evitar conte�do por tr�s ao scroll */}
        <div className={`${BASE_HEADER_CLASSES} bg-white border-b border-slate-300/30 text-slate-800 ${HEADER_HEIGHT} shadow-sm`}>
          <span className="text-[0.75rem] font-bold tracking-[0.05em]">Route</span>
        </div>
        {dateInfo.map(({ dateStr, isWeekendDay, dayName, dateNum }) => (
          <div
            key={dateStr}
            className={`${BASE_HEADER_CLASSES} flex-col gap-0.5 ${HEADER_HEIGHT} ${
              isWeekendDay 
                ? 'bg-amber-50 text-amber-900 border-amber-300/40' 
                : 'bg-slate-50 text-slate-700'
            } hover:brightness-105 transition-all duration-200`}
          >
            <span className={`text-[0.68rem] font-bold ${isWeekendDay ? 'text-amber-900' : 'text-slate-800'}`}>
              {dayName}
            </span>
            <span className={`text-[0.62rem] font-semibold ${isWeekendDay ? 'text-amber-800' : 'text-slate-600'}`}>
              {dateNum}
            </span>
          </div>
        ))}

        {/* Route Rows - CORE Routes First */}
        {organized.core.map((route, index) => renderRouteRow(route, false, index))}
        
        {/* FLEX Routes Header (if there are flex routes and they should be shown) */}
        {organized.flex.length > 0 && shouldShowFlex && (
          <>
            <div className={`${BASE_HEADER_CLASSES} ${FLEX_HEADER_CLASSES} text-orange-800 ${HEADER_HEIGHT} font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]`}>
              <span className="bg-gradient-to-r from-orange-200 to-amber-200 text-orange-900 px-3 py-1.5 rounded-lg text-[0.75rem] font-bold shadow-sm border border-orange-300/40">
                FLEX ROUTES
              </span>
            </div>
            {/* Empty cells for day columns */}
            {dateInfo.map(({ dateStr }) => (
              <div 
                key={`flex-header-${dateStr}`} 
                className={`${BASE_HEADER_CLASSES} ${FLEX_HEADER_CLASSES} ${HEADER_HEIGHT} border-orange-300/30`} 
              />
            ))}
          </>
        )}
        
        {/* Route Rows - FLEX Routes */}
        {organized.flex.length > 0 && shouldShowFlex && organized.flex.map((route, index) => 
          renderRouteRow(route, true, index)
        )}
      </div>
    </div>
  );
};

export default RouteGrid;



