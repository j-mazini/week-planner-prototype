"use client";

import React, { memo, useMemo, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { getWeekDatesFiltered, formatDate } from '../../utils/dateUtils';
import type { WeekPlannerRecord } from '../../contexts/PlannerContext';
import type { Route, DepositWithRoutesDTO } from '@/lib/api/routes';
import type { Vendor } from '@/lib/vendors';
import type { DragItem } from '../../hooks/useDragAndDrop';
import WeekGrid from './WeekGrid';
import AdHocServicesSection from './AdHocServicesSection';
// FlexRoutesSection kept for compatibility (flex routes are now shown in the main grid above)
import { isFlexRoute } from '../../utils/depotOrganizationUtils';
import { isBaopDepositName } from '@/lib/allowedDeposits';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

type DepositSectionProps = {
  deposit: DepositWithRoutesDTO;
  date: string;
  showWeekends: boolean;
  assignmentsByDate: Map<string, WeekPlannerRecord[]>;
  vendors: Vendor[];
  routes: Route[];
  onEdit: (assignment: WeekPlannerRecord) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, routeId: number, dateStr: string) => void;
  onAssignVendor?: (
    userId: number,
    routeId: number,
    date: string,
    overrides?: {
      vehicleId?: number;
      costModelId?: number;
      routeSort?: "yes" | "no";
      notes?: string;
    }
  ) => void;
  onOpenDraftAssignmentForRoute?: (
    routeId: number,
    date: string,
    depositId?: number,
    depositName?: string,
    routeName?: string,
    editData?: { userId?: number; vehicleId?: number; routeSort?: string; notes?: string; registrationPlate?: string },
  ) => void;
  onCreateAdHocService?: (
    userId: number,
    adhocServiceId: number,
    date: string,
    depositId?: number,
    depositName?: string,
    notes?: string,
    adhocSort?: number,
    dates?: string[],
    vehicleId?: number
  ) => Promise<void>;
  onCreateBaopService?: (
    userId: number,
    routeId: number,
    date: string,
    depositId?: number,
    depositName?: string,
    notes?: string,
    adhocSort?: number
  ) => Promise<void>;
  onAssignmentDelete?: (assignment: WeekPlannerRecord, options?: { forceDelete?: boolean }) => Promise<void>;
  selectedFlexRoutesByDeposit: Map<number | null, Set<number>>;
  setSelectedFlexRoutesByDeposit: React.Dispatch<React.SetStateAction<Map<number | null, Set<number>>>>;
  closedAdHocRoutesByDeposit: Map<number | null, Set<number>>;
  setClosedAdHocRoutesByDeposit: React.Dispatch<React.SetStateAction<Map<number | null, Set<number>>>>;
  setOpenModalDepositId: (id: number | null) => void;
  setOpenAdHocModalDepositId: (id: number | null, dateStr?: string) => void;
  draggedItem?: DragItem | null;
  draggedFromCell?: HTMLElement | null;
  onDragStart?: (e: React.DragEvent, data: DragItem, cell: HTMLElement) => void;
  hasAssignments: (routeId: number) => boolean;
  /** Open modal to add supervisor to this deposit (daily team support) */
  onAddSupervisor?: (depositId: number, depositName: string) => void;
  canAddFlexRoute?: boolean;
};

const DepositSection = memo<DepositSectionProps>(({
  deposit,
  date,
  showWeekends,
  assignmentsByDate,
  vendors,
  routes,
  onEdit,
  onDrop,
  onCreateAdHocService,
  selectedFlexRoutesByDeposit,
  closedAdHocRoutesByDeposit,
  setClosedAdHocRoutesByDeposit,
  setOpenModalDepositId,
  setOpenAdHocModalDepositId,
  draggedItem,
  draggedFromCell,
  onDragStart,
  hasAssignments: _hasAssignments,
  onAddSupervisor,
  canAddFlexRoute = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const weekDates = useMemo(() => getWeekDatesFiltered(date, showWeekends), [date, showWeekends]);
  const isBaop = useMemo(() => isBaopDepositName(deposit.depositName ?? ""), [deposit.depositName]);


  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // Quando o utilizador clica num assignment na tabela principal do depósito,
  // marcamos a origem como "deposit-routes" para que o modal não permita editar ADHOC.
  const handleEditFromDepositRoutes = useCallback((assignment: WeekPlannerRecord) => {
    const raw = (assignment.raw ?? {}) as Record<string, unknown>;
    const cloned: WeekPlannerRecord = {
      ...assignment,
      raw: {
        ...raw,
        __source: 'deposit-routes',
      },
    };
    onEdit(cloned);
  }, [onEdit]);

  // Para a secção ADHOC Services mantemos a origem distinta,
  // permitindo que o modal continue a mostrar os campos de ADHOC.
  const handleEditFromAdHocSection = useCallback((assignment: WeekPlannerRecord) => {
    const raw = (assignment.raw ?? {}) as Record<string, unknown>;
    const cloned: WeekPlannerRecord = {
      ...assignment,
      raw: {
        ...raw,
        __source: 'adhoc-section',
      },
    };
    onEdit(cloned);
  }, [onEdit]);

  // Filter routes: core routes (isFlex=false) + flex with week-planner items or user-selected
  const regularRoutes = useMemo(() => {
    const dId = deposit.depositId;
    const _selectedFlexRouteIds = selectedFlexRoutesByDeposit.get(dId ?? null) || new Set<number>();

      // Check if a route has assignments in this week
    const hasAssignmentsInWeek = (routeId: number): boolean => {
      const weekDateStrings = weekDates.map(d => formatDate(d, 'yyyy-mm-dd'));

      for (const [dateStr, assignments] of assignmentsByDate.entries()) {
        if (!weekDateStrings.includes(dateStr)) continue;
        if (assignments.some(a => {
          const raw = a.raw as Record<string, unknown> | undefined;
          const routeObj = raw?.route && typeof raw.route === 'object' ? (raw.route as Record<string, unknown>) : null;
          return raw?.routeId === routeId || routeObj?.routeId === routeId;
        })) {
          return true;
        }
      }
      return false;
    };

    return deposit.routes.filter(route => {
      const routeIsFlex = isFlexRoute(route);
      const routeName = route.routeName ?? "";
      const rId = route.routeId;
      const isAdHoc = routeName.toLowerCase().includes('adhoc') ||
                      routeName.toLowerCase().includes('ad-hoc') ||
                      routeName.toLowerCase().includes('dhoc') ||
                      rId === 55 ||
                      rId === BUSINESS_RULES.ROUTE.DHOC;

      // BAOP exception: all routes are always shown in the main grid
      if (isBaop) return true;

      // Core routes (isFlex=false): show always (exclude adhoc)
      if (!routeIsFlex) return !isAdHoc;

      // Flex routes: show only when they have week-planner items in THIS WEEK
      // Even if user selected them, only show if they have assignments in the current week
      return rId !== undefined && hasAssignmentsInWeek(rId);
    });
  }, [deposit.routes, selectedFlexRoutesByDeposit, deposit.depositId, isBaop, weekDates, assignmentsByDate]);

  const routesAsRoute: Route[] = regularRoutes.map(route => ({
    ...route,
    routeId: route.routeId,
    routeName: route.routeName ?? route.routeDefaultName,
  }));

  // Exclude assignments with adhocServiceId from regular routes - they only appear in ADHOC Services
  const assignmentsByDateForRegularAndFlex = useMemo(() => {
    const filtered = new Map<string, WeekPlannerRecord[]>();
    assignmentsByDate.forEach((assignments, dateStr) => {
      const withoutAdhoc = assignments.filter((a) => {
        const raw = a.raw as Record<string, unknown> | undefined;
        if (!raw) return true;
        const adhocServiceObj = raw.adhocService && typeof raw.adhocService === 'object'
          ? (raw.adhocService as Record<string, unknown>)
          : null;
        const aid = raw.adhocServiceId ?? adhocServiceObj?.adhocServiceId ?? null;
        // Se tiver adhocServiceId válido, não aparece no grid principal (só na seção ADHOC)
        if (aid != null && Number.isFinite(Number(aid)) && Number(aid) > 0) {
          return false;
        }
        return true;
      });
      if (withoutAdhoc.length > 0) filtered.set(dateStr, withoutAdhoc);
    });
    return filtered;
  }, [assignmentsByDate]);

  // Team Leader por data (dailyTeamSupport associado a este depósito)
  const supervisorByDate = useMemo(() => {
    const map = new Map<string, WeekPlannerRecord>();
    const dId = deposit.depositId;
    weekDates.forEach((d) => {
      const dateStr = formatDate(d, 'yyyy-mm-dd');
      const assignmentsForDay = assignmentsByDate.get(dateStr) || [];
      const support = assignmentsForDay.find((a) => {
        const raw = a.raw as Record<string, unknown> | undefined;
        if (!raw) return false;
        const isDailyTeamSupport = a.weekPlannerId < 0 || raw.dailyTeamSupportId != null;
        if (!isDailyTeamSupport) return false;
        
        const assignmentDepositId = raw.depositId;
        if (assignmentDepositId === undefined || assignmentDepositId === null) return false;
        if (Number(assignmentDepositId) !== Number(dId)) return false;

        // Regra BAOP: Team Leader nesta seção deve vir exclusivamente da rota/nota "OPS MANAGER"
        if (isBaop) {
          const title = String(a.notes || a.route || "").toUpperCase();
          return title.includes("OPS MANAGER");
        }

        return true;
      });
      if (support) map.set(dateStr, support);
    });
    return map;
  }, [deposit.depositId, weekDates, assignmentsByDate, isBaop]);

  return (
    <div className="mb-4 w-full flex flex-col items-center relative">
      {/* Header */}
      <div className="w-full">
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-t-2xl border border-slate-200 shadow-sm mb-0">
          <div className="flex items-center gap-4 justify-between w-full">
            <div className="flex items-center gap-3">
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-700 transition-all duration-200 hover:bg-indigo-500/15 active:scale-[0.99]"
                onClick={toggleCollapse}
                title={isCollapsed ? "Expand" : "Collapse"}
                aria-expanded={!isCollapsed}
              >
                <svg 
                  className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 m-0">{deposit.depositName}</h2>
                <p className="text-sm text-slate-600 m-0 mt-0.5 font-medium">
                  {regularRoutes.length} {regularRoutes.length === 1 ? 'route' : 'routes'} scheduled
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isBaop && canAddFlexRoute && (
                <button
                  type="button"
                  onClick={() => {
                    const dId = deposit.depositId;
                    if (dId) setOpenModalDepositId(dId);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium shadow-sm transition-all duration-200 hover:bg-indigo-700 active:scale-[0.99]"
                  title="Add flex route to this deposit"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Add Flex Route</span>
                </button>
              )}
              {onAddSupervisor && (
                <button
                  type="button"
                  onClick={() => {
                     const dId = deposit.depositId;
                     const dName = deposit.depositName ?? '';
                     if (dId) onAddSupervisor(dId, dName);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-teal-500/30 bg-teal-500/15 text-teal-800 text-sm font-medium shadow-sm transition-all duration-200 hover:bg-teal-500/25 hover:border-teal-500/50 active:scale-[0.99]"
                  title="Adicionar Team Leader a este depósito"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Team Leader</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className={`w-full bg-white rounded-b-2xl px-2 pb-2 pt-0 shadow-sm border border-slate-200 border-t-0 mt-0 transition-all duration-300 ease-out ${
        isCollapsed
          ? 'max-h-0 opacity-0 p-0 m-0 [&>*]:hidden overflow-hidden'
          : 'max-h-[70vh] min-h-0 overflow-y-auto opacity-100'
      }`}>
        <WeekGrid
          weekDates={weekDates}
          showWeekends={showWeekends}
          routes={routesAsRoute}
          assignmentsByDate={assignmentsByDateForRegularAndFlex}
          vendors={vendors}
          allRoutes={routes}
          onEdit={handleEditFromDepositRoutes}
          onDrop={onDrop}
          draggedItem={draggedItem}
          draggedFromCell={draggedFromCell}
          onDragStart={onDragStart}
          headerBg="from-indigo-600 to-indigo-700"
          headerText="Route"
          emptyMessage="No routes in this deposit. Use « Add Flex Route » to add flex routes."
          supervisorByDate={supervisorByDate}
          depositName={deposit.depositName ?? undefined}
          onAddSupervisor={onAddSupervisor ? () => {
             const dId = deposit.depositId;
             const dName = deposit.depositName ?? '';
             if (dId) onAddSupervisor(dId, dName);
          } : undefined}
          allowFlexibleCellHeight={isBaop}
        />
      </div>

      {!isBaop && (
        <>
          {/* ADHOC Services Section - Inside Deposit */}
          <AdHocServicesSection
            deposit={deposit}
            date={date}
            showWeekends={showWeekends}
            assignmentsByDate={assignmentsByDate}
            vendors={vendors}
            routes={routes}
            onEdit={handleEditFromAdHocSection}
            onDrop={onDrop}
            onCreateAdHocService={onCreateAdHocService}
            closedAdHocRoutesByDeposit={closedAdHocRoutesByDeposit}
            setClosedAdHocRoutesByDeposit={setClosedAdHocRoutesByDeposit}
            setOpenAdHocModalDepositId={setOpenAdHocModalDepositId}
            draggedItem={draggedItem}
            draggedFromCell={draggedFromCell}
            onDragStart={onDragStart}
          />
        </>
      )}
    </div>
  );
});

DepositSection.displayName = 'DepositSection';

export default DepositSection;

