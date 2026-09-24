// lib/mappers/daily-game-plan.mapper.ts
/**
 * Mapping utilities for Daily Game Plan component.
 * Extracted from DailyGamePlanContent.tsx to keep the component lean.
 */

import type { FrontendOperationRecord } from '@/app/(private)/daily-game-plan/types';
import type { WeekPlannerRecord } from '@/app/(private)/daily-game-plan/api';
import type { Vendor } from '@/lib/vendors';
import type { Route, DepositWithRoutesFullDTO, RouteByDepositDTO } from '@/lib/api/routes';
import type { Vehicle } from '@/lib/vehicles';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

/** Helper: normalize a date string to YYYY-MM-DD */
export const normalizeDate = (dateString: string): string => {
  if (!dateString) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  const datePart = dateString.split('T')[0];
  return datePart || dateString;
};

/** Helper: check if status equals NotAllocated (case‑insensitive) */
export const isDailyGamePlanOpNotAllocatedStatus = (status: string | null | undefined): boolean => {
  return (
    String(status ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '') === 'notallocated'
  );
};

/**
 * Map a WeekPlannerRecord (backend) to a FrontendOperationRecord (UI).
 * This mirrors the original `mapWeekPlannerToFrontend` implementation.
 */
export const mapWeekPlannerToFrontend = (
  weekPlanner: WeekPlannerRecord,
  vendorMap: Map<number, Vendor>,
  userToVendorMap: Map<number, Vendor>,
  routeMap: Map<number, Route>,
  routeNameMap: Map<string, Route>,
  vehicleMap: Map<number, Vehicle>,
  deposits?: DepositWithRoutesFullDTO[]
): FrontendOperationRecord => {
  const raw = weekPlanner.raw || {};
  const weekPlannerRecord = weekPlanner as unknown as Record<string, unknown>;

  // Resolve vendor (userId is primary, userId is fallback for backward compat)
  let userId: number | undefined;

  // Try to get userId first (primary)
  const rawUserId = raw.userId;
  if (rawUserId != null && rawUserId !== '' && Number(rawUserId) !== 0) {
    const n = Number(rawUserId);
    if (Number.isFinite(n)) userId = n;
  }
  
  // Fallback to userId for backward compatibility with old schema
  const rawVendorId = raw.userId;
  if (!userId && rawVendorId != null && rawVendorId !== '' && Number(rawVendorId) !== 0) {
    const n = Number(rawVendorId);
    if (Number.isFinite(n)) userId = n;
  }
  
  // Try to get from nested vendor/vendor object
  if (!userId && raw.vendor && typeof raw.vendor === 'object') {
    const vendorObj = raw.vendor as Record<string, unknown>;
    const uid = vendorObj.userId;
    if (uid != null && uid !== '' && Number(uid) !== 0) {
      const n = Number(uid);
      if (Number.isFinite(n)) userId = n;
    }
    // Fallback to nested userId
    if (!userId) {
      const did = vendorObj.userId;
      if (did != null && did !== '' && Number(did) !== 0) {
        const n = Number(did);
        if (Number.isFinite(n)) userId = n;
      }
    }
  }
  
  // Store vendorId for backward compatibility
  const vendorId = userId;
  
  const vendor = (userId != null ? userToVendorMap.get(userId) : undefined) ?? 
                (vendorId != null ? vendorMap.get(vendorId) : undefined);

  // Resolve route
  let routeId: number | undefined;
  let routeName: string | undefined;
  if (raw.route && typeof raw.route === 'object') {
    const routeObj = raw.route as Record<string, unknown>;
    routeId = routeObj.routeId ? Number(routeObj.routeId) : undefined;
    routeName = routeObj.routeName ? String(routeObj.routeName) : undefined;
    if (!routeId && routeObj.routeDefaultId) {
      routeId = Number(routeObj.routeDefaultId);
    }
  }
  if (!routeId && raw.routeId) {
    routeId = Number(raw.routeId);
  }
  if (!routeName && raw.routeName) {
    routeName = String(raw.routeName);
  }
  let foundRoute: Route | undefined;
  if (routeId) {
    foundRoute = routeMap.get(routeId);
  }
  if (!foundRoute && routeName) {
    foundRoute = routeNameMap.get(routeName);
  }
  if (!foundRoute && weekPlanner.route) {
    foundRoute = routeNameMap.get(weekPlanner.route);
  }

  // Resolve vehicle
  let vehicleId: number | undefined;
  if (raw.vehicleId) {
    vehicleId = Number(raw.vehicleId);
  } else if (raw.vehicle && typeof raw.vehicle === 'object') {
    const vehicleObj = raw.vehicle as Record<string, unknown>;
    vehicleId = vehicleObj.vehicleId ? Number(vehicleObj.vehicleId) : undefined;
  }
  const vehicle = vehicleId ? vehicleMap.get(vehicleId) : undefined;

  // Resolve payment mode / cost model name
  let paymentMode = 'DR';
  if (raw.costModel && typeof raw.costModel === 'object') {
    const costModelObj = raw.costModel as Record<string, unknown>;
    const pm =
      (costModelObj.costModelName && String(costModelObj.costModelName)) ||
      (costModelObj.name && String(costModelObj.name)) ||
      (costModelObj.description && String(costModelObj.description)) ||
      'DR';
    paymentMode = typeof pm === 'string' ? pm : 'DR';
  }

  // Resolve costModelId
  let costModelId: number | undefined;
  if (raw.costModel && typeof raw.costModel === 'object') {
    const costModelObj = raw.costModel as Record<string, unknown>;
    if (costModelObj.costModelId !== undefined && costModelObj.costModelId !== null) {
      costModelId = Number(costModelObj.costModelId);
    }
  }
  if (!costModelId && raw.costModelId !== undefined && raw.costModelId !== null) {
    costModelId = Number(raw.costModelId);
  }
  if (!costModelId && weekPlannerRecord.costModelId) {
    costModelId = Number(weekPlannerRecord.costModelId);
  }
  if (!costModelId && vendor?.costModelId) {
    costModelId = Number(vendor.costModelId);
  }

  // Resolve deposit
  let depositId: number | undefined;
  let depositName: string | undefined;
  if (raw.depositId !== undefined && raw.depositId !== null) {
    depositId = Number(raw.depositId);
  }
  if (raw.depositName && typeof raw.depositName === 'string') {
    depositName = raw.depositName;
  }
  if (!depositId && raw.adhocService && typeof raw.adhocService === 'object') {
    const adhocServiceObj = raw.adhocService as Record<string, unknown>;
    if (adhocServiceObj.depositId !== undefined && adhocServiceObj.depositId !== null) {
      depositId = Number(adhocServiceObj.depositId);
    }
    if (!depositName && adhocServiceObj.depositName && typeof adhocServiceObj.depositName === 'string') {
      depositName = String(adhocServiceObj.depositName);
    }
  }
  if (!depositId && raw.route && typeof raw.route === 'object') {
    const routeObj = raw.route as Record<string, unknown>;
    if (!depositId && routeObj.depositId !== undefined && routeObj.depositId !== null) {
      depositId = Number(routeObj.depositId);
    }
    if (!depositName && routeObj.depositName && typeof routeObj.depositName === 'string') {
      depositName = String(routeObj.depositName);
    }
  }
  if (!depositId && deposits && routeId) {
    for (const deposit of deposits) {
      const foundRoute = deposit.routes?.find((r: RouteByDepositDTO) => r.routeId === routeId);
      if (foundRoute) {
        depositId = deposit.depositId;
        if (!depositName) depositName = deposit.depositName;
        break;
      }
    }
  }
  if (!depositId && deposits && routeName) {
    for (const deposit of deposits) {
      const foundRoute = deposit.routes?.find((r: RouteByDepositDTO) => r.routeName === routeName);
      if (foundRoute) {
        depositId = deposit.depositId;
        if (!depositName) depositName = deposit.depositName;
        break;
      }
    }
  }

  // Build the frontend record
  return {
    weekPlannerId: weekPlanner.weekPlannerId,
    operationId: weekPlanner.operationId,
    dailyGamePlanOperationId: weekPlanner.operationId,
    userId: userId,
    routeId: foundRoute?.routeId || routeId,
    vehicleId: vehicleId,
    costModelId: costModelId,
    Date: normalizeDate(weekPlanner.date),
    Route: foundRoute?.routeName || routeName || weekPlanner.route || '',
    Name:
      vendor?.fullName ||
      String(weekPlanner.name || '').trim() ||
      String((raw.fullName as string) || '').trim() ||
      String((raw.vendor_name as string) || '').trim() ||
      '',
    'Payment Mode': paymentMode,
    rate_value:
      raw.rate !== undefined && raw.rate !== null && typeof raw.rate !== 'object'
        ? (typeof raw.rate === 'string' || typeof raw.rate === 'number' ? raw.rate : String(raw.rate))
        : '',
    routeCost:
      raw.routeCost !== undefined && raw.routeCost !== null && typeof raw.routeCost !== 'object'
        ? (typeof raw.routeCost === 'string' || typeof raw.routeCost === 'number' ? raw.routeCost : String(raw.routeCost))
        : '',
    Rate:
      raw.rate !== undefined && raw.rate !== null && typeof raw.rate !== 'object'
        ? (typeof raw.rate === 'string' || typeof raw.rate === 'number' ? raw.rate : String(raw.rate))
        : raw.routeCost !== undefined && raw.routeCost !== null && typeof raw.routeCost !== 'object'
          ? (typeof raw.routeCost === 'string' || typeof raw.routeCost === 'number' ? raw.routeCost : String(raw.routeCost))
          : '',
    Sort: '', // placeholder – original logic kept in UI component
    SortLate: false,
    'AD-HOC Sort': '',
    Extras: '',
    Notes: weekPlanner.notes ?? '',
    Vehicle:
      vehicle?.registrationPlates ||
      (vehicle as { registrationPlates?: string })?.registrationPlates ||
      (raw.vehicleRegistrationPlate as string) ||
      (raw.registrationPlate as string) ||
      'NOVEHICLE',
    'Vendor type': (raw.vendorTypeDescription as string) || '',
    isDayOff: false, // placeholder – actual value derived later
    Status: (() => {
      const wpStatus = String(weekPlannerRecord.status ?? '').trim().toLowerCase();
      const rawStatus = String((raw.status as string) ?? '').trim().toLowerCase();
      if (wpStatus === 'off' || wpStatus === 'inactive') return 'Off';
      if (rawStatus === 'off' || rawStatus === 'inactive') return 'Off';
      if (
        isDailyGamePlanOpNotAllocatedStatus(weekPlannerRecord.status as string | null | undefined) ||
        isDailyGamePlanOpNotAllocatedStatus(raw.status as string | null | undefined)
      ) {
        return BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED;
      }
      if (wpStatus === 'working' || wpStatus === 'active') return BUSINESS_RULES.WORKING_STATUS.WORKING;
      if (rawStatus === 'working' || rawStatus === 'active') return BUSINESS_RULES.WORKING_STATUS.WORKING;
      return BUSINESS_RULES.WORKING_STATUS.WORKING;
    })(),
    depositId: depositId,
    depositName: depositName,
    adhocServiceId: (raw.adhocServiceId as number) ??
      (raw.adhocService && typeof raw.adhocService === 'object'
        ? Number((raw.adhocService as Record<string, unknown>).adhocServiceId ?? 0) || undefined
        : undefined),
    rtSortConfirmed: raw.routeSort !== undefined && Number(raw.routeSort) > 0 ? true : false,
    emailConfirmed: false,
    dhlConfirmed: false,
    Email: vendor?.email ?? '',
    'Depart Time': (raw.departTime as string) || (raw.departTime as string) || '',
    'Return Time': (raw.returnTime as string) || (raw.returnTime as string) || '',
  } as unknown as FrontendOperationRecord;
};

/**
 * Convert UI record back to payload for creating a DailyGamePlanOperation.
 * Mirrors `mapFrontendToDailyGamePlanOperationCreateDTO`.
 */
export const mapFrontendToDailyGamePlanOperationCreateDTO = (
  frontend: FrontendOperationRecord
): Record<string, unknown> => {
  // NOTE: The exact DTO shape is defined in the backend types.
  // This implementation follows the original mapping logic.
  const payload: Record<string, unknown> = {
    // Basic fields
    routeId: frontend.routeId ?? null,
    userId: frontend.userId ?? frontend.userId ?? null,
    vehicleId: frontend.vehicleId ?? null,
    depositId: frontend.depositId ?? null,
    // Status handling
    status: frontend.Status === BUSINESS_RULES.WORKING_STATUS.WORKING ? 'ACTIVE' : 'INACTIVE',
    // Cost model handling – placeholder
    costModelId: frontend.costModelId ?? null,
    // Additional fields are populated by the caller where needed.
  };
  return payload;
};

// Export all utilities for easy import
const dailyGamePlanMapper = {
  normalizeDate,
  isDailyGamePlanOpNotAllocatedStatus,
  mapWeekPlannerToFrontend,
  mapFrontendToDailyGamePlanOperationCreateDTO
};

export default dailyGamePlanMapper;


