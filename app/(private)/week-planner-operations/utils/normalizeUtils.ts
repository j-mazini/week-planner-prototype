import type { WeekPlannerRecord } from '../contexts/PlannerContext';
import { getLocalDateString } from './formUtils';

/**
 * Normalize week planner data from API response
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
      normalizedDate = dateValue.split("T")[0];
    } else {
      normalizedDate = String(dateValue);
    }
  }

  // Normalize route
  const routeObj = getValue("route");
  let routeValue = "";

  if (routeObj && typeof routeObj === "object") {
    const nested = routeObj as Record<string, unknown>;
    routeValue = String(
      nested.routeName ||
      nested.routeDefaultName ||
      nested.routeId ||
      nested.routeDefaultId ||
      ""
    );
  }

  if (!routeValue) {
    routeValue = String(
      getValue("routeName") ||
      getValue("routeDefaultName") ||
      getValue("routeId") ||
      getValue("route") ||
      ""
    );
  }

  const route = routeValue;

  // Normalize name: top-level, camelCase and nested (vendor/vendor/user)
  const getNestedName = (): string => {
    const fromTop =
      getValue("fullName") ||
      getValue("vendorName") ||
      getValue("courierName") ||
      getValue("name") ||
      "";
    if (fromTop && String(fromTop).trim()) return String(fromTop).trim();

    const vendor = getValue("vendor");
    if (vendor && typeof vendor === "object") {
      const v = vendor as Record<string, unknown>;
      const vn = v.fullName ?? v.vendorName ?? v.name ?? "";
      if (vn && String(vn).trim()) return String(vn).trim();
      const u = v.user;
      if (u && typeof u === "object") {
        const ur = u as Record<string, unknown>;
        const first = String(ur.name ?? ur.firstName ?? "").trim();
        const last = String(ur.lastName ?? "").trim();
        if (first || last) return [first, last].filter(Boolean).join(" ").trim();
      }
    }

    const user = getValue("user");
    if (user && typeof user === "object") {
      const ur = user as Record<string, unknown>;
      const un = ur.fullName ?? ur.fullName ?? ur.name ?? "";
      if (un && String(un).trim()) return String(un).trim();
      const first = String(ur.name ?? ur.firstName ?? "").trim();
      const last = String(ur.lastName ?? ur.lastName ?? "").trim();
      if (first || last) return [first, last].filter(Boolean).join(" ").trim();
    }

    return "";
  };
  const name = getNestedName();

  // Normalize vehicle
  const vehicleObj = getValue("vehicle");
  let vehicleValue = "";
  let registrationPlateValue = "";

  if (vehicleObj && typeof vehicleObj === "object") {
    const nested = vehicleObj as Record<string, unknown>;
    vehicleValue = String(
      nested.vehicleModel ||
      nested.vehicleDefaultModel ||
      ""
    );
    registrationPlateValue = String(
      nested.vehicleregistrationPlate ||
      nested.vehicle_default_registrationPlate ||
      ""
    );
  }

  if (!vehicleValue) {
    vehicleValue = String(
      getValue("vehicleModel") ||
      getValue("vehicleDefaultModel") ||
      getValue("model") ||
      ""
    );
  }

  if (!registrationPlateValue) {
    registrationPlateValue = String(
      getValue("vehicleregistrationPlate") ||
      getValue("vehicle_default_registrationPlate") ||
      getValue("registrationPlate") ||
      getValue("registrationPlates") ||
      ""
    );
  }

  const vehicle = vehicleValue;
  const registrationPlate = registrationPlateValue;

  // Normalize cost model
  const costModelObj = getValue("costModel");
  let costModelValue = "";

  if (costModelObj && typeof costModelObj === "object") {
    const nested = costModelObj as Record<string, unknown>;
    costModelValue = String(
      nested.costModelName ||
      nested.costModelDefaultName ||
      nested.name ||
      nested.costModelId ||
      nested.costModelDefaultId ||
      ""
    );
  }

  if (!costModelValue) {
    costModelValue = String(
      getValue("costModelName") ||
      getValue("costModelDefaultName") ||
      getValue("name") ||
      getValue("costModelId") ||
      getValue("costModel") ||
      ""
    );
  }

  const costModel = costModelValue;

  // Normalize isDayOff
  const isDayOff = getValue("isDayOff") ?? getValue("isDayOff") ?? false;
  const isDayOffString = isDayOff === true || isDayOff === 1 || String(isDayOff).toLowerCase() === "true" ? "true" : "false";

  return {
    weekPlannerId: Number(getValue("weekPlannerId") ?? getValue("weekPlannerId") ?? getValue("id") ?? 0),
    operationId: getValue("operationId") ? Number(getValue("operationId")) : undefined,
    date: normalizedDate,
    route: route,
    name: name,
    costModel: costModel,
    rate: (() => { const r = getValue("rate"); return r !== null && r !== undefined && r !== 0 && String(r) !== "0" ? String(r) : ""; })(),
    routeCost: getValue("routeCost") !== null && getValue("routeCost") !== undefined ? String(getValue("routeCost")) : "",
    routeSort: getValue("routeSort") !== null && getValue("routeSort") !== undefined ? String(getValue("routeSort")) : "",
    adhocSort: getValue("adhocSort") !== null && getValue("adhocSort") !== undefined ? String(getValue("adhocSort")) : "",
    extras: getValue("extra") !== null && getValue("extra") !== undefined ? String(getValue("extra")) : "",
    notes: String(getValue("notes") ?? getValue("note") ?? ""),
    vehicle: vehicle,
    registrationPlate: registrationPlate,
    status: String(getValue("status") ?? ""),
    isDayOff: isDayOffString,
    raw: item,
  };
};






