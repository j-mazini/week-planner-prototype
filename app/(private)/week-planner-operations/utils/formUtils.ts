import type { WeekPlannerRecord, WeekPlannerFormData } from '../contexts/PlannerContext';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

/**
 * Get local date string in YYYY-MM-DD format
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Initial form state
 */
export const INITIAL_FORM_STATE = (): WeekPlannerFormData => ({
  date: getLocalDateString(),
  route: "",
  name: "",
  costModel: "",
  rate: "",
  routeCost: "",
  routeSort: "",
  adhocSort: "",
  extras: "",
  notes: "",
  vehicle: "",
  registrationPlate: "",
  status: BUSINESS_RULES.WORKING_STATUS.WORKING,
  isDayOff: "false",
});

/**
 * Convert WeekPlannerRecord to form data
 */
export const toFormData = (weekPlanner: WeekPlannerRecord): WeekPlannerFormData => {
  const raw = weekPlanner.raw || {};

  // Extract routeId from nested route object
  let route = "";
  const routeObj = (raw as Record<string, unknown>).route;
  if (routeObj && typeof routeObj === "object") {
    const routeRecord = routeObj as Record<string, unknown>;
    route = String(routeRecord.routeId || routeRecord.routeDefaultId || "");
  }
  if (!route) route = weekPlanner.route || "";

  // Extract vehicleId from nested vehicle object
  let vehicle = "";
  const vehicleObj = (raw as Record<string, unknown>).vehicle;
  if (vehicleObj && typeof vehicleObj === "object") {
    const vehicleRecord = vehicleObj as Record<string, unknown>;
    vehicle = String(vehicleRecord.vehicleId || vehicleRecord.vehicleDefaultId || "");
  }
  if (!vehicle) vehicle = weekPlanner.vehicle || "";

  // Extract costModelId from nested costModel object
  let costModel = "";
  const costModelObj = (raw as Record<string, unknown>).costModel;
  if (costModelObj && typeof costModelObj === "object") {
    const costModelRecord = costModelObj as Record<string, unknown>;
    costModel = String(costModelRecord.costModelId || costModelRecord.costModelDefaultId || "");
  }
  if (!costModel) costModel = weekPlanner.costModel || "";

  // Extract userId from raw data
  let userId = "";
  if ((raw as Record<string, unknown>).userId) {
    userId = String((raw as Record<string, unknown>).userId);
  }
  if (!userId) userId = weekPlanner.name || "";

  return {
    date: weekPlanner.date ?? "",
    route: route,
    name: userId,
    costModel: costModel,
    rate: weekPlanner.rate ?? "",
    routeCost: weekPlanner.routeCost ?? "",
    routeSort: weekPlanner.routeSort ?? "",
    adhocSort: weekPlanner.adhocSort ?? "",
    extras: weekPlanner.extras ?? "",
    notes: weekPlanner.notes ?? "",
    vehicle: vehicle,
    registrationPlate: weekPlanner.registrationPlate ?? "",
    status: weekPlanner.status ?? "",
    isDayOff: weekPlanner.isDayOff ?? "false",
  };
};



