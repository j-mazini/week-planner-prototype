import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { hasAuthSession, getBearerAuthHeader } from '@/lib/auth'
import { SpStatusDTO, SpStatusDaily, SpStatusMonthly } from './sp-types';

const API_BASE_URL = getApiBaseUrl();

function toNum(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isNaN(n) ? 0 : n;
}

/** Normaliza daily da API (aceita snake_case ou camelCase) para SpStatusDaily */
function normalizeDaily(raw: unknown): SpStatusDaily | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  return {
    totalStops: toNum(r.totalStops ?? r.total_stops),
    totalRoutes: toNum(r.totalRoutes ?? r.total_routes),
    totalDhlRouteCost: toNum(r.totalDhlRouteCost ?? r.total_dhl_route_cost),
    totalBaRouteCost: toNum(r.totalBaRouteCost ?? r.total_ba_route_cost),
    totalAmount: toNum(r.totalAmount ?? r.total_amount),
    totalDhlSpr: toNum(r.totalDhlSpr ?? r.total_dhl_spr),
    totalDhlAvrgPerStops: toNum(r.totalDhlAvrgPerStops ?? r.total_dhl_avrg_per_stops),
    totalAvrg: toNum(r.totalAvrg ?? r.total_avrg),
  };
}

export async function fetchSpStatus(date?: Date): Promise<SpStatusDTO | null> {
  if (!API_BASE_URL) return null;
  if (!hasAuthSession()) return null;

  try {
    const d = date ?? new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year  = String(d.getFullYear());
    const day   = String(d.getDate()).padStart(2, '0');

    const url = new URL(`${API_BASE_URL}/bff/status`);
    url.searchParams.set('month', month);
    url.searchParams.set('year', year);
    url.searchParams.set('day', day);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const rawData = (await res.json()) as unknown;

    // Handle two possible response formats:
    // 1. Nested structure: { status: { daily: {...}, monthly: {...} } }
    // 2. Flat structure: { totalStops, totalRoutes, totalAmount, ... }
    let dailyData: unknown;
    let monthlyData: unknown;

    if (rawData && typeof rawData === 'object' && 'status' in rawData) {
      // Already in expected nested format
      const nested = rawData as { status?: { daily?: unknown; monthly?: unknown } };
      dailyData = nested.status?.daily;
      monthlyData = nested.status?.monthly;
    } else {
      // Flat format - treat the entire response as daily data
      dailyData = rawData;
      monthlyData = undefined;
    }

    const daily = dailyData != null ? normalizeDaily(dailyData) : null;
    if (!daily) return null;
    const rawMonthly = monthlyData;
    const monthly: SpStatusMonthly =
      rawMonthly != null && typeof rawMonthly === 'object'
        ? {
            totalStops: toNum((rawMonthly as Record<string, unknown>).totalStops ?? (rawMonthly as Record<string, unknown>).total_stops),
            totalRoutes: toNum((rawMonthly as Record<string, unknown>).totalRoutes ?? (rawMonthly as Record<string, unknown>).total_routes),
            totalDhlRouteCost: toNum((rawMonthly as Record<string, unknown>).totalDhlRouteCost ?? (rawMonthly as Record<string, unknown>).total_dhl_route_cost),
            totalBaRouteCost: toNum((rawMonthly as Record<string, unknown>).totalBaRouteCost ?? (rawMonthly as Record<string, unknown>).total_ba_route_cost),
            totalPendingDeductions: toNum((rawMonthly as Record<string, unknown>).totalPendingDeductions ?? (rawMonthly as Record<string, unknown>).total_pending_deductions),
            totalAmount: toNum((rawMonthly as Record<string, unknown>).totalAmount ?? (rawMonthly as Record<string, unknown>).total_amount),
          }
        : { totalStops: 0, totalRoutes: 0, totalDhlRouteCost: 0, totalBaRouteCost: 0, totalPendingDeductions: 0, totalAmount: 0 };
    return { status: { daily, monthly } };
  } catch {
    return null;
  }
}
