import { api } from "./api-client";
import type { CostModelItem } from "./vendors-api";

export interface Vendor {
  /** Display-only field (not persisted). Indicates vendor availability status (e.g. 'inactive', 'on_leave'). */
  status?: string;
  userId: number;
  fullName: string;
  depositId?: number | null;
  deposit?: {
    depositId: number;
    depositName?: string | null;
  } | null;
  routeSortValue?: number | null;
  /** Preferência de Sort (vendor); não confundir com route_sort do registo diário. */
  isSort?: boolean;
  isLate?: boolean;
  dhlTraining?: number | null;
  /** userTypeId 2 = vendor/user (subcontratado). Usado para filtrar lista em New Adhoc / New Route. */
  userTypeId?: number | null;
  cargoTrainingDate?: string;
  dangerousGoodsTrainingDate?: string;
  manualHandlingTrainingDate?: string;
  drivingLicenceExpiryDate?: string | null;
  dvlaCheckDate?: string | null;
  vendorTypeId?: number | null;
  costModelId?: number | null;
  routeId?: number | null;
  vehicleId?: number | null;
  /** costModelEmployees ligados ao vendor (GET /bff/vendor — cost_models). */
  costModels?: CostModelItem[];
  email?: string;
  vendorTypeDescription?: string;
  servicePartnerId?: number | null;
}

const toPositiveIntOrZero = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : 0;
};

const normalizeUserId = (raw: Record<string, unknown>): number => {
  const userId = toPositiveIntOrZero(raw.userId);

  if (userId > 0) {
    return userId;
  }

  // Fallback para compatibilidade com backend antigo que pode retornar userId
  return toPositiveIntOrZero(raw.userId);
};

export interface VendorsResponse {
  vendors: Vendor[];
}

export interface VendorCostModel {
  vendorCostModelId: number;
  createdBy?: number | string;
  createdAt?: string;
  updatedAt?: string;
  modelEmployeesId?: number;
  modelAdhocEmployeesId?: number;
  userId: number;
}

/**
 * Busca todos os vendors (anteriormente vendors)
 * @param filters - Filtros opcionais (active, valid, status)
 * @returns Promise com array de vendors no formato normalizado
 */
export const fetchVendors = async (
  filters: VendorFilters = { active: true }
): Promise<Vendor[]> => {
  try {
    const data = await api.get<Record<string, unknown> | Record<string, unknown>[]>("/bff/vendors", { params: filters as Record<string, string | number | boolean | undefined> });

    let vendors: Array<Record<string, unknown>> = [];
    if (!Array.isArray(data) && data.vendors && Array.isArray(data.vendors)) {
      vendors = data.vendors as Array<Record<string, unknown>>;
    } else if (Array.isArray(data)) {
      vendors = data;
    }

    return vendors.map((d) => {
      const userId = normalizeUserId(d as Record<string, unknown>);
      return {
        ...d,
        fullName: d.fullName || `${d.name || ""} ${d.lastName || ""}`.trim() || d.fullName || "Unknown Vendor",
        userId: userId,
      };
    }) as Vendor[];
  } catch (error) {
    console.error("Error fetching vendors:", error);
    throw error;
  }
};

/**
 * Busca todos os vendors ativos via /bff/vendor endpoint
 */
export const fetchAllActiveVendors = async (): Promise<Vendor[]> => {
  try {
    const data = await api.get<Record<string, unknown> | Record<string, unknown>[]>("/bff/vendor", { params: { active: true } });

    let vendors: Array<Record<string, unknown>> = [];
    if (!Array.isArray(data) && data.vendors && Array.isArray(data.vendors)) {
      vendors = data.vendors as Array<Record<string, unknown>>;
    } else if (Array.isArray(data)) {
      vendors = data;
    }

    return vendors.map((d) => {
      const userId = normalizeUserId(d as Record<string, unknown>);
      return {
        ...d,
        fullName: d.fullName || `${d.name || ""} ${d.lastName || ""}`.trim() || d.fullName || "Unknown Vendor",
        userId: userId,
      };
    }) as Vendor[];
  } catch (error) {
    console.error("Error fetching all active vendors:", error);
    throw error;
  }
};

/**
 * Busca vendors por depósito
 */
export const fetchVendorsByDeposit = async (depositId: number): Promise<Vendor[]> => {
  if (!Number.isFinite(Number(depositId)) || Number(depositId) <= 0) {
    return [];
  }

  try {
    const data = await api.get<Record<string, unknown> | Record<string, unknown>[]>(`/bff/vendors/by-deposit/${encodeURIComponent(String(depositId))}`);

    let vendors: Array<Record<string, unknown>> = [];
    if (!Array.isArray(data) && data.vendors && Array.isArray(data.vendors)) {
      vendors = data.vendors as Array<Record<string, unknown>>;
    } else if (Array.isArray(data)) {
      vendors = data;
    }

    return vendors.map((d) => {
      const userId = normalizeUserId(d as Record<string, unknown>);
      return {
        ...d,
        fullName: d.fullName || `${d.name || ""} ${d.lastName || ""}`.trim() || d.fullName || "Unknown Vendor",
        userId: userId,
      };
    }) as Vendor[];
  } catch (error) {
    console.error("Error fetching vendors by deposit:", error);
    throw error;
  }
};

/**
 * Interface para VendorDTO da API /bff/vendors
 */
export interface VendorDTO {
  vendorId: number;
  supplierId?: string;
  depot?: string;
  userId: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  vendorType?: string;
  userType?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  startDate: string;
  finishDate?: string;
  routeId?: number;
  vehicleId?: number;
  // Cost Model - VSR
  vsrBand1Stops?: number;
  vsrBand1Rate?: string;
  vsrBand2Stops?: number;
  vsrBand2Rate?: string;
  vsrBand3Stops?: number;
  vsrBand3Rate?: string;
  // Cost Model - FSR
  fsrStopRate?: string;
  // Cost Model - DR
  drDayRate?: string;
  // Cost Model - DAF
  dafBand1Stops?: number;
  dafBand1Rate?: string;
  dafBand2Stops?: number;
  dafBand2Rate?: string;
  dafRouteSort?: string;
  // Payment
  paymentModel?: string;
  paymentValue?: string;
  // Training
  cargoTraining: boolean;
  dangerousGoodsTraining: boolean;
  manualHandlingTraining: boolean;
  cargoTrainingDate?: string;
  dangerousGoodsTrainingDate?: string;
  manualHandlingTrainingDate?: string;
  trainingMatrix?: string;
  dhlTrainingNumber?: string;
  // Compliance
  criminalRecordDate?: string;
  dvlaCheckDate?: string;
  immigrationStatus?: string;
  visaValidity?: string;
  licenceExpiringDate?: string;
  passportExpiringDate?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface para NewUserByAdminDTO da API GET /vendor
 */
interface NewUserByAdminDTO {
  userId: number;
  userCode?: string;
  depositId?: number;
  name: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  vendorTypeId?: number;
  userTypeId?: number;
  vatNumber?: string;
  companyId: number;
  servicePartnerId?: number | null;
  street?: string;
  city?: string;
  postalCode?: string;
  mainAddress?: boolean;
  startDate?: string;
  endDate?: string;
  active?: boolean;
  routeId?: number;
  vehicleId?: number;
  routeSortValue?: number;
  isSort?: boolean;
  isLate?: boolean;
  costModelId?: number;
  dhlTraining?: number;
  criminalRecordDate?: string;
  visaValidity?: string;
  dvlaCheckDate?: string;
  drivingLicenceExpiryDate?: string;
  imigrationStatus?: string;
  passportExpireDate?: string;
  isFirstLogin?: boolean;
  costModels?: unknown[];
  training?: Array<{
    vendorTrainingId?: number;
    trainingId: number;
    completedDate?: string;
    userId?: number;
  }>;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Parâmetros de filtro para busca de vendors
 */
export interface VendorFilters {
  active?: boolean;
  valid?: boolean;
  status?: string;
  allUserTypes?: boolean;
  servicePartnerId?: number;
}

/**
 * Busca vendors da API GET /vendor
 * Mapeia NewUserByAdminDTO para o formato Vendor
 * @param filters - Filtros opcionais para aplicar no backend
 * @returns Promise com array de vendors no formato normalizado
 */
export const fetchVendorsFromUsers = async (
  filters: VendorFilters = {}
): Promise<Vendor[]> => {
  try {
    const data = await api.get<NewUserByAdminDTO[] | Record<string, unknown>>("/bff/vendor", { params: filters as Record<string, string | number | boolean | undefined> });

    // Tratar diferentes formatos de resposta
    let vendorsArray: NewUserByAdminDTO[] = [];

    if (Array.isArray(data)) {
      vendorsArray = data;
    } else if (data && typeof data === "object") {
      if ("data" in data && Array.isArray(data.data)) {
        vendorsArray = data.data as NewUserByAdminDTO[];
      } else if ("result" in data && Array.isArray(data.result)) {
        vendorsArray = data.result as NewUserByAdminDTO[];
      } else if ("vendors" in data && Array.isArray(data.vendors)) {
        vendorsArray = data.vendors as NewUserByAdminDTO[];
      } else if ("users" in data && Array.isArray(data.users)) {
        vendorsArray = data.users as NewUserByAdminDTO[];
      } else if ("items" in data && Array.isArray(data.items)) {
        vendorsArray = data.items as NewUserByAdminDTO[];
      } else {
        vendorsArray = [data as unknown as NewUserByAdminDTO];
      }
    }

    return vendorsArray
      .filter((vendor) => vendor && vendor.userId > 0)
      .map((vendor) => {
        const userId = normalizeUserId(vendor as unknown as Record<string, unknown>);
        return {
          userId: userId,
          fullName: vendor.fullName || `${vendor.name || ""} ${vendor.lastName || ""}`.trim() || "Unknown Vendor",
          depositId: vendor.depositId != null ? Number(vendor.depositId) : null,
          userTypeId: vendor.userTypeId != null ? Number(vendor.userTypeId) : null,
          routeSortValue: vendor.routeSortValue != null ? Number(vendor.routeSortValue) : null,
          isSort: vendor.isSort,
          isLate: vendor.isLate,
          dhlTraining: vendor.dhlTraining != null ? Number(vendor.dhlTraining) : null,
          drivingLicenceExpiryDate: vendor.drivingLicenceExpiryDate || null,
          dvlaCheckDate: vendor.dvlaCheckDate || null,
          vendorTypeId: vendor.vendorTypeId != null ? Number(vendor.vendorTypeId) : null,
          costModelId: vendor.costModelId || null,
          routeId: vendor.routeId || null,
          vehicleId: vendor.vehicleId || null,
          costModels: vendor.costModels as CostModelItem[],
        };
      });
  } catch (error) {
    console.error("Error fetching vendors from users:", error);
    throw error;
  }
};

/**
 * Busca vendor_cost_model de um vendor específico
 * @param userId - ID do vendor/user
 * @returns Promise com o vendor_cost_model ou null se não encontrado
 */
export const fetchVendorCostModel = async (userId: number): Promise<VendorCostModel | null> => {
  try {
    const data = await api.get<VendorCostModel>(`/bff/vendors/${userId}/vendor-cost-model`);

    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      return null;
    }

    return {
      ...data,
      vendorCostModelId: Number(data.vendorCostModelId ?? 0),
      userId: Number(data.userId ?? userId),
    };
  } catch (error) {
    console.error("Error fetching vendor cost model:", error);
    // Se não encontrou, retorna null em vez de lançar erro
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    throw error;
  }
};


