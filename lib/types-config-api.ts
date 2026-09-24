import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { hasAuthSession, getBearerAuthHeader } from "./auth"

const API_BASE_URL = getApiBaseUrl();

// Helper function to make API calls
const apiCall = async <T = unknown>(
  endpoint: string,
  method: string = "GET",
  body?: unknown,
  queryParams?: Record<string, string | number | undefined>
): Promise<T> => {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getBearerAuthHeader(),
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };

  // Build query string from queryParams
  let queryString = '';
  if (queryParams && method === "GET") {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'all') {
        params.append(key, String(value));
      }
    });
    queryString = params.toString();
    if (queryString) {
      queryString = `?${queryString}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
    cache: "no-store",
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}/bff${endpoint}${queryString}`;

  try {
    // eslint-disable-next-line no-console
    console.log(`[apiCall] Fetching: ${url}`, { method, hasBody: !!body });

    const response = await fetch(url, config);

    // eslint-disable-next-line no-console
    console.log(`[apiCall] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      
      if (response.status === 404) {
        if (method === "GET") {
          return [] as T;
        }
        throw new Error(`Endpoint not found (404). The backend route ${endpoint} may not be implemented yet.`);
      }
      
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Failed to ${method} ${endpoint} (${response.status})`;
      
      // If the table does not exist in the database, return empty array for GET requests
      // Isso permite que a aplicação continue funcionando enquanto as tabelas não são criadas
      if (method === "GET" && (errorMessage.includes('does not exist') || errorMessage.includes('relation') || errorMessage.includes('table'))) {
        console.warn(`Table/relation not found for ${endpoint}. Returning empty array. Error: ${errorMessage}`);
        return [] as T;
      }
      
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in API call to ${endpoint}:`, error);
    
    if (error instanceof TypeError) {
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        const networkError = new Error(`Network error: Unable to connect to the server. Please check if the backend is running at ${API_BASE_URL} and the endpoint ${endpoint} exists.`);
        (networkError as Error & { isNetworkError?: boolean }).isNetworkError = true;
        throw networkError;
      }
    }
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unknown error: ${String(error)}`);
  }
};

// ==================== VENDOR TYPES ====================

export interface VendorType {
  vendorTypeId: number;
  nameType: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorTypeCreateDTO {
  nameType: string;
  createdBy?: number | string;
}

export interface VendorTypeUpdateDTO {
  nameType?: string;
}

export const fetchVendorTypes = async (): Promise<VendorType[]> => {
  return apiCall<VendorType[]>("/vendor-types");
};

export const fetchVendorTypeById = async (id: number): Promise<VendorType> => {
  return apiCall<VendorType>(`/vendor-types/${id}`);
};

export const createVendorType = async (data: VendorTypeCreateDTO): Promise<VendorType> => {
  return apiCall<VendorType>("/vendor-types", "POST", data);
};

export const updateVendorType = async (id: number, data: VendorTypeUpdateDTO): Promise<VendorType> => {
  return apiCall<VendorType>(`/vendor-types/${id}`, "PATCH", data);
};

export const deleteVendorType = async (id: number): Promise<void> => {
  return apiCall<void>(`/vendor-types/${id}`, "DELETE");
};

// ==================== USER TYPES ====================

export interface UserType {
  userTypeId: number;
  nameType: string;
}

export interface UserTypeCreateDTO {
  nameType: string;
  createdBy?: number | string;
}

export interface UserTypeUpdateDTO {
  nameType?: string;
}

export const fetchUserTypes = async (): Promise<UserType[]> => {
  return apiCall<UserType[]>("/user-types");
};

export const fetchUserTypeById = async (id: number): Promise<UserType> => {
  return apiCall<UserType>(`/user-types/${id}`);
};

export const createUserType = async (data: UserTypeCreateDTO): Promise<UserType> => {
  return apiCall<UserType>("/user-types", "POST", data);
};

export const updateUserType = async (id: number, data: UserTypeUpdateDTO): Promise<UserType> => {
  return apiCall<UserType>(`/user-types/${id}`, "PATCH", data);
};

export const deleteUserType = async (id: number): Promise<void> => {
  return apiCall<void>(`/user-types/${id}`, "DELETE");
};

// ==================== COST MODELS ====================
// API response: { cost_models: CostModel[] } (GET) or CostModel (PATCH)

export interface CostModel {
  costModelId: number;
  name?: string;
  description?: string;
  isAdhocCategory?: boolean;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  customerId?: number;
  paymentMethod?: string;
}

export interface CostModelCreateDTO {
  name: string;
  description?: string;
  isAdhocCategory?: boolean;
  customerId?: number;
  paymentMethod?: string;
  createdBy?: number | string;
}

/** Only description and paymentMethod are editable on update (PATCH). */
export interface CostModelUpdateDTO {
  description?: string;
  paymentMethod?: string;
}

export const fetchCostModels = async (): Promise<CostModel[]> => {
  const data = await apiCall<{ costModels?: CostModel[] } | CostModel[]>("/cost-models");
  if (data && typeof data === "object" && "costModels" in data && Array.isArray(data.costModels)) {
    return data.costModels;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

export const fetchCostModelById = async (id: number): Promise<CostModel> => {
  return apiCall<CostModel>(`/cost-models/${id}`);
};

export const createCostModel = async (data: CostModelCreateDTO): Promise<CostModel> => {
  return apiCall<CostModel>("/cost-models", "POST", data);
};

export const updateCostModel = async (id: number, data: CostModelUpdateDTO): Promise<CostModel> => {
  return apiCall<CostModel>(`/cost-models/${id}`, "PATCH", data);
};

export const deleteCostModel = async (id: number): Promise<void> => {
  return apiCall<void>(`/cost-models/${id}`, "DELETE");
};

// ==================== VEHICLE TYPES ====================

export interface VehicleType {
  vehicleTypeId: number;
  typeName: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleTypeCreateDTO {
  typeName: string;
  createdBy?: number | string;
}

export interface VehicleTypeUpdateDTO {
  typeName?: string;
}

export const fetchVehicleTypes = async (): Promise<VehicleType[]> => {
  return apiCall<VehicleType[]>("/vehicle-types");
};

export const fetchVehicleTypeById = async (id: number): Promise<VehicleType> => {
  return apiCall<VehicleType>(`/vehicle-types/${id}`);
};

export const createVehicleType = async (data: VehicleTypeCreateDTO): Promise<VehicleType> => {
  return apiCall<VehicleType>("/vehicle-types", "POST", data);
};

export const updateVehicleType = async (id: number, data: VehicleTypeUpdateDTO): Promise<VehicleType> => {
  return apiCall<VehicleType>(`/vehicle-types/${id}`, "PATCH", data);
};

export const deleteVehicleType = async (id: number): Promise<void> => {
  return apiCall<void>(`/vehicle-types/${id}`, "DELETE");
};

// ==================== ADHOC SERVICES ====================

export interface AdhocServiceDTO {
  adhocServiceId: number;
  adhocName?: string;
  adhocReceivedPayment?: number;
  adhocVendorPayment?: number;
  isAdhocSort?: boolean;
  adhocCategoryId?: number;
  servicePartnerId?: number;
  servicePartnerName?: string | null;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Alias para compatibilidade com imports existentes
export type AdhocService = AdhocServiceDTO;

export interface AdhocServiceCreateDTO {
  adhocName?: string;
  adhocReceivedPayment?: number;
  adhocVendorPayment?: number;
  isAdhocSort?: boolean;
  adhocCategoryId?: number;
  servicePartnerId?: number;
  createdBy?: number | string;
}

export interface AdhocServiceUpdateDTO {
  adhocName?: string;
  adhocReceivedPayment?: number;
  adhocVendorPayment?: number;
  isAdhocSort?: boolean;
  adhocCategoryId?: number;
  servicePartnerId?: number;
}

export interface AdhocCategory {
  adhocCategoriesId: number;
  name: string;
  description?: string;
  active?: boolean;
  createdBy?: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdhocCategoryCreateDTO {
  name: string;
  description?: string;
  active?: boolean;
  createdBy?: number | string;
}

export interface AdhocCategoryUpdateDTO {
  name?: string;
  description?: string;
  active?: boolean;
}

const parseOptionalNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const parseOptionalBoolean = (value: unknown): boolean | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n'].includes(normalized)) return false;
  }
  return undefined;
};

interface AdhocServiceApiRaw {
  adhocServiceId?: number | string | null;
  adhocName?: string | null;
  adhocReceivedPayment?: number | string | null;
  adhocVendorPayment?: number | string | null;
  isAdhocSort?: boolean | string | number | null;
  adhocCategoryId?: number | string | null;
  adhocCategoriesId?: number | string | null;
  serviceTypeId?: number | string | null;
  servicePartnerId?: number | string | null;
  servicePartnerName?: string | null;
  createdBy?: number | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const mapAdhocService = (item: AdhocServiceApiRaw): AdhocServiceDTO => {
  const adhocCategoryId =
    parseOptionalNumber(item.adhocCategoryId) ??
    parseOptionalNumber(item.adhocCategoriesId) ??
    parseOptionalNumber(item.serviceTypeId);

  return {
    adhocServiceId: Number(item.adhocServiceId ?? 0) || 0,
    adhocName: item.adhocName != null ? String(item.adhocName) : undefined,
    adhocReceivedPayment:
      parseOptionalNumber(item.adhocReceivedPayment),
    adhocVendorPayment:
      parseOptionalNumber(item.adhocVendorPayment),
    isAdhocSort:
      parseOptionalBoolean(item.isAdhocSort),
    adhocCategoryId,
    servicePartnerId: parseOptionalNumber(item.servicePartnerId),
    servicePartnerName: item.servicePartnerName != null ? String(item.servicePartnerName) : null,
    createdBy: parseOptionalNumber(item.createdBy),
    createdAt:
      item.createdAt != null
        ? String(item.createdAt)
        : undefined,
    updatedAt:
      item.updatedAt != null
        ? String(item.updatedAt)
        : undefined,
  };
};

const mapAdhocServicePayload = (data: AdhocServiceCreateDTO | AdhocServiceUpdateDTO) => {
  const adhocCategoryId = data.adhocCategoryId ?? null;

  return {
    ...data,
    adhocCategoryId,
    adhocCategoriesId: adhocCategoryId,
  };
};

interface AdhocCategoryApiRaw {
  adhocCategoryId?: number | string | null;
  adhocCategoriesId?: number | string | null;
  adhoc_categories_id?: number | string | null;
  categoryId?: number | string | null;
  category_id?: number | string | null;
  serviceTypeId?: number | string | null;
  service_type_id?: number | string | null;
  name?: string | null;
  adhocCategoryName?: string | null;
  adhoc_category_name?: string | null;
  adhocCategoriesName?: string | null;
  adhoc_categories_name?: string | null;
  categoryName?: string | null;
  category_name?: string | null;
  serviceTypeName?: string | null;
  service_type_name?: string | null;
  serviceName?: string | null;
  typeName?: string | null;
  label?: string | null;
  nameType?: string | null;
  descriptionName?: string | null;
  description?: string | null;
  active?: boolean | string | number | null;
  isActive?: boolean | string | number | null;
  is_active?: boolean | string | number | null;
  createdBy?: number | string | null;
  created_by?: number | string | null;
  createdAt?: string | null;
  created_at?: string | null;
  updatedAt?: string | null;
  updated_at?: string | null;
}

const mapAdhocCategory = (item: AdhocCategoryApiRaw): AdhocCategory | null => {
  const id =
    parseOptionalNumber(item.adhocCategoriesId) ??
    parseOptionalNumber(item.adhoc_categories_id) ??
    parseOptionalNumber(item.adhocCategoryId) ??
    parseOptionalNumber(item.categoryId) ??
    parseOptionalNumber(item.category_id) ??
    parseOptionalNumber(item.serviceTypeId) ??
    parseOptionalNumber(item.service_type_id);

  if (!id) return null;

  const resolvedName =
    item.name ??
    item.adhoc_category_name ??
    item.adhocCategoryName ??
    item.category_name ??
    item.categoryName ??
    item.service_type_name ??
    item.serviceTypeName ??
    item.serviceName ??
    item.typeName ??
    item.label ??
    item.nameType ??
    item.descriptionName ??
    item.adhoc_categories_name ??
    item.adhocCategoriesName ??
    '';

  return {
    adhocCategoriesId: id,
    name: String(resolvedName ?? ''),
    description: item.description != null ? String(item.description) : undefined,
    active:
      parseOptionalBoolean(item.active) ??
      parseOptionalBoolean(item.isActive) ??
      parseOptionalBoolean(item.is_active),
    createdBy: parseOptionalNumber(item.createdBy) ?? parseOptionalNumber(item.created_by) ?? (item.createdBy != null ? String(item.createdBy) : (item.created_by != null ? String(item.created_by) : undefined)),
    createdAt:
      item.createdAt != null
        ? String(item.createdAt)
        : (item.created_at != null ? String(item.created_at) : undefined),
    updatedAt:
      item.updatedAt != null
        ? String(item.updatedAt)
        : (item.updated_at != null ? String(item.updated_at) : undefined),
  };
};

export const fetchAdhocServices = async (
  opts?: { servicePartnerId?: number | 'all' }
): Promise<AdhocService[]> => {
  const params = new URLSearchParams();
  if (opts?.servicePartnerId != null && opts.servicePartnerId !== 'all') {
    params.set('servicePartnerId', String(opts.servicePartnerId));
  }
  const qs = params.toString();
  const data = await apiCall<
    AdhocServiceApiRaw[] |
    { data?: AdhocServiceApiRaw[]; adhocServices?: AdhocServiceApiRaw[] }
  >(`/adhoc-services${qs ? `?${qs}` : ''}`);

  const rawList = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.adhocServices)
        ? data.adhocServices
        : [];

  return rawList.map(mapAdhocService).filter((item) => item.adhocServiceId > 0);
};

export const fetchAdhocServiceById = async (id: number): Promise<AdhocService> => {
  const data = await apiCall<AdhocServiceApiRaw>(`/adhoc-services/${id}`);
  return mapAdhocService(data);
};

export const createAdhocService = async (data: AdhocServiceCreateDTO): Promise<AdhocService> => {
  const response = await apiCall<AdhocServiceApiRaw>("/adhoc-services", "POST", mapAdhocServicePayload(data));
  return mapAdhocService(response);
};

export const updateAdhocService = async (id: number, data: AdhocServiceUpdateDTO): Promise<AdhocService> => {
  const response = await apiCall<AdhocServiceApiRaw>(`/adhoc-services/${id}`, "PATCH", mapAdhocServicePayload(data));
  return mapAdhocService(response);
};

export const deleteAdhocService = async (id: number): Promise<void> => {
  return apiCall<void>(`/adhoc-services/${id}`, "DELETE");
};

export const fetchAdhocCategories = async (): Promise<AdhocCategory[]> => {
  const parseRawList = (
    data:
      | AdhocCategoryApiRaw[]
      | { data?: AdhocCategoryApiRaw[]; adhocCategories?: AdhocCategoryApiRaw[] }
      | null
      | undefined
  ): AdhocCategoryApiRaw[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.adhocCategories)) return data.adhocCategories;
    return [];
  };

  const servicesData = await apiCall<
    AdhocCategoryApiRaw[] |
    { data?: AdhocCategoryApiRaw[]; adhocCategories?: AdhocCategoryApiRaw[] }
  >('/adhoc-categories');

  const rawList = parseRawList(servicesData);

  const normalized = rawList
    .map(mapAdhocCategory)
    .filter((item): item is AdhocCategory => item !== null);

  // Deduplicar por ID para evitar keys repetidas no select.
  const byId = new Map<number, AdhocCategory>();
  for (const cat of normalized) {
    const existing = byId.get(cat.adhocCategoriesId);
    if (!existing) {
      byId.set(cat.adhocCategoriesId, cat);
      continue;
    }
    const existingName = (existing.name ?? '').trim();
    const nextName = (cat.name ?? '').trim();
    if (!existingName && nextName) {
      byId.set(cat.adhocCategoriesId, cat);
    }
  }

  return Array.from(byId.values()).sort((a, b) => {
    const an = (a.name || '').toLowerCase();
    const bn = (b.name || '').toLowerCase();
    return an.localeCompare(bn);
  });
};

export const createAdhocCategory = async (data: AdhocCategoryCreateDTO): Promise<AdhocCategory> => {
  const response = await apiCall<AdhocCategoryApiRaw>("/adhoc-categories", "POST", data);
  const mapped = mapAdhocCategory(response);
  if (!mapped) throw new Error("Failed to map created adhoc category");
  return mapped;
};

export const updateAdhocCategory = async (id: number, data: AdhocCategoryUpdateDTO): Promise<AdhocCategory> => {
  const response = await apiCall<AdhocCategoryApiRaw>(`/adhoc-categories/${id}`, "PATCH", data);
  const mapped = mapAdhocCategory(response);
  if (!mapped) throw new Error("Failed to map updated adhoc category");
  return mapped;
};

export const deleteAdhocCategory = async (id: number): Promise<void> => {
  return apiCall<void>(`/adhoc-categories/${id}`, "DELETE");
};

// ==================== MANAGEMENT TEAM FUNCTIONS ====================

export interface ManagementTeamFunction {
  managementTeamFunctionId: number;
  functionName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | number | null;
  depositId: number | null;
  userId: number | null;
  servicePartnerId: number | null;
  servicePartnerName?: string | null;
}

export interface ManagementTeamFunctionCreateDTO {
  functionName: string;
  depositId?: number | null;
  userId?: number | null;
  servicePartnerId?: number | null;
  createdBy?: string | number | null;
}

export interface ManagementTeamFunctionUpdateDTO {
  functionName?: string;
  depositId?: number | null;
  userId?: number | null;
  servicePartnerId?: number | null;
}

export const fetchManagementTeamFunctions = async (): Promise<ManagementTeamFunction[]> => {
  try {
    const data = await apiCall<ManagementTeamFunction[] | { data?: ManagementTeamFunction[] }>("/management-team-functions");
    if (data && typeof data === "object" && !Array.isArray(data) && "data" in data && Array.isArray(data.data)) {
      return data.data;
    }
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching management team functions:", error);
    throw error;
  }
};

export const fetchManagementTeamFunctionById = async (id: number): Promise<ManagementTeamFunction> => {
  return apiCall<ManagementTeamFunction>(`/management-team-functions/${id}`);
};

export const createManagementTeamFunction = async (data: ManagementTeamFunctionCreateDTO): Promise<ManagementTeamFunction> => {
  return apiCall<ManagementTeamFunction>("/management-team-functions", "POST", data);
};

export const updateManagementTeamFunction = async (
  id: number,
  data: ManagementTeamFunctionUpdateDTO
): Promise<ManagementTeamFunction> => {
  return apiCall<ManagementTeamFunction>(`/management-team-functions/${id}`, "PATCH", data);
};

export const deleteManagementTeamFunction = async (id: number): Promise<void> => {
  await apiCall<void>(`/management-team-functions/${id}`, "DELETE");
};


