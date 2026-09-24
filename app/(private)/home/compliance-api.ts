/**
 * API para o bloco Compliance (HOME).
 * GET vendors – formação (Cargo, Dangerous Goods, Manual Handling).
 * GET vehicles – veículos que requerem atenção (MOT, tax, service due).
 */

import { fetchVendors, type Vendor } from "@/lib/vendors";
import { fetchVehicles } from "@/lib/vehicles";
import type { Vehicle } from "@/lib/vehicles";

/**
 * Request: GET ${API_BASE_URL}/bff/vendor
 * Retorna todos os vendors para avaliar compliance de formação.
 */
export const getVendorsForCompliance = async (): Promise<Vendor[]> => {
  return fetchVendors();
};

/**
 * Request: GET ${API_BASE_URL}/bff/vehicles
 * Retorna todos os veículos para avaliar MOT, tax e service due (vehicles requiring attention).
 */
export const getVehiclesForCompliance = async (): Promise<Vehicle[]> => {
  return fetchVehicles();
};
