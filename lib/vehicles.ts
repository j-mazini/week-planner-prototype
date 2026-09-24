import { hasAuthSession, getBearerAuthHeader } from "./auth"
import { getApiBaseUrl } from "./apiBaseUrl";
import { guardedFetch } from "@/lib/in-flight-guard";

export interface Vehicle {
  [key: string]: unknown;
  vehicleId?: number;
  manufacturer?: string;
  model?: string;
  fuelType?: string;
  registrationPlates?: string;
  motDue?: string;
  taxDue?: string;
  registeredDate?: string;
  isWarranty?: boolean;
  finance?: string;
  size?: string;
  colour?: string;
  logo?: string;
  is270Door?: boolean;
  isSlamLock?: boolean;
  isServicePack?: boolean;
  serviceDue?: string;
  active?: boolean;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  customerId?: number;
  companyId?: number;
  vehicleTypeId?: number;
}

export interface VehicleDTO {
  vehicleId: number;
  manufacturer?: string;
  model?: string;
  fuelType?: string;
  registrationPlates?: string;
  motDue?: string;
  taxDue?: string;
  registeredDate?: string;
  isWarranty?: boolean;
  finance?: string;
  size?: string;
  colour?: string;
  logo?: string;
  is270Door?: boolean;
  isSlamLock?: boolean;
  isServicePack?: boolean;
  isWrapped?: boolean;
  isCam?: boolean;
  isGps?: boolean;
  isBulkhead?: boolean;
  serviceDue?: string;
  active?: boolean;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  customerId?: number;
  companyId: number;
  servicePartnerId?: number | null;
  vehicleTypeId?: number;
  vehicleTypeName?: string;
  depositId?: number;
}

export interface VehiclesResponse {
  vehicles?: Vehicle[];
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface VehiclePaginatedResponseDTO {
  data: VehicleDTO[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface VehicleFiltersDTO {
  registrationPlate?: string;
  model?: string;
  manufacturer?: string;
  fuelType?: string;
  active?: boolean;
  search?: string;
  servicePartnerId?: number | null;
  page: number;
  limit: number;
}

/**
 * Busca todos os veículos da tabela vehicles
 * SELECT * FROM vehicles
 * @returns Promise com array de veículos
 */
export const fetchVehicles = async (): Promise<Vehicle[]> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/vehicles`, {
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
        errorData.message || `Failed to fetch vehicles (${response.status})`
      );
    }

    const data: VehiclesResponse | Vehicle[] = await response.json();
    
    // Se a resposta já vier no formato esperado com vehicles, retorna diretamente
    if (data && typeof data === "object" && "vehicles" in data && Array.isArray(data.vehicles)) {
      return data.vehicles;
    }

    // Se vier como array direto, retorna
    if (Array.isArray(data)) {
      return data;
    }

    // Caso contrário, retorna array vazio
    return [];
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
};

/**
 * Busca veículos disponíveis por data
 */
export const fetchVehiclesAvailableByDate = async (date: string): Promise<Vehicle[]> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  if (!date) return [];

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/vehicles/available/${encodeURIComponent(date)}`, {
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch available vehicles (${response.status})`
      );
    }

    const data: VehiclesResponse | Vehicle[] = await response.json();

    if (data && typeof data === "object" && "vehicles" in data && Array.isArray(data.vehicles)) {
      return data.vehicles;
    }

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  } catch (error) {
    console.error("Error fetching available vehicles:", error);
    throw error;
  }
};

export interface VehicleCreateDTO {
  manufacturer?: string;
  model?: string;
  fuelType?: string;
  registrationPlates?: string;
  motDue?: string;
  taxDue?: string;
  registeredDate?: string;
  isWarranty?: boolean;
  finance?: string;
  size?: string;
  colour?: string;
  logo?: string;
  is270Door?: boolean;
  isSlamLock?: boolean;
  isServicePack?: boolean;
  isWrapped?: boolean;
  isCam?: boolean;
  isGps?: boolean;
  isBulkhead?: boolean;
  serviceDue?: string;
  active?: boolean;
  createdBy?: number;
  customerId?: number;
  companyId?: number;
  vehicleTypeId?: number;
  depositId?: number;
  servicePartnerId?: number | null;
}

export interface VehicleUpdateDTO {
  manufacturer?: string;
  model?: string;
  fuelType?: string;
  registrationPlates?: string;
  motDue?: string;
  taxDue?: string;
  registeredDate?: string;
  isWarranty?: boolean;
  finance?: string;
  size?: string;
  colour?: string;
  logo?: string;
  is270Door?: boolean;
  isSlamLock?: boolean;
  isServicePack?: boolean;
  isWrapped?: boolean;
  isCam?: boolean;
  isGps?: boolean;
  isBulkhead?: boolean;
  serviceDue?: string;
  active?: boolean;
  customerId?: number;
  companyId?: number;
  vehicleTypeId?: number;
  depositId?: number;
  servicePartnerId?: number | null;
}

// Tipos de veículo (vehicle_types)
export interface VehicleType {
  vehicleTypeId: number;
  typeName: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Busca todos os veículos com filtros aplicados (sem paginação)
 * Faz múltiplas chamadas paginadas até obter todos os registros
 * @param filters - Filtros de busca (sem page e limit)
 * @param forceRefresh - Força atualização do cache (opcional)
 * @returns Promise com array de todos os veículos
 */
export const fetchAllVehiclesWithFilters = async (
  filters: Omit<VehicleFiltersDTO, 'page' | 'limit'>,
  forceRefresh?: boolean
): Promise<VehicleDTO[]> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const allVehicles: VehicleDTO[] = [];
    let currentPage = 1;
    const itemsPerPage = 100; // Usar um tamanho grande para reduzir número de chamadas
    let hasMorePages = true;

    while (hasMorePages) {
      const params = new URLSearchParams();
      
      params.append("currentPage", currentPage.toString());
      params.append("totalItensPerPage", itemsPerPage.toString());
      
      if (filters.registrationPlate) {
        params.append("registrationPlate", filters.registrationPlate);
      }
      if (filters.model) {
        params.append("model", filters.model);
      }
      if (filters.manufacturer) {
        params.append("manufacturer", filters.manufacturer);
      }
      if (filters.fuelType) {
        params.append("fuelType", filters.fuelType);
      }
      if (filters.active !== undefined) {
        params.append("active", filters.active.toString());
      }
      if (filters.search) {
        params.append("search", filters.search);
      }
      if (filters.servicePartnerId !== undefined && filters.servicePartnerId !== null) {
        params.append("servicePartnerId", filters.servicePartnerId.toString());
      }
      if (forceRefresh) {
        params.append("forceRefresh", "true");
      }

      const response = await guardedFetch(`${API_BASE_URL}/bff/vehicles?${params.toString()}`, {
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `Failed to fetch vehicles (${response.status})`
        );
      }

      const data: VehiclePaginatedResponseDTO = await response.json();
      allVehicles.push(...data.data);
      
      // Verificar se há mais páginas
      hasMorePages = currentPage < data.pagination.totalPages;
      currentPage++;
    }

    return allVehicles;
  } catch (error) {
    console.error("Error fetching all vehicles with filters:", error);
    throw error;
  }
};

/**
 * Busca veículos paginados com filtros
 * @param filters - Filtros de busca e paginação
 * @param forceRefresh - Força atualização do cache (opcional)
 * @returns Promise com dados paginados
 */
export const fetchVehiclesPaginated = async (
  filters: VehicleFiltersDTO,
  forceRefresh?: boolean
): Promise<VehiclePaginatedResponseDTO> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const params = new URLSearchParams();
    
    params.append("currentPage", filters.page.toString());
    params.append("totalItensPerPage", filters.limit.toString());

    if (filters.registrationPlate) {
      params.append("registrationPlate", filters.registrationPlate);
    }
    if (filters.model) {
      params.append("model", filters.model);
    }
    if (filters.manufacturer) {
      params.append("manufacturer", filters.manufacturer);
    }
    if (filters.fuelType) {
      params.append("fuelType", filters.fuelType);
    }
    if (filters.active !== undefined) {
      params.append("active", filters.active.toString());
    }
    if (filters.search) {
      params.append("search", filters.search);
    }
    if (filters.servicePartnerId !== undefined && filters.servicePartnerId !== null) {
      params.append("servicePartnerId", filters.servicePartnerId.toString());
    }
    if (forceRefresh) {
      params.append("forceRefresh", "true");
    }

    const url = `${API_BASE_URL}/bff/vehicles?${params.toString()}`;
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
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `Failed to fetch vehicles (${response.status})`
      );
    }

    const data: VehiclePaginatedResponseDTO = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching paginated vehicles:", error);
    throw error;
  }
};

/**
 * Busca todos os tipos de veículos (vehicle_types)
 * SELECT * FROM vehicle_types
 */
export const fetchVehicleTypes = async (): Promise<VehicleType[]> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/vehicle-types`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch vehicle types (${response.status})`
      );
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data as VehicleType[];
    }

    if (data && Array.isArray(data.vehicleTypes)) {
      return data.vehicleTypes as VehicleType[];
    }

    return [];
  } catch (error) {
    console.error("Error fetching vehicle types:", error);
    throw error;
  }
};

/**
 * Cria um novo veículo
 * @param vehicleData - Dados do veículo para criação
 * @returns Promise com o veículo criado
 */
export const createVehicle = async (vehicleData: VehicleCreateDTO): Promise<VehicleDTO> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/vehicles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify(vehicleData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `Failed to create vehicle (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating vehicle:", error);
    throw error;
  }
};

/**
 * Atualiza um veículo existente
 * @param vehicleId - ID do veículo a ser atualizado
 * @param vehicleData - Dados do veículo para atualização
 * @returns Promise com o veículo atualizado
 */
export const updateVehicle = async (
  vehicleId: number,
  vehicleData: VehicleUpdateDTO
): Promise<VehicleDTO> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/vehicles/${vehicleId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify(vehicleData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `Failed to update vehicle (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating vehicle:", error);
    throw error;
  }
};

/**
 * Deleta um veículo
 * @param vehicleId - ID do veículo a ser deletado
 * @returns Promise com mensagem de sucesso
 */
export const deleteVehicle = async (vehicleId: number): Promise<void> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await guardedFetch(`${API_BASE_URL}/bff/vehicles/${vehicleId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `Failed to delete vehicle (${response.status})`
      );
    }
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    throw error;
  }
};


