/**
 * API para a aba Liquidation Damages (HOME).
 * Requests: GET vendor(s), GET vehicle(s), GET liquidation-damage-deductions.
 */

import { fetchVendors, type Vendor } from "@/lib/vendors-api";
import { fetchVehicles } from "@/lib/vehicles";
import type { Vehicle } from "@/lib/vehicles";
import {
  fetchLiquidationDamageDeductions,
  type LiquidationDamageDeduction,
} from "@/lib/deductions-api";

// ---------------------------------------------------------------------------
// 1) GET Vendor(s)
// ---------------------------------------------------------------------------
/** Request: GET ${API_BASE_URL}/bff/vendor */
export const getVendors = async (): Promise<Vendor[]> => {
  return fetchVendors();
};

// ---------------------------------------------------------------------------
// 2) GET Vehicle(s)
// ---------------------------------------------------------------------------
/** Request: GET ${API_BASE_URL}/bff/vehicles */
export const getVehicles = async (): Promise<Vehicle[]> => {
  return fetchVehicles();
};

// ---------------------------------------------------------------------------
// 3) GET Liquidation damage deductions
// ---------------------------------------------------------------------------
/** Request: GET ${API_BASE_URL}/bff/liquidation-damage-deductions?month=&year= */
export const getLiquidationDamageDeductions = async (
  month?: number,
  year?: number
): Promise<LiquidationDamageDeduction[]> => {
  return fetchLiquidationDamageDeductions(month, year);
};

// ---------------------------------------------------------------------------
// Combined: deductions + vendor/vehicle names
// ---------------------------------------------------------------------------
export interface LiquidationDamageWithDetails extends LiquidationDamageDeduction {
  vendor?: string | null;
  vehicle?: string | null;
}

/**
 * Fetches deductions, vendors and vehicles; merges vendor name (by userId)
 * and vehicle name (by vehicleId) into each deduction.
 */
export const getLiquidationDamagesWithDetails = async (
  month?: number,
  year?: number
): Promise<LiquidationDamageWithDetails[]> => {
  const [deductions, vendors, vehicles] = await Promise.all([
    getLiquidationDamageDeductions(month, year),
    getVendors(),
    getVehicles(),
  ]);

  const vendorById = new Map<number, string>();
  vendors.forEach((v) => {
    const name = [v.firstName, v.lastName].filter(Boolean).join(" ").trim();
    if (v.id && name) vendorById.set(v.id, name);
  });

  const vehicleById = new Map<number, string>();
  vehicles.forEach((v) => {
    const id = v.vehicleId ?? (v as Record<string, unknown>).vehicleId as number | undefined;
    const label =
      (v.registrationPlates ?? (v as Record<string, unknown>).registrationPlates as string) ||
      [v.manufacturer, v.model].filter(Boolean).join(" ").trim();
    if (id != null && label) vehicleById.set(id, label);
  });

  return deductions.map((d) => ({
    ...d,
    vendor: d.vendor ?? d.vendorName ?? vendorById.get(d.userId) ?? null,
    vehicle:
      d.vehicle ??
      d.vehicleName ??
      (d.vehicleId != null ? vehicleById.get(d.vehicleId) ?? null : null),
  }));
};


