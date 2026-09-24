import { hasAuthSession, getBearerAuthHeader } from "./auth"
import { getApiBaseUrl } from "./apiBaseUrl";

export interface AdhocServiceDTO {
  adhocServiceId: number;
  adhocName?: string;
  adhocReceivedPayment?: number;
  adhocVendorPayment?: number;
  isAdhocSort?: boolean;
  isAdhocService?: boolean;
  adhocCategoryId?: number;
  adhocCategoryName?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  depositId?: number;
  depositName?: string;
}

// Module-level cache: shared across all callers for the session.
// Deduplicates concurrent requests and avoids redundant fetches on page load.
let _adhocServicesCache: AdhocServiceDTO[] | null = null;
let _adhocServicesPending: Promise<AdhocServiceDTO[]> | null = null;

/** Invalidates the in-memory cache (call after creating/updating adhoc services). */
export const invalidateAdhocServicesCache = () => {
  _adhocServicesCache = null;
  _adhocServicesPending = null;
};

/**
 * Fetch all adhoc services from the API
 * GET /adhoc-services
 * @returns Promise with array of AdhocServiceDTO
 */
const _doFetchAdhocServices = async (): Promise<AdhocServiceDTO[]> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
      const response = await fetch(`${API_BASE_URL}/bff/adhoc-services`, {
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
        // Handle authentication errors specifically
        if (response.status === 401 || response.status === 403) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
          throw new Error(errorMessage);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch adhoc services (${response.status})`
        );
      }

      const raw: unknown = await response.json();

      const toItems = (arr: unknown): AdhocServiceDTO[] => {
        if (!Array.isArray(arr)) return [];
        return arr
          .map((item: Record<string, unknown>) => {
            const id = Number(item.adhocServiceId ?? item.adhoc_service_id);
            if (!Number.isFinite(id) || id <= 0) return null;

            const adhocCategoryId =
              (item.adhocCategoryId != null && Number.isFinite(Number(item.adhocCategoryId)))
                ? Number(item.adhocCategoryId)
                : (item.adhocCategoriesId != null && Number.isFinite(Number(item.adhocCategoriesId)))
                  ? Number(item.adhocCategoriesId)
                  : (item.adhoc_categories_id != null && Number.isFinite(Number(item.adhoc_categories_id)))
                    ? Number(item.adhoc_categories_id)
                    : (item.serviceTypeId != null && Number.isFinite(Number(item.serviceTypeId)))
                      ? Number(item.serviceTypeId)
                      : (item.service_types_id != null && Number.isFinite(Number(item.service_types_id)))
                        ? Number(item.service_types_id)
                        : undefined;

            return {
              adhocServiceId: id,
              adhocName: item.adhocName != null ? String(item.adhocName) : (item.adhoc_name != null ? String(item.adhoc_name) : undefined),
              adhocReceivedPayment: item.adhocReceivedPayment != null ? Number(item.adhocReceivedPayment) : (item.adhoc_received_payment != null ? Number(item.adhoc_received_payment) : undefined),
              adhocVendorPayment: item.adhocVendorPayment != null ? Number(item.adhocVendorPayment) : (item.adhoc_vendor_payment != null ? Number(item.adhoc_vendor_payment) : undefined),
              isAdhocSort: (item.isAdhocSort === true || item.isAdhocSort === "true") || (item.is_adhoc_sort === true || item.is_adhoc_sort === "true"),
              isAdhocService: item.isAdhocService != null
                ? (item.isAdhocService === true || item.isAdhocService === "true")
                : item.is_adhoc_service != null
                  ? (item.is_adhoc_service === true || item.is_adhoc_service === "true")
                  : undefined,
              adhocCategoryId,
              adhocCategoryName:
                item.adhocCategoryName != null
                  ? String(item.adhocCategoryName)
                  : (item.adhoc_category_name != null
                    ? String(item.adhoc_category_name)
                    : undefined),
              createdBy: item.createdBy != null ? Number(item.createdBy) : (item.created_by != null ? Number(item.created_by) : undefined),
              createdAt: item.createdAt != null ? String(item.createdAt) : (item.created_at != null ? String(item.created_at) : undefined),
              updatedAt: item.updatedAt != null ? String(item.updatedAt) : (item.updated_at != null ? String(item.updated_at) : undefined),
              depositId: item.depositId != null ? Number(item.depositId) : (item.deposit_id != null ? Number(item.deposit_id) : undefined),
              depositName: item.depositName != null ? String(item.depositName) : (item.deposit_name != null ? String(item.deposit_name) : undefined),
            } as AdhocServiceDTO;
          })
          .filter((x): x is AdhocServiceDTO => x !== null);
      };

      let items: AdhocServiceDTO[] = [];

      if (Array.isArray(raw)) {
        items = toItems(raw);
      } else if (raw && typeof raw === "object") {
        const obj = raw as Record<string, unknown>;
        if (Array.isArray(obj.data)) items = toItems(obj.data);
        else if (Array.isArray(obj.adhocServices)) items = toItems(obj.adhocServices);
        else if (Array.isArray(obj.adhoc_services)) items = toItems(obj.adhoc_services);
      }

      return items;
    } catch (error) {
      console.error("Error fetching adhoc services:", error);
      throw error;
    }
};

/**
 * Fetch all adhoc services from the API.
 * Results are cached for the session; concurrent calls share one request.
 * Call invalidateAdhocServicesCache() after mutating adhoc services.
 */
export const fetchAdhocServices = (): Promise<AdhocServiceDTO[]> => {
  if (_adhocServicesCache) return Promise.resolve(_adhocServicesCache);
  if (_adhocServicesPending) return _adhocServicesPending;
  _adhocServicesPending = _doFetchAdhocServices().then(
    (data) => { _adhocServicesCache = data; _adhocServicesPending = null; return data; },
    (err) => { _adhocServicesPending = null; throw err; }
  );
  return _adhocServicesPending;
};


