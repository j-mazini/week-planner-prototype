"use client";

import type { DragEvent } from "react";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import NavbarWrapper from "@/components/navbar-wrapper";
import { removeToken, getUserIdFromToken, getUserTypeFromToken, getBearerAuthHeader } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { resolveDepositIdForRestrictedUser } from "@/lib/daily-supervisor-check";
import { fetchVendors, type Vendor, type VendorCostModel } from "@/lib/vendors";
import PlannerView from "./components/PlannerView";
import type { DayOffEntry as PlannerDayOffEntry } from "./components/DayOffModal";
import type { WeekPlannerRecord } from "./contexts/PlannerContext";
import type { Route, DepositWithRoutesDTO } from "@/lib/api/routes";
import { DailyTeamSupportCreateDTO } from "./types/week-planner-dto";
// Type helper for routes with optional routeDefaultId (Route has index signature, so this is safe)
type RouteWithDefault = Route;
import { DgpPageFrame } from "@/app/(private)/components";
import { formatDate, getWeekStart, getWeekEnd, getWeekDates, isWeekend, parseLocalDate } from "./utils/dateUtils";
import { isFlexRoute } from "./utils/depotOrganizationUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Info, AlertCircle } from "lucide-react";
import ConfirmationModal from "./components/modals/ConfirmationModal";
import EditAssignmentModal from "./components/EditAssignmentModal";
import EditManagementSupportModal from "./components/modals/EditManagementSupportModal";
import { deleteWeekPlannersBulk, createDailyTeamSupportBulk, fetchDailyTeamSupport, fetchManagementTeamFunctions, exportWeekPlanners, createWeekPlannersBulk, fetchAllWeekPlannersForDate, createOperationsManagementBulkFromWeekPlanners, exportWeekPlannerPDF } from "./services/apiService";
import type { WeekPlannerCreateDTO } from "./services/apiService";
import { useWeekPlannerData } from "./hooks/useWeekPlannerData";
import { getLocalDateString } from "./utils/formUtils";
import { normalizeWeekPlanner } from "./utils/normalizeUtils";
import { useNalcRoute } from "@/hooks/useRoutes";
import { useBankHolidays } from "@/hooks/useBankHolidays";
import { BUSINESS_RULES } from "@/src/constants/businessRules";
import { guardedFetch } from "@/lib/in-flight-guard";

export type {
  WeekPlannerRecord,
  WeekPlannerFormData,
  WeekPlannerField,
} from "./contexts/PlannerContext";

const API_BASE_URL = getApiBaseUrl();

// --- Identidade de registros do week-planner -------------------------------
// Rascunhos em memória compartilham weekPlannerId === 0 e só se distinguem por
// raw.__draftKey. Comparar por weekPlannerId nesses casos casava com TODOS os
// rascunhos ao mesmo tempo, fazendo itens "sumirem" ao editar/atribuir outro.
// Use estes helpers no lugar de comparar weekPlannerId diretamente.
const getDraftKey = (op: unknown): string | undefined => {
  const raw = ((op as { raw?: Record<string, unknown> } | undefined)?.raw ?? {}) as Record<string, unknown>;
  const k = raw.__draftKey;
  return typeof k === "string" && k.trim() !== "" ? k : undefined;
};
const getAdhocServiceIdentity = (raw: Record<string, unknown> | undefined | null): string => {
  if (!raw) return "";
  const directId = raw.adhocServiceId;
  if (directId !== undefined && directId !== null && String(directId).trim() !== "") {
    return String(directId);
  }
  const nested = raw.adhocService;
  if (nested && typeof nested === "object") {
    const nestedId = (nested as Record<string, unknown>).adhocServiceId;
    if (nestedId !== undefined && nestedId !== null && String(nestedId).trim() !== "") {
      return String(nestedId);
    }
  }
  return "";
};
const isSameWeekPlannerOp = (
  a: WeekPlannerRecord | undefined | null,
  b: WeekPlannerRecord | undefined | null,
): boolean => {
  if (!a || !b) return false;
  if (a === b) return true;
  const ka = getDraftKey(a);
  const kb = getDraftKey(b);
  if (ka && kb) return ka === kb;
  const ida = a.weekPlannerId;
  const idb = b.weekPlannerId;
  if (typeof ida === "number" && ida !== 0 && typeof idb === "number" && idb !== 0) return ida === idb;
  return false;
};
const isExplicitlyUnallocatedOrDayOff = (op: WeekPlannerRecord | undefined | null): boolean => {
  if (!op) return false;
  const raw = (op.raw ?? {}) as Record<string, unknown>;
  const statusRaw = String(op.status ?? raw.status ?? "").trim();
  const isOff = op.isDayOff === "true" || raw.isDayOff === true || raw.isDayOff === "true";
  // Bug 0: OFF e NotAllocated nunca são alvo de substituição (PATCH); um drop sobre
  // esses estados deve gerar um novo assignment (POST).
  return (
    statusRaw === BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED ||
    statusRaw === BUSINESS_RULES.WORKING_STATUS.OFF ||
    isOff
  );
};

type VendorRecord = Record<string, unknown>;
// Loosely-typed vendor lookup result: mixes raw backend fields (index signature)
// with the known, strongly-typed Vendor fields used across drop/assign handlers.
type VendorLookup = Record<string, unknown> & Partial<Vendor>;

const toFiniteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
};


const getUserIdFromVendor = (vendor: VendorRecord): number | null => {
  return toFiniteNumber(vendor.userId);
};


const getVendorVehiclePlate = (vendor: VendorRecord | null | undefined): string => {
  if (!vendor) return "";
  const v = vendor;
  const topLevel = String(
    v.registrationPlates ??
    v.registration_plates ??
    v.registrationPlate ??
    v.registration_plate ??
    v.vehicleRegistrationPlate ??
    v.vehicleRegistration_plate ??
    v.vehicleDefaultRegistrationPlate ??
    v.vehicle_default_registrationPlate ??
    ""
  ).trim();
  if (topLevel) return topLevel;
  const vehicle = v.vehicle;
  if (vehicle && typeof vehicle === "object") {
    const vh = vehicle as Record<string, unknown>;
    const nested = String(
      vh.registrationPlates ??
      vh.registration_plates ??
      vh.registrationPlate ??
      vh.registration_plate ??
      vh.vehicleRegistrationPlate ??
      vh.vehicleRegistration_plate ??
      vh.vehicleDefaultRegistrationPlate ??
      vh.vehicle_default_registrationPlate ??
      ""
    ).trim();
    if (nested) return nested;
  }
  return "";
};

const getVendorVehicleModel = (vendor: VendorRecord | null | undefined): string => {
  if (!vendor) return "";
  const v = vendor;
  const topLevel = String(v.vehicleModel ?? v.vehicle_model ?? v.vehicleDefaultModel ?? v.model ?? v.vehicle_default_model ?? "").trim();
  if (topLevel) return topLevel;
  const vehicle = v.vehicle;
  if (vehicle && typeof vehicle === "object") {
    const vh = vehicle as Record<string, unknown>;
    const nested = String(vh.vehicleModel ?? vh.vehicle_model ?? vh.vehicleDefaultModel ?? vh.model ?? vh.vehicle_default_model ?? "").trim();
    if (nested) return nested;
  }
  return "";
};

/** DHOC — id da rota (placeholder para linhas ADHOC no week-planner, alinhado ao daily-game-plan). Fonte: {@link BUSINESS_RULES.ROUTE.DHOC}. */
const ADHOC_WEEK_PLANNER_ROUTE_ID = BUSINESS_RULES.ROUTE.DHOC;

/** BRTE — id da rota (grid legado / ADHOC placeholder). Fonte: {@link BUSINESS_RULES.ROUTE.BRTE}. */
const BRTE_ROUTE_ID = BUSINESS_RULES.ROUTE.BRTE;
const ADHOC_DEFAULT_ROUTE_ID = BRTE_ROUTE_ID;

/**
 * BRTE permite vários motoristas na mesma célula rota+dia; reconhece pelo id ou nome "BRTE".
 */
function isBRTERoute(
  routeId: number | null | undefined,
  targetRoute?: Route | null,
): boolean {
  const rid = routeId != null && Number.isFinite(Number(routeId)) ? Number(routeId) : NaN;
  const tid =
    targetRoute?.routeId != null && Number.isFinite(Number(targetRoute.routeId))
      ? Number(targetRoute.routeId)
      : NaN;
  const name = String(targetRoute?.routeName ?? targetRoute?.routeDefaultName ?? "").toUpperCase();
  return rid === BRTE_ROUTE_ID || tid === BRTE_ROUTE_ID || name === "BRTE";
}

function isBRTEVendorRoute(vendorRouteId: number, matchingRoute?: Route | null): boolean {
  return (
    vendorRouteId === BRTE_ROUTE_ID ||
    String(matchingRoute?.routeName ?? "").toUpperCase() === "BRTE"
  );
}

/**
 * BAOP deposit allows multiple vendors in the same route+day cell. Detected by
 * the route's deposit (depositId 7), with the BRTE-specific check as a
 * fallback for cases where depositId isn't resolved on the route object.
 */
function isBAOPRoute(
  routeId: number | null | undefined,
  targetRoute?: Route | null,
): boolean {
  if (targetRoute?.depositId === BUSINESS_RULES.DEPOSIT.BAOP_DEFAULT) return true;
  return isBRTERoute(routeId, targetRoute);
}

const WeekPlannerPageContent = () => {
  const router = useRouter();

  const { data: nalcRoute } = useNalcRoute();
  const nalcRouteId = nalcRoute?.routeId ?? BUSINESS_RULES.ROUTE.NOT_ALLOCATED;

  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [isClientMounted, setIsClientMounted] = useState(false);
  const userTypeId = isClientMounted ? getUserTypeFromToken() : null;
  const isSupervisorReadonly = !isClientMounted || userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR;
  const isUserType2 = isClientMounted && userTypeId === BUSINESS_RULES.USER_TYPE.DRIVER;

  // Hydration-safe permission resolution: server and first client render stay identical.
  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  // Use custom hook for data management
  const {
    allOperations,
    setAllOperations,
    error,
    setError,
    setRefreshTrigger,
    refreshAssignments,
    dayOffEntries,
    setDayOffEntries,
    vendors,
    routes,
    plannerData,
    fetchVendorsRaw,
    fetchVehiclesRaw,
  } = useWeekPlannerData(selectedDate);

  const selectedYear = useMemo(() => {
    if (!selectedDate) return new Date().getFullYear();
    return parseInt(selectedDate.substring(0, 4), 10) || new Date().getFullYear();
  }, [selectedDate]);
  const selectedMonth = useMemo(() => {
    if (!selectedDate) return new Date().getMonth() + 1;
    return parseInt(selectedDate.substring(5, 7), 10) || (new Date().getMonth() + 1);
  }, [selectedDate]);
  const { data: bankHolidaysCurrentYear } = useBankHolidays(selectedYear);
  // Only fetch next year when viewing December — weeks near year-end can bleed into January
  const { data: bankHolidaysNextYear } = useBankHolidays(selectedYear + 1, 'UK', selectedMonth >= 12);
  const bankHolidays = useMemo(() => {
    const set = new Set<string>();
    bankHolidaysCurrentYear?.forEach(d => set.add(d));
    bankHolidaysNextYear?.forEach(d => set.add(d));
    return set;
  }, [bankHolidaysCurrentYear, bankHolidaysNextYear]);

  const allOperationsRef = useRef<WeekPlannerRecord[]>(allOperations);
  useEffect(() => {
    allOperationsRef.current = allOperations;
  }, [allOperations]);

  // Dirty state: true when there are unsaved in-memory changes
  const hasUnsavedChanges = useMemo(() => {
    return allOperations.some((op) => {
      const raw = (op.raw ?? {}) as Record<string, unknown>;
      // New item not yet persisted (weekPlannerId = 0, not a management/team-support item)
      if (
        op.weekPlannerId === 0 &&
        raw.dailyTeamSupportId === undefined &&
        raw.__saved_to_wp_bulk !== true &&
        raw.__saved_to_dgp !== true
      ) return true;
      // Existing item modified locally (e.g. NotAllocated reassigned to a route)
      if (raw.__locallyModified === true) return true;
      return false;
    });
  }, [allOperations]);

  const [saveWeekBaselineFingerprint, setSaveWeekBaselineFingerprint] = useState<string>('');

  const savableWeekFingerprint = useMemo(() => {
    const weekStart = getWeekStart(selectedDate);
    const weekEnd = getWeekEnd(selectedDate);
    const weekDates = new Set<string>();
    for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
      weekDates.add(formatDate(d, "yyyy-mm-dd"));
    }

    const rows: string[] = [];

    allOperations.forEach((op) => {
      const raw = (op.raw ?? {}) as Record<string, unknown>;
      const opDate = String(op.date ?? raw.date ?? "").split("T")[0].slice(0, 10);
      if (!opDate || !weekDates.has(opDate)) return;

      if (raw.__saved_to_wp_bulk === true || raw.__saved_to_dgp === true) return;
      if (raw.dailyTeamSupportId != null) return;
      if (op.weekPlannerId != null && op.weekPlannerId < 0) return;
      if (raw.category === "management") return;

      const userId = Number(raw.userId ?? 0) || 0;
      const routeId = Number(
        raw.routeId ??
        (raw.route && typeof raw.route === "object" ? (raw.route as Record<string, unknown>).routeId : 0)
      ) || 0;
      const depositId = Number(raw.depositId ?? 0) || 0;
      const vehicleId = Number(raw.vehicleId ?? 0) || 0;
      const adhocServiceId = Number(
        raw.adhocServiceId ??
        (raw.adhocService && typeof raw.adhocService === "object"
          ? (raw.adhocService as Record<string, unknown>).adhocServiceId
          : 0)
      ) || 0;
      const adhocSort = Number(raw.adhocSort ?? 0) || 0;
      const notes = String(op.notes ?? raw.notes ?? '').trim();

      if (raw.__locallyModified === true) {
        rows.push(`m|${opDate}|${op.weekPlannerId}|${userId}|${routeId}|${depositId}|${vehicleId}|${adhocServiceId}|${adhocSort}|${notes}`);
        return;
      }

      if (op.weekPlannerId === 0) {
        rows.push(`n|${opDate}|${userId}|${routeId}|${depositId}|${vehicleId}|${adhocServiceId}|${adhocSort}|${notes}`);
      }
    });

    if (rows.length === 0) return '';
    rows.sort();
    return rows.join('||');
  }, [allOperations, selectedDate]);

  const hasSavableWeekChanges = useMemo(() => {
    if (!savableWeekFingerprint) return false;
    if (!saveWeekBaselineFingerprint) return true;
    return savableWeekFingerprint !== saveWeekBaselineFingerprint;
  }, [savableWeekFingerprint, saveWeekBaselineFingerprint]);

  // Modal state
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    title: string;
    message: string;
    details?: string;
    onConfirm: () => void | Promise<void>;
    variant?: 'danger' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
    secondaryActionText?: string;
    onSecondaryAction?: () => void | Promise<void>;
  } | null>(null);
  const [showEditAssignmentModal, setShowEditAssignmentModal] = useState(false);
  const [showEditManagementSupportModal, setShowEditManagementSupportModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<WeekPlannerRecord | null>(null);
  const [showWeekends, setShowWeekends] = useState(false); // Sync with PlannerView toggle for Assign Week
  const [isWeekLocked, setIsWeekLocked] = useState(false);
  const completedFlexDraftKeysRef = useRef<Set<string>>(new Set());
  // Dropping a vendor (e.g. a Spare vendor) onto a cell can optimistically patch an
  // existing real NotAllocated record (route/vehicle/status filled in) before the user
  // confirms anything in the modal. Snapshot the pre-patch record here, keyed by its real
  // weekPlannerId, so Cancel can revert it; mark it confirmed only once Save actually runs.
  const notAllocatedPatchSnapshotsRef = useRef<Map<number, WeekPlannerRecord>>(new Map());
  const notAllocatedPatchConfirmedRef = useRef<Set<number>>(new Set());
  const [infoModalData, setInfoModalData] = useState<{
    type: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message: string;
    details?: string;
  } | null>(null);

  // While Edit/Add modals are open, prevent page scroll behind them.
  // We must override layout-injected `body { overflow-y: auto !important; }` from NavbarWrapper,
  // so we toggle a data-attr + inject a small style with `!important`.
  useEffect(() => {
    const shouldLockScroll = showEditAssignmentModal || showEditManagementSupportModal;
    const docEl = document.documentElement;
    const body = document.body;

    const prevPaddingRight = body.style.paddingRight;

    const styleId = "week-planner-scroll-lock-style";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent = `
        html[data-scroll-locked="true"],
        body[data-scroll-locked="true"] {
          overflow: hidden !important;
          overscroll-behavior: none !important;
          touch-action: none !important;
        }
      `;
      document.head.appendChild(styleEl);
    }

    const preventScroll = (e: Event) => {
      if (!shouldLockScroll) return;
      e.preventDefault();
    };

    if (shouldLockScroll) {
      const scrollbarWidth = window.innerWidth - docEl.clientWidth;
      docEl.setAttribute("data-scroll-locked", "true");
      body.setAttribute("data-scroll-locked", "true");
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // Extra safety: block wheel/touch scrolling (trackpad/mobile)
      window.addEventListener("wheel", preventScroll, { passive: false });
      window.addEventListener("touchmove", preventScroll, { passive: false });
    } else {
      docEl.removeAttribute("data-scroll-locked");
      body.removeAttribute("data-scroll-locked");
      body.style.paddingRight = prevPaddingRight;
      window.removeEventListener("wheel", preventScroll as EventListener);
      window.removeEventListener("touchmove", preventScroll as EventListener);
    }

    return () => {
      docEl.removeAttribute("data-scroll-locked");
      body.removeAttribute("data-scroll-locked");
      body.style.paddingRight = prevPaddingRight;
      window.removeEventListener("wheel", preventScroll as EventListener);
      window.removeEventListener("touchmove", preventScroll as EventListener);
    };
  }, [showEditAssignmentModal, showEditManagementSupportModal]);

  const showSupervisorReadonlyMessage = useCallback(() => {
    setInfoModalData({
      type: 'info',
      title: 'Read-only access',
      message: 'Supervisors have view-only access in Week Planner.',
      details: 'Editing, dragging and saving are disabled for this profile.',
    });
    setShowInfoModal(true);
  }, []);

  const showWeekLockedMessage = useCallback(() => {
    setInfoModalData({
      type: 'info',
      title: 'Week locked',
      message: 'This week has been submitted and is now locked.',
      details: 'No further changes can be made. If you need adjustments, please contact an admin.',
    });
    setShowInfoModal(true);
  }, []);

  const normalizeDateOnly = (value: string): string => {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    return raw.includes("T") ? raw.split("T")[0] : raw;
  };

  const isEditableDate = useCallback((value: string): boolean => {
    const normalized = normalizeDateOnly(value);
    if (!normalized) return false;
    return normalized > getLocalDateString();
  }, []);

  // Management & Support follow the same rule as regular assignments:
  // they can be created/edited only from tomorrow onwards.
  const isManagementSupportEditableDate = useCallback((value: string): boolean => {
    return isEditableDate(value);
  }, [isEditableDate]);

  const showDateReadonlyMessage = useCallback((dateValue: string) => {
    const normalized = normalizeDateOnly(dateValue);
    setInfoModalData({
      type: "info",
      title: "Read-only date",
      message: "Current date and past dates are view-only.",
      details: normalized
        ? `Editing is allowed only from tomorrow onwards. Date ${normalized} cannot be changed.`
        : "Editing is allowed only from tomorrow onwards.",
    });
    setShowInfoModal(true);
  }, []);

  const isAssignmentReadonly = (assignment: WeekPlannerRecord | null): boolean => {
    if (!assignment) return false;
    const raw = (assignment.raw ?? {}) as Record<string, unknown>;
    const assignmentDate = assignment.date || String(raw.date ?? "");
    return !isEditableDate(assignmentDate);
  };

  const getAssignmentUserId = useCallback((assignment: WeekPlannerRecord): number => {
    const raw = (assignment.raw ?? {}) as Record<string, unknown>;
    const rawVendor = raw.vendor;
    const vendorObj = rawVendor && typeof rawVendor === "object"
      ? (rawVendor as Record<string, unknown>)
      : undefined;
    const resolved = Number(
      raw.userId ??
      raw.userId ??
      vendorObj?.userId ??
      vendorObj?.userId ??
      0
    );
    return Number.isFinite(resolved) && resolved > 0 ? resolved : 0;
  }, []);

  const isManagementSupportAssignment = useCallback((assignment: WeekPlannerRecord): boolean => {
    const raw = (assignment.raw ?? {}) as Record<string, unknown>;
    return (
      assignment.weekPlannerId < 0 ||
      raw.dailyTeamSupportId != null ||
      String(raw.category ?? "").toLowerCase() === "management" ||
      String(assignment.route ?? "").toLowerCase().includes("management and support")
    );
  }, []);

  const hasRouteAssignmentForVendorOnDate = useCallback((userId: number, dateValue: string): boolean => {
    const normalizedDate = normalizeDateOnly(dateValue);
    if (!userId || !normalizedDate) return false;
    return allOperations.some((op) => {
      if (isManagementSupportAssignment(op)) return false;
      if (normalizeDateOnly(op.date) !== normalizedDate) return false;
      if (getAssignmentUserId(op) !== userId) return false;

      const raw = (op.raw ?? {}) as Record<string, unknown>;
      const statusRaw = String(raw.status ?? op.status ?? "").trim();
      if (statusRaw === BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED) return false;
      if (op.isDayOff === "true" || raw.isDayOff === true || raw.isDayOff === "true") return false;

      const routeObj = raw.route && typeof raw.route === "object"
        ? (raw.route as Record<string, unknown>)
        : undefined;
      const routeId = Number(raw.routeId ?? raw.routeDefaultId ?? routeObj?.routeId ?? routeObj?.routeDefaultId ?? 0);
      return Number.isFinite(routeId) && routeId > 0 && routeId !== nalcRouteId;
    });
  }, [allOperations, getAssignmentUserId, isManagementSupportAssignment, nalcRouteId]);

  const handleDateChange = useCallback((newDate: string) => {
    setSelectedDate(newDate);
  }, []);

  const handleAuthError = useCallback(
    (message?: string) => {
      removeToken();
      setError(message || "Your session has expired. Please log in again.");
      router.push("/?callbackUrl=/week-planner");
    },
    [router, setError],
  );

  const removeWeekPlannerLocally = useCallback((weekPlannerId: number) => {
    setAllOperations((prev) => prev.filter((item) => item.weekPlannerId !== weekPlannerId));
  }, [setAllOperations]);

  // Remove all Management and Support assignments for a specific function/title
  const handleRemoveManagementFunction = useCallback(async (functionTitle: string): Promise<void> => {
    setAllOperations((prev) => prev.filter((op) => {
      const raw = op.raw as Record<string, unknown> | undefined;
      // Check if it's a Management and Support assignment (including daily-team-support)
      const isManagementSupport =
        op.weekPlannerId === 0 ||
        op.weekPlannerId < 0 || // Negative IDs indicate daily-team-support
        raw?.category === "management" ||
        raw?.dailyTeamSupportId !== undefined ||
        String(op.route || "").toLowerCase().includes("management and support");

      if (!isManagementSupport) {
        return true; // Keep non-management assignments
      }

      // Check if this assignment belongs to the function/title we want to remove
      const assignmentTitle = op.notes || op.route || 'Management and Support';
      return assignmentTitle !== functionTitle; // Remove if it matches
    }));
  }, [setAllOperations]);

  const handleEdit = (weekPlanner: WeekPlannerRecord) => {
    const raw = weekPlanner.raw as Record<string, unknown> | undefined;

    // Check if it's a Management Support assignment (daily-team-support)
    const isManagementSupport =
      weekPlanner.weekPlannerId < 0 || // Negative IDs indicate daily-team-support
      raw?.dailyTeamSupportId !== undefined ||
      raw?.category === "management" ||
      String(weekPlanner.route || "").toLowerCase().includes("management and support");

    if (isManagementSupport) {
      setEditingAssignment(weekPlanner);
      setShowEditManagementSupportModal(true);
      return;
    }

    // For ADHOC assignments, mark __source so EditAssignmentModal shows ADHOC fields
    const hasAdhocService =
      (raw?.adhocServiceId && Number(raw.adhocServiceId) > 0) ||
      (raw?.adhocService &&
        typeof raw.adhocService === "object" &&
        Number((raw.adhocService as Record<string, unknown>).adhocServiceId) > 0);

    const assignmentToEdit: WeekPlannerRecord = hasAdhocService
      ? { ...weekPlanner, raw: { ...raw, __source: "adhoc-section" } }
      : weekPlanner;

    setEditingAssignment(assignmentToEdit);
    setShowEditAssignmentModal(true);
  };

  // Handle assignment update (vendor, vehicle, cost model, sort, notes)
  const handleUpdateVehicle = useCallback(async (
    weekPlannerId: number,
    userId: number,
    vehicleId: number,
    costModelId?: number,
    routeSort?: string,
    notes?: string,
    assignment?: WeekPlannerRecord,
    vehicleName?: string,
    registrationPlate?: string,
    costModelName?: string,
    adhocServiceId?: number | null,
    depositId?: number | null,
  ) => {
    const assignmentToUse = assignment || editingAssignment;
    const assignmentDateForEdit = assignmentToUse?.date ?? String((assignmentToUse?.raw as Record<string, unknown> | undefined)?.date ?? "");
    if (assignmentDateForEdit && !isEditableDate(assignmentDateForEdit)) {
      showDateReadonlyMessage(assignmentDateForEdit);
      throw new Error("Current date and past dates are view-only.");
    }

    // Helper: extract routeId from assignment
    const getRouteIdFromAssignment = (raw: Record<string, unknown>): number => {
      const topLevel = raw.routeId ?? raw.routeDefaultId;
      if (topLevel != null) return Number(topLevel);
      if (raw.route && typeof raw.route === 'object') {
        const routeObj = raw.route as Record<string, unknown>;
        return Number(routeObj.routeId ?? routeObj.routeDefaultId ?? 0);
      }
      return 0;
    };

    // Pre-calculate OTHER vendor assignments to delete (when vendor is changing)
    // Use IDs instead of object references for reliable comparison
    const assignmentRawForVendorCheck = (assignmentToUse?.raw ?? {}) as Record<string, unknown>;
    const oldUserIdForVendorCheck = Number((assignmentToUse?.raw as Record<string, unknown>)?.userId ?? 0);
    const assignmentRouteIdForCheck = getRouteIdFromAssignment(assignmentRawForVendorCheck);
    const assignmentDepositIdForCheck = Number(assignmentRawForVendorCheck.depositId ?? (assignmentRawForVendorCheck.route && typeof assignmentRawForVendorCheck.route === 'object' ? (assignmentRawForVendorCheck.route as Record<string, unknown>).depositId : null) ?? 0);
    const vendorIsChangingForCheck = Boolean(oldUserIdForVendorCheck && oldUserIdForVendorCheck !== userId);

    // DHOC/BRTE are shared "bucket" routes used by every ADHOC service across every vendor —
    // unlike a loop/rota route, they are NOT an exclusive single-vendor slot. Purging "other
    // vendor" assignments on this route would wipe out every unrelated ADHOC item for that
    // day/deposit whenever a single ADHOC item's vendor is swapped.
    const isSharedAdhocBucketRoute =
      assignmentRouteIdForCheck === BUSINESS_RULES.ROUTE.DHOC ||
      assignmentRouteIdForCheck === BUSINESS_RULES.ROUTE.BRTE;

    const otherVendorAssignmentIdsToDelete: (string | number)[] = [];
    if (vendorIsChangingForCheck && assignmentDateForEdit && assignmentRouteIdForCheck > 0 && !isSharedAdhocBucketRoute) {
      const dateKey = String(assignmentDateForEdit).split('T')[0];
      const toDateKey = (d: string | undefined): string => (d ? String(d).split('T')[0].trim() : '');

      for (const op of allOperations) {
        if (op.weekPlannerId === weekPlannerId) continue;
        if (toDateKey(op.date) !== dateKey) continue;

        const opRaw = (op.raw ?? {}) as Record<string, unknown>;
        const opRouteId = getRouteIdFromAssignment(opRaw);
        const opDepositId = Number(opRaw.depositId ?? (opRaw.route && typeof opRaw.route === 'object' ? (opRaw.route as Record<string, unknown>).depositId : null) ?? 0);
        const opUserId = Number(opRaw.userId ?? 0);

        if (opRouteId !== assignmentRouteIdForCheck) continue;
        if (opUserId === userId) continue;
        if (opUserId === oldUserIdForVendorCheck) continue;
        if (assignmentDepositIdForCheck > 0 && opDepositId > 0 && opDepositId !== assignmentDepositIdForCheck) continue;

        // Store the weekPlannerId (or a unique identifier) instead of the object reference
        const idToDelete = op.weekPlannerId !== null && op.weekPlannerId !== undefined ? op.weekPlannerId : `draft-${op.date}-${opUserId}-${opRouteId}`;
        otherVendorAssignmentIdsToDelete.push(idToDelete);
      }
    }

    // If weekPlannerId is 0, update locally only (assignment not saved yet)
    if (weekPlannerId === 0 && assignmentToUse) {
      const assignmentRawForDraft = (assignmentToUse.raw ?? {}) as Record<string, unknown>;
      const draftKey =
        typeof assignmentRawForDraft.__draftKey === "string" && assignmentRawForDraft.__draftKey.trim() !== ""
          ? assignmentRawForDraft.__draftKey
          : null;

      // Find the assignment in allOperations: prefer reference equality (same object), then draftKey, then criteria
      const assignmentToUpdate = allOperations.find((op) => op === assignmentToUse)
        ?? allOperations.find((op) => {
          if (draftKey) {
            const rawOp = (op.raw ?? {}) as Record<string, unknown>;
            return rawOp.__draftKey === draftKey;
          }
          const matchesName = op.name === assignmentToUse.name;
          const matchesDate = op.date === assignmentToUse.date;
          const matchesRoute = op.route === assignmentToUse.route;
          const raw = op.raw as Record<string, unknown>;
          const rawEditing = assignmentToUse.raw as Record<string, unknown>;
          const matchesVendorId = String(raw?.userId ?? "") === String(rawEditing?.userId ?? "");
          return matchesName && matchesDate && matchesRoute && matchesVendorId;
        });

      if (assignmentToUpdate) {
        // Fetch adhoc service info if adhocServiceId is provided (for adhocService object and deposit matching)
        let adhocServiceInfo: { adhocName?: string; depositId?: number; depositName?: string; isAdhocSort?: boolean } | null = null;
        if (adhocServiceId && Number.isFinite(adhocServiceId) && adhocServiceId > 0) {
          try {
            const { fetchAdhocServices } = await import('@/lib/adhoc-services-api');
            const adhocServices = await fetchAdhocServices();
            const service = adhocServices.find(s => s.adhocServiceId === adhocServiceId);
            if (service) {
              adhocServiceInfo = {
                adhocName: service.adhocName,
                depositId: service.depositId ?? undefined,
                depositName: service.depositName ?? undefined,
                isAdhocSort: service.isAdhocSort,
              };
            }
          } catch (err) {
            console.warn('[handleUpdateVehicle] Failed to fetch adhoc services for local update (weekPlannerId=0):', err);
          }
        }

        // Get depositId and depositName
        let finalDepositIdLocal = depositId ?? (assignmentToUse.raw as Record<string, unknown>)?.depositId as number | undefined;
        let finalDepositNameLocal: string | undefined = adhocServiceInfo?.depositName;

        if (finalDepositIdLocal && !finalDepositNameLocal && plannerData?.depositsWithRoutes?.length) {
          const deposit = plannerData.depositsWithRoutes.find(d => d.depositId === finalDepositIdLocal);
          finalDepositNameLocal = deposit?.depositName;
        }

        if (!finalDepositIdLocal && plannerData?.depositsWithRoutes?.length) {
          const rawAssignment = assignmentToUse.raw as Record<string, unknown>;
          const routeId = rawAssignment?.routeId ?? (rawAssignment?.route && typeof rawAssignment.route === 'object'
            ? (rawAssignment.route as Record<string, unknown>).routeId
            : null);
          if (routeId) {
            for (const deposit of plannerData.depositsWithRoutes) {
              const foundRoute = deposit.routes?.find(r => r.routeId === Number(routeId));
              if (foundRoute) {
                finalDepositIdLocal = deposit.depositId;
                finalDepositNameLocal = deposit.depositName;
                break;
              }
            }
          }
        }

        // Determine if we should convert the existing draft to NotAllocated for the old vendor/user
        const oldUserIdForDraft = Number((assignmentToUpdate.raw as Record<string, unknown>)?.userId ?? 0);
        const assignmentDateForDraft = assignmentToUpdate.date ?? String((assignmentToUpdate.raw as Record<string, unknown>)?.date ?? "");
        const draftVendorIsChanging = Boolean(oldUserIdForDraft && oldUserIdForDraft !== userId);
        const otherDraftItemsForOldVendor = draftVendorIsChanging && assignmentDateForDraft
          ? allOperations.filter(op => {
            const opRaw = op.raw as Record<string, unknown>;
            const opUserId = Number(opRaw?.userId ?? 0);
            const opDate = op.date ?? String(opRaw?.date ?? "");
            return opUserId === oldUserIdForDraft && opDate === assignmentDateForDraft && op !== assignmentToUpdate;
          })
          : [];
        const shouldPatchDraftNotAllocated = draftVendorIsChanging && otherDraftItemsForOldVendor.length === 0 && Boolean(assignmentDateForDraft);

        // Helper: isTarget predicate for the draft being edited
        const isTargetDraft = (op: WeekPlannerRecord) => {
          if (op === assignmentToUse) return true;
          if (draftKey) {
            const rawOp = (op.raw ?? {}) as Record<string, unknown>;
            return rawOp.__draftKey === draftKey;
          }
          const raw = op.raw as Record<string, unknown>;
          const rawEditing = assignmentToUse.raw as Record<string, unknown>;
          return (
            op.name === assignmentToUse.name &&
            op.date === assignmentToUse.date &&
            op.route === assignmentToUse.route &&
            String(raw?.userId ?? "") === String(rawEditing?.userId ?? "")
          );
        };

        if (shouldPatchDraftNotAllocated) {
          // Convert the existing draft to NotAllocated for the old vendor,
          // then add a new draft for the new vendor with the original route/settings
          setAllOperations((prev) => {
            // First, remove other vendor assignments on the same route+date
            const filtered = prev.filter((op) => {
              const opId = op.weekPlannerId !== null && op.weekPlannerId !== undefined ? op.weekPlannerId : `draft-${op.date}-${Number((op.raw as Record<string, unknown>)?.userId ?? 0)}-${getRouteIdFromAssignment((op.raw as Record<string, unknown>))}`;
              return !otherVendorAssignmentIdsToDelete.includes(opId);
            });

            const targetOp = filtered.find(isTargetDraft);
            const mapped = filtered.map((op) => {
              if (!isTargetDraft(op)) return op;
              return {
                ...op,
                routeSort: 'no' as const,
                isSort: 'false',
                status: BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED,
                raw: {
                  ...op.raw,
                  userId: oldUserIdForDraft,
                  routeId: nalcRouteId, // NALC — rota padrão para itens NotAllocated
                  vehicleId: BUSINESS_RULES.VEHICLE.BAOP_DEFAULT_PLACEHOLDER,
                  depositId: BUSINESS_RULES.DEPOSIT.BAOP_DEFAULT,
                  status: BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED,
                  isDayOff: false,
                  isSort: false,
                  costModelId: 9,
                  adhocService: {},
                  adhocServiceId: null,
                  __isFlex_draft: false,
                  __draft_completed: true,
                },
              };
            });

            if (!targetOp) {
              console.warn('[handleUpdateVehicle][DIAG] targetOp NOT FOUND — vendor swap dropped, no new draft created', {
                draftKey,
                assignmentToUseRaw: assignmentToUse.raw,
                filteredCount: filtered.length,
                prevCount: prev.length,
              });
              return mapped;
            }

            const targetRaw = targetOp.raw as Record<string, unknown>;
            const newVendorRecord = Array.isArray(vendors)
              ? (vendors as unknown as Record<string, unknown>[]).find(v => Number(v.userId ?? v.userId ?? 0) === userId)
              : null;
            const newVendorName = newVendorRecord
              ? (String((newVendorRecord as Record<string, unknown>).fullName ?? '').trim()
                || `${String((newVendorRecord as Record<string, unknown>).name ?? '')} ${String((newVendorRecord as Record<string, unknown>).lastName ?? '')}`.trim())
              : '';
            const finalDraftRouteSort = routeSort || 'yes';
            const existingAdhocServiceObj = targetRaw?.adhocService as Record<string, unknown> | undefined;
            const existingAdhocServiceId = targetRaw?.adhocServiceId ?? existingAdhocServiceObj?.adhocServiceId;
            const finalAdhocServiceId = adhocServiceId !== undefined && adhocServiceId !== null ? adhocServiceId : existingAdhocServiceId;

            const newVendorDraft: WeekPlannerRecord = {
              weekPlannerId: 0,
              date: assignmentDateForDraft,
              name: newVendorName,
              route: targetOp.route,
              routeSort: finalDraftRouteSort === 'yes' ? 'yes' : 'no',
              adhocSort: targetOp.adhocSort || 'false',
              notes: notes || '',
              reason: '',
              vehicle: vehicleName || targetOp.vehicle || '',
              registrationPlate: registrationPlate || targetOp.registrationPlate || '',
              status: String(targetRaw.status ?? 'Scheduled'),
              isDayOff: 'false',
              isSort: finalDraftRouteSort === 'yes' ? 'true' : 'false',
              raw: {
                ...targetRaw,
                __draftKey: `new-vendor-draft-${userId}-${assignmentDateForDraft}-${Date.now()}`,
                userId: userId,
                vehicleId: vehicleId,
                routeSort: finalDraftRouteSort === 'yes' ? 'yes' : 'no',
                isSort: finalDraftRouteSort === 'yes',
                notes: notes || '',
                adhocServiceId: finalAdhocServiceId,
                depositId: finalDepositIdLocal ?? targetRaw.depositId,
                depositName: finalDepositNameLocal ?? targetRaw.depositName,
                adhocService: finalAdhocServiceId && adhocServiceInfo ? {
                  adhocServiceId: finalAdhocServiceId,
                  adhocName: adhocServiceInfo.adhocName,
                  isAdhocSort: adhocServiceInfo.isAdhocSort,
                } : targetRaw.adhocService || targetRaw.adhocService,
                vehicle: vehicleName ? {
                  vehicleId: vehicleId,
                  vehicleModel: vehicleName,
                  vehicleRegistrationPlate: registrationPlate,
                } : targetRaw.vehicle,
                vendor: newVendorRecord ? {
                  userId: userId,
                  fullName: newVendorName,
                } : targetRaw.vendor,
                __isFlex_draft: false,
                __draft_completed: true,
              },
            };

            console.warn('[handleUpdateVehicle][DIAG] vendor swap: old->NotAllocated + new draft created', {
              oldUserIdForDraft,
              newUserId: userId,
              date: assignmentDateForDraft,
              newVendorDraftRaw: newVendorDraft.raw,
              mappedCount: mapped.length,
              totalCount: mapped.length + 1,
            });
            return [...mapped, newVendorDraft];
          });
        } else {
          // Normal draft update: update the existing draft with the new vendor/vehicle/etc
          setAllOperations((prev) => {
            // First, remove other vendor assignments on the same route+date
            const filtered = prev.filter((op) => {
              const opId = op.weekPlannerId !== null && op.weekPlannerId !== undefined ? op.weekPlannerId : `draft-${op.date}-${Number((op.raw as Record<string, unknown>)?.userId ?? 0)}-${getRouteIdFromAssignment((op.raw as Record<string, unknown>))}`;
              return !otherVendorAssignmentIdsToDelete.includes(opId);
            });

            return filtered.map((op) => {
              if (!isTargetDraft(op)) return op;
              const finalDraftRouteSort = routeSort || "yes";
              const raw = op.raw as Record<string, unknown>;
              const adhocServiceObj = raw?.adhocService as Record<string, unknown> | undefined;
              const existingAdhocServiceId = raw?.adhocServiceId ?? adhocServiceObj?.adhocServiceId;
              const finalAdhocServiceId = adhocServiceId ?? existingAdhocServiceId;
              const vendorRecord = Array.isArray(vendors) ? (vendors as unknown as Record<string, unknown>[]).find((v) => Number(v.userId ?? v.userId ?? 0) === userId) : null;
              const vendorName = vendorRecord
                ? (String((vendorRecord as Record<string, unknown>).fullName ?? '').trim()
                  || `${String((vendorRecord as Record<string, unknown>).name ?? '')} ${String((vendorRecord as Record<string, unknown>).lastName ?? '')}`.trim())
                : (op.name || '');

              const updatedRaw = {
                ...op.raw,
                userId: userId,
                vehicleId: vehicleId,
                routeSort: finalDraftRouteSort === 'yes' ? 'yes' : 'no',
                isSort: finalDraftRouteSort === 'yes',
                notes: notes || op.raw?.notes || '',
                adhocServiceId: finalAdhocServiceId,
                depositId: finalDepositIdLocal ?? (op.raw as Record<string, unknown>)?.depositId,
                depositName: finalDepositNameLocal ?? (op.raw as Record<string, unknown>)?.depositName,
                adhocService: finalAdhocServiceId && adhocServiceInfo ? {
                  adhocServiceId: finalAdhocServiceId,
                  adhocName: adhocServiceInfo.adhocName,
                  isAdhocSort: adhocServiceInfo.isAdhocSort,
                } : (op.raw as Record<string, unknown>)?.adhocService || (op.raw as Record<string, unknown>)?.adhocService,
                vehicleregistrationPlate: registrationPlate || op.raw?.vehicleregistrationPlate,
                vehicle: vehicleName ? {
                  vehicleId: vehicleId,
                  vehicleModel: vehicleName,
                  vehicleRegistrationPlate: registrationPlate,
                } : (op.raw as Record<string, unknown>)?.vehicle,
                vendor: vendorName ? {
                  userId: userId,
                  fullName: vendorName,
                } : op.raw?.vendor,
                __isFlex_draft: false,
                __draft_completed: true,
              };
              return {
                ...op,
                name: vendorName,
                routeSort: finalDraftRouteSort === 'yes' ? 'yes' : 'no',
                notes: notes || op.notes || '',
                vehicle: vehicleName || op.vehicle,
                registrationPlate: registrationPlate || op.registrationPlate,
                raw: updatedRaw,
              };
            });
          });
        }

        if (draftKey) {
          completedFlexDraftKeysRef.current.add(draftKey);
        }

        const isDragDraftForMsg = assignmentRawForDraft.__is_drag_draft === true;
        setInfoModalData({
          type: 'success',
          title: isDragDraftForMsg ? 'Assignment Added' : 'Assignment Updated',
          message: isDragDraftForMsg
            ? 'The vendor has been added locally.'
            : 'The vehicle, cost model and sort status have been updated locally.',
          details: 'Changes will be saved when you save the week.'
        });
        setShowInfoModal(true);
        return;
      }
    }

    const finalRouteSort = routeSort || "yes";

    // Update local state only - no API calls
    // All changes are persisted to backend when "Save Week" is clicked
    if (assignment) {
      const vendor = vendors.find(d => d.userId === userId);
      const vendorName = vendor?.fullName || assignment.name;

      setAllOperations((prev) => {
        // First, remove other vendor assignments on the same route+date
        const filtered = prev.filter((op) => {
          const opId = op.weekPlannerId !== null && op.weekPlannerId !== undefined ? op.weekPlannerId : `draft-${op.date}-${Number((op.raw as Record<string, unknown>)?.userId ?? 0)}-${getRouteIdFromAssignment((op.raw as Record<string, unknown>))}`;
          return !otherVendorAssignmentIdsToDelete.includes(opId);
        });

        return filtered.map((op) => {
          if (op.weekPlannerId === weekPlannerId) {
            const finalAdhocServiceId = adhocServiceId ?? (() => {
              const raw = op.raw as Record<string, unknown>;
              const adhocServiceObj = raw?.adhocService as Record<string, unknown> | undefined;
              return raw?.adhocServiceId ?? adhocServiceObj?.adhocServiceId ?? undefined;
            })();

            return {
              ...op,
              name: vendorName,
              registrationPlate: registrationPlate || op.registrationPlate || "",
              notes: notes || op.notes || '',
              routeSort: finalRouteSort === 'yes' ? 'yes' : 'no',
              isSort: finalRouteSort === 'yes' ? 'true' : 'false',
              vehicle: vehicleName || op.vehicle || '',
              raw: {
                ...op.raw,
                userId: userId,
                vehicleId: vehicleId || (op.raw as Record<string, unknown>)?.vehicleId,
                costModelId: costModelId || (op.raw as Record<string, unknown>)?.costModelId,
                isSort: finalRouteSort === 'yes',
                notes: notes || op.raw?.notes || '',
                adhocServiceId: finalAdhocServiceId,
                depositId: depositId ?? (op.raw as Record<string, unknown>)?.depositId,
                __locallyModified: weekPlannerId > 0, // Mark as modified if persisted
              },
            };
          }
          return op;
        });
      });
    }

    // User actually confirmed via Save — this weekPlannerId's pending NotAllocated-patch
    // snapshot (if any) should now be kept, not reverted, when the modal closes.
    if (notAllocatedPatchSnapshotsRef.current.has(weekPlannerId)) {
      notAllocatedPatchConfirmedRef.current.add(weekPlannerId);
    }

    setInfoModalData({
      type: 'success',
      title: 'Assignment Saved Locally',
      message: 'The assignment has been updated locally.',
      details: 'Click "Save Week" button to persist all changes to the backend.'
    });
    setShowInfoModal(true);
  }, [allOperations, editingAssignment, vendors, setAllOperations, plannerData, isEditableDate, nalcRouteId, showDateReadonlyMessage]);

  // Ref to prevent multiple simultaneous drops
  const isProcessingDrop = useRef(false);
  const lastDropId = useRef<string>('');

  const handleDrop = async (e: DragEvent<Element>, routeId: number, dateStr: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSupervisorReadonly) {
      showSupervisorReadonlyMessage();
      return;
    }

    if (!isEditableDate(dateStr)) {
      if (isWeekLocked) {
        showWeekLockedMessage();
      } else {
        showDateReadonlyMessage(dateStr);
      }
      return;
    }

    // Create unique drop ID
    const dropId = `${routeId}-${dateStr}-${Date.now()}`;

    // Prevent multiple simultaneous drops
    if (isProcessingDrop.current) {
      return;
    }

    // Check if this is the same drop being processed again
    if (lastDropId.current === dropId) {
      return;
    }

    isProcessingDrop.current = true;
    lastDropId.current = dropId;

    try {
      // Priority 1: Check if dragData was passed directly from DayCell (via WeeklyView)
      // This is important for routeId 55 (BRTE) to get depositId and depositName
      let dragData: { assignmentId?: number; userId?: number; vendorName?: string; type?: string; depositId?: number; depositName?: string; draftKey?: string } | null = null;

      const enhancedEvent = e as DragEvent<Element> & { dragData?: { assignmentId?: number; userId?: number; vendorName?: string; type?: string; depositId?: number; depositName?: string; draftKey?: string } | null };
      if (enhancedEvent.dragData) {
        dragData = enhancedEvent.dragData;
      } else {
        // Priority 2: Try to get data from application/json (new format)
        try {
          const jsonData = e.dataTransfer.getData("application/json");
          if (jsonData) {
            dragData = JSON.parse(jsonData);
          }
        } catch {
          // Fallback to text/plain format
          const textData = e.dataTransfer.getData("text/plain");
          if (textData) {
            dragData = JSON.parse(textData);
          }
        }
      }

      if (!dragData) {
        console.error("No drag data found");
        return;
      }

      // Handle moving existing assignment
      if (dragData.assignmentId) {
        const assignment = allOperations.find((op) => op.weekPlannerId === dragData.assignmentId);
        if (assignment) {
          const sourceIsManagementSupport = isManagementSupportAssignment(assignment);

          // Do not allow dragging Management Support cards into route cells.
          if (sourceIsManagementSupport) {
            setInfoModalData({
              type: 'warning',
              title: 'Invalid Move',
              message: 'Management and Support items cannot be moved to route cells.',
              details: 'Edit or remove the Management and Support item first, then create a route assignment separately.',
            });
            setShowInfoModal(true);
            return;
          }

          // Block cross-route moves: drag-and-drop is only allowed within the same route (changing date)
          const assignmentRouteId = Number(
            assignment.raw?.routeId ??
            (assignment.raw?.route && typeof assignment.raw.route === 'object'
              ? (assignment.raw.route as Record<string, unknown>).routeId
              : null) ??
            0
          );
          if (assignmentRouteId > 0 && routeId > 0 && assignmentRouteId !== routeId) {
            setInfoModalData({
              type: 'warning',
              title: 'Cannot Move Assignment',
              message: 'Moving items between different routes is not allowed.',
              details: 'Drag-and-drop is only supported within the same route (to change the date).',
            });
            setShowInfoModal(true);
            return;
          }

          // Get vendor ID from assignment
          const assignmentUserIdForDayOff = assignment.raw?.userId ||
            (assignment.name ? vendors.find(d => d.fullName === assignment.name)?.userId : null);

          // Block movement only if vendor has day off on the TARGET date (where we're moving to)
          if (assignmentUserIdForDayOff) {
            const targetDateNorm = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
            const hasDayOffOnTargetDate = dayOffEntries.some(
              (entry) => entry.userId === assignmentUserIdForDayOff && (entry.date.includes('T') ? entry.date.split('T')[0] : entry.date) === targetDateNorm
            );

            if (hasDayOffOnTargetDate) {
              const vendor = vendors.find(d => d.userId === assignmentUserIdForDayOff);
              const vendorName = vendor?.fullName || assignment.name || 'Unknown Vendor';
              const dayOffDates = dayOffEntries
                .filter((entry) => entry.userId === assignmentUserIdForDayOff)
                .map((entry) => formatDate(new Date(entry.date), 'dd/mm/yyyy'))
                .join(', ');

              setInfoModalData({
                type: 'warning',
                title: 'Cannot Move Assignment',
                message: `Cannot move assignment for vendor "${vendorName}".`,
                details: `This vendor is marked as OFF on the following day(s): ${dayOffDates}. Please remove the day off entry before moving assignments.`
              });
              setShowInfoModal(true);
              return;
            }
          }

          // Find the route to get route name (routeId is optional)
          const targetRoute = routeId && Number.isFinite(routeId) && routeId > 0
            ? routes.find((r) => r.routeId === routeId || r.routeDefaultId === routeId)
            : null;

          // Check if there's already a vendor assigned to the target route on the target day - only one vendor per route per day allowed
          // Note: Validation code removed as it was not being used

          // Allow replace via drag & drop: if target cell already has an assignment,
          // we will replace it in the "targetAssignment" logic below.

          // Check if target cell already has an assignment
          const targetAssignment = allOperations.find(
            (op) => {
              // Same date
              if (op.date !== dateStr) return false;

              // Different assignment
              if (op.weekPlannerId === dragData.assignmentId) return false;

              // Check route match
              if (routeId && Number.isFinite(routeId) && routeId > 0) {
                const opRouteId = op.raw?.routeId || op.raw?.routeDefaultId;
                const opRouteStr = String(op.route || '');
                return (
                  opRouteId === routeId ||
                  Number(opRouteId) === Number(routeId) ||
                  opRouteStr === String(routeId) ||
                  opRouteStr === String(targetRoute?.routeName) ||
                  opRouteStr === String(targetRoute?.routeDefaultName)
                );
              }

              return true;
            }
          );

          // Move the source assignment into the target cell, leaving the target's
          // existing assignment (if any) untouched. Used both when the target cell
          // is empty, and as the "Add to Route" choice for BAOP routes.
          const moveSourceToTarget = () => {
            const updatedAssignment: WeekPlannerRecord = {
              ...assignment,
              date: dateStr,
              route: String(targetRoute?.routeName || targetRoute?.routeDefaultName || (routeId ? String(routeId) : assignment.route || "")),
              raw: {
                ...assignment.raw,
                routeId: routeId && Number.isFinite(routeId) && routeId > 0 ? routeId : assignment.raw?.routeId,
                routeDefaultId: targetRoute?.routeId || targetRoute?.routeDefaultId || assignment.raw?.routeDefaultId,
                date: dateStr,
              },
            };

            setAllOperations((prev) =>
              prev.map((op) =>
                op.weekPlannerId === assignment.weekPlannerId ? updatedAssignment : op
              )
            );
          };

          if (targetAssignment) {
            const targetVendorName = targetAssignment.name || "Unknown Vendor";
            const sourceVendorName = assignment.name || "Unknown Vendor";
            const routeName = targetRoute?.routeName || targetRoute?.routeDefaultName || String(routeId) || "this route";
            const dateLabel = formatDate(new Date(dateStr), "dd/mm/yyyy");

            const replaceTargetWithSource = async () => {
              // Replace logic: replace target assignment with source assignment
              // Remove target assignment and move source to target position
              const updatedSourceAssignment: WeekPlannerRecord = {
                ...assignment,
                date: dateStr,
                route: String(
                  targetRoute?.routeName ||
                  targetRoute?.routeDefaultName ||
                  (routeId ? String(routeId) : assignment.route || "")
                ),
                raw: {
                  ...assignment.raw,
                  routeId: routeId && Number.isFinite(routeId) && routeId > 0 ? routeId : assignment.raw?.routeId,
                  routeDefaultId:
                    targetRoute?.routeId || targetRoute?.routeDefaultId || assignment.raw?.routeDefaultId,
                  date: dateStr,
                },
              };

              // Remove target assignment and update source assignment
              setAllOperations((prev) => {
                // First, check if source assignment still exists (might have been removed)
                const sourceExists = prev.find((op) => op.weekPlannerId === assignment.weekPlannerId);
                if (!sourceExists) {
                  console.warn("Source assignment not found, skipping replacement");
                  return prev;
                }

                // Remove target and update source
                return prev
                  .filter((op) => op.weekPlannerId !== targetAssignment.weekPlannerId) // Remove target assignment
                  .map((op) => (op.weekPlannerId === assignment.weekPlannerId ? updatedSourceAssignment : op));
              });

            };

            if (isBAOPRoute(routeId, targetRoute)) {
              // BAOP allows multiple vendors per route+day: ask whether to replace
              // the existing vendor or keep both.
              setConfirmationData({
                title: "Replace vendor?",
                message: `There is already a vendor assigned to ${routeName} on ${dateLabel}.`,
                details: `Replace "${targetVendorName}" with "${sourceVendorName}", or add "${sourceVendorName}" as an additional item on this route?`,
                confirmText: "Replace",
                secondaryActionText: "Add to Route",
                onSecondaryAction: moveSourceToTarget,
                onConfirm: replaceTargetWithSource,
              });
              setShowConfirmationModal(true);
              return; // Important: return early to prevent further processing
            }

            setConfirmationData({
              title: "Replace vendor?",
              message: `There is already a vendor assigned to ${routeName} on ${dateLabel}.`,
              details: `Replace "${targetVendorName}" with "${sourceVendorName}"?`,
              onConfirm: replaceTargetWithSource,
            });
            setShowConfirmationModal(true);
            return; // Important: return early to prevent further processing
          } else {
            // No assignment in target cell: move the assignment silently (no modal).
            moveSourceToTarget();
          }
        }
        return;
      }

      // Handle moving a draft card (weekPlannerId === 0, identified by draftKey)
      if (dragData.type === 'draft-card' && dragData.draftKey) {
        const draftKey = dragData.draftKey;
        setAllOperations((prev) =>
          prev.map((op) => {
            const raw = op.raw as Record<string, unknown>;
            if (raw.__draftKey !== draftKey) return op;
            return {
              ...op,
              date: dateStr,
              raw: { ...raw, date: dateStr, routeId: routeId || raw.routeId },
            };
          })
        );
        return;
      }

      // Handle dropping a vendor to create new assignment
      if (dragData.userId && dragData.type === 'vendor') {
        const userId = dragData.userId;
        let matchedVendorRecord: VendorRecord | null = vendors?.find(
          (v) => getUserIdFromVendor(v as unknown as VendorRecord) === userId
        ) as unknown as VendorRecord | null;

        // Find the vendor in the vendors list
        let vendor: VendorLookup | undefined = vendors.find((d) => d.userId === userId) as unknown as VendorLookup | undefined;

        // If vendor not found, try to fetch from vendors
        if (!vendor) {
          try {
            const fetchedVendors = await fetchVendorsRaw();
            vendor = fetchedVendors.find(
              (v) => (v.userId === userId || v.userId === userId)
            ) as Record<string, unknown> | undefined;

            if (vendor) {
              matchedVendorRecord = vendor as unknown as VendorRecord;
              const fullName =
                `${String(vendor.name || "")} ${String(vendor.lastName || "")}`.trim()
                || String(vendor.fullName ?? vendor.fullName ?? '').trim();

              vendor = {
                userId: Number(vendor.userId) || 0,
                fullName: fullName || dragData.vendorName || "Unknown Vendor",
                vendorTypeId: Number(vendor.vendorTypeId) || null,
                costModelId: vendor.costModelId ? Number(vendor.costModelId) : null,
                routeId: (() => {
                  const v = vendor as Record<string, unknown>;
                  const rid = v.routeId ?? v.routeId;
                  return rid != null && rid !== "" ? Number(rid) : null;
                })(),
                vehicleId: (() => {
                  const v = vendor as Record<string, unknown>;
                  const vid = v.vehicleId ?? v.vehicleId;
                  return vid != null && vid !== "" ? Number(vid) : null;
                })(),
              } as VendorLookup;
            }
          } catch (err) {
            console.error("Error fetching vendor data:", err);
          }
        }

        if (!vendor) {
          console.error("Vendor not found:", userId);
          // Create a minimal vendor object from dragData
          vendor = {
            userId: userId,
            fullName: dragData.vendorName || "Unknown Vendor",
            vendorTypeId: null,
            costModelId: null,
            routeId: null,
            vehicleId: null,
          } as VendorLookup;
        }

        if (!vendor) {
          return;
        }

        // Validate userId first
        if (!userId || !Number.isFinite(userId) || userId <= 0) {
          console.error("Invalid userId:", userId);
          setInfoModalData({
            type: 'warning',
            title: 'Invalid Vendor',
            message: 'Invalid vendor selected. Please select a valid vendor.',
          });
          setShowInfoModal(true);
          return;
        }

        // Block only if vendor has day off on the TARGET date (not on any other day)
        const targetDateNorm = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        const hasDayOffOnTargetDate = dayOffEntries.some(
          (entry) => entry.userId === userId && (entry.date.includes('T') ? entry.date.split('T')[0] : entry.date) === targetDateNorm
        );

        if (hasDayOffOnTargetDate) {
          const dayOffDates = dayOffEntries
            .filter((entry) => entry.userId === userId)
            .map((entry) => formatDate(new Date(entry.date), 'dd/mm/yyyy'))
            .join(', ');

          setInfoModalData({
            type: 'warning',
            title: 'Cannot Assign Vendor',
            message: `Cannot assign vendor "${vendor.fullName}".`,
            details: `This vendor is marked as OFF on the following day(s): ${dayOffDates}. Please remove the day off entry before assigning.`
          });
          setShowInfoModal(true);
          return;
        }

        // Find the route to get route name (routeId is optional)
        const targetRoute = routeId && Number.isFinite(routeId) && routeId > 0
          ? routes.find((r) => r.routeId === routeId || r.routeDefaultId === routeId)
          : null;

        // Get vehicleId if available (optional)
        const vehicleId = vendor.vehicleId as number | null | undefined;

        const vendorVehiclePlate = getVendorVehiclePlate(matchedVendorRecord);
        const vendorVehicleModel = getVendorVehicleModel(matchedVendorRecord);

        // Check if assignment already exists for this vendor on this date and route
        const existingAssignmentForVendor = allOperations.find(
          (op) =>
            (op.raw?.userId === userId || op.name === vendor.fullName) &&
            op.date === dateStr &&
            (routeId && Number.isFinite(routeId) && routeId > 0
              ? (String(op.route) === String(routeId) ||
                op.raw?.routeId === routeId ||
                op.raw?.routeDefaultId === routeId)
              : true)
        );

        if (existingAssignmentForVendor) {
          // Check if we're dragging to the SAME route (no change needed)
          // RouteId can be stored at top level (raw.routeId) or nested (raw.route.routeId)
          const existingRouteId = Number(
            existingAssignmentForVendor.raw?.routeId ??
            (existingAssignmentForVendor.raw?.route && typeof existingAssignmentForVendor.raw.route === 'object'
              ? (existingAssignmentForVendor.raw.route as Record<string, unknown>).routeId
              : null) ??
            0
          );

          // Compare both numeric IDs and string route names to catch all variations
          const isSameRoute = existingRouteId === routeId || String(existingAssignmentForVendor.route || '').trim() === String(routeId || '').trim();

          if (isSameRoute) {
            // Same vendor on same date and same route - show warning
            setInfoModalData({
              type: 'warning',
              title: 'Vendor Already Assigned',
              message: `"${vendor.fullName}" is already assigned to ${targetRoute?.routeName || String(routeId) || 'this route'} on ${formatDate(new Date(dateStr), 'dd/mm/yyyy')}.`,
              details: 'No changes were made. To modify this assignment, edit it directly from the calendar.'
            });
            setShowInfoModal(true);
            return;
          }

          // Different route - update the assignment
          const updatedAssignment: WeekPlannerRecord = {
            ...existingAssignmentForVendor,
            route: String(targetRoute?.routeName || targetRoute?.routeDefaultName || (routeId ? String(routeId) : existingAssignmentForVendor.route || "")),
            raw: {
              ...existingAssignmentForVendor.raw,
              routeId: routeId && Number.isFinite(routeId) && routeId > 0 ? routeId : existingAssignmentForVendor.raw?.routeId,
              routeDefaultId: targetRoute?.routeId || targetRoute?.routeDefaultId || existingAssignmentForVendor.raw?.routeDefaultId,
            },
          };
          setAllOperations((prev) =>
            prev.map((op) => (isSameWeekPlannerOp(op, existingAssignmentForVendor) ? updatedAssignment : op))
          );

          // Show confirmation that the route was changed
          const previousRoute = existingAssignmentForVendor.route || 'previous route';
          setInfoModalData({
            type: 'success',
            title: 'Route Updated',
            message: `"${vendor.fullName}" route changed from "${previousRoute}" to "${targetRoute?.routeName || String(routeId) || 'new route'}" on ${formatDate(new Date(dateStr), 'dd/mm/yyyy')}.`
          });
          setShowInfoModal(true);
          return;
        }

        // Creates a brand-new assignment for `vendor` at routeId/dateStr, leaving any
        // other vendor already in that cell untouched. This is the natural path when
        // the cell is empty, and also the "Add to Route" choice for BAOP routes.
        const createNewVendorAssignment = () => {
          // Validate required fields before creating assignment
          if (!routeId || !Number.isFinite(routeId) || routeId <= 0) {
            console.error('[handleDrop] Missing required routeId for new assignment:', {
              routeId,
              targetRoute,
              vendor: vendor.fullName,
            });
            setInfoModalData({
              type: 'warning',
              title: 'Cannot Create Assignment',
              message: 'Cannot create assignment: route is required.',
              details: 'Please drop the vendor on a valid route.',
            });
            setShowInfoModal(true);
            return;
          }

          // Get routeId - use the routeId from the drop target
          const finalRouteId = Number(routeId);

          // Get vehicleId - from vendor object
          const finalVehicleId = vehicleId && Number.isFinite(vehicleId) && vehicleId > 0 ? Number(vehicleId) : undefined;

          // Special handling for BRTE route (routeId 55) - ADHOC Services
          // For BRTE route, we need to get depositId and depositName from the deposit section where the item was created
          // NOT from the route (which belongs to BAOP), but from the target deposit (LCY, LSE, MSE, etc.)
          let depositIdForAssignment: number | undefined = undefined;
          let depositNameForAssignment: string | undefined = undefined;

          if (finalRouteId === ADHOC_DEFAULT_ROUTE_ID || finalRouteId === ADHOC_WEEK_PLANNER_ROUTE_ID) {
            // Try multiple approaches to get depositId and depositName for ADHOC placeholder rows (BRTE 55 / DHOC 57)
            // Priority: 1) From dragData (passed from DayCell), 2) From DOM attributes, 3) From deposits data

            // Approach 1: Check if depositId and depositName were passed in the dragData (from DayCell)
            if (dragData && typeof dragData === 'object') {
              if ('depositId' in dragData) {
                const depositIdFromData = dragData.depositId as number | undefined;
                if (depositIdFromData && Number.isFinite(depositIdFromData) && depositIdFromData > 0) {
                  depositIdForAssignment = depositIdFromData;
                }
              }
              if ('depositName' in dragData) {
                const depositNameFromData = dragData.depositName as string | undefined;
                if (depositNameFromData && depositNameFromData.trim()) {
                  depositNameForAssignment = depositNameFromData;
                }
              }
            }

            // Approach 2: Try to get from DOM attributes (ADHOC Services section container or DayCell)
            if (!depositIdForAssignment) {
              try {
                // Start from currentTarget (the DayCell element that has the onDrop handler)
                const dayCellElement = e.currentTarget as HTMLElement;
                let adhocSectionContainer: HTMLElement | null = null;

                // First, check if the DayCell itself has the attribute
                if (dayCellElement && dayCellElement.hasAttribute('data-deposit-id')) {
                  adhocSectionContainer = dayCellElement;
                } else {
                  // Try to find in parent elements (the ADHOC Services section container)
                  adhocSectionContainer = dayCellElement?.closest('[data-deposit-id]') as HTMLElement | null;
                }

                // Also try from e.target as fallback
                if (!adhocSectionContainer && e.target) {
                  const targetEl = e.target as HTMLElement;
                  if (targetEl.hasAttribute('data-deposit-id')) {
                    adhocSectionContainer = targetEl;
                  } else {
                    const targetParent = targetEl.closest('[data-deposit-id]') as HTMLElement | null;
                    if (targetParent) {
                      adhocSectionContainer = targetParent;
                    }
                  }
                }

                if (adhocSectionContainer) {
                  const depositIdAttr = adhocSectionContainer.getAttribute('data-deposit-id');
                  const depositNameAttr = adhocSectionContainer.getAttribute('data-deposit-name');

                  if (depositIdAttr) {
                    const parsedDepositId = Number(depositIdAttr);
                    if (Number.isFinite(parsedDepositId) && parsedDepositId > 0) {
                      depositIdForAssignment = parsedDepositId;
                    }
                  }

                  if (depositNameAttr) {
                    depositNameForAssignment = depositNameAttr;
                  }
                }
              } catch (err) {
                console.warn('[handleDrop] Error reading deposit info from DOM:', err);
              }
            }

            // Approach 3: If we have depositId but not depositName, try to get from deposits data
            if (depositIdForAssignment && !depositNameForAssignment && plannerData?.depositsWithRoutes) {
              const deposit = plannerData.depositsWithRoutes.find(d => d.depositId === depositIdForAssignment);
              if (deposit?.depositName) {
                depositNameForAssignment = deposit.depositName;
              }
            }

            // IMPORTANT: For routeId 55 (BRTE), NEVER use targetRoute.depositId as fallback
            // because route BRTE belongs to BAOP (depositId 7), but items created in ADHOC Services
            // sections should use the deposit of the section (LCY, LSE, MSE, etc.)

            // If we still don't have depositId for routeId 55, log a warning
            if (!depositIdForAssignment) {
              console.warn(`[handleDrop] ✗ WARNING: Could not determine depositId for routeId 55 (BRTE). Item may be created with incorrect deposit.`, {
                dragData,
                hasDataDepositId: dragData && typeof dragData === 'object' && 'depositId' in dragData,
              });
            }
          }

          // Create new WeekPlannerRecord in memory
          const newAssignment: WeekPlannerRecord = {
            weekPlannerId: 0, // Will be assigned by backend
            date: dateStr,
            route: String(targetRoute?.routeName || targetRoute?.routeId || finalRouteId || ""),
            name: vendor.fullName || "",
            routeSort: "yes", // default: sort
            adhocSort: "false",
            notes: "",
            reason: "",
            vehicle: vendorVehicleModel,
            registrationPlate: vendorVehiclePlate,
            status: BUSINESS_RULES.WORKING_STATUS.WORKING,
            isDayOff: "false",
            isSort: "true",
            raw: {
              date: dateStr,
              userId: userId,
              routeId: finalRouteId,
              vehicleId: finalVehicleId ?? null,
              isSort: true,
              isDayOff: false,
              status: BUSINESS_RULES.WORKING_STATUS.WORKING,
              vehicleregistrationPlate: vendorVehiclePlate || undefined,
              vehicle: {
                vehicleId: finalVehicleId,
                vehicleModel: vendorVehicleModel || undefined,
                vehicleregistrationPlate: vendorVehiclePlate || undefined,
              },
              route: {
                routeId: finalRouteId,
                routeName: String(targetRoute?.routeName || ""),
                ...(depositIdForAssignment ? { depositId: depositIdForAssignment } : {}),
                ...(depositNameForAssignment ? { depositName: depositNameForAssignment } : {}),
              },
              // For BRTE route (ADHOC Services), include depositId and adhocServiceId if available
              ...((finalRouteId === ADHOC_DEFAULT_ROUTE_ID || finalRouteId === ADHOC_WEEK_PLANNER_ROUTE_ID) && depositIdForAssignment ? { depositId: depositIdForAssignment } : {}),
              ...((finalRouteId === ADHOC_DEFAULT_ROUTE_ID || finalRouteId === ADHOC_WEEK_PLANNER_ROUTE_ID) && depositNameForAssignment ? { depositName: depositNameForAssignment } : {}),
              ...(finalRouteId === ADHOC_DEFAULT_ROUTE_ID || finalRouteId === ADHOC_WEEK_PLANNER_ROUTE_ID
                ? (() => {
                  const aid = dragData && typeof dragData === 'object' && 'adhocServiceId' in dragData
                    ? Number((dragData as { adhocServiceId?: number }).adhocServiceId)
                    : NaN;
                  return Number.isFinite(aid) && aid > 0 ? { adhocServiceId: aid } : {};
                })()
                : {}),
              // Draft tracking: used to clean up if user closes modal without confirming
              __draftKey: `drag-${dateStr}-${userId}-${finalRouteId}-${Date.now()}`,
              __is_drag_draft: true,
            },
          };

          // Check if assignment already exists before adding
          const duplicateCheck = allOperations.find(
            (op) =>
              op.date === dateStr &&
              (op.raw?.userId === userId || op.name === vendor.fullName) &&
              (routeId && Number.isFinite(routeId) && routeId > 0
                ? (op.raw?.routeId === routeId || op.raw?.routeDefaultId === routeId)
                : true)
          );

          if (!duplicateCheck) {
            // Add to state (in memory) with duplicate check
            setAllOperations((prev) => {
              // Final check for duplicates in current state
              const hasDuplicate = prev.some(
                (op) =>
                  op.date === dateStr &&
                  (op.raw?.userId === userId || op.name === vendor.fullName) &&
                  (routeId && Number.isFinite(routeId) && routeId > 0
                    ? (op.raw?.routeId === routeId || op.raw?.routeDefaultId === routeId)
                    : true)
              );

              if (hasDuplicate) {
                console.warn("Duplicate assignment detected in state, skipping creation");
                return prev;
              }

              return [...prev, newAssignment];
            });


            // Open edit modal after creating assignment (only for new assignments)
            setEditingAssignment(newAssignment);
            setShowEditAssignmentModal(true);
          }
        };

        // Check if there's already a DIFFERENT vendor in the target cell BEFORE checking notAllocated
        // This prevents losing the replacement modal when notAllocated exists
        const isBAOPRouteForEarlyCheck = isBAOPRoute(routeId, targetRoute);
        const existingDifferentVendorInCell = allOperations.find(
          (op) => {
            if (op.date !== dateStr) return false;
            const opVendorId = op.raw?.userId || Number(op.name) || 0;
            if (opVendorId === userId || op.name === vendor.fullName) return false;
            if (isExplicitlyUnallocatedOrDayOff(op)) return false;
            if (routeId && Number.isFinite(routeId) && routeId > 0) {
              const opRouteId = op.raw?.routeId || op.raw?.routeDefaultId;
              const opRouteStr = String(op.route || '');
              return (
                opRouteId === routeId ||
                Number(opRouteId) === Number(routeId) ||
                opRouteStr === String(routeId) ||
                opRouteStr === String(targetRoute?.routeName) ||
                opRouteStr === String(targetRoute?.routeDefaultName)
              );
            }
            return true;
          }
        );

        if (existingDifferentVendorInCell) {
          // Found a different vendor in the cell - show replacement modal
          const targetVendorName = existingDifferentVendorInCell.name || "Unknown Vendor";
          const newVendorName = vendor.fullName || "Unknown Vendor";
          const routeName = targetRoute?.routeName || targetRoute?.routeDefaultName || String(routeId) || "this route";
          const dateLabel = formatDate(new Date(dateStr), "dd/mm/yyyy");


          // Create the new assignment OUTSIDE of setAllOperations so we can reference it later
          const replacementAssignment: WeekPlannerRecord = {
            ...existingDifferentVendorInCell,
            name: vendor.fullName || "",
            vehicle: vendorVehicleModel || existingDifferentVendorInCell.vehicle || "",
            registrationPlate: vendorVehiclePlate || existingDifferentVendorInCell.registrationPlate || "",
            route: String(
              targetRoute?.routeName ||
              targetRoute?.routeDefaultName ||
              (routeId ? String(routeId) : existingDifferentVendorInCell.route || "")
            ),
            raw: {
              ...existingDifferentVendorInCell.raw,
              userId: userId,
              vendor: { userId: userId, fullName: vendor.fullName },
              routeId: routeId && Number.isFinite(routeId) && routeId > 0 ? routeId : existingDifferentVendorInCell.raw?.routeId,
              vehicleId: vehicleId && Number.isFinite(vehicleId) && vehicleId > 0 ? vehicleId : existingDifferentVendorInCell.raw?.vehicleId,
              date: dateStr,
              __locallyModified: true,
            },
          };

          const replaceWithNewVendor = async () => {
            setAllOperations((prev) => {
              const filtered = prev.filter((op) => {
                if (isSameWeekPlannerOp(op, existingDifferentVendorInCell)) return false;
                if (op.date === dateStr && (op.raw?.userId === userId || op.name === vendor.fullName)) {
                  if (routeId && Number.isFinite(routeId) && routeId > 0) {
                    if (op.raw?.routeId === routeId || op.raw?.routeDefaultId === routeId) return false;
                  }
                }
                return true;
              });
              return [...filtered, replacementAssignment];
            });

            setShowConfirmationModal(false);

            // Open edit modal to confirm vendor data
            setTimeout(() => {
              setEditingAssignment(replacementAssignment);
              setShowEditAssignmentModal(true);
            }, 150);
          };

          if (isBAOPRouteForEarlyCheck) {
            // BAOP allows multiple vendors per route+day: ask whether to replace
            // the existing vendor or keep both.
            setConfirmationData({
              title: "Replace vendor?",
              message: `There is already a vendor assigned to ${routeName} on ${dateLabel}.`,
              details: `Replace "${targetVendorName}" with "${newVendorName}", or add "${newVendorName}" as an additional item on this route?`,
              confirmText: "Replace",
              secondaryActionText: "Add to Route",
              onSecondaryAction: createNewVendorAssignment,
              onConfirm: replaceWithNewVendor,
            });
            setShowConfirmationModal(true);
            return;
          }

          setConfirmationData({
            title: "Replace vendor?",
            message: `There is already a vendor assigned to ${routeName} on ${dateLabel}.`,
            details: `Replace "${targetVendorName}" with "${newVendorName}"?`,
            onConfirm: replaceWithNewVendor,
          });
          setShowConfirmationModal(true);
          return;
        }

        // Bug 0: quando o vendor está OFF/NotAllocated, o drop NÃO deve reaproveitar
        // (PATCH) o registro NotAllocated existente. Um novo assignment é uma criação
        // (POST via createNewVendorAssignment / bulk POST). Por isso não interceptamos
        // mais aqui o registro NotAllocated — o fluxo segue para a criação de um novo item.

        // Allow replace via drag & drop: if the cell already has a different vendor,
        // we will replace it in the "existingAssignmentInCell" logic below.

        // Check if there's already an assignment in the target cell (different vendor)
        // If so, replace it with the new vendor (BAOP routes ask instead of auto-replacing)
        const isBAOPRouteForSelect = isBAOPRoute(routeId, targetRoute);
        const existingAssignmentInCell = allOperations.find(
          (op) => {
            // Same date
            if (op.date !== dateStr) return false;

            // Different vendor
            const opVendorId = op.raw?.userId || Number(op.name) || 0;
            if (opVendorId === userId || op.name === vendor.fullName) return false;
            // Bug 3: não tratar NotAllocated/DayOff como alvo de substituição — novo item deve gerar POST, não PATCH.
            if (isExplicitlyUnallocatedOrDayOff(op)) return false;

            // Check route match
            if (routeId && Number.isFinite(routeId) && routeId > 0) {
              const opRouteId = op.raw?.routeId || op.raw?.routeDefaultId;
              const opRouteStr = String(op.route || '');
              return (
                opRouteId === routeId ||
                Number(opRouteId) === Number(routeId) ||
                opRouteStr === String(routeId) ||
                opRouteStr === String(targetRoute?.routeName) ||
                opRouteStr === String(targetRoute?.routeDefaultName)
              );
            }

            return true;
          }
        );

        if (existingAssignmentInCell) {
          // Check if we're not already processing this replacement
          const isAlreadyReplaced = allOperations.find(
            (op) =>
              isSameWeekPlannerOp(op, existingAssignmentInCell) &&
              (op.raw?.userId === userId || op.name === vendor.fullName)
          );

          if (isAlreadyReplaced) {
            return;
          }

          const targetVendorName = existingAssignmentInCell.name || "Unknown Vendor";
          const newVendorName = vendor.fullName || "Unknown Vendor";
          const routeName = targetRoute?.routeName || targetRoute?.routeDefaultName || String(routeId) || "this route";
          const dateLabel = formatDate(new Date(dateStr), "dd/mm/yyyy");


          const replaceExistingInCell = async () => {
            setAllOperations((prev) => {
              // Step 1: Remove the assignment from the target cell (old vendor)
              // Step 2: Remove any other assignment of the new vendor on the same date/route
              // Step 3: Replace with the new vendor data

              const oldAssignmentId = existingAssignmentInCell.weekPlannerId;

              // Filter out: the old assignment AND any existing assignment of the new vendor on same date/route
              const filtered = prev.filter((op) => {
                // Remove the old assignment that's being replaced
                if (isSameWeekPlannerOp(op, existingAssignmentInCell)) {
                  return false;
                }

                // Remove any existing assignment of the new vendor on this date/route
                if (op.date === dateStr && (op.raw?.userId === userId || op.name === vendor.fullName)) {
                  if (routeId && Number.isFinite(routeId) && routeId > 0) {
                    if (op.raw?.routeId === routeId || op.raw?.routeDefaultId === routeId) {
                      return false;
                    }
                  }
                }

                return true;
              });

              // Now add a new assignment with the new vendor data, keeping same weekPlannerId
              const newAssignment: WeekPlannerRecord = {
                ...existingAssignmentInCell,
                weekPlannerId: oldAssignmentId,
                name: vendor.fullName || "",
                vehicle: vendorVehicleModel || existingAssignmentInCell.vehicle || "",
                registrationPlate: vendorVehiclePlate || existingAssignmentInCell.registrationPlate || "",
                route: String(
                  targetRoute?.routeName ||
                  targetRoute?.routeDefaultName ||
                  (routeId ? String(routeId) : existingAssignmentInCell.route || "")
                ),
                raw: {
                  ...existingAssignmentInCell.raw,
                  userId: userId,
                  vendor: {
                    userId: userId,
                    fullName: vendor.fullName,
                  },
                  routeId: routeId && Number.isFinite(routeId) && routeId > 0 ? routeId : existingAssignmentInCell.raw?.routeId,
                  vehicleId:
                    vehicleId && Number.isFinite(vehicleId) && vehicleId > 0 ? vehicleId : existingAssignmentInCell.raw?.vehicleId,
                  vehicleregistrationPlate:
                    vendorVehiclePlate || existingAssignmentInCell.raw?.vehicleregistrationPlate,
                  vehicle: {
                    vehicleId: vehicleId && Number.isFinite(vehicleId) && vehicleId > 0
                      ? vehicleId
                      : existingAssignmentInCell.raw?.vehicleId,
                    vehicleModel: vendorVehicleModel || String(
                      (existingAssignmentInCell.raw?.vehicle && typeof existingAssignmentInCell.raw.vehicle === 'object'
                        ? (existingAssignmentInCell.raw.vehicle as Record<string, unknown>).vehicleModel
                        : '') || ''
                    ),
                    vehicleregistrationPlate: vendorVehiclePlate || String(
                      (existingAssignmentInCell.raw?.vehicle && typeof existingAssignmentInCell.raw.vehicle === 'object'
                        ? (existingAssignmentInCell.raw.vehicle as Record<string, unknown>).vehicleregistrationPlate
                        : '') || ''
                    ),
                  },
                  date: dateStr,
                  __locallyModified: true,
                },
              };

              return [...filtered, newAssignment];
            });


            // Close confirmation modal first
            setShowConfirmationModal(false);

            // Open edit modal after replacing vendor
            setEditingAssignment({
              ...existingAssignmentInCell,
              name: vendor.fullName || "",
              raw: {
                ...existingAssignmentInCell.raw,
                userId: userId,
              }
            });
            setShowEditAssignmentModal(true);
          };

          if (isBAOPRouteForSelect) {
            // BAOP allows multiple vendors per route+day: ask whether to replace
            // the existing vendor or keep both.
            setConfirmationData({
              title: "Replace vendor?",
              message: `There is already a vendor assigned to ${routeName} on ${dateLabel}.`,
              details: `Replace "${targetVendorName}" with "${newVendorName}", or add "${newVendorName}" as an additional item on this route?`,
              confirmText: "Replace",
              secondaryActionText: "Add to Route",
              onSecondaryAction: createNewVendorAssignment,
              onConfirm: replaceExistingInCell,
            });
            setShowConfirmationModal(true);
            return;
          }

          setConfirmationData({
            title: "Replace vendor?",
            message: `There is already a vendor assigned to ${routeName} on ${dateLabel}.`,
            details: `Replace "${targetVendorName}" with "${newVendorName}"?`,
            onConfirm: replaceExistingInCell,
          });
          setShowConfirmationModal(true);
          return;
        }

        createNewVendorAssignment();
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    } finally {
      // Reset processing flag after a short delay to allow state updates
      setTimeout(() => {
        isProcessingDrop.current = false;
        lastDropId.current = '';
      }, 300);
    }
  };

  const handleAssignVendor = async (
    userId: number,
    routeId: number,
    date: string,
    overrides?: {
      vehicleId?: number;
      routeSort?: "yes" | "no";
      notes?: string;
    }
  ) => {
    if (!isEditableDate(date)) {
      showDateReadonlyMessage(date);
      return;
    }

    try {
      let matchedVendorRecord: VendorRecord | null = vendors?.find(
        (v) => getUserIdFromVendor(v as unknown as VendorRecord) === userId
      ) as unknown as VendorRecord | null;

      // Find the vendor in the vendors list (can be by userId or userId)
      let vendor: VendorLookup | undefined = vendors.find((d) => d.userId === userId) as unknown as VendorLookup | undefined;

      // If vendor not found, try to fetch from vendors
      if (!vendor) {
        try {
          const fetchedVendors = await fetchVendorsRaw();
          vendor = fetchedVendors.find(
            (v) => (v.userId === userId)
          ) as Record<string, unknown> | undefined;

          if (vendor) {
            matchedVendorRecord = vendor as unknown as VendorRecord;
            const fullName = `${String(vendor.name || "")} ${String(vendor.lastName || "")}`.trim();

            vendor = {
              userId: Number(vendor.userId) || 0,
              fullName: fullName || "Unknown Vendor",
              vendorTypeId: Number(vendor.vendorTypeId) || null,
              costModelId: vendor.costModelId ? Number(vendor.costModelId) : null,
              routeId: (() => {
                const v = vendor as Record<string, unknown>;
                const rid = v.routeId ?? v.routeId;
                return rid != null && rid !== "" ? Number(rid) : null;
              })(),
              vehicleId: (() => {
                const v = vendor as Record<string, unknown>;
                const vid = v.vehicleId ?? v.vehicleId;
                return vid != null && vid !== "" ? Number(vid) : null;
              })(),
            } as VendorLookup;
          }
        } catch (err) {
          console.error("Error fetching vendor data:", err);
        }
      }

      if (!vendor) {
        console.error("Vendor not found:", userId);
        setInfoModalData({
          type: 'error',
          title: 'Vendor Not Found',
          message: `Could not find vendor with ID ${userId}. Please try again.`,
        });
        setShowInfoModal(true);
        return;
      }

      // Validate userId (use only userId for week_planner API, not userId)
      const actualVendorId = (vendor.userId as number | undefined) || userId;
      if (!actualVendorId || !Number.isFinite(actualVendorId) || actualVendorId <= 0) {
        console.error("Invalid userId:", actualVendorId);
        setInfoModalData({
          type: 'warning',
          title: 'Invalid Vendor',
          message: 'Invalid vendor selected. Please select a valid vendor.',
        });
        setShowInfoModal(true);
        return;
      }

      // Block only if vendor has day off on the assignment date (not on any other day)
      const assignmentDateNorm = date.includes('T') ? date.split('T')[0] : date;
      const hasDayOffOnAssignmentDate = dayOffEntries.some(
        (entry) => entry.userId === actualVendorId && (entry.date.includes('T') ? entry.date.split('T')[0] : entry.date) === assignmentDateNorm
      );

      if (hasDayOffOnAssignmentDate) {
        const dayOffDates = dayOffEntries
          .filter((entry) => entry.userId === actualVendorId)
          .map((entry) => formatDate(new Date(entry.date), 'dd/mm/yyyy'))
          .join(', ');

        setInfoModalData({
          type: 'warning',
          title: 'Cannot Assign Vendor',
          message: `Cannot assign vendor "${vendor.fullName}".`,
          details: `This vendor is marked as OFF on the following day(s): ${dayOffDates}. Please remove the day off entry before assigning.`
        });
        setShowInfoModal(true);
        return;
      }

      // Find the route to get route name
      const targetRoute = routeId && Number.isFinite(routeId) && routeId > 0
        ? routes.find((r) => r.routeId === routeId || r.routeDefaultId === routeId)
        : null;

      // Allow explicit values from modal, fallback to vendor defaults.
      const vehicleId = overrides?.vehicleId && Number.isFinite(Number(overrides.vehicleId)) && Number(overrides.vehicleId) > 0
        ? Number(overrides.vehicleId)
        : (vendor.vehicleId as number | null | undefined);
      const routeSortValue = overrides?.routeSort === "no" ? "no" : "yes";
      const notesValue = overrides?.notes?.trim() || "";
      const vendorVehiclePlate = getVendorVehiclePlate(matchedVendorRecord);
      const vendorVehicleModel = getVendorVehicleModel(matchedVendorRecord);

      // Check if assignment already exists for this vendor on this date and route
      const existingAssignmentForVendor = allOperations.find(
        (op) =>
          (op.raw?.userId === actualVendorId || op.name === vendor.fullName) &&
          op.date === date &&
          (routeId && Number.isFinite(routeId) && routeId > 0
            ? (String(op.route) === String(routeId) ||
              op.raw?.routeId === routeId ||
              op.raw?.routeDefaultId === routeId)
            : true)
      );

      if (existingAssignmentForVendor) {
        // Update existing assignment to new route (if route changed)
        const updatedAssignment: WeekPlannerRecord = {
          ...existingAssignmentForVendor,
          route: String(targetRoute?.routeName || targetRoute?.routeDefaultName || (routeId ? String(routeId) : existingAssignmentForVendor.route || "")),
          routeSort: routeSortValue,
          notes: notesValue || existingAssignmentForVendor.notes || "",
          raw: {
            ...existingAssignmentForVendor.raw,
            routeId: routeId && Number.isFinite(routeId) && routeId > 0 ? routeId : existingAssignmentForVendor.raw?.routeId,
            routeDefaultId: targetRoute?.routeId || targetRoute?.routeDefaultId || existingAssignmentForVendor.raw?.routeDefaultId,
            vehicleId: vehicleId && Number.isFinite(vehicleId) && vehicleId > 0 ? vehicleId : existingAssignmentForVendor.raw?.vehicleId,
            isSort: routeSortValue === "yes",
            notes: notesValue || existingAssignmentForVendor.raw?.notes || "",
          },
        };
        setAllOperations((prev) =>
          prev.map((op) => (isSameWeekPlannerOp(op, existingAssignmentForVendor) ? updatedAssignment : op))
        );
        return;
      }

      // Creates a brand-new assignment for `vendor` at routeId/date, leaving any
      // other vendor already in that cell untouched. This is the natural path when
      // the cell is empty, and also the "Add to Route" choice for BAOP routes.
      const createNewAssignmentForVendor = () => {
        const newAssignment: WeekPlannerRecord = {
          weekPlannerId: 0, // Will be assigned by backend when saved
          date: date,
          route: String(targetRoute?.routeName || targetRoute?.routeDefaultName || (routeId ? String(routeId) : "")),
          name: vendor.fullName || "",
          routeSort: routeSortValue,
          adhocSort: "false",
          notes: notesValue,
          reason: "",
          vehicle: vendorVehicleModel,
          registrationPlate: vendorVehiclePlate,
          status: BUSINESS_RULES.WORKING_STATUS.WORKING,
          isDayOff: "false",
          isSort: routeSortValue === "yes" ? "true" : "false",
          raw: {
            date: date,
            userId: actualVendorId,
            routeId: routeId && Number.isFinite(routeId) && routeId > 0 ? Number(routeId) : null,
            vehicleId: vehicleId && Number.isFinite(vehicleId) && vehicleId > 0 ? Number(vehicleId) : null,
            isSort: routeSortValue === "yes",
            notes: notesValue || undefined,
            vehicleregistrationPlate: vendorVehiclePlate || undefined,
            vehicle: {
              vehicleId: vehicleId && Number.isFinite(vehicleId) && vehicleId > 0 ? Number(vehicleId) : undefined,
              vehicleModel: vendorVehicleModel || undefined,
              vehicleregistrationPlate: vendorVehiclePlate || undefined,
            },
            route: {
              routeId: routeId && Number.isFinite(routeId) && routeId > 0 ? Number(routeId) : null,
              routeName: String(targetRoute?.routeName || targetRoute?.routeDefaultName || ""),
            },
            status: BUSINESS_RULES.WORKING_STATUS.WORKING,
            isDayOff: false,
          },
        };

        // Check if assignment already exists before adding
        const duplicateCheck = allOperations.find(
          (op) =>
            op.date === date &&
            (op.raw?.userId === actualVendorId || op.name === vendor.fullName) &&
            (routeId && Number.isFinite(routeId) && routeId > 0
              ? (op.raw?.routeId === routeId || op.raw?.routeDefaultId === routeId)
              : true)
        );

        if (!duplicateCheck) {
          // Add to state with duplicate check
          setAllOperations((prev) => {
            const hasDuplicate = prev.some(
              (op) =>
                op.date === date &&
                (op.raw?.userId === actualVendorId || op.name === vendor.fullName) &&
                (routeId && Number.isFinite(routeId) && routeId > 0
                  ? (op.raw?.routeId === routeId || op.raw?.routeDefaultId === routeId)
                  : true)
            );

            if (hasDuplicate) {
              console.warn("Duplicate assignment detected in state, skipping creation");
              return prev;
            }

            return [...prev, newAssignment];
          });


          // Open edit modal after creating assignment
          setEditingAssignment(newAssignment);
          setShowEditAssignmentModal(true);
        }
      };

      // Allow replace via drag & drop: if the cell already has a different vendor,
      // we will replace it in the "existingAssignmentInCell" logic below.
      // BAOP routes ask whether to replace or add instead of auto-replacing.

      const isBAOPRouteForAssign = isBAOPRoute(routeId, targetRoute);
      const existingAssignmentInCell = allOperations.find(
        (op) => {
          // Same date
          if (op.date !== date) return false;

          // Different vendor
          const opVendorId = op.raw?.userId || Number(op.name) || 0;
          if (opVendorId === actualVendorId || op.name === vendor.fullName) return false;
          // Bug 3: não tratar NotAllocated/DayOff como alvo de substituição — novo item deve gerar POST, não PATCH.
          if (isExplicitlyUnallocatedOrDayOff(op)) return false;

          // Check route match
          if (routeId && Number.isFinite(routeId) && routeId > 0) {
            const opRouteId = op.raw?.routeId || op.raw?.routeDefaultId;
            const opRouteStr = String(op.route || '');
            return (
              opRouteId === routeId ||
              Number(opRouteId) === Number(routeId) ||
              opRouteStr === String(routeId) ||
              opRouteStr === String(targetRoute?.routeName) ||
              opRouteStr === String(targetRoute?.routeDefaultName)
            );
          }

          return true;
        }
      );

      if (existingAssignmentInCell) {
        // Replace the existing vendor with the new one
        const replacedAssignment: WeekPlannerRecord = {
          ...existingAssignmentInCell,
          name: vendor.fullName || "",
          vehicle: vendorVehicleModel || existingAssignmentInCell.vehicle || "",
          registrationPlate: vendorVehiclePlate || existingAssignmentInCell.registrationPlate || "",
          route: String(targetRoute?.routeName || targetRoute?.routeDefaultName || (routeId ? String(routeId) : existingAssignmentInCell.route || "")),
          routeSort: routeSortValue,
          isSort: routeSortValue === "yes" ? "true" : "false",
          notes: notesValue || existingAssignmentInCell.notes || "",
          raw: {
            ...existingAssignmentInCell.raw,
            userId: actualVendorId,
            vendor: {
              userId: actualVendorId,
              fullName: vendor.fullName,
            },
            routeId: routeId && Number.isFinite(routeId) && routeId > 0 ? routeId : existingAssignmentInCell.raw?.routeId,
            vehicleId: vehicleId && Number.isFinite(vehicleId) && vehicleId > 0 ? vehicleId : existingAssignmentInCell.raw?.vehicleId,
            isSort: routeSortValue === "yes",
            notes: notesValue || existingAssignmentInCell.raw?.notes || "",
            vehicleregistrationPlate:
              vendorVehiclePlate ||
              existingAssignmentInCell.raw?.vehicleregistrationPlate,
            vehicle: {
              vehicleId: vehicleId && Number.isFinite(vehicleId) && vehicleId > 0
                ? vehicleId
                : existingAssignmentInCell.raw?.vehicleId,
              vehicleModel: vendorVehicleModel || String(
                (existingAssignmentInCell.raw?.vehicle && typeof existingAssignmentInCell.raw.vehicle === 'object'
                  ? (existingAssignmentInCell.raw.vehicle as Record<string, unknown>).vehicleModel
                  : '') || ''
              ),
              vehicleregistrationPlate: vendorVehiclePlate || String(
                (existingAssignmentInCell.raw?.vehicle && typeof existingAssignmentInCell.raw.vehicle === 'object'
                  ? (existingAssignmentInCell.raw.vehicle as Record<string, unknown>).vehicleregistrationPlate
                  : '') || ''
              ),
            },
            date: date,
          },
        };

        const replaceVendorInCell = () => {
          setAllOperations((prev) => {
            const hasDuplicate = prev.some(
              (op) =>
                !isSameWeekPlannerOp(op, existingAssignmentInCell) &&
                op.date === date &&
                (op.raw?.userId === actualVendorId || op.name === vendor.fullName) &&
                (routeId && Number.isFinite(routeId) && routeId > 0
                  ? (op.raw?.routeId === routeId || op.raw?.routeDefaultId === routeId)
                  : true)
            );

            if (hasDuplicate) {
              console.warn("Duplicate assignment detected, skipping update");
              return prev;
            }

            return prev.map((op) => (isSameWeekPlannerOp(op, existingAssignmentInCell) ? replacedAssignment : op));
          });

          // Open edit modal after replacing vendor
          setEditingAssignment(replacedAssignment);
          setShowEditAssignmentModal(true);
        };

        if (isBAOPRouteForAssign) {
          // BAOP allows multiple vendors per route+day: ask whether to replace
          // the existing vendor or keep both.
          const targetVendorName = existingAssignmentInCell.name || "Unknown Vendor";
          const newVendorName = vendor.fullName || "Unknown Vendor";
          const routeName = targetRoute?.routeName || targetRoute?.routeDefaultName || String(routeId) || "this route";
          const dateLabel = formatDate(new Date(date), "dd/mm/yyyy");

          setConfirmationData({
            title: "Replace vendor?",
            message: `There is already a vendor assigned to ${routeName} on ${dateLabel}.`,
            details: `Replace "${targetVendorName}" with "${newVendorName}", or add "${newVendorName}" as an additional item on this route?`,
            confirmText: "Replace",
            secondaryActionText: "Add to Route",
            onSecondaryAction: createNewAssignmentForVendor,
            onConfirm: replaceVendorInCell,
          });
          setShowConfirmationModal(true);
          return;
        }

        replaceVendorInCell();
        return;
      }

      createNewAssignmentForVendor();
    } catch (error) {
      console.error("Error assigning vendor:", error);
      setInfoModalData({
        type: 'error',
        title: 'Error Assigning Vendor',
        message: error instanceof Error ? error.message : 'An error occurred while assigning the vendor.',
      });
      setShowInfoModal(true);
    }
  };

  const handleOpenDraftAssignmentForRoute = useCallback((
    routeId: number,
    date: string,
    depositId?: number,
    depositName?: string,
    routeName?: string,
    editData?: { userId?: number; vehicleId?: number; routeSort?: string; notes?: string; registrationPlate?: string; dates?: string[] },
  ) => {
    if (isSupervisorReadonly) {
      showSupervisorReadonlyMessage();
      return;
    }

    if (!routeId || !Number.isFinite(routeId) || routeId <= 0 || !date) {
      return;
    }

    if (!isEditableDate(date)) {
      showDateReadonlyMessage(date);
      return;
    }

    const targetRoute = routes.find(
      (r) => Number(r.routeId) === Number(routeId) || Number((r as RouteWithDefault).routeDefaultId || 0) === Number(routeId)
    );
    const resolvedRouteName = String(routeName || targetRoute?.routeName || targetRoute?.routeDefaultName || `Route ${routeId}`);
    const draftKey = `flex-draft-${routeId}-${date}-${Date.now()}`;

    const draftAssignment: WeekPlannerRecord = {
      weekPlannerId: 0,
      date,
      route: resolvedRouteName,
      name: "",
      routeSort: editData?.routeSort || "yes",
      adhocSort: "false",
      notes: editData?.notes || "",
      reason: "",
      vehicle: "",
      registrationPlate: "",
      status: BUSINESS_RULES.WORKING_STATUS.WORKING,
      isDayOff: "false",
      isSort: editData?.routeSort === 'no' ? 'false' : "true",
      raw: {
        date,
        routeId: Number(routeId),
        route: {
          routeId: Number(routeId),
          routeName: resolvedRouteName,
          ...(depositId != null ? { depositId: depositId } : {}),
          ...(depositName != null ? { depositName: depositName } : {}),
        },
        depositId: depositId,
        depositName: depositName,
        isDayOff: false,
        isSort: editData?.routeSort === 'no' ? false : true,
        status: BUSINESS_RULES.WORKING_STATUS.WORKING,
        __isFlex_draft: true,
        __draftKey: draftKey,
        ...(editData?.userId ? { userId: editData.userId } : {}),
        ...(editData?.vehicleId ? { vehicleId: editData.vehicleId } : {}),
      },
    };

    // If editData has userId and vehicleId, create assignments for the selected dates.
    // When editData.dates is provided (from the multi-day checkbox selector in addOnly modal),
    // use only those dates. Otherwise fall back to all editable days of the week.
    if (editData?.userId && editData?.vehicleId) {
      const vendorInfo = vendors?.find((v) => v.userId === editData.userId);
      const vendorName = vendorInfo?.fullName || '';
      const finalRouteSort = editData.routeSort || 'yes';

      let datesToCreate: string[];

      if (editData.dates && editData.dates.length > 0) {
        // Use only the user-selected dates, still filtering out non-editable ones
        datesToCreate = editData.dates.filter((ds) => isEditableDate(ds));
      } else {
        // Legacy fallback: compute all editable days of the week
        const selectedDate = parseLocalDate(date);
        const weekStart = new Date(selectedDate);
        const dayOfWeek = weekStart.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        weekStart.setDate(weekStart.getDate() - daysToMonday);

        let weekDates: Date[] = [];
        for (let i = 0; i < 7; i++) {
          const dayDate = new Date(weekStart);
          dayDate.setDate(dayDate.getDate() + i);
          weekDates.push(dayDate);
        }

        if (!showWeekends) {
          weekDates = weekDates.filter((d) => !isWeekend(d));
        }

        datesToCreate = weekDates
          .map((d) => formatDate(d, 'yyyy-mm-dd'))
          .filter((ds) => isEditableDate(ds));
      }

      // Create assignments for each resolved date
      const assignmentsToAdd: WeekPlannerRecord[] = [];

      datesToCreate.forEach((dayDateStr) => {
        const dayDraftKey = `flex-draft-${routeId}-${dayDateStr}-${Date.now()}`;

        const assignment: WeekPlannerRecord = {
          weekPlannerId: 0,
          date: dayDateStr,
          route: resolvedRouteName,
          name: vendorName,
          routeSort: finalRouteSort === 'yes' ? 'yes' : 'no',
          adhocSort: 'false',
          notes: editData.notes || '',
          reason: '',
          vehicle: '',
          registrationPlate: editData.registrationPlate || '',
          status: BUSINESS_RULES.WORKING_STATUS.WORKING,
          isDayOff: 'false',
          isSort: finalRouteSort === 'no' ? 'false' : 'true',
          raw: {
            date: dayDateStr,
            routeId: Number(routeId),
            route: {
              routeId: Number(routeId),
              routeName: resolvedRouteName,
              ...(depositId != null ? { depositId } : {}),
              ...(depositName != null ? { depositName } : {}),
            },
            depositId,
            depositName,
            isDayOff: false,
            isSort: finalRouteSort !== 'no',
            status: BUSINESS_RULES.WORKING_STATUS.WORKING,
            userId: editData.userId,
            vehicleId: editData.vehicleId,
            costModelId: vendorInfo?.costModelId ?? 0,
            notes: editData.notes || '',
            routeSort: finalRouteSort === 'yes' ? 'yes' : 'no',
            vendor: vendorName ? { userId: editData.userId, fullName: vendorName } : undefined,
            __isFlex_draft: false,
            __draft_completed: true,
            __draftKey: dayDraftKey,
          },
        };

        assignmentsToAdd.push(assignment);
        completedFlexDraftKeysRef.current.add(dayDraftKey);
      });

      // Add all assignments at once
      setAllOperations((prev) => [...prev, ...assignmentsToAdd]);
      return;
    }

    // Otherwise, open the edit modal for user to fill in missing data
    setAllOperations((prev) => [...prev, draftAssignment]);
    setEditingAssignment(draftAssignment);
    setShowEditAssignmentModal(true);
  }, [isSupervisorReadonly, showSupervisorReadonlyMessage, routes, vendors, setAllOperations, showWeekends, isEditableDate, showDateReadonlyMessage]);

  const handleCloseEditAssignmentModal = useCallback(() => {
    const draftRaw = (editingAssignment?.raw ?? {}) as Record<string, unknown>;
    const isFlexDraft = draftRaw.__isFlex_draft === true;
    const draftKey = typeof draftRaw.__draftKey === "string" ? draftRaw.__draftKey : "";
    if (isFlexDraft && draftKey && completedFlexDraftKeysRef.current.has(draftKey)) {
      completedFlexDraftKeysRef.current.delete(draftKey);
      setShowEditAssignmentModal(false);
      setEditingAssignment(null);
      return;
    }
    const persistedDraft = draftKey
      ? allOperations.find((op) => {
        const raw = (op.raw ?? {}) as Record<string, unknown>;
        return raw.__draftKey === draftKey;
      })
      : null;
    const persistedRaw = (persistedDraft?.raw ?? {}) as Record<string, unknown>;
    const hasVendor = Number(persistedRaw.userId ?? 0) > 0;
    const hasVehicle = Number(persistedRaw.vehicleId ?? 0) > 0;

    // If user closes before fully saving the draft, clean it from local state.
    if (isFlexDraft && draftKey && (!persistedDraft || !hasVendor || !hasVehicle)) {
      setAllOperations((prev) =>
        prev.filter((op) => {
          const raw = (op.raw ?? {}) as Record<string, unknown>;
          return raw.__draftKey !== draftKey;
        })
      );
    }

    // Clean up drag-and-drop drafts that were never confirmed (weekPlannerId still 0).
    // Read confirmation from `persistedRaw` (the LIVE item in `allOperations`, updated in
    // place by every Save path via `__draft_completed`), not just from the external
    // `completedFlexDraftKeysRef` set or the possibly-stale `editingAssignment` snapshot —
    // relying on a single shared ref made this miss cases where state moved on without it
    // (e.g. vendor spare drafts could survive Cancel because the ref alone said "unconfirmed").
    const isDragDraft = draftRaw.__is_drag_draft === true || persistedRaw.__is_drag_draft === true;
    if (isDragDraft && draftKey) {
      const isConfirmed = persistedRaw.__draft_completed === true || completedFlexDraftKeysRef.current.has(draftKey);
      if (isConfirmed) {
        completedFlexDraftKeysRef.current.delete(draftKey);
        // Draft was confirmed — keep it in state, do nothing
      } else {
        setAllOperations((prev) =>
          prev.filter((op) => {
            const raw = (op.raw ?? {}) as Record<string, unknown>;
            return raw.__draftKey !== draftKey;
          })
        );
      }
    }

    // Revert an optimistic NotAllocated→assignment patch (see handleDrop) if the user
    // closes the modal without clicking Save — this is a REAL persisted record, so it must
    // be restored to its original fields, not deleted from `allOperations`.
    const editingWeekPlannerId = editingAssignment?.weekPlannerId;
    if (typeof editingWeekPlannerId === "number" && notAllocatedPatchSnapshotsRef.current.has(editingWeekPlannerId)) {
      if (notAllocatedPatchConfirmedRef.current.has(editingWeekPlannerId)) {
        notAllocatedPatchConfirmedRef.current.delete(editingWeekPlannerId);
      } else {
        const original = notAllocatedPatchSnapshotsRef.current.get(editingWeekPlannerId)!;
        setAllOperations((prev) =>
          prev.map((op) => (op.weekPlannerId === editingWeekPlannerId ? original : op))
        );
      }
      notAllocatedPatchSnapshotsRef.current.delete(editingWeekPlannerId);
    }

    setShowEditAssignmentModal(false);
    setEditingAssignment(null);
  }, [allOperations, editingAssignment, setAllOperations]);

  // Handle creating management support assignments
  const handleCreateManagementSupport = useCallback(async (data: {
    userId: number;
    vendorName: string;
    title: string;
    dates: string[];
    vendorCostModel?: VendorCostModel | null;
    depositId?: number | null;
    managementTeamFunctionId?: number | null;
  }) => {
    try {
      const blockedDates = (data.dates ?? [])
        .map((d) => normalizeDateOnly(d))
        .filter((d) => d && !isManagementSupportEditableDate(d));
      if (blockedDates.length > 0) {
        showDateReadonlyMessage(blockedDates[0]);
        return;
      }

      const selectedUserId = Number(data.userId ?? 0);
      const selectedDatesNormalized = Array.from(
        new Set((data.dates ?? []).map((d) => normalizeDateOnly(d)).filter(Boolean))
      );

      // Safeguard: do not allow Management Support on a day where this vendor
      // already has a route assignment.
      const routeConflictDates = selectedDatesNormalized.filter((dateStr) =>
        hasRouteAssignmentForVendorOnDate(selectedUserId, dateStr)
      );
      if (routeConflictDates.length > 0) {
        setInfoModalData({
          type: 'warning',
          title: 'Conflict with Route Assignment',
          message: 'This vendor already has a route assignment on selected day(s).',
          details: `Remove the route item first or choose another day/vendor.\n\nConflicting day(s): ${routeConflictDates.join(', ')}`,
        });
        setShowInfoModal(true);
        return;
      }

      // Rule: for function IDs 6, 7, 8 — and any function whose name includes "team leader" —
      // enforce a per-day uniqueness constraint.
      // "Team Leader" functions are globally unique per day (any user triggers conflict).
      // Other restricted functions (IDs 6, 7, 8) are unique per user+function+day.
      const restrictedFunctionIds = new Set([6, 7, 8]);
      const selectedFunctionId =
        data.managementTeamFunctionId != null && Number.isFinite(Number(data.managementTeamFunctionId))
          ? Number(data.managementTeamFunctionId)
          : null;

      // Returns true if this function allows only 1 assignment per day globally (any user)
      const isUniquePerDay = (fnId: number | null, fnTitle: string): boolean => {
        const normalized = fnTitle.trim().toLowerCase();
        return normalized.includes('team leader');
        // When backend exposes is_unique flag, replace with: fn?.is_unique === true
      };

      const isTeamLeaderFunction = isUniquePerDay(selectedFunctionId, data.title ?? '');
      const isRestrictedFunction = selectedFunctionId !== null && restrictedFunctionIds.has(selectedFunctionId);

      if (isTeamLeaderFunction || isRestrictedFunction) {
        const selectedUserId = data.userId;
        const selectedDates = Array.from(new Set((data.dates ?? []).map((d) => String(d).slice(0, 10))));

        const selectedDepositId = data.depositId != null ? Number(data.depositId) : null;

        // Check local state for conflicts
        const localConflictingDates = selectedDates.filter((dateStr) =>
          allOperations.some((op) => {
            const raw = (op.raw ?? {}) as Record<string, unknown>;
            const opDate = String(op.date ?? raw.date ?? "").slice(0, 10);
            if (opDate !== dateStr) return false;

            const opFnIdRaw =
              raw.managementTeamFunctionId ??
              raw.managementTeamFunctionId ??
              (raw.dailyTeamSupport && typeof raw.dailyTeamSupport === "object"
                ? (raw.dailyTeamSupport as Record<string, unknown>).managementTeamFunctionId
                : null);
            const opFnId = Number(opFnIdRaw ?? 0);
            if (!Number.isFinite(opFnId) || opFnId !== selectedFunctionId) return false;

            // Team Leader: uniqueness is scoped to the same deposit
            if (isTeamLeaderFunction && selectedDepositId != null) {
              const opDepositIdRaw =
                raw.depositId ??
                (raw.dailyTeamSupport && typeof raw.dailyTeamSupport === "object"
                  ? (raw.dailyTeamSupport as Record<string, unknown>).depositId
                  : null);
              const opDepositId = Number(opDepositIdRaw ?? 0);
              if (opDepositId > 0 && opDepositId !== selectedDepositId) return false;
            }

            // Team Leader: any existing assignment on this function+deposit+date is a conflict
            if (isTeamLeaderFunction) return true;

            // Other restricted functions: conflict only if same user is already assigned
            const opUserIdRaw =
              raw.userId ??
              raw.userId ??
              (raw.dailyTeamSupport && typeof raw.dailyTeamSupport === "object"
                ? (raw.dailyTeamSupport as Record<string, unknown>).userId
                : null);
            const opUserId = Number(opUserIdRaw ?? 0);
            return Number.isFinite(opUserId) && opUserId === selectedUserId;
          })
        );
        const conflictingDatesSet = new Set(localConflictingDates);

        // Also verify against API (source of truth) to prevent duplicates
        // when local state is stale/outdated.
        if (selectedDates.length > 0) {
          const startDate = [...selectedDates].sort()[0];
          const endDate = [...selectedDates].sort()[selectedDates.length - 1];
          const dtsRecords = await fetchDailyTeamSupport(startDate, endDate);
          dtsRecords.forEach((record) => {
            const recordDate = String(record.date ?? "").slice(0, 10);
            const recordFnId = Number(record.managementTeamFunctionId ?? 0);
            if (
              !selectedDates.includes(recordDate) ||
              !Number.isFinite(recordFnId) ||
              recordFnId !== selectedFunctionId
            ) return;

            if (isTeamLeaderFunction) {
              // Team Leader: scoped to the same deposit — skip records from other deposits
              if (selectedDepositId != null) {
                const recordDepositId = Number(record.depositId ?? 0);
                if (recordDepositId > 0 && recordDepositId !== selectedDepositId) return;
              }
              conflictingDatesSet.add(recordDate);
            } else {
              // Other restricted functions: only same user triggers conflict
              const recordUserId = Number(record.userId ?? 0);
              if (Number.isFinite(recordUserId) && recordUserId === selectedUserId) {
                conflictingDatesSet.add(recordDate);
              }
            }
          });
        }
        const conflictingDates = Array.from(conflictingDatesSet).sort();

        if (conflictingDates.length > 0) {
          const functionName = data.title?.trim() || `Function ${selectedFunctionId}`;
          const ruleDetail = isTeamLeaderFunction
            ? `Only 1 Team Leader per deposit per day is allowed.`
            : `Only one item per day is allowed for the same vendor.`;
          setInfoModalData({
            type: 'warning',
            title: 'Management Support Rule',
            message: `${functionName} already has an item on selected day(s) for this deposit.`,
            details: `${ruleDetail}\n\nConflicting day(s): ${conflictingDates.join(', ')}`,
          });
          setShowInfoModal(true);
          return;
        }
      }

      // Get current user ID for createdBy
      const createdBy = getUserIdFromToken();
      if (!createdBy) {
        throw new Error("Unable to identify current user. Please log in again.");
      }

      // data.userId is already the userId from the selected employee in the modal
      const userId = data.userId;

      // Create daily-team-support for all selected dates in a single bulk request
      const sortedDates = [...data.dates].sort();
      const bulkItems = sortedDates.map((dateStr) => ({
        date: dateStr,
        description: data.title,
        userId: userId,
        createdBy: createdBy,
        depositId: data.depositId != null ? Number(data.depositId) : undefined,
        managementTeamFunctionId: data.managementTeamFunctionId || null,
      } as DailyTeamSupportCreateDTO));
      if (bulkItems.length > 0) {
        await createDailyTeamSupportBulk(bulkItems);
      }

      // Refresh data to get the newly created entries
      setRefreshTrigger((prev) => prev + 1);

      const startDate = sortedDates[0];
      const endDate = sortedDates[sortedDates.length - 1];

      // Show success message
      setInfoModalData({
        type: 'success',
        title: 'Management Support Created',
        message: `Successfully created daily team support for ${data.title} (${sortedDates.length} day(s)) from ${startDate} to ${endDate}.`,
      });
      setShowInfoModal(true);
    } catch (error) {
      console.error("Error creating management support:", error);
      setInfoModalData({
        type: 'error',
        title: 'Error Creating Management Support',
        message: error instanceof Error ? error.message : 'Failed to create management support assignment(s).',
      });
      setShowInfoModal(true);
      throw error;
    }
  }, [allOperations, hasRouteAssignmentForVendorOnDate, setRefreshTrigger, isManagementSupportEditableDate, showDateReadonlyMessage]);

  // Handle creating daily team support (allows multiple per day)
  const handleCreateDailyTeamSupport = useCallback(async (userId: number, routeId: number, dateStr: string) => {
    if (!isEditableDate(dateStr)) {
      showDateReadonlyMessage(dateStr);
      return;
    }

    try {
      // Find the vendor
      let vendor: VendorLookup | undefined = vendors.find((d) => d.userId === userId) as unknown as VendorLookup | undefined;

      if (!vendor) {
        // Try to fetch from vendors
        try {
          const fetchedVendors = await fetchVendorsRaw();
          vendor = fetchedVendors.find(
            (v) => (v.userId === userId)
          ) as Record<string, unknown> | undefined;

          if (vendor) {
            const fullName = `${String(vendor.name || "")} ${String(vendor.lastName || "")}`.trim();

            vendor = {
              userId: Number(vendor.userId) || 0,
              fullName: fullName || "Unknown Vendor",
              vendorTypeId: vendor.vendorTypeId ? Number(vendor.vendorTypeId) : null,
              costModelId: vendor.costModelId ? Number(vendor.costModelId) : null,
              routeId: (() => {
                const v = vendor as Record<string, unknown>;
                const rid = v.routeId ?? v.routeId;
                return rid != null && rid !== "" ? Number(rid) : null;
              })(),
              vehicleId: (() => {
                const v = vendor as Record<string, unknown>;
                const vid = v.vehicleId ?? v.vehicleId;
                return vid != null && vid !== "" ? Number(vid) : null;
              })(),
            } as VendorLookup;
          }
        } catch (err) {
          console.error("Error fetching vendor data:", err);
        }
      }

      if (!vendor) {
        throw new Error(`Vendor not found: ${userId}`);
      }

      // Find the route
      const targetRoute = routeId && Number.isFinite(routeId) && routeId > 0
        ? routes.find((r) => r.routeId === routeId || r.routeDefaultId === routeId)
        : null;

      // Get vehicleId from vendor if available
      const vehicleId = vendor.vehicleId;

      // Create new WeekPlannerRecord in memory (allows multiple per day - no duplicate check)
      const newAssignment: WeekPlannerRecord = {
        weekPlannerId: 0, // Will be assigned by backend when saved
        date: dateStr,
        route: String(targetRoute?.routeName || targetRoute?.routeDefaultName || (routeId ? String(routeId) : "")),
        name: vendor.fullName || "",
        routeSort: "",
        adhocSort: "",
        notes: "",
        reason: "", // DB schema has no "reason" column; keep it embedded in notes instead
        vehicle: "",
        registrationPlate: "",
        status: BUSINESS_RULES.WORKING_STATUS.WORKING,
        isDayOff: "false",
        isSort: "false",
        raw: {
          date: dateStr,
          userId: userId,
          routeId: routeId && Number.isFinite(routeId) && routeId > 0 ? Number(routeId) : undefined,
          routeDefaultId: targetRoute?.routeId || targetRoute?.routeDefaultId || (routeId && Number.isFinite(routeId) && routeId > 0 ? Number(routeId) : undefined),
          vehicleId: vehicleId && Number.isFinite(vehicleId) && vehicleId > 0 ? Number(vehicleId) : undefined,
          status: BUSINESS_RULES.WORKING_STATUS.WORKING,
          isDayOff: false,
        },
      };

      // Add to state (in memory) - NO duplicate check for daily team support (allows multiple per day)
      setAllOperations((prev) => [...prev, newAssignment]);


      // Open edit modal after creating assignment
      setEditingAssignment(newAssignment);
      setShowEditAssignmentModal(true);
    } catch (error) {
      console.error("Error creating daily team support:", error);
      setInfoModalData({
        type: 'error',
        title: 'Error Creating Daily Team Support',
        message: error instanceof Error ? error.message : 'Failed to create daily team support assignment.',
      });
      setShowInfoModal(true);
      throw error;
    }
  }, [vendors, routes, fetchVendorsRaw, setAllOperations, isEditableDate, showDateReadonlyMessage]);

  // Handle creating ADHOC service: only insert (create). Do not update existing week-planners.
  const handleCreateAdHocService = useCallback(async (
    userId: number,
    adhocServiceId: number,
    dateStr: string,
    depositId?: number,
    depositName?: string,
    notes?: string,
    adhocSort?: number,
    dates?: string[],
    selectedVehicleId?: number
  ) => {
    try {
      const baseDateNorm = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const targetDates = (dates && dates.length > 0
        ? dates.map((d) => (d.includes('T') ? d.split('T')[0] : d))
        : [baseDateNorm]
      ).filter(Boolean);


      const blockedDates = targetDates.filter((d) => !isEditableDate(d));
      if (blockedDates.length > 0) {
        showDateReadonlyMessage(blockedDates[0]);
        return;
      }
      const depositIdNum = depositId != null && Number.isFinite(Number(depositId)) ? Number(depositId) : (depositId ?? 0);
      let addedInMemory = false;
      const { fetchAdhocServices } = await import('@/lib/adhoc-services-api');
      const adhocServices = await fetchAdhocServices();
      const selectedAdhocService = adhocServices.find((service) => service.adhocServiceId === adhocServiceId);

      // ALWAYS fetch latest vendor for accurate vehicle details (plate/model)
      let matchedVendorRecord: VendorRecord | null = vendors?.find(
        (v) => getUserIdFromVendor(v as unknown as VendorRecord) === userId
      ) as unknown as VendorRecord | null;

      if (!matchedVendorRecord || !getVendorVehiclePlate(matchedVendorRecord)) {
        try {
          const vendorsRaw = await fetchVendorsRaw();
          const vendor = (vendorsRaw as Record<string, unknown>[]).find(
            (v) => (Number(v.userId) === userId || Number(v.userId) === userId)
          );
          if (vendor) {
            matchedVendorRecord = vendor as unknown as VendorRecord;
          }
        } catch (err) {
          console.error("Error fetching vendor detail:", err);
        }
      }

      let vendor: VendorLookup | undefined = vendors.find((d) => d.userId === userId) as unknown as VendorLookup | undefined;
      if (!vendor && matchedVendorRecord) {
        vendor = matchedVendorRecord as unknown as VendorLookup;
        const fullName = `${String(vendor.name || "")} ${String(vendor.lastName || "")}`.trim();
        vendor = {
          userId: Number(vendor.userId) || 0,
          fullName: fullName || "Unknown Vendor",
          vendorTypeId: vendor.vendorTypeId ? Number(vendor.vendorTypeId) : null,
          costModelId: vendor.costModelId ? Number(vendor.costModelId) : null,
          routeId: Number(vendor.routeId) || null,
          vehicleId: Number(vendor.vehicleId) || null,
        } as VendorLookup;
      }

      if (!vendor) {
        throw new Error(`Vendor with ID ${userId} not found.`);
      }

      const normalizeDateStr = (d: string) => (d && d.includes('T') ? d.split('T')[0] : d).trim().slice(0, 10);
      const getIdentityKey = (dId: number, dt: string, depId: number, sId: number) => {
        return `${dId}-${normalizeDateStr(dt)}-${depId}-${sId}`;
      };

      const finalNewAssignments: WeekPlannerRecord[] = [];
      const targetIdentityKeys = new Set<string>();

      for (const targetDate of targetDates) {
        const targetDateNorm = normalizeDateStr(targetDate);
        const identityKey = getIdentityKey(userId, targetDateNorm, Number(depositIdNum), adhocServiceId);
        targetIdentityKeys.add(identityKey);

        const adhocForwardRouteName = selectedAdhocService?.adhocName || `AdHoc ${adhocServiceId}`;
        const routeId = BUSINESS_RULES.ROUTE.DHOC;
        // Sort-only adhoc services (isAdhocSort !== false) never use a real vehicle — always pin to
        // the NOVEHICLE/BAOP placeholder instead of falling back to the vendor's own default vehicle.
        const isSortOnlyService = selectedAdhocService?.isAdhocSort !== false;
        const vehicleIdRaw = isSortOnlyService
          ? BUSINESS_RULES.VEHICLE.BAOP_DEFAULT_PLACEHOLDER
          : (selectedVehicleId ?? vendor.vehicleId ?? matchedVendorRecord?.vehicleId ?? null);
        const vehicleId = vehicleIdRaw != null ? Number(vehicleIdRaw) : null;
        
        let vehiclePlate = matchedVendorRecord ? getVendorVehiclePlate(matchedVendorRecord) : '';
        let vehicleModel = matchedVendorRecord ? getVendorVehicleModel(matchedVendorRecord) : '';

        // Global Vehicle Lookup Fallback: if plate is still missing, try resolving via vehicleId
        if (!vehiclePlate && vehicleId) {
          try {
            const vehiclesRaw = await fetchVehiclesRaw();
            const vInfo = (vehiclesRaw as Record<string, unknown>[]).find(v => Number(v.vehicleId) === vehicleId);
            if (vInfo) {
              vehiclePlate = String(vInfo.registrationPlates || vInfo.registrationPlate || vInfo.registration_plate || '').trim();
              vehicleModel = vehicleModel || String(vInfo.model || vInfo.vehicleModel || '').trim();
            }
          } catch (err) {
            console.warn('[handleCreateAdHocService] Global vehicle lookup failed:', err);
          }
        }

        const costModelId = vendor.costModelId ?? null;
        const adhocServiceName = selectedAdhocService?.adhocName ?? `Service ${adhocServiceId}`;

        const rawPayload: Record<string, unknown> = {
          date: targetDateNorm,
          userId: userId,
          routeId: routeId,
          vehicleId: vehicleId,
          isSort: false,
          costModelId: costModelId,
          adhocServiceId: adhocServiceId,
          adhocName: adhocServiceName,
          notes: notes?.trim() || undefined,
          depositName: depositName || undefined,
          depositId: depositIdNum > 0 ? depositIdNum : undefined,
          status: BUSINESS_RULES.WORKING_STATUS.WORKING,
          isDayOff: false,
          fullName: vendor.fullName,
          route: { routeId: routeId, routeName: adhocForwardRouteName },
          __source: 'adhoc-section',
          // Stable identity for this in-memory draft so later edits (e.g. swapping the vendor)
          // can reliably locate it via __draftKey instead of falling back to fragile
          // name+date+route+userId matching (see handleUpdateVehicle / isTargetDraft).
          __draftKey: `adhoc:${targetDateNorm}:${userId}:${adhocServiceId}:${depositIdNum > 0 ? depositIdNum : 'dep'}`,
          adhocService: {
            adhocServiceId: adhocServiceId,
            adhocName: adhocServiceName,
            isAdhocSort: selectedAdhocService?.isAdhocSort !== false,
            isAdhocService: selectedAdhocService?.isAdhocService,
          },
          costModel: { costModelId: costModelId },
          ...(vehiclePlate ? { 
            registration_plate: vehiclePlate, 
            registrationPlate: vehiclePlate, 
            vehicleRegistrationPlate: vehiclePlate,
            vehicleRegistration_plate: vehiclePlate,
            vehicleDefaultRegistrationPlate: vehiclePlate
          } : {}),
          ...(vehicleModel ? { vehicleModel: vehicleModel, model: vehicleModel } : {}),
        };

        const newAssignment: WeekPlannerRecord = {
          weekPlannerId: 0,
          date: targetDateNorm,
          route: adhocForwardRouteName,
          name: vendor.fullName || "",
          routeSort: "yes",
          adhocSort: selectedAdhocService?.isAdhocSort === false ? "false" : "true",
          notes: notes?.trim() || "",
          reason: "",
          vehicle: vehicleModel || "",
          registrationPlate: vehiclePlate || "",
          status: BUSINESS_RULES.WORKING_STATUS.WORKING,
          isDayOff: "false",
          isSort: "false",
          raw: { ...rawPayload, __locallyModified: true },
        };

        finalNewAssignments.push(newAssignment);
      }

      // Append the new assignments without purging existing ones.
      // Removing the previous "ATOMIC RECONSTRUCTION" purge so that a vendor can have
      // multiple AdHoc services on the same day (e.g. multiple services with isAdhocSort=false).
      setAllOperations((prev) => [...prev, ...finalNewAssignments]);

      addedInMemory = true;

      if (!addedInMemory && targetDates.length > 0) {
        setInfoModalData({
          type: 'info',
          title: 'Add ADHOC Service',
          message: 'No new assignment was created for the selected date(s).',
          details: 'This vendor already has an assignment for each selected day. To add another ADHOC service on the same day, please choose a service that allows multiple assignments per day.',
        });
        setShowInfoModal(true);
      }
    } catch (error) {
      console.error("Error creating ADHOC service:", error);
      setInfoModalData({
        type: 'error',
        title: 'Error Creating ADHOC Service',
        message: error instanceof Error ? error.message : 'Failed to create ADHOC service assignment.',
      });
      setShowInfoModal(true);
      throw error;
    }
  }, [vendors, fetchVendorsRaw, setAllOperations, fetchVehiclesRaw, isEditableDate, showDateReadonlyMessage]);

  // Handle creating BAOP service from ROUTES table (routeId comes from modal selection)
  const handleCreateBaopService = useCallback(async (
    userId: number,
    routeId: number,
    dateStr: string,
    depositId?: number,
    depositName?: string,
    notes?: string,
    adhocSort?: number
  ) => {
    if (!isEditableDate(dateStr)) {
      showDateReadonlyMessage(dateStr);
      return;
    }

    try {
      // Find the vendor
      let vendor: VendorLookup | undefined = vendors.find((d) => d.userId === userId) as unknown as VendorLookup | undefined;

      if (!vendor) {
        // Try to fetch from vendors
        try {
          const fetchedVendors = await fetchVendorsRaw();
          vendor = fetchedVendors.find(
            (v) => (v.userId === userId)
          ) as Record<string, unknown> | undefined;

          if (vendor) {
            const fullName = `${String(vendor.name || "")} ${String(vendor.lastName || "")}`.trim();

            vendor = {
              userId: Number(vendor.userId) || 0,
              fullName: fullName || "Unknown Vendor",
              vendorTypeId: vendor.vendorTypeId ? Number(vendor.vendorTypeId) : null,
              costModelId: vendor.costModelId ? Number(vendor.costModelId) : null,
              routeId: (() => {
                const v = vendor as Record<string, unknown>;
                const rid = v.routeId ?? v.routeId;
                return rid != null && rid !== "" ? Number(rid) : null;
              })(),
              vehicleId: (() => {
                const v = vendor as Record<string, unknown>;
                const vid = v.vehicleId ?? v.vehicleId;
                return vid != null && vid !== "" ? Number(vid) : null;
              })(),
            };
          }
        } catch (err) {
          console.error("Error fetching vendor data:", err);
        }
      }

      if (!vendor) {
        throw new Error(`Vendor not found: ${userId}`);
      }

      const targetRoute = routes.find((r) => Number(r.routeId) === Number(routeId) || Number((r as RouteWithDefault).routeDefaultId || 0) === Number(routeId));
      const routeName = String(targetRoute?.routeName || targetRoute?.routeDefaultName || `Route ${routeId}`);

      const vehicleId = vendor.vehicleId;

      const lineSort = adhocSort != null && Number.isFinite(Number(adhocSort)) ? Number(adhocSort) : undefined;
      const newAssignment: WeekPlannerRecord = {
        weekPlannerId: 0,
        date: dateStr,
        route: routeName,
        name: vendor.fullName || "",
        routeSort: "",
        adhocSort: lineSort != null ? String(lineSort) : "",
        notes: notes || "",
        reason: "",
        vehicle: "",
        registrationPlate: "",
        status: BUSINESS_RULES.WORKING_STATUS.WORKING,
        isDayOff: "false",
        isSort: "false",
        raw: {
          date: dateStr,
          userId: userId,
          routeId: Number(routeId),
          vehicleId: vehicleId && Number.isFinite(vehicleId) && vehicleId > 0 ? Number(vehicleId) : undefined,
          adhocSort: lineSort,
          status: BUSINESS_RULES.WORKING_STATUS.WORKING,
          isDayOff: false,
          depositId: depositId,
          depositName: depositName,
          route: {
            routeId: Number(routeId),
            routeName: routeName,
            depositId: depositId,
            depositName: depositName,
          },
          vehicle: vehicleId && Number.isFinite(vehicleId) && vehicleId > 0 ? {
            vehicleId: Number(vehicleId),
          } : undefined,
          __draftKey: `baop:${dateStr}:${userId}:${routeId}:${depositId ?? 'dep'}:${lineSort ?? 'line'}`,
        },
      };

      setAllOperations((prev) => [...prev, newAssignment]);
      setEditingAssignment(newAssignment);
      setShowEditAssignmentModal(true);
    } catch (error) {
      console.error("Error creating BAOP service:", error);
      setInfoModalData({
        type: 'error',
        title: 'Error Creating BAOP Service',
        message: error instanceof Error ? error.message : 'Failed to create BAOP service assignment.',
      });
      setShowInfoModal(true);
      throw error;
    }
  }, [vendors, routes, fetchVendorsRaw, setAllOperations, isEditableDate, showDateReadonlyMessage]);

  // Removed unused handleDownload function

  // Export week planner to Excel; respeita o toggle "Show Weekends" (showWeekends)
  const handleExportExcel = useCallback(async (showWeekends: boolean) => {
    try {
      const { blob, filename } = await exportWeekPlanners(selectedDate, undefined, showWeekends);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (err) {
      console.error("Error exporting week planners to Excel:", err);
      alert(err instanceof Error ? err.message : "Error downloading Excel. Please try again.");
    }
  }, [selectedDate]);

  // Export day schedule to PDF — copy of Daily View (one day, deposits with Core/Flex/Adhoc, OFF section)
  const handleExportDaySchedule = useCallback(async (
    dateToExport: string,
    assignments?: WeekPlannerRecord[],
    context?: {
      dayOffEntries?: PlannerDayOffEntry[];
      depositsWithRoutes?: DepositWithRoutesDTO[];
      vendors?: Vendor[];
      exportDepositId?: number;
      exportDepositName?: string;
      /** When set, only these depot IDs are included — all in one PDF */
      exportDepositIds?: number[];
    },
    options?: { returnBlob?: boolean }
  ): Promise<void | { blob: Blob; filename: string }> => {
    try {
      // NEW: Call backend API for PDF generation with deduplication
      const blob = await exportWeekPlannerPDF('day', dateToExport, undefined, undefined, false, context?.exportDepositIds);
      const filename = `weekplanner_day_${dateToExport.replace(/-/g, '')}.pdf`;

      if (options?.returnBlob) {
        return { blob, filename };
      }

      // Download directly
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return;
    } catch (error) {
      console.error('[Export Day Schedule] Error:', error instanceof Error ? error.message : error);
      throw error;
    }
  }, []);

  // Export week schedule to PDF - delegated to backend
  const handleExportWeekSchedule = useCallback(async (
    depositId: number | null,
    depositName: string,
    weekDateStrings: string[],
    assignments: WeekPlannerRecord[],
    context?: {
      dayOffEntries?: PlannerDayOffEntry[];
      depositsWithRoutes?: DepositWithRoutesDTO[];
      vendors?: Vendor[];
      showWeekends?: boolean;
    },
    options?: { returnBlob?: boolean }
  ): Promise<void | { blob: Blob; filename: string }> => {
    try {
      if (!weekDateStrings || weekDateStrings.length === 0) {
        throw new Error('No week dates provided');
      }

      const date = weekDateStrings[0];
      const API_BASE_URL = getApiBaseUrl();

      if (!API_BASE_URL) {
        throw new Error('API URL not configured');
      }

      const url = `${API_BASE_URL}/api/v1/week-planner/export/week`;

      const response = await guardedFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getBearerAuthHeader(),
        },
        body: JSON.stringify({
          date,
          includeWeekends: context?.showWeekends ?? true,
          depositId: depositId ?? null,
          userId: null,
          format: 'pdf',
        }),
        // NOTE: When depositId is specified, backend should still include adhoc services
        // that don't have a specific depositId or are shared across deposits
      });

      if (!response.ok) {
        throw new Error(`Failed to export week schedule: ${response.statusText}`);
      }

      const blob = await response.blob();
      const filename = `week_schedule_${depositName.replace(/\s+/g, '_')}_${date}.pdf`;

      if (options?.returnBlob) {
        return { blob, filename };
      }

      // Download directly
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return;
    } catch (error) {
      console.error('[Export Week Schedule] Error:', error instanceof Error ? error.message : error);
      throw error;
    }
  }, []);


  // Handle default schedule - populate loop routes from vendor data
  const handleDefaultSchedule = useCallback(async (excludeWeekends: boolean = false) => {
    if (isWeekLocked) {
      // Semana travada: não bloqueamos o Generate Week.
      // Também não precisamos exibir warning modal (o usuário já acionou a ação
      // e a lógica de delete + repopulate está sendo executada).
    }
    if (!API_BASE_URL) {
      setInfoModalData({
        type: 'error',
        title: 'Configuration Error',
        message: 'API URL is not configured.',
      });
      setShowInfoModal(true);
      return;
    }

    try {
      // Fetch vendors
      const vendors = await fetchVendorsRaw();

      // Fetch vehicles (to auto-assign active vehicles by deposit when vendor has none)
      let vehiclesRaw: Record<string, unknown>[] = [];
      try {
        const { fetchVehicles } = await import('@/lib/vehicles');
        const vehicles = await fetchVehicles();
        vehiclesRaw = (vehicles || []) as unknown as Record<string, unknown>[];
      } catch (err) {
        console.warn("[Generate Week] Could not fetch vehicles (will skip auto vehicle assignment):", err);
      }

      // Fetch vendors to use vehicleId as fallback when the BFF vendor API returns null/0 for vehicleId
      const vendorVehicleMap = new Map<number, number>();
      try {
        const { fetchVendors: fetchVendorsForVehicle } = await import('@/lib/vendors');
        const vendorsForVehicle = await fetchVendorsForVehicle();
        for (const d of vendorsForVehicle) {
          const dId = Number(d.userId ?? 0);
          const vId = Number(d.vehicleId ?? 0);
          if (dId > 0 && vId > 0) vendorVehicleMap.set(dId, vId);
        }
      } catch (err) {
        console.warn("[Generate Week] Could not fetch vendors for vehicleId fallback:", err);
      }

      if (vendors.length === 0) {
        setInfoModalData({
          type: 'warning',
          title: 'No Vendors Found',
          message: 'No active vendors with routes found.',
        });
        setShowInfoModal(true);
        return;
      }

      // Get CORE routes across all deposits (exclude FLEX and ADHOC)
      const coreRoutes = routes.filter((r) => {
        if (isFlexRoute(r)) return false;
        const routeNameLower = String(r.routeName || "").toLowerCase();
        const isAdHoc =
          routeNameLower.includes("adhoc") ||
          routeNameLower.includes("ad-hoc") ||
          Number(r.routeId) === BRTE_ROUTE_ID; // BRTE is treated as ADHOC/special route in this codebase
        return !isAdHoc;
      });

      // FLEX routes are normally filled manually (drag/drop or "Open"), but a vendor whose own
      // routeId is permanently set to a flex route (their fixed/home route) should still be
      // auto-scheduled onto it, same as a core route.
      const directFlexRoutes = routes.filter((r) => isFlexRoute(r));


      if (coreRoutes.length === 0) {
        setInfoModalData({
          type: 'warning',
          title: 'No Core Routes Found',
          message: 'No core routes found.',
        });
        setShowInfoModal(true);
        return;
      }

      // Log all deposits that have core routes
      const depositsWithCoreRoutes = new Set<number>();
      coreRoutes.forEach(r => {
        const depositId = Number(r.depositId ?? 0);
        if (depositId > 0) {
          depositsWithCoreRoutes.add(depositId);
        }
      });

      // Use same week logic as the page: selected week (Mon–Sun) from dateUtils
      const weekStartDate = getWeekStart(selectedDate);
      const weekEndDate = getWeekEnd(selectedDate);
      const weekStartStr = formatDate(weekStartDate, "yyyy-mm-dd");
      const weekEndStr = formatDate(weekEndDate, "yyyy-mm-dd");
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDate(tomorrow, "yyyy-mm-dd");

      const weekDates = getWeekDates(selectedDate);

      // Process the selected week: only from tomorrow onwards (currentDate + 1 day), optionally excluding weekends
      const weekDatesFiltered = excludeWeekends
        ? weekDates.filter((d) => d.getDay() >= 1 && d.getDay() <= 5) // Monday=1 .. Friday=5
        : weekDates;
      let datesToProcess = weekDatesFiltered.filter((d) => formatDate(d, "yyyy-mm-dd") >= tomorrowStr);
      if (bankHolidays.size > 0) {
        datesToProcess = datesToProcess.filter((d) => !bankHolidays.has(formatDate(d, "yyyy-mm-dd")));
      }

      if (datesToProcess.length === 0) {
        setInfoModalData({
          type: "info",
          title: "Generate Week",
          message: "There are no days to repopulate in the selected week.",
          details: "Generate Week only creates assignments from tomorrow onwards.",
        });
        setShowInfoModal(true);
        return;
      }

      // Generate Week order requirement:
      // 1) Create/ensure Management & Support first
      // 2) Then generate week-planner assignments using that snapshot
      // so backend rules are not overwritten by assignment generation.
      const managementSupportVendorDateKeys = new Set<string>();
      const createdManagementSupportLocal: WeekPlannerRecord[] = [];
      let createdManagementSupportCount = 0;
      try {
        const managementWeekStartStr = formatDate(weekStartDate, "yyyy-mm-dd");
        const managementWeekEndStr = formatDate(weekEndDate, "yyyy-mm-dd");

        const userNameByUserId = new Map<number, string>();
        for (const v of vendors) {
          const vr = v as Record<string, unknown>;
          const uid = Number(vr.userId ?? vr.userId ?? 0);
          if (!Number.isFinite(uid) || uid <= 0) continue;
          const fullName = `${String(vr.name ?? "")} ${String(vr.lastName ?? "")}`.trim() || String(vr.fullName ?? "").trim();
          if (fullName) userNameByUserId.set(uid, fullName);
        }

        // Existing daily-team-support in the selected week (ground truth)
        const existingDts = await fetchDailyTeamSupport(managementWeekStartStr, managementWeekEndStr);
        const existingByFunctionKey = new Set<string>();
        for (const d of existingDts) {
          const dateStr = d.date.split("T")[0];
          const functionId = Number(d.managementTeamFunctionId ?? 0);
          const userId = Number(d.userId ?? 0);
          if (functionId > 0) existingByFunctionKey.add(`${dateStr}|${functionId}`);
          if (userId > 0) managementSupportVendorDateKeys.add(`${userId}-${dateStr}`);
        }

        const managementTeamFunctions = await fetchManagementTeamFunctions();
        const functionsWithUser = managementTeamFunctions.filter(
          (fn) => fn.userId != null && Number(fn.userId) > 0
        );

        // Vendors that will have Management & Support in this generation window
        // are blocked from route assignments in generate week.
        for (const dateObj of datesToProcess) {
          const dateStr = formatDate(dateObj, "yyyy-mm-dd");
          for (const fn of functionsWithUser) {
            const userId = Number(fn.userId ?? 0);
            if (userId > 0) {
              managementSupportVendorDateKeys.add(`${userId}-${dateStr}`);
            }
          }
        }

        // Create missing daily-team-support first (before week-planner generation).
        const createdBy = getUserIdFromToken();
        if (createdBy) {
          const toCreate: DailyTeamSupportCreateDTO[] = [];
          for (const dateObj of datesToProcess) {
            const dateStr = formatDate(dateObj, "yyyy-mm-dd");
            for (const fn of functionsWithUser) {
              const functionId = Number(fn.managementTeamFunctionId ?? 0);
              if (functionId <= 0) continue;
              const key = `${dateStr}|${functionId}`;
              if (existingByFunctionKey.has(key)) continue;
              existingByFunctionKey.add(key);
              toCreate.push({
                date: dateStr,
                description: fn.functionName,
                userId: Number(fn.userId),
                createdBy,
                ...(fn.depositId != null ? { depositId: Number(fn.depositId) } : {}),
                managementTeamFunctionId: fn.managementTeamFunctionId,
              });
            }
          }

          if (toCreate.length > 0) {
            await createDailyTeamSupportBulk(toCreate);
            createdManagementSupportCount = toCreate.length;
            setRefreshTrigger((prev) => prev + 1);

            // Keep newly created management items visible immediately in memory
            // during the same Generate Week execution.
            toCreate.forEach((item, index) => {
              const localId = -(Date.now() + index + 1);
              const userIdNum = Number(item.userId ?? 0);
              const description = String(item.description ?? "Management and Support");
              const dateStr = String(item.date ?? "").split("T")[0];
              createdManagementSupportLocal.push({
                weekPlannerId: localId,
                date: dateStr,
                route: `Management and Support: ${description}`,
                name: userNameByUserId.get(userIdNum) || "Unknown",
                routeSort: "",
                adhocSort: "",
                notes: description,
                reason: "",
                vehicle: "",
                registrationPlate: "",
                status: BUSINESS_RULES.WORKING_STATUS.WORKING,
                isDayOff: "false",
                isSort: "false",
                raw: {
                  date: dateStr,
                  userId: userIdNum,
                  category: "management",
                  status: BUSINESS_RULES.WORKING_STATUS.WORKING,
                  isDayOff: false,
                  managementTeamFunctionId: item.managementTeamFunctionId ?? undefined,
                  depositId: item.depositId ?? undefined,
                },
              });
            });

          }
        }
      } catch (mtfErr) {
        console.warn("[Generate Week] Could not prepare/create daily-team-support before generation:", mtfErr);
      }

      const isNotAllocatedStatus = (op: WeekPlannerRecord): boolean => {
        const raw = (op.raw ?? {}) as Record<string, unknown>;
        const statusRaw =
          raw.status != null ? String(raw.status).trim() : String(op.status ?? "").trim();
        if (!statusRaw) return false;
        const lower = statusRaw.toLowerCase();
        return lower === "notallocated" || statusRaw === BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED;
      };

      const isManagementSupportOperation = (op: WeekPlannerRecord): boolean => {
        const raw = (op.raw ?? {}) as Record<string, unknown>;
        const rawCategory = String(raw.category ?? "").toLowerCase();
        const rawRouteObj =
          raw.route && typeof raw.route === "object"
            ? (raw.route as Record<string, unknown>)
            : undefined;
        const routeName = String(
          op.route ??
          raw.routeName ??
          rawRouteObj?.routeName ??
          ""
        ).toLowerCase();
        const hasManagementFunctionId = Boolean(
          raw.managementTeamFunctionId != null ||
          raw.managementTeamFunctionId != null ||
          (raw.dailyTeamSupport &&
            typeof raw.dailyTeamSupport === "object" &&
            (
              (raw.dailyTeamSupport as Record<string, unknown>).managementTeamFunctionId != null ||
              (raw.dailyTeamSupport as Record<string, unknown>).managementTeamFunctionId != null
            ))
        );
        return (
          raw.dailyTeamSupportId !== undefined ||
          raw.dailyTeamSupportId !== undefined ||
          raw.dailyTeamSupport != null ||
          hasManagementFunctionId ||
          op.weekPlannerId < 0 ||
          rawCategory === "management" ||
          routeName.includes("management and support")
        );
      };

      // 1. Fetch all existing week planners from the API to get the "ground truth"
      // across all deposits. We call the API directly (bypassing the restricted depositId
      // resolution that fetchAllWeekPlannersForDate applies) so we collect IDs for ALL
      // deposits, not just the one the logged-in supervisor is assigned to.
      let allExisting: WeekPlannerRecord[] = [];
      try {
        const weekStartDateForFetch = formatDate(getWeekStart(selectedDate), "yyyy-mm-dd");
        const weekEndDateForFetch = formatDate(getWeekEnd(selectedDate), "yyyy-mm-dd");
        const fetchParams = new URLSearchParams();
        fetchParams.append("initialDate", weekStartDateForFetch);
        fetchParams.append("endDate", weekEndDateForFetch);
        const fetchUrl = `${API_BASE_URL}/bff/week-planners?${fetchParams.toString()}`;
        const fetchResp = await guardedFetch(fetchUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getBearerAuthHeader(),
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          cache: "no-store",
          credentials: "include",
        });
        if (fetchResp.ok) {
          const fetchData = await fetchResp.json();
          const rawArray: Record<string, unknown>[] = Array.isArray(fetchData)
            ? fetchData
            : Array.isArray(fetchData?.data) ? fetchData.data
            : Array.isArray(fetchData?.weekPlanners) ? fetchData.weekPlanners
            : [];
          allExisting = rawArray.map(normalizeWeekPlanner);
        } else {
          console.warn(`[Generate Week] Could not fetch existing week planners (${fetchResp.status}), falling back to in-memory state.`);
          allExisting = allOperationsRef.current;
        }
      } catch (fetchErr) {
        console.warn("[Generate Week] Fetch existing week planners failed, falling back to in-memory state:", fetchErr);
        allExisting = allOperationsRef.current;
      }

      const todayStr = getLocalDateString();
      const idsToDelete = new Set<number>();
      const isDayOffValue = (value: unknown): boolean => {
        return (
          value === true ||
          value === 1 ||
          value === "1" ||
          String(value).toLowerCase() === "true"
        );
      };

      const getVendorIdFromWeekPlanner = (op: WeekPlannerRecord): number => {
        const raw = (op.raw ?? {}) as Record<string, unknown>;
        const rawVendor = raw.vendor;
        const vendorObj =
          rawVendor && typeof rawVendor === "object"
            ? (rawVendor as Record<string, unknown>)
            : undefined;
        const resolved = Number(
          raw.userId ??
          raw.userId ??
          vendorObj?.userId ??
          vendorObj?.userId ??
          0
        );
        return Number.isFinite(resolved) && resolved > 0 ? resolved : 0;
      };

      // Snapshot de folgas já existentes no backend E em memória local para impedir repopulação no mesmo dia.
      // Chave: "{userId}-{yyyy-mm-dd}"
      const dayOffVendorDateKeys = new Set<string>();
      
      // Combine ground truth do backend com estado local em memória (unsaved day-offs)
      const allForOffCheck = [...allExisting, ...allOperations];
      
      for (const op of allForOffCheck) {
        const raw = (op.raw ?? {}) as Record<string, unknown>;
        const rawRouteObj =
          raw.route && typeof raw.route === "object"
            ? (raw.route as Record<string, unknown>)
            : undefined;
        const hasDayOffFlag = isDayOffValue(raw.isDayOff ?? op.isDayOff);
        const hasOffRoute = String(
          op.route ?? raw.routeName ?? rawRouteObj?.routeName ?? ""
        ).toUpperCase() === "OFF";

        if (!hasDayOffFlag && !hasOffRoute) continue;

        const userId = getVendorIdFromWeekPlanner(op);
        if (!userId || !op.date) continue;
        dayOffVendorDateKeys.add(`${userId}-${op.date}`);
      }
      const isVendorDayOffOnDate = (userId: number, dateStr: string): boolean => {
        return dayOffVendorDateKeys.has(`${userId}-${dateStr}`);
      };
      
      // 2. Iterate over the fresh list from the API to collect IDs to delete.
      // Rule: delete records with status 'Working' or 'NotAllocated' whose date is
      // strictly AFTER today (i.e. >= tomorrow) and within the selected week range.
      // We do NOT delete today's records because datesToProcess also starts from tomorrow.
      for (const op of allExisting) {
        if (op.weekPlannerId == null || op.weekPlannerId <= 0) continue;
        if (isManagementSupportOperation(op)) continue;

        const raw = (op.raw ?? {}) as Record<string, unknown>;
        const statusRaw = raw.status != null ? String(raw.status).trim() : String(op.status ?? "").trim();
        const isWorking = statusRaw === BUSINESS_RULES.WORKING_STATUS.WORKING;
        const isNotAllocated = isNotAllocatedStatus(op);

        // Normalize date to yyyy-mm-dd format for correct comparison
        const opDateKey = String(op.date || "").split('T')[0];

        // Only delete records from tomorrow onwards (consistent with datesToProcess).
        const dateIsAfterToday = opDateKey > todayStr;

        const shouldDelete = dateIsAfterToday && (isWorking || isNotAllocated);

        if (shouldDelete && opDateKey >= weekStartStr && opDateKey <= weekEndStr) {
          idsToDelete.add(op.weekPlannerId);
        }
      }


      if (idsToDelete.size > 0) {
        await deleteWeekPlannersBulk({ weekPlannerIds: Array.from(idsToDelete) });
      }

      // Clear memory for exactly the dates we will repopulate (datesToProcessStr) to avoid duplicates and stale data
      const datesToProcessStr = new Set(datesToProcess.map((d) => formatDate(d, "yyyy-mm-dd")));
      
      const remainingOperations = allOperations.filter((op) => {
        // Keep Management & Support rows AND Day Off rows. Drop only week-planner rows on days being repopulated.
        const dateKey = String(op.date || "").split('T')[0]; // Normalize date to yyyy-mm-dd format
        if (!datesToProcessStr.has(dateKey)) return true;
        
        const raw = (op.raw ?? {}) as Record<string, unknown>;
        const rawRouteObj =
          raw.route && typeof raw.route === "object"
            ? (raw.route as Record<string, unknown>)
            : undefined;
        const hasDayOffFlag = isDayOffValue(raw.isDayOff ?? op.isDayOff);
        const hasOffRoute = String(
          op.route ?? raw.routeName ?? rawRouteObj?.routeName ?? ""
        ).toUpperCase() === "OFF";

        return isManagementSupportOperation(op) || hasDayOffFlag || hasOffRoute;
      });
      setAllOperations(remainingOperations);
      
      // Do NOT clear day-off entries in memory as they are preserved in remainingOperations
      // setDayOffEntries((prev) => prev.filter((entry) => !datesToProcessStr.has(entry.date)));

      const operationsBase = [...remainingOperations];

      // Merge locally created management records (avoid duplicates by date+user+function).
      const managementKeyOf = (op: WeekPlannerRecord): string | null => {
        if (!isManagementSupportOperation(op)) return null;
        const raw = (op.raw ?? {}) as Record<string, unknown>;
        const dateKey = String(op.date ?? raw.date ?? "").split("T")[0];
        const assigneeId = Number(raw.userId ?? raw.userId ?? 0);
        const functionId = Number(raw.managementTeamFunctionId ?? 0);
        if (!dateKey || !Number.isFinite(assigneeId) || assigneeId <= 0) return null;
        return `${dateKey}|${assigneeId}|${functionId}`;
      };

      const existingManagementKeys = new Set<string>();
      for (const op of operationsBase) {
        const key = managementKeyOf(op);
        if (key) existingManagementKeys.add(key);
      }
      for (const op of createdManagementSupportLocal) {
        const key = managementKeyOf(op);
        if (!key || existingManagementKeys.has(key)) continue;
        existingManagementKeys.add(key);
        operationsBase.push(op);
      }

      const getVehicleDepositId = (vehicle: Record<string, unknown>): number => {
        const vehicleRecord = vehicle as Record<string, unknown>;
        const deposit = vehicleRecord.deposit as Record<string, unknown> | undefined;
        const direct = Number(
          vehicleRecord.depositId ??
          vehicleRecord.depotId ??
          (deposit?.depositId) ??
          0
        );
        return Number.isFinite(direct) ? direct : 0;
      };

      const isVehicleActive = (vehicle: Record<string, unknown>): boolean => {
        const activeRaw = vehicle.active;
        return (
          activeRaw === true ||
          activeRaw === 1 ||
          activeRaw === "1" ||
          String(activeRaw).toLowerCase() === "true"
        );
      };

      const getVehicleId = (vehicle: Record<string, unknown>): number => {
        const id = Number(vehicle.vehicleId ?? vehicle.vehicleId ?? 0);
        return Number.isFinite(id) ? id : 0;
      };

      // Create a Set of all active vehicle IDs for quick lookup
      const activeVehicleIdsSet = new Set<number>();

      // Organize active vehicles by deposit
      const activeVehiclesByDeposit = new Map<number, number[]>();
      const activeVehicleIdsFallback: number[] = [];
      for (const v of vehiclesRaw) {
        if (!isVehicleActive(v)) continue;
        const vehicleId = getVehicleId(v);
        if (!vehicleId) continue;
        activeVehicleIdsSet.add(vehicleId); // Track all active vehicles
        const depositId = getVehicleDepositId(v);
        if (depositId > 0) {
          const list = activeVehiclesByDeposit.get(depositId) || [];
          list.push(vehicleId);
          activeVehiclesByDeposit.set(depositId, list);
        } else {
          activeVehicleIdsFallback.push(vehicleId);
        }
      }

      const getAssignedVendorIdsForDate = (dateStr: string, extra: WeekPlannerRecord[] = []) => {
        const ids = new Set<number>();
        const all = [...operationsBase, ...extra];
        for (const op of all) {
          if (op.date !== dateStr) continue;
          const raw = (op.raw || {}) as Record<string, unknown>;
          const userId = Number(raw.userId ?? 0);
          if (Number.isFinite(userId) && userId > 0) ids.add(userId);
        }
        return ids;
      };

      const isRouteAssignedOnDate = (routeId: number, dateStr: string, extra: WeekPlannerRecord[] = []) => {
        const all = [...operationsBase, ...extra];
        return all.some((op) => {
          if (op.date !== dateStr) return false;
          const raw = (op.raw || {}) as Record<string, unknown>;
          const opRouteId = Number(raw.routeId ?? raw.routeDefaultId ?? 0);
          return Number.isFinite(opRouteId) && opRouteId === routeId;
        });
      };

      const usedVehicleIdsByDate = (dateStr: string, extra: WeekPlannerRecord[] = []) => {
        const used = new Set<number>();
        const all = [...operationsBase, ...extra];
        for (const op of all) {
          if (op.date !== dateStr) continue;
          const raw = (op.raw || {}) as Record<string, unknown>;
          const vehicleId = Number(raw.vehicleId ?? 0);
          if (Number.isFinite(vehicleId) && vehicleId > 0) used.add(vehicleId);
        }
        return used;
      };

      // Vehicles used on this date by other vendors (exclude vendor so same vendor can reuse their vehicle)
      const usedVehicleIdsByDateExcludingVendor = (dateStr: string, excludeVendorId: number, extra: WeekPlannerRecord[] = []) => {
        const used = new Set<number>();
        const all = [...operationsBase, ...extra];
        for (const op of all) {
          if (op.date !== dateStr) continue;
          const raw = (op.raw || {}) as Record<string, unknown>;
          const opVendorId = Number(raw.userId ?? 0);
          if (opVendorId === excludeVendorId) continue;
          const vehicleId = Number(raw.vehicleId ?? 0);
          if (Number.isFinite(vehicleId) && vehicleId > 0) used.add(vehicleId);
        }
        return used;
      };

      const pickVehicleForDeposit = (depositId: number | undefined, dateStr: string, extra: WeekPlannerRecord[], excludeVendorId?: number) => {
        const used = excludeVendorId != null
          ? usedVehicleIdsByDateExcludingVendor(dateStr, excludeVendorId, extra)
          : usedVehicleIdsByDate(dateStr, extra);
        const pool = (depositId && activeVehiclesByDeposit.get(depositId)) || activeVehicleIdsFallback;
        if (!pool || pool.length === 0) return undefined;
        const firstUnused = pool.find((id) => !used.has(id));
        return firstUnused;
      };

      const getVehiclePlateAndModel = (vehicleId: number): { plate: string; model: string } => {
        if (!vehicleId || !Number.isFinite(vehicleId)) return { plate: "", model: "" };
        const v = vehiclesRaw.find((ve) => getVehicleId(ve as Record<string, unknown>) === vehicleId) as Record<string, unknown> | undefined;
        if (!v) return { plate: "", model: "" };
        const plate = String(
          v.vehicleregistrationPlate ??
          v.vehicleDefaultRegistrationPlate ??
          v.registrationPlate ??
          v.registrationPlates ??
          ""
        ).trim();
        const model = String(
          v.vehicleModel ??
          v.vehicleDefaultModel ??
          v.model ??
          ""
        ).trim();
        return { plate, model };
      };

      // Check against cleared operations + newAssignments (not allOperations — state updates async, so allOperations would still be stale and skip other days)
      const assignmentAlreadyExists = (userId: number, routeId: number, dateStr: string, extra: WeekPlannerRecord[] = []): boolean => {
        const list = [...operationsBase, ...extra];
        return list.some((op) => {
          if (op.date !== dateStr) return false;
          const opRaw = (op.raw || {}) as Record<string, unknown>;
          const opVendorId = Number(opRaw.userId ?? 0);
          if (opVendorId !== userId) return false;
          let opRouteId: number | null = null;
          if (opRaw.route && typeof opRaw.route === "object") {
            const routeObj = opRaw.route as Record<string, unknown>;
            opRouteId = routeObj.routeId != null ? Number(routeObj.routeId) : (routeObj.routeDefaultId != null ? Number(routeObj.routeDefaultId) : null);
          } else if (opRaw.routeId != null) {
            opRouteId = Number(opRaw.routeId);
          } else if (opRaw.routeDefaultId != null) {
            opRouteId = Number(opRaw.routeDefaultId);
          }
          return opRouteId !== null && opRouteId === routeId;
        });
      };

      // Create assignments for each vendor that has a route matching a CORE route
      const newAssignments: WeekPlannerRecord[] = [];
      let vendorsMatched = 0;
      const isSpareVendorType = (vendorTypeId: unknown): boolean => Number(vendorTypeId ?? 0) === BUSINESS_RULES.DRIVER_TYPE.SPARE;

      for (const vendor of vendors) {
        const vendorRouteId = Number((vendor as Record<string, unknown>).routeId ?? (vendor as Record<string, unknown>).routeId);

        if (!vendorRouteId) {
          continue;
        }

        // Prefer exact routeId match so vendor appears under the correct route row (e.g. routeId 10, not another route with routeDefaultId 10)
        // Falls back to the vendor's directly-assigned flex route when there's no core-route match.
        const matchingRoute =
          coreRoutes.find((r) => Number(r.routeId || 0) === vendorRouteId) ||
          coreRoutes.find((r) => Number((r as RouteWithDefault).routeDefaultId || 0) === vendorRouteId) ||
          directFlexRoutes.find((r) => Number(r.routeId || 0) === vendorRouteId) ||
          directFlexRoutes.find((r) => Number((r as RouteWithDefault).routeDefaultId || 0) === vendorRouteId);

        if (!matchingRoute) {
          continue;
        }

        vendorsMatched++;
        const fullName = `${vendor.name || ""} ${vendor.lastName || ""}`.trim();
        const userId = Number(vendor.userId ?? 0);

        if (!userId) {
          continue;
        }

        // Rule: do not auto-generate in-memory items for Spare Vendor (vendorTypeId 7)
        if (isSpareVendorType(vendor.vendorTypeId)) {
          continue;
        }

        // Create assignment for each day of the week (excluding weekends if requested)
        for (const dayDate of datesToProcess) {
          const dateStr = formatDate(dayDate, "yyyy-mm-dd");

          // If this vendor has Management & Support on this date, skip week-planner generation.
          if (managementSupportVendorDateKeys.has(`${userId}-${dateStr}`)) {
            continue;
          }

          // Regra: se o vendor já possui item OFF/isDayOff nesse dia, não popular em memória.
          if (isVendorDayOffOnDate(userId, dateStr)) {
            continue;
          }

          // Check against cleared ops + newAssignments (not allOperations — state is stale in same run)
          if (assignmentAlreadyExists(userId, vendorRouteId, dateStr, newAssignments)) {
            continue; // Skip if already exists
          }

          // Check if there's already ANY vendor assigned to this route on this day - only one vendor per route per day allowed
          // EXCEPT for BRTE (routeId 55) which allows multiple vendors per route per day
          const isBRTELoop = isBRTEVendorRoute(vendorRouteId, matchingRoute);
          const existingAssignmentsOnRouteAndDate = !isBRTELoop ? operationsBase.filter(
            (op) => {
              if (op.date !== dateStr) return false;
              // Check if it's the same route
              const opRouteId = op.raw?.routeId || op.raw?.routeDefaultId;
              const opRouteStr = String(op.route || '');
              return (
                opRouteId === vendorRouteId ||
                Number(opRouteId) === Number(vendorRouteId) ||
                opRouteStr === String(vendorRouteId) ||
                opRouteStr === String(matchingRoute?.routeName) ||
                opRouteStr === String(matchingRoute?.routeDefaultName)
              );
            }
          ) : [];

          if (existingAssignmentsOnRouteAndDate.length > 0) {
            // Skip this vendor if there's already a vendor assigned to this route on this day
            continue;
          }

          // Determine deposit for this route (so assignments show under the right deposit sections)
          const depositIdForAssignment = matchingRoute.depositId ? Number(matchingRoute.depositId) : undefined;
          const depositNameForAssignment =
            depositIdForAssignment && plannerData?.depositsWithRoutes?.length
              ? plannerData.depositsWithRoutes.find((d) => d.depositId === depositIdForAssignment)?.depositName
              : undefined;

          // Get routeId - use vendor's routeId
          const routeId = vendorRouteId;

          // Note: flex routes ARE allowed here — this branch only ever matches when the vendor's
          // own routeId is directly assigned to `matchingRoute` (see directFlexRoutes fallback above),
          // which is the one case where auto-scheduling a flex route is intended. Flex routes are
          // still excluded from the generic second-pass fallback below (any-available-vendor fill).

          // Get default vehicleId from vendor/vendor.
          // Fallback to vendors table if BFF vendor API returns null/0 for vehicleId.
          const vendorDefaultVehicleId =
            Number((vendor as Record<string, unknown>).vehicleId) ||
            vendorVehicleMap.get(userId) ||
            undefined;

          // Vehicles used on this date by other vendors (same vendor can reuse their vehicle)
          const usedVehiclesOnDateByOthers = usedVehicleIdsByDateExcludingVendor(dateStr, userId, newAssignments);

          // Determine final vehicleId - prioritize vendor's default vehicle, then pick from active available vehicles
          let finalVehicleId: number | undefined = undefined;

          // Step 1: Check if vendor has a default vehicle and if it's available (active AND not in use by another vendor)
          if (vendorDefaultVehicleId &&
            Number.isFinite(vendorDefaultVehicleId) &&
            vendorDefaultVehicleId > 0 &&
            activeVehicleIdsSet.has(vendorDefaultVehicleId) &&
            !usedVehiclesOnDateByOthers.has(vendorDefaultVehicleId)) {
            // Use vendor's default vehicle if it's active and available (or already used by this vendor)
            finalVehicleId = vendorDefaultVehicleId;
          } else {
            // Step 2: Vendor doesn't have default vehicle OR default vehicle is not available
            // Pick an available active vehicle from the deposit pool (exclude only vehicles used by other vendors)
            finalVehicleId = pickVehicleForDeposit(depositIdForAssignment, dateStr, newAssignments, userId);
          }
          // Step 3: If still no vehicle (e.g. vendor has no vehicleId in DB and pool empty), use first active vehicle not used by others on this date so save won't fail
          if (!finalVehicleId) {
            const pool = [...activeVehicleIdsFallback, ...Array.from(activeVehicleIdsSet)];
            finalVehicleId = pool.find((id) => !usedVehiclesOnDateByOthers.has(id));
          }

          // Create WeekPlannerRecord
          const { plate: vehiclePlate, model: vehicleModel } = finalVehicleId ? getVehiclePlateAndModel(finalVehicleId) : { plate: "", model: "" };
          const registrationPlateValue = vehiclePlate || String((vendor as Record<string, unknown>).vehicleregistrationPlate ?? (vendor as Record<string, unknown>).vehicleDefaultRegistrationPlate ?? (vendor as Record<string, unknown>).registrationPlate ?? "").trim();
          const vehicleNameValue = vehicleModel || String((vendor as Record<string, unknown>).vehicleModel ?? (vendor as Record<string, unknown>).vehicleDefaultModel ?? "").trim();

          const assignment: WeekPlannerRecord = {
            weekPlannerId: 0, // Will be assigned by backend
            date: dateStr,
            route: String(matchingRoute.routeName || matchingRoute.routeId || ""),
            name: fullName,
            routeSort: "",
            adhocSort: "",
            notes: "",
            reason: "", // DB schema has no "reason" column; keep it embedded in notes instead
            vehicle: vehicleNameValue,
            registrationPlate: registrationPlateValue,
            status: BUSINESS_RULES.WORKING_STATUS.WORKING,
            isDayOff: "false",
            isSort: "true",
            raw: {
              date: dateStr,
              userId: userId,
              routeId: routeId,
              routeDefaultId: (matchingRoute as RouteWithDefault).routeDefaultId ?? matchingRoute.routeId ?? routeId,
              vehicleId: finalVehicleId && Number.isFinite(finalVehicleId) && finalVehicleId > 0 ? finalVehicleId : undefined,
              vehicleregistrationPlate: registrationPlateValue || undefined,
              vehicleDefaultRegistrationPlate: registrationPlateValue || undefined,
              registrationPlate: registrationPlateValue || undefined,
              depositId: depositIdForAssignment,
              depositName: depositNameForAssignment,
              status: BUSINESS_RULES.WORKING_STATUS.WORKING,
              isDayOff: false,
              ...(registrationPlateValue ? { vehicle: { vehicleregistrationPlate: registrationPlateValue, vehicleDefaultRegistrationPlate: registrationPlateValue, registrationPlate: registrationPlateValue } } : {}),
            },
          };

          newAssignments.push(assignment);
        }
      }

      // Second pass: while there are routes without a vendor, assign available vendors from the same deposit
      type VendorCandidate = {
        userId: number;
        fullName: string;
        costModelId: number;
        vendorTypeId?: number;
        preferredVehicleId?: number;
        routeSortValue?: number | string | null;
        depositId: number;
      };

      const depositNameById = new Map<number, string>();
      if (plannerData?.depositsWithRoutes?.length) {
        plannerData.depositsWithRoutes.forEach((d) => {
          depositNameById.set(d.depositId, d.depositName);
        });
      }

      const vendorsByDeposit = new Map<number, VendorCandidate[]>();
      const vendorsWithoutDeposit: VendorCandidate[] = [];

      for (const v of vendors) {
        const vRecord = v as Record<string, unknown>;
        const userId = Number(vRecord.userId ?? vRecord.userId ?? 0);
        const routeId = Number(vRecord.routeId ?? 0);
        const costModelId = Number(vRecord.costModelId ?? 0);
        if (!userId || !costModelId) continue; // Only require userId and costModelId
        if (isSpareVendorType(vRecord.vendorTypeId ?? vRecord.vendorTypeId)) continue;

        const fullName = `${String(vRecord.name || "")} ${String(vRecord.lastName || "")}`.trim();

        let depositId = 0;

        // Try to infer deposit from route if vendor has a route
        if (routeId) {
          const route = routes.find((r) => Number(r.routeId || 0) === routeId || Number((r as RouteWithDefault).routeDefaultId || 0) === routeId);
          depositId = Number(route?.depositId ?? 0);
        }

        // If still no deposit, try to find from any route in the system or use a default
        // For now, we'll add to a fallback list and assign to routes that need vendors
        if (!depositId) {
          // Will be assigned to routes in need
          vendorsWithoutDeposit.push({
            userId,
            fullName,
            costModelId,
            vendorTypeId: Number(vRecord.vendorTypeId ?? vRecord.vendorTypeId) || undefined,
            preferredVehicleId: Number(vRecord.vehicleId) || vendorVehicleMap.get(userId) || undefined,
            routeSortValue: (typeof vRecord.routeSortValue === 'string' || typeof vRecord.routeSortValue === 'number')
              ? vRecord.routeSortValue
              : null,
            depositId: 0, // Will be determined when assigned to a route
          });
          continue;
        }

        const candidate: VendorCandidate = {
          userId,
          fullName,
          costModelId,
          vendorTypeId: Number(vRecord.vendorTypeId ?? vRecord.vendorTypeId) || undefined,
          preferredVehicleId: Number(vRecord.vehicleId) || vendorVehicleMap.get(userId) || undefined,
          routeSortValue: (typeof vRecord.routeSortValue === 'string' || typeof vRecord.routeSortValue === 'number')
            ? vRecord.routeSortValue
            : null,
          depositId,
        };
        const list = vendorsByDeposit.get(depositId) || [];
        list.push(candidate);
        vendorsByDeposit.set(depositId, list);
      }

      // Build core routes by deposit
      const coreRoutesByDeposit = new Map<number, typeof coreRoutes>();
      for (const r of coreRoutes) {
        const depositId = Number(r.depositId ?? 0);
        if (!depositId) {
          console.warn(`[Generate Week] Route ${r.routeId} (${r.routeName}) has no depositId, skipping in second pass`);
          continue;
        }
        const list = coreRoutesByDeposit.get(depositId) || [];
        list.push(r);
        coreRoutesByDeposit.set(depositId, list);
      }

      let secondPassCount = 0;

      // Collect all available vendors across all deposits for fallback
      const allAvailableVendorsForWeek: VendorCandidate[] = [];
      for (const candidates of vendorsByDeposit.values()) {
        allAvailableVendorsForWeek.push(...candidates);
      }
      allAvailableVendorsForWeek.push(...vendorsWithoutDeposit);

      // Second pass: iterate through ALL days first, then ALL deposits, then ALL routes
      // This ensures we process every route for every day in every deposit
      for (const dayDate of datesToProcess) {
        const dateStr = formatDate(dayDate, "yyyy-mm-dd");
        // Initialize assigned vendors for this day (includes first pass assignments)
        const assignedVendorsForDay = getAssignedVendorIdsForDate(dateStr, newAssignments);

        // Process all deposits for this day
        for (const [depositId, depositRoutes] of coreRoutesByDeposit.entries()) {
          // Get candidates from this deposit first, then use all available as fallback
          const depositCandidates = vendorsByDeposit.get(depositId) || [];
          // Always use all available vendors as fallback to ensure we can fill all routes
          const allCandidatesForDeposit = [...depositCandidates, ...allAvailableVendorsForWeek];
          // Remove duplicates based on userId
          const uniqueCandidates = Array.from(
            new Map(allCandidatesForDeposit.map(c => [c.userId, c])).values()
          );

          // Fill routes without vendor for this deposit/day
          for (const route of depositRoutes) {
            const routeId = Number(route.routeId ?? 0);
            if (!routeId) continue;
            if (isFlexRoute(route)) continue;

            if (isRouteAssignedOnDate(routeId, dateStr, newAssignments)) {
              continue;
            }

            // Get available vendors (not assigned yet) - filter dynamically for each route
            // Prioritize candidates from the same deposit
            const sameDepositCandidates = uniqueCandidates.filter(
              (c) =>
                !assignedVendorsForDay.has(c.userId) &&
                c.depositId === depositId &&
                !managementSupportVendorDateKeys.has(`${c.userId}-${dateStr}`) &&
                !isVendorDayOffOnDate(c.userId, dateStr)
            );
            const otherDepositCandidates = uniqueCandidates.filter(
              (c) =>
                !assignedVendorsForDay.has(c.userId) &&
                c.depositId !== depositId &&
                !managementSupportVendorDateKeys.has(`${c.userId}-${dateStr}`) &&
                !isVendorDayOffOnDate(c.userId, dateStr)
            );

            // Try same deposit first, then fallback to other deposits
            const candidate = sameDepositCandidates[0] || otherDepositCandidates[0];
            const finalDepositId = depositId; // Always use route's deposit

            if (!candidate) {
              // Log when we can't find a candidate for debugging
              continue; // No available vendors for this route/day, skip to next route
            }

            // Mark vendor as assigned immediately to prevent duplicate assignments
            assignedVendorsForDay.add(candidate.userId);

            // Vehicles used on this date by other vendors (same vendor can reuse their vehicle)
            const usedVehiclesOnDateByOthers = usedVehicleIdsByDateExcludingVendor(dateStr, candidate.userId, newAssignments);

            // Determine vehicle - prioritize vendor's default vehicle, then pick from active available vehicles
            let finalVehicleId: number | undefined = undefined;

            // Step 1: Check if vendor has a default vehicle and if it's available (active AND not in use by another vendor)
            if (candidate.preferredVehicleId &&
              Number.isFinite(candidate.preferredVehicleId) &&
              candidate.preferredVehicleId > 0 &&
              activeVehicleIdsSet.has(candidate.preferredVehicleId) &&
              !usedVehiclesOnDateByOthers.has(candidate.preferredVehicleId)) {
              // Use vendor's default vehicle if it's active and available (or already used by this vendor)
              finalVehicleId = candidate.preferredVehicleId;
            } else {
              // Step 2: Vendor doesn't have default vehicle OR default vehicle is not available
              // Pick an available active vehicle from the route's deposit pool (exclude only vehicles used by other vendors)
              finalVehicleId = pickVehicleForDeposit(finalDepositId, dateStr, newAssignments, candidate.userId);
            }

            const vehicleId = finalVehicleId;
            const depositNameForAssignment = depositNameById.get(finalDepositId);

            const { plate: secondPassPlate, model: secondPassModel } = vehicleId ? getVehiclePlateAndModel(vehicleId) : { plate: "", model: "" };

            const assignment: WeekPlannerRecord = {
              weekPlannerId: 0,
              date: dateStr,
              route: String(route.routeName || route.routeId || ""),
              name: candidate.fullName,
              routeSort: "",
              adhocSort: "",
              notes: "",
              reason: "",
              vehicle: secondPassModel,
              registrationPlate: secondPassPlate,
              status: BUSINESS_RULES.WORKING_STATUS.WORKING,
              isDayOff: "false",
              isSort: "true",
              raw: {
                date: dateStr,
                userId: candidate.userId,
                routeId: routeId,
                vehicleId: vehicleId && Number.isFinite(vehicleId) && vehicleId > 0 ? vehicleId : undefined,
                vehicleregistrationPlate: secondPassPlate || undefined,
                vehicleDefaultRegistrationPlate: secondPassPlate || undefined,
                registrationPlate: secondPassPlate || undefined,
                depositId: finalDepositId,
                depositName: depositNameForAssignment,
                status: BUSINESS_RULES.WORKING_STATUS.WORKING,
                isDayOff: false,
                ...(secondPassPlate ? { vehicle: { vehicleregistrationPlate: secondPassPlate, vehicleDefaultRegistrationPlate: secondPassPlate, registrationPlate: secondPassPlate } } : {}),
              },
            };

            newAssignments.push(assignment);
            secondPassCount++;
          }
        }
      }

      const routesFilledInFirstPass = new Set<string>();
      const routesFilledInSecondPass = new Set<string>();

      // Count routes filled in first pass
      for (const vendor of vendors) {
        const vendorRouteId = Number((vendor as Record<string, unknown>).routeId ?? (vendor as Record<string, unknown>).routeId);
        if (!vendorRouteId) continue;
        const matchingRoute =
          coreRoutes.find((r) => Number(r.routeId || 0) === vendorRouteId) ||
          coreRoutes.find((r) => Number((r as RouteWithDefault).routeDefaultId || 0) === vendorRouteId);
        if (matchingRoute) {
          for (const dayDate of datesToProcess) {
            const dateStr = formatDate(dayDate, "yyyy-mm-dd");
            if (assignmentAlreadyExists(Number(vendor.userId ?? 0), vendorRouteId, dateStr, newAssignments)) {
              routesFilledInFirstPass.add(`${matchingRoute.depositId}-${vendorRouteId}-${dateStr}`);
            }
          }
        }
      }

      // Count routes filled in second pass
      for (const assignment of newAssignments) {
        const raw = assignment.raw as Record<string, unknown>;
        const routeId = Number(raw.routeId ?? 0);
        const depositId = Number(raw.depositId ?? 0);
        if (routeId && depositId) {
          const key = `${depositId}-${routeId}-${assignment.date}`;
          if (!routesFilledInFirstPass.has(key)) {
            routesFilledInSecondPass.add(key);
          }
        }
      }

      if (newAssignments.length === 0) {
        if (vendorsMatched === 0) {
          setInfoModalData({
            type: 'warning',
            title: 'No Vendors Matched',
            message: 'No vendors found with active core routes.',
            details: 'Please check vendor route assignments to ensure they are assigned to core routes (flex and adhoc routes are not automatically fulfilled).'
          });
        } else {
          setInfoModalData({
            type: 'info',
            title: 'No New Assignments',
            message: `All assignments already exist for this week.`,
            details: ''
          });
        }
        setShowInfoModal(true);
        return;
      }

      // Add new assignments to state (use operationsBase so deleted items stay removed)
      setAllOperations([...operationsBase, ...newAssignments]);

      const daysProcessed = excludeWeekends ? 5 : 7;
      const firstPassCount = newAssignments.length - secondPassCount;
      setInfoModalData({
        type: 'success',
        title: 'Default Schedule Created',
        message: `Successfully created ${newAssignments.length} default schedule assignments.`,
        details: `Management & Support created first: ${createdManagementSupportCount}. Primary assignments: ${firstPassCount}, Secondary pass (filling empty routes): ${secondPassCount}. Assignments created for ${vendorsMatched} vendor(s) across ${daysProcessed} day(s)${excludeWeekends ? ' (weekdays only)' : ''} of the week.`
      });
      setShowInfoModal(true);
    } catch (error) {
      console.error("Error creating default schedule:", error);
      if (
        error instanceof Error &&
        (error.message.includes("Invalid token") || error.message.includes("Authentication token not found"))
      ) {
        handleAuthError(error.message);
        return;
      }
      setInfoModalData({
        type: 'error',
        title: 'Error Creating Default Schedule',
        message: error instanceof Error ? error.message : "Failed to create default schedule.",
        details: 'Please try again or contact support if the problem persists.'
      });
      setShowInfoModal(true);
    }
  }, [routes, selectedDate, fetchVendorsRaw, handleAuthError, setAllOperations, setRefreshTrigger, allOperations, plannerData.depositsWithRoutes, isWeekLocked, bankHolidays]);

  // Handle save week - POST to /week-planners/bulk
  const handleSaveWeek = useCallback(async () => {
    if (isSupervisorReadonly) {
      showSupervisorReadonlyMessage();
      return;
    }

    if (isWeekLocked) {
      // Só permitir salvar quando existir geração em memória para os dias seguintes
      // (o próprio Generate Week cria week-planner em memória com `weekPlannerId` <= 0).
      const normalizeDateOnly = (v: unknown): string => {
        const s = String(v ?? "").trim();
        if (!s) return "";
        const base = s.includes("T") ? s.split("T")[0] : s;
        return base.slice(0, 10);
      };

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDate(tomorrow, "yyyy-mm-dd");

      const weekDates = getWeekDates(selectedDate);
      const futureDatesStr = new Set(
        weekDates
          .map((d) => formatDate(d, "yyyy-mm-dd"))
          .filter((d) => d >= tomorrowStr),
      );

      const hasPendingInMemoryFuture = allOperations.some((op) => {
        const opDate = normalizeDateOnly(op.date);
        if (!opDate || !futureDatesStr.has(opDate)) return false;
        // New in-memory record (weekPlannerId <= 0)
        if (!(typeof op.weekPlannerId === "number" && op.weekPlannerId > 0)) return true;
        // Existing record locally modified (e.g. NotAllocated reassigned to a route)
        return Boolean((op.raw as Record<string, unknown>)?.__locallyModified);
      });

      if (!hasPendingInMemoryFuture) {
        setInfoModalData({
          type: 'info',
          title: 'Week locked',
          message: 'This week is already saved. Save Week is disabled until you refresh or unlock the week.',
        });
        setShowInfoModal(true);
        return;
      }
      // If we reach here, allow saving even if locked (overwrite future days created by Generate Week).
    }

    if (!API_BASE_URL) {
      setInfoModalData({
        type: 'error',
        title: 'Configuration Error',
        message: 'API URL is not configured.',
      });
      setShowInfoModal(true);
      return;
    }

    // Session validation handled by API.

    try {
      // Calculate week start and end dates
      const weekStartDate = getWeekStart(selectedDate);
      const weekEndDate = getWeekEnd(selectedDate);
      const weekDates: string[] = [];
      for (let d = new Date(weekStartDate); d <= weekEndDate; d.setDate(d.getDate() + 1)) {
        weekDates.push(formatDate(d, "yyyy-mm-dd"));
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDate(tomorrow, "yyyy-mm-dd");
      const futureDatesStrSet = new Set(weekDates.filter((d) => d >= tomorrowStr));

      const toPositiveNumber = (value: unknown): number | null => {
        const n = Number(value);
        return Number.isFinite(n) && n > 0 ? n : null;
      };
      const createdByUserId = toPositiveNumber(getUserIdFromToken());
      const normalizeDateOnlyKey = (value: unknown): string => {
        const s = String(value ?? "").trim();
        if (!s) return "";
        return (s.includes("T") ? s.split("T")[0] : s).slice(0, 10);
      };
      const toFiniteNumberOrNull = (value: unknown): number | null => {
        if (value === null || value === undefined || value === "") return null;
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
      };
      const buildDgpKey = (args: {
        date: unknown;
        userId: unknown;
        routeId: unknown;
        vehicleId: unknown;
        adhocServiceId?: unknown;
        depositId?: unknown;
        adhocSort?: unknown;
      }): string => {
        const date = normalizeDateOnlyKey(args.date);
        const userId = toFiniteNumberOrNull(args.userId);
        const routeId = toFiniteNumberOrNull(args.routeId);
        const vehicleId = toFiniteNumberOrNull(args.vehicleId);
        const adhocServiceId = toFiniteNumberOrNull(args.adhocServiceId);
        const depositId = toFiniteNumberOrNull(args.depositId);
        const adhocSort = toFiniteNumberOrNull(args.adhocSort);
        return `${date}|${userId ?? "null"}|${routeId ?? "null"}|${vehicleId ?? "null"}|${adhocServiceId ?? "null"}|${depositId ?? "null"}|${adhocSort ?? "null"}`;
      };

      // Fetch deposits to map depositId to depositName
      const depositMap = new Map<number, string>();
      const depositsDataArray: Array<{ depositId: number; depositName: string }> = [];
      try {
        const { fetchDepositsWithRoutesFull } = await import('@/lib/api/routes');
        const depositsData = await fetchDepositsWithRoutesFull({ onlyNonFlex: true });
        depositsData.forEach((deposit) => {
          if (deposit.depositId && deposit.depositName) {
            depositMap.set(deposit.depositId, deposit.depositName);
            depositsDataArray.push({ depositId: deposit.depositId, depositName: deposit.depositName });
          }
        });
      } catch (err) {
        console.warn('[handleSaveWeek] Error fetching deposits for depositName mapping:', err);
        // Continue without depositName if fetch fails
      }

      // Validation scope: all deposits currently loaded in week planner view.
      const targetDepositIds = new Set<number>();
      (plannerData.depositsWithRoutes ?? []).forEach((deposit) => {
        const depositId = toPositiveNumber(deposit.depositId);
        if (depositId) {
          targetDepositIds.add(depositId);
        }
      });

      // Fetch ADHOC Services to map adhocServiceId to depositId, depositName
      const adhocServiceDepositNameMap = new Map<number, string>();
      const adhocServiceDepositIdMap = new Map<number, number>();
      try {
        const { fetchAdhocServices } = await import('@/lib/adhoc-services-api');
        const adhocServices = await fetchAdhocServices();
        adhocServices.forEach((service) => {
          if (service.adhocServiceId) {
            if (service.depositName) {
              adhocServiceDepositNameMap.set(service.adhocServiceId, service.depositName);
            }
            if (service.depositId) {
              adhocServiceDepositIdMap.set(service.adhocServiceId, service.depositId);
            }
          }
        });
      } catch (err) {
        console.warn('[handleSaveWeek] Error fetching ADHOC Services for deposit mapping:', err);
        // Continue without ADHOC Services deposit mapping if fetch fails
      }

      // Collect all assignments for the current week
      const weekAssignments = allOperations.filter((op) => {
        const dateKey = String(op.date || "").split('T')[0]; // Normalize date to yyyy-mm-dd format
        return weekDates.includes(dateKey);
      });

      if (weekAssignments.length === 0) {
        // Caso especial: não há nenhum assignment na semana.
        // Mesmo assim precisamos criar day-off-spare para vendors userTypeId 1 ou 3 ou vendorTypeId 7.
        const baseDatesForSpareNoAssignments = showWeekends ? weekDates : weekDates.filter((d) => !isWeekend(d));
        // Not-allocated: apenas datas futuras (a partir de amanhã)
        const datesForSpareNoAssignments = baseDatesForSpareNoAssignments.filter((d) => futureDatesStrSet.has(d));
        const vendorsFromApiNoAssignments = await fetchVendorsRaw(true);
        const spareVendorsRawNoAssignments = (Array.isArray(vendorsFromApiNoAssignments) ? vendorsFromApiNoAssignments : []).filter((v) => {
          const vt = v as Record<string, unknown>;
          const dt = Number(vt.vendorTypeId ?? vt.vendorTypeId ?? 0);
          const ut = Number(vt.userTypeId ?? vt.userTypeId ?? 0);
          return dt === BUSINESS_RULES.DRIVER_TYPE.SPARE || ut === BUSINESS_RULES.USER_TYPE.ADMIN || ut === BUSINESS_RULES.USER_TYPE.SUPERVISOR;
        });
        const seenSpareUserIdNoAssignments = new Set<number>();
        const spareVendorsNoAssignments = spareVendorsRawNoAssignments.filter((v) => {
          const vt = v as Record<string, unknown>;
          const uid = toPositiveNumber(vt.userId ?? vt.userId);
          if (!uid || seenSpareUserIdNoAssignments.has(uid)) return false;
          seenSpareUserIdNoAssignments.add(uid);
          return true;
        });

        const weekAssignmentsForSpareNoAssignments = allOperations.filter((op) => {
          const dateKey = String(op.date || "").split('T')[0]; // Normalize date to yyyy-mm-dd format
          return weekDates.includes(dateKey);
        });
        const weekPlannerOnlyNoAssignments = weekAssignmentsForSpareNoAssignments.filter((op) => {
          const raw = op.raw as Record<string, unknown> | undefined;
          if (op.weekPlannerId != null && op.weekPlannerId < 0) return false;
          if (raw?.dailyTeamSupportId != null) return false;
          if (raw?.dailyTeamSupportId != null) return false;
          return true;
        });
        const dailyTeamSupportOnlyNoAssignments = weekAssignmentsForSpareNoAssignments.filter((op) => {
          const raw = op.raw as Record<string, unknown> | undefined;
          if (op.weekPlannerId != null && op.weekPlannerId < 0) return true;
          // Verificar ambas as grafias: DB usa "suport" (typo), API pode normalizar para "support"
          if (raw?.dailyTeamSupportId != null) return true;
          if (raw?.dailyTeamSupportId != null) return true;
          return false;
        });

        const userIdsWithWeekPlannerByDateNoAssignments = new Map<string, Set<number>>();
        const userIdsWithDailyTeamSupportByDateNoAssignments = new Map<string, Set<number>>();
        // Fetch fresco da API para evitar race condition com allOperations desatualizado.
        const userIdsWithDailyTeamSupportAnyNoAssignments = new Set<number>();
        try {
          const weekStartNA = formatDate(weekDates[0], 'yyyy-mm-dd');
          const weekEndNA = formatDate(weekDates[weekDates.length - 1], 'yyyy-mm-dd');
          const freshDtsNA = await fetchDailyTeamSupport(weekStartNA, weekEndNA);
          freshDtsNA.forEach((dts) => {
            const raw = dts as unknown as Record<string, unknown>;
            const uId = toPositiveNumber(raw.userId ?? raw.userId);
            if (uId) userIdsWithDailyTeamSupportAnyNoAssignments.add(uId);
          });
        } catch {
          // Fallback: usar dados do estado em memória se o fetch falhar
          dailyTeamSupportOnlyNoAssignments.forEach((op) => {
            const raw = (op.raw ?? {}) as Record<string, unknown>;
            const dId = toPositiveNumber(raw.userId ?? raw.userId);
            const uId = toPositiveNumber(raw.userId ?? raw.userId);
            if (dId) userIdsWithDailyTeamSupportAnyNoAssignments.add(dId);
            if (uId) userIdsWithDailyTeamSupportAnyNoAssignments.add(uId);
          });
        }
        datesForSpareNoAssignments.forEach((d) => {
          userIdsWithWeekPlannerByDateNoAssignments.set(d, new Set());
          userIdsWithDailyTeamSupportByDateNoAssignments.set(d, new Set());
        });

        const addIdsForDateNoAssignments = (dateStr: string, raw: Record<string, unknown>, map: Map<string, Set<number>>) => {
          if (!dateStr) return;
          const set = map.get(dateStr);
          if (!set) return;
          const parsedUserId = toPositiveNumber(raw.userId ?? raw.userId);
          if (parsedUserId) set.add(parsedUserId);
        };

        weekPlannerOnlyNoAssignments.forEach((op) => {
          const dateStr = String(op.date ?? "").slice(0, 10);
          const raw = (op.raw ?? {}) as Record<string, unknown>;
          addIdsForDateNoAssignments(dateStr, raw, userIdsWithWeekPlannerByDateNoAssignments);
        });

        dailyTeamSupportOnlyNoAssignments.forEach((op) => {
          const dateStr = String(op.date ?? "").slice(0, 10);
          const raw = (op.raw ?? {}) as Record<string, unknown>;
          addIdsForDateNoAssignments(dateStr, raw, userIdsWithDailyTeamSupportByDateNoAssignments);
          // userIdsWithDailyTeamSupportAnyNoAssignments já foi populado via fetch fresco da API acima.
          // O forEach aqui mantém userIdsWithDailyTeamSupportByDateNoAssignments por data.
        });

        const dayOffSpareItemsNoAssignments: Array<{ userId: number; date: string }> = [];
        const dayOffSpareKeysNoAssignments = new Set<string>();
        for (const vendor of spareVendorsNoAssignments) {
          const v = vendor as Record<string, unknown>;
          const parsedUserId = toPositiveNumber(v.userId ?? v.userId ?? v.userId ?? v.userId);
          if (!parsedUserId) continue;
          // Management & Support is not a route assignment. Spare/admin/supervisor
          // still need NotAllocated when they have no week-planner route that day.
          for (const dateStr of datesForSpareNoAssignments) {
            const assignedWp = userIdsWithWeekPlannerByDateNoAssignments.get(dateStr);
            const matchId = parsedUserId ?? parsedUserId;
            if (assignedWp?.has(matchId)) continue;
            const key = `${parsedUserId}|${dateStr}`;
            if (dayOffSpareKeysNoAssignments.has(key)) continue;
            dayOffSpareKeysNoAssignments.add(key);
            dayOffSpareItemsNoAssignments.push({ userId: parsedUserId, date: dateStr });
          }
        }

        const uniqueDayOffSpareItemsNoAssignments = Array.from(
          new Map(
            dayOffSpareItemsNoAssignments.map((item) => [`${item.userId}|${item.date}`, item])
          ).values()
        );

        if (uniqueDayOffSpareItemsNoAssignments.length > 0) {
          try {
            const spareRes = await guardedFetch(`${API_BASE_URL}/bff/week-planners/not-allocated`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...getBearerAuthHeader(),
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
              cache: "no-store",
              body: JSON.stringify({ items: uniqueDayOffSpareItemsNoAssignments }),
            });
            if (!spareRes.ok) {
              console.warn("[handleSaveWeek] day-off-spare (no assignments) request failed:", spareRes.status, await spareRes.text());
            } else {
              setRefreshTrigger((prev) => prev + 1);
            }
          } catch (spareErr) {
            console.warn("[handleSaveWeek] day-off-spare (no assignments) request error:", spareErr);
          }
        } else {
          setInfoModalData({
            type: 'info',
            title: 'Nothing to Save',
            message: 'There are no assignments or day-off entries to create for this week.',
            details: 'No week-planner records or spare day-off entries were generated.',
          });
          setShowInfoModal(true);
        }

        return;
      }

      // Rule: save only if every vendor that appears in the week has at least one assignment for each weekday (Mon–Fri; weekends excluded)
      const weekDatesOnly = weekDates.filter((d) => !isWeekend(d));
      const weekPlannerAssignmentsOnly = weekAssignments.filter((op) => {
        const raw = op.raw as Record<string, unknown> | undefined;
        if (op.weekPlannerId != null && op.weekPlannerId < 0) return false; // exclude management support
        if (raw?.dailyTeamSupportId != null) return false;
        return true;
      });
      // Ground truth merge: local memory can be stale right after Generate Week.
      // Include a fresh backend snapshot so validation doesn't block with false "missing" days.
      const freshWeekPlannersForValidation = await fetchAllWeekPlannersForDate(selectedDate);
      const weekPlannerAssignmentsFresh = freshWeekPlannersForValidation.filter((op) => {
        const dateKey = String(op.date ?? "").split("T")[0].slice(0, 10);
        if (!weekDates.includes(dateKey)) return false;
        const raw = (op.raw ?? {}) as Record<string, unknown>;
        if (op.weekPlannerId != null && op.weekPlannerId < 0) return false;
        if (raw?.dailyTeamSupportId != null) return false;
        return true;
      });

      const weekPlannerAssignmentsForValidation = [
        ...weekPlannerAssignmentsOnly,
        ...weekPlannerAssignmentsFresh,
      ];
      const userIdsInWeek = new Set<number>();
      weekPlannerAssignmentsForValidation.forEach((op) => {
        const raw = (op.raw ?? {}) as Record<string, unknown>;
        const opRecord = op as unknown as Record<string, unknown>;
        const userId = toPositiveNumber(raw.userId ?? opRecord.userId);
        if (userId) userIdsInWeek.add(userId);
      });
      const userIdsByDay = new Map<string, Set<number>>();
      weekDates.forEach((d) => userIdsByDay.set(d, new Set()));
      weekPlannerAssignmentsForValidation.forEach((op) => {
        const dateStr = String(op.date ?? "").split("T")[0].slice(0, 10);
        const raw = (op.raw ?? {}) as Record<string, unknown>;
        const opRecord = op as unknown as Record<string, unknown>;
        const userId = toPositiveNumber(raw.userId ?? opRecord.userId);
        if (dateStr && userId) {
          userIdsByDay.get(dateStr)?.add(userId);
        }
      });
      const missingVendorDays: { userId: number; vendorName: string; dates: string[] }[] = [];
      const vendorNameById = new Map<number, string>();
      const spareVendorIds = new Set<number>(); // vendorTypeId 7 - Spare vendors don't need assignments every day
      const managerVendorIds = new Set<number>(); // userTypeId Admin/Supervisor - handled automatically (NotAllocated) by the backend
      weekPlannerAssignmentsForValidation.forEach((op) => {
        const raw = (op.raw ?? {}) as Record<string, unknown>;
        const opRecord = op as unknown as Record<string, unknown>;
        const userId = toPositiveNumber(raw.userId ?? opRecord.userId);
        const name = String(op.name ?? opRecord.name ?? "").trim() || `Vendor ${userId}`;
        if (userId && !vendorNameById.has(userId)) vendorNameById.set(userId, name);
        const vendorTypeId = Number(raw.vendorTypeId ?? (raw.vendorType && typeof raw.vendorType === 'object' ? (raw.vendorType as Record<string, unknown>).vendorTypeId : null) ?? 0);
        if (userId && vendorTypeId === BUSINESS_RULES.DRIVER_TYPE.SPARE) spareVendorIds.add(userId);
        const userTypeId = Number(raw.userTypeId ?? opRecord.userTypeId ?? 0);
        if (userId && (userTypeId === BUSINESS_RULES.USER_TYPE.ADMIN || userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR)) managerVendorIds.add(userId);
      });
      // Fallback: get vendorTypeId/userTypeId from vendors list if not in assignment raw
      vendors.forEach((d) => {
        if (Number(d.vendorTypeId ?? 0) === BUSINESS_RULES.DRIVER_TYPE.SPARE) spareVendorIds.add(Number(d.userId ?? 0));
        const userTypeId = Number(d.userTypeId ?? 0);
        if (userTypeId === BUSINESS_RULES.USER_TYPE.ADMIN || userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR) managerVendorIds.add(Number(d.userId ?? 0));
      });
      const todayStr = new Date().toISOString().slice(0, 10);
      const futureDatesOnly = weekDatesOnly.filter((d) => d > todayStr);
      userIdsInWeek.forEach((userId) => {
        if (spareVendorIds.has(userId)) return; // Spare vendors are exempt
        if (managerVendorIds.has(userId)) return; // Managers (Admin/Supervisor) are handled automatically by the backend
        const missingDates = futureDatesOnly.filter((d) => !userIdsByDay.get(d)?.has(userId));
        if (missingDates.length > 0) {
          missingVendorDays.push({
            userId,
            vendorName: vendorNameById.get(userId) ?? `Vendor ${userId}`,
            dates: missingDates,
          });
        }
      });
      if (missingVendorDays.length > 0) {
        const detailLines = missingVendorDays.map(
          (m) => `${m.vendorName}: missing on ${m.dates.length} day(s) — ${m.dates.slice(0, 3).join(", ")}${m.dates.length > 3 ? "…" : ""}`
        );
        setInfoModalData({
          type: 'warning',
          title: 'Cannot Save Week',
          message: 'Every vendor allocated in the week must have at least one assignment for each weekday (Mon–Fri).',
          details: detailLines.join("\n"),
        });
        setShowInfoModal(true);
        return;
      }

      // Rule: block save when a vendor from /bff/vendors with routeId + depositId
      // is not allocated in week planner.
      const getVendorDisplayName = (vendor: Vendor): string =>
        String(vendor.fullName ?? "").trim() || `Vendor ${vendor.userId}`;

      const routeDepositById = new Map<number, number>();
      routes.forEach((route) => {
        const routeId = toPositiveNumber(route.routeId ?? (route as RouteWithDefault).routeDefaultId);
        const depositId = toPositiveNumber(route.depositId);
        if (routeId && depositId) {
          routeDepositById.set(routeId, depositId);
        }
      });

      const offByVendorAndDate = new Set<string>();
      dayOffEntries.forEach((entry) => {
        const userIdVal = toPositiveNumber(entry.userId);
        const dateKey = String(entry.date ?? "").slice(0, 10);
        if (userIdVal && dateKey) {
          offByVendorAndDate.add(`${userIdVal}|${dateKey}`);
        }
      });
      // Also honor OFF week-planner records already saved in the backend/local state
      // (isDayOff flag or route "OFF"), which may not be mirrored in dayOffEntries.
      weekAssignments.forEach((assignment) => {
        const raw = (assignment.raw ?? {}) as Record<string, unknown>;
        const rawRouteObj = raw.route && typeof raw.route === "object" ? (raw.route as Record<string, unknown>) : undefined;
        const hasDayOffFlag =
          raw.isDayOff === true || raw.isDayOff === "true" || assignment.isDayOff === "true";
        const hasOffRoute =
          String(assignment.route ?? raw.routeName ?? rawRouteObj?.routeName ?? "").toUpperCase() === "OFF";
        if (!hasDayOffFlag && !hasOffRoute) return;

        const userIdVal = toPositiveNumber(raw.userId ?? raw.userId);
        const dateKey = String(assignment.date ?? "").slice(0, 10);
        if (userIdVal && dateKey) {
          offByVendorAndDate.add(`${userIdVal}|${dateKey}`);
        }
      });

      // Chave por data|depositId|vendorId (sem routeId): em depósitos flex (ex.: BAOP) o
      // vendor pode ser alocado em qualquer rota do depósito, não necessariamente na sua
      // rota padrão — o que importa aqui é estar alocado em ALGUMA rota daquele depósito.
      const allocatedByDateDepositVendor = new Set<string>();
      weekAssignments.forEach((assignment) => {
        const raw = (assignment.raw ?? {}) as Record<string, unknown>;
        const assignmentDate = String(assignment.date ?? "").slice(0, 10);
        const userId = toPositiveNumber(raw.userId ?? raw.userId);
        if (!assignmentDate || !userId) return;

        const routeObj = raw.route && typeof raw.route === "object" ? (raw.route as Record<string, unknown>) : null;
        const routeId =
          toPositiveNumber(raw.routeId ?? raw.routeDefaultId) ??
          toPositiveNumber(routeObj?.routeId ?? routeObj?.routeDefaultId);

        let depositId = toPositiveNumber(raw.depositId ?? raw.depositId);
        if (!depositId) {
          if (routeId) {
            depositId = routeDepositById.get(routeId) ?? null;
          }
        }

        if (depositId) {
          allocatedByDateDepositVendor.add(`${assignmentDate}|${depositId}|${userId}`);
        }
      });

      const freshVendors = await fetchVendors();
      const scopedVendors = freshVendors
        .filter((vendor) => {
          const userId = toPositiveNumber(vendor.userId);
          const routeId = toPositiveNumber(vendor.routeId);
          const depositId = toPositiveNumber(vendor.depositId);
          if (!userId || !routeId || !depositId) return false;
          if (targetDepositIds.size > 0 && !targetDepositIds.has(depositId)) return false;
          // Managers (Admin/Supervisor) e vendors Spare são geridos automaticamente pelo
          // backend (NotAllocated / stand-by) e não devem bloquear o save por falta de alocação.
          const userTypeId = Number(vendor.userTypeId ?? 0);
          if (userTypeId === BUSINESS_RULES.USER_TYPE.ADMIN || userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR) return false;
          const vendorTypeId = Number(vendor.vendorTypeId ?? 0);
          if (vendorTypeId === BUSINESS_RULES.DRIVER_TYPE.SPARE) return false;
          return true;
        })
        .map((vendor) => ({
          userId: Number(vendor.userId),
          fullName: getVendorDisplayName(vendor),
          depositId: Number(vendor.depositId),
          routeId: Number(vendor.routeId),
        }));

      // Generate Week only fills weekdays by default (weekends are opt-in via "Show Weekends"),
      // so the pending-allocation check must scope to the same days, otherwise Sat/Sun always
      // show up as "missing" even though nothing was ever meant to be generated for them.
      const missingByDayAndDeposit = new Map<string, Map<number, string[]>>();
      const datesToValidate = showWeekends ? weekDates : weekDates.filter((d) => !isWeekend(d));
      datesToValidate.forEach((dateStr) => {
        scopedVendors.forEach((vendor) => {
          if (offByVendorAndDate.has(`${vendor.userId}|${dateStr}`)) return;
          const key = `${dateStr}|${vendor.depositId}|${vendor.userId}`;
          if (allocatedByDateDepositVendor.has(key)) return;

          const dayMap = missingByDayAndDeposit.get(dateStr) ?? new Map<number, string[]>();
          const list = dayMap.get(vendor.depositId) ?? [];
          list.push(vendor.fullName);
          dayMap.set(vendor.depositId, list);
          missingByDayAndDeposit.set(dateStr, dayMap);
        });
      });

      if (missingByDayAndDeposit.size > 0) {
        const detailLines: string[] = [];
        for (const [day, depositsMap] of missingByDayAndDeposit.entries()) {
          for (const [depositId, vendorNames] of depositsMap.entries()) {
            const depositName = depositMap.get(depositId) || `Deposit ${depositId}`;
            detailLines.push(`${day} - ${depositName}: ${vendorNames.join(', ')}`);
          }
        }

        setInfoModalData({
          type: 'warning',
          title: 'Cannot Save Week',
          message: 'There are pending allocations for the following day/deposit (vendor without an assignment):',
          details: detailLines.join('\n'),
        });
        setShowInfoModal(true);
        return;
      }

      // First, fetch existing week-planners for this week to check for duplicates
      const initialDate = formatDate(weekStartDate, "yyyy-mm-dd");
      const endDate = formatDate(weekEndDate, "yyyy-mm-dd");
      const existingParams = new URLSearchParams();
      existingParams.append("initialDate", initialDate);
      existingParams.append("endDate", endDate);
      // Supervisor: só buscar do depósito do dailyTeamSupport; se não houver, não há existentes (não chamar API)
      const userTypeId = getUserTypeFromToken();
      const restrictedDepositId = userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR ? await resolveDepositIdForRestrictedUser(initialDate) : null;
      if (userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR && restrictedDepositId != null) {
        existingParams.append("depositId", String(restrictedDepositId));
      }

      const existingResponse =
        userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR && restrictedDepositId == null
          ? { ok: true, json: async () => [] }
          : await guardedFetch(`${API_BASE_URL}/bff/week-planners?${existingParams.toString()}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...getBearerAuthHeader(),
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
            cache: "no-store",
          });

      let existingWeekPlanners: Array<{
        date: string;
        userId: number;
        routeId: number | null;
        adhocServiceId?: number | null;
        depositId?: number | null;
        adhocSort?: number | null;
        weekPlannerId?: number;
      }> = [];

      if (existingResponse.ok) {
        const existingData = await existingResponse.json();
        let existingArray: Record<string, unknown>[] = [];

        if (Array.isArray(existingData)) {
          existingArray = existingData;
        } else if (existingData && typeof existingData === "object") {
          if (Array.isArray(existingData.data)) {
            existingArray = existingData.data;
          } else if (Array.isArray(existingData.weekPlanners)) {
            existingArray = existingData.weekPlanners;
          } else if (Array.isArray(existingData.weekPlanners)) {
            existingArray = existingData.weekPlanners;
          }
        }

        // Create a Set of unique keys for existing week-planners
        // Key format: "date|userId|routeId"
        // The API response has nested structure: route.routeId, date as ISO string
        existingWeekPlanners = existingArray.map((item) => {
          const raw = item as Record<string, unknown>;

          // Normalize date to YYYY-MM-DD format
          // Date comes as ISO string like "2025-12-14T03:00:00.000Z"
          let dateStr = String(raw.date || "");
          if (dateStr.includes('T')) {
            dateStr = dateStr.split('T')[0];
          }
          // Remove any timezone info if present
          dateStr = dateStr.trim();

          // Extract routeId from nested route object
          let routeId: number | null = null;
          if (raw.route && typeof raw.route === 'object') {
            const routeObj = raw.route as Record<string, unknown>;
            routeId = routeObj.routeId ? Number(routeObj.routeId) : null;
          }
          // Fallback to direct routeId if nested doesn't exist
          if (!routeId && raw.routeId) {
            routeId = Number(raw.routeId);
          }

          // Extract adhocServiceId - check multiple possible locations including nested adhocService object
          const adhocServiceObj = raw.adhocService as Record<string, unknown> | undefined;
          const adhocServiceId =
            raw.adhocServiceId !== null && raw.adhocServiceId !== undefined
              ? Number(raw.adhocServiceId)
              : (raw as Record<string, unknown>).adhocServiceId !== null && (raw as Record<string, unknown>).adhocServiceId !== undefined
                ? Number((raw as Record<string, unknown>).adhocServiceId)
                : (adhocServiceObj?.adhocServiceId !== null && adhocServiceObj?.adhocServiceId !== undefined)
                  ? Number(adhocServiceObj.adhocServiceId)
                  : null;

          // depositId is nested inside route (WeekPlannerRouteNestedDTO.depositId)
          // not at the top level of WeekPlannerListDTO — always check route first.
          const routeObjForDeposit = raw.route && typeof raw.route === 'object'
            ? (raw.route as Record<string, unknown>)
            : null;
          const depositId =
            raw.depositId !== null && raw.depositId !== undefined
              ? Number(raw.depositId)
              : routeObjForDeposit?.depositId != null
                ? Number(routeObjForDeposit.depositId)
                : null;
          const adhocSort =
            raw.adhocSort !== null && raw.adhocSort !== undefined
              ? Number(raw.adhocSort)
              : null;

          return {
            date: dateStr,
            userId: Number(raw.userId || 0),
            routeId: routeId,
            adhocServiceId: Number.isFinite(adhocServiceId as number) ? (adhocServiceId as number) : null,
            depositId: Number.isFinite(depositId as number) ? (depositId as number) : null,
            adhocSort: Number.isFinite(adhocSort as number) ? (adhocSort as number) : null,
            weekPlannerId: raw.weekPlannerId ? Number(raw.weekPlannerId) : undefined,
          };
        });
      }

      const buildKey = (args: {
        date: string;
        userId: number;
        routeId: number | null;
        adhocServiceId?: number | null;
        depositId?: number | null;
        adhocSort?: number | null;
      }) => {
        const normalizedDate = args.date.trim().slice(0, 10);
        const baopLine = args.adhocSort != null && Number.isFinite(args.adhocSort)
          ? `|baopLine:${args.adhocSort}`
          : "";
        if (args.adhocServiceId && Number.isFinite(args.adhocServiceId)) {
          return `${normalizedDate}|${args.userId}|adhoc:${args.adhocServiceId}|dep:${args.depositId ?? 'null'}${baopLine}`;
        }
        return `${normalizedDate}|${args.userId}|route:${args.routeId ?? 'null'}|dep:${args.depositId ?? 'null'}${baopLine}`;
      };

      // Create a Set of unique keys for existing week-planners for fast lookup
      const existingKeys = new Set<string>();
      existingWeekPlanners.forEach((existing) => {
        // Normalize date and create key
        // Ensure date is in YYYY-MM-DD format (exactly 10 characters)
        let normalizedDate = existing.date.trim();
        if (normalizedDate.includes('T')) {
          normalizedDate = normalizedDate.split('T')[0];
        }
        // Ensure exactly YYYY-MM-DD format
        if (normalizedDate.length > 10) {
          normalizedDate = normalizedDate.substring(0, 10);
        }
        existingKeys.add(
          buildKey({
            date: normalizedDate,
            userId: existing.userId,
            routeId: existing.routeId,
            adhocServiceId: existing.adhocServiceId ?? null,
            depositId: existing.depositId ?? null,
            adhocSort: existing.adhocSort ?? null,
          })
        );
      });

      // Count existing BAOP API records per base key (date|userId|route|dep, no baopLine).
      // WeekPlannerListDTO never returns adhocSort, so all BAOP records land under the same
      // base key. We use these counts to skip re-saving drafts that already have a
      // corresponding API record, while still allowing genuinely new BAOP lines to be saved.
      const existingBaopBaseKeyCounts = new Map<string, number>();
      existingWeekPlanners.forEach((existing) => {
        if (existing.depositId !== BUSINESS_RULES.DEPOSIT.BAOP_DEFAULT) return;
        let normalizedDate = existing.date.trim();
        if (normalizedDate.includes('T')) normalizedDate = normalizedDate.split('T')[0];
        if (normalizedDate.length > 10) normalizedDate = normalizedDate.substring(0, 10);
        const baseKey = buildKey({
          date: normalizedDate,
          userId: existing.userId,
          routeId: existing.routeId,
          adhocServiceId: existing.adhocServiceId ?? null,
          depositId: existing.depositId ?? null,
          adhocSort: null, // intentionally omit — API never returns it
        });
        existingBaopBaseKeyCounts.set(baseKey, (existingBaopBaseKeyCounts.get(baseKey) ?? 0) + 1);
      });
      // Tracks how many BAOP drafts per base key we've seen while iterating below
      const pendingBaopCounts = new Map<string, number>();

      // Transform to WeekPlannerCreateDTO format and filter out duplicates and invalid entries
      const allWeekPlanners = weekAssignments.map((assignment) => {
        const raw = assignment.raw as Record<string, unknown>;
        if (raw.__saved_to_wp_bulk === true || raw.__saved_to_dgp === true) {
          return null;
        }
        // Skip all already-persisted records — __locallyModified ones are handled
        // by the individual PATCH loop below; no-modification ones need no action.
        if (assignment.weekPlannerId > 0) {
          return null;
        }

        // Extract route information - use routeId (prefer routeId over routeDefaultId)
        // routeId is REQUIRED and cannot be null
        let routeId = raw.routeId ? Number(raw.routeId) : null;
        if (!routeId && raw.routeDefaultId) {
          routeId = Number(raw.routeDefaultId);
        }
        // If still no routeId, try to extract from route object
        if (!routeId && raw.route && typeof raw.route === 'object') {
          const routeObj = raw.route as Record<string, unknown>;
          routeId = routeObj.routeId ? Number(routeObj.routeId) : (routeObj.routeDefaultId ? Number(routeObj.routeDefaultId) : null);
        }
        // If still no routeId, try to parse from assignment.route (might be a number string)
        if (!routeId && assignment.route) {
          const routeStr = String(assignment.route);
          // Try to parse as number
          const parsedRouteId = Number(routeStr);
          if (Number.isFinite(parsedRouteId) && parsedRouteId > 0) {
            routeId = parsedRouteId;
          } else {
            // Try to find route by name in routes array
            const foundRoute = routes.find(
              (r) => r.routeName === routeStr ||
                String(r.routeId) === routeStr ||
                String((r as RouteWithDefault).routeDefaultId) === routeStr
            );
            if (foundRoute) {
              const foundRouteId = foundRoute.routeId ?? (foundRoute as RouteWithDefault).routeDefaultId ?? null;
              routeId = foundRouteId ? Number(foundRouteId) : null;
            }
          }
        }

        const resolvedRoute =
          routeId && Number.isFinite(routeId) && routeId > 0
            ? routes.find((r) => r.routeId === routeId || (r as RouteWithDefault).routeDefaultId === routeId)
            : null;
        const resolvedRouteName = String(resolvedRoute?.routeName || raw.routeName || assignment.route || "").toLowerCase();
        const resolvedCategory = String((resolvedRoute as Record<string, unknown>)?.category || (raw as Record<string, unknown>)?.category || "").toLowerCase();
        // Extract adhocServiceId - check multiple possible locations including nested adhocService object
        const adhocServiceObj = (raw as Record<string, unknown>).adhocService as Record<string, unknown> | undefined;
        const adhocServiceIdFromRaw =
          (raw as Record<string, unknown>).adhocServiceId ??
          (raw as Record<string, unknown>).adhocServiceId ??
          (raw as Record<string, unknown>).adhocServiceId ??
          (adhocServiceObj?.adhocServiceId) ??
          (adhocServiceObj as Record<string, unknown> | undefined)?.adhocServiceId ??
          (adhocServiceObj as Record<string, unknown> | undefined)?.adhocServiceId ??
          undefined;
        const depositIdFromRawValue = (raw as Record<string, unknown>).depositId ?? (raw as Record<string, unknown>).depositId;
        const depositIdFromRaw: number | undefined = depositIdFromRawValue !== undefined && depositIdFromRawValue !== null && typeof depositIdFromRawValue === 'number'
          ? depositIdFromRawValue
          : depositIdFromRawValue !== undefined && depositIdFromRawValue !== null && !isNaN(Number(depositIdFromRawValue))
            ? Number(depositIdFromRawValue)
            : undefined;

        const hasSelectedAdhocService =
          adhocServiceIdFromRaw !== null &&
          adhocServiceIdFromRaw !== undefined &&
          Number.isFinite(Number(adhocServiceIdFromRaw)) &&
          Number(adhocServiceIdFromRaw) > 0;

        // Check if this is a Management Support assignment
        // Management Support assignments have category: "management" and don't have routeId
        // Also check for daily-team-support (negative IDs or dailyTeamSupportId field)
        const rawCategory = (raw as Record<string, unknown>)?.category;
        const assignmentRouteLower = String(assignment.route || "").toLowerCase();
        const isManagementSupport =
          assignment.weekPlannerId < 0 || // Negative IDs indicate daily-team-support
          raw?.dailyTeamSupportId !== undefined ||
          rawCategory === "management" ||
          resolvedCategory === "management" ||
          resolvedRouteName.includes("management and support") ||
          assignmentRouteLower.includes("management and support");

        const isAdHocServiceRoute =
          hasSelectedAdhocService ||
          resolvedCategory === "ad_hoc" ||
          resolvedRouteName.includes("adhoc") ||
          resolvedRouteName.includes("ad-hoc") ||
          // §4.1: item com objeto adhocService preenchido também é adhoc (evita "mesclar em route")
          (!!adhocServiceObj && Object.keys(adhocServiceObj).length > 0);

        // If user selected a specific ADHOC service in the edit modal, prefer it.
        const adhocServiceId = hasSelectedAdhocService
          ? Number(adhocServiceIdFromRaw)
          : isAdHocServiceRoute && routeId && routeId > 0
            ? routeId
            : undefined;
           // §4.1: rastrear itens adhoc que ficariam sem adhocServiceId (cairiam no ramo route da chave).
        if (isAdHocServiceRoute && (adhocServiceId === undefined || !Number.isFinite(Number(adhocServiceId)) || Number(adhocServiceId) <= 0)) {
          console.warn("[handleSaveWeek] Item adhoc sem adhocServiceId resolvido — verificar criação do draft:", { date: assignment.date, name: assignment.name, route: assignment.route, routeId });
        }
        // Deposit must be from the route selected earlier (the assignment route's deposit)
        // CRITICAL: For routeId 55 (BRTE), ALWAYS use depositId and depositName from raw (set in handleDrop)
        // This ensures that items created in "LCY - ADHOC Services" have depositId=1 (LCY),
        // items created in "MSE - ADHOC Services" have depositId=2 (MSE), etc.
        // NEVER use resolvedRoute depositId for routeId 55 because route BRTE belongs to BAOP (depositId 7)
        // For ADHOC services with adhocServiceId, we can also check the ADHOC Service's depositId as a fallback
        // For regular routes, use resolvedRoute depositId or depositIdFromRaw
        let depositId: number | undefined = undefined;

        // CRITICAL: For ADHOC placeholder routeId (BRTE 55 / DHOC 57), ALWAYS prioritize depositId from raw (set in handleDrop / modal)
        if (routeId === ADHOC_DEFAULT_ROUTE_ID || routeId === ADHOC_WEEK_PLANNER_ROUTE_ID) {
          // Priority 1: Use depositId from raw (set when item was created in handleDrop)
          if (depositIdFromRaw !== undefined && depositIdFromRaw !== null && Number.isFinite(Number(depositIdFromRaw))) {
            depositId = Number(depositIdFromRaw);
          } else if (isAdHocServiceRoute && adhocServiceId !== undefined && adhocServiceId !== null && Number.isFinite(adhocServiceId)) {
            // Priority 2: For ADHOC services, try to get depositId from the ADHOC Service itself
            const adhocServiceDepositId = adhocServiceDepositIdMap.get(Number(adhocServiceId));
            if (adhocServiceDepositId !== undefined) {
              depositId = adhocServiceDepositId;
            } else {
              console.warn(`[handleSaveWeek] WARNING: routeId 55 (BRTE) has no depositIdFromRaw and ADHOC Service ${adhocServiceId} has no depositId in map!`);
            }
          } else {
            console.warn(`[handleSaveWeek] WARNING: routeId 55 (BRTE) has no depositIdFromRaw and no adhocServiceId!`);
          }
        } else if (isAdHocServiceRoute && adhocServiceId !== undefined && adhocServiceId !== null && Number.isFinite(adhocServiceId)) {
          // For other ADHOC services (not routeId 55), try ADHOC Service depositId first, then raw
          const adhocServiceDepositId = adhocServiceDepositIdMap.get(Number(adhocServiceId));
          if (adhocServiceDepositId !== undefined) {
            depositId = adhocServiceDepositId;
          } else {
            depositId = depositIdFromRaw ?? undefined;
          }
        } else {
          // For regular routes, use resolvedRoute depositId or depositIdFromRaw
          depositId = resolvedRoute?.depositId ?? depositIdFromRaw ?? undefined;
        }

        // Extract depositName from raw if available
        // For ADHOC services, this should be the depositName of the deposit where the service was created
        const depositNameFromRaw = (raw as Record<string, unknown>).depositName as string | undefined;

        // Debug log for depositId extraction
        if (depositId !== undefined && depositId !== null) {
          if (isAdHocServiceRoute && depositIdFromRaw === undefined) {
            console.error(`[handleSaveWeek] CRITICAL: ADHOC service missing depositIdFromRaw! This will cause incorrect depositId. Assignment:`, {
              route: assignment.route,
              date: assignment.date,
              name: assignment.name,
              raw_depositId: (raw as Record<string, unknown>).depositId,
            });
          }
        } else if (isAdHocServiceRoute) {
          console.error(`[handleSaveWeek] CRITICAL: ADHOC service has no depositId! depositIdFromRaw: ${depositIdFromRaw}, resolvedRoute?.depositId: ${resolvedRoute?.depositId}`);
        }

        // routeId is REQUIRED — ADHOC week-planner rows use 57 (DHOC), same as daily-game-plan
        if (hasSelectedAdhocService || isAdHocServiceRoute) {
          routeId = ADHOC_WEEK_PLANNER_ROUTE_ID;
        } else if (!routeId || routeId === 0) {
          if (assignment.route) {
            const routeStr = String(assignment.route);
            const foundRoute = routes.find(
              (r) => r.routeName === routeStr ||
                String(r.routeId) === routeStr
            );
            if (foundRoute && foundRoute.routeId) {
              routeId = Number(foundRoute.routeId);
            }
          }
        }

        // Extract vehicle information - use vehicleId (prefer vehicleId over vehicleDefaultId)
        // vehicleId is REQUIRED and cannot be null
        let vehicleId = raw.vehicleId ? Number(raw.vehicleId) : null;
        if (!vehicleId && raw.vehicleDefaultId) {
          vehicleId = Number(raw.vehicleDefaultId);
        }
        // If still no vehicleId, try to extract from vehicle object
        if (!vehicleId && raw.vehicle && typeof raw.vehicle === 'object') {
          const vehicleObj = raw.vehicle as Record<string, unknown>;
          vehicleId = vehicleObj.vehicleId ? Number(vehicleObj.vehicleId) : (vehicleObj.vehicleDefaultId ? Number(vehicleObj.vehicleDefaultId) : null);
        }

        // vehicleId is optional - use null/undefined if not available

        // Extract userId - REQUIRED
        const userId = Number(raw.userId || 0);
        if (!userId || !Number.isFinite(userId) || userId <= 0) {
          console.error('Missing required userId for assignment:', assignment);
          throw new Error(`Missing required userId for assignment on ${assignment.date}`);
        }

        // Fallback: if assignment has no vehicleId, use vendor's default vehicle from vendors table (same as DB vendors.vehicleId)
        if (!vehicleId || !Number.isFinite(vehicleId) || vehicleId <= 0) {
          const vendor = vendors.find((d) => d.userId === userId);
          const vendorVehicleId = vendor?.vehicleId != null ? Number(vendor.vehicleId) : null;
          if (vendorVehicleId && Number.isFinite(vendorVehicleId) && vendorVehicleId > 0) {
            vehicleId = vendorVehicleId;
          }
        }

        const notes = raw.notes ? String(raw.notes || "") : undefined;
        const status = raw.status ? String(raw.status) : undefined;
        const isDayOff = Boolean(raw.isDayOff || assignment.isDayOff === "true");
        const operationId = raw.operationId ? Number(raw.operationId) : undefined;

        // Extract vendor_costModel if available (from Management Support)
        const vendorCostModel = raw.vendor_costModel && typeof raw.vendor_costModel === 'object'
          ? raw.vendor_costModel as Record<string, unknown>
          : undefined;

        // Validate date - required by database
        if (!assignment.date || assignment.date.trim() === '') {
          console.error('Missing required date for assignment:', assignment);
          throw new Error(`Missing required date for assignment for vendor ${userId || 'unknown'}`);
        }

        // Management Support assignments are for visualization and export only - skip saving to database
        if (isManagementSupport) {
          return null; // Skip Management Support assignments - they are for visualization/export only
        }

        // Validate required fields before creating payload
        // Backend requires: routeId and vehicleId to be valid numbers (not null)

        // Validate vehicleId - REQUIRED
        if (!vehicleId || !Number.isFinite(vehicleId) || vehicleId <= 0) {
          const debugPayload = {
            date: assignment?.date ?? 'N/A',
            userId: userId,
            vendorName: assignment?.name ?? 'N/A',
            route: assignment?.route ?? 'N/A',
            vehicleId,
            raw_has_vehicleId: raw?.vehicleId != null,
            vendor_fallback_vehicleId: vendors.find((d) => d.userId === userId)?.vehicleId ?? 'N/A',
          };
          console.error('[handleSaveWeek] Missing required vehicleId for assignment:', debugPayload);
          return null; // Skip this assignment
        }

        // Determine final routeId value
        // IMPORTANT: Backend ALWAYS requires routeId, even for ADHOC routes
        // Only treat as ADHOC if user explicitly selected an ADHOC service in the modal AND route is actually ADHOC
        // If routeId exists and is valid, it takes precedence over adhocServiceId

        // Check if this is truly an ADHOC route (user selected ADHOC service AND route is ADHOC)
        const isTrulyAdHoc = hasSelectedAdhocService &&
          (resolvedCategory === "ad_hoc" || resolvedRouteName.includes("adhoc") || resolvedRouteName.includes("ad-hoc"));

        let finalRouteId: number | null;

        // Priority: routeId always takes precedence if it exists and is valid
        if (routeId && Number.isFinite(routeId) && routeId > 0) {
          // We have a valid routeId - use it (this is a regular route assignment)
          finalRouteId = routeId;
        } else if (isTrulyAdHoc && hasSelectedAdhocService) {
          // Only treat as ADHOC if:
          // 1. User explicitly selected an ADHOC service in the modal
          // 2. Route is actually categorized as ADHOC
          // 3. We have valid adhocServiceId and depositId
          if (!adhocServiceId || !Number.isFinite(adhocServiceId) || adhocServiceId <= 0) {
            console.error('[handleSaveWeek] Missing required adhocServiceId for ADHOC assignment:', {
              date: assignment.date,
              userId: userId,
              route: assignment.route,
              adhocServiceId,
            });
            return null; // Skip this assignment
          }
          if (!depositId || !Number.isFinite(Number(depositId))) {
            console.error('[handleSaveWeek] Missing required depositId for ADHOC assignment:', {
              date: assignment.date,
              userId: userId,
              route: assignment.route,
              depositId,
            });
            return null; // Skip this assignment
          }
          // For ADHOC services, always use routeId 57 (DHOC) as specified
          finalRouteId = ADHOC_WEEK_PLANNER_ROUTE_ID;
        } else {
          // Regular route - must have valid routeId
          if (!routeId || !Number.isFinite(routeId) || routeId <= 0) {
            // Build debug info with safe access to avoid undefined errors
            const debugInfo: Record<string, unknown> = {
              date: assignment?.date || 'N/A',
              userId: userId || 'N/A',
              vendorName: assignment?.name || 'N/A',
              route: assignment?.route || 'N/A',
              routeId: routeId || 'N/A',
              rawRouteId: raw?.routeId || 'N/A',
              rawRouteDefaultId: raw?.routeDefaultId || 'N/A',
              rawRouteType: raw?.route ? typeof raw.route : 'N/A',
              rawRouteValue: raw?.route || 'N/A',
              rawKeys: raw ? Object.keys(raw) : [],
              assignmentKeys: assignment ? Object.keys(assignment) : [],
              isAdHocServiceRoute: isAdHocServiceRoute || false,
              isTrulyAdHoc: isTrulyAdHoc || false,
              hasSelectedAdhocService: hasSelectedAdhocService || false,
              resolvedRouteName: resolvedRouteName || 'N/A',
              resolvedCategory: resolvedCategory || 'N/A',
              routesAvailable: routes?.length || 0,
            };
            console.error('Missing required routeId for assignment:', JSON.stringify(debugInfo, null, 2));
            // Skip this assignment instead of throwing to allow other assignments to be saved
            // This prevents the database constraint violation error
            return null;
          }
          finalRouteId = routeId;
        }

        // Final validation: ensure routeId is never null
        // Backend ALWAYS requires routeId, even for ADHOC routes
        if (!finalRouteId || !Number.isFinite(finalRouteId) || finalRouteId <= 0) {
          console.error('[handleSaveWeek] CRITICAL: routeId is null or invalid:', {
            date: assignment.date,
            userId,
            route: assignment.route,
            isTrulyAdHoc,
            hasSelectedAdhocService,
            routeId,
            finalRouteId,
          });
          // Skip this assignment to prevent database error
          return null;
        }

        // Backend ALWAYS requires routeId (even for ADHOC routes)
        // For ADHOC routes, we also include adhocServiceId and depositId as additional fields
        const payload: {
          date: string;
          userId: number;
          isSort: boolean;
          vehicleId: number;
          isDayOff: boolean;
          status?: string;
          notes?: string;
          reason?: string;
          operationId?: number;
          routeId?: number;
          adhocServiceId?: number;
          adhocSort?: number | null;
          depositId?: number;
          depositName?: string;
          vendorCostModel?: Record<string, unknown>;
          weekPlannerId?: number;
          createdBy?: number;
        } = {
          date: assignment.date.trim(), // Required field - ensure it's not empty
          userId, // Now guaranteed to be a valid number
          isSort: raw?.isSort !== undefined ? Boolean(raw.isSort) : true,
          vehicleId, // Now guaranteed to be a valid number > 0 (validated above)
          status: status,
          isDayOff: isDayOff,
          operationId: operationId,
          notes: notes,
          // Include vendorCostModel if available (from Management Support)
          vendorCostModel: vendorCostModel,
        };
        // Backend expects `createdBy` as logged user id (mapped at API boundary).
        if (createdByUserId) payload.createdBy = createdByUserId;

        // Backend ALWAYS requires routeId (even for ADHOC routes)
        // Include routeId for all assignments
        payload.routeId = finalRouteId;

        // Optional userId for WeekPlannerCreateDTO / POST /bff/week-planners/bulk
        const userIdRaw =
          (raw as Record<string, unknown>)?.userId ??
          (raw as Record<string, unknown>)?.userId ??
          (() => {
            const vendorMatch = (Array.isArray(vendors) ? vendors : []).find((v) => {
              const r = v as unknown as Record<string, unknown>;
              const vVendorId = Number(r.userId ?? r.userId ?? 0);
              const vUserId = Number(r.userId ?? r.userId ?? 0);
              return vVendorId === userId || vUserId === userId;
            }) as Record<string, unknown> | undefined;
            return vendorMatch?.userId ?? vendorMatch?.userId ?? null;
          })() ??
          ((raw as Record<string, unknown>)?.dailyTeamSupport &&
            typeof (raw as Record<string, unknown>)?.dailyTeamSupport === "object"
            ? ((raw as Record<string, unknown>).dailyTeamSupport as Record<string, unknown>).userId ??
            ((raw as Record<string, unknown>).dailyTeamSupport as Record<string, unknown>).userId
            : null);
        const vendorUserId = toPositiveNumber(userIdRaw);
        if (vendorUserId) payload.userId = vendorUserId;
        const weekPlannerIdVal = toPositiveNumber(assignment.weekPlannerId);
        if (weekPlannerIdVal) payload.weekPlannerId = weekPlannerIdVal;

        // Include adhocServiceId and depositId if present (always include when available)
        if (adhocServiceId !== undefined && adhocServiceId !== null && Number.isFinite(adhocServiceId)) {
          payload.adhocServiceId = Number(adhocServiceId);
        }
        const adhocSortRaw = (raw as Record<string, unknown>).adhocSort;
        if (adhocSortRaw !== undefined && adhocSortRaw !== null && Number.isFinite(Number(adhocSortRaw))) {
          payload.adhocSort = Number(adhocSortRaw);
        }
        if (depositId !== undefined && depositId !== null && Number.isFinite(depositId)) {
          const numericDepositId = Number(depositId);
          payload.depositId = numericDepositId;

          // Debug log for ADHOC services to verify depositId
          if (isAdHocServiceRoute) {
            if (numericDepositId === BUSINESS_RULES.DEPOSIT.BAOP_DEFAULT) {
              console.warn(`[handleSaveWeek] WARNING: ADHOC service has depositId 7 (BAOP) - this might be incorrect! Should be from deposit where service was created. depositIdFromRaw: ${depositIdFromRaw}`);
            }
          }

          // CRITICAL: For routeId 55 (BRTE), ALWAYS prioritize depositName from raw (set in handleDrop)
          // This ensures that items created in "LCY - ADHOC Services" have depositName="LCY",
          // items created in "MSE - ADHOC Services" have depositName="MSE", etc.
          let depositName: string | undefined = undefined;

          // BRTE (55) / DHOC (57): depositName from section raw, not BAOP resolved route
          if (finalRouteId === ADHOC_DEFAULT_ROUTE_ID || finalRouteId === BUSINESS_RULES.ROUTE.DHOC) {
            // Priority 1: Use depositName from raw (set when item was created in handleDrop)
            if (depositNameFromRaw && depositNameFromRaw.trim()) {
              depositName = depositNameFromRaw;
            } else if (adhocServiceId !== undefined && adhocServiceId !== null && Number.isFinite(adhocServiceId)) {
              // Priority 2: For ADHOC services, try to get depositName from the ADHOC Service itself
              const adhocServiceDepositName = adhocServiceDepositNameMap.get(Number(adhocServiceId));
              if (adhocServiceDepositName) {
                depositName = adhocServiceDepositName;
              } else {
                // Fallback: use depositMap or depositsDataArray
                depositName = depositMap.get(numericDepositId);
                if (!depositName && depositsDataArray.length > 0) {
                  const deposit = depositsDataArray.find(d => d.depositId === numericDepositId);
                  if (deposit?.depositName) {
                    depositName = deposit.depositName;
                  }
                }
              }
            } else {
              // For routeId 55 without adhocServiceId, try to get from depositMap or depositsDataArray
              depositName = depositMap.get(numericDepositId);
              if (!depositName && depositsDataArray.length > 0) {
                const deposit = depositsDataArray.find(d => d.depositId === numericDepositId);
                if (deposit?.depositName) {
                  depositName = deposit.depositName;
                }
              }
            }
          } else {
            // For regular routes (not routeId 55), use standard logic
            depositName = depositMap.get(numericDepositId);
            if (!depositName && depositsDataArray.length > 0) {
              const deposit = depositsDataArray.find(d => d.depositId === numericDepositId);
              if (deposit?.depositName) {
                depositName = deposit.depositName;
              }
            }
            if (!depositName && depositNameFromRaw) {
              depositName = depositNameFromRaw;
            }
          }

          // Always set depositName if we found it
          if (depositName) {
            payload.depositName = depositName;
          } else {
            console.error(`[handleSaveWeek] CRITICAL: Could not find depositName for depositId ${numericDepositId}. Available deposits:`, depositsDataArray.length > 0 ? depositsDataArray.map(d => `${d.depositId}:${d.depositName}`).join(', ') : 'No deposits loaded', isAdHocServiceRoute ? ' (ADHOC Service)' : '');
            // For ADHOC services, never try to get from resolvedRoute because route BRTE has different deposit
            if (!isAdHocServiceRoute && resolvedRoute?.depositId === numericDepositId) {
              // Routes don't typically have depositName, but we'll log it
              console.warn(`[handleSaveWeek] depositId ${numericDepositId} matches resolvedRoute but no depositName available`);
            }
          }
        } else {
          // Log when depositId is not available
        }

        // Log payload for debugging

        return payload;
      }).filter((wp): wp is NonNullable<typeof wp> => wp !== null); // Filter out null entries (invalid assignments and Management Support)

      // Log if any assignments were skipped
      const skippedCount = weekAssignments.length - allWeekPlanners.length;
      if (skippedCount > 0) {
        const managementSupportCount = weekAssignments.filter((assignment) => {
          const raw = assignment.raw as Record<string, unknown>;
          const rawCategory = (raw as Record<string, unknown>)?.category;
          const assignmentRouteLower = String(assignment.route || "").toLowerCase();
          return rawCategory === "management" || assignmentRouteLower.includes("management and support");
        }).length;
        const otherSkipped = skippedCount - managementSupportCount;

        if (otherSkipped > 0) {
          console.warn(`[handleSaveWeek] Skipped ${otherSkipped} assignment(s) due to missing routeId or other validation issues`);
        }
      }

      // Cost model is optional - no validation needed

      // Filter out duplicates by comparing with existing week-planners
      // A duplicate is defined as: same date + userId + routeId
      const pendingPayloadKeys = new Set<string>();
      const newWeekPlanners = allWeekPlanners.filter((wp) => {
        // Normalize date to ensure consistent format (YYYY-MM-DD)
        // Handle both ISO format (2025-12-14T03:00:00.000Z) and YYYY-MM-DD format
        const wpDate = typeof wp.date === 'string' ? wp.date : String(wp.date || '');
        let normalizedDate = wpDate.trim();
        if (normalizedDate.includes('T')) {
          normalizedDate = normalizedDate.split('T')[0];
        }
        // Ensure date is exactly YYYY-MM-DD format (10 characters)
        if (normalizedDate.length > 10) {
          normalizedDate = normalizedDate.substring(0, 10);
        }

        const userId = typeof wp.userId === 'number' ? wp.userId : Number(wp.userId) || 0;
        const routeId = typeof wp.routeId === 'number' ? wp.routeId : (wp.routeId != null ? Number(wp.routeId) : null);
        const wpRecord = wp as Record<string, unknown>;
        const adhocServiceIdValue = wpRecord.adhocServiceId ?? wpRecord.adhocServiceId;
        const adhocServiceId = adhocServiceIdValue != null
          ? (typeof adhocServiceIdValue === 'number'
            ? adhocServiceIdValue
            : (Number.isFinite(Number(adhocServiceIdValue)) ? Number(adhocServiceIdValue) : null))
          : null;
        const depositIdValue = wpRecord.depositId ?? wpRecord.depositId;
        const depositId = depositIdValue != null
          ? (typeof depositIdValue === 'number'
            ? depositIdValue
            : (Number.isFinite(Number(depositIdValue)) ? Number(depositIdValue) : null))
          : null;
        const adhocSortValue = wpRecord.adhocSort;
        const adhocSort = adhocSortValue != null
          ? (typeof adhocSortValue === 'number'
            ? adhocSortValue
            : (Number.isFinite(Number(adhocSortValue)) ? Number(adhocSortValue) : null))
          : null;

        const key = buildKey({
          date: normalizedDate,
          userId: userId,
          routeId: routeId,
          adhocServiceId: adhocServiceId,
          depositId: depositId,
          adhocSort: adhocSort,
        });
        const isDuplicate = existingKeys.has(key);
        if (isDuplicate) {
          return false;
        }
        if (pendingPayloadKeys.has(key)) {
          return false;
        }
        // BAOP safety: the API never returns adhocSort (WeekPlannerListDTO lacks the field),
        // so existingKeys only has base keys (no baopLine). A BAOP draft would never match
        // existingKeys. We use a count-based check instead: if there are already as many
        // saved BAOP API records as BAOP drafts processed so far for this base key, skip.
        if (adhocSort !== null && depositId === BUSINESS_RULES.DEPOSIT.BAOP_DEFAULT) {
          const baopBaseKey = buildKey({
            date: normalizedDate,
            userId,
            routeId,
            adhocServiceId,
            depositId,
            adhocSort: null,
          });
          const alreadySaved = existingBaopBaseKeyCounts.get(baopBaseKey) ?? 0;
          const alreadyPending = pendingBaopCounts.get(baopBaseKey) ?? 0;
          pendingBaopCounts.set(baopBaseKey, alreadyPending + 1);
          if (alreadyPending < alreadySaved) {
            return false;
          }
        }
        pendingPayloadKeys.add(key);
        return true;
      });

      // --- PATCH locally-modified existing records (NotAllocated reassigned in memory) ---
      // These records already exist in the DB (weekPlannerId > 0) and were updated locally.
      // They must be PATCHed individually; the bulk POST only creates new records.
      const patchAssignments = weekAssignments.filter((op) => {
        if (!(op.weekPlannerId > 0)) return false;
        return Boolean((op.raw as Record<string, unknown>).__locallyModified);
      });

      if (newWeekPlanners.length === 0 && patchAssignments.length === 0 && !hasUnsavedChanges) {
        setInfoModalData({
          type: 'info',
          title: 'No changes to save',
          message: 'There are no new or modified week planner records to save.',
        });
        setShowInfoModal(true);
        return;
      }

      if (patchAssignments.length > 0) {
        const patchHeaders = {
          "Content-Type": "application/json",
          ...getBearerAuthHeader(),
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        } as const;
        const patchFailures: number[] = [];

        // Fire the PATCH requests concurrently instead of one-at-a-time. The
        // browser caps concurrent connections per origin, so this naturally
        // bounds parallelism while collapsing N sequential round-trips into
        // a handful of in-flight requests. Mirrors the Promise.allSettled
        // pattern already used elsewhere in services/apiService.ts.
        const patchResults = await Promise.allSettled(
          patchAssignments.map((op) => {
            const raw = (op.raw ?? {}) as Record<string, unknown>;
            const patchBody = {
              routeId: raw.routeId ?? null,
              vehicleId: raw.vehicleId ?? null,
              isSort: raw.isSort !== undefined ? Boolean(raw.isSort) : true,
              status: BUSINESS_RULES.WORKING_STATUS.WORKING,
            };
            return guardedFetch(
              `${API_BASE_URL}/bff/week-planners/${op.weekPlannerId}`,
              { method: "PATCH", headers: patchHeaders, cache: "no-store", body: JSON.stringify(patchBody) }
            );
          })
        );

        // An auth failure on any PATCH aborts the whole save, matching the
        // previous sequential behaviour.
        const patchAuthFailed = patchResults.some(
          (r) => r.status === "fulfilled" && (r.value.status === 401 || r.value.status === 403)
        );
        if (patchAuthFailed) {
          handleAuthError("Invalid token. Please login again.");
          return;
        }

        patchResults.forEach((result, index) => {
          const weekPlannerId = patchAssignments[index].weekPlannerId;
          if (result.status === "rejected") {
            console.error(`[handleSaveWeek] PATCH week-planner ${weekPlannerId} error:`, result.reason);
            patchFailures.push(weekPlannerId);
          } else if (!result.value.ok) {
            console.error(`[handleSaveWeek] PATCH week-planner ${weekPlannerId} failed (${result.value.status})`);
            patchFailures.push(weekPlannerId);
          }
        });

        if (patchFailures.length > 0) {
          throw new Error(`Failed to update ${patchFailures.length} existing assignment(s). Please try saving again.`);
        }
      }

      // __locallyModified records are excluded upstream (weekPlannerId > 0 → skipped in allWeekPlanners)
      // and handled by the PATCH loop above; newWeekPlanners contains only genuinely new items.
      const newWeekPlannersForPost = newWeekPlanners;

      // Validate payload before sending
      const validatedPayload = newWeekPlannersForPost.map((wp, index) => {
        const wpRecord = wp as Record<string, unknown>;
        
        // Ensure all required fields are present and valid

        // Extract and validate required fields
        const date = typeof wp.date === 'string' ? wp.date.trim() : String(wp.date || '').trim();
        const userId = typeof wp.userId === 'number' ? wp.userId : Number(wp.userId) || 0;
        const vehicleId = typeof wp.vehicleId === 'number' ? wp.vehicleId : Number(wp.vehicleId) || 0;

        // Handle routeId — REQUIRED FIELD (payload from allWeekPlanners is camelCase)
        let routeIdForDeposit: number | null = null;
        if (wp.routeId !== undefined && wp.routeId !== null) {
          routeIdForDeposit = typeof wp.routeId === 'number' ? wp.routeId : Number(wp.routeId);
        }

        // If routeId is missing or 0, try to get it from the record
        if (!routeIdForDeposit || routeIdForDeposit === 0) {
          const routeIdFromRecord = wpRecord.routeId ?? wpRecord.routeId;
          if (routeIdFromRecord !== undefined && routeIdFromRecord !== null) {
            routeIdForDeposit = typeof routeIdFromRecord === 'number' ? routeIdFromRecord : Number(routeIdFromRecord);
          }
        }

        // Final fallback: if still no routeId and it's an ADHOC service, use BRTE
        if ((!routeIdForDeposit || routeIdForDeposit === 0) && (wpRecord.adhocServiceId ?? wpRecord.adhocServiceId)) {
          routeIdForDeposit = BRTE_ROUTE_ID;
        }

        // Validate required fields before proceeding
        if (!date || !userId || !vehicleId || !routeIdForDeposit) {
          console.error(`[handleSaveWeek] Missing required fields at index ${index}:`, {
            date,
            userId,
            vehicleId,
            routeId: routeIdForDeposit,
            original: wp,
            wpKeys: Object.keys(wp),
          });
          throw new Error(`Week planner ${index + 1}: date, userId, routeId, and vehicleId are required fields.`);
        }

        const adhocServiceIdRaw =
          wpRecord.adhocServiceId ?? wpRecord.adhocServiceId;
        const hasAdhocServiceId = adhocServiceIdRaw !== undefined && adhocServiceIdRaw !== null;
        const adhocSortRawForPayload = wpRecord.adhocSort;
        const isSortForPayload = wp.isSort !== undefined ? wp.isSort : true;
        const validated: Record<string, unknown> = {
          date,
          userId,
          routeId: routeIdForDeposit,
          vehicleId,
          isSort: isSortForPayload,
          isDayOff: typeof wp.isDayOff === 'boolean' ? wp.isDayOff : Boolean(wp.isDayOff),
          status: String((wpRecord.status ?? wp.status ?? BUSINESS_RULES.WORKING_STATUS.WORKING)),
        };
        // createdBy — mapped to WeekPlannerCreateDTO.createdBy at API boundary
        if (createdByUserId) {
          validated.createdBy = createdByUserId;
        }
        const wpUserIdRaw =
          (wpRecord as Record<string, unknown>).userId ?? (wpRecord as Record<string, unknown>).userId;
        if (wpUserIdRaw !== undefined && wpUserIdRaw !== null) {
          validated.userId =
            typeof wpUserIdRaw === "number" ? wpUserIdRaw : Number(wpUserIdRaw);
        }
        const weekPlannerIdRaw = wpRecord.weekPlannerId ?? wpRecord.weekPlannerId;
        if (weekPlannerIdRaw !== undefined && weekPlannerIdRaw !== null) {
          validated.weekPlannerId = typeof weekPlannerIdRaw === 'number'
            ? weekPlannerIdRaw
            : Number(weekPlannerIdRaw);
        }
        // Add optional fields if they exist
        if (wp.notes) validated.notes = wp.notes;
        if (wp.operationId) validated.operationId = wp.operationId;
        if (wp.vendorCostModel) validated.vendorCostModel = wp.vendorCostModel;

        // Handle adhocServiceId and depositId (always include if present)
        if (hasAdhocServiceId) {
          validated.adhocServiceId = typeof adhocServiceIdRaw === 'number' ? adhocServiceIdRaw : Number(adhocServiceIdRaw);
        }
        if (adhocSortRawForPayload !== undefined && adhocSortRawForPayload !== null && Number.isFinite(Number(adhocSortRawForPayload))) {
          validated.adhocSort = Number(adhocSortRawForPayload);
        }

        // Handle depositId and depositName
        let depositIdToUse: number | null = null;

        // For ADHOC Services, depositId MUST come from the deposit where the service was created,
        // NOT from the route (BRTE routeId 55 which belongs to deposit BAOP - depositId 7).
        // The depositId should already be in wpRecord.depositId from the initial payload creation.
        const wpDepositIdRaw =
          (wpRecord as Record<string, unknown>).depositId ?? (wpRecord as Record<string, unknown>).depositId;
        if (wpDepositIdRaw !== undefined && wpDepositIdRaw !== null) {
          depositIdToUse =
            typeof wpDepositIdRaw === "number" ? wpDepositIdRaw : Number(wpDepositIdRaw);
          validated.depositId = depositIdToUse;
        } else if (!hasAdhocServiceId && routeIdForDeposit !== null && routeIdForDeposit > 0 && routeIdForDeposit !== BRTE_ROUTE_ID) {
          // Only try to get depositId from route if it's NOT an ADHOC service AND NOT routeId 55 (BRTE)
          // For routeId 55 (BRTE), always use deposit from target/raw, never from route
          // For ADHOC services, depositId must come from the deposit where the service was created
          const resolvedRoute = routes.find((r) => r.routeId === routeIdForDeposit || (r as RouteWithDefault).routeDefaultId === routeIdForDeposit);
          if (resolvedRoute?.depositId) {
            depositIdToUse = resolvedRoute.depositId;
            validated.depositId = depositIdToUse;
          }
        } else if (routeIdForDeposit === BRTE_ROUTE_ID && !hasAdhocServiceId) {
          // For routeId 55 (BRTE) without adhocServiceId, the depositId MUST come from the payload
          // This happens when a vendor is dragged directly to the ADHOC Services section
          // The depositId should have been set in handleDrop based on the deposit section where it was created
          const brteDepositIdRaw =
            (wpRecord as Record<string, unknown>).depositId ?? (wpRecord as Record<string, unknown>).depositId;
          if (brteDepositIdRaw !== undefined && brteDepositIdRaw !== null) {
            depositIdToUse =
              typeof brteDepositIdRaw === "number" ? brteDepositIdRaw : Number(brteDepositIdRaw);
            validated.depositId = depositIdToUse;
          } else {
            // Try to get from deposits data as fallback
            console.warn(`[handleSaveWeek] WARNING: routeId 55 (BRTE) without adhocServiceId and no depositId in payload. Attempting to infer from deposits data.`);
            // This should not happen if handleDrop is working correctly, but we'll try to infer it
            if (plannerData?.depositsWithRoutes && plannerData.depositsWithRoutes.length > 0) {
              // For now, we can't infer which deposit it should be, so we'll log an error
              console.error(`[handleSaveWeek] CRITICAL: routeId 55 (BRTE) without adhocServiceId and no depositId in payload. Cannot determine correct deposit.`);
            }
          }
        } else if (hasAdhocServiceId) {
          // For ADHOC services, if depositId is missing, log an error
          console.error(`[handleSaveWeek] CRITICAL: ADHOC service missing depositId! routeId: ${routeIdForDeposit}, adhocServiceId: ${adhocServiceIdRaw}`);
        }

        // Always include depositName when depositId is present
        // Special rule: If routeId is 55 (BRTE) and has adhocServiceId, use depositName from the ADHOC Service
        // Each ADHOC Service is associated with a specific deposit, and we must use its depositName
        if (depositIdToUse !== null && depositIdToUse !== undefined) {
          // Check if this is a BRTE route (routeId 55) with an ADHOC Service
          const isBRTERouteWithAdhoc = routeIdForDeposit === BRTE_ROUTE_ID && hasAdhocServiceId;

          if (isBRTERouteWithAdhoc) {
            // For routeId 55 (BRTE) with ADHOC Service, FIRST try to get depositName from the ADHOC Service itself
            // This is the primary source - each ADHOC Service has its own depositName
            const adhocServiceIdForLookup = typeof adhocServiceIdRaw === 'number' ? adhocServiceIdRaw : Number(adhocServiceIdRaw);
            const adhocServiceDepositName = adhocServiceDepositNameMap.get(adhocServiceIdForLookup);
            if (adhocServiceDepositName) {
              validated.depositName = adhocServiceDepositName;
            } else {
              // Fallback 1: try to get from depositMap (should be available from earlier fetch)
              const depositName = depositMap.get(depositIdToUse);
              if (depositName) {
                validated.depositName = depositName;
              } else {
                // Fallback 2: try from depositsDataArray
                const deposit = depositsDataArray.find(d => d.depositId === depositIdToUse);
                if (deposit?.depositName) {
                  validated.depositName = deposit.depositName;
                } else {
                  // Fallback 3: use from payload if available (last resort)
                  if (wpRecord.depositName && typeof wpRecord.depositName === 'string') {
                    validated.depositName = wpRecord.depositName;
                  } else {
                    console.warn(`[handleSaveWeek] Could not find depositName for depositId ${depositIdToUse} in validatedPayload. routeId: ${routeIdForDeposit} (routeId 55/BRTE with ADHOC Service)`);
                  }
                }
              }
            }
          } else if (routeIdForDeposit === BRTE_ROUTE_ID) {
            // For routeId 55 (BRTE) even without adhocServiceId, use deposit from target/raw, NOT from route
            // Route BRTE belongs to BAOP, but items created in BRTE should use the deposit where they were created
            if (wpRecord.depositName && typeof wpRecord.depositName === 'string') {
              validated.depositName = wpRecord.depositName;
            } else {
              // Try to get from depositMap
              const depositName = depositMap.get(depositIdToUse);
              if (depositName) {
                validated.depositName = depositName;
              } else {
                // Try from depositsDataArray
                const deposit = depositsDataArray.find(d => d.depositId === depositIdToUse);
                if (deposit?.depositName) {
                  validated.depositName = deposit.depositName;
                } else {
                  console.warn(`[handleSaveWeek] Could not find depositName for depositId ${depositIdToUse} in validatedPayload. routeId: ${routeIdForDeposit} (routeId 55/BRTE)`);
                }
              }
            }
          } else {
            // For regular routes (not routeId 55), use standard logic
            // Try to get from the payload first
            if (wpRecord.depositName && typeof wpRecord.depositName === 'string') {
              validated.depositName = wpRecord.depositName;
            } else {
              // Fallback: try to get from depositMap based on routeId
              const depositName = depositMap.get(depositIdToUse);
              if (depositName) {
                validated.depositName = depositName;
              } else {
                // Last resort: try from depositsDataArray
                const deposit = depositsDataArray.find(d => d.depositId === depositIdToUse);
                if (deposit?.depositName) {
                  validated.depositName = deposit.depositName;
                } else {
                  console.warn(`[handleSaveWeek] Could not find depositName for depositId ${depositIdToUse} in validatedPayload. routeId: ${routeIdForDeposit}`);
                }
              }
            }
          }
        }

        return validated;
      });

      // POST /bff/week-planners/bulk — WeekPlannerBulkCreateDTO { weekPlanners: WeekPlannerCreateDTO[] }
      const weekPlannerBulkItems: WeekPlannerCreateDTO[] = validatedPayload.map((wp) => {
        const r = wp as Record<string, unknown>;
        const createdUserId = Number(r.userId ?? r.userId);
        const routeId = r.routeId ?? r.routeId;
        const vehicleId = r.vehicleId ?? r.vehicleId;
        const isDayOff = r.isDayOff ?? r.isDayOff;
        const item: WeekPlannerCreateDTO = {
          date: String(r.date ?? "").trim().slice(0, 10),
          userId: createdUserId,
          routeId: routeId != null ? Number(routeId) : null,
          vehicleId: vehicleId != null ? Number(vehicleId) : null,
          isDayOff: Boolean(isDayOff),
          status: String(r.status ?? BUSINESS_RULES.WORKING_STATUS.WORKING),
        };
        const itemUserId = r.userId ?? r.userId;
        if (itemUserId != null && Number.isFinite(Number(itemUserId))) item.userId = Number(itemUserId);
        const depositId = r.depositId ?? r.depositId;
        if (depositId != null && Number.isFinite(Number(depositId))) item.depositId = Number(depositId);
        const adhocServiceId = r.adhocServiceId ?? r.adhocServiceId;
        if (adhocServiceId != null && Number.isFinite(Number(adhocServiceId))) {
          item.adhocServiceId = Number(adhocServiceId);
        }
        const adhocSort = r.adhocSort;
        if (adhocSort != null && Number.isFinite(Number(adhocSort))) {
          item.adhocSort = Number(adhocSort);
        }
        const isSort = r.isSort ?? r.isSort;
        if (isSort !== undefined) item.isSort = Boolean(isSort);
        if (r.vendorRequestId != null && Number.isFinite(Number(r.vendorRequestId))) {
          item.vendorRequestId = Number(r.vendorRequestId);
        }
        if (r.reason != null) item.reason = String(r.reason);
        if (r.notes != null) item.notes = String(r.notes);
        const createdBy = r.createdBy ?? r.createdBy;
        if (createdBy != null && Number.isFinite(Number(createdBy))) {
          item.createdBy = Number(createdBy);
        }
        return item;
      });


      if (weekPlannerBulkItems.length > 0) {
        let createdWeekPlannersFromBulk: WeekPlannerRecord[] = [];
        try {
          createdWeekPlannersFromBulk = await createWeekPlannersBulk(weekPlannerBulkItems);
        } catch (bulkErr) {
          if (bulkErr instanceof Error && (bulkErr.message.includes("Invalid token") || bulkErr.message.includes("Authentication token"))) {
            handleAuthError(bulkErr.message);
            return;
          }
          throw bulkErr;
        }


        // Keep Daily Game Plan table in sync after creating week planners.
        // Endpoint: POST /bff/operations/from-week-planners
        const createdWithId = createdWeekPlannersFromBulk.filter(
          (wp) => Number.isFinite(Number(wp.weekPlannerId)) && Number(wp.weekPlannerId) > 0
        );
        if (createdWithId.length > 0) {
          try {
            await createOperationsManagementBulkFromWeekPlanners(createdWithId);
          } catch (opsErr) {
            if (opsErr instanceof Error && (opsErr.message.includes("Invalid token") || opsErr.message.includes("Authentication token"))) {
              handleAuthError(opsErr.message);
              return;
            }
            throw opsErr;
          }
        }

        const getPayloadKey = (row: WeekPlannerCreateDTO, includeAdhocSort: boolean): string => {
          return buildDgpKey({
            date: row.date,
            userId: row.userId,
            routeId: row.routeId,
            vehicleId: row.vehicleId,
            adhocServiceId: row.adhocServiceId ?? null,
            depositId: row.depositId ?? null,
            adhocSort: includeAdhocSort ? (row.adhocSort ?? null) : null,
          });
        };

        const createdQueueByFullKey = new Map<string, WeekPlannerRecord[]>();
        const createdQueueByBaseKey = new Map<string, WeekPlannerRecord[]>();
        createdWeekPlannersFromBulk.forEach((created, index) => {
          const payloadRow = weekPlannerBulkItems[index];
          if (!payloadRow) return;

          const fullKey = getPayloadKey(payloadRow, true);
          const baseKey = getPayloadKey(payloadRow, false);

          const fullQueue = createdQueueByFullKey.get(fullKey) ?? [];
          fullQueue.push(created);
          createdQueueByFullKey.set(fullKey, fullQueue);

          const baseQueue = createdQueueByBaseKey.get(baseKey) ?? [];
          baseQueue.push(created);
          createdQueueByBaseKey.set(baseKey, baseQueue);
        });

        const takeCreatedMatch = (key: string, baseKey: string): WeekPlannerRecord | null => {
          const fullQueue = createdQueueByFullKey.get(key);
          if (fullQueue && fullQueue.length > 0) {
            const match = fullQueue.shift() ?? null;
            if (fullQueue.length === 0) createdQueueByFullKey.delete(key);
            return match;
          }

          const baseQueue = createdQueueByBaseKey.get(baseKey);
          if (baseQueue && baseQueue.length > 0) {
            const match = baseQueue.shift() ?? null;
            if (baseQueue.length === 0) createdQueueByBaseKey.delete(baseKey);
            return match;
          }

          return null;
        };

        // Clear the just-saved rows from memory so the next render comes from the
        // server snapshot instead of keeping the optimistic draft copy around.
        setAllOperations((prev) =>
          prev.filter((op) => {
            const raw = (op.raw ?? {}) as Record<string, unknown>;
            const opFullKey = buildDgpKey({
              date: op.date ?? raw.date,
              userId: raw.userId,
              routeId: raw.routeId ?? (raw.route && typeof raw.route === "object" ? (raw.route as Record<string, unknown>).routeId : null),
              vehicleId: raw.vehicleId ?? (raw.vehicle && typeof raw.vehicle === "object" ? (raw.vehicle as Record<string, unknown>).vehicleId : null),
              adhocServiceId: raw.adhocServiceId ?? (raw.adhocService && typeof raw.adhocService === "object" ? (raw.adhocService as Record<string, unknown>).adhocServiceId : null),
              depositId: raw.depositId,
              adhocSort: raw.adhocSort,
            });
            const opBaseKey = buildDgpKey({
              date: op.date ?? raw.date,
              userId: raw.userId,
              routeId: raw.routeId ?? (raw.route && typeof raw.route === "object" ? (raw.route as Record<string, unknown>).routeId : null),
              vehicleId: raw.vehicleId ?? (raw.vehicle && typeof raw.vehicle === "object" ? (raw.vehicle as Record<string, unknown>).vehicleId : null),
              adhocServiceId: raw.adhocServiceId ?? (raw.adhocService && typeof raw.adhocService === "object" ? (raw.adhocService as Record<string, unknown>).adhocServiceId : null),
              depositId: raw.depositId,
              adhocSort: null,
            });

            return !takeCreatedMatch(opFullKey, opBaseKey);
          })
        );

        const sentKeys = new Set(
          weekPlannerBulkItems.map((row) =>
            buildDgpKey({
              date: row.date,
              userId: row.userId,
              routeId: row.routeId,
              vehicleId: row.vehicleId,
              adhocServiceId: row.adhocServiceId ?? null,
              depositId: row.depositId ?? null,
              adhocSort: row.adhocSort ?? null,
            })
          )
        );
        if (sentKeys.size > 0) {
          setAllOperations((prev) =>
            prev.map((op) => {
              const raw = (op.raw ?? {}) as Record<string, unknown>;
              const key = buildDgpKey({
                date: op.date ?? raw.date,
                userId: raw.userId,
                routeId: raw.routeId ?? (raw.route && typeof raw.route === "object" ? (raw.route as Record<string, unknown>).routeId : null),
                vehicleId: raw.vehicleId ?? (raw.vehicle && typeof raw.vehicle === "object" ? (raw.vehicle as Record<string, unknown>).vehicleId : null),
                adhocServiceId: raw.adhocServiceId ?? (raw.adhocService && typeof raw.adhocService === "object" ? (raw.adhocService as Record<string, unknown>).adhocServiceId : null),
                depositId: raw.depositId,
                adhocSort: raw.adhocSort,
              });
              if (!sentKeys.has(key)) return op;
              return {
                ...op,
                raw: {
                  ...raw,
                  __saved_to_wp_bulk: true,
                },
              };
            })
          );
        }

        setRefreshTrigger((prev) => prev + 1);
        await refreshAssignments();
      }

      // POST day-off-spare: vendors userTypeId 1 or 3 OR spare vendors (vendorTypeId 7) from GET /bff/vendor without week-planner on each day
      const baseDatesForSpare = showWeekends ? weekDates : weekDates.filter((d) => !isWeekend(d));
      // Not-allocated: apenas datas futuras (a partir de amanhã)
      const datesForSpare = baseDatesForSpare.filter((d) => futureDatesStrSet.has(d));
      // These two fetches are independent and their results are consumed at
      // different points below, so start them together and await in parallel
      // instead of paying two sequential round-trips. The daily-team-support
      // promise resolves to null on failure to preserve the in-memory fallback.
      const vendorsFromApiPromise = fetchVendorsRaw(true);
      const freshDtsRecordsPromise = fetchDailyTeamSupport(
        formatDate(weekDates[0], 'yyyy-mm-dd'),
        formatDate(weekDates[weekDates.length - 1], 'yyyy-mm-dd')
      ).catch(() => null);
      const vendorsFromApi = await vendorsFromApiPromise;
      const spareVendorsRaw = (Array.isArray(vendorsFromApi) ? vendorsFromApi : []).filter((v) => {
        const vt = v as Record<string, unknown>;
        const dt = Number(vt.vendorTypeId ?? vt.vendorTypeId ?? 0);
        const ut = Number(vt.userTypeId ?? vt.userTypeId ?? 0);
        return dt === BUSINESS_RULES.DRIVER_TYPE.SPARE || ut === BUSINESS_RULES.USER_TYPE.ADMIN || ut === BUSINESS_RULES.USER_TYPE.SUPERVISOR;
      });
      const seenSpareUserId = new Set<number>();
      const spareVendors = spareVendorsRaw.filter((v) => {
        const vt = v as Record<string, unknown>;
        const uid = toPositiveNumber(vt.userId ?? vt.userId);
        if (!uid || seenSpareUserId.has(uid)) return false;
        seenSpareUserId.add(uid);
        return true;
      });
      // Use in-memory items for the current week only (weekAssignments)
      const weekAssignmentsForSpare = allOperations.filter((op) => {
        const dateKey = String(op.date || "").split('T')[0]; // Normalize date to yyyy-mm-dd format
        return weekDates.includes(dateKey);
      });
      const weekPlannerOnly = weekAssignmentsForSpare.filter((op) => {
        const raw = op.raw as Record<string, unknown> | undefined;
        if (op.weekPlannerId != null && op.weekPlannerId < 0) return false;
        if (raw?.dailyTeamSupportId != null) return false;
        if (raw?.dailyTeamSupportId != null) return false;
        return true;
      });
      const dailyTeamSupportOnly = weekAssignmentsForSpare.filter((op) => {
        const raw = op.raw as Record<string, unknown> | undefined;
        if (op.weekPlannerId != null && op.weekPlannerId < 0) return true;
        // Verificar ambas as grafias: DB usa "suport" (typo), API pode normalizar para "support"
        if (raw?.dailyTeamSupportId != null) return true;
        if (raw?.dailyTeamSupportId != null) return true;
        return false;
      });
      const userIdsWithWeekPlannerByDate = new Map<string, Set<number>>();
      const userIdsWithDailyTeamSupportByDate = new Map<string, Set<number>>();
      // Conjunto global de userIds que têm daily-team-support em qualquer dia desta semana.
      // Regra: não criar day-off (day-off-spare) para estes utilizadores em dia nenhum.
      // Fetch fresco da API para evitar race condition com allOperations desatualizado.
      const userIdsWithDailyTeamSupportAny = new Set<number>();
      try {
        const freshDtsRecords = await freshDtsRecordsPromise;
        if (!freshDtsRecords) {
          throw new Error("daily-team-support fetch failed");
        }
        freshDtsRecords.forEach((dts) => {
          const raw = dts as unknown as Record<string, unknown>;
          const uId = toPositiveNumber(raw.userId ?? raw.userId);
          if (uId) userIdsWithDailyTeamSupportAny.add(uId);
        });
      } catch {
        // Fallback: usar dados do estado em memória se o fetch falhar
        dailyTeamSupportOnly.forEach((op) => {
          const raw = (op.raw ?? {}) as Record<string, unknown>;
          const dId = toPositiveNumber(raw.userId ?? raw.userId);
          const uId = toPositiveNumber(raw.userId ?? raw.userId);
          if (dId) userIdsWithDailyTeamSupportAny.add(dId);
          if (uId) userIdsWithDailyTeamSupportAny.add(uId);
        });
      }
      datesForSpare.forEach((d) => {
        userIdsWithWeekPlannerByDate.set(d, new Set());
        userIdsWithDailyTeamSupportByDate.set(d, new Set());
      });
      const addIdsForDate = (dateStr: string, raw: Record<string, unknown>, map: Map<string, Set<number>>) => {
        if (!dateStr) return;
        const set = map.get(dateStr);
        if (!set) return;
        const vendorUserIdVal = toPositiveNumber(raw.userId ?? raw.userId);
        if (vendorUserIdVal) set.add(vendorUserIdVal);
      };
      weekPlannerOnly.forEach((op) => {
        const dateStr = String(op.date ?? "").slice(0, 10);
        const raw = (op.raw ?? {}) as Record<string, unknown>;
        addIdsForDate(dateStr, raw, userIdsWithWeekPlannerByDate);
      });
      dailyTeamSupportOnly.forEach((op) => {
        const dateStr = String(op.date ?? "").slice(0, 10);
        const raw = (op.raw ?? {}) as Record<string, unknown>;
        addIdsForDate(dateStr, raw, userIdsWithDailyTeamSupportByDate);
        // userIdsWithDailyTeamSupportAny já foi populado via fetch fresco da API acima.
        // O forEach aqui mantém userIdsWithDailyTeamSupportByDate por data (usado nos checks por dia).
      });
      validatedPayload.forEach((wp) => {
        const dateStr = String((wp as Record<string, unknown>).date ?? "").slice(0, 10);
        const raw = wp as Record<string, unknown>;
        addIdsForDate(dateStr, raw, userIdsWithWeekPlannerByDate);
      });
      const dayOffSpareItems: Array<{ userId: number; date: string }> = [];
      const dayOffSpareKeys = new Set<string>();
      for (const vendor of spareVendors) {
        const v = vendor as Record<string, unknown>;
        const vendorUserId = toPositiveNumber(v.userId ?? v.userId ?? v.userId ?? v.userId);
        if (!vendorUserId) continue;
        // Management & Support is not a route assignment. Spare/admin/supervisor
        // still need NotAllocated for each day where no week-planner route exists.
        for (const dateStr of datesForSpare) {
          const assignedWp = userIdsWithWeekPlannerByDate.get(dateStr);
          const matchId = vendorUserId ?? vendorUserId;
          if (assignedWp?.has(matchId)) continue;
          const key = `${vendorUserId}|${dateStr}`;
          if (dayOffSpareKeys.has(key)) continue;
          dayOffSpareKeys.add(key);
          dayOffSpareItems.push({ userId: vendorUserId, date: dateStr });
        }
      }
      const uniqueDayOffSpareItems = Array.from(
        new Map(
          dayOffSpareItems.map((item) => [`${item.userId}|${item.date}`, item])
        ).values()
      );

      // POST not-allocated for regular vendors (non-spare) who have no week-planner entry for any future day.
      // Reuses vendorsFromApi, userIdsWithWeekPlannerByDate, userIdsWithDailyTeamSupportByDate,
      // userIdsWithDailyTeamSupportAny and datesForSpare — all already built above.
      const regularVendorsForNalc = (Array.isArray(vendorsFromApi) ? vendorsFromApi : []).filter((v) => {
        const vt = v as Record<string, unknown>;
        const dt = Number(vt.vendorTypeId ?? vt.vendorTypeId ?? 0);
        const ut = Number(vt.userTypeId ?? vt.userTypeId ?? 0);
        // Spare vendors (dt=7) and special user types (ADMIN/SUPERVISOR) are already handled by day-off-spare above.
        return dt !== 7 && ut !== BUSINESS_RULES.USER_TYPE.ADMIN && ut !== BUSINESS_RULES.USER_TYPE.SUPERVISOR;
      });
      const seenRegularUserId = new Set<number>();
      const uniqueRegularVendors = regularVendorsForNalc.filter((v) => {
        const vt = v as Record<string, unknown>;
        const uid = toPositiveNumber(vt.userId ?? vt.userId);
        if (!uid || seenRegularUserId.has(uid)) return false;
        seenRegularUserId.add(uid);
        return true;
      });
      const notAllocatedItems: Array<{ userId: number; date: string }> = [];
      const notAllocatedKeys = new Set<string>();
      for (const vendor of uniqueRegularVendors) {
        const v = vendor as Record<string, unknown>;
        const regularVendorUserId = toPositiveNumber(v.userId ?? v.userId ?? v.userId ?? v.userId);
        if (!regularVendorUserId) continue;
        // Skip vendors that have daily-team-support in any day this week
        if (
          userIdsWithDailyTeamSupportAny.has(regularVendorUserId) ||
          (regularVendorUserId && userIdsWithDailyTeamSupportAny.has(regularVendorUserId))
        ) continue;
        for (const dateStr of datesForSpare) {
          const assignedWp = userIdsWithWeekPlannerByDate.get(dateStr);
          const assignedDts = userIdsWithDailyTeamSupportByDate.get(dateStr);
          const matchId = regularVendorUserId ?? regularVendorUserId;
          if (assignedWp?.has(matchId)) continue; // already has a week-planner or was included in validatedPayload
          if (assignedDts?.has(matchId)) continue; // has daily-team-support for this day
          const key = `${regularVendorUserId}|${dateStr}`;
          if (notAllocatedKeys.has(key)) continue;
          notAllocatedKeys.add(key);
          notAllocatedItems.push({ userId: regularVendorUserId, date: dateStr });
        }
      }

      // Combine spare (day-off-spare) and regular (not-allocated) items into a single request
      const allNotAllocatedItems = Array.from(
        new Map(
          [...uniqueDayOffSpareItems, ...notAllocatedItems].map((item) => [`${item.userId}|${item.date}`, item])
        ).values()
      );

      if (allNotAllocatedItems.length > 0) {
        try {
          const nalcRes = await guardedFetch(`${API_BASE_URL}/bff/week-planners/not-allocated`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...getBearerAuthHeader(),
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
            cache: "no-store",
            body: JSON.stringify({ items: allNotAllocatedItems }),
          });
          if (!nalcRes.ok) {
            console.warn("[handleSaveWeek] not-allocated bulk failed:", nalcRes.status, await nalcRes.text());
          } else {
            setRefreshTrigger((prev) => prev + 1);
          }
        } catch (nalcErr) {
          console.warn("[handleSaveWeek] not-allocated bulk error:", nalcErr);
        }
      }

      // Build success message with information about created records
      // duplicatesCount is already declared above
      let successMessage = '';
      let successDetails = '';
      const createdCount = weekPlannerBulkItems.length;
      const updatedCount = patchAssignments.length;
      const totalSavedCount = createdCount + updatedCount;

      if (totalSavedCount > 0) {
        if (createdCount > 0 && updatedCount > 0) {
          successMessage = `${createdCount} assignment(s) created and ${updatedCount} updated successfully.`;
          successDetails = 'All pending changes for this week were saved to the database.';
        } else if (createdCount > 0) {
          successMessage = `${createdCount} assignment(s) created successfully.`;
          successDetails = 'All new assignments for this week have been saved to the database.';
        } else {
          successMessage = `${updatedCount} assignment(s) updated successfully.`;
          successDetails = 'All edited assignments for this week have been saved to the database.';
        }

        setInfoModalData({
          type: 'success',
          title: 'Week Saved Successfully',
          message: successMessage,
          details: successDetails
        });

        // After a successful save, force local state to be rebuilt from backend data only.
        // This avoids showing draft/in-memory rows together with persisted rows.
        setAllOperations([]);
        await refreshAssignments();
        setSaveWeekBaselineFingerprint('');
      } else {
        setInfoModalData({
          type: 'info',
          title: 'Nothing to Save',
          message: 'No new assignments were detected for this week.',
          details: 'No changes were sent because all current items were already saved.',
        });
      }
      setShowInfoModal(true);
      setSaveWeekBaselineFingerprint(savableWeekFingerprint);
      // Após submeter/salvar a semana, bloquear alterações locais nesta view
      setIsWeekLocked(true);
    } catch (error) {
      console.error("Error saving week:", error);
      if (
        error instanceof Error &&
        (error.message.includes("Invalid token") || error.message.includes("Authentication token not found"))
      ) {
        handleAuthError(error.message);
        return;
      }
      setInfoModalData({
        type: 'error',
        title: 'Error Saving Week',
        message: error instanceof Error ? error.message : "Failed to save week.",
        details: 'Please try again or contact support if the problem persists.'
      });
      setShowInfoModal(true);
    }
  }, [selectedDate, allOperations, dayOffEntries, handleAuthError, vendors, routes, setRefreshTrigger, refreshAssignments, plannerData.depositsWithRoutes, isSupervisorReadonly, showSupervisorReadonlyMessage, showWeekends, fetchVendorsRaw, isWeekLocked, hasUnsavedChanges, savableWeekFingerprint, setAllOperations]);


  const handleDayOffChange = useCallback((entries: PlannerDayOffEntry[]) => {
    setDayOffEntries(entries);
    // Trigger refresh to fetch updated data from API
    setRefreshTrigger((prev) => prev + 1);
  }, [setDayOffEntries, setRefreshTrigger]);

  const handleAssignWeek = useCallback(async (assignment: WeekPlannerRecord, excludeWeekends: boolean) => {
    if (!assignment) {
      throw new Error('Invalid assignment');
    }

    // Session validation handled by API.

    // Use the assignment's own date as the week anchor so that "Assign Week" always
    // iterates over the week that contains the clicked cell, regardless of the current
    // navigation state (selectedDate may point to a different week).
    const anchorDate = assignment.date
      ? String(assignment.date).split('T')[0]
      : selectedDate;
    const weekDates = getWeekDates(anchorDate);

    // Filter out weekends if excludeWeekends is true
    let datesToAssign = excludeWeekends
      ? weekDates.filter((date) => !isWeekend(date))
      : weekDates;

    // Get vendor and route info from assignment
    const raw = assignment.raw as Record<string, unknown>;
    const userId = Number(raw.userId || 0);
    // routeId can be at top level or inside route object (API returns route: { routeId: 2, ... })
    const routeId = Number(
      raw.routeId ??
      (raw.route && typeof raw.route === 'object' ? (raw.route as Record<string, unknown>).routeId : null) ??
      0
    );

    const vehicleId = Number(raw.vehicleId || 0);

    if (!userId) {
      throw new Error('Assignment is missing required field (vendor)');
    }

    // Find the route to get route name (routeId is optional)
    const route = routeId && routeId > 0
      ? routes.find((r) => r.routeId === routeId || r.routeDefaultId === routeId)
      : null;

    // Find the vendor to get vendor name
    const vendor = vendors.find((d) => d.userId === userId);

    // Task 3 (BAOP): células BAOP permitem múltiplos vendors na mesma rota+dia.
    // Em "Assign Week" de um item BAOP NÃO devemos excluir assignments de OUTROS
    // vendors da mesma rota+dia — caso contrário, atribuir um 2º vendor remove o
    // que foi gerado anteriormente (bug: "o recém gerado é excluído").
    const isBaopMultiVendorCell = isBAOPRoute(routeId, route);

    // Helper: extract routeId from op.raw
    // API can return routeId in multiple locations: top-level, nested in route object, or as routeDefaultId
    // routeDefaultId is used for routes without a specific routeId (flex routes, defaults)
    const getOpRouteId = (opRaw: Record<string, unknown>): number => {
      const topLevel = opRaw.routeId ?? opRaw.routeDefaultId;
      if (topLevel != null) return Number(topLevel);
      if (opRaw.route && typeof opRaw.route === 'object') {
        const routeObj = opRaw.route as Record<string, unknown>;
        return Number(routeObj.routeId ?? routeObj.routeDefaultId ?? 0);
      }
      return 0;
    };

    // Helper: normalize date to YYYY-MM-DD for consistent comparison (API may return "2026-03-11T03:00:00.000Z")
    const toDateKey = (d: string | undefined): string => (d ? String(d).split('T')[0].trim() : '');

    // Assignment's depositId - cell is (depositId, routeId, date)
    const assignmentDepositId = Number(
      raw.depositId ??
      (raw.route && typeof raw.route === 'object'
        ? (raw.route as Record<string, unknown>).depositId
        : null) ??
      0
    );

    // adhocServiceId differentiates multiple adhoc services sharing the same DHOC routeId placeholder.
    // Also check raw.adhocService.adhocServiceId: the EditAssignmentModal may set adhocServiceId:undefined
    // (clearing the top-level field) while leaving the nested adhocService object intact.
    const assignmentAdhocServiceId = (() => {
      if (raw.adhocServiceId != null) return Number(raw.adhocServiceId);
      const svc = raw.adhocService;
      if (svc && typeof svc === 'object') {
        const id = (svc as Record<string, unknown>).adhocServiceId;
        if (id != null) return Number(id);
      }
      return null;
    })();

    // Check if this route+day cell has ANY week-planner assignment (any vendor). If yes, skip - do not create.
    // Cell = (depositId, routeId, date) - same route can exist in different deposits as separate cells.
    // Exclude the assignment we're editing when it's a draft (weekPlannerId <= 0) - so we can "fill" that day with Assign Week.
    const assignmentDateStr = toDateKey(assignment.date);
    const isDraftAssignment = !assignment.weekPlannerId || assignment.weekPlannerId <= 0;

    // Regra geral para Assign Week (inclui Add Flex Route):
    // Incluir todos os dias da semana que sejam futuros em relação a HOJE.
    // Dias atuais e anteriores são ignorados (conforme solicitado pelo usuário).
    {
      const today = getLocalDateString();
      datesToAssign = datesToAssign.filter((d) => formatDate(d, 'yyyy-mm-dd') > today);
    }

    let skippedHolidayCount = 0;
    if (bankHolidays.size > 0) {
      const before = datesToAssign.length;
      datesToAssign = datesToAssign.filter((d) => !bankHolidays.has(formatDate(d, 'yyyy-mm-dd')));
      skippedHolidayCount = before - datesToAssign.length;
    }

    // Helper: find an existing assignment for the SAME vendor+route on a given date.
    // Used to update existing records instead of skipping them.
    // IMPORTANT: Also matches draft assignments (weekPlannerId === 0) to avoid creating duplicates
    const findSameVendorRouteAssignment = (dateStr: string): WeekPlannerRecord | null => {
      return allOperations.find((op) => {
        if (toDateKey(op.date) !== dateStr) return false;
        if (op.weekPlannerId != null && op.weekPlannerId < 0) return false; // exclude management support
        const opRaw = (op.raw ?? {}) as Record<string, unknown>;
        if (opRaw.dailyTeamSupportId != null) return false;
        const opVendorId = Number(opRaw.userId || 0);
        if (opVendorId !== userId) return false;
        if (routeId && routeId > 0) {
          const opRouteId = getOpRouteId(opRaw);
          if (opRouteId !== routeId) return false;
          // For BRTE routes (routeId 55): strict deposit ID matching
          // Different deposits = different logical routes even if routeId is same
          // For other routes: deposit ID is optional/less critical
          if (assignmentDepositId > 0) {
            const opDepositId = Number(
              opRaw.depositId ??
              (opRaw.route && typeof opRaw.route === 'object'
                ? (opRaw.route as Record<string, unknown>).depositId
                : null) ??
              0
            );
            if (opDepositId > 0 && opDepositId !== assignmentDepositId) return false;
          }
          // For adhoc services (same DHOC routeId): different adhocServiceId = different logical assignment
          if (assignmentAdhocServiceId != null) {
            const opAdhocServiceId = opRaw.adhocServiceId != null ? Number(opRaw.adhocServiceId) : null;
            if (opAdhocServiceId != null && opAdhocServiceId !== assignmentAdhocServiceId) return false;
          }
          return true;
        }
        // Fallback: match by route name
        return String(op.route || '').trim() === String(assignment.route || '').trim();
      }) ?? null;
    };

    // Assign Week: fill empty days with new assignments AND update existing assignments
    // for the same vendor+route with the new values from the modal.
    // Days that already have a DIFFERENT vendor on the same route cell: DELETE old vendor, add new one.
    const newAssignments: WeekPlannerRecord[] = [];
    const updatedAssignments: Array<{ existing: WeekPlannerRecord; updated: WeekPlannerRecord }> = [];
    const assignmentsToDeleteIds: (string | number)[] = [];

    // Normalizar sort a partir do assignment + raw (computed once, reused for all days)
    const sortValue = (() => {
      let val: string | undefined;
      if (assignment.routeSort) {
        val = String(assignment.routeSort);
      } else if (raw.routeSort != null) {
        val = String(raw.routeSort);
      } else if (raw.isSort != null) {
        const rs = raw.isSort;
        const isYes =
          rs === true ||
          rs === 'true' ||
          rs === 1 ||
          rs === '1' ||
          String(rs).toLowerCase() === 'yes';
        val = isYes ? 'yes' : 'no';
      }
      const norm = String(val ?? 'yes').toLowerCase();
      if (norm === 'no' || norm === '0' || norm === 'false') return 'no';
      return 'yes';
    })();

    for (const date of datesToAssign) {
      const dateStr = formatDate(date, 'yyyy-mm-dd');

      // CRITICAL: Check for OTHER vendor assignments to delete FIRST
      // This must happen BEFORE Priority 1, so ALL other vendors are deleted even on the draft's own date
      // Use filter() to find ALL other vendors (not just the first one)
      // Task 3: em células BAOP (multi-vendor) não removemos outros vendors.
      const otherVendorAssignments = isBaopMultiVendorCell ? [] : allOperations.filter((op) => {
        if (toDateKey(op.date) !== dateStr) return false;
        if (op.weekPlannerId != null && op.weekPlannerId < 0) return false; // exclude management support
        const opRaw = (op.raw ?? {}) as Record<string, unknown>;
        if (opRaw.dailyTeamSupportId != null) return false;
        const opVendorId = Number(opRaw.userId || 0);
        // Find assignments from DIFFERENT vendors on same route
        if (opVendorId === userId) return false; // same vendor, don't delete

        // IMPORTANT: Only delete if we can reliably match the route
        // Don't use fallback string comparison - it's too risky and can delete from other routes
        if (routeId && routeId > 0) {
          const opRouteId = getOpRouteId(opRaw);
          if (opRouteId !== routeId) return false;
          // Check deposit match
          if (assignmentDepositId > 0) {
            const opDepositId = Number(opRaw.depositId ?? (opRaw.route && typeof opRaw.route === 'object' ? (opRaw.route as Record<string, unknown>).depositId : null) ?? 0);
            if (opDepositId > 0 && opDepositId !== assignmentDepositId) return false;
          }
          // For adhoc services: different adhocServiceId = independent service, do not delete
          if (assignmentAdhocServiceId != null) {
            const opAdhocServiceId = opRaw.adhocServiceId != null ? Number(opRaw.adhocServiceId) : null;
            if (opAdhocServiceId != null && opAdhocServiceId !== assignmentAdhocServiceId) return false;
          }
          return true; // different vendor, same route+date, same adhoc service (or non-adhoc)
        }

        // If we don't have a valid routeId, we cannot safely delete other assignments
        // because we can't be sure they're from the same route
        return false;
      });

      // Collect ALL other vendors to delete
      for (const otherVendorAssignment of otherVendorAssignments) {
        // CRITICAL: For drafts (weekPlannerId <= 0), ALWAYS use string ID to avoid ambiguity
        // Multiple drafts can have weekPlannerId=0, so using just "0" causes wrong deletions
        const idToDelete = otherVendorAssignment.weekPlannerId !== null && otherVendorAssignment.weekPlannerId !== undefined && otherVendorAssignment.weekPlannerId > 0
          ? otherVendorAssignment.weekPlannerId
          : `draft-${otherVendorAssignment.date}-${Number((otherVendorAssignment.raw as Record<string, unknown>)?.userId ?? 0)}-${getOpRouteId((otherVendorAssignment.raw as Record<string, unknown>))}-${getAdhocServiceIdentity(otherVendorAssignment.raw as Record<string, unknown>)}`;
        assignmentsToDeleteIds.push(idToDelete);
      }

      // Priority 1: If this is the draft's own date, use the modal data directly.
      // Must be checked BEFORE findSameVendorRouteAssignment, because the draft itself
      // (weekPlannerId=0) would otherwise be matched as an "existing same-vendor assignment"
      // and then lost when the draft-cleanup step removes it from state.
        // IMPORTANT: strip __draftKey and flex-draft flags so handleCloseEditAssignmentModal
      // does not treat this as a pending draft and accidentally delete it.
      if (isDraftAssignment && dateStr === assignmentDateStr) {
        const assignWithDate = { ...assignment, date: dateStr };
        const assignRaw = (assignWithDate.raw ?? {}) as Record<string, unknown>;
        const { __draftKey, __isFlex_draft, __is_flex_draft, ...cleanRaw } = assignRaw;
        // Verify no duplicate will be created by checking existing operations
        // Important: skip self-comparison (the draft itself) to avoid false positives
        const hasDraftDuplicate = allOperations.some((op) => {
          // Exclude self (the draft being processed)
          if (op.weekPlannerId === assignment.weekPlannerId) return false;

          if (toDateKey(op.date) !== dateStr) return false;
          if (op.weekPlannerId != null && op.weekPlannerId < 0) return false;
          const opRaw = (op.raw ?? {}) as Record<string, unknown>;
          const opVendorId = Number(opRaw.userId || 0);
          if (opVendorId !== userId) return false;
          if (routeId && routeId > 0) {
            const opRouteId = getOpRouteId(opRaw);
            return opRouteId === routeId;
          }
          return String(op.route || '').trim() === String(assignment.route || '').trim();
        });
        if (!hasDraftDuplicate) {
          newAssignments.push({
            ...assignWithDate,
            raw: { ...cleanRaw, date: dateStr },
          });
        }
        continue;
      }

      // Priority 2: Check if the same vendor+route already has a SAVED assignment for this day → UPDATE it.
      const existingForSameVendor = findSameVendorRouteAssignment(dateStr);
      if (existingForSameVendor) {
        const existingRaw = (existingForSameVendor.raw ?? {}) as Record<string, unknown>;
        const updatedRecord: WeekPlannerRecord = {
          ...existingForSameVendor,
          vehicle: assignment.vehicle || existingForSameVendor.vehicle,
          registrationPlate: assignment.registrationPlate || existingForSameVendor.registrationPlate,
          routeSort: sortValue,
          notes: assignment.notes !== undefined ? assignment.notes : existingForSameVendor.notes,
          isSort: sortValue === 'yes' ? 'true' : 'false',
          raw: {
            ...existingRaw,
            userId: userId,
            vehicleId: raw.vehicleId !== undefined ? raw.vehicleId : existingRaw.vehicleId,
            costModelId: (raw.costModelId !== undefined && raw.costModelId !== null) ? Number(raw.costModelId) : existingRaw.costModelId,
            isSort: sortValue === 'yes',
            routeSort: sortValue,
            adhocServiceId: (raw.adhocServiceId !== undefined && raw.adhocServiceId !== null) ? Number(raw.adhocServiceId) : existingRaw.adhocServiceId,
            depositId: (raw.depositId !== undefined && raw.depositId !== null) ? Number(raw.depositId) : existingRaw.depositId,
            costModel: (raw.costModel !== undefined && raw.costModel !== null) ? raw.costModel as Record<string, unknown> : existingRaw.costModel,
            __locallyModified: true, // IMPORTANT: Ensure handleSaveWeek sees this change for PATCH
          },
        };
        updatedAssignments.push({ existing: existingForSameVendor, updated: updatedRecord });
        continue;
      }

      // Priority 3: Create new assignment (for days without same vendor or other vendor)
      newAssignments.push({
        weekPlannerId: 0, // Will be assigned by backend when saved
        date: dateStr,
        route: String(route?.routeName || route?.routeDefaultName || (routeId ? String(routeId) : "")),
        name: vendor?.fullName || assignment.name,
        routeSort: sortValue,
        adhocSort: assignment.adhocSort || '',
        notes: assignment.notes || '',
        reason: "", // DB schema has no "reason" column; keep it embedded in notes instead
        vehicle: assignment.vehicle || '',
        registrationPlate: assignment.registrationPlate || '',
        status: assignment.status || BUSINESS_RULES.WORKING_STATUS.WORKING,
        isDayOff: assignment.isDayOff || 'false',
        isSort: sortValue === 'yes' ? 'true' : 'false',
        raw: {
          date: dateStr,
          userId: userId,
          routeId: routeId && routeId > 0 ? routeId : null,
          routeDefaultId:
            route?.routeId || route?.routeDefaultId || (routeId && routeId > 0 ? routeId : null),
          depositId: assignmentDepositId > 0 ? assignmentDepositId : undefined,
          vehicleId: vehicleId && vehicleId > 0 ? vehicleId : null,
          status: assignment.status || BUSINESS_RULES.WORKING_STATUS.WORKING,
          isDayOff: assignment.isDayOff === 'true',
          isSort: sortValue === 'yes',
          // Propagate adhoc identity so AdHocServicesSection can render this assignment
          // in the correct row and Fix 3 can protect it from cross-service deletion.
          ...(assignmentAdhocServiceId != null ? { adhocServiceId: assignmentAdhocServiceId } : {}),
          ...(assignmentAdhocServiceId != null && raw.adhocService != null ? { adhocService: raw.adhocService } : {}),
          ...(assignmentAdhocServiceId != null && raw.adhocName != null ? { adhocName: raw.adhocName } : {}),
          ...(assignmentAdhocServiceId != null && raw.depositName != null ? { depositName: raw.depositName } : {}),
        },
      });
    }

    // "Assign Week" confirms the modal just like Save does — if `assignment` is itself a
    // pending NotAllocated→assignment patch (see handleDrop), mark it confirmed so
    // handleCloseEditAssignmentModal doesn't revert the very day we just assigned here.
    if (notAllocatedPatchSnapshotsRef.current.has(assignment.weekPlannerId)) {
      notAllocatedPatchConfirmedRef.current.add(assignment.weekPlannerId);
    }

    // Apply updates and creates to local state.
    // When we included the draft's date, remove the old draft to avoid duplicates.
    // Also remove any assignments from different vendors on the same route+date cell.
    setAllOperations((prev) => {
      let next = prev;
      // Only remove the original draft when its date is actually going to be re-processed by Priority 1.
      // If the draft's date is in the past (excluded from datesToAssign), the draft is never re-created,
      // so we must NOT remove it here — otherwise the assignment is permanently lost from state.
      const draftDateWillBeProcessed = datesToAssign.some(d => formatDate(d, 'yyyy-mm-dd') === assignmentDateStr);
      if (isDraftAssignment && assignmentDateStr && draftDateWillBeProcessed) {
        next = prev.filter((op) => {
          if (op.weekPlannerId != null && op.weekPlannerId > 0) return true; // keep persisted
          if (toDateKey(op.date) !== assignmentDateStr) return true; // keep other dates
          const opRaw = (op.raw ?? {}) as Record<string, unknown>;
          const opRouteId = getOpRouteId(opRaw);
          if (opRouteId !== routeId) return true; // keep other routes
          // Remove only this vendor's draft for this adhoc service, not other adhoc services or vendors
          const opUserId = Number(opRaw.userId || 0);
          if (opUserId !== userId) return true; // keep other vendors' drafts
          if (assignmentAdhocServiceId != null) {
            const opAdhocServiceId = opRaw.adhocServiceId != null ? Number(opRaw.adhocServiceId) : null;
            if (opAdhocServiceId != null && opAdhocServiceId !== assignmentAdhocServiceId) return true; // keep different adhoc service's draft
          }
          return false; // remove this vendor's draft for this adhoc service (same date + route + vendor)
        });
      }
      // Remove assignments from different vendors on same route+date cells
      if (assignmentsToDeleteIds.length > 0) {
        next = next.filter((op) => {
          // CRITICAL: Same logic as collection - for drafts (weekPlannerId <= 0), use string ID
          const opId = op.weekPlannerId !== null && op.weekPlannerId !== undefined && op.weekPlannerId > 0
            ? op.weekPlannerId
            : `draft-${op.date}-${Number((op.raw as Record<string, unknown>)?.userId ?? 0)}-${getOpRouteId((op.raw as Record<string, unknown>))}-${getAdhocServiceIdentity(op.raw as Record<string, unknown>)}`;
          const shouldKeep = !assignmentsToDeleteIds.includes(opId);
          return shouldKeep;
        });
      }
      // Apply in-place updates for existing same-vendor assignments
      if (updatedAssignments.length > 0) {
        next = next.map((op) => {
          const match = updatedAssignments.find((u) => u.existing === op);
          return match ? match.updated : op;
        });
      }
      return [...next, ...newAssignments];
    });

    const totalChanged = updatedAssignments.length + newAssignments.length;
    const holidaySkipNote = skippedHolidayCount > 0 ? ` Skipped ${skippedHolidayCount} bank holiday(s).` : '';
    setInfoModalData({
      type: 'success',
      title: 'Week Assigned',
      message: totalChanged > 0
        ? `Updated ${updatedAssignments.length} existing day(s) and created ${newAssignments.length} new assignment(s) for the week.${holidaySkipNote}`
        : `All days already have week-planner items for a different vendor on this route. No changes were made.${holidaySkipNote}`,
      details: excludeWeekends
        ? 'Applied to Mon–Fri. Existing assignments for the same vendor were updated; empty days were filled.'
        : 'Applied to all week days. Existing assignments for the same vendor were updated; empty days were filled.'
    });
    setShowInfoModal(true);
  }, [selectedDate, allOperations, routes, vendors, setAllOperations, bankHolidays]);

  const handleAssignmentDelete = async (assignment: WeekPlannerRecord, options?: { forceDelete?: boolean }) => {
    if (!isEditableDate(assignment.date)) {
      showDateReadonlyMessage(assignment.date);
      return;
    }

    // Unsaved/local-only assignments (weekPlannerId <= 0) must be deleted locally.
    // Otherwise we risk calling DELETE /bff/week-planners/0.
    if (!assignment.weekPlannerId || assignment.weekPlannerId <= 0) {
      const raw = (assignment.raw ?? {}) as Record<string, unknown>;
      const assignVendorId = raw.userId !== undefined ? String(raw.userId) : "";
      const assignRouteId = raw.routeId !== undefined ? String(raw.routeId) : "";
      const assignSort = raw.adhocSort !== undefined ? String(raw.adhocSort) : "";
      const assignDepositId = raw.depositId !== undefined ? String(raw.depositId) : "";
      const assignAdhocServiceId = getAdhocServiceIdentity(raw);
      const assignDraftKey = getDraftKey(assignment);
      // Normalize date to YYYY-MM-DD format to handle different timestamp formats
      const assignDateNorm = String(assignment.date ?? "").split('T')[0].trim();
      const assignNotes = String(assignment.notes ?? raw.notes ?? "");

      setAllOperations((prev) =>
        prev.filter((op) => {
          // First check: must be the exact same object (for direct reference comparison)
          if (op === assignment) return false;
          // Keep all persisted assignments (weekPlannerId > 0)
          if (op.weekPlannerId && op.weekPlannerId > 0) return true;

          const opRaw = (op.raw ?? {}) as Record<string, unknown>;
          const opDraftKey = getDraftKey(op);
          if (assignDraftKey || opDraftKey) {
            return opDraftKey !== assignDraftKey;
          }

          const opVendorId = opRaw.userId !== undefined ? String(opRaw.userId) : "";
          const opRouteId = opRaw.routeId !== undefined ? String(opRaw.routeId) : "";
          const opSort = opRaw.adhocSort !== undefined ? String(opRaw.adhocSort) : "";
          const opDepositId = opRaw.depositId !== undefined ? String(opRaw.depositId) : "";
          const opAdhocServiceId = getAdhocServiceIdentity(opRaw);
          // Normalize date the same way
          const opDateNorm = String(op.date ?? "").split('T')[0].trim();
          const opNotes = String(op.notes ?? opRaw.notes ?? "");

          // For drafts: match EXACTLY on date + vendor + route + adhoc service + sort + deposit + notes
          // Date MUST match (normalized to YYYY-MM-DD) to avoid removing wrong days
          const same =
            opDateNorm === assignDateNorm &&
            opVendorId === assignVendorId &&
            opRouteId === assignRouteId &&
            opAdhocServiceId === assignAdhocServiceId &&
            opSort === assignSort &&
            opDepositId === assignDepositId &&
            opNotes === assignNotes;
          return !same; // Keep if not same, remove if same
        }),
      );
      return;
    }

    // Check if it's a Management and Support assignment
    const isManagementSupport =
      assignment.weekPlannerId === 0 || // Management Support assignments have weekPlannerId: 0
      (assignment.raw as Record<string, unknown> | undefined)?.category === "management" ||
      String(assignment.route || "").toLowerCase().includes("management and support");

    // If it's Management and Support, check if it has dailyTeamSupportId (saved in database)
    if (isManagementSupport) {
      const raw = assignment.raw as Record<string, unknown> | undefined;
      const dailyTeamSupportId = raw?.dailyTeamSupportId ? Number(raw.dailyTeamSupportId) : null;

      // If it has dailyTeamSupportId, it's saved in database and needs to be deleted via API
      // The EditManagementSupportModal handles this case, but if called from here, we should refresh
      if (dailyTeamSupportId) {
        // This should be handled by EditManagementSupportModal, but if called from elsewhere, refresh
        setRefreshTrigger((prev) => prev + 1);
        return;
      }

      // If it doesn't have dailyTeamSupportId, it's only in local state (not saved in database)
      // Remove by matching the assignment object directly using all key properties
      setAllOperations((prev) => prev.filter((op) => {
        // Match by weekPlannerId if available and not 0
        if (op.weekPlannerId === assignment.weekPlannerId && op.weekPlannerId !== 0) {
          return false; // Remove this one
        }
        // For weekPlannerId === 0, match by date, userId, route, and name to ensure exact match
        if (op.weekPlannerId === 0 && assignment.weekPlannerId === 0) {
          const opDate = op.date;
          const opVendorId = (op.raw as Record<string, unknown> | undefined)?.userId;
          const opRoute = op.route;
          const opName = op.name;
          const opNotes = op.notes;

          const assignDate = assignment.date;
          const assignVendorId = (assignment.raw as Record<string, unknown> | undefined)?.userId;
          const assignRoute = assignment.route;
          const assignName = assignment.name;
          const assignNotes = assignment.notes;

          // Exact match on all properties to ensure we remove the correct assignment
          const isMatch = opDate === assignDate &&
            String(opVendorId) === String(assignVendorId) &&
            opRoute === assignRoute &&
            opName === assignName &&
            opNotes === assignNotes;

          return !isMatch; // Keep if not a match, remove if match
        }
        return true; // Keep all other assignments
      }));

      return;
    }

    // For regular assignments, use weekPlannerId to delete from backend
    const assignmentId = assignment.weekPlannerId;

    // For regular assignments, delete from backend
    if (!API_BASE_URL) {
      setInfoModalData({
        type: 'error',
        title: 'Configuration Error',
        message: 'API URL is not configured.',
      });
      setShowInfoModal(true);
      return;
    }

    // Session validation handled by API.

    // Check if the vendor has NO OTHER items in the ENTIRE WEEK. 
    // If the vendor has only 1 item in the week (the one being deleted), do a PATCH to NotAllocated.
    // If they have > 1 item in the week, do a real DELETE.
    const assignmentUserId = Number((assignment.raw as Record<string, unknown>)?.userId ?? 0);
    const assignmentDate = assignment.date ?? String((assignment.raw as Record<string, unknown>)?.date ?? "");
    let hasOtherOpsInWeek = false;

    if (assignmentDate) {
      // getWeekDates expects a Date, but can take a string if we are careful or we just convert
      const dateObj = new Date(assignmentDate.includes('T') ? assignmentDate : `${assignmentDate}T12:00:00Z`);
      const weekDatesStr = getWeekDates(dateObj).map(d => formatDate(d, 'yyyy-mm-dd'));

      const opsInWeek = allOperations.filter(op => {
        const opRaw = op.raw as Record<string, unknown>;
        const opUserId = Number(opRaw?.userId ?? 0);
        const opDate = op.date ? (op.date.includes('T') ? op.date.split('T')[0] : op.date) : '';
        return opUserId === assignmentUserId && weekDatesStr.includes(opDate) && op.weekPlannerId !== Number(assignmentId);
      });
      hasOtherOpsInWeek = assignmentUserId > 0 && opsInWeek.length > 0;
    }

    // When forceDelete is true (e.g. Day Off bulk removal), always DELETE from API — never PATCH to NotAllocated
    const isForceDelete = !!options?.forceDelete;
    const shouldDeleteReal = isForceDelete || hasOtherOpsInWeek;

    try {
      const authHeaders = {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      } as const;

      if (shouldDeleteReal) {
        // Vendor has other items this week (or this is a forced delete) — just delete this one
        const response = await guardedFetch(`${API_BASE_URL}/bff/week-planners/${assignmentId}`, {
          method: "DELETE",
          headers: authHeaders,
          cache: "no-store",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Delete error response:", errorText);
          if (response.status === 401 || response.status === 403) {
            handleAuthError("Invalid token. Please login again.");
            return;
          }
          throw new Error(`Failed to delete week planner (${response.status}): ${errorText || response.statusText}`);
        }

        removeWeekPlannerLocally(Number(assignmentId));
      } else {
        // Vendor has no other items this day — PATCH to NotAllocated to preserve the record
        const notAllocatedBody = {
          userId: assignmentUserId || undefined,
          routeId: nalcRouteId, // NALC — rota padrão para itens NotAllocated
          vehicleId: BUSINESS_RULES.VEHICLE.BAOP_DEFAULT_PLACEHOLDER,
          depositId: BUSINESS_RULES.DEPOSIT.BAOP_DEFAULT,
          status: BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED,
          isDayOff: false,
          isSort: false,
          adhocServiceId: null,
        };

        const response = await guardedFetch(`${API_BASE_URL}/bff/week-planners/${assignmentId}`, {
          method: "PATCH",
          headers: authHeaders,
          cache: "no-store",
          body: JSON.stringify(notAllocatedBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("NotAllocated patch error response:", errorText);
          if (response.status === 401 || response.status === 403) {
            handleAuthError("Invalid token. Please login again.");
            return;
          }
          throw new Error(`Failed to update week planner to NotAllocated (${response.status}): ${errorText || response.statusText}`);
        }

        // Update local state to reflect NotAllocated instead of removing the item
        setAllOperations((prev) =>
          prev.map((op) => {
            if (op.weekPlannerId !== Number(assignmentId)) return op;
            return {
              ...op,
              routeSort: 'no',
              isSort: 'false',
              status: BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED,
              raw: {
                ...op.raw,
                routeId: nalcRouteId, // NALC — rota padrão para itens NotAllocated
                vehicleId: BUSINESS_RULES.VEHICLE.BAOP_DEFAULT_PLACEHOLDER,
                depositId: BUSINESS_RULES.DEPOSIT.BAOP_DEFAULT,
                status: BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED,
                isDayOff: false,
                isSort: false,
                costModelId: 9,
                adhocService: {},
                adhocServiceId: null,
              },
            };
          })
        );
      }

      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error processing week planner removal:", err);
      if (
        err instanceof Error &&
        (err.message.includes("Invalid token") || err.message.includes("Authentication token not found"))
      ) {
        handleAuthError(err.message);
        return;
      }
      alert(err instanceof Error ? err.message : "Unexpected error when processing week planner removal");
    }
  };

  const handleRemoveDay = async (assignment: WeekPlannerRecord) => {
    if (!isEditableDate(assignment.date)) {
      showDateReadonlyMessage(assignment.date);
      return;
    }

    if (!API_BASE_URL) {
      setInfoModalData({
        type: 'error',
        title: 'Configuration Error',
        message: 'API URL is not configured.',
      });
      setShowInfoModal(true);
      return;
    }

    // Session validation handled by API.

    if (!assignment || !assignment.date) {
      setInfoModalData({
        type: 'warning',
        title: 'Invalid Data',
        message: 'Invalid assignment data.',
      });
      setShowInfoModal(true);
      return;
    }

    const raw = assignment.raw as Record<string, unknown>;
    const userId = Number(raw.userId || 0);
    const routeId = Number(raw.routeId || raw.routeDefaultId || 0);
    const assignmentDate = assignment.date;

    // Find assignments matching this vendor and route on this specific date
    // CRITICAL: For routeId 55 (BRTE), also validate depositId or depositName
    const assignmentDepositId = raw.depositId ? Number(raw.depositId) : null;
    const assignmentDepositName = (raw.depositName as string | undefined) ||
      ((assignment as Record<string, unknown>).depositName as string | undefined);
    const assignmentAdhocServiceId = getAdhocServiceIdentity(raw);

    const assignmentsToDelete = allOperations.filter(a => {
      if (a.date !== assignmentDate) return false;

      const aRaw = a.raw as Record<string, unknown>;
      const aVendorId = Number(aRaw.userId || 0);
      const aRouteId = Number(aRaw.routeId || aRaw.routeDefaultId || 0);
      const aAdhocServiceId = getAdhocServiceIdentity(aRaw);

      // Must match vendor and route
      if (aVendorId !== userId || aRouteId !== routeId) {
        return false;
      }

      // DHOC/ADHOC entries share the same routeId. The adhoc service is the real
      // logical row identity, so never remove sibling services for the same vendor/date.
      if (assignmentAdhocServiceId) {
        return aAdhocServiceId === assignmentAdhocServiceId;
      }

      // CRITICAL: For routeId 55 (BRTE), validate depositId or depositName
      if (routeId === BRTE_ROUTE_ID) {
        const aDepositId = aRaw.depositId ? Number(aRaw.depositId) : null;
        const aDepositName = (aRaw.depositName as string | undefined) ||
          ((a as Record<string, unknown>).depositName as string | undefined);

        // If assignment has depositId, compare by depositId
        if (assignmentDepositId !== null && aDepositId !== null) {
          return assignmentDepositId === aDepositId;
        }

        // If assignment has depositName, compare by depositName
        if (assignmentDepositName && aDepositName) {
          return assignmentDepositName.trim() === aDepositName.trim();
        }

        // If assignment doesn't have deposit info but the one to delete has, don't match
        if (assignmentDepositId === null && !assignmentDepositName && (aDepositId !== null || aDepositName)) {
          return false;
        }

        // If both don't have deposit info, allow match (shouldn't happen, but safety)
        if (assignmentDepositId === null && !assignmentDepositName && aDepositId === null && !aDepositName) {
          return true;
        }

        return false;
      }

      return true;
    });

    if (assignmentsToDelete.length === 0) {
      setInfoModalData({
        type: 'warning',
        title: 'No Assignments Found',
        message: 'No matching assignments found for this day.',
      });
      setShowInfoModal(true);
      return;
    }

    // Show confirmation modal
    setConfirmationData({
      title: 'Remove Assignment?',
      message: `Are you sure you want to remove this assignment?`,
      details: `${assignment.name || 'vendor'} - ${assignment.route || 'route'} on ${formatDate(assignmentDate, 'dd/mm/yyyy')}`,
      variant: 'danger',
      confirmText: 'Yes, Remove',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          // Filter out assignments that don't have a valid weekPlannerId (not saved yet)
          const validAssignmentsToDelete = assignmentsToDelete.filter(a =>
            typeof a.weekPlannerId === 'number' && a.weekPlannerId > 0
          );

          // Remove invalid assignments from local state only
          const invalidAssignments = assignmentsToDelete.filter(a =>
            !(typeof a.weekPlannerId === 'number' && a.weekPlannerId > 0)
          );

          invalidAssignments.forEach(a => {
            // For invalid assignments, remove by matching all fields since weekPlannerId is not valid
            setAllOperations((prev) => prev.filter((item) => {
              const itemRaw = item.raw as Record<string, unknown>;
              const aRaw = a.raw as Record<string, unknown>;
              return !(
                item.date === a.date &&
                Number(itemRaw.userId || 0) === Number(aRaw.userId || 0) &&
                (Number(itemRaw.routeId || itemRaw.routeDefaultId || 0) === Number(aRaw.routeId || aRaw.routeDefaultId || 0)) &&
                getAdhocServiceIdentity(itemRaw) === getAdhocServiceIdentity(aRaw)
              );
            }));
          });

          // Delete valid assignments from backend
          if (validAssignmentsToDelete.length > 0) {
            const deletePromises = validAssignmentsToDelete.map(a =>
              handleAssignmentDelete(a)
            );

            await Promise.all(deletePromises);
          }

          // Check if there are any pending items (unsaved, in-memory only)
          const hasPendingItems = allOperations.some(item => !item.weekPlannerId || item.weekPlannerId <= 0);

          // Only refresh if there are no pending items
          // If there are pending items, don't refresh to preserve them
          if (!hasPendingItems) {
            setRefreshTrigger((prev) => prev + 1);
          }

          setInfoModalData({
            type: 'success',
            title: 'Assignment Removed',
            message: `Successfully removed assignment for ${formatDate(assignmentDate, 'dd/mm/yyyy')}.`,
          });
          setShowInfoModal(true);
        } catch (err) {
          console.error("Error removing assignment:", err);
          setInfoModalData({
            type: 'error',
            title: 'Error Removing Assignment',
            message: err instanceof Error ? err.message : "Unexpected error when removing assignment",
          });
          setShowInfoModal(true);
        }
      },
    });
    setShowConfirmationModal(true);
  };

  const handleRemoveWeek = async (assignment: WeekPlannerRecord) => {
    // No upfront date-guard here: the function only operates on days >= tomorrow,
    // so clicking from today's cell is intentional and should proceed.
    if (!API_BASE_URL) {
      setInfoModalData({
        type: 'error',
        title: 'Configuration Error',
        message: 'API URL is not configured.',
      });
      setShowInfoModal(true);
      return;
    }

    // Session validation handled by API.

    if (!assignment) {
      setInfoModalData({
        type: 'warning',
        title: 'Invalid Data',
        message: 'Invalid assignment data.',
      });
      setShowInfoModal(true);
      return;
    }

    const raw = assignment.raw as Record<string, unknown>;
    const getAssigneeId = (source: Record<string, unknown> | undefined): number => {
      if (!source) return 0;
      const vendorObj = source.vendor && typeof source.vendor === 'object'
        ? (source.vendor as Record<string, unknown>)
        : undefined;
      const candidate = Number(
        source.userId ??
        source.userId ??
        vendorObj?.userId ??
        vendorObj?.userId ??
        0
      );
      return Number.isFinite(candidate) && candidate > 0 ? candidate : 0;
    };

    const assigneeId = getAssigneeId(raw);
    if (!assigneeId) {
      setInfoModalData({
        type: 'warning',
        title: 'Cannot Remove Week',
        message: 'Could not identify the selected vendor for week deletion.',
      });
      setShowInfoModal(true);
      return;
    }

    // Helper: normalize any date string to YYYY-MM-DD (handles ISO timestamps with T or space separators)
    const toDateKey = (d: string | undefined): string => {
      if (!d) return '';
      const s = String(d).trim();
      // Handle "2026-03-25T03:00:00.000Z" and "2026-03-25 00:00:00"
      return s.split('T')[0].split(' ')[0].trim();
    };

    // Helper function to get routeId (consistent with fetchOperations)
    const getRouteId = (op: WeekPlannerRecord): number => {
      const opRaw = op.raw as Record<string, unknown>;
      // First, try route object (most common structure from API)
      if (opRaw.route && typeof opRaw.route === 'object') {
        const routeObj = opRaw.route as Record<string, unknown>;
        if (routeObj.routeId) return Number(routeObj.routeId);
        if (routeObj.routeDefaultId) return Number(routeObj.routeDefaultId);
      }
      // Then try direct routeId at root level
      if (opRaw.routeId) return Number(opRaw.routeId);
      // Then try routeDefaultId at root level
      if (opRaw.routeDefaultId) return Number(opRaw.routeDefaultId);
      return 0;
    };

    const routeId = getRouteId(assignment);

    // Get week dates as normalized YYYY-MM-DD strings.
    // When the user triggers "Remove Week" from TODAY's cell, include today so the operation
    // doesn't silently produce "No Assignments Found" when today is the only assigned day.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDate(today, 'yyyy-mm-dd');
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = formatDate(tomorrow, 'yyyy-mm-dd');

    // Normalize assignment date (handles ISO timestamps with T or space separators)
    const clickedDateStr = assignment.date
      ? String(assignment.date).split('T')[0].split(' ')[0].trim()
      : '';
    // If the user explicitly removes the whole week from today's cell, include today.
    const weekStartStr = clickedDateStr === todayStr ? todayStr : tomorrowStr;

    const weekDates = getWeekDates(selectedDate);
    const weekDateSet = new Set(
      weekDates
        .map(d => formatDate(d, 'yyyy-mm-dd'))
        .filter(d => d >= weekStartStr)
    );

    // Find assignments matching this vendor+route across all week dates (tomorrow onwards only).
    // Also match by route name when routeId is 0 (flex/BRTE routes without a numeric ID).
    // CRITICAL: For routeId 55 (BRTE), also validate depositId or depositName.
    const assignmentDepositId = raw.depositId ? Number(raw.depositId) : null;
    const assignmentDepositName = (raw.depositName as string | undefined) ||
      ((assignment as Record<string, unknown>).depositName as string | undefined);
    const assignmentAdhocServiceId = getAdhocServiceIdentity(raw);

    const assignmentsToDelete = allOperations.filter(a => {
      // Normalize date before comparing (API may return ISO timestamps)
      if (!weekDateSet.has(toDateKey(a.date))) return false;

      const aRawInner = (a.raw ?? {}) as Record<string, unknown>;
      const aAssigneeId = getAssigneeId(aRawInner);
      const aRouteId = getRouteId(a);

      // Must match the same vendor (userId/userId-aware)
      if (aAssigneeId !== assigneeId) return false;

      // Must match route (by ID when available, fall back to route name)
      if (routeId > 0 && aRouteId > 0) {
        if (aRouteId !== routeId) return false;
      } else {
        const aRouteName = String(a.route || '').trim();
        const assignmentRouteName = String(assignment.route || '').trim();
        if (aRouteName !== assignmentRouteName) return false;
      }

      const aAdhocServiceId = getAdhocServiceIdentity(aRawInner);
      if (assignmentAdhocServiceId) {
        return aAdhocServiceId === assignmentAdhocServiceId;
      }

      // CRITICAL: For routeId 55 (BRTE), validate depositId or depositName
      if (routeId === BRTE_ROUTE_ID) {
        const aDepositId = aRawInner.depositId ? Number(aRawInner.depositId) : null;
        const aDepositName = (aRawInner.depositName as string | undefined) ||
          ((a as Record<string, unknown>).depositName as string | undefined);

        // If assignment has depositId, compare by depositId
        if (assignmentDepositId !== null && aDepositId !== null) {
          return assignmentDepositId === aDepositId;
        }

        // If assignment has depositName, compare by depositName
        if (assignmentDepositName && aDepositName) {
          return assignmentDepositName.trim() === aDepositName.trim();
        }

        // If assignment doesn't have deposit info but the one to delete has, don't match
        if (assignmentDepositId === null && !assignmentDepositName && (aDepositId !== null || aDepositName)) {
          return false;
        }

        // If both don't have deposit info, allow match (shouldn't happen, but safety)
        if (assignmentDepositId === null && !assignmentDepositName && aDepositId === null && !aDepositName) {
          return true;
        }

        return false;
      }

      return true;
    });

    if (assignmentsToDelete.length === 0) {
      setInfoModalData({
        type: 'warning',
        title: 'No Assignments Found',
        message: 'No matching assignments found for this week.',
      });
      setShowInfoModal(true);
      return;
    }

    const weekStart = formatDate(weekDates[0], 'dd/mm/yyyy');
    const weekEnd = formatDate(weekDates[weekDates.length - 1], 'dd/mm/yyyy');

    // Show confirmation modal
    setConfirmationData({
      title: 'Remove Assignment for Entire Week?',
      message: `Are you sure you want to remove this assignment for all days of the week?`,
      details: `${assignment.name || 'vendor'} - ${assignment.route || 'route'}\nWeek: ${weekStart} - ${weekEnd}\n\nThis will remove ${assignmentsToDelete.length} assignment(s).`,
      variant: 'danger',
      confirmText: 'Yes, Remove All',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          // Filter out assignments that don't have a valid weekPlannerId (not saved yet)
          const validAssignmentsToDelete = assignmentsToDelete.filter(a =>
            typeof a.weekPlannerId === 'number' && a.weekPlannerId > 0
          );

          // Remove invalid assignments from local state only (not saved yet)
          const invalidAssignments = assignmentsToDelete.filter(a =>
            !(typeof a.weekPlannerId === 'number' && a.weekPlannerId > 0)
          );

          // Remove invalid assignments in a single state update
          if (invalidAssignments.length > 0) {
            setAllOperations((prev) => {
              // Keys use normalized date to handle ISO vs yyyy-mm-dd mismatches
              const keysToRemove = new Set<string>();
              invalidAssignments.forEach(a => {
                const aRaw = (a.raw ?? {}) as Record<string, unknown>;
                const aVendorId = getAssigneeId(aRaw);
                const aRouteId = getRouteId(a);
                const aAdhocServiceId = getAdhocServiceIdentity(aRaw);
                const key = `${toDateKey(a.date)}|${aVendorId}|${aRouteId}|${aAdhocServiceId}`;
                keysToRemove.add(key);
              });

              return prev.filter((item) => {
                if (item.weekPlannerId && item.weekPlannerId > 0) return true;
                const itemRaw = (item.raw ?? {}) as Record<string, unknown>;
                const itemVendorId = getAssigneeId(itemRaw);
                const itemRouteId = getRouteId(item);
                const itemAdhocServiceId = getAdhocServiceIdentity(itemRaw);
                const key = `${toDateKey(item.date)}|${itemVendorId}|${itemRouteId}|${itemAdhocServiceId}`;
                return !keysToRemove.has(key);
              });
            });
          }

          // Delete valid assignments from backend using bulk delete
          if (validAssignmentsToDelete.length > 0) {
            const weekPlannerIds = validAssignmentsToDelete
              .map(a => a.weekPlannerId)
              .filter((id): id is number => typeof id === 'number' && id > 0);

            if (weekPlannerIds.length > 0) {
              // Use correct key expected by WeekPlannerBulkDeleteDTO
              await deleteWeekPlannersBulk({ weekPlannerIds: weekPlannerIds });

              // Remove from local state after successful deletion
              // Use a single state update to remove all deleted assignments
              setAllOperations((prev) =>
                prev.filter((item) => !weekPlannerIds.includes(item.weekPlannerId || 0))
              );
            }
          }

          // Check if there are any pending items (unsaved, in-memory only)
          const hasPendingItems = allOperations.some(item => !item.weekPlannerId || item.weekPlannerId <= 0);

          // Only refresh if there are no pending items
          // If there are pending items, don't refresh to preserve them
          if (!hasPendingItems) {
            setRefreshTrigger((prev) => prev + 1);
          }

          setInfoModalData({
            type: 'success',
            title: 'Assignments Removed',
            message: `Successfully removed ${assignmentsToDelete.length} assignment(s) for the week ${weekStart} - ${weekEnd}.`,
          });
          setShowInfoModal(true);
        } catch (err) {
          console.error("Error removing assignments:", err);
          setInfoModalData({
            type: 'error',
            title: 'Error Removing Assignments',
            message: err instanceof Error ? err.message : "Unexpected error when removing assignments",
          });
          setShowInfoModal(true);
        }
      },
    });
    setShowConfirmationModal(true);
  };

  return (
    <NavbarWrapper>
      <DgpPageFrame
        width="ultra"
        containerClassName="mx-auto w-full px-2 md:px-4 pt-2 md:pt-3 pb-20 md:pb-5 space-y-1.5 md:space-y-2"
        className="font-['Inter',sans-serif] text-slate-800 text-[0.9rem] overflow-visible [&_*]:font-['Inter',sans-serif]"
      >
        {/* Single PlannerView (avoid double-mounting hidden variants) */}
        {error && <p className="text-red-600 text-xs md:text-sm">{error}</p>}

        <PlannerView
          date={selectedDate}
          data={{
            ...plannerData,
            assignments: allOperations,  // Use allOperations (local state) instead of plannerData.assignments (from API)
          }}
          dayOffEntries={dayOffEntries}
          vendors={vendors as unknown as Record<string, unknown>[] | null}
          showWeekends={showWeekends}
          onShowWeekendsChange={setShowWeekends}
          onDrop={handleDrop}
          onEdit={handleEdit}
          onAssignVendor={isSupervisorReadonly ? undefined : handleAssignVendor}
          onOpenDraftAssignmentForRoute={isSupervisorReadonly ? undefined : handleOpenDraftAssignmentForRoute}
          onDateChange={handleDateChange}
          onExportDaySchedule={handleExportDaySchedule}
          onExportWeekSchedule={handleExportWeekSchedule}
          onExportExcel={handleExportExcel}
          // Não ocultar "Generate Week" / "Save Week" quando isWeekLocked.
          // A semana pode continuar travada, mas os botões devem permanecer visíveis.
          hasUnsavedChanges={hasSavableWeekChanges}
          onSubmitWeek={isSupervisorReadonly ? undefined : handleSaveWeek}
          onDefaultSchedule={isSupervisorReadonly ? undefined : handleDefaultSchedule}
          onDaySchedule={undefined}
          onDayOffChange={isSupervisorReadonly ? undefined : handleDayOffChange}
          onAssignmentDelete={isSupervisorReadonly || isWeekLocked ? undefined : handleAssignmentDelete}
          onRemoveManagementFunction={isSupervisorReadonly || isWeekLocked ? undefined : handleRemoveManagementFunction}
          onCreateDailyTeamSupport={isSupervisorReadonly ? undefined : handleCreateDailyTeamSupport}
          onCreateAdHocService={isSupervisorReadonly ? undefined : handleCreateAdHocService}
          onCreateBaopService={isSupervisorReadonly ? undefined : handleCreateBaopService}
          onCreateManagementSupport={isSupervisorReadonly || isUserType2 ? undefined : handleCreateManagementSupport}
          canAddManagementSupport={!isUserType2 && !isSupervisorReadonly}
          canAddFlexRoute={!isUserType2 && !isSupervisorReadonly}
          hideAdhocSort={userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR}
        />
      </DgpPageFrame>

      {/* Edit Assignment Modal */}
      <EditAssignmentModal
        open={showEditAssignmentModal}
        onClose={handleCloseEditAssignmentModal}
        assignment={editingAssignment}
        readOnly={isSupervisorReadonly || isAssignmentReadonly(editingAssignment)}
        // allowWeekOps: quando a data da célula é hoje (somente-leitura para edições individuais),
        // ainda permite operações semanais que filtram para amanhã em diante.
        allowWeekOps={
          !isSupervisorReadonly &&
          !!editingAssignment &&
          (() => {
            const d = normalizeDateOnly(
              editingAssignment.date ||
              String((editingAssignment.raw as Record<string, unknown>)?.date ?? '')
            );
            return d === getLocalDateString();
          })()
        }
        // ADHOC Service deve ser gerenciado apenas na tabela/section `Adhoc Services`.
        // Então: só mostramos quando a origem for explicitamente `adhoc-section`.
        hideAdhocFields={
          isUserType2 ||
          !(
            editingAssignment &&
            (editingAssignment.raw as Record<string, unknown> | undefined)?.__source === 'adhoc-section'
          )
        }
        hideAdhocSort={userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR}
        onSave={handleUpdateVehicle}
        currentDate={selectedDate}
        showWeekends={showWeekends}
        onAssignWeek={handleAssignWeek}
        allAssignments={allOperations}
        vendors={vendors as unknown as Record<string, unknown>[] | null}
        onDelete={async (assignmentId: string | number) => {
          // Find the assignment by ID for EditVehicleModal
          const assignment = typeof assignmentId === "string"
            ? allOperations.find((op) => getDraftKey(op) === assignmentId)
            : allOperations.find(op => op.weekPlannerId === Number(assignmentId));
          if (assignment) {
            await handleAssignmentDelete(assignment);
          }
        }}
        onRemoveDay={handleRemoveDay}
        onRemoveWeek={handleRemoveWeek}
      />

      {/* Edit Management Support Modal */}
      <EditManagementSupportModal
        open={showEditManagementSupportModal}
        onClose={() => {
          setShowEditManagementSupportModal(false);
          setEditingAssignment(null);
        }}
        assignment={editingAssignment}
        readOnly={isSupervisorReadonly || isAssignmentReadonly(editingAssignment)}
        onSave={async () => {

          // Update local state immediately for better UX
          if (editingAssignment) {
            const raw = editingAssignment.raw as Record<string, unknown> | undefined;
            const dailyTeamSupportId = raw?.dailyTeamSupportId ? Number(raw.dailyTeamSupportId) : null;

            if (dailyTeamSupportId) {
              // The assignment will be updated by the refresh, but we can mark it for refresh
            }
          }

          // Trigger refresh to get latest data from backend
          setRefreshTrigger((prev) => {
            const newValue = prev + 1;
            return newValue;
          });
        }}
        onDelete={async () => {

          // Remove from local state immediately for better UX
          if (editingAssignment) {
            const raw = editingAssignment.raw as Record<string, unknown> | undefined;
            const dailyTeamSupportId = raw?.dailyTeamSupportId ? Number(raw.dailyTeamSupportId) : null;

            if (dailyTeamSupportId) {
              // Remove by matching dailyTeamSupportId
              setAllOperations((prev) => prev.filter((op) => {
                const opRaw = op.raw as Record<string, unknown> | undefined;
                const opDailyTeamSupportId = opRaw?.dailyTeamSupportId ? Number(opRaw.dailyTeamSupportId) : null;
                return opDailyTeamSupportId !== dailyTeamSupportId;
              }));
            } else {
              // Fallback: remove by matching assignment properties
              setAllOperations((prev) => prev.filter((op) => {
                if (op.weekPlannerId === editingAssignment.weekPlannerId && op.weekPlannerId !== 0) {
                  return false;
                }
                if (op.weekPlannerId === 0 && editingAssignment.weekPlannerId === 0) {
                  return !(
                    op.date === editingAssignment.date &&
                    String((op.raw as Record<string, unknown> | undefined)?.userId) === String((editingAssignment.raw as Record<string, unknown> | undefined)?.userId) &&
                    op.route === editingAssignment.route &&
                    op.name === editingAssignment.name &&
                    op.notes === editingAssignment.notes
                  );
                }
                return true;
              }));
            }
          }

          // Trigger refresh to get latest data from backend
          setRefreshTrigger((prev) => {
            const newValue = prev + 1;
            return newValue;
          });
        }}
      />

      {/* Info Modal */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {infoModalData?.type === 'success' && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              {infoModalData?.type === 'info' && (
                <Info className="h-5 w-5 text-blue-600" />
              )}
              {infoModalData?.type === 'warning' && (
                <AlertCircle className="h-5 w-5 text-orange-600" />
              )}
              {infoModalData?.type === 'error' && (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              {infoModalData?.title || 'Information'}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {infoModalData?.message}
            </DialogDescription>
          </DialogHeader>
          {infoModalData?.details && (
            <div className="py-2 overflow-y-auto flex-1 min-h-0">
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {infoModalData.details}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setShowInfoModal(false)}
              className={
                infoModalData?.type === 'success'
                  ? 'bg-green-600 hover:bg-green-700'
                  : infoModalData?.type === 'error'
                    ? 'bg-red-600 hover:bg-red-700'
                    : infoModalData?.type === 'warning'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : ''
              }
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      {confirmationData && (
        <ConfirmationModal
          open={showConfirmationModal}
          onClose={() => {
            setShowConfirmationModal(false);
            setConfirmationData(null);
          }}
          onConfirm={async () => {
            if (confirmationData) {
              try {
                await confirmationData.onConfirm();
                setShowConfirmationModal(false);
                setConfirmationData(null);
              } catch (error) {
                console.error('Error in confirmation:', error);
                // Error is handled in onConfirm
              }
            }
          }}
          title={confirmationData.title}
          message={confirmationData.message}
          details={confirmationData.details}
          variant={confirmationData.variant || 'warning'}
          confirmText={confirmationData.confirmText || 'Confirm'}
          cancelText={confirmationData.cancelText || 'Cancel'}
          secondaryActionText={confirmationData.secondaryActionText}
          onSecondaryAction={
            confirmationData.onSecondaryAction
              ? () => {
                  Promise.resolve(confirmationData.onSecondaryAction?.())
                    .then(() => {
                      setShowConfirmationModal(false);
                      setConfirmationData(null);
                    })
                    .catch((error) => {
                      console.error('Error in secondary confirmation action:', error);
                    });
                }
              : undefined
          }
        />
      )}
    </NavbarWrapper>
  );
};

export default WeekPlannerPageContent;
