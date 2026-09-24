import type { WeekPlannerRecord } from '../contexts/PlannerContext';
import { getLocalDateString } from './formUtils';

/** Primeiro id numérico válido entre chaves (ignora "", null, undefined) — evita `"" ?? id` falhar com getValue default "". */
export function firstNumericIdFromRecord(item: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const v = item[key];
    if (v === null || v === undefined || v === '') continue;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

/**
 * Normalize week planner data from API response (new DTO structure)
 */
export const normalizeWeekPlanner = (item: Record<string, unknown>): WeekPlannerRecord => {
  const getValue = (key: string, fallback: unknown = ""): unknown => {
    return item[key] ?? fallback;
  };

  // Normalize date
  let normalizedDate = "";
  const dateValue = getValue("date");
  if (dateValue) {
    if (dateValue instanceof Date) {
      normalizedDate = getLocalDateString(dateValue);
    } else if (typeof dateValue === "string") {
      // Handles both "2026-03-25T03:00:00.000Z" (ISO) and "2026-03-25 00:00:00" (space-separated)
      normalizedDate = dateValue.split("T")[0].split(" ")[0].trim();
    } else {
      normalizedDate = String(dateValue);
    }
  }

  // Normalize route (new DTO: route.routeName, route.depositId, route.depositName, route.isFlex)
  const routeObj = getValue("route");
  let routeValue = "";
  let depositId: number | null = null;
  let depositName: string | null = null;
  let isFlex: boolean = false;
  let nestedRouteId: number | null = null;

  if (routeObj && typeof routeObj === "object") {
    const nested = routeObj as Record<string, unknown>;
    nestedRouteId = nested.routeId != null && Number.isFinite(Number(nested.routeId))
      ? Number(nested.routeId)
      : null;
    routeValue = String(nested.routeName || nested.routeId || "");
    depositId = nested.depositId != null && Number.isFinite(Number(nested.depositId))
      ? Number(nested.depositId)
      : null;
    depositName = nested.depositName != null ? String(nested.depositName) : null;
    isFlex = nested.isFlex === true;
  }

  if (!routeValue) {
    routeValue = String(getValue("routeName") || getValue("routeId") || getValue("routeName") || getValue("routeId") || "");
  }

  const route = routeValue;

  // Normalize name (fullName no longer in new DTO — best-effort from legacy fields)
  const nameValue =
    getValue("fullName") ||
    getValue("vendorName") ||
    getValue("courierName") ||
    getValue("name") ||
    "";
  const name = nameValue ? String(nameValue) : "";

  // Normalize vehicle (new DTO: vehicle.vehicleModel, vehicle.vehicleregistrationPlate)
  const vehicleObj = getValue("vehicle");
  let vehicleValue = "";
  let registrationPlateValue = "";
  let nestedVehicleId: number | null = null;

  if (vehicleObj && typeof vehicleObj === "object") {
    const nested = vehicleObj as Record<string, unknown>;
    nestedVehicleId = nested.vehicleId != null && Number.isFinite(Number(nested.vehicleId))
      ? Number(nested.vehicleId)
      : null;
    vehicleValue = String(
      nested.vehicleModel ??
        nested.vehicleDefaultModel ??
        ""
    );

    // Backend may return plate in multiple shapes (snake_case/camelCase/aliases).
    registrationPlateValue = String(
      nested.registrationPlates ??
        nested.registration_plates ??
        nested.vehicleregistrationPlate ??
        nested.vehicleRegistrationPlate ??
        nested.registrationPlate ??
        nested.registration_plate ??
        nested.vehicleDefaultRegistrationPlate ??
        nested.vehicle_default_registrationPlate ??
        ""
    );
  }

  if (!vehicleValue) {
    vehicleValue = String(getValue("vehicleModel") || "");
  }
  if (!registrationPlateValue) {
    registrationPlateValue = String(
      getValue("registrationPlates") ??
        getValue("registration_plates") ??
        getValue("vehicleregistrationPlate") ??
        getValue("vehicleRegistrationPlate") ??
        getValue("registrationPlate") ??
        getValue("registration_plate") ??
        getValue("vehicleDefaultRegistrationPlate") ??
        ""
    );
  }

  const vehicle = vehicleValue;
  const registrationPlate = registrationPlateValue;

  // Normalize isSort → routeSort ("yes"/"no")
  const isSortRaw = getValue("isSort") ?? getValue("isSort");
  const isSortBool = isSortRaw === true || isSortRaw === 1 || String(isSortRaw).toLowerCase() === "true";
  const routeSort = isSortBool ? "yes" : "no";

  // Normalize adhocService.isAdhocSort → adhocSort ("true"/"false")
  const adhocServiceObj = getValue("adhocService") ?? getValue("adhocService");
  let adhocSort = "false";
  if (adhocServiceObj && typeof adhocServiceObj === "object") {
    const adhocNested = adhocServiceObj as Record<string, unknown>;
    const isAdhocSort = adhocNested.isAdhocSort ?? adhocNested.isAdhocSort;
    adhocSort =
      isAdhocSort === true || isAdhocSort === 1 || String(isAdhocSort).toLowerCase() === "true"
        ? "true"
        : "false";
  }

  // Normalize isDayOff
  const isDayOff = getValue("isDayOff") ?? getValue("isDayOff") ?? false;
  const isDayOffString =
    isDayOff === true || isDayOff === 1 || String(isDayOff).toLowerCase() === "true"
      ? "true"
      : "false";

  // Flat IDs used by downstream consumers (backward compat with new nested DTO)
  const flatRouteId = (item.routeId as number | null | undefined) ?? nestedRouteId ?? null;
  const flatVehicleId = (item.vehicleId as number | null | undefined) ?? nestedVehicleId ?? null;
  // Flat depositId: prefer item-level field (old DTO), then fall back to route.depositId (new DTO)
  const flatDepositId = (item.depositId as number | null | undefined) ?? depositId ?? null;
  const flatDepositName = (item.depositName as string | null | undefined) ?? depositName ?? null;

  const weekPlannerId = firstNumericIdFromRecord(item, ['weekPlannerId', 'weekPlannerId', 'id']);
  const operationIdRaw = firstNumericIdFromRecord(item, [
    'dailyGamePlanOperationId',
    'operationId',
    'operationId',
  ]);
  const operationId = operationIdRaw > 0 ? operationIdRaw : undefined;

  return {
    weekPlannerId,
    ...(operationId !== undefined ? { operationId } : {}),
    date: normalizedDate,
    route,
    name,
    routeSort,
    adhocSort,
    notes: String(getValue("notes") ?? getValue("note") ?? ""),
    reason: String(getValue("reason") ?? ""),
    vehicle,
    registrationPlate,
    status: String(getValue("status") ?? ""),
    isDayOff: isDayOffString,
    isSort: isSortBool ? "true" : "false",
    raw: {
      ...item,
      // Flatten nested IDs so existing code that reads raw.routeId / raw.vehicleId works
      // regardless of whether the API returns flat or nested fields (new DTO uses nested only)
      routeId: flatRouteId,
      vehicleId: flatVehicleId,
      depositId: flatDepositId,
      depositName: flatDepositName,
      // Prefixed aliases for explicit downstream use
      _depositId: depositId,
      _depositName: depositName,
      _isFlex: isFlex,
    },
  };
};




