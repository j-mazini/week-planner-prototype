"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { BUSINESS_RULES } from '@/src/constants/businessRules';
import { useRouter } from "next/navigation";
import { removeToken, getBearerAuthHeader } from "@/lib/auth"
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import type { Vendor } from "@/lib/vendors";
import { fetchVendors } from "@/lib/vendors";
import { fetchDepositsWithRoutesFull, type Route, type DepositWithRoutesDTO } from "@/lib/api/routes";
import type { WeekPlannerRecord } from "../contexts/PlannerContext";
import type { DayOffEntry } from "../components/DayOffModal";
import { normalizeWeekPlanner } from "../utils/normalizeUtils";
import { normalizeVendorsToVendors } from "../utils/vendorUtils";
import { formatDate, getWeekStart, getWeekEnd } from "../utils/dateUtils";
import { filterAllowedDeposits } from "@/lib/allowedDeposits";
import { fetchDailyTeamSupport } from "../services/apiService";

const API_BASE_URL = getApiBaseUrl();

export const useWeekPlannerData = (selectedDate: string) => {
  const router = useRouter();
  const [allOperations, setAllOperations] = useState<WeekPlannerRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dayOffEntries, setDayOffEntries] = useState<DayOffEntry[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [depositsWithRoutes, setDepositsWithRoutes] = useState<DepositWithRoutesDTO[]>([]);
  const [vendorsRaw, setVendorsRaw] = useState<Record<string, unknown>[] | null>(null);

  const isFetchingOperations = useRef(false);
  const fetchOperationsPromiseRef = useRef<Promise<void> | null>(null);
  const inFlightOperationsDateRef = useRef<string>("");
  const operationsAbortControllerRef = useRef<AbortController | null>(null);
  const operationsFetchTokenRef = useRef(0);
  const lastFetchedDate = useRef<string>("");
  const lastDayOffEntriesStr = useRef<string>("");

  const handleAuthError = useCallback(
    (message?: string) => {
      removeToken();
      setError(message || "Your session has expired. Please log in again.");
      router.push("/?callbackUrl=/week-planner");
    },
    [router],
  );

  // Fetch vendors without client-side cache.
  const fetchVendorsRaw = useCallback(
    async (_forceRefresh = false): Promise<Record<string, unknown>[]> => {
      if (!API_BASE_URL) {
        throw new Error("API URL is not configured.");
      }

      // The middleware already protects this route, and the API will return 401 if unauthorized.
      // We'll remove the client-side session guard to prevent false-negative logouts.

      try {
        const response = await fetch(`${API_BASE_URL}/bff/vendor`, {
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
            handleAuthError("Invalid token. Please login again.");
            return [];
          }
          throw new Error(`Failed to fetch vendors (${response.status})`);
        }

        const rawData = await response.json();
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

        const filteredVendors = vendorsArray.filter((v) => {
          if (!v) return false;
          const vendor = v as Record<string, unknown>;
          const activeRaw = vendor.active;
          const isActive =
            activeRaw === true ||
            activeRaw === 1 ||
            activeRaw === "1" ||
            String(activeRaw).toLowerCase() === "true";
          const userId = Number(vendor.userId ?? 0);
          return isActive && userId > 0;
        });

        setVendorsRaw(filteredVendors);
        return filteredVendors;
      } catch (err) {
        console.error("Error fetching vendors:", err);
        if (
          err instanceof Error &&
          (err.message.includes("Invalid token") || err.message.includes("Authentication token not found"))
        ) {
          handleAuthError(err.message);
          return [];
        }
        throw err;
      }
    },
    [handleAuthError],
  );

  // Fetch vehicles without client-side cache.
  const fetchVehiclesRaw = useCallback(
    async (_forceRefresh = false): Promise<Record<string, unknown>[]> => {
      if (!API_BASE_URL) return [];

      try {
        const response = await fetch(`${API_BASE_URL}/bff/vehicles`, {
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
        if (!response.ok) return [];
        const rawData = await response.json();
        return Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.result || []);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        return [];
      }
    },
    []
  );

  // Fetch vendors from vendors
  const fetchVendorsData = useCallback(async () => {
    try {
      const vendorsRawData = await fetchVendorsRaw();
      setVendorsRaw(vendorsRawData);

      const vendorsData: Vendor[] = normalizeVendorsToVendors(vendorsRawData);

      // Enrich with vehicleId from vendors table (GET /bff/vendors) when vendor API doesn't return it
      try {
        const vendorsFromTable = await fetchVendors();
        for (const d of vendorsData) {
          const fromTable = vendorsFromTable.find((x) => x.userId === d.userId);
          if (fromTable?.vehicleId != null && Number.isFinite(Number(fromTable.vehicleId))) {
            d.vehicleId = Number(fromTable.vehicleId);
          }
        }
      } catch {
        // Non-fatal: keep vendors from vendors; save-week fallback may still use vendor vehicleId
      }

      setVendors(vendorsData);
    } catch (err) {
      console.error("Error fetching vendors from vendors:", err);
      if (
        err instanceof Error &&
        (err.message.includes("Invalid token") || err.message.includes("Authentication token not found"))
      ) {
        handleAuthError(err.message);
        return;
      }
      setVendors([]);
    }
  }, [handleAuthError, fetchVendorsRaw]);

  // Fetch routes data
  const fetchRoutesData = useCallback(async () => {
    try {
      const depositsData = filterAllowedDeposits(await fetchDepositsWithRoutesFull());

      setDepositsWithRoutes(depositsData);

      const allRoutes: Route[] = [];
      depositsData.forEach((deposit) => {
        deposit.routes.forEach((route) => {
          allRoutes.push({
            routeId: route.routeId,
            routeName: route.routeName,
            active: route.active,
            customerId: route.customerId,
            depositId: route.depositId,
            serviceTypeId: route.serviceTypeId,
          });
        });
      });
      setRoutes(allRoutes);
    } catch (err) {
      console.error("Error fetching routes by deposit:", err);
      if (
        err instanceof Error &&
        (err.message.includes("Invalid token") || err.message.includes("Authentication token not found"))
      ) {
        handleAuthError(err.message);
        return;
      }
      setDepositsWithRoutes([]);
      setRoutes([]);
    } finally {
    }
  }, [handleAuthError]);

  // Fetch operations
  const fetchOperations = useCallback(async (): Promise<void> => {
    if (
      isFetchingOperations.current &&
      fetchOperationsPromiseRef.current &&
      inFlightOperationsDateRef.current === selectedDate
    ) {
      return fetchOperationsPromiseRef.current;
    }

    if (
      isFetchingOperations.current &&
      inFlightOperationsDateRef.current &&
      inFlightOperationsDateRef.current !== selectedDate &&
      operationsAbortControllerRef.current
    ) {
      operationsAbortControllerRef.current.abort();
    }

    if (!API_BASE_URL) {
      console.warn("NEXT_PUBLIC_API_URL is not configured.");
      setError("API URL is not configured. Please check your environment variables.");
      return;
    }

    const fetchToken = ++operationsFetchTokenRef.current;
    const abortController = new AbortController();
    operationsAbortControllerRef.current = abortController;
    isFetchingOperations.current = true;
    inFlightOperationsDateRef.current = selectedDate;
    const promise = (async () => {
      try {
        setError(null);

        // The middleware already protects this route, and the API will return 401 below if unauthorized.

        const weekStartDate = getWeekStart(selectedDate);
        const weekEndDate = getWeekEnd(selectedDate);
        const initialDate = formatDate(weekStartDate, "yyyy-mm-dd");
        const endDate = formatDate(weekEndDate, "yyyy-mm-dd");

        const params = new URLSearchParams();
        if (initialDate) {
          params.append("initialDate", initialDate);
        }
        if (endDate) {
          params.append("endDate", endDate);
        }

        const url = `${API_BASE_URL}/bff/week-planners?${params.toString()}`;

        const response = await fetch(url, {
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
          signal: abortController.signal,
        });

        if (abortController.signal.aborted || fetchToken !== operationsFetchTokenRef.current) return;

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            let errorData: { message?: string } = {};
            try {
              const text = await response.text();
              errorData = text ? JSON.parse(text) : {};
            } catch {
              // Swallow JSON parse errors
            }
            const errorMessage =
              errorData.message || "Invalid token. Try logging in again or contact the administrator.";
            handleAuthError(errorMessage);
            return;
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
        if (abortController.signal.aborted || fetchToken !== operationsFetchTokenRef.current) return;

        let weekPlannersArray: Record<string, unknown>[] = [];
        if (Array.isArray(data)) {
          weekPlannersArray = data;
        } else if (data && typeof data === "object") {
          if (Array.isArray(data.data)) {
            weekPlannersArray = data.data;
          } else if (Array.isArray(data.weekPlanners)) {
            weekPlannersArray = data.weekPlanners;
          } else if (Array.isArray(data.results)) {
            weekPlannersArray = data.results;
          }
        }

        let normalized = weekPlannersArray.map(normalizeWeekPlanner);

        // Enrich name / vehicle / registrationPlate from vendor data.
        // New DTO does not include fullName, so name must always be resolved from vendors.
        try {
          const [fetchedVendorsRaw, vehiclesRaw] = await Promise.all([
            fetchVendorsRaw(),
            fetchVehiclesRaw()
          ]);
          if (abortController.signal.aborted || fetchToken !== operationsFetchTokenRef.current) return;
          
          const vendorsList = Array.isArray(fetchedVendorsRaw) ? fetchedVendorsRaw : [];
          const vehiclesList = Array.isArray(vehiclesRaw) ? vehiclesRaw : [];
          
          // Build vehicle lookup map
          const vehicleLookup = new Map<number, { plate: string; model: string }>();
          vehiclesList.forEach(v => {
            const vid = Number(v.vehicleId || 0);
            if (vid > 0) {
              const plate = String(v.registrationPlates || v.registrationPlate || v.registration_plate || '').trim();
              const model = String(v.model || v.vehicleModel || '').trim();
              if (plate || model) vehicleLookup.set(vid, { plate, model });
            }
          });

          normalized = normalized.map((op) => {
            const raw = op.raw as Record<string, unknown>;
            const userId = Number(raw?.userId ?? 0);
            const vehicleId = Number(raw?.vehicleId ?? 0);
            
            // 1. Initial lookup from vendors
            const vendor = vendorsList.find((v) => {
              const vRecord = v as Record<string, unknown>;
              const vVendorId = Number(vRecord.userId ?? vRecord.vendorId ?? 0);
              return vVendorId === userId;
            }) as Record<string, unknown> | undefined;

            const enrichedOp = { ...op };

            if (vendor) {
               const vendorName = `${String(vendor.name || '')} ${String(vendor.lastName || '')}`.trim() || String(vendor.fullName ?? '').trim();
               const plate = String(
                 vendor.vehicleDefaultRegistrationPlate ??
                 vendor.vehicle_default_registrationPlate ??
                 vendor.vehicleRegistration_plate ??
                 vendor.vehicleRegistrationPlate ??
                 vendor.registration_plate ??
                 vendor.registrationPlate ??
                 vendor.registrationPlates ??
                 ''
               ).trim();
               const model = String(vendor.vehicleDefaultModel ?? vendor.vehicleModel ?? vendor.model ?? '').trim();
               
               enrichedOp.name = enrichedOp.name || vendorName;
               enrichedOp.registrationPlate = enrichedOp.registrationPlate || plate;
               enrichedOp.vehicle = enrichedOp.vehicle || model;
            }

            // 2. Fallback lookup from vehicles API using vehicleId
            if (!enrichedOp.registrationPlate && vehicleId > 0) {
              const vehicleInfo = vehicleLookup.get(vehicleId);
              if (vehicleInfo) {
                enrichedOp.registrationPlate = vehicleInfo.plate;
                enrichedOp.vehicle = enrichedOp.vehicle || vehicleInfo.model;
              }
            }

            return enrichedOp;
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn("[useWeekPlannerData] Data enrichment failed:", msg);
        }

        // Defensive dedupe for OFF/day-off rows that may arrive duplicated from backend.
        // Keep at most one OFF record per (userId, date).
        const offByVendorDate = new Map<string, WeekPlannerRecord>();
        const nonOff: WeekPlannerRecord[] = [];

        const isOffLike = (op: WeekPlannerRecord): boolean => {
          const raw = (op.raw ?? {}) as Record<string, unknown>;
          const status = String(op.status ?? raw.status ?? "").trim().toLowerCase();
          const isDayOffFlag =
            op.isDayOff === "true" ||
            raw.isDayOff === true ||
            raw.isDayOff === "true";
          const routeName = String(op.route ?? "").trim().toUpperCase();

          return isDayOffFlag || status === "off" || routeName === "OFF";
        };

        const getVendorId = (op: WeekPlannerRecord): number => {
          const raw = (op.raw ?? {}) as Record<string, unknown>;
          const direct = Number(raw.userId ?? 0);
          if (direct > 0) return direct;
          const nested = raw.vendor && typeof raw.vendor === "object"
            ? Number((raw.vendor as Record<string, unknown>).userId ?? 0)
            : 0;
          return nested > 0 ? nested : 0;
        };

        const dedupePersistedById = (items: WeekPlannerRecord[]): WeekPlannerRecord[] => {
          const seen = new Set<number>();
          const deduped: WeekPlannerRecord[] = [];
          items.forEach((op) => {
            const id = Number(op.weekPlannerId ?? 0);
            if (id > 0) {
              if (seen.has(id)) return;
              seen.add(id);
            }
            deduped.push(op);
          });
          return deduped;
        };

        normalized = dedupePersistedById(normalized);

        for (const op of normalized) {
          if (!isOffLike(op)) {
            nonOff.push(op);
            continue;
          }

          const userId = getVendorId(op);
          const dateKey = String(op.date ?? "").split("T")[0];
          if (!userId || !dateKey) {
            nonOff.push(op);
            continue;
          }

          const key = `${userId}|${dateKey}`;
          const current = offByVendorDate.get(key);
          if (!current) {
            offByVendorDate.set(key, op);
            continue;
          }

          const currentId = Number(current.weekPlannerId ?? 0);
          const nextId = Number(op.weekPlannerId ?? 0);
          // Prefer persisted entry over draft/local one.
          if (nextId > currentId) {
            offByVendorDate.set(key, op);
          }
        }

        normalized = [...nonOff, ...Array.from(offByVendorDate.values())];

        // Fetch daily team support and convert to WeekPlannerRecord
        let dailyTeamSupportRecords: WeekPlannerRecord[] = [];
        try {
          const dailyTeamSupportData = await fetchDailyTeamSupport(initialDate, endDate);
          if (abortController.signal.aborted || fetchToken !== operationsFetchTokenRef.current) return;
          dailyTeamSupportRecords = dailyTeamSupportData.map((dts): WeekPlannerRecord => {
            // Convert DailyTeamSupportDTO to WeekPlannerRecord format
            const dateStr = dts.date.split("T")[0]; // Extract date part if includes time
            const description = dts.description || "Management and Support";

            return {
              weekPlannerId: -dts.dailyTeamSupportId, // Use negative ID to distinguish from regular week planners
              date: dateStr,
              route: `Management and Support: ${description}`,
              name: dts.fullName || "Unknown",
              routeSort: "",
              adhocSort: "",
              notes: description,
              reason: "",
              vehicle: "",
              registrationPlate: "",
              status: BUSINESS_RULES.WORKING_STATUS.WORKING,
              isDayOff: "false",
              isSort: "false",
              raw: {
                date: dateStr,
                userId: dts.userId || 0,
                fullName: dts.fullName, // Preserve fullName from API
                routeId: undefined,
                route_defaultId: undefined,
                vehicleId: undefined,
                costModelId: undefined,
                vendorTypeId: undefined,
                status: BUSINESS_RULES.WORKING_STATUS.WORKING,
                isDayOff: false,
                category: "management",
                dailyTeamSupportId: dts.dailyTeamSupportId,
                depositId: dts.depositId ?? undefined,
                managementTeamFunctionId: dts.managementTeamFunctionId ?? undefined,
                createdBy: dts.createdBy,
                createdAt: dts.createdAt,
                updatedAt: dts.updatedAt,
              },
            };
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          // Avoid console.error(Error) which Next.js may surface as an overlay in dev.
          console.warn("[useWeekPlannerData] daily team support unavailable:", msg);
          // Continue without daily team support if fetch fails
        }

        // Preserve unsaved assignments
        if (abortController.signal.aborted || fetchToken !== operationsFetchTokenRef.current) return;
        setAllOperations((prev) => {
          const unsavedAssignments = prev.filter((op) => !op.weekPlannerId || op.weekPlannerId <= 0);

          const getRouteId = (op: WeekPlannerRecord): number => {
            const raw = op.raw as Record<string, unknown>;
            if (raw.route && typeof raw.route === "object") {
              const routeObj = raw.route as Record<string, unknown>;
              if (routeObj.routeId) return Number(routeObj.routeId);
              if (routeObj.routeDefaultId) return Number(routeObj.routeDefaultId);
            }
            if (raw.routeId) return Number(raw.routeId);
            if (raw.routeDefaultId) return Number(raw.routeDefaultId);
            return 0;
          };

          // Build a key that includes adhocServiceId so that multiple adhoc services
          // for the same vendor+date+route are treated as distinct entries.
          // Without this, all DHOC-route entries collapse to the same key, causing
          // in-memory adhoc drafts to be dropped when the server already has any DHOC
          // entry for that vendor+date (even for a different adhoc service).
          const getOpKey = (op: WeekPlannerRecord): string => {
            const raw = op.raw as Record<string, unknown>;
            const userId = Number(raw.userId || 0);
            const routeId = getRouteId(op);
            // depositId may be top-level (in-memory drafts) or nested in raw.route
            // (WeekPlannerListDTO uses route.depositId, never a top-level depositId field)
            const routeDepositId = raw.route && typeof raw.route === 'object'
              ? (raw.route as Record<string, unknown>).depositId
              : null;
            const depositId = Number(raw.depositId ?? raw._depositId ?? routeDepositId ?? 0) || 0;
            const adhocServiceObj = raw.adhocService && typeof raw.adhocService === "object"
              ? (raw.adhocService as Record<string, unknown>)
              : null;
            const adhocServiceId =
              raw.adhocServiceId != null && Number.isFinite(Number(raw.adhocServiceId))
                ? Number(raw.adhocServiceId)
                : adhocServiceObj?.adhocServiceId != null && Number.isFinite(Number(adhocServiceObj.adhocServiceId))
                  ? Number(adhocServiceObj.adhocServiceId)
                  : 0;
            return `${op.date}|${userId}|${routeId}|${depositId}|${adhocServiceId}`;
          };

          const savedAssignmentsMap = new Map<string, WeekPlannerRecord>();
          normalized.forEach((op) => {
            savedAssignmentsMap.set(getOpKey(op), op);
          });

          // Preserve saved records (weekPlannerId > 0) that were locally modified by
          // handleAssignWeek but not yet written to the backend. Without this, the
          // fresh API response overwrites their in-memory changes on any setRefreshTrigger.
          const locallyModifiedSaved = new Map<string, WeekPlannerRecord>();
          prev
            .filter((op) => {
              if (!op.weekPlannerId || op.weekPlannerId <= 0) return false;
              return (op.raw as Record<string, unknown>)?.__locallyModified === true;
            })
            .forEach((op) => locallyModifiedSaved.set(getOpKey(op), op));

          const mergedNormalized = normalized.map((op) => locallyModifiedSaved.get(getOpKey(op)) ?? op);

          const preservedUnsaved = unsavedAssignments.filter((op) => {
            const raw = op.raw as Record<string, unknown>;
            // Drop items already persisted via bulk save — server data is the source of truth.
            if (raw.__saved_to_wp_bulk === true || raw.__saved_to_dgp === true) return false;
            // Preserve locally-modified entries that haven't been saved yet.
            if (raw.__locallyModified === true) return true;
            return !savedAssignmentsMap.has(getOpKey(op));
          });

          // Single source of truth for daily team support: only use records from fetchDailyTeamSupport.
          // Remove ALL Management and Support entries from normalized + preservedUnsaved so we never
          // show duplicates (e.g. if week-planners API also returns them or optimistic state had one).
          const isDailyTeamSupport = (op: WeekPlannerRecord): boolean => {
            const raw = op.raw as Record<string, unknown>;
            if (raw?.dailyTeamSupportId != null && typeof raw.dailyTeamSupportId === 'number') return true;
            if (op.weekPlannerId != null && op.weekPlannerId < 0) return true;
            if (raw?.category === 'management') return true;
            const route = String(op.route ?? '');
            if (route.includes('Management and Support')) return true;
            return false;
          };

          const filteredNormalizedAndUnsaved = [...mergedNormalized, ...preservedUnsaved].filter((op) => !isDailyTeamSupport(op));
          const newDailyTeamSupport = dailyTeamSupportRecords;

          // Preserve local (in-memory) Management & Support drafts across refreshes.
          // These drafts usually have weekPlannerId <= 0 and no persisted dailyTeamSupportId yet.
          // Without this, any refresh (e.g. after Day Off) would drop local unsaved items.
          const localManagementDrafts = preservedUnsaved.filter((op) => {
            if (!isDailyTeamSupport(op)) return false;
            const raw = (op.raw ?? {}) as Record<string, unknown>;
            const hasPersistedDailyTeamSupportId = Number(raw.dailyTeamSupportId ?? 0) > 0;
            const isDraftById = !op.weekPlannerId || op.weekPlannerId === 0;
            return isDraftById && !hasPersistedDailyTeamSupportId;
          });

          const getManagementMergeKey = (op: WeekPlannerRecord): string => {
            const raw = (op.raw ?? {}) as Record<string, unknown>;
            const persistedId = Number(raw.dailyTeamSupportId ?? 0);
            if (persistedId > 0) return `dts:${persistedId}`;

            const dateKey = String(op.date ?? "").split("T")[0];
            const userId = Number(raw.userId ?? raw.userId ?? 0);
            const title = String(op.notes ?? op.route ?? "").trim().toLowerCase();
            const depositId = Number(raw.depositId ?? 0);
            return `draft:${dateKey}|${userId}|${depositId}|${title}`;
          };

          // Merge fetched + drafts with dedupe, preferring fetched entries when equivalent.
          const mergedManagement = new Map<string, WeekPlannerRecord>();
          newDailyTeamSupport.forEach((item) => {
            mergedManagement.set(getManagementMergeKey(item), item);
          });
          localManagementDrafts.forEach((item) => {
            const key = getManagementMergeKey(item);
            if (!mergedManagement.has(key)) {
              mergedManagement.set(key, item);
            }
          });

          return [...filteredNormalizedAndUnsaved, ...Array.from(mergedManagement.values())];
        });

        // Extract day-off entries
        const dayOffEntriesFromResponse: DayOffEntry[] = [];
        const seenDayOffKeys = new Set<string>();

        normalized.forEach((wp) => {
          if (wp.isDayOff === "true") {
            const raw = wp.raw as Record<string, unknown>;
            const userId = Number(raw.userId ?? 0);
            const dateStr = wp.date;
            const key = `${userId}-${dateStr}`;

            if (userId && dateStr && !seenDayOffKeys.has(key)) {
              seenDayOffKeys.add(key);
              dayOffEntriesFromResponse.push({
                id: String(wp.weekPlannerId || key),
                userId,
                date: dateStr,
                notes: wp.notes || undefined,
              });
            }
          }
        });

        const newDayOffStr = JSON.stringify(dayOffEntriesFromResponse);
        if (lastDayOffEntriesStr.current !== newDayOffStr) {
          lastDayOffEntriesStr.current = newDayOffStr;
          setDayOffEntries(dayOffEntriesFromResponse);
        }
      } catch (err) {
        if (abortController.signal.aborted || fetchToken !== operationsFetchTokenRef.current) {
          return;
        }
        console.error("Error fetching week planners:", err);
        const message = err instanceof Error ? err.message : "Failed to load week planners";
        if (
          err instanceof Error &&
          (err.message.includes("Invalid token") || err.message.includes("Authentication token not found"))
        ) {
          handleAuthError(err.message);
          return;
        }
        setError(message);
      } finally {
        if (fetchToken === operationsFetchTokenRef.current) {
          isFetchingOperations.current = false;
          fetchOperationsPromiseRef.current = null;
          operationsAbortControllerRef.current = null;
          inFlightOperationsDateRef.current = "";
        }
      }
    })();
    fetchOperationsPromiseRef.current = promise;
    return promise;
  }, [selectedDate, handleAuthError, fetchVendorsRaw, fetchVehiclesRaw]);

  // Force refetch assignments (e.g. after Save Week) and return a promise that resolves when done
  const refreshAssignments = useCallback(async (): Promise<void> => {
    // Abort any in-flight GET — it may have started before a mutation (DELETE/PATCH/POST)
    // and would return stale data that overrides the local deletion/change.
    if (isFetchingOperations.current) {
      operationsAbortControllerRef.current?.abort();
      isFetchingOperations.current = false;
      fetchOperationsPromiseRef.current = null;
    }
    lastFetchedDate.current = "";
    return fetchOperations();
  }, [fetchOperations]);

  // Initial data fetch
  useEffect(() => {
    fetchVendorsData();
    fetchRoutesData();
  }, [fetchVendorsData, fetchRoutesData]);

  useEffect(() => {
    if (!selectedDate) return;
    // Use week-start date as the cache key: all days within the same week share the
    // same fetch URL (?initialDate=...&endDate=...), so navigating day 11 → day 12
    // (same week) must NOT trigger a redundant fetch that re-runs the preservedUnsaved
    // logic and can accidentally drop in-memory adhoc drafts.
    const weekStartKey = formatDate(getWeekStart(selectedDate), "yyyy-mm-dd");
    if (lastFetchedDate.current !== weekStartKey && !isFetchingOperations.current) {
      lastFetchedDate.current = weekStartKey;
      // Clear the previous week's view immediately while the new week's fetch runs.
      setAllOperations([]);
      setDayOffEntries([]);
      fetchOperations();
    }
  }, [selectedDate, fetchOperations]);

  useEffect(() => {
    if (selectedDate && refreshTrigger > 0) {
      // Abort any in-flight GET — it may have been started before the mutation that
      // triggered this refresh and would return stale data (e.g. a deleted item coming back).
      if (isFetchingOperations.current) {
        operationsAbortControllerRef.current?.abort();
        isFetchingOperations.current = false;
        fetchOperationsPromiseRef.current = null;
      }
      lastFetchedDate.current = "";
      fetchOperations();
    }
  }, [refreshTrigger, selectedDate, fetchOperations]);

  const plannerData = useMemo(
    () => ({
      assignments: allOperations,
      routes,
      vendors,
      depositsWithRoutes,
    }),
    [allOperations, routes, vendors, depositsWithRoutes],
  );

  return {
    allOperations,
    setAllOperations,
    error,
    setError,
    refreshTrigger,
    setRefreshTrigger,
    refreshAssignments,
    dayOffEntries,
    setDayOffEntries,
    vendors,
    routes,
    depositsWithRoutes,
    vendorsRaw,
    fetchVendorsRaw,
    fetchVehiclesRaw,
    plannerData,
  };
};




