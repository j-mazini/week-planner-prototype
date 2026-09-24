import { getUserTypeFromToken, getBearerAuthHeader, isAuthenticated } from '@/lib/auth';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';
import type { WeekPlannerRecord } from '../contexts/PlannerContext';
import { normalizeWeekPlanner } from '../utils/normalizeUtils';
import { getWeekStart, getWeekEnd, formatDate } from '../utils/dateUtils';
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
  WeekPlannerBooleanOptionDTO,
  WeekPlannerBulkDeleteDTO,
  WeekPlannerBulkFinishDTO,
  WeekPlannerRowDTO,
  ManagementTeamFunctionDTO,
  DailyTeamSupportCreateDTO,
  DailyTeamSupportBulkItemsRequestDTO,
  DailyTeamSupportDTO,
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
  WeekPlannerBulkDeleteDTO,
  WeekPlannerBulkFinishDTO,
  WeekPlannerRowDTO,
  ManagementTeamFunctionDTO,
  DailyTeamSupportCreateDTO,
  DailyTeamSupportBulkItemsRequestDTO,
  DailyTeamSupportDTO,
};

const API_BASE_URL = getApiBaseUrl();

export type WeekPlannerTypes = {
  vendors?: string[];
  routes?: string[];
  vehicles?: string[];
  statuses?: string[];
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
    if (!isAuthenticated()) {
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
      cache: "no-store", credentials: "include",
    });

    if (!response.ok) {
      // Handle authentication errors specifically
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      console.error("Failed to fetch week planner types:", response.status);
      return {};
    }

    const data = await response.json();

    const types: WeekPlannerTypes = {};
    if (data.vendors && Array.isArray(data.vendors)) {
      types.vendors = data.vendors;
    }
    if (data.routes && Array.isArray(data.routes)) {
      types.routes = data.routes;
    }
    if (data.vehicles && Array.isArray(data.vehicles)) {
      types.vehicles = data.vehicles;
    }
    // New DTO: statuses is WeekPlannerStatusOptionDTO[] — extract the value strings
    if (data.statuses && Array.isArray(data.statuses)) {
      types.statuses = data.statuses.map((s: unknown) => {
        if (typeof s === "string") return s;
        if (s && typeof s === "object") return String((s as Record<string, unknown>).value ?? "");
        return String(s ?? "");
      });
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
  search?: string
): Promise<{ data: WeekPlannerRecord[]; total: number; page: number; limit: number }> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!isAuthenticated()) {
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
  params.append("_t", String(Date.now()));
  params.append("includeLinkedOperations", "true");

  const url = `${API_BASE_URL}/bff/week-planners/paginated?${params.toString()}`;
  
  const response = await guardedFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
    cache: "no-store", credentials: "include",
  });

  if (!response.ok) {
    // Handle authentication errors specifically
    if (response.status === 401 || response.status === 403) {
      let errorData: { message?: string } = {};
      try {
        const text = await response.text();
        errorData = text ? JSON.parse(text) : {};
      } catch {
        // If response is not JSON, use default message
      }
      const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
      throw new Error(errorMessage);
    }
    
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
        "[week-planner] Unexpected /bff/week-planners/paginated response shape. Keys:",
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
 * Fetch all week planners for a specific date (non-paginated)
 */
export const fetchAllWeekPlannersForDate = async (
  date: string,
  depositId?: number | null
): Promise<WeekPlannerRecord[]> => {
  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    return [];
  }

  try {
    if (!isAuthenticated()) {
      console.warn("No token available for fetching all week planners");
      return [];
    }

    // Calculate week start and end dates
    const weekStartDate = getWeekStart(date);
    const weekEndDate = getWeekEnd(date);
    const initialDate = formatDate(weekStartDate, "yyyy-mm-dd");
    const endDate = formatDate(weekEndDate, "yyyy-mm-dd");

    const params = new URLSearchParams();
    if (initialDate) {
      params.append("initialDate", initialDate);
    }
    if (endDate) {
      params.append("endDate", endDate);
    }

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
      cache: "no-store", credentials: "include",
    });

    if (!response.ok) {
      // Handle authentication errors specifically
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
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
 * Fetch all week planners for a single specific date (initialDate = endDate = date)
 * Usado pelo Daily Game Plan, que trabalha dia a dia.
 */
export const fetchAllWeekPlannersForSingleDate = async (
  date: string,
  depositId?: number | null
): Promise<WeekPlannerRecord[]> => {
  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    return [];
  }

  try {
    if (!isAuthenticated()) {
      console.warn("No token available for fetching all week planners (single date)");
      return [];
    }

    const params = new URLSearchParams();
    if (date && String(date).trim()) {
      params.append("initialDate", String(date).trim());
      params.append("endDate", String(date).trim());
    }

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
      cache: "no-store", credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      console.error("Failed to fetch all week planners (single date):", response.status);
      return [];
    }

    const data = await response.json();

    let weekPlannersArray: Record<string, unknown>[] = [];
    if (Array.isArray(data)) {
      weekPlannersArray = data;
    } else if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      if (Array.isArray(obj.data)) {
        weekPlannersArray = obj.data;
      } else if (Array.isArray(obj.weekPlanners)) {
        weekPlannersArray = obj.weekPlanners;
      }
    }

    const normalized = weekPlannersArray.map(normalizeWeekPlanner);
    return normalized;
  } catch (err) {
    console.error("Error fetching all week planners (single date):", err);
    return [];
  }
};

export interface DailyGamePlanOperationFiltersDTO {
  startDate?: string;
  endDate?: string;
  date?: string;
  userId?: number;
  depositId?: number;
  routeId?: number;
  vehicleId?: number;
  status?: string;
  vendorRequestId?: number;
  weekPlannerId?: number;
}

/**
 * Fetch operations for a specific deposit from daily-game-plan-operations.
 * Optionally filter by date via query param: ?date=YYYY-MM-DD
 */
export const fetchWeekPlannersByDeposit = async (
  depositId: number,
  date?: string
): Promise<WeekPlannerRecord[]> => {
  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    return [];
  }

  try {
    if (!isAuthenticated()) {
      console.warn("No token available for fetching week planners by deposit");
      return [];
    }

    if (!Number.isFinite(Number(depositId)) || Number(depositId) <= 0) {
      return [];
    }

    const filters: DailyGamePlanOperationFiltersDTO = {
      depositId: Number(depositId),
      ...(date && date.trim() ? { date: date.trim() } : {}),
    };

    const params = new URLSearchParams();
    const addIfDefined = (key: string, value: unknown, apiKey?: string): void => {
      if (value === undefined || value === null || value === "") return;
      params.set(apiKey || key, String(value));
    };
    addIfDefined("startDate", filters.startDate, "startDate");
    addIfDefined("endDate", filters.endDate, "endDate");
    addIfDefined("date", filters.date);
    addIfDefined("userId", filters.userId, "userId");
    addIfDefined("userId", filters.userId, "userId");
    addIfDefined("depositId", filters.depositId, "depositId");
    addIfDefined("routeId", filters.routeId, "routeId");
    addIfDefined("vehicleId", filters.vehicleId, "vehicleId");
    addIfDefined("status", filters.status);
    addIfDefined("vendorRequestId", filters.vendorRequestId, "vendorRequestId");
    addIfDefined("weekPlannerId", filters.weekPlannerId, "weekPlannerId");
    const query = params.toString();
    const url = `${API_BASE_URL}/bff/daily-game-plan-operations${query ? `?${query}` : ""}`;

    const response = await guardedFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      cache: "no-store", credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      console.error("Failed to fetch daily game plan operations by deposit:", response.status);
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
    console.error("Error fetching daily game plan operations by deposit:", err);
    return [];
  }
};

/**
 * Fetch day-off items (supervisor):
 * GET /bff/week-planners/day-off-items?date=...&routeId=...&depositId=...&status=NotWorking&status=OFF
 * Returns week_planner array for vendors with status NotWorking or OFF.
 */
export const fetchWeekPlannersDayOffItems = async (
  date: string,
  routeId: number = 48,
  depositId: number = 4
): Promise<WeekPlannerRecord[]> => {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    return [];
  }

  try {
    if (!isAuthenticated()) {
      console.warn("No token available for fetching day-off items");
      return [];
    }

    const params = new URLSearchParams();
    if (date && String(date).trim()) params.set("date", String(date).trim());
    if (Number.isFinite(routeId)) params.set("routeId", String(routeId));
    if (Number.isFinite(depositId)) params.set("depositId", String(depositId));
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
      cache: "no-store", credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      console.error("Failed to fetch day-off items:", response.status);
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
    console.error("Error fetching day-off items:", err);
    return [];
  }
};

/**
 * Fetch day-off items (admin):
 * GET /bff/week-planners/day-off-items?date=...&routeId=48[&depositId=...]
 * Backend: date and routeId obrigatórios; depositId opcional — omitir traz offs de todos os depósitos.
 */
export const fetchWeekPlannersDayOffItemsAdmin = async (
  date: string,
  options?: { routeId?: number; depositId?: number; allDeposits?: boolean }
): Promise<WeekPlannerRecord[]> => {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    return [];
  }

  try {
    if (!isAuthenticated()) {
      console.warn("No token available for fetching day-off items (admin)");
      return [];
    }

    const routeId = options?.routeId ?? 48;
    const allDeposits = options?.allDeposits === true;
    const params = new URLSearchParams();
    if (date && String(date).trim()) params.set("date", String(date).trim());
    params.set("routeId", String(routeId));
    if (!allDeposits) {
      const depositId = options?.depositId ?? 4;
      params.set("depositId", String(depositId));
    }
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
      cache: "no-store", credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      console.error("Failed to fetch day-off items (admin):", response.status);
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
    console.error("Error fetching day-off items (admin):", err);
    return [];
  }
};

/**
 * Create a single week planner.
 */
export const createWeekPlanner = async (
  payload: WeekPlannerCreateDTO
): Promise<WeekPlannerRecord> => {
  const result = await createWeekPlannersBulk([payload]);
  if (!result.length) throw new Error("Failed to create week planner");
  return result[0];
};

/**
 * Create multiple week planners in one request — POST /bff/week-planners/bulk
 */
export const createWeekPlannersBulk = async (
  weekPlanners: WeekPlannerCreateDTO[]
): Promise<WeekPlannerRecord[]> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }
  if (!isAuthenticated()) {
    throw new Error("Authentication token not found. Please login again.");
  }
  if (!weekPlanners.length) {
    return [];
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/week-planners/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    cache: "no-store", credentials: "include",
    body: JSON.stringify({
      weekPlanners: weekPlanners.map(wp => ({
        date: wp.date,
        userId: wp.userId,
        depositId: wp.depositId,
        routeId: wp.routeId,
        vehicleId: wp.vehicleId,
        costModelId: wp.costModelId,
        adhocServiceId: wp.adhocServiceId,
        adhocSort: wp.adhocSort,
        isSort: wp.isSort,
        isDayOff: wp.isDayOff,
        vendorRequestId: wp.vendorRequestId,
        status: wp.status,
        reason: wp.reason,
        notes: wp.notes,
        createdBy: wp.createdBy,
      }))
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Week planners bulk create error response:", errorText);
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
  } else if (created != null) {
    weekPlannersArray = [created];
  }

  return weekPlannersArray.map((row) => normalizeWeekPlanner(row as Record<string, unknown>));
};

/**
 * Update a week planner (PATCH only — never POST).
 * Used e.g. for "convert to Off" in Daily Game Plan; must be PATCH /week-planners/:id.
 */
export const updateWeekPlanner = async (
  id: number,
  payload: WeekPlannerUpdateDTO
): Promise<WeekPlannerRecord> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!isAuthenticated()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await guardedFetch(
    `${API_BASE_URL}/bff/week-planners/${id}`,
    {
      method: "PATCH", // update existing record; do not use POST
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      cache: "no-store", credentials: "include",
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

  if (!isAuthenticated()) {
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
    cache: "no-store", credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Delete error response:", errorText);
    throw new Error(`Failed to delete week planner (${response.status}): ${errorText || response.statusText}`);
  }
};

/**
 * Delete week planners in bulk
 */
export const deleteWeekPlannersBulk = async (
  payload: WeekPlannerBulkDeleteDTO,
): Promise<void> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!isAuthenticated()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  if (!payload?.weekPlannerIds?.length) {
    throw new Error("No week planner ids provided for bulk delete.");
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/week-planners`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
    cache: "no-store", credentials: "include",
    body: JSON.stringify({ weekPlannerIds: payload.weekPlannerIds }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Bulk delete error response:", errorText);
    throw new Error(
      `Failed to delete week planners (${response.status}): ${errorText || response.statusText}`,
    );
  }
};

/**
 * Bulk finish week planners (mark as finished)
 */
export const bulkFinishWeekPlanners = async (
  payload: WeekPlannerBulkFinishDTO,
): Promise<void> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!isAuthenticated()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  if (!payload?.weekPlannerIds?.length) {
    throw new Error("No week planner ids provided for bulk finish.");
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/week-planners/bulk-finish`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
    cache: "no-store", credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Bulk finish error response:", errorText);
    throw new Error(
      `Failed to bulk finish week planners (${response.status}): ${errorText || response.statusText}`,
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

  if (!isAuthenticated()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  // Build operations payload (new DTO: no costModel, vendor_type, rate, routeSort, adhocSort, extra)
  const operationsPayload = weekPlanners.map((weekPlanner) => {
    const raw = (weekPlanner.raw ?? {}) as Record<string, unknown>;
    const routeRaw = raw.route && typeof raw.route === "object" ? (raw.route as Record<string, unknown>) : {};
    const vehicleRaw = raw.vehicle && typeof raw.vehicle === "object" ? (raw.vehicle as Record<string, unknown>) : {};
    const adhocServiceRaw = raw.adhocService && typeof raw.adhocService === "object"
      ? (raw.adhocService as Record<string, unknown>)
      : {};

    return {
      weekPlannerId: weekPlanner.weekPlannerId,
      date: raw.date ? new Date(String(raw.date)).toISOString() : new Date(weekPlanner.date).toISOString(),
      userId: Number(raw.userId ?? 0),
      route: {
        routeId: Number(routeRaw.routeId ?? raw.routeId ?? 0) || null,
        routeName: String(routeRaw.routeName ?? raw.routeName ?? "") || null,
        depositId: Number(routeRaw.depositId ?? raw._depositId ?? 0) || null,
        depositName: String(routeRaw.depositName ?? raw._depositName ?? "") || null,
        isFlex: Boolean(routeRaw.isFlex ?? raw._isFlex ?? false),
      },
      vehicle: {
        vehicleId: Number(vehicleRaw.vehicleId ?? raw.vehicleId ?? 0) || null,
        vehicleModel: String(vehicleRaw.vehicleModel ?? raw.vehicleModel ?? "") || null,
        vehicleRegistrationPlate: String(
          vehicleRaw.vehicleRegistrationPlate ??
          raw.vehicleRegistrationPlate ??
          ""
        ) || null,
      },
      adhocService: adhocServiceRaw.adhocServiceId
        ? {
            adhocServiceId: Number(adhocServiceRaw.adhocServiceId),
            adhocName: String(adhocServiceRaw.adhocName ?? "") || null,
            isAdhocSort: Boolean(adhocServiceRaw.isAdhocSort ?? false),
          }
        : null,
      isDayOff: Boolean(raw.isDayOff ?? raw.isDayOff ?? weekPlanner.isDayOff === "true"),
      isSort: Boolean(raw.isSort ?? weekPlanner.isSort === "true"),
      vendorRequestId: Number(raw.vendorRequestId ?? 0) || null,
      notes: String(raw.notes ?? raw.note ?? weekPlanner.notes ?? "") || null,
      reason: String(raw.reason ?? weekPlanner.reason ?? "") || null,
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
      cache: "no-store", credentials: "include",
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
        cache: "no-store", credentials: "include",
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
 * Create operations-management in bulk from week planners (no patch of week planners status).
 * Used by the Daily Game Plan "finish" flow: only approved week planners should be provided.
 */
export const createOperationsManagementBulkFromWeekPlanners = async (
  weekPlanners: WeekPlannerRecord[]
): Promise<unknown> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!isAuthenticated()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  if (!weekPlanners || weekPlanners.length === 0) {
    return { success: true, created: 0 };
  }

  // Build payload matching backend WeekPlannerToOperationDTO requirements.
  // Fix: Use correct type for operationsPayload mapping, fallback to 'any' for now to address lint error about 'WeekPlannerToOperationDTO'.
  const operationsPayload = weekPlanners.map((weekPlanner) => {
    const raw = (weekPlanner.raw ?? {}) as Record<string, unknown>;

    const routeRaw = raw.route && typeof raw.route === "object" ? (raw.route as Record<string, unknown>) : {};
    const costModelRaw =
      raw.costModel && typeof raw.costModel === "object" ? (raw.costModel as Record<string, unknown>) : {};
    const vehicleRaw =
      raw.vehicle && typeof raw.vehicle === "object" ? (raw.vehicle as Record<string, unknown>) : {};
    const adhocServiceRaw =
      raw.adhocService && typeof raw.adhocService === "object" ? (raw.adhocService as Record<string, unknown>) : {};

    const routeId = Number(routeRaw.routeId ?? raw.routeId ?? 0) || null;
    const costModelId = Number(costModelRaw.costModelId ?? raw.costModelId ?? 0) || null;
    const vehicleId = Number(vehicleRaw.vehicleId ?? raw.vehicleId ?? 0) || null;

    const depositName =
      raw._depositName ?? routeRaw.depositName ?? raw.depositName ?? raw.deposit ?? null;

    const adhocServiceId =
      Number(adhocServiceRaw.adhocServiceId ?? raw.adhocServiceId ?? 0) || null;

    return {
      weekPlannerId: weekPlanner.weekPlannerId,
      date: raw.date ? new Date(String(raw.date)).toISOString() : new Date(weekPlanner.date).toISOString(),
      userId: Number(raw.userId ?? 0),
      route: {
        routeId,
        routeName: String(routeRaw.routeName ?? raw.routeName ?? "") || null,
        depositId: Number(routeRaw.depositId ?? raw.depositId ?? 0) || null,
        depositName: String(routeRaw.depositName ?? depositName ?? "") || null,
      },
      costModel: {
        costModelId,
        costModelName: String(costModelRaw.costModelName ?? raw.costModelName ?? "") || null,
      },
      vehicle: {
        vehicleId,
        vehicleModel: String(vehicleRaw.vehicleModel ?? raw.vehicleModel ?? "") || null,
        vehicleregistrationPlate:
          String(vehicleRaw.vehicleregistrationPlate ?? raw.vehicleregistrationPlate ?? "") || null,
      },
      rate: adhocServiceId ? 0 : Number(raw.rate ?? weekPlanner.status ?? 0) || null,
      routeCost: Number(raw.routeCost ?? 0) || null,
      routeSort: Number(raw.routeSort ?? 0) || null,
      adhocSort: Number(raw.adhocSort ?? 0) || null,
      extra: Number(raw.extra ?? 0) || null,
      notes: raw.notes != null ? String(raw.notes) : null,
      status: raw.status != null ? String(raw.status) : null,
      isDayOff: Boolean(raw.isDayOff ?? raw.isDayOff ?? false),
      isSort: Boolean(raw.isSort ?? raw.isSort ?? false),
      adhocServiceId,
      // Top-level deposit fields used by the backend repository as fallback.
      depositName: depositName != null ? String(depositName) : null,
      deposit: depositName != null ? String(depositName) : null,
    } as unknown as WeekPlannerBooleanOptionDTO;
  });

  const response = await guardedFetch(`${API_BASE_URL}/bff/operations/from-week-planners`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    cache: "no-store", credentials: "include",
    body: JSON.stringify({ data: operationsPayload }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Failed to create operations in bulk (${response.status}): ${errorText || response.statusText}`
    );
  }

  return response.json().catch(() => ({ success: true }));
};

/**
 * Export week planners to CSV/Excel
 * Returns both the blob and the filename from the backend response headers.
 * showWeekends: quando true, inclui sábado e domingo no export; quando false/undefined, só seg–sex.
 */
export const exportWeekPlanners = async (
  date?: string,
  search?: string,
  showWeekends?: boolean
): Promise<{ blob: Blob; filename: string }> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!isAuthenticated()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const params = new URLSearchParams();
  if (date) {
    params.append("date", date);
  }
  if (search) {
    params.append("search", search);
  }
  if (showWeekends === true) {
    params.append("showWeekends", "true");
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
    cache: "no-store", credentials: "include",
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

/**
 * Fetch employees with role Supervisor or Admin
 */
export const fetchSupervisorAndAdminEmployees = async (): Promise<Array<{
  userId: number;
  fullName: string;
  email?: string;
  userTypeId?: number;
  user_type_name?: string;
}>> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!isAuthenticated()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    // First, fetch user types to identify Supervisor and Admin IDs
    const userTypesResponse = await guardedFetch(`${API_BASE_URL}/bff/user-types`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      cache: "no-store", credentials: "include",
    });

    let supervisorTypeId: number | null = null;
    let adminTypeId: number | null = null;

    if (userTypesResponse.ok) {
      const userTypesData = await userTypesResponse.json();
      let userTypesArray: Array<Record<string, unknown>> = [];
      
      if (Array.isArray(userTypesData)) {
        userTypesArray = userTypesData;
      } else if (userTypesData && typeof userTypesData === 'object' && 'userTypes' in userTypesData && Array.isArray(userTypesData.userTypes)) {
        userTypesArray = userTypesData.userTypes;
      } else if (userTypesData && typeof userTypesData === 'object' && 'data' in userTypesData && Array.isArray(userTypesData.data)) {
        userTypesArray = userTypesData.data;
      }

      // Find Supervisor and Admin type IDs
      for (const ut of userTypesArray) {
        const nameType = String(ut.nameType || ut.nameType || ut.name || '').toUpperCase();
        if (nameType.includes('SUPERVISOR') || nameType === 'SUPERVISOR') {
          supervisorTypeId = Number(ut.userTypeId || ut.userTypeId || 0);
        }
        if (nameType.includes('ADMIN') || nameType === 'ADMIN' || nameType === 'ADMINISTRATOR') {
          adminTypeId = Number(ut.userTypeId || ut.userTypeId || 0);
        }
      }
    }

    // Fetch all vendors/employees
    const response = await guardedFetch(`${API_BASE_URL}/bff/vendor`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      cache: "no-store", credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      throw new Error(`Failed to fetch employees (${response.status})`);
    }

    const rawData = await response.json();
    
    // Handle different response formats
    let vendorsArray: Record<string, unknown>[] = [];
    
    if (Array.isArray(rawData)) {
      vendorsArray = rawData;
    } else if (rawData && typeof rawData === "object") {
      if (Array.isArray(rawData.data)) {
        vendorsArray = rawData.data;
      } else if (Array.isArray(rawData.result)) {
        vendorsArray = rawData.result;
      } else if (Array.isArray(rawData.vendors)) {
        vendorsArray = rawData.vendors;
      } else if (Array.isArray(rawData.users)) {
        vendorsArray = rawData.users;
      } else if (Array.isArray(rawData.items)) {
        vendorsArray = rawData.items;
      }
    }

    // Filter employees with Supervisor or Admin role
    const filteredEmployees = vendorsArray
      .filter((vendor) => {
        if (!vendor || vendor === null || vendor === undefined) return false;
        if (vendor.active !== true) return false;
        if (!vendor.userId || Number(vendor.userId) <= 0) return false;

        const userTypeId = Number(vendor.userTypeId || vendor.userTypeId || 0);
        const nameType = String(vendor.nameType || vendor.nameType || '').toUpperCase();
        
        // Check if userTypeId matches Supervisor or Admin
        if (supervisorTypeId && userTypeId === supervisorTypeId) return true;
        if (adminTypeId && userTypeId === adminTypeId) return true;
        
        // Also check by nameType as fallback
        if (nameType.includes('SUPERVISOR') || nameType === 'SUPERVISOR') return true;
        if (nameType.includes('ADMIN') || nameType === 'ADMIN' || nameType === 'ADMINISTRATOR') return true;
        
        return false;
      })
      .map((vendor) => {
        const fullName = `${String(vendor.name || "")} ${String(vendor.lastName || "")}`.trim();

        return {
          userId: Number(vendor.userId) || 0,
          fullName: fullName || "Unknown Employee",
          email: vendor.email ? String(vendor.email) : undefined,
          userTypeId: Number(vendor.userTypeId || vendor.userTypeId || 0) || undefined,
          user_type_name: vendor.nameType || vendor.nameType ? String(vendor.nameType || vendor.nameType) : undefined,
        };
      })
      .filter((employee) => employee.userId > 0);

    return filteredEmployees;
  } catch (err) {
    console.error("Error fetching supervisor and admin employees:", err);
    throw err;
  }
};

/**
 * Fetch employees filtered by userTypeId (e.g. 1=Admin, 3=Supervisor for Management Support)
 */
export const fetchEmployeesByUserTypeIds = async (
  userTypeIds: number[]
): Promise<Array<{
  userId: number;
  fullName: string;
  email?: string;
  userTypeId?: number;
  user_type_name?: string;
}>> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!isAuthenticated()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const allowedSet = new Set(userTypeIds.filter((id) => Number.isFinite(id) && id > 0));
  if (allowedSet.size === 0) return [];

  // Reuse the same vendor list used elsewhere to avoid duplicate transform logic
  const response = await guardedFetch(`${API_BASE_URL}/bff/vendor`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
    cache: "no-store", credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message || "Invalid token. Try logging in again or contact the administrator.";
      throw new Error(errorMessage);
    }
    throw new Error(`Failed to fetch employees (${response.status})`);
  }

  const rawData = await response.json();
  let vendorsArray: Record<string, unknown>[] = [];

  if (Array.isArray(rawData)) {
    vendorsArray = rawData;
  } else if (rawData && typeof rawData === "object") {
    if (Array.isArray(rawData.data)) vendorsArray = rawData.data;
    else if (Array.isArray(rawData.result)) vendorsArray = rawData.result;
    else if (Array.isArray(rawData.vendors)) vendorsArray = rawData.vendors;
    else if (Array.isArray(rawData.users)) vendorsArray = rawData.users;
    else if (Array.isArray(rawData.items)) vendorsArray = rawData.items;
  }

  const filtered = vendorsArray
    .filter((vendor) => {
      if (!vendor || vendor.active !== true) return false;
      if (!vendor.userId || Number(vendor.userId) <= 0) return false;
      const userTypeId = Number(vendor.userTypeId ?? vendor.userTypeId ?? 0);
      return allowedSet.has(userTypeId);
    })
    .map((vendor) => {
      const fullName =
        `${String(vendor.name ?? "")} ${String(vendor.lastName ?? "")}`.trim() ||
        String(vendor.fullName ?? "Unknown");
      return {
        userId: Number(vendor.userId) || 0,
        fullName: fullName,
        email: vendor.email ? String(vendor.email) : undefined,
        userTypeId: Number(vendor.userTypeId ?? vendor.userTypeId ?? 0) || undefined,
        user_type_name:
          vendor.nameType || vendor.nameType
            ? String(vendor.nameType ?? vendor.nameType)
            : undefined,
      };
    })
    .filter((e) => e.userId > 0);

  return filtered;
};

/**
 * Fetch employees with role Manager or Admin
 */
export const fetchManagerAndAdminEmployees = async (): Promise<Array<{
  userId: number;
  fullName: string;
  email?: string;
  userTypeId?: number;
  user_type_name?: string;
}>> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!isAuthenticated()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    // First, fetch user types to identify Manager and Admin IDs
    const userTypesResponse = await guardedFetch(`${API_BASE_URL}/bff/user-types`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      cache: "no-store", credentials: "include",
    });

    let managerTypeId: number | null = null;
    let adminTypeId: number | null = null;

    if (userTypesResponse.ok) {
      const userTypesData = await userTypesResponse.json();
      let userTypesArray: Array<Record<string, unknown>> = [];
      
      if (Array.isArray(userTypesData)) {
        userTypesArray = userTypesData;
      } else if (userTypesData && typeof userTypesData === 'object' && 'userTypes' in userTypesData && Array.isArray(userTypesData.userTypes)) {
        userTypesArray = userTypesData.userTypes;
      } else if (userTypesData && typeof userTypesData === 'object' && 'data' in userTypesData && Array.isArray(userTypesData.data)) {
        userTypesArray = userTypesData.data;
      }

      // Find Manager and Admin type IDs
      for (const ut of userTypesArray) {
        const nameType = String(ut.nameType || ut.nameType || ut.name || '').toUpperCase();
        if (nameType.includes('MANAGER') || nameType === 'MANAGER') {
          managerTypeId = Number(ut.userTypeId || ut.userTypeId || 0);
        }
        if (nameType.includes('ADMIN') || nameType === 'ADMIN' || nameType === 'ADMINISTRATOR') {
          adminTypeId = Number(ut.userTypeId || ut.userTypeId || 0);
        }
      }
    }

    // Fetch all vendors/employees
    const response = await guardedFetch(`${API_BASE_URL}/bff/vendor`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      cache: "no-store", credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      throw new Error(`Failed to fetch employees (${response.status})`);
    }

    const rawData = await response.json();
    
    // Handle different response formats
    let vendorsArray: Record<string, unknown>[] = [];
    
    if (Array.isArray(rawData)) {
      vendorsArray = rawData;
    } else if (rawData && typeof rawData === "object") {
      if (Array.isArray(rawData.data)) {
        vendorsArray = rawData.data;
      } else if (Array.isArray(rawData.result)) {
        vendorsArray = rawData.result;
      } else if (Array.isArray(rawData.vendors)) {
        vendorsArray = rawData.vendors;
      } else if (Array.isArray(rawData.users)) {
        vendorsArray = rawData.users;
      } else if (Array.isArray(rawData.items)) {
        vendorsArray = rawData.items;
      }
    }

    // Filter employees with Manager or Admin role
    const filteredEmployees = vendorsArray
      .filter((vendor) => {
        if (!vendor || vendor === null || vendor === undefined) return false;
        if (vendor.active !== true) return false;
        if (!vendor.userId || Number(vendor.userId) <= 0) return false;

        const userTypeId = Number(vendor.userTypeId || vendor.userTypeId || 0);
        const nameType = String(vendor.nameType || vendor.nameType || '').toUpperCase();
        
        // Check if userTypeId matches Manager or Admin
        if (managerTypeId && userTypeId === managerTypeId) return true;
        if (adminTypeId && userTypeId === adminTypeId) return true;
        
        // Also check by nameType as fallback
        if (nameType.includes('MANAGER') || nameType === 'MANAGER') return true;
        if (nameType.includes('ADMIN') || nameType === 'ADMIN' || nameType === 'ADMINISTRATOR') return true;
        
        return false;
      })
      .map((vendor) => {
        const fullName = `${String(vendor.name || "")} ${String(vendor.lastName || "")}`.trim();

        return {
          userId: Number(vendor.userId) || 0,
          fullName: fullName || "Unknown Employee",
          email: vendor.email ? String(vendor.email) : undefined,
          userTypeId: Number(vendor.userTypeId || vendor.userTypeId || 0) || undefined,
          user_type_name: vendor.nameType || vendor.nameType ? String(vendor.nameType || vendor.nameType) : undefined,
        };
      })
      .filter((employee) => employee.userId > 0);

    return filteredEmployees;
  } catch (err) {
    console.error("Error fetching manager and admin employees:", err);
    throw err;
  }
};

/**
 * GET /bff/management-team-functions
 */
export const fetchManagementTeamFunctions = async (): Promise<ManagementTeamFunctionDTO[]> => {
  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    return [];
  }

  try {
    if (!isAuthenticated()) {
      console.warn("No token available for fetching management team functions");
      return [];
    }

    const response = await guardedFetch(`${API_BASE_URL}/bff/management-team-functions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      cache: "no-store", credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      console.warn("[week-planner] Failed to fetch management team functions:", response.status);
      return [];
    }

    const data = await response.json();
    let items: ManagementTeamFunctionDTO[] = [];
    if (Array.isArray(data)) {
      items = data;
    } else if (data && typeof data === "object") {
      if (Array.isArray(data.data)) items = data.data;
      else if (Array.isArray(data.results)) items = data.results;
    }
    return items;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[week-planner] Error fetching management team functions:", msg);
    if (
      err instanceof Error &&
      (err.message.includes("Invalid token") || err.message.includes("Authentication token not found"))
    ) {
      throw err;
    }
    return [];
  }
};

export const createDailyTeamSupportBulk = async (
  items: DailyTeamSupportCreateDTO[]
): Promise<void> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!isAuthenticated()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  if (items.length === 0) {
    return;
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/daily-team-support/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
    cache: "no-store", credentials: "include",
    // Backend expects a raw array of DailyTeamSupportCreateDTO (not wrapped in { items })
    body: JSON.stringify(items),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
      throw new Error(errorMessage);
    }
    
    let errorText = "";
    try {
      errorText = await response.text();
      console.error("Error creating daily team support bulk:", errorText);
    } catch {
      console.error("Could not read error response body");
    }
    
    throw new Error(`Failed to create daily team support bulk (${response.status}): ${errorText || response.statusText}`);
  }
};

/**
 * Fetch daily team support entries
 */
export const fetchDailyTeamSupport = async (
  startDate?: string,
  endDate?: string
): Promise<DailyTeamSupportDTO[]> => {
  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    return [];
  }

  try {
    if (!isAuthenticated()) {
      console.warn("No token available for fetching daily team support");
      return [];
    }

    const params = new URLSearchParams();
    if (startDate) {
      params.append("startDate", startDate);
    }
    if (endDate) {
      params.append("endDate", endDate);
    }

    const url = `${API_BASE_URL}/bff/daily-team-support${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await guardedFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      cache: "no-store", credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      // In dev, Next.js surfaces console.error as an overlay. This endpoint being down (500) shouldn't break Week Planner.
      console.warn("[week-planner] Failed to fetch daily team support:", response.status);
      return [];
    }

    const data = await response.json();

    let dailyTeamSupportArray: DailyTeamSupportDTO[] = [];
    if (Array.isArray(data)) {
      dailyTeamSupportArray = data;
    } else if (data && typeof data === "object") {
      if (Array.isArray(data.data)) {
        dailyTeamSupportArray = data.data;
      } else if (Array.isArray(data.results)) {
        dailyTeamSupportArray = data.results;
      } else if (Array.isArray(data.dailyTeamSupport)) {
        dailyTeamSupportArray = data.dailyTeamSupport;
      }
    }

    return dailyTeamSupportArray;
  } catch (err) {
    // Avoid console.error(Error) which Next.js may surface as an overlay in dev.
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[week-planner] Error fetching daily team support:", msg);
    if (
      err instanceof Error &&
      (err.message.includes("Invalid token") || err.message.includes("Authentication token not found"))
    ) {
      throw err;
    }
    return [];
  }
};

/**
 * Update daily team support entry
 */
export const updateDailyTeamSupport = async (
  dailyTeamSupportId: number,
  data: {
    date?: string;
    description?: string;
    userId?: number;
    depositId?: number | null;
  }
): Promise<DailyTeamSupportDTO> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!isAuthenticated()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/daily-team-support/${dailyTeamSupportId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
    cache: "no-store", credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
      throw new Error(errorMessage);
    }
    
    let errorText = "";
    try {
      errorText = await response.text();
      console.error("Error updating daily team support:", errorText);
    } catch {
      console.error("Could not read error response body");
    }
    
    throw new Error(`Failed to update daily team support (${response.status}): ${errorText || response.statusText}`);
  }

  const updated = await response.json();
  return updated;
};

/**
 * Change user of a daily team support entry
 * PATCH /bff/daily-team-support/:dailyTeamSupportId/change-user
 */
export const changeDailyTeamSupportUser = async (
  dailyTeamSupportId: number,
  data: { userId: number; depositId?: number | null; description?: string }
): Promise<DailyTeamSupportDTO> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!isAuthenticated()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await guardedFetch(
    `${API_BASE_URL}/bff/daily-team-support/${dailyTeamSupportId}/change-user`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      cache: "no-store", credentials: "include",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message || "Invalid token. Try logging in again or contact the administrator.";
      throw new Error(errorMessage);
    }

    let errorText = "";
    try {
      errorText = await response.text();
      console.error("Error changing daily team support user:", errorText);
    } catch {
      console.error("Could not read error response body");
    }

    throw new Error(
      `Failed to change daily team support user (${response.status}): ${errorText || response.statusText}`
    );
  }

  const updated = await response.json();
  return updated;
};

/**
 * Delete daily team support entry
 */
export const deleteDailyTeamSupport = async (dailyTeamSupportId: number): Promise<void> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!isAuthenticated()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/daily-team-support/${dailyTeamSupportId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
    cache: "no-store", credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
      throw new Error(errorMessage);
    }

    let errorText = "";
    try {
      errorText = await response.text();
      console.error("Error deleting daily team support:", errorText);
    } catch {
      console.error("Could not read error response body");
    }

    throw new Error(`Failed to delete daily team support (${response.status}): ${errorText || response.statusText}`);
  }
};

/**
 * Export week planner data as PDF via backend API
 * New implementation: backend handles PDF generation with deduplication
 */
export const exportWeekPlannerPDF = async (
  type: 'day' | 'week',
  date: string,
  userId?: number,
  depositId?: number,
  includeWeekends: boolean = true,
  depositIds?: number[]
): Promise<Blob> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!isAuthenticated()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const payload = {
    date,
    includeWeekends: type === 'week' ? includeWeekends : false,
    ...(userId && { userId }),
    ...(depositId && { depositId }),
    ...(depositIds && depositIds.length > 0 && { depositIds }),
    format: 'pdf',
  };

  const response = await guardedFetch(
    `${API_BASE_URL}/api/v1/week-planner/export/${type}`,
    {
      method: "POST",
      headers: {
        ...getBearerAuthHeader(),
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      credentials: "include",
    }
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
      throw new Error(errorMessage);
    }

    let errorText = "";
    try {
      errorText = await response.text();
      console.error("Error exporting PDF:", errorText);
    } catch {
      console.error("Could not read error response body");
    }

    throw new Error(`Failed to export PDF (${response.status}): ${errorText || response.statusText}`);
  }

  return response.blob();
};

/**
 * Get export statistics from backend (deduplication and validation info)
 */
export const getWeekPlannerExportStats = async (
  type: 'day' | 'week',
  date: string,
  userId?: number,
  includeWeekends: boolean = true
): Promise<unknown> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!isAuthenticated()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const payload = {
    date,
    includeWeekends: type === 'week' ? includeWeekends : false,
    ...(userId && { userId }),
  };

  const response = await guardedFetch(
    `${API_BASE_URL}/api/v1/week-planner/export-stats/${type}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      credentials: "include",
    }
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
      throw new Error(errorMessage);
    }

    throw new Error(`Failed to fetch export statistics (${response.status})`);
  }

  return response.json();
};

/**
 * Get list of available deposits from backend
 */
export const getWeekPlannerExportDeposits = async (): Promise<unknown[]> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  if (!isAuthenticated()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await guardedFetch(
    `${API_BASE_URL}/api/v1/week-planner/deposits`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      cache: "no-store",
      credentials: "include",
    }
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
      throw new Error(errorMessage);
    }

    throw new Error(`Failed to fetch deposits (${response.status})`);
  }

  const data = await response.json();

  // Handle different response formats
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) {
      return obj.data;
    }
    if (Array.isArray(obj.deposits)) {
      return obj.deposits;
    }
  }

  return [];
};


