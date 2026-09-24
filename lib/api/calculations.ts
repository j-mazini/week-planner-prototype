import { getApiBaseUrl } from "@/lib/apiBaseUrl";
﻿import { hasAuthSession, getBearerAuthHeader } from "@/lib/auth"
import { CostModel } from "./cost-models";
import { guardedFetch } from "../in-flight-guard";
export interface CalculateRevenueParams {
  totalStops: number;
  rate: number | null;
  extra: number;
  adhocSort: number;
  routeSort: number;
  routeName: string;
  costModel?: CostModel[];
  operationCostModel?: number | null;
  userId?: number | null;
  vehicleId?: number | null;
  date?: string;
  isElectricVehicle?: boolean;
}

export interface RevenueResult {
  bands: Array<{
    stops: number;
    rate: number;
    revenue: number;
    minStops: number;
    maxStops: number;
  }>;
  totalRevenue: number;
  showBands: boolean;
  baseRevenueZeroed: boolean;
  resolvedRate?: number;
}

/**
 * Calls the backend API to calculate revenue.
 * POST /bff/calculations/revenue
 * 
 * @param params - The parameters for the revenue calculation.
 * @returns Promise with the calculated revenue result.
 */
export const fetchCalculateRevenue = async (params: CalculateRevenueParams): Promise<RevenueResult> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found.");
  }

  try {
    let response = await guardedFetch(`${API_BASE_URL}/bff/calculations/revenue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify(params),
    });

    // Backward compatibility for newer BFFs that may expose /reports/revenue.
    if (response.status === 404) {
      response = await guardedFetch(`${API_BASE_URL}/bff/reports/revenue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getBearerAuthHeader(),
        },
        body: JSON.stringify(params),
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to calculate revenue (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calculating revenue:", error);
    throw error;
  }
};
