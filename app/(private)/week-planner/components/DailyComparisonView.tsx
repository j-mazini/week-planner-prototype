"use client";

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { formatDate, isWeekend } from '../utils/dateUtils';
import type { WeekPlannerRecord } from '../contexts/PlannerContext';
import type { Route, DepositWithRoutesDTO } from '@/lib/api/routes';
import type { Vendor } from '@/lib/vendors';
import VendorCard from './Common/VendorCard';
import VendorAssignCard from './Common/VendorAssignCard';
import { useDragAndDrop, type DragItem } from '../hooks/useDragAndDrop';
import { isFlexRoute } from '../utils/depotOrganizationUtils';
import { filterAllowedDeposits } from '@/lib/allowedDeposits';
import { Users } from 'lucide-react';
import AdHocServiceModal from './modals/AdHocServiceModal';
import FlexRouteSelectionModal from './modals/FlexRouteSelectionModal';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

type RawVendorRef = { userId?: number; fullName?: string };

type DailyComparisonViewProps = {
  startDate: Date;
  daysToShow?: number;
  showWeekends?: boolean;
  data: {
    assignments: WeekPlannerRecord[];
    routes: Route[];
    vendors: Vendor[];
  };
  depositsWithRoutes?: DepositWithRoutesDTO[];
  onDrop: (e: React.DragEvent<HTMLDivElement>, routeId: number, dateStr: string) => void;
  onEdit: (assignment: WeekPlannerRecord) => void;
  onDateChange?: (date: Date) => void;
  draggedItem?: DragItem | null;
  draggedFromCell?: HTMLElement | null;
  onDragStart?: (e: React.DragEvent, data: DragItem, cell: HTMLElement) => void;
  onSwitchWeekPlanner?: (
    weekPlannerId: number,
    type: 'date' | 'route',
    direction: 'prev' | 'next',
    currentDate?: string,
    currentRouteId?: number
  ) => Promise<void>;
  onRemoveVendorFromRoute?: (weekPlannerId: number) => Promise<void>;
  onRemoveVendorFromWeek?: (userId: number, weekStartDate: string  ) => Promise<void>;
  hideAdhocSort?: boolean;
  onCreateAdHocService?: (
    userId: number,
    adhocServiceId: number,
    date: string,
    depositId?: number,
    depositName?: string,
    notes?: string,
    adhocSort?: number,
    dates?: string[]
  ) => Promise<void>;
};

const isAdHocRoute = (route: Route): boolean => {
  const routeName = (route.routeName ?? '').toLowerCase();
  const routeId = route.routeId;
  return route.category === 'ad_hoc' || 
         routeName.includes('adhoc') || 
         routeName.includes('ad-hoc') ||
         routeName.includes('dhoc') ||
         routeId === 55 || // Include BRTE route (routeId 55)
         routeId === BUSINESS_RULES.ROUTE.DHOC; // Include DHOC route
};

// Helper to get adhoc service type from route name
const getAdHocServiceType = (route: Route): string => {
  const routeName = (route.routeName ?? '').toLowerCase();
  
  if (routeName.includes('cmp') || routeName.includes('unload')) {
    return 'cmp_unload';
  }
  if (routeName.includes('flyer') || routeName.includes('flyers')) {
    return 'flyer_sort';
  }
  if (routeName.includes('boat')) {
    return 'boat';
  }
  if (routeName.includes('pre9') || routeName.includes('pre-9') || routeName.includes('pre9_delivery')) {
    return 'pre9_delivery';
  }
  
  return 'other';
};

const DailyComparisonView: React.FC<DailyComparisonViewProps> = ({
  startDate,
  showWeekends = false,
  data,
  depositsWithRoutes = [],
  onDrop,
  onEdit,
  onDateChange,
  draggedItem,
  draggedFromCell,
  onDragStart,
  hideAdhocSort = false,
  onCreateAdHocService,
}) => {
  const { handleDragOver, handleDragLeave, handleDrop: handleDropInternal, cleanupDrag } = useDragAndDrop();
  
  // State for managing modals
  const [openAdHocModalDepositId, setOpenAdHocModalDepositId] = useState<number | null>(null);
  const [openAdHocModalDate, setOpenAdHocModalDate] = useState<string | null>(null);
  const [openFlexRouteModalDepositId, setOpenFlexRouteModalDepositId] = useState<number | null>(null);

  // Show only one day at a time
  const currentDay = useMemo(() => {
    return new Date(startDate);
  }, [startDate]);

  const currentDateStr = formatDate(currentDay, 'yyyy-mm-dd');
  const isWeekendDay = isWeekend(currentDay);
  const dayName = currentDay.toLocaleDateString('en-US', { weekday: 'long' });
  const dateNum = formatDate(currentDay, 'dd/mm/yyyy');

  // Reduce per-route filtering cost by pre-filtering to just the current day
  const assignmentsForDay = useMemo(() => {
    return data.assignments.filter((a) => a.date === currentDateStr);
  }, [data.assignments, currentDateStr]);

  // AdHoc service type labels
  const adHocServiceTypeLabels: Record<string, string> = {
    'cmp_unload': 'CMP Unload',
    'flyer_sort': 'Flyer Sort',
    'boat': 'Boat',
    'pre9_delivery': 'Pre-9 Delivery',
    'other': 'Other Services'
  };

  // Process deposits - filter and organize
  const processedDeposits = useMemo(() => {
    if (!depositsWithRoutes || depositsWithRoutes.length === 0) {
      return [];
    }

    return filterAllowedDeposits(depositsWithRoutes)
      .map(deposit => {
        const depositId = deposit.depositId;
        const depositName = deposit.depositName ?? "";

        const assignmentBelongsToDeposit = (a: WeekPlannerRecord): boolean => {
          const raw = a.raw ?? {};
          const assignmentDepositId = raw.depositId;
          if (assignmentDepositId !== undefined && assignmentDepositId !== null && Number(assignmentDepositId) === Number(depositId)) {
            return true;
          }
          const assignmentDepositName = String(raw.depositName ?? "").trim();
          return assignmentDepositName !== "" && assignmentDepositName === String(depositName).trim();
        };

        // Separate routes by type
        const coreRoutes = deposit.routes.filter(route => {
          const routeIsFlex = isFlexRoute(route);
          const routeIsAdHoc = isAdHocRoute(route);
          if (routeIsFlex) {
            // Check if route has assignments for the current day
            const hasAssignments = data.assignments.some(a => {
              if (!assignmentBelongsToDeposit(a)) return false;

              const raw = a.raw;
              const routeObj = raw?.route as Route | undefined;
              const rId = route.routeId;
              const rName = route.routeName;
              const routeMatch =
                String(a.route) === String(rId) ||
                a.route === rName ||
                (routeObj?.routeId ? Number(routeObj.routeId) === rId : false);
              return routeMatch && a.date === currentDateStr;
            });
            return hasAssignments;
          }
          return !routeIsAdHoc; // Exclude adhoc from core
        });

        const flexRoutes = deposit.routes.filter(route => {
          const routeIsFlex = isFlexRoute(route);
          if (routeIsFlex) {
            const hasAssignments = data.assignments.some(a => {
              if (!assignmentBelongsToDeposit(a)) return false;

              const raw = a.raw;
              const routeObj = raw?.route as Route | undefined;
              const rId = route.routeId;
              const rName = route.routeName;
              const routeMatch =
                String(a.route) === String(rId) ||
                a.route === rName ||
                (routeObj?.routeId ? Number(routeObj.routeId) === rId : false);
              return routeMatch && a.date === currentDateStr;
            });
            return hasAssignments;
          }
          return false;
        });

        const adHocRoutes = deposit.routes.filter(route => {
          const dId = deposit.depositId;
          const rdId = route.depositId;
          return isAdHocRoute(route) && rdId === dId;
        });

        // Group adhoc routes by service type
        const adHocRoutesByType = adHocRoutes.reduce((acc, route) => {
          const type = getAdHocServiceType(route);
          if (!acc[type]) {
            acc[type] = [];
          }
          acc[type].push(route);
          return acc;
        }, {} as Record<string, typeof deposit.routes>);

        return {
          ...deposit,
          coreRoutes,
          flexRoutes,
          adHocRoutes,
          adHocRoutesByType
        };
      })
      .sort((a, b) => {
        const aId = a.depositId;
        const bId = b.depositId;
        if (aId === null || aId === undefined) return 1;
        if (bId === null || bId === undefined) return -1;
        return aId - bId;
      });
  }, [depositsWithRoutes, data.assignments, currentDateStr]);

  const handlePrevDay = () => {
    const newDate = new Date(currentDay);
    do {
      newDate.setDate(newDate.getDate() - 1);
    } while (!showWeekends && (newDate.getDay() === 0 || newDate.getDay() === 6));
    onDateChange?.(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDay);
    do {
      newDate.setDate(newDate.getDate() + 1);
    } while (!showWeekends && (newDate.getDay() === 0 || newDate.getDay() === 6));
    onDateChange?.(newDate);
  };

  const handleCellDrop = (data: DragItem, routeId: number, dateStr: string, e: React.DragEvent) => {
    onDrop(e as React.DragEvent<HTMLDivElement>, routeId, dateStr);
  };

  const handleDragStartCard = (e: React.DragEvent, data: { type: string; id: number; assignmentId?: number; userId: number }) => {
    const cell = e.currentTarget.closest('[data-day-cell]') as HTMLElement;
    if (onDragStart && cell) {
      onDragStart(e, data as DragItem, cell);
    }
    e.dataTransfer.setData('application/json', JSON.stringify(data));
    e.currentTarget.classList.add('dragging', 'opacity-60', 'scale-[1.05]', 'rotate-[1deg]', 'z-[1000]', 'shadow-lg');
  };

  const handleDragEndCard = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    cleanupDrag();
  };

  // Get available vendors for the current day (deduplicated by userId to avoid duplicate React keys)
  const availableVendorsForDay = useMemo(() => {
    // Deduplicate data.vendors by userId (used in list key) so the same vendor never appears twice
    const seenUserIds = new Set<number>();
    const uniqueVendors = data.vendors.filter((d) => {
      const uid = d.userId ?? 0;
      if (uid <= 0) return true;
      if (seenUserIds.has(uid)) return false;
      seenUserIds.add(uid);
      return true;
    });

    // Filter vendors that don't have an assignment on this day
    const available = uniqueVendors.filter((vendor) => {
      // Check if vendor has any assignment on this date
      const hasAssignment = data.assignments.some((assignment) => {
        const assignmentDate = assignment.date;
        
        // Check if assignment is for this date and this vendor
        if (assignmentDate !== currentDateStr) {
          return false;
        }

        // Check if assignment is for this vendor
        const raw = assignment.raw;
        const assignmentVendorId = raw.userId;
        const currentVendorId = vendor.userId;

        return Number(assignmentVendorId) === Number(currentVendorId);
      });

      return !hasAssignment;
    });

    // Sort alphabetically
    available.sort((a, b) => {
      const nameA = a.fullName?.toLowerCase() || '';
      const nameB = b.fullName?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });

    return available;
  }, [data.vendors, data.assignments, currentDateStr]);

  const handleVendorDragStart = (e: React.DragEvent, vendor: Vendor) => {
    const dId = vendor.userId;
    const dName = vendor.fullName;
    const dragItem = {
      type: 'vendor',
      id: dId,
      userId: dId,
      vendorName: dName,
      date: currentDateStr,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragItem));
    e.currentTarget.classList.add('dragging', 'opacity-60', 'scale-[1.05]', 'rotate-[1deg]', 'z-[1000]', 'shadow-lg');
  };

  return (
    <div className="w-full space-y-4">
      {/* Navigation Header - Modern Design */}
      <div className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-indigo-300/40 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 p-5 shadow-xl backdrop-blur-xl">
        {/* Glass highlights */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-60" />
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(167,139,250,0.15),transparent_60%)]" />
        </div>
        
        <button
          onClick={handlePrevDay}
          className="relative z-10 p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all duration-200 text-white hover:text-white hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl border border-white/20"
          title="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="relative z-10 flex-1 text-center">
          <h3 className="text-2xl font-bold text-white capitalize drop-shadow-lg tracking-tight">
            {dayName}
          </h3>
          <p className="text-sm text-indigo-100/90 mt-1.5 font-medium tracking-wide">
            {dateNum}
          </p>
        </div>
        
        <button
          onClick={handleNextDay}
          className="relative z-10 p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all duration-200 text-white hover:text-white hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl border border-white/20"
          title="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Deposits Columns - Side by Side */}
      <div className="w-full overflow-x-auto">
        <div className="inline-flex gap-3 min-w-full pb-4 px-2" style={{ justifyContent: processedDeposits.length > 3 ? 'flex-start' : 'center' }}>
          {processedDeposits.map((deposit) => {
            const totalRoutes = deposit.coreRoutes.length + deposit.flexRoutes.length + deposit.adHocRoutes.length;
            // Calculate column width based on number of deposits
            const columnWidth = processedDeposits.length <= 2 ? 'min-w-[350px] max-w-[400px]' :
                                processedDeposits.length <= 4 ? 'min-w-[280px] max-w-[320px]' :
                                'min-w-[260px] max-w-[300px]';

            return (
              <div
                key={deposit.depositId}
                className={`relative flex flex-col ${columnWidth} rounded-2xl overflow-hidden bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0`}
              >
                {/* Deposit Header - Modern Design */}
                <div className="relative px-4 py-3.5 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 text-white sticky top-0 z-10 shadow-md border-b border-indigo-400/30">
                  {/* Glass effect overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
                  
                  <div className="relative z-10 flex items-center justify-between mb-1.5">
                    <div className="text-base font-bold truncate drop-shadow-sm flex-1">
                      {deposit.depositName ?? `Deposit ${deposit.depositId}`}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={() => {
                          const dId = deposit.depositId;
                          if (dId) {
                            setOpenAdHocModalDepositId(dId);
                            setOpenAdHocModalDate(currentDateStr);
                          }
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-500/90 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg border border-orange-400/50 backdrop-blur-sm"
                        title="Add Ad-Hoc Service"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ad-Hoc</span>
                      </button>
                      <button
                        onClick={() => {
                          const dId = deposit.depositId;
                          if (dId) setOpenFlexRouteModalDepositId(dId);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg backdrop-blur-sm border border-white/30"
                        title="Add Flex Route"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Flex</span>
                      </button>
                    </div>
                  </div>
                  <div className="relative z-10 text-xs mt-1.5 text-white/95 flex items-center justify-between font-medium">
                    <span className="bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20">{totalRoutes} routes</span>
                    <span className="text-white/90 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                      {currentDay.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()} {formatDate(currentDay, 'dd/mm')}
                    </span>
                  </div>
                </div>

                {/* Routes List - Scrollable */}
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                  {/* CORE Routes */}
                  {deposit.coreRoutes.length > 0 && (
                    <div className="p-3 space-y-2">
                      {deposit.coreRoutes.map((route) => {
                        const assignmentsInCell = assignmentsForDay.filter(
                          (a) => {
                            const raw = a.raw;
                            const routeObj = raw?.route as Route | undefined;
                            const routeMatch =
                              String(a.route) === String(route.routeId) ||
                              a.route === route.routeName ||
                              (routeObj?.routeId ? Number(routeObj.routeId) === route.routeId : false);
                            return routeMatch;
                          }
                        );

                        return (
                          <div
                            key={route.routeId}
                            className="border border-slate-200/70 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-slate-300/70"
                          >
                            {/* Route Label */}
                            <div className="px-3 py-2 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/60 text-[0.75rem] font-bold text-slate-800">
                              {route.routeName ?? route.routeDefaultName ?? `Route ${route.routeId}`}
                            </div>

                            {/* Day Cell */}
                            <div
                              className={[
                                'relative flex flex-col overflow-hidden box-border transition-colors duration-200',
                                'min-h-[55px] max-h-[180px] p-[3px] gap-[2px]',
                                'border border-slate-300/20 bg-white',
                                'hover:bg-slate-50',
                                isWeekendDay ? 'bg-slate-50' : '',
                              ].join(' ')}
                              data-day-cell
                              data-route-id={route.routeId}
                              data-date={currentDateStr}
                              onDragEnter={(e) => {
                                const cell = e.currentTarget.closest('[data-day-cell]') as HTMLElement;
                                if (!cell) return;
                                if (draggedItem?.type === 'card' && cell === draggedFromCell) return;
                                if (draggedItem?.type === 'off' && draggedItem.status === 'off') return;
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDropInternal(e, (data) => handleCellDrop(data, route.routeId || 0, currentDateStr, e))}
                            >
                              {assignmentsInCell.length > 0 ? (
                                assignmentsInCell.map((assignment, index) => {
                                  const raw = assignment.raw;
                                  const vendorObj = raw?.vendor as RawVendorRef | undefined;
                                  const vendor = data.vendors.find(
                                    (d) => 
                                      d.userId === Number(assignment.name) || 
                                      d.fullName === assignment.name ||
                                      d.fullName?.toLowerCase() === assignment.name?.toLowerCase() ||
                                      (vendorObj?.userId ? Number(vendorObj.userId) === d.userId : false) ||
                                      (vendorObj?.fullName ? String(vendorObj.fullName) === d.fullName : false)
                                  );
                                  
                                  const uniqueKey = assignment.weekPlannerId > 0 
                                    ? assignment.weekPlannerId 
                                    : `temp-${currentDateStr}-${route.routeId}-${raw?.userId || assignment.name}-${index}`;
                                  
                                  return vendor ? (
                                    <VendorCard
                                      key={uniqueKey}
                                      vendor={vendor}
                                      assignment={assignment}
                                      routes={data.routes}
                                      onEdit={onEdit}
                                      onDragStart={handleDragStartCard}
                                      onDragEnd={handleDragEndCard}
                                      compact
                                    />
                                  ) : (
                                    <div
                                      key={uniqueKey}
                                      className="flex w-full flex-1 justify-between items-center gap-1 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md cursor-move text-[0.65rem] transition-all duration-200 shadow-sm min-h-fit hover:border-indigo-300 hover:bg-indigo-100"
                                      onClick={() => onEdit(assignment)}
                                      title={`${assignment.name} - Click to edit`}
                                    >
                                      <span className="font-semibold text-slate-900 text-[0.65rem] truncate">{assignment.name || 'Unknown Vendor'}</span>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="flex items-center justify-center min-h-[45px] text-[0.65rem] text-slate-400 italic px-2 py-2">
                                  -
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* FLEX Routes */}
                  {deposit.flexRoutes.length > 0 && (
                    <div className="p-3 space-y-2 border-t-2 border-orange-400/50 mt-2 pt-3 bg-gradient-to-b from-orange-50/30 to-transparent">
                      <div className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[0.75rem] font-bold uppercase rounded-lg mb-2 shadow-md text-center">
                        Flex Routes
                      </div>
                      {deposit.flexRoutes.map((route) => {
                        const assignmentsInCell = assignmentsForDay.filter(
                          (a) => {
                            const raw = a.raw;
                            const routeObj = raw?.route as Route | undefined;
                            const routeMatch =
                              String(a.route) === String(route.routeId) ||
                              a.route === route.routeName ||
                              (routeObj?.routeId ? Number(routeObj.routeId) === route.routeId : false);
                            return routeMatch;
                          }
                        );

                        return (
                          <div
                            key={route.routeId}
                            className="border border-orange-200/70 rounded-xl overflow-hidden bg-gradient-to-br from-orange-50/50 to-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-orange-300/70"
                          >
                            {/* Route Label */}
                            <div className="px-3 py-2 bg-gradient-to-r from-orange-50 to-white border-b border-orange-200/60 text-[0.75rem] font-bold text-orange-900">
                              {route.routeName || `Route ${route.routeId}`}
                            </div>

                            {/* Day Cell */}
                            <div
                              className={[
                                'relative flex flex-col overflow-hidden box-border transition-colors duration-200',
                                'min-h-[55px] max-h-[180px] p-[3px] gap-[2px]',
                                'border border-slate-300/20 bg-white',
                                'hover:bg-slate-50',
                                isWeekendDay ? 'bg-slate-50' : '',
                              ].join(' ')}
                              data-day-cell
                              data-route-id={route.routeId}
                              data-date={currentDateStr}
                              onDragEnter={(e) => {
                                const cell = e.currentTarget.closest('[data-day-cell]') as HTMLElement;
                                if (!cell) return;
                                if (draggedItem?.type === 'card' && cell === draggedFromCell) return;
                                if (draggedItem?.type === 'off' && draggedItem.status === 'off') return;
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDropInternal(e, (data) => handleCellDrop(data, route.routeId || 0, currentDateStr, e))}
                            >
                              {assignmentsInCell.length > 0 ? (
                                assignmentsInCell.map((assignment, index) => {
                                  const raw = assignment.raw;
                                  const vendorObj = raw?.vendor as RawVendorRef | undefined;
                                  const vendor = data.vendors.find(
                                    (d) => 
                                      d.userId === Number(assignment.name) || 
                                      d.fullName === assignment.name ||
                                      d.fullName?.toLowerCase() === assignment.name?.toLowerCase() ||
                                      (vendorObj?.userId ? Number(vendorObj.userId) === d.userId : false) ||
                                      (vendorObj?.fullName ? String(vendorObj.fullName) === d.fullName : false)
                                  );
                                  
                                  const uniqueKey = assignment.weekPlannerId > 0 
                                    ? assignment.weekPlannerId 
                                    : `temp-${currentDateStr}-${route.routeId}-${raw?.userId || assignment.name}-${index}`;
                                  
                                  return vendor ? (
                                    <VendorCard
                                      key={uniqueKey}
                                      vendor={vendor}
                                      assignment={assignment}
                                      routes={data.routes}
                                      onEdit={onEdit}
                                      onDragStart={handleDragStartCard}
                                      onDragEnd={handleDragEndCard}
                                      compact
                                    />
                                  ) : (
                                    <div
                                      key={uniqueKey}
                                      className="flex w-full flex-1 justify-between items-center gap-1 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md cursor-move text-[0.65rem] transition-all duration-200 shadow-sm min-h-fit hover:border-indigo-300 hover:bg-indigo-100"
                                      onClick={() => onEdit(assignment)}
                                      title={`${assignment.name} - Click to edit`}
                                    >
                                      <span className="font-semibold text-slate-900 text-[0.65rem] truncate">{assignment.name || 'Unknown Vendor'}</span>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="flex items-center justify-center min-h-[45px] text-[0.65rem] text-slate-400 italic px-2 py-2">
                                  -
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ADHOC Services - Grouped by Type */}
                  {deposit.adHocRoutes.length > 0 && (
                    <div className="p-3 space-y-3 border-t-2 border-orange-400/50 mt-2 pt-3 bg-gradient-to-b from-orange-50/30 to-transparent">
                      <div className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[0.75rem] font-bold uppercase rounded-lg mb-2 shadow-md text-center">
                        {deposit.depositName || `Deposit ${deposit.depositId}`} - AdHoc Services
                      </div>
                      {Object.entries(deposit.adHocRoutesByType || {}).map(([serviceType, routes]) => (
                        <div key={serviceType} className="space-y-2">
                          {/* Service Type Header */}
                          {routes.length > 0 && (
                            <div className="px-3 py-1 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-900 text-[0.7rem] font-bold rounded-lg border-2 border-orange-200/50 shadow-sm">
                              {adHocServiceTypeLabels[serviceType] || serviceType}
                            </div>
                          )}
                          {/* Routes for this service type */}
                          {routes.map((route) => {
                            const assignmentsInCell = assignmentsForDay.filter(
                              (a) => {
                                const raw = a.raw;
                                const routeObj = raw?.route as Route | undefined;
                                const routeMatch =
                                  String(a.route) === String(route.routeId) ||
                                  a.route === route.routeName ||
                                  (routeObj?.routeId ? Number(routeObj.routeId) === route.routeId : false);
                                return routeMatch;
                              }
                            );

                            return (
                              <div
                                key={route.routeId}
                                className="border border-orange-200/70 rounded-xl overflow-hidden bg-gradient-to-br from-orange-50/50 to-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-orange-300/70"
                              >
                                {/* Route Label */}
                                <div className="px-3 py-2 bg-gradient-to-r from-orange-50 to-white border-b border-orange-200/60 text-[0.75rem] font-bold text-orange-900">
                                  {route.routeName || `Route ${route.routeId}`}
                                </div>

                                {/* Day Cell */}
                                <div
                                  className={[
                                    'relative flex flex-col overflow-hidden box-border transition-colors duration-200',
                                    'min-h-[55px] max-h-[180px] p-[3px] gap-[2px]',
                                    'border border-slate-300/20 bg-white',
                                    'hover:bg-slate-50',
                                    isWeekendDay ? 'bg-slate-50' : '',
                                  ].join(' ')}
                                  data-day-cell
                                  data-route-id={route.routeId}
                                  data-date={currentDateStr}
                                  onDragEnter={(e) => {
                                    const cell = e.currentTarget.closest('[data-day-cell]') as HTMLElement;
                                    if (!cell) return;
                                    if (draggedItem?.type === 'card' && cell === draggedFromCell) return;
                                    if (draggedItem?.type === 'off' && draggedItem.status === 'off') return;
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onDragOver={handleDragOver}
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDropInternal(e, (data) => handleCellDrop(data, route.routeId || 0, currentDateStr, e))}
                                >
                                  {assignmentsInCell.length > 0 ? (
                                    assignmentsInCell.map((assignment, index) => {
                                      const raw = assignment.raw;
                                      const vendorObj = raw?.vendor as RawVendorRef | undefined;
                                      const vendor = data.vendors.find(
                                        (d) => 
                                          d.userId === Number(assignment.name) || 
                                          d.fullName === assignment.name ||
                                          d.fullName?.toLowerCase() === assignment.name?.toLowerCase() ||
                                          (vendorObj?.userId ? Number(vendorObj.userId) === d.userId : false) ||
                                          (vendorObj?.fullName ? String(vendorObj.fullName) === d.fullName : false)
                                      );
                                      
                                      const uniqueKey = assignment.weekPlannerId > 0 
                                        ? assignment.weekPlannerId 
                                        : `temp-${currentDateStr}-${route.routeId}-${raw?.userId || assignment.name}-${index}`;
                                      
                                      return vendor ? (
                                        <VendorCard
                                          key={uniqueKey}
                                          vendor={vendor}
                                          assignment={assignment}
                                          routes={data.routes}
                                          onEdit={onEdit}
                                          onDragStart={handleDragStartCard}
                                          onDragEnd={handleDragEndCard}
                                          compact
                                        />
                                      ) : (
                                        <div
                                          key={uniqueKey}
                                          className="flex w-full flex-1 justify-between items-center gap-1 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-md cursor-move text-[0.65rem] transition-all duration-200 shadow-sm min-h-fit hover:border-orange-300 hover:bg-orange-100"
                                          onClick={() => onEdit(assignment)}
                                          title={`${assignment.name} - Click to edit`}
                                        >
                                          <span className="font-semibold text-slate-900 text-[0.65rem] truncate">{assignment.name || 'Unknown Vendor'}</span>
                                        </div>
                                      );
                                    })
                              ) : (
                                    <div className="flex items-center justify-center min-h-[50px] text-[0.7rem] text-slate-400 italic px-4 py-3">
                                      -
                                    </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {deposit.coreRoutes.length === 0 && deposit.flexRoutes.length === 0 && deposit.adHocRoutes.length === 0 && (
                    <div className="p-6 text-center">
                      <div className="text-slate-400 text-sm italic bg-slate-50/50 rounded-lg py-4 border-2 border-dashed border-slate-200">
                        No routes for this deposit
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Available Vendors Column */}
          <div className="relative flex flex-col min-w-[300px] max-w-[350px] rounded-2xl overflow-hidden bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0">
            {/* Vendors Header - Modern Design */}
            <div className="relative px-4 py-3.5 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-600 text-white sticky top-0 z-10 shadow-md border-b border-emerald-400/30">
              {/* Glass effect overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
              
              <div className="relative z-10 flex items-center gap-2 mb-1.5">
                <Users className="w-5 h-5" />
                <div className="text-base font-bold truncate drop-shadow-sm">
                  Available Vendors
                </div>
              </div>
              <div className="relative z-10 text-xs mt-1.5 text-white/95 flex items-center justify-between font-medium">
                <span className="bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20">{availableVendorsForDay.length} vendors</span>
                <span className="text-white/90 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                  {currentDay.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()} {formatDate(currentDay, 'dd/mm')}
                </span>
              </div>
            </div>

            {/* Vendors List - Scrollable */}
            <div className="flex-1 overflow-y-auto p-3" style={{ maxHeight: 'calc(100vh - 220px)' }}>
              {availableVendorsForDay.length > 0 ? (
                <div className="space-y-2">
                  {availableVendorsForDay.map((vendor, index) => {
                    const uniqueKey = `available-vendor-${currentDateStr}-${vendor.userId}-${index}`;
                    return (
                      <VendorAssignCard
                        key={uniqueKey}
                        vendor={vendor}
                        routes={data.routes}
                        dayLabel=""
                        statusLabel=""
                        draggable={true}
                        onDragStart={(event) => {
                          handleVendorDragStart(event, vendor);
                        }}
                        onDragEnd={handleDragEndCard}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="text-slate-400 text-sm italic bg-slate-50/50 rounded-lg py-4 border-2 border-dashed border-slate-200">
                    No available vendors
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ad-Hoc Service Modal */}
      {openAdHocModalDepositId !== null && (
        <AdHocServiceModal
          isOpen={openAdHocModalDepositId !== null}
          addOnly
          onClose={() => {
            setOpenAdHocModalDepositId(null);
            setOpenAdHocModalDate(null);
          }}
          onConfirm={async (service) => {
            if (onCreateAdHocService) {
              try {
                await onCreateAdHocService(
                  service.userId,
                  service.adhocServiceId || 0,
                  service.date,
                  service.depositId,
                  service.depositName,
                  service.notes,
                  service.adhocSort,
                  service.dates
                );
                setOpenAdHocModalDepositId(null);
                setOpenAdHocModalDate(null);
              } catch (error) {
                console.error('Error creating ADHOC service:', error);
              }
            } else {
              setOpenAdHocModalDepositId(null);
              setOpenAdHocModalDate(null);
            }
          }}
          depotKey={(processedDeposits.find(d => d.depositId === openAdHocModalDepositId)?.depositName) || `deposit-${openAdHocModalDepositId}`}
          depotName={(processedDeposits.find(d => d.depositId === openAdHocModalDepositId)?.depositName) || `Deposit ${openAdHocModalDepositId}`}
          depositId={openAdHocModalDepositId}
          vendors={data.vendors}
          date={openAdHocModalDate ?? startDate}
          hideAdhocSort={hideAdhocSort}
        />
      )}

      {/* Flex Route Selection Modal */}
      {openFlexRouteModalDepositId !== null && (
        <FlexRouteSelectionModal
          isOpen={openFlexRouteModalDepositId !== null}
          onClose={() => setOpenFlexRouteModalDepositId(null)}
          onConfirm={() => {
            // TODO: Implement logic to add the flex routes to the grid
            setOpenFlexRouteModalDepositId(null);
          }}
          loopKey={(processedDeposits.find(d => d.depositId === openFlexRouteModalDepositId)?.depositName) || `deposit-${openFlexRouteModalDepositId}`}
          depositId={openFlexRouteModalDepositId}
          activeRouteIds={[]}
        />
      )}
    </div>
  );
};

export default DailyComparisonView;

