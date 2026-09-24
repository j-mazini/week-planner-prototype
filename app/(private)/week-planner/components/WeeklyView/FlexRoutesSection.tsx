"use client";

import React, { memo, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { getWeekDatesFiltered } from '../../utils/dateUtils';
import type { WeekPlannerRecord } from '../../contexts/PlannerContext';
import type { Route, DepositWithRoutesDTO } from '@/lib/api/routes';
import type { Vendor } from '@/lib/vendors';
import type { DragItem } from '../../hooks/useDragAndDrop';
import WeekGrid from './WeekGrid';
import { isFlexRoute } from '../../utils/depotOrganizationUtils';
import { deleteOperationsManagementBulk } from '@/lib/operations-management-api';

type FlexRoutesSectionProps = {
  deposit: DepositWithRoutesDTO;
  date: string;
  showWeekends: boolean;
  assignmentsByDate: Map<string, WeekPlannerRecord[]>;
  vendors: Vendor[];
  routes: Route[];
  onEdit: (assignment: WeekPlannerRecord) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, routeId: number, dateStr: string) => void;
  onQuickAdd?: (routeId: number, dateStr: string) => void;
  selectedFlexRoutesByDeposit: Map<number | null, Set<number>>;
  setSelectedFlexRoutesByDeposit: React.Dispatch<React.SetStateAction<Map<number | null, Set<number>>>>;
  setOpenModalDepositId: (id: number | null) => void;
  draggedItem?: DragItem | null;
  draggedFromCell?: HTMLElement | null;
  onDragStart?: (e: React.DragEvent, data: DragItem, cell: HTMLElement) => void;
  hasAssignments: (routeId: number) => boolean;
};

const FlexRoutesSection = memo<FlexRoutesSectionProps>(({
  deposit,
  date,
  showWeekends,
  assignmentsByDate,
  vendors,
  routes,
  onEdit,
  onDrop,
  onQuickAdd,
  selectedFlexRoutesByDeposit,
  setSelectedFlexRoutesByDeposit,
  setOpenModalDepositId,
  draggedItem,
  draggedFromCell,
  onDragStart,
  hasAssignments: _hasAssignments,
}) => {
  const weekDates = useMemo(() => getWeekDatesFiltered(date, showWeekends), [date, showWeekends]);

  const flexRoutes = useMemo(() => {
    const selectedFlexRouteIds = selectedFlexRoutesByDeposit.get(deposit.depositId) || new Set<number>();

    return deposit.routes.filter(route => {
      const routeAsRoute: Route = {
        routeId: route.routeId,
        routeName: route.routeName,
        active: route.active,
        customerId: route.customerId,
        depositId: route.depositId,
        serviceTypeId: route.serviceTypeId,
      };
      const routeIsFlex = isFlexRoute(routeAsRoute);

      if (routeIsFlex) {
        return selectedFlexRouteIds.has(route.routeId);
      }
      return false;
    });
  }, [deposit.routes, selectedFlexRoutesByDeposit, deposit.depositId]);

  const handleRemoveFlexRoute = async (routeId: number) => {
    try {
      const operationIds: number[] = [];
      assignmentsByDate.forEach((assignments) => {
        assignments.forEach((assignment) => {
          const raw = assignment.raw as Record<string, unknown> | undefined;
          if (!raw) return;

          let assignmentRouteId: number | null = null;
          if (raw.route && typeof raw.route === 'object') {
            const routeObj = raw.route as Record<string, unknown>;
            assignmentRouteId = routeObj.routeId ? Number(routeObj.routeId) : null;
          }
          if (!assignmentRouteId && raw.routeId) {
            assignmentRouteId = Number(raw.routeId);
          }

          if (assignmentRouteId === routeId) {
            const opId = assignment.operationId ?? (raw.operationId ? Number(raw.operationId) : undefined);
            if (opId) operationIds.push(opId);
          }
        });
      });

      if (operationIds.length > 0) {
        await deleteOperationsManagementBulk({ operationIds: operationIds });
      }
    } catch (error) {
      console.error("Failed to bulk delete operations for flex route:", error);
    }

    setSelectedFlexRoutesByDeposit(prev => {
      const newMap = new Map(prev);
      const currentSelected = newMap.get(deposit.depositId) || new Set<number>();
      const updatedSelected = new Set(currentSelected);
      updatedSelected.delete(routeId);
      newMap.set(deposit.depositId, updatedSelected);
      return newMap;
    });

    setOpenModalDepositId(null);
  };

  const routesAsRoute: Route[] = flexRoutes.map(route => ({
    routeId: route.routeId,
    routeName: route.routeName,
    active: route.active,
    customerId: route.customerId,
    depositId: route.depositId,
    serviceTypeId: route.serviceTypeId,
  }));

  return (
    <div className="mt-4 w-full flex flex-col items-center relative">
      {/* Header - always visible with Add New Flex Route button */}
      <div className="w-full">
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-t-2xl border border-slate-200 shadow-sm mb-0">
          <div className="flex items-center gap-4 justify-between w-full">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 m-0">
                  {deposit.depositName} - Flex Routes
                </h2>
                <p className="text-sm text-slate-600 m-0 mt-0.5 font-medium">
                  {flexRoutes.length} {flexRoutes.length === 1 ? 'route' : 'routes'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpenModalDepositId(deposit.depositId)}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 active:scale-[0.99]"
              title="Add a flex route that is not yet open in this depot"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Flex Route</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Container - shows empty state when no flex routes */}
      <div className="w-full bg-white rounded-b-2xl p-2 shadow-sm border border-slate-200 border-t-0 mt-0 overflow-hidden transition-all duration-300 ease-out">
        <WeekGrid
          weekDates={weekDates}
          showWeekends={showWeekends}
          routes={routesAsRoute}
          assignmentsByDate={assignmentsByDate}
          vendors={vendors}
          allRoutes={routes}
          onEdit={onEdit}
          onDrop={onDrop}
          draggedItem={draggedItem}
          draggedFromCell={draggedFromCell}
          onDragStart={onDragStart}
          onRemoveFlexRoute={handleRemoveFlexRoute}
          onQuickAdd={onQuickAdd}
          showQuickAddButton={true}
          quickAddLabel="Open"
          headerBg="from-indigo-600 to-indigo-700"
          headerText="Route"
          emptyMessage="No flex routes. Click « Add New Flex Route » to add one."
        />
      </div>
    </div>
  );
});

FlexRoutesSection.displayName = 'FlexRoutesSection';

export default FlexRoutesSection;



