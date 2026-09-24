"use client";

import React, { memo, useMemo, useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getWeekDatesFiltered } from '../../utils/dateUtils';
import type { WeekPlannerRecord } from '../../contexts/PlannerContext';
import type { Route, DepositWithRoutesDTO } from '@/lib/api/routes';
import type { Vendor } from '@/lib/vendors';
import type { DragItem } from '../../hooks/useDragAndDrop';
import WeekGrid from './WeekGrid';
import { fetchAdhocServices, type AdhocServiceDTO } from '@/lib/adhoc-services-api';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

type AdHocServicesSectionProps = {
  deposit: DepositWithRoutesDTO;
  date: string;
  showWeekends: boolean;
  assignmentsByDate: Map<string, WeekPlannerRecord[]>;
  vendors: Vendor[];
  routes: Route[];
  onEdit: (assignment: WeekPlannerRecord) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, routeId: number, dateStr: string) => void;
  onQuickAdd?: (routeId: number, dateStr: string) => void;
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
  closedAdHocRoutesByDeposit: Map<number | null, Set<number>>;
  setClosedAdHocRoutesByDeposit: React.Dispatch<React.SetStateAction<Map<number | null, Set<number>>>>;
  setOpenAdHocModalDepositId: (id: number | null, dateStr?: string) => void;
  draggedItem?: DragItem | null;
  draggedFromCell?: HTMLElement | null;
  onDragStart?: (e: React.DragEvent, data: DragItem, cell: HTMLElement) => void;
};

const AdHocServicesSection = memo<AdHocServicesSectionProps>(({
  deposit,
  date,
  showWeekends,
  assignmentsByDate,
  vendors,
  routes,
  onEdit,
  onDrop,
  onQuickAdd,
  onCreateAdHocService,
  closedAdHocRoutesByDeposit: _closedAdHocRoutesByDeposit,
  setClosedAdHocRoutesByDeposit: _setClosedAdHocRoutesByDeposit,
  setOpenAdHocModalDepositId,
  draggedItem,
  draggedFromCell,
  onDragStart,
}) => {
  const weekDates = useMemo(() => getWeekDatesFiltered(date, showWeekends), [date, showWeekends]);
  const [adhocServices, setAdhocServices] = useState<AdhocServiceDTO[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchAdhocServices()
      .then((data) => {
        if (!cancelled) setAdhocServices(data || []);
      })
      .catch(() => {
        if (!cancelled) setAdhocServices([]);
      });
    return () => { cancelled = true; };
  }, []);

  // List by adhocService.adhocName: one row per adhoc service (filtered by deposit when depositId is set)
  const adhocServicesForDeposit = useMemo(() => {
    return adhocServices.filter((service) => {
      if (service.depositId != null) {
        return service.depositId === deposit.depositId;
      }
      return true; // Include services without depositId in all sections
    });
  }, [adhocServices, deposit.depositId]);

  const adhocServiceDepositById = useMemo(() => {
    const map = new Map<number, { depositId: number | null; depositName: string | null }>();
    adhocServices.forEach((service) => {
      if (!service.adhocServiceId) return;
      map.set(service.adhocServiceId, {
        depositId: service.depositId ?? null,
        depositName: service.depositName ?? null,
      });
    });
    return map;
  }, [adhocServices]);

  // Filter assignments for ADHOC Services: include if (adhocServiceId set OR routeId 55) AND matches deposit
  // Assignments with adhocServiceId appear here, not in regular deposit routes
  const filteredAssignmentsByDate = useMemo(() => {
    const filtered = new Map<string, WeekPlannerRecord[]>();

    assignmentsByDate.forEach((assignments, dateStr) => {
      const filteredForDate = assignments.filter((assignment) => {
        const raw = assignment.raw as Record<string, unknown> | undefined;
        if (!raw) return false;

        const aid = raw.adhocServiceId ?? (raw.adhocService && typeof raw.adhocService === 'object'
          ? (raw.adhocService as Record<string, unknown>).adhocServiceId
          : null);
        const hasAdhocServiceId = aid != null && Number.isFinite(Number(aid)) && Number(aid) > 0;

        let assignmentRouteId: number | null = null;
        if (raw.route && typeof raw.route === 'object') {
          const routeObj = raw.route as Record<string, unknown>;
          assignmentRouteId = routeObj.routeId ? Number(routeObj.routeId) : null;
        }
        if (!assignmentRouteId && raw.routeId) assignmentRouteId = Number(raw.routeId);
        const isAdhocPlaceholderRoute =
          assignmentRouteId === 55 || assignmentRouteId === 57;

        if (!hasAdhocServiceId && !isAdhocPlaceholderRoute) return false;

        const serviceDeposit = hasAdhocServiceId
          ? adhocServiceDepositById.get(Number(aid))
          : undefined;
        const assignmentDepositId = raw.depositId ? Number(raw.depositId) : serviceDeposit?.depositId ?? null;
        if (assignmentDepositId !== null && assignmentDepositId === deposit.depositId) return true;
        const assignmentDepositName =
          (raw.depositName as string | undefined) ||
          serviceDeposit?.depositName ||
          ((assignment as unknown as Record<string, unknown>).depositName as string | undefined);
        if (assignmentDepositName && assignmentDepositName.trim() === deposit.depositName.trim()) return true;
        return false;
      });
      if (filteredForDate.length > 0) filtered.set(dateStr, filteredForDate);
    });
    return filtered;
  }, [assignmentsByDate, deposit, adhocServiceDepositById]);

  // Only show services that have at least one user/assignment
  const adhocServicesWithAssignments = useMemo(() => {
    const allAssignments = Array.from(filteredAssignmentsByDate.values()).flat();
    const hasAssignment = (service: AdhocServiceDTO) => {
      const serviceId = service.adhocServiceId;
      return allAssignments.some((a) => {
        const raw = a.raw as Record<string, unknown> | undefined;
        if (!raw) return false;
        const adhocObj = raw.adhocService && typeof raw.adhocService === 'object'
          ? (raw.adhocService as Record<string, unknown>)
          : null;
        const aid = raw.adhocServiceId ?? adhocObj?.adhocServiceId ?? null;
        return serviceId != null && Number(aid) === serviceId;
      });
    };
    const result = adhocServicesForDeposit.filter(hasAssignment);
    console.warn('[AdHocServicesSection][DIAG]', {
      deposit: deposit.depositName,
      adhocServicesForDepositCount: adhocServicesForDeposit.length,
      totalAssignments: allAssignments.length,
      resultCount: result.length,
      resultServiceNames: result.map((s) => s.adhocName),
      allAssignmentsRaw: allAssignments.map((a) => ({
        date: a.date,
        name: a.name,
        userId: (a.raw as Record<string, unknown> | undefined)?.userId,
        adhocServiceId: (a.raw as Record<string, unknown> | undefined)?.adhocServiceId,
        weekPlannerId: a.weekPlannerId,
      })),
    });
    return result;
  }, [adhocServicesForDeposit, filteredAssignmentsByDate, deposit.depositName]);

  // Convert adhoc services to Route-like objects for WeekGrid (routeId 57 DHOC, routeName = adhocName)
  const routesAsRoute: (Route & { adhocServiceId?: number })[] = adhocServicesWithAssignments.map((service) => ({
    routeId: BUSINESS_RULES.ROUTE.DHOC,
    routeName: service.adhocName || `Service ${service.adhocServiceId}`,
    active: true,
    customerId: 0,
    depositId: deposit.depositId,
    serviceTypeId: 0,
    adhocServiceId: service.adhocServiceId,
  }));

  const getAssignmentsInCell = useMemo(() => {
    return (route: Route & { adhocServiceId?: number }, dateStr: string, assignmentsForDay: WeekPlannerRecord[]) => {
      const adhocRowServiceId = Number(route.adhocServiceId || 0);
      if (!adhocRowServiceId) return [];
      
      return assignmentsForDay.filter((a) => {
        const raw = a.raw as Record<string, unknown> | undefined;
        if (!raw) return false;
        
        const adhocServiceObj = raw.adhocService && typeof raw.adhocService === 'object'
          ? (raw.adhocService as Record<string, unknown>)
          : null;
          
        const assignmentAdhocIdRaw = raw.adhocServiceId ?? adhocServiceObj?.adhocServiceId;
        const assignmentAdhocId = Number(assignmentAdhocIdRaw || 0);
        
        return assignmentAdhocId > 0 && assignmentAdhocId === adhocRowServiceId;
      });
    };
  }, []);

  return (
    <div className="mt-4 w-full flex flex-col items-center relative">
      {/* Header */}
      <div className="w-full">
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-t-2xl border border-slate-200 shadow-sm mb-0">
          <div className="flex items-center gap-4 justify-between w-full">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 m-0">
                  {deposit.depositName} - ADHOC Services
                </h2>
                <p className="text-sm text-slate-600 m-0 mt-0.5 font-medium">
                  {adhocServicesWithAssignments.length} {adhocServicesWithAssignments.length === 1 ? 'service' : 'services'}
                </p>
              </div>
            </div>
            {onCreateAdHocService && (
              <button
                onClick={() => setOpenAdHocModalDepositId(deposit.depositId, date)}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-orange-600 px-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-orange-700 active:scale-[0.99]"
                title="Add ADHOC Service"
              >
                <Plus className="w-4 h-4" />
                <span>Add ADHOC</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div
        className="w-full bg-white rounded-b-2xl p-2 shadow-sm border border-slate-200 border-t-0 mt-0 overflow-hidden transition-all duration-300 ease-out"
        data-deposit-id={deposit.depositId}
        data-deposit-name={deposit.depositName}
      >
        <WeekGrid
          weekDates={weekDates}
          showWeekends={showWeekends}
          routes={routesAsRoute}
          assignmentsByDate={filteredAssignmentsByDate}
          vendors={vendors}
          allRoutes={routes}
          onEdit={onEdit}
          onDrop={onDrop}
          draggedItem={draggedItem}
          draggedFromCell={draggedFromCell}
          onDragStart={onDragStart}
          onQuickAdd={onQuickAdd}
          showQuickAddButton={true}
          quickAddLabel="Open"
          getAssignmentsInCell={getAssignmentsInCell}
          headerBg="from-orange-500 to-orange-600"
          headerText="Service"
          emptyMessage="No ADHOC services available"
          allowFlexibleCellHeight={true}
        />
      </div>
    </div>
  );
});

AdHocServicesSection.displayName = 'AdHocServicesSection';

export default AdHocServicesSection;



