/**
 * API para performance do dia anterior (Last Day / day-overview).
 * GET /bff/day-overview/:userId/:date?metrics=performance
 */

import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { hasAuthSession, getBearerAuthHeader } from "@/lib/auth"
import type { DailyPerformanceData } from "@/app/(private)/daily-performance-insight/types";

const API_BASE_URL = getApiBaseUrl();

export async function fetchDayOverview(
  userId: number | string,
  date: string
): Promise<DailyPerformanceData[]> {
  if (!API_BASE_URL) return [];
  if (!hasAuthSession()) return [];

  const url = `${API_BASE_URL}/bff/day-overview/${userId}/${date}?metrics=performance`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404 || res.status === 500) return [];
    throw new Error(`day-overview: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const arr = Array.isArray(data) ? data : [data];
  const out: DailyPerformanceData[] = [];
  const seen = new Set<number>();
  for (const op of arr) {
    if (op?.operationId != null && !seen.has(op.operationId)) {
      seen.add(op.operationId);
      out.push(op as DailyPerformanceData);
    }
  }
  return out;
}
