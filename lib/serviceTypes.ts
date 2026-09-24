import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { hasAuthSession, getBearerAuthHeader } from "./auth"
import { fetchDeposits as fetchDepositsFromVendors } from "./vendors-api";
import { guardedFetch } from "@/lib/in-flight-guard";

export interface ServiceType {
  serviceTypeId: number;
  serviceName: string;
  depositId?: number;
}

/**
 * Fetches all service types
 * @returns Promise with array of service types
 */
export const fetchServiceTypes = async (): Promise<ServiceType[]> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/service-types`, {
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
        errorData.message || `Failed to fetch service types (${response.status})`
      );
    }

    const data = await response.json();
    
    // If response is a direct array, return it
    if (Array.isArray(data)) {
      return data;
    }

    // Otherwise, return empty array
    return [];
  } catch (error) {
    console.error("Error fetching service types:", error);
    throw error;
  }
};

/**
 * Fetches all service types as ServiceTypeDTO
 * @returns Promise with array of ServiceTypeDTO
 */
export function invalidateServiceTypesCache() {
  // Kept for existing callers; service types are no longer cached client-side.
}

export const fetchServiceTypesDTO = async (): Promise<ServiceTypeDTO[]> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/service-types`, {
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

      // Handle 500 errors with detailed error message
      if (response.status === 500) {
        const errorText = await response.text().catch(() => 'Internal server error');
        let errorMessage = errorText;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorText;
        } catch {
          // Keep original errorText if not JSON
        }
        
        if (errorMessage.includes('does not exist') || errorMessage.includes('column')) {
          errorMessage = `Backend database error: The backend is trying to access a column that doesn't exist in the database. Please contact the backend team to fix the SQL query. Original error: ${errorMessage}`;
        }
        
        console.error('Server error (500) fetching service types:', errorMessage);
        throw new Error(errorMessage);
      }

      if (response.status === 404) {
        console.warn("Service types endpoint not found (404). Returning empty array.");
        return [];
      }

      // Handle other errors (400, 401, 403, etc.)
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Failed to fetch service types (${response.status} ${response.statusText})`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    let serviceTypesArray: Array<Record<string, unknown>> = [];
    if (Array.isArray(data)) {
      serviceTypesArray = data;
    } else if (data && typeof data === 'object') {
      const dataObj = data as Record<string, unknown>;
      serviceTypesArray = (dataObj.serviceTypes || dataObj.loops || dataObj.data || dataObj.result || []) as Array<Record<string, unknown>>;
    }

    // Map to ServiceTypeDTO format with all fields from database
    return serviceTypesArray.map((item): ServiceTypeDTO => {
      if (!item || typeof item !== 'object') {
        return { serviceTypeId: 0, name: '', active: true };
      }

      const mapped: ServiceTypeDTO = {
        serviceTypeId: (item.serviceTypeId || item.service_type_id || 0) as number,
        name: (item.name || item.serviceName || '') as string,
        active: item.active !== undefined ? Boolean(item.active) : true
      };

      // Optional fields
      if (item.description !== undefined && item.description !== null) {
        mapped.description = item.description as string;
      }

      if (item.depositId !== undefined && item.depositId !== null) {
        mapped.depositId = Number(item.depositId);
      } else if (item.deposit_id !== undefined && item.deposit_id !== null) {
        mapped.depositId = Number(item.deposit_id);
      }

      if (item.createBy !== undefined && item.createBy !== null) {
        mapped.createBy = item.createBy as string;
      } else if (item.create_by !== undefined && item.create_by !== null) {
        mapped.createBy = item.create_by as string;
      } else if (item.createdBy !== undefined && item.createdBy !== null) {
        mapped.createBy = item.createdBy as string;
      }

      if (item.createdAt !== undefined && item.createdAt !== null) {
        mapped.createdAt = item.createdAt as string;
      } else if (item.created_at !== undefined && item.created_at !== null) {
        mapped.createdAt = item.created_at as string;
      }

      if (item.updatedAt !== undefined && item.updatedAt !== null) {
        mapped.updatedAt = item.updatedAt as string;
      } else if (item.updated_at !== undefined && item.updated_at !== null) {
        mapped.updatedAt = item.updated_at as string;
      }

      if (item.servicePartnerId !== undefined && item.servicePartnerId !== null) {
        mapped.servicePartnerId = Number(item.servicePartnerId);
      } else if (item.service_partner_id !== undefined && item.service_partner_id !== null) {
        mapped.servicePartnerId = Number(item.service_partner_id);
      }

      if (item.companyId !== undefined && item.companyId !== null) {
        mapped.companyId = Number(item.companyId);
      } else if (item.company_id !== undefined && item.company_id !== null) {
        mapped.companyId = Number(item.company_id);
      }

      return mapped;
    });
  } catch (error) {
    console.error("Error fetching service types:", error);

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to the server. Please check if the backend is running at ${API_BASE_URL}`);
    }

    // Re-throw with more context
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unexpected error fetching service types: ${String(error)}`);
  }
};

export interface RouteInServiceType {
  routeId: number;
  routeName: string;
  active: boolean;
  customerId: number;
  depositId: number;
  serviceTypeId: number;
}

export interface DepositInServiceType {
  depositId: number;
  depositName: string;
  routes: RouteInServiceType[];
}

export interface ServiceTypeWithDepositsAndRoutes {
  serviceTypeId: number;
  name: string;
  deposits: DepositInServiceType[];
}

/**
 * Fetches service types with deposits and routes
 * @param depositId - Optional deposit ID to filter by
 * @param serviceTypeId - Optional service type ID to filter by
 * @returns Promise with array of service types containing deposits and routes
 */
export const fetchServiceTypesWithDepositsAndRoutes = async (
  depositId?: number,
  serviceTypeId?: number
): Promise<ServiceTypeWithDepositsAndRoutes[]> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    // Construir query params
    const params = new URLSearchParams();
    if (depositId !== undefined && depositId !== null && depositId !== 0) {
      params.append("depositId", String(depositId));
    }
    if (serviceTypeId !== undefined && serviceTypeId !== null && serviceTypeId !== 0) {
      params.append("serviceTypeId", String(serviceTypeId));
    }

    const url = `${API_BASE_URL}/bff/service-types/with-deposits-and-routes${params.toString() ? `?${params.toString()}` : ''}`;

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
      // Handle authentication errors specifically
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch service types with deposits and routes (${response.status})`
      );
    }

    const data = await response.json();
    
    // A resposta vem no formato { serviceTypes: [...] }
    if (data.serviceTypes && Array.isArray(data.serviceTypes)) {
      return data.serviceTypes;
    }
    
    // Fallback: se vier como array direto
    if (Array.isArray(data)) {
      return data;
    }

    // Otherwise, return empty array
    return [];
  } catch (error) {
    console.error("Error fetching service types with deposits and routes:", error);
    throw error;
  }
};

// New DTO types for deposits with loops and routes
export interface RouteInDepositDTO {
  routeId: number;
  routeName: string;
  active: boolean;
  customerId: number;
  depositId: number;
  loopId?: number; // Using loopId instead of serviceTypeId
  serviceTypeId?: number; // Kept for backward compatibility
  servicePartnerId?: number;
}

export interface ServiceTypeInDepositDTO {
  serviceTypeId: number;
  name: string;
  routes: RouteInDepositDTO[];
}

export interface DepositWithServiceTypesAndRoutesDTO {
  depositId: number;
  depositName: string;
  isPhysical?: boolean;
  serviceTypes: ServiceTypeInDepositDTO[];
}

/**
 * Fetches deposits with service types and routes
 * @returns Promise with array of deposits containing service types and routes
 */
export const fetchDepositsWithServiceTypesAndRoutes = async (): Promise<DepositWithServiceTypesAndRoutesDTO[]> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/deposits/with-service-types-and-routes`, {
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
        errorData.message || `Failed to fetch deposits with service types and routes (${response.status})`
      );
    }

    const data = await response.json();
    
    // If response is a direct array, return it
    if (Array.isArray(data)) {
      return data;
    }
    
    // If response has a deposits property
    if (data.deposits && Array.isArray(data.deposits)) {
      return data.deposits;
    }

    // Otherwise, return empty array
    return [];
  } catch (error) {
    console.error("Error fetching deposits with service types and routes:", error);
    throw error;
  }
};

/**
 * Generates a unique color for each service based on ID
 * Uses a predefined color palette to ensure consistency
 */
const SERVICE_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-300', hover: 'hover:bg-blue-100', text: 'text-blue-900' },
  { bg: 'bg-purple-50', border: 'border-purple-300', hover: 'hover:bg-purple-100', text: 'text-purple-900' },
  { bg: 'bg-pink-50', border: 'border-pink-300', hover: 'hover:bg-pink-100', text: 'text-pink-900' },
  { bg: 'bg-rose-50', border: 'border-rose-300', hover: 'hover:bg-rose-100', text: 'text-rose-900' },
  { bg: 'bg-orange-50', border: 'border-orange-300', hover: 'hover:bg-orange-100', text: 'text-orange-900' },
  { bg: 'bg-amber-50', border: 'border-amber-300', hover: 'hover:bg-amber-100', text: 'text-amber-900' },
  { bg: 'bg-yellow-50', border: 'border-yellow-300', hover: 'hover:bg-yellow-100', text: 'text-yellow-900' },
  { bg: 'bg-lime-50', border: 'border-lime-300', hover: 'hover:bg-lime-100', text: 'text-lime-900' },
  { bg: 'bg-emerald-50', border: 'border-emerald-300', hover: 'hover:bg-emerald-100', text: 'text-emerald-900' },
  { bg: 'bg-teal-50', border: 'border-teal-300', hover: 'hover:bg-teal-100', text: 'text-teal-900' },
  { bg: 'bg-cyan-50', border: 'border-cyan-300', hover: 'hover:bg-cyan-100', text: 'text-cyan-900' },
  { bg: 'bg-sky-50', border: 'border-sky-300', hover: 'hover:bg-sky-100', text: 'text-sky-900' },
  { bg: 'bg-indigo-50', border: 'border-indigo-300', hover: 'hover:bg-indigo-100', text: 'text-indigo-900' },
  { bg: 'bg-violet-50', border: 'border-violet-300', hover: 'hover:bg-violet-100', text: 'text-violet-900' },
  { bg: 'bg-fuchsia-50', border: 'border-fuchsia-300', hover: 'hover:bg-fuchsia-100', text: 'text-fuchsia-900' },
];

/**
 * Gets the color for a specific serviceTypeId
 */
export const getServiceColor = (serviceTypeId: number | undefined | null): { bg: string; border: string; hover: string; text: string } => {
  if (!serviceTypeId) {
    // Default color when there's no service
    return { bg: 'bg-slate-50', border: 'border-slate-200', hover: 'hover:bg-slate-100', text: 'text-slate-900' };
  }
  
  // Uses modulo to ensure we always have a valid color
  const colorIndex = serviceTypeId % SERVICE_COLORS.length;
  return SERVICE_COLORS[colorIndex];
};

// ServiceTypeDTO interface - matches service_types table schema
export interface ServiceTypeDTO {
  serviceTypeId: number;
  name: string;
  description?: string;
  createBy?: string;
  createdAt?: string;
  updatedAt?: string;
  depositId?: number;
  active?: boolean;
  companyId?: number;
  servicePartnerId?: number;
}

export interface ServiceTypeCreateDTO {
  name: string;
  description?: string;
  createBy?: string;
  depositId?: number;
  active?: boolean;
  companyId?: number;
  servicePartnerId?: number;
}

export interface ServiceTypeUpdateDTO {
  name?: string;
  description?: string;
  depositId?: number;
  active?: boolean;
  companyId?: number;
  servicePartnerId?: number;
}

/**
 * Fetches ad-hoc service types from the backend.
 * GET /api/service-types (returns all, filtered by active=true on client)
 * @returns Promise with active ServiceTypeDTO rows
 */
export const fetchAdhocServiceTypes = async (): Promise<ServiceTypeDTO[]> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    // Use /bff/service-types following the project's BFF routing pattern
    const endpointUsed = `${API_BASE_URL}/bff/service-types`;
    const response = await guardedFetch(endpointUsed, {
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

      // Handle 404 - endpoint not found
      if (response.status === 404) {
        console.warn(`Adhoc service types endpoint not found (404) at ${endpointUsed}. Returning empty array.`);
        return [];
      }

      // Handle other errors
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || errorData.error || `Failed to fetch adhoc service types (${response.status} ${response.statusText})`
      );
    }

    const data = await response.json();

    // Handle different response formats
    let serviceTypesArray: Array<Record<string, unknown>> = [];

    if (Array.isArray(data)) {
      serviceTypesArray = data;
    } else {
      const dataObj = (data || {}) as Record<string, unknown>;
      if (Array.isArray(dataObj.serviceTypes)) {
        serviceTypesArray = dataObj.serviceTypes as Array<Record<string, unknown>>;
      } else if (Array.isArray(dataObj.data)) {
        serviceTypesArray = dataObj.data as Array<Record<string, unknown>>;
      } else if (Array.isArray(dataObj.result)) {
        serviceTypesArray = dataObj.result as Array<Record<string, unknown>>;
      } else {
        console.warn('[fetchAdhocServiceTypes] Unexpected response format:', data);
        // Try to extract any array from the response
        const keys = Object.keys(dataObj);
        for (const key of keys) {
          if (Array.isArray(dataObj[key])) {
            serviceTypesArray = dataObj[key] as Array<Record<string, unknown>>;
            break;
          }
        }
      }
    }

    // If no array found, return empty array
    if (serviceTypesArray.length === 0) {
      console.warn('[fetchAdhocServiceTypes] No service types found in response');
      return [];
    }

    // Map to ServiceTypeDTO format
    const mappedServiceTypes = serviceTypesArray.map((item): ServiceTypeDTO => {
      // Handle both snake_case and camelCase field names
      // Handle active field: can be boolean or string "yes"/"no"
      let activeValue = true; // default
      if (item.active !== undefined && item.active !== null) {
        if (typeof item.active === 'string') {
          activeValue = item.active.toLowerCase() === 'yes' || item.active.toLowerCase() === 'true';
        } else {
          activeValue = Boolean(item.active);
        }
      }

      const mapped: ServiceTypeDTO = {
        serviceTypeId: (item.serviceTypeId ?? item.service_type_id ?? 0) as number,
        name: (item.name ?? item.serviceName ?? '') as string,
        active: activeValue,
      };

      // Optional fields - handle both naming conventions
      if (item.description !== undefined && item.description !== null) {
        mapped.description = item.description as string;
      }
      if (item.depositId !== undefined && item.depositId !== null) {
        mapped.depositId = Number(item.depositId);
      }
      if (item.createBy !== undefined && item.createBy !== null) {
        mapped.createBy = item.createBy as string;
      } else if (item.createdBy !== undefined && item.createdBy !== null) {
        mapped.createBy = item.createdBy as string;
      }
      if (item.createdAt !== undefined && item.createdAt !== null) {
        mapped.createdAt = item.createdAt as string;
      }
      if (item.updatedAt !== undefined && item.updatedAt !== null) {
        mapped.updatedAt = item.updatedAt as string;
      }
      if (item.servicePartnerId !== undefined && item.servicePartnerId !== null) {
        mapped.servicePartnerId = Number(item.servicePartnerId);
      } else if (item.service_partner_id !== undefined && item.service_partner_id !== null) {
        mapped.servicePartnerId = Number(item.service_partner_id);
      }
      if (item.companyId !== undefined && item.companyId !== null) {
        mapped.companyId = Number(item.companyId);
      } else if (item.company_id !== undefined && item.company_id !== null) {
        mapped.companyId = Number(item.company_id);
      }

      return mapped;
    });

    // Filter: include only items where active is true (or not explicitly false)
    const filtered = mappedServiceTypes.filter(
      (serviceType) => {
        // Exclude if explicitly marked as inactive
        if (serviceType.active === false) {
          return false;
        }
        // Include if active is true or undefined/null (default to true)
        return true;
      }
    );

    // Return filtered results
    return filtered;
  } catch (error) {
    console.error("Error fetching adhoc service types:", error);
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to the server. Please check if the backend is running at ${API_BASE_URL}`);
    }
    
    // Re-throw with more context
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unexpected error fetching adhoc service types: ${String(error)}`);
  }
};

/**
 * Creates a new service type
 */
export const createServiceType = async (serviceTypeData: ServiceTypeCreateDTO): Promise<ServiceTypeDTO> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    // Only send fields that exist in the database - remove undefined/null values
    const payload: ServiceTypeCreateDTO = {
      name: serviceTypeData.name,
    };
    
    // Only include optional fields if they have values
    if (serviceTypeData.description !== undefined && serviceTypeData.description !== null && serviceTypeData.description !== '') {
      payload.description = serviceTypeData.description;
    }
    if (serviceTypeData.depositId !== undefined && serviceTypeData.depositId !== null) {
      payload.depositId = serviceTypeData.depositId;
    }
    if (serviceTypeData.active !== undefined && serviceTypeData.active !== null) {
      payload.active = serviceTypeData.active;
    }
    if (serviceTypeData.createBy !== undefined && serviceTypeData.createBy !== null) {
      payload.createBy = serviceTypeData.createBy;
    }
    if (serviceTypeData.servicePartnerId !== undefined && serviceTypeData.servicePartnerId !== null) {
      payload.servicePartnerId = serviceTypeData.servicePartnerId;
    }
    if (serviceTypeData.companyId !== undefined && serviceTypeData.companyId !== null) {
      payload.companyId = serviceTypeData.companyId;
    }

    const response = await guardedFetch(`${API_BASE_URL}/bff/service-types`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create service type (${response.status})`
      );
    }

    const data = await response.json();
    invalidateServiceTypesCache();
    return data;
  } catch (error) {
    console.error("Error creating service type:", error);
    throw error;
  }
};

/**
 * Updates an existing service type
 */
export const updateServiceType = async (
  serviceTypeId: number,
  serviceTypeData: ServiceTypeUpdateDTO
): Promise<ServiceTypeDTO> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    // Only send fields that exist in the database - remove undefined/null values
    const payload: Partial<ServiceTypeUpdateDTO> = {};
    
    if (serviceTypeData.name !== undefined && serviceTypeData.name !== null) {
      payload.name = serviceTypeData.name;
    }
    if (serviceTypeData.description !== undefined && serviceTypeData.description !== null) {
      payload.description = serviceTypeData.description;
    }
    if (serviceTypeData.depositId !== undefined && serviceTypeData.depositId !== null) {
      payload.depositId = serviceTypeData.depositId;
    }
    if (serviceTypeData.active !== undefined && serviceTypeData.active !== null) {
      payload.active = serviceTypeData.active;
    }
    if (serviceTypeData.servicePartnerId !== undefined && serviceTypeData.servicePartnerId !== null) {
      payload.servicePartnerId = serviceTypeData.servicePartnerId;
    }
    if (serviceTypeData.companyId !== undefined && serviceTypeData.companyId !== null) {
      payload.companyId = serviceTypeData.companyId;
    }

    const response = await guardedFetch(`${API_BASE_URL}/bff/service-types/${serviceTypeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update service type (${response.status})`
      );
    }

    const data = await response.json();
    invalidateServiceTypesCache();
    return data;
  } catch (error) {
    console.error("Error updating service type:", error);
    throw error;
  }
};

/**
 * Deletes a service type
 */
export const deleteServiceType = async (serviceTypeId: number): Promise<void> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/service-types/${serviceTypeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete service type (${response.status})`
      );
    }
    invalidateServiceTypesCache();
  } catch (error) {
    console.error("Error deleting service type:", error);
    throw error;
  }
};

/**
 * Creates a new route
 */
export const createRoute = async (routeData: Omit<RouteInDepositDTO, 'routeId'>): Promise<RouteInDepositDTO> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/routes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify(routeData),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create route (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating route:", error);
    throw error;
  }
};

/**
 * Updates an existing route
 */
export const updateRoute = async (
  routeId: number,
  routeData: Partial<RouteInDepositDTO>
): Promise<RouteInDepositDTO> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/routes/${routeId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      body: JSON.stringify(routeData),
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update route (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating route:", error);
    throw error;
  }
};

/**
 * Deletes a route
 */
// Loop types and interfaces
export interface LoopDTO {
  loopId?: number;
  loop_name: string;
  loopName?: string;
  depositId: number;
  description?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  active?: boolean;
}

export interface LoopInDepositDTO {
  loopId: number;
  loop_name: string;
  description?: string;
  routes: RouteInDepositDTO[];
}

export interface DepositWithLoopsAndRoutesDTO {
  depositId: number;
  depositName: string;
  loops: LoopInDepositDTO[];
  servicePartnerId?: number | string;
}

/**
 * Creates a new loop
 */
export const createLoop = async (loopData: Omit<LoopDTO, 'loopId'>): Promise<LoopDTO> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/service-types`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify({
        name: loopData.loop_name || loopData.loopName,
        depositId: loopData.depositId,
        description: loopData.description,
        active: loopData.active
      }),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create loop (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating loop:", error);
    throw error;
  }
};

/**
 * Updates an existing loop
 */
export const updateLoop = async (
  loopId: number,
  loopData: Partial<LoopDTO>
): Promise<LoopDTO> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/service-types/${loopId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify({
        name: loopData.loop_name || loopData.loopName,
        depositId: loopData.depositId,
        description: loopData.description,
        active: loopData.active
      }),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update loop (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating loop:", error);
    throw error;
  }
};

/**
 * Deletes a loop
 */
export const deleteLoop = async (loopId: number): Promise<void> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/service-types/${loopId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete loop (${response.status})`
      );
    }
  } catch (error) {
    console.error("Error deleting loop:", error);
    throw error;
  }
};

/**
 * Fetches all loops
 */
export const fetchLoops = async (): Promise<LoopDTO[]> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/service-types`, {
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
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      // If endpoint doesn't exist (404), return empty array
      if (response.status === 404) {
        console.warn("Loops endpoint not found. Returning empty array.");
        return [];
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch loops (${response.status})`
      );
    }

    const data = await response.json();
    
    let loopsArray: Array<Record<string, unknown>> = [];
    if (Array.isArray(data)) {
      loopsArray = data;
    } else if (data && typeof data === 'object') {
      const dataObj = data as Record<string, unknown>;
      loopsArray = (dataObj.loops || dataObj.serviceTypes || dataObj.data || dataObj.result || []) as Array<Record<string, unknown>>;
    }

    return loopsArray.map((item) => ({
      ...item,
      loopId: item.loopId || item.serviceTypeId || item.service_type_id,
      loop_name: item.loop_name || item.loopName || item.name || item.serviceName || '',
      loopName: item.loopName || item.loop_name || item.name || item.serviceName || ''
    })) as LoopDTO[];
  } catch (error) {
    console.error("Error fetching loops:", error);
    // Return empty array instead of throwing if it's a network/404 error
    if (error instanceof Error && (error.message.includes('404') || error.message.includes('Failed to fetch'))) {
      console.warn("Loops endpoint may not be implemented. Returning empty array.");
      return [];
    }
    throw error;
  }
};

/**
 * Fetches all routes
 */
export const fetchAllRoutes = async (): Promise<RouteInDepositDTO[]> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/routes`, {
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
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      // If endpoint doesn't exist (404), return empty array
      if (response.status === 404) {
        console.warn("Routes endpoint not found. Returning empty array.");
        return [];
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch routes (${response.status})`
      );
    }

    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data.routes && Array.isArray(data.routes)) {
      return data.routes;
    }

    return [];
  } catch (error) {
    console.error("Error fetching routes:", error);
    // Return empty array instead of throwing if it's a network/404 error
    if (error instanceof Error && (error.message.includes('404') || error.message.includes('Failed to fetch'))) {
      console.warn("Routes endpoint may not be implemented. Returning empty array.");
      return [];
    }
    throw error;
  }
};

/**
 * Fetches deposits with loops and routes
 * This function aggregates data from separate endpoints: deposits, loops, and routes
 * @returns Promise with array of deposits containing loops and routes
 */
export const fetchDepositsWithLoopsAndRoutes = async (): Promise<DepositWithLoopsAndRoutesDTO[]> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const mergeAllDeposits = async (aggregated: DepositWithLoopsAndRoutesDTO[]): Promise<DepositWithLoopsAndRoutesDTO[]> => {
      // Source of truth for "all deposits" (includes deposits without loops/routes yet)
      const allDeposits = await fetchDepositsFromVendors().catch(() => []);
      const byId = new Map<number, DepositWithLoopsAndRoutesDTO>();

      (aggregated || []).forEach((d) => {
        if (!d || !d.depositId) return;
        byId.set(d.depositId, {
          depositId: d.depositId,
          depositName: d.depositName || "",
          loops: Array.isArray(d.loops) ? d.loops : [],
          servicePartnerId: d.servicePartnerId,
        });
      });

      allDeposits.forEach((d) => {
        if (!d || !d.depositId) return;
        const existing = byId.get(d.depositId);
        if (!existing) {
          byId.set(d.depositId, {
            depositId: d.depositId,
            depositName: d.depositName || "",
            loops: [],
            servicePartnerId: d.servicePartnerId,
          });
          return;
        }

        // Prefer the canonical name from /bff/deposits when present
        if (d.depositName && (!existing.depositName || existing.depositName.trim().length === 0)) {
          existing.depositName = d.depositName;
        }

        // Prefer servicePartnerId from /bff/deposits when present
        if (!existing.servicePartnerId && d.servicePartnerId) {
          existing.servicePartnerId = d.servicePartnerId;
        }
      });

      return Array.from(byId.values()).sort((a, b) => (a.depositId || 0) - (b.depositId || 0));
    };

    // Try the aggregated endpoint first
    const response = await guardedFetch(`${API_BASE_URL}/bff/deposits/with-loops-and-routes`, {
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

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return await mergeAllDeposits(data as DepositWithLoopsAndRoutesDTO[]);
      }
      if (data.deposits && Array.isArray(data.deposits)) {
        return await mergeAllDeposits(data.deposits as DepositWithLoopsAndRoutesDTO[]);
      }
      return await mergeAllDeposits([]);
    }

    // If endpoint doesn't exist (400, 404), fallback to fetching separately
    if (response.status === 400 || response.status === 404) {
      console.warn("Aggregated endpoint not available. Fetching deposits, loops, and routes separately...");
      return await fetchDepositsWithLoopsAndRoutesFallback();
    }

    // For other errors (401, 403, etc.), throw
    if (response.status === 401 || response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
      throw new Error(errorMessage);
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch deposits with loops and routes (${response.status})`
    );
  } catch (error) {
    console.error("Error fetching deposits with loops and routes:", error);
    
    // If it's a network error or the endpoint doesn't exist, try fallback
    if (error instanceof Error && (error.message.includes('400') || error.message.includes('404') || error.message.includes('Failed to fetch'))) {
      console.warn("Trying fallback: fetching deposits, loops, and routes separately...");
      return await fetchDepositsWithLoopsAndRoutesFallback();
    }

    throw error;
  }
};

/**
 * Fallback function that fetches deposits, loops, and routes separately and aggregates them
 */
const fetchDepositsWithLoopsAndRoutesFallback = async (): Promise<DepositWithLoopsAndRoutesDTO[]> => {
  try {
    // Fetch deposits, loops, and routes separately
    const [depositsResult, loopsResult, routesResult] = await Promise.allSettled([
      fetchDepositsFromVendors(),
      fetchLoops(),
      fetchAllRoutes(),
    ]);

    // Extract deposits
    const deposits = depositsResult.status === 'fulfilled'
      ? depositsResult.value.map(d => ({ depositId: d.depositId, depositName: d.depositName || '', servicePartnerId: d.servicePartnerId }))
      : [];

    // Extract loops
    const loops = loopsResult.status === 'fulfilled' ? loopsResult.value : [];

    // Extract routes
    const routes = routesResult.status === 'fulfilled' ? routesResult.value : [];

    // Build the structure: Deposit > Loop > Route
    const result: DepositWithLoopsAndRoutesDTO[] = deposits.map(deposit => {
      // Get loops for this deposit
      const depositLoops = loops
        .filter(loop => loop.depositId === deposit.depositId)
        .map(loop => {
          // Get routes for this loop
          const loopRoutes = routes.filter(route => 
            route.depositId === deposit.depositId && 
            (route.loopId === loop.loopId || route.serviceTypeId === loop.loopId)
          );

          return {
            loopId: loop.loopId || 0,
            loop_name: loop.loop_name,
            description: loop.description,
            routes: loopRoutes,
          };
        });

      return {
        depositId: deposit.depositId,
        depositName: deposit.depositName,
        loops: depositLoops,
        servicePartnerId: deposit.servicePartnerId,
      };
    });

    return result;
  } catch (fallbackError) {
    console.error("Fallback also failed:", fallbackError);
    // Return empty array as last resort
    return [];
  }
};

export const deleteRoute = async (routeId: number): Promise<void> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/routes/${routeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete route (${response.status})`
      );
    }
  } catch (error) {
    console.error("Error deleting route:", error);
    throw error;
  }
};
