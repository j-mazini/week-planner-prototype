import { getApiBaseUrl } from "@/lib/apiBaseUrl";
﻿import { getUserTypeFromToken, hasAuthSession, getBearerAuthHeader } from '@/lib/auth';
import type { WeekPlannerRecord } from '../contexts/PlannerContext';
import { normalizeWeekPlanner } from '../utils/normalizeUtils';
import { resolveDepositIdForRestrictedUser } from '@/lib/daily-supervisor-check';
import { BUSINESS_RULES } from '@/src/constants/businessRules';
import { guardedFetch } from "@/lib/in-flight-guard";
import type {
  WeekPlannerCreateDTO,
  WeekPlannerBulkCreateDTO,
  WeekPlannerListDTO,
  WeekPlannerUpdateDTO,
  WeekPlannerDetailDTO,
  WeekPlannerFiltersDTO,
  WeekPlannerPaginatedResponseDTO,
  WeekPlannerTypesDTO,
  WeekPlannerRouteNestedDTO,
  WeekPlannerCostModelNestedDTO,
  WeekPlannerVehicleNestedDTO,
  WeekPlannerVendorTypeNestedDTO,
  WeekPlannerAdhocServiceNestedDTO,
  WeekPlannerToOperationDTO,
} from '../types/week-planner-dto';

export type {
  WeekPlannerCreateDTO,
  WeekPlannerBulkCreateDTO,
  WeekPlannerListDTO,
  WeekPlannerUpdateDTO,
  WeekPlannerDetailDTO,
  WeekPlannerFiltersDTO,
  WeekPlannerPaginatedResponseDTO,
  WeekPlannerTypesDTO,
  WeekPlannerRouteNestedDTO,
  WeekPlannerCostModelNestedDTO,
  WeekPlannerVehicleNestedDTO,
  WeekPlannerVendorTypeNestedDTO,
  WeekPlannerAdhocServiceNestedDTO,
  WeekPlannerToOperationDTO,
};

const API_BASE_URL = getApiBaseUrl();

export type WeekPlannerTypes = {
  vendors?: string[];
  userTypes?: string[];
  paymentModes?: string[];
  routes?: string[];
  vehicles?: string[];
  statuses?: string[];
  costModels?: string[];
};

/**
 * Fetch week planner types from API
 */
export const fetchWeekPlannerTypes = async (): Promise<WeekPlannerTypes> => {
  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    return {};
  }

  try {
    if (!hasAuthSession()) {
      console.warn("No token available for fetching week planner types");
      return {};
    }

    const response = await guardedFetch(`${API_BASE_URL}/bff/week-planners/types`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch week planner types:", response.status);
      return {};
    }

    const data = await response.json();

    const types: WeekPlannerTypes = {};
    if (data.vendors && Array.isArray(data.vendors)) {
      types.vendors = data.vendors;
    }
    if (data.userTypes && Array.isArray(data.userTypes)) {
      types.userTypes = data.userTypes;
    }
    if (data.paymentModes && Array.isArray(data.paymentModes)) {
      types.paymentModes = data.paymentModes;
    }
    if (data.routes && Array.isArray(data.routes)) {
      types.routes = data.routes;
    }
    if (data.vehicles && Array.isArray(data.vehicles)) {
      types.vehicles = data.vehicles;
    }
    if (data.statuses && Array.isArray(data.statuses)) {
      types.statuses = data.statuses;
    }
    if (data.costModels && Array.isArray(data.costModels)) {
      types.costModels = data.costModels;
    }

    return types;
  } catch (err) {
    console.error("Error fetching week planner types:", err);
    return {};
  }
};

/**
 * Fetch paginated week planners
 */
export const fetchWeekPlannersPaginated = async (
  page: number,
  limit: number,
  date?: string,
  search?: string,
  servicePartnerId?: number
): Promise<{ data: WeekPlannerRecord[]; total: number; page: number; limit: number }> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("limit", String(limit));
  if (date) {
    params.append("date", date);
  }
  if (search) {
    params.append("search", search);
  }
  if (servicePartnerId !== undefined && servicePartnerId !== 0) {
    params.append("servicePartnerId", String(servicePartnerId));
  }

  // Using the dedicated endpoint that returns only week planners without operations
  // (i.e., where operationId is null)
  const url = `${API_BASE_URL}/bff/week-planners/without-operations/paginated?${params.toString()}`;

  let response: Response;
  try {
    response = await guardedFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      cache: "no-store",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "Failed to fetch" || (err instanceof TypeError && msg.includes("fetch"))) {
      throw new Error(
        `Network error calling week-planners API. Check: 1) Backend is running, 2) NEXT_PUBLIC_API_URL is correct (current: ${API_BASE_URL}), 3) CORS allows this origin. URL: ${url}`
      );
    }
    throw err;
  }

  if (!response.ok) {
    let errorText = "";
    try {
      errorText = await response.text();
      console.error("Error loading week planners:", errorText);
    } catch {
      console.error("Could not read error response body");
    }

    if (response.status === 404) {
      throw new Error(`Route not found (404). Please verify the backend route is registered: ${url}`);
    }

    throw new Error(`Failed to load week planners (${response.status}): ${errorText || response.statusText}`);
  }

  const data = await response.json();

  let weekPlannersArray: Record<string, unknown>[] = [];
  let paginationMeta = { total: 0, page: 1, limit: limit };

  const coerceArray = (value: unknown): Record<string, unknown>[] | null =>
    Array.isArray(value) ? (value as Record<string, unknown>[]) : null;

  const extractFromObject = (
    obj: Record<string, unknown>,
  ): { items: Record<string, unknown>[]; meta: { total: number; page: number; limit: number } } | null => {
    // Try common list keys first
    const candidates: Array<Record<string, unknown>[] | null> = [
      coerceArray(obj.data),
      coerceArray(obj.items),
      coerceArray(obj.results),
      coerceArray(obj.weekPlanners),
      coerceArray(obj.weekPlanners),
      coerceArray(obj.records),
      coerceArray(obj.rows),
      coerceArray(obj.payload),
    ];

    // Also handle nested `data` containers: { data: { items: [...] } }, etc.
    if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
      const nested = obj.data as Record<string, unknown>;
      candidates.unshift(
        coerceArray(nested.data),
        coerceArray(nested.items),
        coerceArray(nested.results),
        coerceArray(nested.weekPlanners),
        coerceArray(nested.weekPlanners),
        coerceArray(nested.records),
        coerceArray(nested.rows),
      );
    }

    const items = candidates.find((c) => Array.isArray(c)) ?? null;
    if (!items) return null;

    const pagination = (obj.pagination && typeof obj.pagination === "object" ? (obj.pagination as Record<string, unknown>) : null) ??
      (obj.meta && typeof obj.meta === "object" ? (obj.meta as Record<string, unknown>) : null) ??
      (obj._meta && typeof obj._meta === "object" ? (obj._meta as Record<string, unknown>) : null);

    const totalFromTop =
      Number(obj.total ?? obj.totalItems ?? obj.totalCount ?? obj.count ?? obj.total_records ?? obj.totalRecords);
    const pageFromTop = Number(obj.page ?? obj.currentPage ?? obj.pageIndex);
    const limitFromTop = Number(obj.limit ?? obj.itemsPerPage ?? obj.perPage ?? obj.pageSize);

    const totalFromPagination =
      pagination ? Number(pagination.totalItems ?? pagination.total ?? pagination.totalCount ?? pagination.count) : NaN;
    const pageFromPagination = pagination ? Number(pagination.currentPage ?? pagination.page) : NaN;
    const limitFromPagination = pagination ? Number(pagination.itemsPerPage ?? pagination.limit ?? pagination.perPage) : NaN;

    const meta = {
      total: Number.isFinite(totalFromPagination) && totalFromPagination >= 0
        ? totalFromPagination
        : (Number.isFinite(totalFromTop) && totalFromTop >= 0 ? totalFromTop : items.length),
      page: Number.isFinite(pageFromPagination) && pageFromPagination > 0
        ? pageFromPagination
        : (Number.isFinite(pageFromTop) && pageFromTop > 0 ? pageFromTop : page),
      limit: Number.isFinite(limitFromPagination) && limitFromPagination > 0
        ? limitFromPagination
        : (Number.isFinite(limitFromTop) && limitFromTop > 0 ? limitFromTop : limit),
    };

    return { items, meta };
  };

  if (Array.isArray(data)) {
    weekPlannersArray = data as Record<string, unknown>[];
    paginationMeta.total = weekPlannersArray.length;
  } else if (data && typeof data === "object") {
    const extracted = extractFromObject(data as Record<string, unknown>);
    if (extracted) {
      weekPlannersArray = extracted.items;
      paginationMeta = extracted.meta;
    } else {
      console.warn(
        "[week-planner-operations] Unexpected /bff/week-planners/without-operations/paginated response shape. Keys:",
        Object.keys(data as Record<string, unknown>),
        data,
      );
    }
  }

  const normalized = weekPlannersArray.map(normalizeWeekPlanner);

  return {
    data: normalized,
    total: paginationMeta.total,
    page: paginationMeta.page,
    limit: paginationMeta.limit,
  };
};

/**
 * Fetch paginated week planners that are finished and linked to an operation (Popular section).
 * Filters: isFinished = true, operationId !== null.
 */
export const fetchWeekPlannersPopularPaginated = async (
  page: number,
  limit: number,
  date?: string,
  search?: string
): Promise<{ data: WeekPlannerRecord[]; total: number; page: number; limit: number }> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("limit", String(limit));
  if (date) {
    params.append("date", date);
  }
  if (search) {
    params.append("search", search);
  }

  const url = `${API_BASE_URL}/bff/week-planners/finished-with-operations/paginated?${params.toString()}`;

  let response: Response;
  try {
    response = await guardedFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      cache: "no-store",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "Failed to fetch" || (err instanceof TypeError && msg.includes("fetch"))) {
      throw new Error(
        `Network error calling finished-with-operations API. Check backend is running and NEXT_PUBLIC_API_URL (current: ${API_BASE_URL}). URL: ${url}`
      );
    }
    throw err;
  }

  if (!response.ok) {
    let errorText = "";
    try {
      errorText = await response.text();
    } catch {
      // ignore
    }
    if (response.status === 404) {
      throw new Error(`Route not found (404): ${url}`);
    }
    throw new Error(`Failed to load popular week planners (${response.status}): ${errorText || response.statusText}`);
  }

  const data = await response.json();
  let weekPlannersArray: Record<string, unknown>[] = [];
  let paginationMeta = { total: 0, page: 1, limit: limit };

  const coerceArray = (value: unknown): Record<string, unknown>[] | null =>
    Array.isArray(value) ? (value as Record<string, unknown>[]) : null;

  const pagination = (data?.pagination && typeof data.pagination === "object" ? data.pagination : null) as Record<string, unknown> | null;
  const items = coerceArray(data?.data) ?? coerceArray(data?.items) ?? coerceArray(data?.weekPlanners) ?? [];
  const totalItems = pagination ? Number(pagination.totalItems ?? pagination.total) : (Number(data?.total) || items.length);
  const currentPage = pagination ? Number(pagination.currentPage ?? pagination.page) : (Number(data?.page) || page);
  const itemsPerPage = pagination ? Number(pagination.itemsPerPage ?? pagination.limit) : (Number(data?.limit) || limit);

  weekPlannersArray = items;
  paginationMeta = { total: totalItems, page: currentPage, limit: itemsPerPage };

  const normalized = weekPlannersArray.map(normalizeWeekPlanner);
  return {
    data: normalized,
    total: paginationMeta.total,
    page: paginationMeta.page,
    limit: paginationMeta.limit,
  };
};

/**
 * Fetch all week planners for a specific date (non-paginated)
 */
export const fetchAllWeekPlannersForDate = async (
  date: string,
  depositId?: number | null,
  servicePartnerId?: number
): Promise<WeekPlannerRecord[]> => {
  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    return [];
  }

  try {
    if (!hasAuthSession()) {
      console.warn("No token available for fetching all week planners");
      return [];
    }

    const params = new URLSearchParams();
    params.append("date", date);
    params.append("_t", String(Date.now()));
    params.append("includeLinkedOperations", "true");
    // Optional filter by depositId (if null/undefined, bring all).
    // Special rule: if logged user is `SUPERVISOR`, auto-resolve depositId from daily-supervisor-check.
    const userTypeId = getUserTypeFromToken();
    let effectiveDepositId = depositId;
    if (effectiveDepositId === undefined || effectiveDepositId === null) {
      effectiveDepositId = await resolveDepositIdForRestrictedUser(date);
    }
    // Supervisor: se não houver daily_team_support para o usuário na data, não mostrar nada
    if (userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR && (effectiveDepositId === undefined || effectiveDepositId === null)) {
      return [];
    }
    if (effectiveDepositId !== undefined && effectiveDepositId !== null && Number.isFinite(Number(effectiveDepositId))) {
      params.append("depositId", String(Number(effectiveDepositId)));
    }
    if (servicePartnerId !== undefined && servicePartnerId !== 0) {
      params.append("servicePartnerId", String(servicePartnerId));
    }

    const url = `${API_BASE_URL}/bff/week-planners?${params.toString()}`;

    const response = await guardedFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch all week planners:", response.status);
      return [];
    }

    const data = await response.json();

    let weekPlannersArray: Record<string, unknown>[] = [];
    if (Array.isArray(data)) {
      weekPlannersArray = data;
    } else if (data.data && Array.isArray(data.data)) {
      weekPlannersArray = data.data;
    } else if (data.weekPlanners && Array.isArray(data.weekPlanners)) {
      weekPlannersArray = data.weekPlanners;
    } else if (data.weekPlanners && Array.isArray(data.weekPlanners)) {
      weekPlannersArray = data.weekPlanners;
    }

    const normalized = weekPlannersArray.map(normalizeWeekPlanner);

    return normalized;
  } catch (err) {
    console.error("Error fetching all week planners:", err);
    return [];
  }
};

/**
 * Fetch week planners with status Off (day off) for a date.
 * Uses GET /bff/week-planners?date=... and filters for isDayOff or status Off.
 */
export const fetchWeekPlannersStatusOff = async (date: string): Promise<WeekPlannerRecord[]> => {
  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    return [];
  }

  try {
    if (!hasAuthSession()) {
      console.warn("No token available for fetching week planners status off");
      return [];
    }

    const params = new URLSearchParams();
    params.append("date", date);
    params.append("_t", String(Date.now()));
    params.append("includeLinkedOperations", "true");

    const url = `${API_BASE_URL}/bff/week-planners?${params.toString()}`;

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
    });

    if (!response.ok) {
      console.error("Failed to fetch week planners (status off):", response.status);
      return [];
    }

    const data = await response.json();

    let weekPlannersArray: Record<string, unknown>[] = [];
    if (Array.isArray(data)) {
      weekPlannersArray = data;
    } else if (data.data && Array.isArray(data.data)) {
      weekPlannersArray = data.data;
    } else if (data.weekPlanners && Array.isArray(data.weekPlanners)) {
      weekPlannersArray = data.weekPlanners;
    } else if (data.weekPlanners && Array.isArray(data.weekPlanners)) {
      weekPlannersArray = data.weekPlanners;
    }

    const normalized = weekPlannersArray.map(normalizeWeekPlanner);

    const statusOff = normalized.filter((wp) => {
      const raw = wp.raw as Record<string, unknown>;
      const isDayOff =
        wp.isDayOff === "true" ||
        raw?.isDayOff === true ||
        raw?.isDayOff === "true" ||
        raw?.isDayOff === true;
      const status = String(raw?.status ?? wp.status ?? "").toLowerCase();
      return isDayOff || status === "off";
    });

    return statusOff;
  } catch (err) {
    console.error("Error fetching week planners status off:", err);
    return [];
  }
};

/**
 * Create a week planner
 */
export const createWeekPlanner = async (payload: WeekPlannerCreateDTO): Promise<WeekPlannerRecord> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  // The endpoint expects { weekPlanners: [...] } format
  const bulkPayload: WeekPlannerBulkCreateDTO = { weekPlanners: [payload] };
  const url = `${API_BASE_URL}/bff/week-planners/bulk`;

  let response: Response;
  try {
    response = await guardedFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      cache: "no-store",
      body: JSON.stringify(bulkPayload),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "Failed to fetch" || (err instanceof TypeError && msg.includes("fetch"))) {
      throw new Error(
        `Network error while creating record. Check: 1) Backend is running (${API_BASE_URL}), 2) CORS. URL: ${url}`
      );
    }
    throw err;
  }

  if (!response.ok) {
    let errorText = "";
    try {
      errorText = await response.text();
    } catch {
      // ignore
    }
    console.error("Bulk create error response:", errorText);
    let errorMessage = errorText || response.statusText;
    try {
      const errJson = JSON.parse(errorText || "{}");
      if (errJson.message) errorMessage = errJson.message;
      else if (errJson.error) errorMessage = typeof errJson.error === "string" ? errJson.error : JSON.stringify(errJson.error);
      else if (Array.isArray(errJson.errors)) errorMessage = errJson.errors.join("; ");
    } catch {
      // use errorText as is
    }
    throw new Error(`Failed to create record (${response.status}): ${errorMessage}`);
  }

  const created = await response.json();
  let weekPlannersArray: unknown[] = [];
  if (Array.isArray(created)) {
    weekPlannersArray = created;
  } else if (created.results && Array.isArray(created.results)) {
    weekPlannersArray = created.results;
  } else if (created.data && Array.isArray(created.data)) {
    weekPlannersArray = created.data;
  } else if (created.weekPlanners && Array.isArray(created.weekPlanners)) {
    weekPlannersArray = created.weekPlanners;
  } else if (created.weekPlanners && Array.isArray(created.weekPlanners)) {
    weekPlannersArray = created.weekPlanners;
  } else {
    weekPlannersArray = [created];
  }

  if (weekPlannersArray.length === 0) {
    throw new Error("No week planner returned from API");
  }

  return normalizeWeekPlanner(weekPlannersArray[0] as Record<string, unknown>);
};

/**
 * Create multiple week planners in bulk
 */
export const createWeekPlannersBulk = async (payload: WeekPlannerBulkCreateDTO): Promise<WeekPlannerRecord[]> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  // The endpoint expects { weekPlanners: [...] } format
  const response = await guardedFetch(`${API_BASE_URL}/bff/week-planners/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Bulk create error response:", errorText);
    throw new Error(`Failed to create week planners (${response.status}): ${errorText || response.statusText}`);
  }

  const created = await response.json();

  let weekPlannersArray: unknown[] = [];
  if (Array.isArray(created)) {
    weekPlannersArray = created;
  } else if (created.data && Array.isArray(created.data)) {
    weekPlannersArray = created.data;
  } else if (created.weekPlanners && Array.isArray(created.weekPlanners)) {
    weekPlannersArray = created.weekPlanners;
  } else if (created.weekPlanners && Array.isArray(created.weekPlanners)) {
    weekPlannersArray = created.weekPlanners;
  } else {
    weekPlannersArray = [created];
  }

  return weekPlannersArray.map(item => normalizeWeekPlanner(item as Record<string, unknown>));
};

/**
 * Update a week planner
 */
export const updateWeekPlanner = async (
  id: number,
  payload: WeekPlannerUpdateDTO
): Promise<WeekPlannerRecord> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await guardedFetch(
    `${API_BASE_URL}/bff/week-planners/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      cache: "no-store",
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Update error response:", errorText);
    throw new Error(`Failed to update week planner (${response.status}): ${errorText || response.statusText}`);
  }

  const updated = await response.json();

  const weekPlannerData = updated.data ?? updated.weekPlanner ?? updated;
  return normalizeWeekPlanner(weekPlannerData);
};

/**
 * Delete a week planner
 */
export const deleteWeekPlanner = async (id: number): Promise<void> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/week-planners/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Delete error response:", errorText);
    throw new Error(`Failed to delete week planner (${response.status}): ${errorText || response.statusText}`);
  }
};

/**
 * Create operations from week planners
 */
export const createOperationsFromWeekPlanners = async (
  operations: WeekPlannerToOperationDTO[]
): Promise<void> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  if (operations.length === 0) {
    return; // Nada para criar
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/operations/from-week-planners`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    cache: "no-store",
    body: JSON.stringify({ data: operations }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create operations from week planners (${response.status}): ${errorText || response.statusText}`,
    );
  }
};

/**
 * Submit week planners (create operations and update status)
 */
export const submitWeekPlanners = async (
  weekPlanners: WeekPlannerRecord[]
): Promise<void> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  // Build operations payload
  const operationsPayload = weekPlanners.map((weekPlanner) => {
    const raw = (weekPlanner.raw ?? {}) as Record<string, unknown>;
    const routeRaw = raw.route && typeof raw.route === "object" ? (raw.route as Record<string, unknown>) : {};
    const costModelRaw = raw.costModel && typeof raw.costModel === "object" ? (raw.costModel as Record<string, unknown>) : {};
    const vehicleRaw = raw.vehicle && typeof raw.vehicle === "object" ? (raw.vehicle as Record<string, unknown>) : {};
    const vendorTypeRaw = raw.vendorType && typeof raw.vendorType === "object" ? (raw.vendorType as Record<string, unknown>) : {};
    const adhocServiceRaw =
      raw.adhocService && typeof raw.adhocService === "object" ? (raw.adhocService as Record<string, unknown>) : {};
    const weekPlannerRaw = weekPlanner as unknown as Record<string, unknown>;
    const adhocServiceIdRaw =
      raw.adhocServiceId ??
      raw.adhoc_service_id ??
      adhocServiceRaw.adhocServiceId ??
      adhocServiceRaw.adhoc_service_id ??
      weekPlannerRaw.adhocServiceId ??
      weekPlannerRaw.adhoc_service_id;
    const adhocServiceId =
      adhocServiceIdRaw != null &&
        String(adhocServiceIdRaw).trim() !== "" &&
        Number.isFinite(Number(adhocServiceIdRaw)) &&
        Number(adhocServiceIdRaw) > 0
        ? Number(adhocServiceIdRaw)
        : null;

    return {
      weekPlannerId: weekPlanner.weekPlannerId,
      date: raw.date ? new Date(String(raw.date)).toISOString() : new Date(weekPlanner.date).toISOString(),
      route: {
        routeDefaultId: Number(routeRaw.routeDefaultId ?? raw.routeDefaultId ?? 0),
        route_default_name: String(routeRaw.route_default_name ?? raw.route_default_name ?? ""),
        routeId: Number(routeRaw.routeId ?? raw.routeId ?? 0) || null,
        routeName: String(routeRaw.routeName ?? raw.routeName ?? "") || null,
      },
      // Backend mantém o nome `userId`, mas o valor agora é o `userId` do vendor.
      userId: Number(raw.userId ?? raw.userId ?? 0),
      fullName: String(raw.fullName ?? raw.vendorName ?? raw.courierName ?? weekPlanner.name ?? ""),
      costModel: {
        costModelDefaultId: Number(costModelRaw.costModelDefaultId ?? raw.costModelDefaultId ?? 0),
        costModel_default_name: String(costModelRaw.costModel_default_name ?? raw.costModel_default_name ?? ""),
        costModelId: Number(costModelRaw.costModelId ?? raw.costModelId ?? 0) || null,
        costModelName: String(costModelRaw.costModelName ?? raw.costModelName ?? "") || null,
      },
      vehicle: {
        vehicleDefaultId: Number(vehicleRaw.vehicleDefaultId ?? raw.vehicleDefaultId ?? 0),
        vehicleDefaultModel: String(vehicleRaw.vehicleDefaultModel ?? raw.vehicleDefaultModel ?? ""),
        vehicle_default_registrationPlate: String(
          vehicleRaw.vehicle_default_registrationPlate ??
          raw.vehicle_default_registrationPlate ??
          raw.registrationPlate ??
          raw.registrationPlates ??
          ""
        ),
        vehicleId: Number(vehicleRaw.vehicleId ?? raw.vehicleId ?? 0) || null,
        vehicleModel: String(vehicleRaw.vehicleModel ?? raw.vehicleModel ?? "") || null,
        vehicleregistrationPlate: String(
          vehicleRaw.vehicleregistrationPlate ??
          raw.vehicleregistrationPlate ??
          raw.registrationPlate ??
          raw.registrationPlates ??
          ""
        ) || null,
      },
      vendorType: {
        vendorTypeDefaultId: Number(vendorTypeRaw.vendorTypeDefaultId ?? raw.vendorTypeDefaultId ?? 0),
        vendorType_default_description: String(
          vendorTypeRaw.vendorType_default_description ?? raw.vendorType_default_description ?? ""
        ) || null,
        vendorTypeId: Number(vendorTypeRaw.vendorTypeId ?? raw.vendorTypeId ?? 0) || null,
        vendorType_description: String(vendorTypeRaw.vendorType_description ?? raw.vendorType_description ?? "") || null,
      },
      isDayOff: Boolean(raw.isDayOff ?? raw.isDayOff ?? weekPlanner.isDayOff === "true"),
      rate: adhocServiceId != null ? 0 : Number(raw.rate ?? weekPlanner.rate ?? 0) || null,
      routeCost: Number(raw.routeCost ?? weekPlanner.routeCost ?? 0) || null,
      routeSort: Number(raw.routeSort ?? weekPlanner.routeSort ?? 0) || null,
      adhocSort: Number(raw.adhocSort ?? weekPlanner.adhocSort ?? 0) || null,
      adhocServiceId,
      extra: Number(raw.extra ?? raw.extras ?? weekPlanner.extras ?? 0) || null,
      notes: String(raw.notes ?? raw.note ?? weekPlanner.notes ?? "") || null,
      status: String(raw.status ?? weekPlanner.status ?? "") || null,
    };
  });

  if (operationsPayload.length > 0) {
    const operationsResponse = await guardedFetch(`${API_BASE_URL}/bff/operations/from-week-planners`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      cache: "no-store",
      body: JSON.stringify({ data: operationsPayload }),
    });

    if (!operationsResponse.ok) {
      const errorText = await operationsResponse.text();
      throw new Error(
        `Failed to create operations from week planners (${operationsResponse.status}): ${errorText || operationsResponse.statusText}`,
      );
    }
  }

  // Update status to "submitted"
  const results = await Promise.allSettled(
    weekPlanners.map((weekPlanner) =>
      guardedFetch(`${API_BASE_URL}/bff/week-planners/${weekPlanner.weekPlannerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getBearerAuthHeader(),
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
        cache: "no-store",
        body: JSON.stringify({ status: "submitted" }),
      }),
    ),
  );

  const failures = results.filter(
    (result) => result.status === "rejected" ||
      (result.status === "fulfilled" && !result.value.ok)
  );

  if (failures.length > 0) {
    const errorMessages = failures.map((failure, index) => {
      if (failure.status === "rejected") {
        return `Week Planner ${weekPlanners[index].weekPlannerId}: ${failure.reason}`;
      } else {
        return `Week Planner ${weekPlanners[index].weekPlannerId}: HTTP ${failure.value.status}`;
      }
    });
    throw new Error(`Failed to submit some week planners:\n${errorMessages.join("\n")}`);
  }
};

/**
 * Export week planners to CSV/Excel
 * Returns both the blob and the filename from the backend response headers
 */
export const exportWeekPlanners = async (
  date?: string,
  search?: string
): Promise<{ blob: Blob; filename: string }> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const params = new URLSearchParams();
  if (date) {
    params.append("date", date);
  }
  if (search) {
    params.append("search", search);
  }

  const url = `${API_BASE_URL}/bff/week-planners/export?${params.toString()}`;

  const response = await guardedFetch(url, {
    method: "GET",
    headers: {
      ...getBearerAuthHeader(),
      Accept: "text/csv,application/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    if (response.status === 404) {
      throw new Error("No week planners found for the given filters.");
    }
    throw new Error(`Failed to download week planners: ${errorText || response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();

  if (arrayBuffer.byteLength === 0) {
    throw new Error("No data available for download");
  }

  // Extract filename from Content-Disposition header
  const contentDisposition = response.headers.get("content-disposition") || "";
  let filename = `week-planners-${date || new Date().toISOString().split('T')[0]}.xlsx`;

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '');
    }
  }

  const contentType = response.headers.get("content-type") || "";
  const isExcel = contentType.includes("spreadsheet") || contentType.includes("excel");

  const mimeType = isExcel
    ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : "text/csv;charset=utf-8;";

  return {
    blob: new Blob([arrayBuffer], { type: mimeType }),
    filename: filename
  };
};

export type DailyOperationsManagementDTO = {
  dailyOperationsManagementId: number;
  userId?: number | null;
  modelEmployeesId?: number | null;
  /** Depósito direto na linha (ex.: day off pode não trazer `route` aninhado). */
  depositId?: number | null;
  routeId?: number | null;
  /** Resposta BFF pode incluir rota aninhada com depositId. */
  route?: { routeId?: number | null; depositId?: number | null; routeName?: string | null } | null;
  vehicle?: {
    vehicleId?: number | null;
    vehicleregistrationPlate?: string | null;
    vehicleRegistrationPlate?: string | null;
  } | null;
  vehicleId?: number | null;
  costModelId?: number | null;
  rate?: number | null;
  routeCost?: number | null;
  routeSort?: number | null;
  adhocSort?: number | null;
  extra?: number | null;
  adhocServiceId?: number | null;
  /** BFF pode devolver join aninhado em vez de só adhocServiceId no root. */
  adhocService?: {
    adhocServiceId?: number | null;
    adhocName?: string | null;
    adhocVendorPayment?: number | string | null;
  } | null;
  isSort?: boolean | null;
  isDayOff?: boolean | null;
  isLate?: boolean | null;
  isVanHome?: boolean | null;
  /** True when the row has been submitted (`isSubmitted` in DB). */
  isSubmitted?: boolean | null;
  /** @deprecated Prefer `isSubmitted`; kept for older BFF responses. */
  isSubmit?: boolean | null;
  vendorRequestId?: number | null;
  status?: string | null;
  reason?: string | null;
  notes?: string | null;
  daily_game_plan_operationId?: number | null;
  /** camelCase variant returned by the BFF (preferred; snake_case kept for backwards compat). */
  dailyGamePlanOperationId?: number | null;
  date: string;
  createdBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
  /** Full name returned directly by the BFF (fallback when vendor is not in the local vendors list). */
  fullname?: string | null;
  /** Vendor type id returned directly by the BFF (may be a string from the API). */
  vendorTypeId?: number | string | null;
  servicePartnerId?: number | null;
  companyId: number;
};

export type DailyOperationsManagementCreateDTO = {
  userId?: number | null;
  modelEmployeesId?: number | null;
  depositId?: number | null;
  routeId?: number | null;
  route?: { routeId?: number | null } | null;
  vehicleId?: number | null;
  vehicle?: { vehicleId?: number | null } | null;
  costModelId?: number | null;
  rate?: number | null;
  routeCost?: number | null;
  routeSort?: number | null;
  adhocSort?: number | null;
  extra?: number | null;
  adhocServiceId?: number | null;
  isSort?: boolean | null;
  isDayOff?: boolean | null;
  isLate?: boolean | null;
  isVanHome?: boolean | null;
  vendorRequestId?: number | null;
  status?: string | null;
  reason?: string | null;
  notes?: string | null;
  daily_game_plan_operationId?: number | null;
  servicePartnerId?: number | null;
  date: string;
  createdBy?: number | null;
};

export type DailyOperationsManagementUpdateDTO = {
  userId?: number | null;
  modelEmployeesId?: number | null;
  depositId?: number | null;
  routeId?: number | null;
  route?: { routeId?: number | null } | null;
  vehicleId?: number | null;
  vehicle?: { vehicleId?: number | null } | null;
  costModelId?: number | null;
  rate?: number | null;
  routeCost?: number | null;
  routeSort?: number | null;
  adhocSort?: number | null;
  extra?: number | null;
  adhocServiceId?: number | null;
  isSort?: boolean | null;
  isDayOff?: boolean | null;
  isLate?: boolean | null;
  isVanHome?: boolean | null;
  isSubmitted?: boolean | null;
  isSubmit?: boolean | null;
  vendorRequestId?: number | null;
  status?: string | null;
  reason?: string | null;
  notes?: string | null;
  daily_game_plan_operationId?: number | null;
  servicePartnerId?: number | null;
  date?: string;
  createdBy?: number | null;
};

/**
 * Fetch dailyOperationsManagement list by date (filters supported via query params).
 */
export const fetchDailyOperationsManagementByDate = async (
  date: string
): Promise<DailyOperationsManagementDTO[]> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const url = `${API_BASE_URL}/bff/daily-operations-management?${new URLSearchParams({ date }).toString()}`;

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
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    if (response.status === 404) return [];
    throw new Error(
      `Failed to fetch daily operations management (${response.status}): ${errorText || response.statusText}`
    );
  }

  const data = await response.json();
  if (Array.isArray(data)) return data as DailyOperationsManagementDTO[];
  return [];
};

/**
 * Fetch day-off entries from dailyOperationsManagement by date.
 */
export const fetchDailyOperationsManagementDayOffByDate = async (
  date: string
): Promise<DailyOperationsManagementDTO[]> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const url = `${API_BASE_URL}/bff/daily-operations-management?${new URLSearchParams({
    date,
    isDayOff: "true",
  }).toString()}`;

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
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    if (response.status === 404) return [];
    throw new Error(
      `Failed to fetch day-off daily operations (${response.status}): ${errorText || response.statusText}`
    );
  }

  const data = await response.json();
  if (Array.isArray(data)) return data as DailyOperationsManagementDTO[];
  return [];
};

/**
 * Fetch dailyOperationsManagement by date and status NotAllocated.
 */
export const fetchDailyOperationsManagementNotAllocatedByDate = async (
  date: string
): Promise<DailyOperationsManagementDTO[]> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const url = `${API_BASE_URL}/bff/daily-operations-management?${new URLSearchParams({
    date,
    status: BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED,
  }).toString()}`;

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
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    if (response.status === 404) return [];
    throw new Error(
      `Failed to fetch NotAllocated daily operations (${response.status}): ${errorText || response.statusText}`
    );
  }

  const data = await response.json();
  if (Array.isArray(data)) return data as DailyOperationsManagementDTO[];
  return [];
};

export const createDailyOperationsManagement = async (
  data: DailyOperationsManagementCreateDTO
): Promise<DailyOperationsManagementDTO> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/daily-operations-management`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    cache: "no-store",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Failed to create daily operations management (${response.status}): ${errorText || response.statusText}`
    );
  }

  const created = await response.json();
  return (created?.data ?? created) as DailyOperationsManagementDTO;
};

export const createDailyOperationsManagementDayOff = async (
  data: { userId: number; date: string }
): Promise<DailyOperationsManagementDTO> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/daily-operations-management/day-off`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    cache: "no-store",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Failed to create day off daily operations management (${response.status}): ${errorText || response.statusText
      }`
    );
  }

  const created = await response.json();
  return (created?.data ?? created) as DailyOperationsManagementDTO;
};

export const updateDailyOperationsManagement = async (
  dailyOperationsManagementId: number,
  data: DailyOperationsManagementUpdateDTO
): Promise<DailyOperationsManagementDTO> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/daily-operations-management/${dailyOperationsManagementId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    cache: "no-store",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Failed to update daily operations management (${response.status}): ${errorText || response.statusText}`
    );
  }

  const updated = await response.json();
  return (updated?.data ?? updated) as DailyOperationsManagementDTO;
};

/** Payload flat por item para POST /bff/operations/bulk (alinhado a `DailyOperationsManagementBulkPartDTO` no backend). */
export type OperationsBulkCreateItemDTO = {
  dailyOperationsManagementId?: number | null;
  date: string;
  userId: number; // obrigatório no backend; semântica atual: userId do vendor
  modelEmployeesId?: number | null;
  routeId: number;
  vehicleId: number;
  costModelId: number;
  rate?: number | null;
  routeCost?: number | null;
  daily_service_charge?: number | null;
  routeSort?: number | null;
  isSort?: boolean | null;
  adhocSort?: number | null;
  extra?: number | null;
  adhocServiceId?: number | null;
  status?: string | null;
  notes?: string | null;
  note?: string | null;
  depot?: string | null;
  createdBy?: number | null;
};

export type OperationsBulkCreateResponseDTO = {
  total: number;
  successful: number;
  failed: number;
  results: unknown[];
};

export const postOperationsBulk = async (
  data: OperationsBulkCreateItemDTO[]
): Promise<OperationsBulkCreateResponseDTO> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }
  if (!data?.length) {
    throw new Error("Bulk operations payload cannot be empty.");
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/operations/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    cache: "no-store",
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    let message = errorText || response.statusText;
    try {
      const j = JSON.parse(errorText) as { error?: string; errors?: string[] };
      if (j?.errors?.length) message = j.errors.join("; ");
      else if (j?.error) message = j.error;
    } catch {
      /* manter message */
    }
    throw new Error(`Failed to create bulk operations (${response.status}): ${message}`);
  }

  const body = await response.json();
  return body as OperationsBulkCreateResponseDTO;
};

export const deleteDailyOperationsManagement = async (
  dailyOperationsManagementId: number
): Promise<void> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/daily-operations-management/${dailyOperationsManagementId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    if (response.status === 404) return;
    throw new Error(
      `Failed to delete daily operations management (${response.status}): ${errorText || response.statusText}`
    );
  }
};




