import { z } from 'zod';
import type { WeekPlannerFormData } from '../contexts/PlannerContext';
import type { WeekPlannerCreateDTO } from '../services/apiService';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

// Zod schema for WeekPlannerCreateDTO validation
// Only date and userId are required - all other fields are optional
export const WeekPlannerCreateSchema = z.object({
  date: z.string().min(1, "Date is required"),
  routeDefaultId: z.number().positive().nullable().optional(),
  routeId: z.number().positive().nullable().optional(),
  userId: z.number().positive("User is required"),
  isSort: z.boolean().optional(),
  notes: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  vehicleDefaultId: z.number().positive().nullable().optional(),
  vehicleId: z.number().positive().nullable().optional(),
  status: z.string().nullable().optional(),
  isDayOff: z.boolean().optional(),
  operationId: z.number().positive().nullable().optional(),
  adhocServiceId: z.number().positive().nullable().optional(),
  depositId: z.number().positive().nullable().optional(),
  depositName: z.string().nullable().optional(),
  vendorRequestId: z.number().positive().nullable().optional(),
  isFinished: z.boolean().optional(),
  isSupervisor: z.boolean().optional(),
}).refine((data) => {
  const vid = data.vehicleId ?? data.vehicleDefaultId;
  return vid != null && Number(vid) > 0;
}, { message: "Vehicle is required", path: ["vehicleId"] });

/**
 * Serialize form data to API DTO
 */
export const serializeWeekPlanner = (
  form: WeekPlannerFormData,
  raw?: Record<string, unknown>
): WeekPlannerCreateDTO => {
  const toNullableNumber = (value: string | undefined): number | null => {
    if (!value || value === "" || value === "undefined") {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const extractId = (obj: unknown, ...keys: string[]): number | null => {
    if (!obj || typeof obj !== "object") return null;
    const record = obj as Record<string, unknown>;
    for (const key of keys) {
      const value = record[key];
      if (value !== null && value !== undefined) {
        const num = Number(value);
        if (Number.isFinite(num) && num > 0) return num;
      }
    }
    return null;
  };

  const rawData = raw as Record<string, unknown> | undefined;

  const routeDefaultId =
    extractId(rawData?.route, "routeDefaultId") ??
    extractId(rawData, "routeDefaultId") ??
    toNullableNumber(form.route);

  const vehicleDefaultId =
    extractId(rawData?.vehicle, "vehicleDefaultId") ??
    extractId(rawData, "vehicleDefaultId") ??
    toNullableNumber(form.vehicle);

  const isDayOff = form.isDayOff === "true" || form.isDayOff === "1";

  // Extract adhocServiceId - check multiple possible locations including nested adhocService object
  const adhocServiceObj = rawData?.adhocService as Record<string, unknown> | undefined;
  const adhocServiceId =
    extractId(rawData, "adhocServiceId") ??
    (adhocServiceObj ? extractId(adhocServiceObj, "adhocServiceId") : null);

  // Extract depositId
  const depositId = extractId(rawData, "depositId");

  // Extract depositName
  const depositName = rawData?.depositName as string | undefined;

  const isSort = form.isSort === "true" || form.isSort === "1" || rawData?.isSort === true;

  const unvalidatedPayload = {
    date: form.date,
    routeDefaultId: routeDefaultId,
    routeId: toNullableNumber(form.route),
    userId: toNullableNumber(form.name),
    isSort: isSort,
    notes: form.notes || null,
    reason: form.reason || null,
    vehicleDefaultId: vehicleDefaultId,
    vehicleId: toNullableNumber(form.vehicle),
    status: form.status || null,
    isDayOff: isDayOff,
    operationId: extractId(rawData, "operationId"),
    adhocServiceId: adhocServiceId,
    depositId: depositId,
    depositName: depositName || null,
  };

  const validatedPayload = WeekPlannerCreateSchema.parse(unvalidatedPayload);

  // Build DTO with required fields (WeekPlannerCreateDTO expects number, not null)
  const routeId = validatedPayload.routeId ?? validatedPayload.routeDefaultId ?? null;
  const vehicleId = validatedPayload.vehicleId ?? validatedPayload.vehicleDefaultId ?? null;
  const userId = validatedPayload.userId ?? 0;

  return {
    ...validatedPayload,
    date: validatedPayload.date,
    userId: userId,
    routeId: routeId,
    vehicleId: vehicleId,
    isDayOff: isDayOff,
    status: validatedPayload.status ?? BUSINESS_RULES.WORKING_STATUS.WORKING,
  } as WeekPlannerCreateDTO;
};



