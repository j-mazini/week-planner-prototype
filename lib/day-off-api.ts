import { getApiBaseUrl } from "@/lib/apiBaseUrl";
﻿import { hasAuthSession, getBearerAuthHeader } from './auth'
import { guardedFetch } from "@/lib/in-flight-guard";

const API_BASE_URL = getApiBaseUrl();

export type DayOffEntry = {
  id: string;
  userId: number;
  date: string;
  reason?: string;
  notes?: string;
};

export type DayOffCreateRequest = {
  userId: number;
  dates: string[];
  reason?: string;
  notes?: string;
};

const ensureApiConfigured = () => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check NEXT_PUBLIC_API_URL.");
  }
};

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  ...getBearerAuthHeader(),
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
});

const normalizeDate = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") {
    return value.split("T")[0];
  }
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "" : normalizeDate(date);
};

const expandDateRange = (start: string, end: string): string[] => {
  if (!start) {
    return end ? [end] : [];
  }
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date(start);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return [start];
  }

  const dates: string[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    dates.push(normalizeDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

const extractWeekPlannerArray = (data: unknown): Record<string, unknown>[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (typeof data !== "object") return [];

  const candidate = data as Record<string, unknown>;
  if (Array.isArray(candidate.data)) return candidate.data as Record<string, unknown>[];
  if (Array.isArray(candidate.weekPlanners)) return candidate.weekPlanners as Record<string, unknown>[];
  if (Array.isArray(candidate.week_planners)) return candidate.week_planners as Record<string, unknown>[];
  if (Array.isArray(candidate.results)) return candidate.results as Record<string, unknown>[];
  return [];
};

const isDayOffRecord = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return value.toLowerCase() === "true" || value === "1";
  return false;
};

/**
 * Register day off entries for a vendor
 */
export async function registerDayOff(data: DayOffCreateRequest): Promise<DayOffEntry[]> {
  ensureApiConfigured();
  if (!hasAuthSession()) {
    throw new Error('Authentication required');
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/week-planners/day-off`, {
      method: 'POST',
      headers: getAuthHeaders(),
      cache: 'no-store',
      body: JSON.stringify({
        userId: data.userId,
        startDate: data.dates[0],
        eD_date: data.dates.length > 1 ? data.dates[data.dates.length - 1] : data.dates[0],
        notes: data.notes || '',
        reason: data.reason || '',
        dates: data.dates, // Include all dates in the request
      }),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid token. Try logging in again or contact the administrator.');
      }
      const error = await response.text().catch(() => '');
      throw new Error(error || 'Failed to register day off');
    }

    // For now, we'll create entries locally since the API might not return them
    // In production, the API should return the created entries
    const created: DayOffEntry[] = data.dates.map((date, index) => ({
      id: `dayoff-${data.userId}-${date}-${Date.now()}-${index}`,
      userId: data.userId,
      date,
      reason: data.reason,
      notes: data.notes,
    }));

    return created;
  } catch (error) {
    console.error('Error registering day off:', error);
    throw error;
  }
}

/**
 * Delete day off entry
 */
export async function deleteDayOff(entryId: string): Promise<void> {
  ensureApiConfigured();
  if (!hasAuthSession()) {
    throw new Error('Authentication required');
  }

  try {
    // For now, we'll use the week planner delete endpoint
    // Extract week planner ID from entry ID if it's a week planner entry
    // Otherwise, this is a local entry and we just need to handle it client-side
    if (entryId.startsWith('dayoff-')) {
      // This is a local entry, no API call needed
      // In production, you'd have a dedicated day-off delete endpoint
      return;
    }

    // If it's a week planner ID, delete it
    const weekPlannerId = parseInt(entryId, 10);
    if (!isNaN(weekPlannerId)) {
      const response = await guardedFetch(`${API_BASE_URL}/bff/week-planners/${weekPlannerId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid token. Try logging in again or contact the administrator.');
        }
        const error = await response.text().catch(() => '');
        throw new Error(error || 'Failed to delete day off');
      }
    }
  } catch (error) {
    console.error('Error deleting day off:', error);
    throw error;
  }
}

/**
 * Get day off entries for a date range
 */
export async function getDayOffEntries(startDate: string, endDate: string): Promise<DayOffEntry[]> {
  ensureApiConfigured();
  if (!hasAuthSession()) {
    throw new Error('Authentication required');
  }

  try {
    const dateRange = expandDateRange(startDate, endDate);
    if (dateRange.length === 0) {
      return [];
    }

    const requests = dateRange.map(async (date) => {
      const params = new URLSearchParams();
      params.append("date", date);
      params.append("isDayOff", "true");
      params.append("_t", String(Date.now()));
      params.append("includeLinkedOperations", "true");

      const response = await guardedFetch(`${API_BASE_URL}/bff/week-planners?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid token. Try logging in again or contact the administrator.');
        }
        const error = await response.text().catch(() => '');
        throw new Error(error || 'Failed to fetch day off entries');
      }

      const payload = await response.json();
      return extractWeekPlannerArray(payload);
    });

    const results = await Promise.all(requests);
    const flattened = results.flat();

    const entries: DayOffEntry[] = [];
    const seen = new Set<string>();

    flattened.forEach((wp) => {
      if (!isDayOffRecord((wp as Record<string, unknown>).isDayOff ?? (wp as Record<string, unknown>).isDayOff)) {
        return;
      }

      const userId = Number((wp as Record<string, unknown>).userId ?? 0);
      if (!userId) {
        return;
      }

      const range = expandDateRange(
        normalizeDate((wp as Record<string, unknown>).startDate ?? (wp as Record<string, unknown>).date),
        normalizeDate((wp as Record<string, unknown>).endDate ?? (wp as Record<string, unknown>).date),
      );

      range.forEach((dateStr) => {
        const key = `${userId}-${dateStr}`;
        if (seen.has(key)) {
          return;
        }
        seen.add(key);
        entries.push({
          id: String((wp as Record<string, unknown>).weekPlannerId ?? key),
          userId,
          date: dateStr,
          notes: (wp as Record<string, unknown>).notes ? String((wp as Record<string, unknown>).notes) : undefined,
        });
      });
    });

    return entries;
  } catch (error) {
    console.error('Error fetching day off entries:', error);
    throw error;
  }
}

/**
 * Fetch all vendors/operators with OFF status for a date range
 * GET /bff/week-planners/day-off-items?startDate=...&endDate=...&routeId=48&status=NotWorking&status=OFF
 */
export async function fetchAllVendorsOff(
  startDate: string,
  endDate: string,
  routeId: number = 48
): Promise<Record<string, unknown>[]> {
  ensureApiConfigured();
  if (!hasAuthSession()) {
    console.warn("No token available for fetching day-off items");
    return [];
  }

  try {
    const params = new URLSearchParams();
    if (startDate && String(startDate).trim()) params.set("startDate", String(startDate).trim());
    if (endDate && String(endDate).trim()) params.set("endDate", String(endDate).trim());
    params.set("routeId", String(routeId));
    params.set("status", "NotWorking");
    params.append("status", "OFF");
    const query = params.toString();
    const url = `${API_BASE_URL}/bff/week-planners/day-off-items${query ? `?${query}` : ""}`;

    const response = await guardedFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      cache: "no-store",
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = (errorData as { message?: string }).message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      console.error("Failed to fetch day-off items:", response.status);
      return [];
    }

    const data = await response.json();
    let itemsArray: Record<string, unknown>[] = [];

    if (Array.isArray(data)) {
      itemsArray = data;
    } else if (data.data && Array.isArray(data.data)) {
      itemsArray = data.data;
    } else if (data.weekPlanners && Array.isArray(data.weekPlanners)) {
      itemsArray = data.weekPlanners;
    } else if (data.items && Array.isArray(data.items)) {
      itemsArray = data.items;
    }

    return itemsArray;
  } catch (err) {
    console.error("Error fetching day-off items:", err);
    return [];
  }
}
