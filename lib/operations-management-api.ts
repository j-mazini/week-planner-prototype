import { hasAuthSession, getBearerAuthHeader } from "./auth"
import { getApiBaseUrl } from "./apiBaseUrl";
import { guardedFetch } from "@/lib/in-flight-guard";

export interface OperationManagementListDTO {
  operationId: number;
  date: string;
  rate: number;
  dailyServiceCharge: number;
  extra: number;
  status: string;
  routeId: number;
  routeName?: string;
  adhocSort: number;
  routeSort: number;
  userId: number;
  modelEmployeesId?: number | null;
  costModelId?: number;
  invoiceId?: number;
  vehicleId?: number;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OperationManagementCreateDTO {
  date: string;
  rate: number;
  dailyServiceCharge: number;
  extra: number;
  status: string;
  routeId: number;
  adhocSort: number;
  routeSort: number;
  userId: number;
  modelEmployeesId?: number | null;
  costModelId?: number;
  vehicleId?: number;
  note?: string;
}

export interface OperationManagementUpdateDTO {
  date?: string;
  rate?: number;
  dailyServiceCharge?: number;
  extra?: number;
  status?: string;
  routeId?: number;
  adhocSort?: number;
  routeSort?: number;
  userId?: number;
  modelEmployeesId?: number | null;
  costModelId?: number;
  vehicleId?: number;
  note?: string;
}

export interface OperationManagementDetailDTO extends OperationManagementListDTO {
  vendorName?: string;
  vehicleRegistration?: string;
  costModelName?: string;
}

export interface OperationManagementFiltersDTO {
  date: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  vendorType?: string;
}

export interface OperationManagementPaginatedResponseDTO {
  data: OperationManagementListDTO[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface OperationStatusDTO {
  value: string;
  label: string;
}

export interface VendorTypeDTO {
  value: string;
  label: string;
}

export interface OperationManagementTypesDTO {
  statuses: OperationStatusDTO[];
  vendorTypes: VendorTypeDTO[];
}

export interface OperationManagementBulkDeleteDTO {
  operationIds: number[];
}

/**
 * Lista operações paginadas com filtros
 * @param filters - Filtros para busca paginada
 * @returns Promise com dados paginados
 */
export const fetchOperationsPaginated = async (
  filters: OperationManagementFiltersDTO
): Promise<OperationManagementPaginatedResponseDTO> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const params = new URLSearchParams();
    params.append("date", filters.date);
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);
    if (filters.vendorType) params.append("vendorType", filters.vendorType);

    const response = await guardedFetch(`${API_BASE_URL}/bff/operations/paginated?${params.toString()}`, {
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
      let errorMessage = `Failed to fetch paginated operations (${response.status})`;
      try {
        const errorData = await response.json();
        // Extract error message from various possible formats
        errorMessage = errorData.error || errorData.message || errorData.details || errorMessage;
        
        // Handle specific database errors - the backend is trying to access dt.name which doesn't exist
        if (errorMessage.includes('dt.name') || errorMessage.includes('coluna') || errorMessage.includes('não existe')) {
          errorMessage = 'Database error: The backend query is referencing a column (dt.name) that does not exist in the vendor_types table. The correct column name should be used (e.g., vendor_type_description). Please contact the administrator to fix the backend query.';
        }
      } catch {
        // If JSON parsing fails, try to get text
        const errorText = await response.text().catch(() => '');
        if (errorText) {
          errorMessage = errorText.includes('dt.name') 
            ? 'Database error: Backend query references non-existent column dt.name. Please contact administrator.'
            : errorText;
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching paginated operations:", error);
    throw error;
  }
};

/**
 * Busca os tipos de operação (statuses e vendor types)
 * @returns Promise com tipos de operação
 */
export const fetchOperationTypes = async (): Promise<OperationManagementTypesDTO> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/operations/types`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `Failed to fetch operation types (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching operation types:", error);
    throw error;
  }
};

/**
 * Lista todas as operações para uma data específica
 * @param date - Data no formato YYYY-MM-DD
 * @param forceRefresh - Força atualização do cache (opcional)
 * @returns Promise com array de operações
 */
export const fetchOperations = async (
  date: string,
  forceRefresh?: boolean
): Promise<OperationManagementListDTO[]> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const params = new URLSearchParams();
    params.append("date", date);
    if (forceRefresh) {
      params.append("forceRefresh", "true");
    }

    const response = await guardedFetch(`${API_BASE_URL}/bff/operations?${params.toString()}`, {
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `Failed to fetch operations (${response.status})`
      );
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching operations:", error);
    throw error;
  }
};

/**
 * Busca uma operação específica por ID
 * @param operationId - ID da operação
 * @returns Promise com os detalhes da operação
 */
export const fetchOperationById = async (
  operationId: number
): Promise<OperationManagementDetailDTO | null> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/operations/${operationId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `Failed to fetch operation (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching operation:", error);
    throw error;
  }
};

/**
 * Cria uma nova operação
 * @param operationData - Dados da operação para criação
 * @returns Promise com a operação criada
 */
export const createOperation = async (
  operationData: OperationManagementCreateDTO
): Promise<OperationManagementListDTO> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/operations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify(operationData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `Failed to create operation (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating operation:", error);
    throw error;
  }
};

/**
 * Atualiza uma operação existente
 * @param operationId - ID da operação a ser atualizada
 * @param operationData - Dados da operação para atualização
 * @returns Promise com a operação atualizada
 */
export const updateOperation = async (
  operationId: number,
  operationData: OperationManagementUpdateDTO
): Promise<OperationManagementListDTO> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/operations/${operationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify(operationData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `Failed to update operation (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating operation:", error);
    throw error;
  }
};

/**
 * Deleta uma operação
 * @param operationId - ID da operação a ser deletada
 * @returns Promise com mensagem de sucesso
 */
export const deleteOperation = async (operationId: number): Promise<void> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/operations/${operationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `Failed to delete operation (${response.status})`
      );
    }
  } catch (error) {
    console.error("Error deleting operation:", error);
    throw error;
  }
};

/**
 * Deleta operações em lote removendo vínculos por operationId
 * (route_time_windows, operations_delivery, delivery_details, operations_adjustment)
 */
export const deleteOperationsManagementBulk = async (
  payload: OperationManagementBulkDeleteDTO,
): Promise<void> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  if (!payload?.operationIds?.length) {
    throw new Error("No operation ids provided for bulk delete.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/operations`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorText = errorData.error || errorData.message || (await response.text().catch(() => ""));
      throw new Error(
        `Failed to bulk delete operations (${response.status}): ${errorText || response.statusText}`,
      );
    }
  } catch (error) {
    console.error("Error deleting operations in bulk:", error);
    throw error;
  }
};



