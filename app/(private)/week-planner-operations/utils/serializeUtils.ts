import { z } from 'zod';
import type { WeekPlannerFormData } from '../contexts/PlannerContext';
import type { WeekPlannerCreateDTO } from '../services/apiService';

// Zod schema for WeekPlannerCreateDTO validation
export const WeekPlannerCreateSchema = z.object({
  date: z.string().min(1, "Date is required"),
  routeDefaultId: z.number().positive("Route is required"),
  routeId: z.number().positive().nullable().optional(),
  userId: z.number().positive("Vendor is required"),
  costModelDefaultId: z.number().positive("Cost Model is required"),
  costModelId: z.number().positive().nullable().optional(),
  rate: z.number().nullable().optional(),
  routeCost: z.number().nullable().optional(),
  routeSort: z.number().nullable().optional(),
  adhocSort: z.number().nullable().optional(),
  extra: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  vehicleDefaultId: z.number().positive("Vehicle is required"),
  vehicleId: z.number().positive().nullable().optional(),
  vendorTypeDefaultId: z.number().positive("Vendor Type is required"),
  vendorTypeId: z.number().positive().nullable().optional(),
  status: z.string().nullable().optional(),
  isDayOff: z.boolean().optional(),
  operationId: z.number().positive().nullable().optional(),
});

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

  const costModelDefaultId =
    extractId(rawData?.costModel, "costModelDefaultId") ??
    extractId(rawData, "costModelDefaultId") ??
    toNullableNumber(form.costModel);

  const vehicleDefaultId =
    extractId(rawData?.vehicle, "vehicleDefaultId") ??
    extractId(rawData, "vehicleDefaultId") ??
    toNullableNumber(form.vehicle);

  const vendorTypeDefaultId =
    extractId(rawData?.vendorType, "vendorTypeDefaultId", "vendorTypeId") ??
    extractId(rawData, "vendorTypeDefaultId") ??
    1;

  const isDayOff = form.isDayOff === "true" || form.isDayOff === "1";

  const unvalidatedPayload = {
    date: form.date,
    routeDefaultId: routeDefaultId,
    routeId: toNullableNumber(form.route),
    userId: toNullableNumber(form.name),
    costModelDefaultId: costModelDefaultId,
    costModelId: toNullableNumber(form.costModel),
    rate: toNullableNumber(form.rate),
    routeCost: toNullableNumber(form.routeCost),
    routeSort: toNullableNumber(form.routeSort),
    adhocSort: toNullableNumber(form.adhocSort),
    extra: toNullableNumber(form.extras),
    notes: form.notes || null,
    vehicleDefaultId: vehicleDefaultId,
    vehicleId: toNullableNumber(form.vehicle),
    vendorTypeDefaultId: vendorTypeDefaultId,
    vendorTypeId: extractId(rawData, "vendorTypeId"),
    status: form.status || null,
    isDayOff: isDayOff,
    operationId: extractId(rawData, "operationId"),
  };

  const validatedPayload = WeekPlannerCreateSchema.parse(unvalidatedPayload);

  // Return object that strictly matches WeekPlannerCreateDTO requirements.
  // We use fallback values for required IDs and convert null to undefined for optional fields.
  return {
    ...validatedPayload,
    date: validatedPayload.date,
    routeId: validatedPayload.routeId ?? validatedPayload.routeDefaultId,
    costModelId: validatedPayload.costModelId ?? validatedPayload.costModelDefaultId,
    vehicleId: validatedPayload.vehicleId ?? validatedPayload.vehicleDefaultId,
    userId: validatedPayload.userId,
    // Convert null to undefined for optional fields to match DTO interface
    rate: validatedPayload.rate ?? undefined,
    routeCost: validatedPayload.routeCost ?? undefined,
    routeSort: validatedPayload.routeSort ?? undefined,
    adhocSort: validatedPayload.adhocSort ?? undefined,
    extra: validatedPayload.extra ?? undefined,
    notes: validatedPayload.notes ?? undefined,
    status: validatedPayload.status ?? undefined,
    isDayOff: !!validatedPayload.isDayOff,
    operationId: validatedPayload.operationId ?? undefined,
    vendorTypeId: validatedPayload.vendorTypeId ?? undefined,
  } as WeekPlannerCreateDTO;
};





