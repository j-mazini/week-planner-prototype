"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { getWeekDates, formatDate, isWeekend, parseLocalDate } from '../utils/dateUtils';
import type { WeekPlannerRecord } from '../contexts/PlannerContext';
import type { Route, RouteByDepositDTO, DepositWithRoutesDTO } from '@/lib/api/routes';
import type { Vendor, VendorCostModel } from '@/lib/vendors';
import type { DayOffEntry } from './DayOffModal';
import VendorCard from './Common/VendorCard';
import VrnPlate from '@/components/vrn-plate';
import ManagementCard from './Common/ManagementCard';
import DepositSection from './WeeklyView/DepositSection';
import { useDragAndDrop, type DragItem } from '../hooks/useDragAndDrop';
import FlexRouteSelectionModal from './modals/FlexRouteSelectionModal';
import AdHocServiceModal from './modals/AdHocServiceModal';
import DailyTeamSupportModal from './modals/DailyTeamSupportModal';
import ManagementSupportModal from './modals/ManagementSupportModal';
import EditManagementFunctionModal from './modals/EditManagementFunctionModal';
import { isFlexRoute } from '../utils/depotOrganizationUtils';
import { filterAllowedDeposits, isBaopDepositName } from '@/lib/allowedDeposits';
import { useCloseSidebarOnModal } from '../hooks/useCloseSidebarOnModal';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

export type WeeklyViewProps = {
  date: string; // YYYY-MM-DD format
  data: {
    assignments: WeekPlannerRecord[];
    routes: Route[];
    vendors: Vendor[];
  };
  dayOffEntries?: DayOffEntry[];
  onDrop: (e: React.DragEvent<HTMLDivElement>, routeId: number, dateStr: string) => void;
  onEdit: (assignment: WeekPlannerRecord) => void;
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
    editData?: { userId?: number; vehicleId?: number; routeSort?: string; notes?: string; registrationPlate?: string; dates?: string[] },
  ) => void;
  showWeekends?: boolean;
  depositsWithRoutes?: DepositWithRoutesDTO[];
  onCreateDailyTeamSupport?: (userId: number, routeId: number, date: string) => Promise<void>;
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
  onCreateManagementSupport?: (data: {
    userId: number;
    vendorName: string;
    title: string;
    dates: string[];
    depositId?: number | null;
    vendorCostModel?: VendorCostModel | null;
    managementTeamFunctionId?: number | null;
  }) => Promise<void>;
  canAddManagementSupport?: boolean;
  canAddFlexRoute?: boolean;
  onAssignmentDelete?: (assignment: WeekPlannerRecord, options?: { forceDelete?: boolean }) => Promise<void>;
  onRemoveManagementFunction?: (functionTitle: string) => Promise<void>;
  onEditManagementFunction?: (newTitle: string, assignments: WeekPlannerRecord[]) => Promise<void>;
  onEditFlexRoute?: (route: Route) => void;
  onEditAdHocService?: (route: Route) => void;
  hideAdhocSort?: boolean;
};

const WeeklyView: React.FC<WeeklyViewProps> = ({
  date,
  data,
  onDrop,
  onEdit,
  onAssignVendor,
  onOpenDraftAssignmentForRoute,
  showWeekends = true,
  depositsWithRoutes = [],
  onCreateDailyTeamSupport,
  onCreateAdHocService,
  onCreateBaopService,
  onAssignmentDelete,
  onCreateManagementSupport,
  canAddManagementSupport = true,
  canAddFlexRoute = true,
  onRemoveManagementFunction,
  onEditManagementFunction,
  onEditFlexRoute: _onEditFlexRoute,
  onEditAdHocService: _onEditAdHocService,
  hideAdhocSort = false,
}) => {
  const allWeekDates = getWeekDates(date);
  // Filter week dates based on showWeekends (indices 5 and 6 are Saturday and Sunday)
  const weekDates = showWeekends
    ? allWeekDates
    : allWeekDates.filter((_, index) => index < 5); // Only Monday to Friday (indices 0-4)
  const { draggedItem, handleDragStart, cleanupDrag } = useDragAndDrop();
  const [draggedFromCell, setDraggedFromCell] = useState<HTMLElement | null>(null);
  const [collapsedLoops, setCollapsedLoops] = useState<Set<string>>(new Set());

  // State for managing flex routes by deposit
  const [selectedFlexRoutesByDeposit, setSelectedFlexRoutesByDeposit] = useState<Map<number | null, Set<number>>>(new Map());
  const [openModalDepositId, setOpenModalDepositId] = useState<number | null>(null);

  // State for ADHOC service modal
  const [openAdHocModalDepositId, setOpenAdHocModalDepositId] = useState<number | null>(null);
  const [openAdHocModalDate, setOpenAdHocModalDate] = useState<string | null>(null);
  const [closedAdHocRoutesByDeposit, setClosedAdHocRoutesByDeposit] = useState<Map<number | null, Set<number>>>(new Map());

  // State for Daily Team Support modal
  const [openDailyTeamSupportModal, setOpenDailyTeamSupportModal] = useState<{
    isOpen: boolean;
    date: Date;
    routeId: number;
    routeName?: string;
  }>({
    isOpen: false,
    date: new Date(),
    routeId: 0,
  });

  // State for Management Support modal (depositId/depositName when opened from supervisor row)
  const [openManagementSupportModal, setOpenManagementSupportModal] = useState<{
    isOpen: boolean;
    date: Date;
    depositId?: number;
    depositName?: string;
    functionId?: number;
    userId?: number;
    title?: string;
  }>({
    isOpen: false,
    date: new Date(),
  });

  // State for editing management function
  const [editingManagementFunction, setEditingManagementFunction] = useState<{
    title: string;
    assignments: WeekPlannerRecord[];
  } | null>(null);

  // State for editing flex route
  const [editingFlexRoute, _setEditingFlexRoute] = useState<Route | null>(null);

  // State for editing adhoc service
  const [editingAdHocService, _setEditingAdHocService] = useState<Route | null>(null);

  // Close the sidebar whenever any weekly-view modal is open
  useCloseSidebarOnModal(
    openModalDepositId !== null,
    openAdHocModalDepositId !== null,
    openDailyTeamSupportModal.isOpen,
    openManagementSupportModal.isOpen,
    editingManagementFunction !== null,
    editingFlexRoute !== null,
    editingAdHocService !== null,
  );



  // Index assignments by date to avoid filtering the full list in every cell
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


  const hasAssignments = useCallback((routeId: number): boolean => {
    return data.assignments.some(assignment => {
      const raw = assignment.raw;
      if (!raw) return false;

      // Check multiple possible locations for routeId
      let assignmentRouteId: unknown = null;

      // First, try route object (most common structure from API)
      const routeObj = raw.route && typeof raw.route === 'object' ? (raw.route as Record<string, unknown>) : null;
      if (routeObj) {
        assignmentRouteId = routeObj.routeId ?? routeObj.routeDefaultId ?? null;
      }

      // Then try direct routeId at root level
      if (assignmentRouteId === null) {
        assignmentRouteId = raw.routeId ?? raw.routeDefaultId ?? null;
      }

      // Compare routeId
      return assignmentRouteId !== null && Number(assignmentRouteId) === Number(routeId);
    });
  }, [data.assignments]);

  // Helper to filter day-off assignments.
  // New DTO no longer includes costModel; use the normalised isDayOff field instead.
  const offAssignments = useMemo(() => {
    return data.assignments.filter(assignment => {
      if (assignment.isDayOff === 'true') return true;
      const raw = assignment.raw;
      if (!raw) return false;

      // Fallback: legacy costModelName === 'OFF' check
      const costModelObj = raw.costModel && typeof raw.costModel === 'object' ? (raw.costModel as Record<string, unknown>) : null;
      const costModelName = costModelObj?.costModelName ?? raw.costModelName;
      return String(costModelName || '').toUpperCase() === 'OFF';
    });
  }, [data.assignments]);

  // Helper to identify NotAllocated vendors
  const notAllocatedData = useMemo(() => {
    const dates = weekDates.map(d => formatDate(d, 'yyyy-mm-dd'));
    const result = new Map<string, WeekPlannerRecord[]>();

    const toPositiveNumber = (value: unknown): number | null => {
      const numeric = Number(value);
      return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
    };

    const idToUserTypeId = new Map<number, number>();
    data.vendors.forEach((vendor) => {
      const userTypeId = toPositiveNumber(vendor.userTypeId);
      if (userTypeId == null) return;

      const userId = toPositiveNumber(vendor.userId) ?? toPositiveNumber(vendor.userId);

      if (userId != null) idToUserTypeId.set(userId, userTypeId);
    });

    const resolveUserTypeIdForAssignment = (assignment: WeekPlannerRecord): number | null => {
      const raw = (assignment.raw ?? {}) as Record<string, unknown>;

      const direct = toPositiveNumber(raw.userTypeId);
      if (direct != null) return direct;

      const vendorObj = raw.vendor;
      if (vendorObj && typeof vendorObj === 'object') {
        const nested = toPositiveNumber((vendorObj as Record<string, unknown>).userTypeId);
        if (nested != null) return nested;
      }

      const userId = toPositiveNumber(raw.userId);
      if (userId != null && idToUserTypeId.has(userId)) {
        return idToUserTypeId.get(userId) ?? null;
      }

      const matchedVendor = data.vendors.find((vendor) => {
        const normalizedAssignmentName = String(assignment.name ?? '').trim().toLowerCase();
        const normalizedVendorName = String(vendor.fullName ?? '').trim().toLowerCase();
        return normalizedAssignmentName !== '' && normalizedAssignmentName === normalizedVendorName;
      });

      return toPositiveNumber(matchedVendor?.userTypeId);
    };

    const shouldPreserveExplicitNotAllocated = (assignment: WeekPlannerRecord): boolean => {
      const userTypeId = resolveUserTypeIdForAssignment(assignment);
      return userTypeId === BUSINESS_RULES.USER_TYPE.ADMIN || userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR;
    };

    dates.forEach(dateStr => {
      const dayResult: WeekPlannerRecord[] = [];
      const assignedOnDay = assignmentsByDate.get(dateStr) || [];
      const includedExplicitNalc = new Set<WeekPlannerRecord>();

      // Map userId to their assignments on this day
      const userAssignments = new Map<number, WeekPlannerRecord[]>();
      assignedOnDay.forEach(a => {
        const raw = a.raw;
        const uId = Number(raw?.userId || raw?.userId || 0);
        if (uId > 0) {
          if (!userAssignments.has(uId)) userAssignments.set(uId, []);
          userAssignments.get(uId)!.push(a);
        }
      });

      data.vendors.forEach(vendor => {
        const uId = vendor.userId ?? vendor.userId;
        if (!uId) return;

        const assignments = userAssignments.get(uId) || [];

        // If there is an explicit NotAllocated record for this vendor/day,
        // always show it in the NotAllocated section even if the vendor also
        // has Management & Support (daily-team-support) on the same date.
        const explicitNalcs = assignments.filter(
          a => (a.status || a.raw?.status) === BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED
        );

        const hasNonManagementActiveAssignment = assignments.some((a) => {
          const raw = a.raw;
          const status = a.status || raw?.status;
          const isManagement = a.weekPlannerId < 0 || raw?.dailyTeamSupportId != null;
          const isNotAllocated = status === BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED;

          if (isManagement || isNotAllocated) return false;

          return (
            status === BUSINESS_RULES.WORKING_STATUS.WORKING ||
            status === BUSINESS_RULES.WORKING_STATUS.OFF ||
            status === BUSINESS_RULES.WORKING_STATUS.HOLIDAY ||
            a.isDayOff === 'true'
          );
        });

        if (explicitNalcs.length > 0) {
          // Keep explicit NotAllocated when the only overlap is Management & Support.
          // For user types 1 and 3, preserve the explicit NotAllocated row even when
          // the vendor also has an active route/adhoc assignment on the same day.
          // This matches the special-user handling already used elsewhere in Week Planner.
          const explicitNalcsToKeep = hasNonManagementActiveAssignment
            ? explicitNalcs.filter(shouldPreserveExplicitNotAllocated)
            : explicitNalcs;

          explicitNalcsToKeep.forEach((nalcAssignment) => {
            dayResult.push(nalcAssignment);
            includedExplicitNalc.add(nalcAssignment);
          });
          return;
        }

        // Rule: NotAllocated if NO records OR only NOT_ALLOCATED records
        const hasActiveAssignment = assignments.some(a => {
          const raw = a.raw;
          const status = a.status || raw?.status;
          const isManagement = a.weekPlannerId < 0 || raw?.dailyTeamSupportId != null;

          return isManagement ||
            status === BUSINESS_RULES.WORKING_STATUS.WORKING ||
            status === BUSINESS_RULES.WORKING_STATUS.OFF ||
            status === BUSINESS_RULES.WORKING_STATUS.HOLIDAY ||
            a.isDayOff === 'true';
        });

        if (!hasActiveAssignment) {
          // Create a virtual record for the UI
          dayResult.push({
            weekPlannerId: 0,
            date: dateStr,
            name: vendor.fullName || 'Unknown Vendor',
            route: 'Not Allocated',
            routeSort: 'no',
            adhocSort: '',
            notes: '',
            reason: '',
            vehicle: '',
            registrationPlate: '',
            status: BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED,
            isDayOff: 'false',
            isSort: 'false',
            raw: {
              date: dateStr,
              userId: uId,
              status: BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED,
              isDayOff: false,
              isSort: false,
              vehicleId: BUSINESS_RULES.VEHICLE.BAOP_DEFAULT_PLACEHOLDER,
              depositId: BUSINESS_RULES.DEPOSIT.BAOP_DEFAULT,
              routeId: BUSINESS_RULES.ROUTE.NOT_ALLOCATED,
            }
          });
        }
      });

      // Include explicit NALC assignments that may not map to current vendors list
      // (e.g., stale/inactive vendor or missing vendor record in /bff/vendor).
      assignedOnDay.forEach((assignment) => {
        const raw = (assignment.raw ?? {}) as Record<string, unknown>;
        const status = assignment.status || raw?.status;
        if (status !== BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED) return;
        if (includedExplicitNalc.has(assignment)) return;
        dayResult.push(assignment);
      });

      result.set(dateStr, dayResult);
    });
    return result;
  }, [weekDates, data.vendors, assignmentsByDate]);

  // Process deposits: sort by depositId and filter routes
  // IMPORTANT:
  // - Show only CORE routes (is_flex = false) by default
  // - Flex routes (is_flex = true): show only when they have week-planner items (assignments)
  // - Sort by depositId
  const processedDeposits = useMemo(() => {
    if (!depositsWithRoutes || depositsWithRoutes.length === 0) {
      return [];
    }

    const assignments = data.assignments ?? [];

    // Only show the allowed deposits for Week Planner (LSE, LCY, MSE, BAOP)
    // Exclude pseudo-deposits like "OFF" and "NotAllocated" that are handled by dedicated sections
    const processed = filterAllowedDeposits(depositsWithRoutes)
      .filter(deposit => {
        // Exclude the administrative DAY_OFF deposit (id 4) by its known depositId
        if (deposit.depositId === BUSINESS_RULES.DEPOSIT.DAY_OFF) return false;
        // Exclude pseudo-deposits identified by name (OFF / NotAllocated)
        const name = String(deposit.depositName ?? '').trim().toUpperCase();
        if (name === BUSINESS_RULES.WORKING_STATUS.OFF.toUpperCase()) return false;
        if (name === BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED.toUpperCase()) return false;
        if (name === 'NOT ALLOCATED') return false;
        return true;
      })
      .map(deposit => {
        // Get selected flex routes for this deposit (user explicitly opened via modal)
        const depositId = deposit.depositId;
        const selectedFlexRouteIds = selectedFlexRoutesByDeposit.get(depositId) || new Set<number>();

        const assignmentBelongsToDeposit = (assignment: WeekPlannerRecord): boolean => {
          const raw = (assignment.raw ?? {}) as Record<string, unknown>;
          const assignmentDepositId = raw.depositId;
          if (assignmentDepositId !== undefined && assignmentDepositId !== null && Number(assignmentDepositId) === Number(depositId)) {
            return true;
          }
          const assignmentDepositName = String(raw.depositName ?? "").trim();
          const depositName = deposit.depositName ?? "";
          return assignmentDepositName !== "" && assignmentDepositName === String(depositName).trim();
        };

        // Helper: check if route has any week-planner assignment
        const routeHasAssignments = (routeId: number, routeName: string) =>
          assignments.some(a => {
            if (!assignmentBelongsToDeposit(a)) return false;

            const raw = a.raw;
            let opRouteId: unknown = raw?.routeId ?? raw?.routeDefaultId;
            if ((opRouteId === null || opRouteId === undefined) && raw?.route && typeof raw.route === 'object') {
              const routeObj = raw.route as Record<string, unknown>;
              opRouteId = routeObj.routeId ?? routeObj.routeDefaultId;
            }
            return (
              Number(opRouteId) === routeId ||
              String(a.route) === String(routeId) ||
              String(a.route?.toUpperCase?.() ?? '').trim() === String(routeName ?? '').trim().toUpperCase()
            );
          });

        // Filter routes:
        // - Core routes (isFlex = false): show always
        // - Flex routes (isFlex = true): show only when they have week-planner items OR user selected via modal
        const routesToShow = deposit.routes.filter(route => {
          // BAOP rule: always show all routes returned by /bff/deposits/with-routes,
          // even when there are no week-planner items for that route/day.
          if (isBaopDepositName(deposit.depositName ?? "")) {
            return true;
          }

          const routeIsFlex = isFlexRoute(route);
          const routeId = route.routeId;
          const routeName = (route.routeName ?? '').toLowerCase();

          // Exclude AdHoc routes from main grid (DHOC, BRTE, etc)
          const isAdHoc = (route as Route).category === 'ad_hoc' ||
                          routeName.includes('adhoc') ||
                          routeName.includes('ad-hoc') ||
                          routeName.includes('dhoc') ||
                          routeId === 55 ||
                          routeId === BUSINESS_RULES.ROUTE.DHOC;

          if (isAdHoc) return false;

          if (routeIsFlex) {
            const hasWpItems = (routeId !== undefined && (hasAssignments(routeId) || routeHasAssignments(routeId, route.routeName ?? '')));
            return hasWpItems || (routeId !== undefined && selectedFlexRouteIds.has(routeId));
          }
          return true; // Core routes always show
        });

        const isTruthy = (value: unknown): boolean =>
          value === true ||
          value === 1 ||
          value === "1" ||
          String(value).toLowerCase() === "true";

        // Business rule: when assignment has adhocService.adhocSort=true,
        // show the assignment route in both tables (deposit routes + ADHOC).
        const adhocSortRouteIdsForDeposit = new Set<number>();
        assignments.forEach((assignment) => {
          const raw = (assignment.raw ?? {}) as Record<string, unknown>;
          const adhocServiceObj = raw.adhocService && typeof raw.adhocService === "object"
            ? (raw.adhocService as Record<string, unknown>)
            : null;
          if (!isTruthy(adhocServiceObj?.adhocSort)) return;
          if (!assignmentBelongsToDeposit(assignment)) return;
          const routeObj = raw.route && typeof raw.route === "object" ? (raw.route as Route) : null;
          const assignmentRouteId = Number(raw.routeId ?? raw.routeDefaultId ?? routeObj?.routeId ?? routeObj?.routeDefaultId ?? 0);
          if (Number.isFinite(assignmentRouteId) && assignmentRouteId > 0) {
            adhocSortRouteIdsForDeposit.add(assignmentRouteId);
          }
        });

        adhocSortRouteIdsForDeposit.forEach((routeId) => {
          const alreadyInTable = routesToShow.some((route) => Number(route.routeId) === routeId);
          if (alreadyInTable) return;

          const fromDeposit = deposit.routes.find((route) => Number(route.routeId) === routeId);
          if (fromDeposit) {
            routesToShow.unshift({
              ...fromDeposit,
              depositId: depositId,
            } as RouteByDepositDTO);
            return;
          }

          const fromGlobal = data.routes.find((route) => Number(route.routeId) === routeId);
          if (fromGlobal) {
            routesToShow.unshift({
              routeId: fromGlobal.routeId ?? 0,
              routeName: fromGlobal.routeName ?? fromGlobal.routeDefaultName ?? `Route ${routeId}`,
              active: fromGlobal.active ?? true,
              customerId: fromGlobal.customerId ?? 0,
              depositId: depositId,
              serviceTypeId: fromGlobal.serviceTypeId ?? 0,
              routeDefaultId: fromGlobal.routeDefaultId,
              routeDefaultName: fromGlobal.routeDefaultName,
            } as RouteByDepositDTO);
          }
        });

        return {
          ...deposit,
          routes: routesToShow
        };
      })
      // Sort by depositId (handle null depositId by putting it last)
      .sort((a, b) => {
        const aId = a.depositId;
        const bId = b.depositId;
        if (aId === null || aId === undefined) return 1;
        if (bId === null || bId === undefined) return -1;
        return aId - bId;
      });

    return processed;
  }, [depositsWithRoutes, selectedFlexRoutesByDeposit, data.assignments, data.routes, hasAssignments]);

  const handleCardDragStart = (e: React.DragEvent, data: DragItem, cell: HTMLElement) => {
    setDraggedFromCell(cell);
    if (handleDragStart) {
      handleDragStart(e, data);
    }
  };

  const handleDragEnd = () => {
    cleanupDrag();
  };

  // Helper to get Management Support assignments (daily-team-support only, no week-planner entries)
  const managementSupportAssignments = useMemo(() => {
    return data.assignments.filter(assignment => {
      const raw = assignment.raw;
      // Only daily-team-support: negative weekPlannerId or dailyTeamSupportId present
      const isSupport = assignment.weekPlannerId < 0 || raw?.dailyTeamSupportId != null;
      if (!isSupport) return false;

      // Filter out TEAM LEADER
      const title = String(assignment.notes || assignment.route || "").toUpperCase();
      if (title.includes("TEAM LEADER")) return false;

      // Se for BAOP, vamos remover o OPS MANAGER daqui pois ele agora será fixo na linha Team Leader do grid BAOP
      if (title.includes("OPS MANAGER")) {
        const depositName = String(raw?.depositName || "").trim();
        if (isBaopDepositName(depositName)) return false;
      }

      return true;
    });
  }, [data.assignments]);

  // Helper to render Management and Support section
  const renderManagementSupportSection = () => {
    const sectionKey = "management-support";
    const isCollapsed = collapsedLoops.has(sectionKey);

    const toggleCollapse = () => {
      setCollapsedLoops(prev => {
        const newSet = new Set(prev);
        if (newSet.has(sectionKey)) {
          newSet.delete(sectionKey);
        } else {
          newSet.add(sectionKey);
        }
        return newSet;
      });
    };

    // Group assignments by title/function
    const assignmentsByTitle = new Map<string, WeekPlannerRecord[]>();
    managementSupportAssignments.forEach(assignment => {
      const raw = assignment.raw;
      // Use notes as title/function, or route name as fallback
      let title = assignment.notes || assignment.route || 'Management and Support';
      // If assignment has a route object, use its name
      const routeObj = raw.route && typeof raw.route === 'object' ? (raw.route as Record<string, unknown>) : null;
      if (routeObj?.routeName) title = String(routeObj.routeName);

      // Replace "manager" with "SERVICE" in route name
      title = title.replace(/manager/gi, 'SERVICE');
      if (!assignmentsByTitle.has(title)) {
        assignmentsByTitle.set(title, []);
      }
      assignmentsByTitle.get(title)!.push(assignment);
    });

    const titles = Array.from(assignmentsByTitle.keys());

    return (
      <div className="mb-6 w-full flex flex-col items-center relative">
        <div className="w-full">
          <div className="flex items-center justify-between px-6 py-4 bg-white rounded-t-xl border border-slate-200 shadow-sm mb-0">
            <div className="flex items-center gap-4 justify-between w-full">
              <div className="flex items-center gap-3">
                <button
                  className="flex items-center justify-center w-9 h-9 p-0 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 text-sky-700 cursor-pointer transition-all duration-200 flex-shrink-0 hover:scale-105 active:scale-95"
                  onClick={toggleCollapse}
                  title={isCollapsed ? "Expandir" : "Colapsar"}
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
                  <h2 className="text-xl font-bold text-slate-900 m-0">Management and Support</h2>
                  <p className="text-sm text-slate-600 m-0 mt-1 font-medium">
                    {titles.length} {titles.length === 1 ? 'function' : 'functions'} assigned
                  </p>
                </div>
              </div>
              {canAddManagementSupport && (
                <button
                  onClick={() => {
                    // When opening via the "Add" button, default to current_date.day() + 1 within the same week
                    const baseDate = parseLocalDate(date);
                    const baseYmd = formatDate(baseDate, 'yyyy-mm-dd');
                    const weekYmd = weekDates.map((d) => formatDate(d, 'yyyy-mm-dd'));
                    const idx = weekYmd.indexOf(baseYmd);
                    const nextDate =
                      idx >= 0 && idx < weekDates.length - 1
                        ? weekDates[idx + 1]
                        : baseDate;
                    setOpenManagementSupportModal({ isOpen: true, date: nextDate });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                  title="Add Management and Support assignment"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={`w-full bg-white rounded-b-2xl p-3 shadow-md border border-slate-200 border-t-0 mt-0 overflow-hidden transition-all duration-300 ease-out ${isCollapsed
          ? 'max-h-0 opacity-0 p-0 m-0 [&>*]:hidden'
          : 'max-h-[5000px] opacity-100'
          }`}>
          {titles.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No Management and Support assignments yet.</p>
              <p className="text-sm mt-2">Click &quot;Add&quot; to create a new assignment.</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto md:overflow-visible pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div
                className={`grid gap-0 items-stretch border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm ${!showWeekends
                  ? 'grid-cols-[180px_repeat(5,180px)] md:grid-cols-[160px_repeat(5,minmax(0,1fr))]'
                  : 'grid-cols-[180px_repeat(7,180px)] md:grid-cols-[160px_repeat(7,minmax(0,1fr))]'
                  } text-sm w-max min-w-full md:w-full`}
              >
                <div className="px-2 py-2 text-xs font-semibold text-center bg-gradient-to-br from-sky-600 to-sky-700 border-r border-slate-200 border-b border-slate-200 text-white uppercase tracking-wider h-10 min-h-[40px] flex items-center justify-center">
                  <span className="text-xs font-bold">Function</span>
                </div>
                {weekDates.map((d, i) => {
                  const isWeekendDay = isWeekend(d);
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                  const dateNum = formatDate(d, 'dd/mm');
                  return (
                    <div
                      key={i}
                      className={`px-3 py-2 text-xs font-semibold text-center border-r border-slate-200 border-b border-slate-200 uppercase tracking-wider h-10 min-h-[40px] flex flex-col gap-0.5 items-center justify-center ${isWeekendDay
                        ? 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-900'
                        : 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700'
                        }`}
                    >
                      <span className={`text-xs font-bold ${isWeekendDay ? 'text-amber-900' : 'text-slate-900'}`}>{dayName}</span>
                      <span className={`text-[10px] font-medium ${isWeekendDay ? 'text-amber-700' : 'text-slate-600'}`}>{dateNum}</span>
                    </div>
                  );
                })}

                {titles.map((title) => {
                  const titleAssignments = assignmentsByTitle.get(title) || [];
                  return (
                    <React.Fragment key={title}>
                      <div
                        className="px-3 py-2 text-sm font-semibold text-slate-900 border-r border-slate-200 border-b border-slate-200 bg-sky-50 flex items-center justify-between gap-2"
                      >
                        <span
                          className={`text-sm font-bold flex-1 ${onEditManagementFunction ? 'cursor-pointer hover:underline' : ''}`}
                          onClick={(e) => {
                            if (onEditManagementFunction) {
                              e.stopPropagation();
                              setEditingManagementFunction({ title, assignments: titleAssignments });
                            }
                          }}
                          title={onEditManagementFunction ? 'Click to edit or delete this function' : ''}
                        >
                          {title}
                        </span>
                        {onRemoveManagementFunction && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await onRemoveManagementFunction(title);
                              } catch (error) {
                                console.error('Error removing management function:', error);
                              }
                            }}
                            className="flex items-center justify-center w-6 h-6 p-0 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 text-red-600 cursor-pointer transition-all duration-200 flex-shrink-0 hover:scale-110 active:scale-95"
                            title={`Remove all ${title} assignments`}
                            aria-label={`Remove all ${title} assignments`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {weekDates.map((dayDate) => {
                        const isWeekendDay = isWeekend(dayDate);
                        const dateStr = formatDate(dayDate, 'yyyy-mm-dd');
                        const dayAssignments = titleAssignments.filter(a => a.date === dateStr);
                        const isEmpty = dayAssignments.length === 0;

                        return (
                          <div
                            key={`${title}-${dateStr}`}
                            className={[
                              'relative flex flex-col overflow-hidden box-border transition-colors duration-200',
                              'min-h-[60px] h-[60px] max-h-[60px] p-1 gap-1',
                              'border-r border-b border-blue-200/30 bg-blue-50/30',
                              'hover:bg-blue-100/40',
                              'last:border-r-0',
                              isWeekendDay ? 'bg-blue-100/40' : '',
                              isEmpty && canAddManagementSupport ? 'cursor-pointer' : '',
                            ].join(' ')}
                            data-day-cell-management
                            data-date={dateStr}
                            onClick={(e) => {
                              // Only open modal if block is empty
                              if (isEmpty && canAddManagementSupport && onCreateManagementSupport) {
                                e.stopPropagation();
                                setOpenManagementSupportModal({
                                  isOpen: true,
                                  date: dayDate,
                                  // For empty management cells, prefill should come from
                                  // management-team-functions defaults (function/deposit/user),
                                  // not from an existing day assignment in the same row.
                                  functionId: undefined,
                                  userId: undefined,
                                  depositId: undefined,
                                  depositName: undefined,
                                  title: title || undefined,
                                });
                              }
                            }}
                          >
                            {dayAssignments.length > 0 ? (
                              dayAssignments.map((assignment, idx) => (
                                <ManagementCard
                                  key={idx}
                                  assignment={assignment}
                                  onEdit={onEdit}
                                  compact={true}
                                />
                              ))
                            ) : (
                              <div className="flex items-center justify-center h-full text-[0.7rem] text-slate-400 italic text-center pointer-events-none">
                                -
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper to render OFF section
  const renderOFFSection = () => {
    if (offAssignments.length === 0) {
      return null;
    }

    // Group OFF assignments by date
    const assignmentsByDate = new Map<string, WeekPlannerRecord[]>();
    offAssignments.forEach(assignment => {
      const dateKey = assignment.date;
      if (!assignmentsByDate.has(dateKey)) {
        assignmentsByDate.set(dateKey, []);
      }
      assignmentsByDate.get(dateKey)!.push(assignment);
    });

    return (
      <div className="mb-6 w-full flex flex-col items-center relative">
        <div className="w-full">
          <div className="flex items-center justify-between px-6 py-4 bg-white rounded-t-xl border border-slate-200 shadow-sm mb-0">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 m-0">OFF</h2>
                <p className="text-sm text-slate-600 m-0 mt-1 font-medium">
                  {offAssignments.length} {offAssignments.length === 1 ? 'assignment' : 'assignments'} scheduled
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full bg-white rounded-b-2xl p-3 shadow-md border border-slate-200 border-t-0 mt-0 overflow-hidden">
          <div className="w-full overflow-x-auto md:overflow-visible pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className={`grid gap-0 items-stretch border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm ${!showWeekends
              ? 'grid-cols-[140px_repeat(5,160px)] md:grid-cols-[120px_repeat(5,minmax(0,1fr))]'
              : 'grid-cols-[140px_repeat(7,160px)] md:grid-cols-[120px_repeat(7,minmax(0,1fr))]'
              } text-sm w-max min-w-full md:w-full`}>
              <div className="px-3 py-2 text-xs font-semibold text-center bg-gradient-to-br from-red-600 to-red-700 border-r border-slate-200 border-b border-slate-200 text-white uppercase tracking-wider h-10 min-h-[40px] flex items-center justify-center">
                <span className="text-xs font-bold">OFF</span>
              </div>
              {weekDates.map((d, i) => {
                const isWeekendDay = isWeekend(d);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                const dateNum = formatDate(d, 'dd/mm');
                return (
                  <div
                    key={i}
                    className={`px-3 py-2 text-xs font-semibold text-center border-r border-slate-200 border-b border-slate-200 uppercase tracking-wider h-10 min-h-[40px] flex flex-col gap-0.5 items-center justify-center ${isWeekendDay
                      ? 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-900'
                      : 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700'
                      }`}
                  >
                    <span className={`text-xs font-bold ${isWeekendDay ? 'text-amber-900' : 'text-slate-900'}`}>{dayName}</span>
                    <span className={`text-[10px] font-medium ${isWeekendDay ? 'text-amber-700' : 'text-slate-600'}`}>{dateNum}</span>
                  </div>
                );
              })}
              {/* OFF Row */}
              <div className="px-3 py-2 text-sm font-semibold text-slate-900 border-r border-slate-200 border-b border-slate-200 bg-red-50 self-start">
                <span className="text-sm font-bold">OFF</span>
              </div>
              {weekDates.map((dayDate) => {
                const isWeekendDay = isWeekend(dayDate);
                const dateStr = formatDate(dayDate, 'yyyy-mm-dd');
                const dayAssignments = assignmentsByDate.get(dateStr) || [];

                return (
                  <div
                    key={dateStr}
                    className={[
                      'relative flex flex-col overflow-visible box-border transition-colors duration-200 self-start',
                      'min-h-[60px] p-2 gap-1',
                      'border-r border-b border-slate-300/20 bg-white',
                      'hover:bg-slate-50',
                      'last:border-r-0',
                      isWeekendDay ? 'bg-slate-50' : '',
                    ].join(' ')}
                    data-day-cell
                    data-date={dateStr}
                  >
                    {dayAssignments.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {dayAssignments.map((assignment, index) => {
                          const raw = assignment.raw as Record<string, unknown>;
                          const vendor = data.vendors.find(d => {
                            const vendorFullName = d.fullName;
                            const userId = d.userId ?? d.userId;
                            return (
                              vendorFullName === assignment.name ||
                              String(userId) === String(raw?.userId || raw?.userId) ||
                              (raw?.vendor as { userId?: number} | undefined)?.userId === userId
                            );
                          });

                          const uniqueKey = assignment.weekPlannerId > 0
                            ? assignment.weekPlannerId
                            : `off-${dateStr}-${assignment.name}-${index}`;

                          return vendor ? (
                            <VendorCard
                              key={uniqueKey}
                              vendor={vendor}
                              assignment={assignment}
                              routes={data.routes}
                              onEdit={() => onEdit(assignment)}
                              onDragStart={(e, data) => {
                                const cell = e.currentTarget.closest('[data-day-cell]') as HTMLElement;
                                if (cell) {
                                  handleCardDragStart(e, data as DragItem, cell);
                                }
                              }}
                              onDragEnd={handleDragEnd}
                            />
                          ) : (
                            <div
                              key={uniqueKey}
                              className="flex w-full flex-1 justify-between items-center gap-2 bg-red-50 border border-red-200 px-2 py-1.5 rounded-md cursor-move text-xs transition-all duration-200 shadow-sm min-h-fit hover:border-red-300 hover:bg-red-100 hover:shadow-md hover:-translate-y-0.5"
                              onClick={() => onEdit(assignment)}
                              title={`${assignment.name} - Click to edit`}
                            >
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <span className="font-semibold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis text-xs">{assignment.name || 'Unknown Vendor'}</span>
                              </div>
                              <span className="text-[10px] text-slate-600 whitespace-nowrap font-medium px-1.5 py-0.5 bg-white/60 rounded text-xs inline-flex items-center">
                                <VrnPlate
                                  vrn={
                                    assignment.registrationPlate ||
                                    (raw?.registrationPlate ? String(raw.registrationPlate) : '') ||
                                    (raw?.vehicleRegistrationPlate ? String(raw.vehicleRegistrationPlate) : '') ||
                                    (raw?.vehicleDefaultRegistrationPlate ? String(raw.vehicleDefaultRegistrationPlate) : '') ||
                                    (raw?.vehicle && typeof raw.vehicle === 'object'
                                      ? String((raw.vehicle as Record<string, unknown>).vehicleRegistrationPlate ||
                                        (raw.vehicle as Record<string, unknown>).vehicleDefaultRegistrationPlate ||
                                        (raw.vehicle as Record<string, unknown>).registrationPlate ||
                                        '')
                                      : '') ||
                                    (Number(raw?.vehicleId ?? 0) === 55 ? 'NOVEHICLE' : undefined) ||
                                    undefined
                                  }
                                  size="sm"
                                  showBadge={false}
                                />
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper to render NotAllocated section
  const renderNotAllocatedSection = () => {
    const totalNotAllocated = Array.from(notAllocatedData.values()).reduce((acc, current) => acc + current.length, 0);

    if (totalNotAllocated === 0) {
      return null;
    }

    return (
      <div className="mb-6 w-full flex flex-col items-center relative">
        <div className="w-full">
          <div className="flex items-center justify-between px-6 py-4 bg-white rounded-t-xl border border-slate-200 shadow-sm mb-0">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 m-0">NotAllocated</h2>
                <p className="text-sm text-slate-600 m-0 mt-1 font-medium">
                  Vendors pending allocation
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full bg-white rounded-b-2xl p-3 shadow-md border border-slate-200 border-t-0 mt-0 overflow-hidden">
          <div className="w-full overflow-x-auto md:overflow-visible pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className={`grid gap-0 items-stretch border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm ${!showWeekends
              ? 'grid-cols-[140px_repeat(5,160px)] md:grid-cols-[120px_repeat(5,minmax(0,1fr))]'
              : 'grid-cols-[140px_repeat(7,160px)] md:grid-cols-[120px_repeat(7,minmax(0,1fr))]'
              } text-sm w-max min-w-full md:w-full`}>
              <div className="px-3 py-2 text-xs font-semibold text-center bg-gradient-to-br from-slate-600 to-slate-700 border-r border-slate-200 border-b border-slate-200 text-white uppercase tracking-wider h-10 min-h-[40px] flex items-center justify-center">
                <span className="text-xs font-bold">Unallocated</span>
              </div>
              {weekDates.map((d, i) => {
                const isWeekendDay = isWeekend(d);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                const dateNum = formatDate(d, 'dd/mm');
                return (
                  <div
                    key={i}
                    className={`px-3 py-2 text-xs font-semibold text-center border-r border-slate-200 border-b border-slate-200 uppercase tracking-wider h-10 min-h-[40px] flex flex-col gap-0.5 items-center justify-center ${isWeekendDay
                      ? 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-900'
                      : 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700'
                      }`}
                  >
                    <span className={`text-xs font-bold ${isWeekendDay ? 'text-amber-900' : 'text-slate-900'}`}>{dayName}</span>
                    <span className={`text-[10px] font-medium ${isWeekendDay ? 'text-amber-700' : 'text-slate-600'}`}>{dateNum}</span>
                  </div>
                );
              })}
              {/* NotAllocated Row */}
              <div className="px-3 py-2 text-sm font-semibold text-slate-900 border-r border-slate-200 border-b border-slate-200 bg-slate-50 self-start">
                <span className="text-sm font-bold text-slate-500">Not Allocated</span>
              </div>
              {weekDates.map((dayDate) => {
                const isWeekendDay = isWeekend(dayDate);
                const dateStr = formatDate(dayDate, 'yyyy-mm-dd');
                const dayAssignments = notAllocatedData.get(dateStr) || [];

                return (
                  <div
                    key={dateStr}
                    className={[
                      'relative flex flex-col overflow-visible box-border transition-colors duration-200 self-start',
                      'min-h-[60px] p-2 gap-1',
                      'border-r border-b border-slate-300/20 bg-white',
                      'hover:bg-slate-50',
                      'last:border-r-0',
                      isWeekendDay ? 'bg-slate-50' : '',
                    ].join(' ')}
                    data-day-cell
                    data-date={dateStr}
                  >
                    {dayAssignments.length > 0 ? (
                      <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto pr-1">
                        {dayAssignments.map((assignment, index) => {
                          const raw = assignment.raw as Record<string, unknown>;
                          const vendor = data.vendors.find(d => {
                            const vendorFullName = d.fullName;
                            const userId = d.userId ?? d.userId;
                            return (
                              vendorFullName === assignment.name ||
                              String(userId) === String(raw?.userId || raw?.userId) ||
                              (raw?.vendor as { userId?: number; } | undefined)?.userId === userId
                            );
                          });

                          const uniqueKey = assignment.weekPlannerId > 0
                            ? assignment.weekPlannerId
                            : `nalc-${dateStr}-${assignment.name}-${index}`;

                          return vendor ? (
                            <VendorCard
                              key={uniqueKey}
                              vendor={vendor}
                              assignment={assignment}
                              routes={data.routes}
                              onEdit={() => onEdit(assignment)}
                              onDragStart={(e, data) => {
                                const cell = e.currentTarget.closest('[data-day-cell]') as HTMLElement;
                                if (cell) {
                                  handleCardDragStart(e, data as DragItem, cell);
                                }
                              }}
                              onDragEnd={handleDragEnd}
                            />
                          ) : (
                            <div
                              key={uniqueKey}
                              className="flex w-full flex-1 justify-between items-center gap-2 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-md cursor-move text-xs transition-all duration-200 shadow-sm min-h-fit hover:border-slate-300 hover:bg-slate-100 hover:shadow-md hover:-translate-y-0.5"
                              onClick={() => onEdit(assignment)}
                              title={`${assignment.name} - Click to edit`}
                            >
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <span className="font-semibold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis text-xs">{assignment.name || 'Unknown Vendor'}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // DEPRECATED: Now using DepositSection component - removed to reduce complexity.


  // Get the current deposit for the modal
  const currentDepositForModal = openModalDepositId !== null
    ? depositsWithRoutes.find(d => d.depositId === openModalDepositId)
    : null;

  // Flex routes considered "open" in this deposit (only those the user has explicitly added)
  const getActiveFlexRouteIds = (depositId: number | null): number[] => {
    if (!depositId) return [];

    // Get routes from local state (selectedFlexRoutesByDeposit)
    const selectedIds = selectedFlexRoutesByDeposit.get(depositId) || new Set<number>();
    const allActiveIds = new Set(selectedIds);

    // Also add routes that have assignments in data (persisted to bank)
    // This ensures that after page reload, previously created flex routes are still filtered out
    data.assignments.forEach(assignment => {
      const raw = assignment.raw;
      if (!raw) return;

      // Check if this assignment belongs to this deposit and is for a flex route
      const assignmentDepositId = raw.depositId;
      if (Number(assignmentDepositId) !== Number(depositId)) return;

      const routeObj = raw.route && typeof raw.route === 'object' ? (raw.route as Record<string, unknown>) : null;
      const routeId = raw.routeId ?? (routeObj ? routeObj.routeId : null);
      if (routeId != null) {
        allActiveIds.add(Number(routeId as number));
      }
    });

    return Array.from(allActiveIds);
  };

  const handleModalClose = () => {
    setOpenModalDepositId(null);
  };

  const handleModalConfirm = (selectedRoutes: Route[], selectedDatesFromModal?: string[], editData?: { userId?: number; vehicleId?: number; routeSort?: string; notes?: string; registrationPlate?: string }) => {
    if (openModalDepositId === null) return;
    const depositId = openModalDepositId;
    setOpenModalDepositId(null);

    const newIds = selectedRoutes.map(r => r.routeId).filter((id): id is number => id !== undefined);
    if (newIds.length === 0) return;

    // Add mode: merge new route(s) into existing selection for this deposit
    setSelectedFlexRoutesByDeposit(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(depositId) || new Set<number>();
      const next = new Set(current);
      newIds.forEach(id => next.add(id));
      newMap.set(depositId, next);
      return newMap;
    });

    if (onOpenDraftAssignmentForRoute && selectedRoutes.length > 0) {
      const selectedRoute = selectedRoutes[0];
      if (selectedRoute?.routeId) {
        // Use first selected date as the anchor date; pass all selected dates via editData
        const anchorDate = (selectedDatesFromModal && selectedDatesFromModal.length > 0)
          ? selectedDatesFromModal[0]
          : date;
        onOpenDraftAssignmentForRoute(
          selectedRoute.routeId,
          anchorDate,
          depositId,
          currentDepositForModal?.depositName ?? undefined,
          selectedRoute.routeName ?? undefined,
          { ...editData, dates: selectedDatesFromModal },
        );
      }
    }
  };

  return (
    <div id="weekly-planner-view" className="space-y-6 flex flex-col items-center w-full max-w-[100%]">
      {/* Management and Support Section */}
      {renderManagementSupportSection()}

      {/* OFF Section */}
      {renderOFFSection()}

      {/* NotAllocated Section */}
      {renderNotAllocatedSection()}

      {processedDeposits.map((deposit, idx) => (
        <DepositSection
          key={`deposit-${deposit.depositId ?? 'unknown'}-${idx}`}
          deposit={deposit}
          date={date}
          showWeekends={showWeekends}
          assignmentsByDate={assignmentsByDate}
          vendors={data.vendors}
          routes={data.routes}
          onEdit={onEdit}
          onDrop={onDrop}
          onAssignVendor={onAssignVendor}
          onCreateAdHocService={onCreateAdHocService}
          onCreateBaopService={onCreateBaopService}
          onAssignmentDelete={onAssignmentDelete}
          onOpenDraftAssignmentForRoute={onOpenDraftAssignmentForRoute}
          selectedFlexRoutesByDeposit={selectedFlexRoutesByDeposit}
          setSelectedFlexRoutesByDeposit={setSelectedFlexRoutesByDeposit}
          closedAdHocRoutesByDeposit={closedAdHocRoutesByDeposit}
          setClosedAdHocRoutesByDeposit={setClosedAdHocRoutesByDeposit}
          setOpenModalDepositId={setOpenModalDepositId}
          setOpenAdHocModalDepositId={(id, dateStr) => {
            setOpenAdHocModalDepositId(id);
            if (id !== null) {
              setOpenAdHocModalDate(dateStr ?? date);
            } else {
              setOpenAdHocModalDate(null);
            }
          }}
          draggedItem={draggedItem}
          draggedFromCell={draggedFromCell}
          onDragStart={(e, data, cell) => handleCardDragStart(e, data, cell)}
          hasAssignments={hasAssignments}
          onAddSupervisor={
            canAddManagementSupport && onCreateManagementSupport
              ? (depositId, depositName) => {
                const baseDate = parseLocalDate(date);
                const baseYmd = formatDate(baseDate, 'yyyy-mm-dd');
                const weekYmd = weekDates.map((d) => formatDate(d, 'yyyy-mm-dd'));
                const idx = weekYmd.indexOf(baseYmd);
                const nextDate =
                  idx >= 0 && idx < weekDates.length - 1
                    ? weekDates[idx + 1]
                    : baseDate;
                setOpenManagementSupportModal({
                  isOpen: true,
                  date: nextDate,
                  depositId,
                  depositName,
                });
              }
              : undefined
          }
          canAddFlexRoute={canAddFlexRoute}
        />
      ))}

      {/* Flex Route Selection Modal - add-only: add another flex-route item/vendor in this depot */}
      {currentDepositForModal && (
        <FlexRouteSelectionModal
          isOpen={openModalDepositId !== null}
          onClose={handleModalClose}
          onConfirm={handleModalConfirm}
          loopKey={currentDepositForModal.depositName || `deposit-${currentDepositForModal.depositId}`}
          depositId={currentDepositForModal.depositId}
          activeRouteIds={getActiveFlexRouteIds(openModalDepositId)}
          addOnly
          baseDate={date}
        />
      )}

      {/* ADHOC Service Modal - rendered once at the top level */}
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
                  service.dates,
                  service.vehicleId
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
          vendors={data.vendors}
          date={openAdHocModalDate ?? date}
          depotKey={processedDeposits.find(d => d.depositId === openAdHocModalDepositId)?.depositName || `deposit-${openAdHocModalDepositId}`}
          depotName={processedDeposits.find(d => d.depositId === openAdHocModalDepositId)?.depositName || `Deposit ${openAdHocModalDepositId}`}
          depositId={openAdHocModalDepositId}
          hideAdhocSort={hideAdhocSort}
        />
      )}

      {/* Daily Team Support Modal */}
      {openDailyTeamSupportModal.isOpen && onCreateDailyTeamSupport && (
        <DailyTeamSupportModal
          isOpen={openDailyTeamSupportModal.isOpen}
          onClose={() => setOpenDailyTeamSupportModal({ isOpen: false, date: new Date(), routeId: 0 })}
          onConfirm={async (data) => {
            try {
              await onCreateDailyTeamSupport(data.userId, data.routeId, data.date);
              setOpenDailyTeamSupportModal({ isOpen: false, date: new Date(), routeId: 0 });
            } catch (error) {
              console.error('Error creating daily team support:', error);
            }
          }}
          vendors={data.vendors}
          date={openDailyTeamSupportModal.date}
          routeId={openDailyTeamSupportModal.routeId}
          routeName={openDailyTeamSupportModal.routeName}
        />
      )}

      {/* Management Support Modal */}
      {openManagementSupportModal.isOpen && canAddManagementSupport && onCreateManagementSupport && (
        <ManagementSupportModal
          isOpen={openManagementSupportModal.isOpen}
          onClose={() => setOpenManagementSupportModal({ isOpen: false, date: new Date() })}
          onConfirm={async (data) => {
            try {
              await onCreateManagementSupport(data);
              setOpenManagementSupportModal({ isOpen: false, date: new Date() });
            } catch (error) {
              console.error('Error creating management support:', error);
            }
          }}
          date={openManagementSupportModal.date}
          routeName="Management and Support"
          initialDepositId={openManagementSupportModal.depositId}
          initialDepositName={openManagementSupportModal.depositName}
          initialFunctionId={openManagementSupportModal.functionId}
          initialUserId={openManagementSupportModal.userId}
          initialTitle={openManagementSupportModal.title}
        />
      )}

      {/* Edit Management Function Modal */}
      {editingManagementFunction && onEditManagementFunction && (
        <EditManagementFunctionModal
          open={editingManagementFunction !== null}
          onClose={() => setEditingManagementFunction(null)}
          functionTitle={editingManagementFunction.title}
          assignments={editingManagementFunction.assignments}
          onSave={async (newTitle) => {
            await onEditManagementFunction(newTitle, editingManagementFunction.assignments);
            setEditingManagementFunction(null);
          }}
          onDelete={async () => {
            if (onRemoveManagementFunction) {
              await onRemoveManagementFunction(editingManagementFunction.title);
            }
          }}
        />
      )}
    </div>
  );
};

export default WeeklyView;
