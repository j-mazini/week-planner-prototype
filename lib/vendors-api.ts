import { getApiBaseUrl } from "@/lib/apiBaseUrl";
﻿import { getFullNameFromToken, hasAuthSession, getBearerAuthHeader } from "./auth";
import { guardedFetch } from "@/lib/in-flight-guard";

const API_BASE_URL = getApiBaseUrl();

/**
 * Formata data para yyyy-mm-dd (formato esperado pelo input type="date")
 */
const formatDateForInput = (dateString: string | undefined | null): string | undefined => {
  if (!dateString) return undefined;
  try {
    // Se já está no formato yyyy-mm-dd, retorna direto
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // Se está no formato dd/mm/yyyy, converte para yyyy-mm-dd
    const ddmmMatch = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (ddmmMatch) {
      const [, day, month, year] = ddmmMatch;
      return `${year}-${month}-${day}`;
    }
    // Se tem hora, pega apenas a parte da data
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return undefined;
  }
};

/**
 * Business rule for costModelId=1 (DAF):
 * - first band in each group -> fixedPrice
 * - second (and next) band(s) -> pricePerStop
 */
const normalizeCostModel1Bands = (items: CostModelItem[]): CostModelItem[] => {
  const normalized = items.map((item) => ({ ...item }));

  const grouped = new Map<string, number[]>();
  normalized.forEach((item, index) => {
    if (Number(item.costModelId) !== 1) return;
    const isElectricKey = item.isElectric === true ? "1" : "0";
    const startDateKey = item.validityStartDate ?? "";
    const groupKey = `${isElectricKey}|${startDateKey}`;
    const list = grouped.get(groupKey) ?? [];
    list.push(index);
    grouped.set(groupKey, list);
  });

  grouped.forEach((indices) => {
    const sorted = [...indices].sort((a, b) => {
      const minA = normalized[a].minStops ?? 1;
      const minB = normalized[b].minStops ?? 1;
      return minA - minB;
    });

    sorted.forEach((idx, order) => {
      const item = normalized[idx];
      if (order === 0) {
        if (item.fixedPrice === undefined && item.pricePerStop !== undefined) {
          item.fixedPrice = item.pricePerStop;
        }
        item.pricePerStop = undefined;
      } else {
        if (item.pricePerStop === undefined && item.fixedPrice !== undefined) {
          item.pricePerStop = item.fixedPrice;
        }
        item.fixedPrice = undefined;
      }
    });
  });

  return normalized;
};

// --- Interfaces para os selects ---
export interface Deposit {
  depositId: number;
  depositName: string;
  description?: string;
  createdBy?: string | number;
  createdAt?: string;
  updatedAt?: string;
  customerId?: number;
  isPhysical?: boolean;
  servicePartnerId?: number | string;
}

// Payload para criação de depósito
export interface CreateDepositInput {
  depositName: string;
  description?: string;
  customerId?: number;
  createdBy?: string | number;
}

export interface VendorType {
  vendorTypeId?: number;
  nameType?: string;
  active?: boolean;
}

export interface UserType {
  userTypeId: number;
  nameType: string;
}

export interface Route {
  routeId?: number;
  routeName?: string;
  active?: boolean;
}

export interface Vehicle {
  vehicleId?: number;
  registrationPlates?: string;
  manufacturer?: string;
  model?: string;
  active?: boolean;
}

export interface CostModel {
  costModelId?: number;
  name?: string;
  active?: boolean;
}

export interface ServicePartner {
  servicePartnerId: number;
  partnerName: string;
  companyId: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: number;
  userId?: number;
  servicePartnerId?: number | null;
  costModels?: CostModelItem[];
  supplierId?: string;
  depot?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dob?: string;
  vendorType: string;
  userType?: string;
  vat?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  startDate: string;
  finishDate?: string;
  routeIdLink?: string;
  routeSortValue?: string;
  vehicleRegLink?: string;
  vsrBand1Stops?: string;
  vsrBand1Rate?: string;
  vsrBand2Stops?: string;
  vsrBand2Rate?: string;
  vsrValidityStartDate?: string;
  vsrValidityEndDate?: string;
  // SP_VSR (costModelId = 12) — 4 bandas, sem variante elétrica
  spVsrBand1Stops?: string;
  spVsrBand1Rate?: string;
  spVsrBand2Stops?: string;
  spVsrBand2Rate?: string;
  spVsrBand3Stops?: string;
  spVsrBand3Rate?: string;
  spVsrBand4Stops?: string;
  spVsrBand4Rate?: string;
  spVsrValidityStartDate?: string;
  spVsrValidityEndDate?: string;
  // SP_VSR Eletric (costModelId = 12, isElectric = true) — 4 bandas
  spVsrEletricBand1Stops?: string;
  spVsrEletricBand1Rate?: string;
  spVsrEletricBand2Stops?: string;
  spVsrEletricBand2Rate?: string;
  spVsrEletricBand3Stops?: string;
  spVsrEletricBand3Rate?: string;
  spVsrEletricBand4Stops?: string;
  spVsrEletricBand4Rate?: string;
  spVsrEletricValidityStartDate?: string;
  spVsrEletricValidityEndDate?: string;
  vsrEletricBand1Stops?: string;
  vsrEletricBand1Rate?: string;
  vsrEletricBand2Stops?: string;
  vsrEletricBand2Rate?: string;
  vsrEletricValidityStartDate?: string;
  vsrEletricValidityEndDate?: string;
  fsrStopRate?: string;
  fsrValidityStartDate?: string;
  fsrValidityEndDate?: string;
  fsrEletricStopRate?: string;
  fsrEletricValidityStartDate?: string;
  fsrEletricValidityEndDate?: string;
  drDayRate?: string;
  drValidityStartDate?: string;
  drValidityEndDate?: string;
  drEletricDayRate?: string;
  drEletricValidityStartDate?: string;
  drEletricValidityEndDate?: string;
  hourlyRate?: string;
  hourlyValidityStartDate?: string;
  hourlyValidityEndDate?: string;
  hourlyEletricRate?: string;
  hourlyEletricValidityStartDate?: string;
  hourlyEletricValidityEndDate?: string;
  dafBand1Stops?: string;
  dafBand1Rate?: string;
  dafBand2Stops?: string;
  dafBand2Rate?: string;
  dafValidityStartDate?: string;
  dafValidityEndDate?: string;
  dafEletricBand1Stops?: string;
  dafEletricBand1Rate?: string;
  dafEletricBand2Stops?: string;
  dafEletricBand2Rate?: string;
  dafEletricValidityStartDate?: string;
  dafEletricValidityEndDate?: string;
  paymentModel?: string;
  cargoTraining: boolean;
  dangerousGoodsTraining: boolean;
  manualHandlingTraining: boolean;
  cargoTrainingDate?: string;
  dangerousGoodsTrainingDate?: string;
  manualHandlingTrainingDate?: string;
  dhlTrainingNumber?: string;
  criminalRecordDate?: string;
  dvlaCheckDate?: string;
  immigrationStatus?: 'Citizen' | 'Pre-Settlement' | 'Settlement' | 'Visa';
  visaValidity?: string;
  licenceExpiringDate?: string;
  passportExpiringDate?: string;
  status?: 'Active' | 'Inactive';
  // Cost models originais do backend para agrupamento e seleção
  originalCostModels?: CostModelItem[];
  // Novos cost models para adicionar via PATCH (apenas em modo edit)
  newVsrBand1Stops?: string;
  newVsrBand1Rate?: string;
  newVsrBand2Stops?: string;
  newVsrBand2Rate?: string;
  newVsrValidityStartDate?: string;
  newVsrValidityEndDate?: string;
  newVsrEletricBand1Stops?: string;
  newVsrEletricBand1Rate?: string;
  newVsrEletricBand2Stops?: string;
  newVsrEletricBand2Rate?: string;
  newVsrEletricValidityStartDate?: string;
  newVsrEletricValidityEndDate?: string;
  // SP_VSR new bands (para adicionar novo período de vigência em modo edit)
  newSpVsrBand1Stops?: string;
  newSpVsrBand1Rate?: string;
  newSpVsrBand2Stops?: string;
  newSpVsrBand2Rate?: string;
  newSpVsrBand3Stops?: string;
  newSpVsrBand3Rate?: string;
  newSpVsrBand4Stops?: string;
  newSpVsrBand4Rate?: string;
  newSpVsrValidityStartDate?: string;
  newSpVsrValidityEndDate?: string;
  // SP_VSR Eletric new bands (para adicionar novo período de vigência em modo edit)
  newSpVsrEletricBand1Stops?: string;
  newSpVsrEletricBand1Rate?: string;
  newSpVsrEletricBand2Stops?: string;
  newSpVsrEletricBand2Rate?: string;
  newSpVsrEletricBand3Stops?: string;
  newSpVsrEletricBand3Rate?: string;
  newSpVsrEletricBand4Stops?: string;
  newSpVsrEletricBand4Rate?: string;
  newSpVsrEletricValidityStartDate?: string;
  newSpVsrEletricValidityEndDate?: string;
  newFsrStopRate?: string;
  newFsrValidityStartDate?: string;
  newFsrValidityEndDate?: string;
  newFsrEletricStopRate?: string;
  newFsrEletricValidityStartDate?: string;
  newFsrEletricValidityEndDate?: string;
  newDrDayRate?: string;
  newDrValidityStartDate?: string;
  newDrValidityEndDate?: string;
  newDrEletricDayRate?: string;
  newDrEletricValidityStartDate?: string;
  newDrEletricValidityEndDate?: string;
  newHourlyEletricRate?: string;
  newHourlyEletricValidityStartDate?: string;
  newHourlyEletricValidityEndDate?: string;
  newDafBand1Stops?: string;
  newDafBand1Rate?: string;
  newDafBand2Stops?: string;
  newDafBand2Rate?: string;
  newDafValidityStartDate?: string;
  newDafValidityEndDate?: string;
  newDafEletricBand1Stops?: string;
  newDafEletricBand1Rate?: string;
  newDafEletricBand2Stops?: string;
  newDafEletricBand2Rate?: string;
  newDafEletricValidityStartDate?: string;
  newDafEletricValidityEndDate?: string;
}

// Interfaces para dados do backend
export interface CostModelItem {
  modelEmployeesId?: number;
  costModelId: number;
  pricePerStop?: number;
  minStops?: number;
  maxStops?: number;
  fixedPrice?: number;
  validityStartDate?: string;
  validityEndDate?: string;
  isElectric?: boolean;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  userId?: number;
  vendorCostModelId?: number;
  createdBy?: string | number;
}

/**
 * Busca cost_model_employee (cost-model-employees) de um vendor/user
 * Usado para obter valores default (ex.: fixedPrice / pricePerStop) por costModelId.
 * @param userId - ID do vendor/user (formerly userId)
 */
export const fetchCostModelEmployeesByUserId = async (userId: number): Promise<CostModelItem[]> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    if (!userId || userId <= 0) {
      throw new Error("Invalid userId");
    }

    const response = await guardedFetch(`${API_BASE_URL}/bff/cost-model-employees/user/${userId}`, {
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
      throw new Error(errorData.message || `Failed to fetch cost model employees: ${response.statusText}`);
    }

    const data = await response.json().catch(() => null);

    const dataObj = data as Record<string, unknown> | null;
    const rawArray: Array<Record<string, unknown>> =
      Array.isArray(data)
        ? (data as Array<Record<string, unknown>>)
        : dataObj && typeof dataObj === "object" && "data" in dataObj && Array.isArray(dataObj.data)
          ? (dataObj.data as Array<Record<string, unknown>>)
          : dataObj && typeof dataObj === "object" && "result" in dataObj && Array.isArray(dataObj.result)
            ? (dataObj.result as Array<Record<string, unknown>>)
            : [];

    const toNumber = (v: unknown): number | undefined => {
      if (v === null || v === undefined || v === "") return undefined;
      const n = typeof v === "number" ? v : parseFloat(String(v));
      return Number.isFinite(n) ? n : undefined;
    };

    const normalize = (raw: Record<string, unknown>): CostModelItem => ({
      modelEmployeesId: toNumber(raw.modelEmployeesId) as number | undefined,
      costModelId: (toNumber(raw.costModelId) ?? 0) as number,
      pricePerStop: toNumber(raw.pricePerStop),
      minStops: toNumber(raw.minStops),
      maxStops: toNumber(raw.maxStops),
      fixedPrice: toNumber(raw.fixedPrice),
      validityStartDate: raw.validityStartDate as string | undefined,
      validityEndDate: raw.validityEndDate as string | undefined,
      isElectric: raw.isElectric as boolean | undefined,
      createdAt: raw.createdAt as string | undefined,
      updatedAt: raw.updatedAt as string | undefined,
      description: raw.description as string | undefined,
      userId: toNumber(raw.userId) ?? toNumber(raw.userId),
      vendorCostModelId: toNumber(raw.vendorCostModelId),
      createdBy: raw.createdBy as string | undefined,
    });

    return rawArray
      .map(normalize)
      .filter((x) => typeof x.costModelId === "number" && x.costModelId > 0);
  } catch (error) {
    console.error("Error fetching cost model employees by user:", error);
    throw error;
  }
};


export interface TrainingItem {
  vendorTrainingId?: number;
  trainingId: number;
  completedDate?: string;
  userId?: number;
}

export interface VendorTrainingDocumentDTO {
  vendorTrainingId: number;
  trainingId: number | null;
  trainingName: string | null;
  completedDate: string | null;
}

export interface VendorDocumentsDTO {
  userId: number;
  fullName: string | null;
  documents: {
    drivingLicenceExpiryDate: string | null;
    dvlaCheckDate: string | null;
    criminalRecordDate: string | null;
    visaValidity: string | null;
    passportExpireDate: string | null;
    immigrationStatus: string | null;
  };
  training: {
    dhlTraining: boolean | null;
    vendorTrainings: VendorTrainingDocumentDTO[];
  };
}

// Interfaces para NewUserByAdminDTO conforme especificação da API
export interface NewUserByAdminCreateDTO {
  userCode?: string;
  depositId?: number;
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string; // Default: LogixSphere#2024
  dateOfBirth?: string;
  vendorTypeId?: number;
  userTypeId?: number;
  servicePartnerId?: number;
  vatNumber?: string;
  companyId?: number; // Extraído automaticamente do JWT pelo backend — não enviar do frontend
  street?: string;
  city?: string;
  postalCode?: string;
  mainAddress?: boolean; // Default: true
  startDate?: string;
  endDate?: string;
  active?: boolean; // Default: true
  routeId?: number;
  vehicleId?: number;
  costModels?: CostModelItem[];
  routeSortValue?: number;
  costModelId?: number;
  training?: TrainingItem[];
  dhlTraining?: number;
  criminalRecordDate?: string;
  visaValidity?: string;
  dvlaCheckDate?: string;
  drivingLicenceExpiryDate?: string;
  immigrationStatus?: string;
  passportExpireDate?: string;
  isFirstLogin?: boolean; // Default: true
  createdBy: string | number;
}

export interface NewUserByAdminUpdateDTO {
  userId?: number;
  userCode?: string;
  depositId?: number;
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  dateOfBirth?: string;
  vendorTypeId?: number;
  userTypeId?: number;
  servicePartnerId?: number;
  vatNumber?: string;
  companyId?: number;
  street?: string;
  city?: string;
  postalCode?: string;
  mainAddress?: boolean;
  startDate?: string;
  endDate?: string;
  active?: boolean;
  routeId?: number;
  vehicleId?: number;
  costModels?: CostModelItem[];
  newCostModels?: CostModelItem[];
  routeSortValue?: number;
  costModelId?: number;
  training?: TrainingItem[];
  dhlTraining?: number;
  criminalRecordDate?: string;
  visaValidity?: string;
  dvlaCheckDate?: string;
  drivingLicenceExpiryDate?: string;
  immigrationStatus?: string;
  passportExpireDate?: string;
  isFirstLogin?: boolean;
}

// CostModelEmployeeDTO e VendorTrainingDTO são compatíveis com CostModelItem e TrainingItem
// Usar aliases para manter compatibilidade
export type CostModelEmployeeDTO = CostModelItem;
export type VendorTrainingDTO = TrainingItem;

export interface NewUserByAdminDTO {
  userCode?: string;
  depositId?: number;
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  vendorTypeId?: number;
  userTypeId?: number;
  vatNumber?: string;
  companyId?: number;
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
  immigrationStatus?: string;
  passportExpireDate?: string;
  isFirstLogin?: boolean;
  userId?: number;
  costModels?: CostModelEmployeeDTO[];
  training?: VendorTrainingDTO[];
  createdBy?: string | number;
  createdAt?: string;
  updatedAt?: string;
}


// BackendVendorResponse baseado em NewUserByAdminDTO com campos adicionais do backend
type BackendVendorResponse = Partial<NewUserByAdminDTO> & {
  id?: number;
  depotId?: number;
  costModels?: CostModelItem[];
  routeSortValue?: number | string;
  training?: TrainingItem[];
  immigrationStatus?: 'Citizen' | 'Pre-Settlement' | 'Settlement' | 'Visa';
  servicePartnerId?: number | null;
};

// Interface unificada para Create e Update - combina os dois DTOs
type BackendCreateUpdateDTO = Partial<NewUserByAdminCreateDTO & NewUserByAdminUpdateDTO> & {
  // Campos que podem ser obrigatórios no create
  name?: string;
  lastName?: string;
  email?: string;
  createdBy?: string | number;
};

type CleanableValue = string | number | boolean | null | undefined | CleanableValue[] | { [key: string]: CleanableValue };

/**
 * Função auxiliar para limpar valores inválidos antes de enviar ao backend
 */
const cleanValue = (value: CleanableValue, key?: string): CleanableValue => {
  // Remover undefined e null
  if (value === undefined || value === null) return undefined;

  // Se for array, limpar cada item
  if (Array.isArray(value)) {
    const cleaned = value.map(item => cleanValue(item)).filter(item => item !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }

  // Se for objeto, limpar recursivamente
  if (typeof value === 'object' && value !== null) {
    const cleaned: Record<string, CleanableValue> = {};
    for (const [k, v] of Object.entries(value)) {
      const cleanedVal = cleanValue(v, k);
      if (cleanedVal !== undefined) {
        cleaned[k] = cleanedVal;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  // Remover strings "false" ou "true" que podem ser enviadas incorretamente
  if (value === 'false' || value === 'true' || value === false || value === true) {
    // Se for dhlTraining, manter como número (não converter boolean)
    if (key && key.includes('dhlTraining')) {
      return undefined;
    }
    // Se for active, garantir que seja boolean
    if (key && key.includes('active')) {
      return value === 'true' || value === true;
    }
    // Se for isElectric, manter o valor boolean
    if (key && key.includes('isElectric')) {
      return value === 'true' || value === true;
    }
    // Para TODOS os outros campos (incluindo numéricos), retornar undefined
    return undefined;
  }

  // Se for boolean false, remover (exceto para campos boolean específicos)
  if (typeof value === 'boolean' && value === false && key && !key.includes('active') && !key.includes('dhlTraining') && !key.includes('isElectric')) {
    return undefined;
  }

  // Se for boolean true, manter se for isElectric
  if (typeof value === 'boolean' && value === true && key && key.includes('isElectric')) {
    return true;
  }

  // Se for dhlTraining e for número, manter o valor numérico
  if (key && key.includes('dhlTraining') && typeof value === 'number') {
    return value;
  }

  // Se for string vazia, retornar undefined
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }

  // Se for um número válido como string, converter para number
  if (typeof value === 'string' && key && (key.includes('Id') || key.includes('Stops') || key.includes('Rate') || key.includes('Price') || key.includes('sort'))) {
    // Se for "false" ou "true", retornar undefined
    if (value === 'false' || value === 'true') {
      return undefined;
    }
    const num = Number(value);
    if (!isNaN(num) && isFinite(num)) {
      return num;
    }
    return undefined;
  }

  // Se for boolean false em campo numérico, retornar undefined
  if (typeof value === 'boolean' && value === false && key && (key.includes('Id') || key.includes('Stops') || key.includes('Rate') || key.includes('Price') || key.includes('sort'))) {
    return undefined;
  }

  return value;
};

/**
 * Mapeia dados do backend (NewUserByAdminDTO) para o formato Vendor do frontend
 */
const mapBackendToFrontend = (backend: BackendVendorResponse): Vendor => {
  // Extrair dados dos costModels (array de CostModelItem)
  const costModelsArray = Array.isArray(backend.costModels) ? backend.costModels : [];

  // Buscar pelos costModelId e isElectric
  // VSR items (costModelId = 4) - não elétrico
  const vsrItems = costModelsArray.filter((cm: CostModelItem) =>
    cm.costModelId === 4 && (cm.isElectric === null || cm.isElectric === false)
  );
  const vsrFirstBand = vsrItems.find((cm: CostModelItem) => Number(cm.minStops ?? 1) <= 1) || vsrItems[0] || null;
  const vsrSecondBand = vsrItems.find((cm: CostModelItem) => Number(cm.minStops ?? 0) > 1) || vsrItems[1] || null;

  // VSR items (costModelId = 4) - elétrico
  const vsrEletricItems = costModelsArray.filter((cm: CostModelItem) =>
    cm.costModelId === 4 && cm.isElectric === true
  );
  const vsrEletricFirstBand = vsrEletricItems.find((cm: CostModelItem) => Number(cm.minStops ?? 1) <= 1) || vsrEletricItems[0] || null;
  const vsrEletricSecondBand = vsrEletricItems.find((cm: CostModelItem) => Number(cm.minStops ?? 0) > 1) || vsrEletricItems[1] || null;

  // FSR (costModelId = 3) - não elétrico
  const fsrModel = costModelsArray.find((cm: CostModelItem) =>
    cm.costModelId === 3 && (cm.isElectric === null || cm.isElectric === false)
  ) || null;

  // FSR Eletric (costModelId = 3) - elétrico
  const fsrEletricModel = costModelsArray.find((cm: CostModelItem) =>
    cm.costModelId === 3 && cm.isElectric === true
  ) || null;

  // DR (costModelId = 2) - não elétrico
  const drModel = costModelsArray.find((cm: CostModelItem) =>
    cm.costModelId === 2 && (cm.isElectric === null || cm.isElectric === false)
  ) || null;

  // DR Eletric (costModelId = 2) - elétrico
  const drEletricModel = costModelsArray.find((cm: CostModelItem) =>
    cm.costModelId === 2 && cm.isElectric === true
  ) || null;

  // Hourly (costModelId = 7)
  const hourlyModel = costModelsArray.find((cm: CostModelItem) => cm.costModelId === 7 && (cm.isElectric === null || cm.isElectric === false)) || null;

  // Hourly Eletric (costModelId = 7) - elétrico
  const hourlyEletricModel = costModelsArray.find((cm: CostModelItem) =>
    cm.costModelId === 7 && cm.isElectric === true
  ) || null;

  // SP_VSR items (costModelId = 12) - não elétrico
  const spVsrItems = costModelsArray
    .filter((cm: CostModelItem) => cm.costModelId === 12 && (cm.isElectric === null || cm.isElectric === false))
    .sort((a: CostModelItem, b: CostModelItem) => (a.minStops ?? 0) - (b.minStops ?? 0));
  const spVsrBand1 = spVsrItems[0] || null;
  const spVsrBand2 = spVsrItems[1] || null;
  const spVsrBand3 = spVsrItems[2] || null;
  const spVsrBand4 = spVsrItems[3] || null;

  // SP_VSR Eletric items (costModelId = 12, isElectric = true)
  const spVsrEletricItems = costModelsArray
    .filter((cm: CostModelItem) => cm.costModelId === 12 && cm.isElectric === true)
    .sort((a: CostModelItem, b: CostModelItem) => (a.minStops ?? 0) - (b.minStops ?? 0));
  const spVsrEletricBand1 = spVsrEletricItems[0] || null;
  const spVsrEletricBand2 = spVsrEletricItems[1] || null;
  const spVsrEletricBand3 = spVsrEletricItems[2] || null;
  const spVsrEletricBand4 = spVsrEletricItems[3] || null;

  // DAF items (costModelId = 1) - não elétrico
  const dafItems = costModelsArray.filter((cm: CostModelItem) =>
    cm.costModelId === 1 && (cm.isElectric === null || cm.isElectric === false)
  );
  const dafFirstBand = dafItems.find((cm: CostModelItem) => Number(cm.minStops ?? 1) <= 1) || dafItems[0] || null;
  const dafSecondBand = dafItems.find((cm: CostModelItem) => Number(cm.minStops ?? 0) > 1) || dafItems[1] || null;

  // DAF items (costModelId = 1) - elétrico
  const dafEletricItems = costModelsArray.filter((cm: CostModelItem) =>
    cm.costModelId === 1 && cm.isElectric === true
  );
  const dafEletricFirstBand = dafEletricItems.find((cm: CostModelItem) => Number(cm.minStops ?? 1) <= 1) || dafEletricItems[0] || null;
  const dafEletricSecondBand = dafEletricItems.find((cm: CostModelItem) => Number(cm.minStops ?? 0) > 1) || dafEletricItems[1] || null;

  // Extrair dados de training (array de TrainingItem)
  const training: TrainingItem[] = Array.isArray(backend.training) ? backend.training : [];
  const cargoTraining = training.find((t: TrainingItem) =>
    t.trainingId === 1 // Cargo Operative training
  );
  const dangerousGoodsTraining = training.find((t: TrainingItem) =>
    t.trainingId === 2 // Dangerous Goods Awareness training
  );
  const manualHandlingTraining = training.find((t: TrainingItem) =>
    t.trainingId === 3 // Manual Handling Training
  );

  return {
    id: backend.userId ?? backend.id ?? 0,
    userId: backend.userId,
    supplierId: backend.userCode ?? '',
    depot: backend.depositId !== undefined && backend.depositId !== null ? String(backend.depositId) : (backend.depotId !== undefined && backend.depotId !== null ? String(backend.depotId) : undefined),
    firstName: backend.name ?? '',
    lastName: backend.lastName ?? '',
    email: backend.email || '',
    phone: backend.phone,
    dob: backend.dateOfBirth ? formatDateForInput(backend.dateOfBirth) : undefined,
    vendorType: backend.vendorTypeId ? String(backend.vendorTypeId) : (backend.vendorTypeId ? String(backend.vendorTypeId) : ''),
    userType: backend.userTypeId ? String(backend.userTypeId) : undefined,
    vat: backend.vatNumber,
    street: backend.street,
    city: backend.city,
    postalCode: backend.postalCode,
    startDate: backend.startDate ? (formatDateForInput(backend.startDate) || '') : '',
    finishDate: backend.endDate ? formatDateForInput(backend.endDate) : undefined,
    routeIdLink: backend.routeId ? String(backend.routeId) : undefined,
    routeSortValue: backend.routeSortValue !== undefined && backend.routeSortValue !== null ? String(backend.routeSortValue) : undefined,
    vehicleRegLink: backend.vehicleId ? String(backend.vehicleId) : undefined,
    // VSR First Band (Band 1 do formulário)
    // Exibir maxStops no campo Band 1 Max Stops
    vsrBand1Stops: vsrFirstBand?.maxStops ? String(vsrFirstBand.maxStops) : undefined,
    vsrBand1Rate: vsrFirstBand?.pricePerStop ? String(vsrFirstBand.pricePerStop) : undefined,
    // VSR Second Band (Band 2 do formulário)
    // Exibir maxStops no campo Band 2 Max Stops
    vsrBand2Stops: vsrSecondBand?.maxStops ? String(vsrSecondBand.maxStops) : undefined,
    vsrBand2Rate: vsrSecondBand?.pricePerStop ? String(vsrSecondBand.pricePerStop) : undefined,
    // VSR Validity Dates (pegar do primeiro band que tiver)
    vsrValidityStartDate: vsrFirstBand?.validityStartDate ? formatDateForInput(vsrFirstBand.validityStartDate) : undefined,
    vsrValidityEndDate: vsrFirstBand?.validityEndDate ? formatDateForInput(vsrFirstBand.validityEndDate) : undefined,
    // VSR Eletric First Band - apenas se isElectric = true (já filtrado acima)
    // Exibir maxStops no campo Band 1 Max Stops
    vsrEletricBand1Stops: vsrEletricFirstBand?.maxStops ? String(vsrEletricFirstBand.maxStops) : undefined,
    vsrEletricBand1Rate: vsrEletricFirstBand?.pricePerStop ? String(vsrEletricFirstBand.pricePerStop) : undefined,
    // VSR Eletric Second Band - apenas se isElectric = true (já filtrado acima)
    // Exibir maxStops no campo Band 2 Max Stops
    vsrEletricBand2Stops: vsrEletricSecondBand?.maxStops ? String(vsrEletricSecondBand.maxStops) : undefined,
    vsrEletricBand2Rate: vsrEletricSecondBand?.pricePerStop ? String(vsrEletricSecondBand.pricePerStop) : undefined,
    // VSR Eletric Validity Dates
    vsrEletricValidityStartDate: vsrEletricFirstBand?.validityStartDate ? formatDateForInput(vsrEletricFirstBand.validityStartDate) : undefined,
    vsrEletricValidityEndDate: vsrEletricFirstBand?.validityEndDate ? formatDateForInput(vsrEletricFirstBand.validityEndDate) : undefined,
    // SP_VSR Bands 1-4 (costModelId = 12, não elétrico)
    spVsrBand1Stops: spVsrBand1?.maxStops ? String(spVsrBand1.maxStops) : undefined,
    spVsrBand1Rate: spVsrBand1?.pricePerStop ? String(spVsrBand1.pricePerStop) : undefined,
    spVsrBand2Stops: spVsrBand2?.maxStops ? String(spVsrBand2.maxStops) : undefined,
    spVsrBand2Rate: spVsrBand2?.pricePerStop ? String(spVsrBand2.pricePerStop) : undefined,
    spVsrBand3Stops: spVsrBand3?.maxStops ? String(spVsrBand3.maxStops) : undefined,
    spVsrBand3Rate: spVsrBand3?.pricePerStop ? String(spVsrBand3.pricePerStop) : undefined,
    spVsrBand4Stops: spVsrBand4?.maxStops ? String(spVsrBand4.maxStops) : undefined,
    spVsrBand4Rate: spVsrBand4?.pricePerStop ? String(spVsrBand4.pricePerStop) : undefined,
    // SP_VSR Validity Dates (pegar do primeiro band)
    spVsrValidityStartDate: spVsrBand1?.validityStartDate ? formatDateForInput(spVsrBand1.validityStartDate) : undefined,
    spVsrValidityEndDate: spVsrBand1?.validityEndDate ? formatDateForInput(spVsrBand1.validityEndDate) : undefined,
    // SP_VSR Eletric Bands 1-4 (costModelId = 12, isElectric = true)
    spVsrEletricBand1Stops: spVsrEletricBand1?.maxStops ? String(spVsrEletricBand1.maxStops) : undefined,
    spVsrEletricBand1Rate: spVsrEletricBand1?.pricePerStop ? String(spVsrEletricBand1.pricePerStop) : undefined,
    spVsrEletricBand2Stops: spVsrEletricBand2?.maxStops ? String(spVsrEletricBand2.maxStops) : undefined,
    spVsrEletricBand2Rate: spVsrEletricBand2?.pricePerStop ? String(spVsrEletricBand2.pricePerStop) : undefined,
    spVsrEletricBand3Stops: spVsrEletricBand3?.maxStops ? String(spVsrEletricBand3.maxStops) : undefined,
    spVsrEletricBand3Rate: spVsrEletricBand3?.pricePerStop ? String(spVsrEletricBand3.pricePerStop) : undefined,
    spVsrEletricBand4Stops: spVsrEletricBand4?.maxStops ? String(spVsrEletricBand4.maxStops) : undefined,
    spVsrEletricBand4Rate: spVsrEletricBand4?.pricePerStop ? String(spVsrEletricBand4.pricePerStop) : undefined,
    // SP_VSR Eletric Validity Dates (pegar do primeiro band)
    spVsrEletricValidityStartDate: spVsrEletricBand1?.validityStartDate ? formatDateForInput(spVsrEletricBand1.validityStartDate) : undefined,
    spVsrEletricValidityEndDate: spVsrEletricBand1?.validityEndDate ? formatDateForInput(spVsrEletricBand1.validityEndDate) : undefined,
    fsrStopRate: fsrModel?.fixedPrice ? String(fsrModel.fixedPrice) : (fsrModel?.pricePerStop ? String(fsrModel.pricePerStop) : undefined),
    fsrValidityStartDate: fsrModel?.validityStartDate ? formatDateForInput(fsrModel.validityStartDate) : undefined,
    fsrValidityEndDate: fsrModel?.validityEndDate ? formatDateForInput(fsrModel.validityEndDate) : undefined,
    fsrEletricStopRate: fsrEletricModel?.fixedPrice ? String(fsrEletricModel.fixedPrice) : (fsrEletricModel?.pricePerStop ? String(fsrEletricModel.pricePerStop) : undefined),
    fsrEletricValidityStartDate: fsrEletricModel?.validityStartDate ? formatDateForInput(fsrEletricModel.validityStartDate) : undefined,
    fsrEletricValidityEndDate: fsrEletricModel?.validityEndDate ? formatDateForInput(fsrEletricModel.validityEndDate) : undefined,
    drDayRate: drModel?.fixedPrice ? String(drModel.fixedPrice) : undefined,
    drValidityStartDate: drModel?.validityStartDate ? formatDateForInput(drModel.validityStartDate) : undefined,
    drValidityEndDate: drModel?.validityEndDate ? formatDateForInput(drModel.validityEndDate) : undefined,
    drEletricDayRate: drEletricModel?.fixedPrice ? String(drEletricModel.fixedPrice) : undefined,
    drEletricValidityStartDate: drEletricModel?.validityStartDate ? formatDateForInput(drEletricModel.validityStartDate) : undefined,
    drEletricValidityEndDate: drEletricModel?.validityEndDate ? formatDateForInput(drEletricModel.validityEndDate) : undefined,
    hourlyRate: hourlyModel?.pricePerStop != null ? String(hourlyModel.pricePerStop) : undefined,
    hourlyValidityStartDate: hourlyModel?.validityStartDate ? formatDateForInput(hourlyModel.validityStartDate) : undefined,
    hourlyValidityEndDate: hourlyModel?.validityEndDate ? formatDateForInput(hourlyModel.validityEndDate) : undefined,
    hourlyEletricRate: hourlyEletricModel?.pricePerStop != null ? String(hourlyEletricModel.pricePerStop) : undefined,
    hourlyEletricValidityStartDate: hourlyEletricModel?.validityStartDate ? formatDateForInput(hourlyEletricModel.validityStartDate) : undefined,
    hourlyEletricValidityEndDate: hourlyEletricModel?.validityEndDate ? formatDateForInput(hourlyEletricModel.validityEndDate) : undefined,
    // DAF First Band - Exibir maxStops no campo Band 1 Max Stops
    dafBand1Stops: dafFirstBand?.maxStops ? String(dafFirstBand.maxStops) : undefined,
    dafBand1Rate: dafFirstBand?.fixedPrice ? String(dafFirstBand.fixedPrice) : (dafFirstBand?.pricePerStop ? String(dafFirstBand.pricePerStop) : undefined),
    // DAF Second Band - Exibir maxStops no campo Band 2 Max Stops
    dafBand2Stops: dafSecondBand?.maxStops ? String(dafSecondBand.maxStops) : undefined,
    dafBand2Rate: dafSecondBand?.pricePerStop ? String(dafSecondBand.pricePerStop) : undefined,
    // DAF Validity Dates
    dafValidityStartDate: dafFirstBand?.validityStartDate ? formatDateForInput(dafFirstBand.validityStartDate) : undefined,
    dafValidityEndDate: dafFirstBand?.validityEndDate ? formatDateForInput(dafFirstBand.validityEndDate) : undefined,
    // DAF Eletric First Band - apenas se isElectric = true (já filtrado acima)
    // Exibir maxStops no campo Band 1 Max Stops
    dafEletricBand1Stops: dafEletricFirstBand?.maxStops ? String(dafEletricFirstBand.maxStops) : undefined,
    dafEletricBand1Rate: dafEletricFirstBand?.fixedPrice ? String(dafEletricFirstBand.fixedPrice) : (dafEletricFirstBand?.pricePerStop ? String(dafEletricFirstBand.pricePerStop) : undefined),
    // DAF Eletric Second Band - apenas se isElectric = true (já filtrado acima)
    // Exibir maxStops no campo Band 2 Max Stops
    dafEletricBand2Stops: dafEletricSecondBand?.maxStops ? String(dafEletricSecondBand.maxStops) : undefined,
    dafEletricBand2Rate: dafEletricSecondBand?.pricePerStop ? String(dafEletricSecondBand.pricePerStop) : undefined,
    // DAF Eletric Validity Dates
    dafEletricValidityStartDate: dafEletricFirstBand?.validityStartDate ? formatDateForInput(dafEletricFirstBand.validityStartDate) : undefined,
    dafEletricValidityEndDate: dafEletricFirstBand?.validityEndDate ? formatDateForInput(dafEletricFirstBand.validityEndDate) : undefined,
    paymentModel: backend.costModelId !== undefined && backend.costModelId !== null ? String(backend.costModelId) : undefined,
    cargoTraining: !!cargoTraining,
    dangerousGoodsTraining: !!dangerousGoodsTraining,
    manualHandlingTraining: !!manualHandlingTraining,
    cargoTrainingDate: cargoTraining?.completedDate ? formatDateForInput(cargoTraining.completedDate) : undefined,
    dangerousGoodsTrainingDate: dangerousGoodsTraining?.completedDate ? formatDateForInput(dangerousGoodsTraining.completedDate) : undefined,
    manualHandlingTrainingDate: manualHandlingTraining?.completedDate ? formatDateForInput(manualHandlingTraining.completedDate) : undefined,
    dhlTrainingNumber: backend.dhlTraining !== undefined && backend.dhlTraining !== null ? String(backend.dhlTraining) : undefined,
    criminalRecordDate: backend.criminalRecordDate ? formatDateForInput(backend.criminalRecordDate) : undefined,
    dvlaCheckDate: backend.dvlaCheckDate ? formatDateForInput(backend.dvlaCheckDate) : undefined,
    immigrationStatus: backend.immigrationStatus as 'Citizen' | 'Pre-Settlement' | 'Settlement' | 'Visa',
    visaValidity: backend.visaValidity ? formatDateForInput(backend.visaValidity) : undefined,
    licenceExpiringDate: backend.drivingLicenceExpiryDate ? formatDateForInput(backend.drivingLicenceExpiryDate) : undefined,
    passportExpiringDate: backend.passportExpireDate ? formatDateForInput(backend.passportExpireDate) : undefined,
    status: backend.active ? 'Active' : 'Inactive',
    servicePartnerId: backend.servicePartnerId ?? null,
    // Manter as costModels originais para permitir agrupamento e seleção
    originalCostModels: Array.isArray(backend.costModels) ? backend.costModels : undefined,
  };
};

/**
 * Mapeia dados do frontend para o formato do backend (NewUserByAdminCreateDTO/UpdateDTO)
 * @param frontend - Dados do frontend
 * @param isCreate - Se true, inclui campos obrigatórios e defaults do CreateDTO. Se false, apenas campos do UpdateDTO.
 * @param vendorTypes - Array de vendor types para verificar se é Employee
 */
const mapFrontendToBackend = (frontend: Partial<Vendor>, isCreate: boolean = true, vendorTypes?: VendorType[]): BackendCreateUpdateDTO => {
  // Helper para converter string para number de forma segura
  const safeNumber = (value: string | undefined): number | undefined => {
    if (!value || value === '' || value === 'false' || value === 'true') return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  };

  // Verificar se o vendor type é Employee
  const isEmployee = (): boolean => {
    if (!frontend.vendorType || !vendorTypes || vendorTypes.length === 0) return false;
    const vendorTypeId = safeNumber(frontend.vendorType);
    if (vendorTypeId === undefined) return false;
    // Look up by vendorTypeId first, then fall back to vendorTypeId for backward compatibility
    let vendorType = vendorTypes.find(vt => vt.vendorTypeId === vendorTypeId);
    if (!vendorType) {
      vendorType = vendorTypes.find(vt => vt.vendorTypeId === vendorTypeId);
    }
    if (!vendorType) return false;
    const nameType = vendorType.nameType?.toUpperCase() || '';
    return nameType.includes('EMPLOYEE');
  };

  const isEmployeeType = isEmployee();

  // Helper para formatar data
  const formatDate = (dateString: string | undefined): string | undefined => {
    if (!dateString || dateString.trim() === '') return undefined;
    return dateString;
  };

  // Construir cost_models baseado nos dados do formulário (array de CostModelItem)
  // Se já existem costModels no frontend (com modelEmployeesId), usar diretamente
  // Isso permite que em modo de edição, os costModels atualizados sejam passados diretamente
  let costModels: CostModelItem[] = [];

  // Verificar se costModels foram fornecidos diretamente (com modelEmployeesId)
  if (frontend.costModels && Array.isArray(frontend.costModels) && frontend.costModels.length > 0) {
    // Usar os costModels fornecidos diretamente (já incluem modelEmployeesId)
    costModels = [...frontend.costModels];
  } else {
    // VSR First Band: costModelId = 4 (Band 1 do formulário) - não elétrico
    // Lógica: minStops = 1, maSstops = valor do formulário (vsrBand1Stops)
    // Incluir também se houver validity dates (para permitir atualização de validity_end_date quando um novo cost model é adicionado)
    if (frontend.vsrBand1Rate || frontend.vsrBand1Stops || frontend.vsrValidityStartDate || frontend.vsrValidityEndDate) {
      const vsrFirstBand: CostModelItem = {
        costModelId: 4, // Predefinido conforme especificação
        minStops: 1, // Hardcoded conforme regra
        isElectric: false,
      };

      // Só adicionar maxStops se NÃO for Employee
      if (!isEmployeeType) {
        const maxStops = safeNumber(frontend.vsrBand1Stops);
        if (maxStops !== undefined) vsrFirstBand.maxStops = maxStops;
      }

      const pricePerStop = safeNumber(frontend.vsrBand1Rate);
      if (pricePerStop !== undefined) vsrFirstBand.pricePerStop = pricePerStop;

      // Adicionar validity dates
      if (frontend.vsrValidityStartDate) vsrFirstBand.validityStartDate = formatDate(frontend.vsrValidityStartDate);
      if (frontend.vsrValidityEndDate) vsrFirstBand.validityEndDate = formatDate(frontend.vsrValidityEndDate);

      if (Object.keys(vsrFirstBand).length > 1) { // Mais que apenas costModelId
        costModels.push(vsrFirstBand);
      }
    }

    // VSR Second Band: costModelId = 4 (Band 2 do formulário) - não elétrico
    // Lógica: minStops = maxStops do primeiro band + 1, maSstops = valor do formulário (vsrBand2Stops)
    // Incluir também se houver validity dates
    if (frontend.vsrBand2Rate || frontend.vsrBand2Stops || frontend.vsrValidityStartDate || frontend.vsrValidityEndDate) {
      const vsrSecondBand: CostModelItem = {
        costModelId: 4,
        isElectric: false,
      };

      // Calcular minStops: maxStops do primeiro band + 1
      // Usar o valor do primeiro band do formulário
      const firstBandMaxStops = frontend.vsrBand1Stops ? safeNumber(frontend.vsrBand1Stops) : undefined;
      if (!isEmployeeType && firstBandMaxStops !== undefined) {
        vsrSecondBand.minStops = firstBandMaxStops + 1;
      } else if (!isEmployeeType) {
        // Se não tiver primeiro band, usar 1 como padrão
        vsrSecondBand.minStops = 1;
      }

      // maxStops = valor do formulário
      if (!isEmployeeType) {
        const maxStops = safeNumber(frontend.vsrBand2Stops);
        if (maxStops !== undefined) vsrSecondBand.maxStops = maxStops;
      }

      const pricePerStop = safeNumber(frontend.vsrBand2Rate);
      if (pricePerStop !== undefined) vsrSecondBand.pricePerStop = pricePerStop;

      // Adicionar validity dates (mesmas do first band ou undefined se não especificado)
      if (frontend.vsrValidityStartDate) vsrSecondBand.validityStartDate = formatDate(frontend.vsrValidityStartDate);
      if (frontend.vsrValidityEndDate) vsrSecondBand.validityEndDate = formatDate(frontend.vsrValidityEndDate);

      if (Object.keys(vsrSecondBand).length > 1) { // Mais que apenas costModelId
        costModels.push(vsrSecondBand);
      }
    }

    // VSR Electric First Band: usar campo separado vsr_electric_first_band
    // Lógica: minStops = 1, maSstops = valor do formulário (vsrEletricBand1Stops)
    // Incluir também se houver validity dates
    if (frontend.vsrEletricBand1Rate || frontend.vsrEletricBand1Stops || frontend.vsrEletricValidityStartDate || frontend.vsrEletricValidityEndDate) {
      const vsrEletricFirstBand: CostModelItem = {
        costModelId: 4,
        minStops: 1,
        isElectric: true,
      };

      if (!isEmployeeType) {
        const maxStops = safeNumber(frontend.vsrEletricBand1Stops);
        if (maxStops !== undefined) vsrEletricFirstBand.maxStops = maxStops;
      }

      const pricePerStop = safeNumber(frontend.vsrEletricBand1Rate);
      if (pricePerStop !== undefined) vsrEletricFirstBand.pricePerStop = pricePerStop;

      if (frontend.vsrEletricValidityStartDate) vsrEletricFirstBand.validityStartDate = formatDate(frontend.vsrEletricValidityStartDate);
      if (frontend.vsrEletricValidityEndDate) vsrEletricFirstBand.validityEndDate = formatDate(frontend.vsrEletricValidityEndDate);

      // Sempre adicionar se entrou no if (já significa que há algum valor)
      costModels.push(vsrEletricFirstBand);
    }

    // VSR Electric Second Band: usar campo separado vsr_electric_second_band
    // Lógica: minStops = maxStops do primeiro band elétrico + 1, maSstops = valor do formulário (vsrEletricBand2Stops)
    // Incluir também se houver validity dates
    if (frontend.vsrEletricBand2Rate || frontend.vsrEletricBand2Stops || frontend.vsrEletricValidityStartDate || frontend.vsrEletricValidityEndDate) {
      const vsrEletricSecondBand: CostModelItem = {
        costModelId: 4,
        isElectric: true,
      };

      // Calcular minStops: maxStops do primeiro band elétrico + 1
      // Usar o valor do primeiro band elétrico do formulário
      const firstElectricBandMaxStops = frontend.vsrEletricBand1Stops ? safeNumber(frontend.vsrEletricBand1Stops) : undefined;
      if (!isEmployeeType && firstElectricBandMaxStops !== undefined) {
        vsrEletricSecondBand.minStops = firstElectricBandMaxStops + 1;
      } else if (!isEmployeeType) {
        // Se não tiver primeiro band, usar 1 como padrão
        vsrEletricSecondBand.minStops = 1;
      }

      // maxStops = valor do formulário
      if (!isEmployeeType) {
        const maxStops = safeNumber(frontend.vsrEletricBand2Stops);
        if (maxStops !== undefined) vsrEletricSecondBand.maxStops = maxStops;
      }

      const pricePerStop = safeNumber(frontend.vsrEletricBand2Rate);
      if (pricePerStop !== undefined) vsrEletricSecondBand.pricePerStop = pricePerStop;

      if (frontend.vsrEletricValidityStartDate) vsrEletricSecondBand.validityStartDate = formatDate(frontend.vsrEletricValidityStartDate);
      if (frontend.vsrEletricValidityEndDate) vsrEletricSecondBand.validityEndDate = formatDate(frontend.vsrEletricValidityEndDate);

      // Sempre adicionar se entrou no if (já significa que há algum valor)
      costModels.push(vsrEletricSecondBand);
    }

    // SP_VSR Band 1: costModelId = 12 - minStops = 1
    if (frontend.spVsrBand1Rate || frontend.spVsrBand1Stops || frontend.spVsrValidityStartDate || frontend.spVsrValidityEndDate) {
      const spVsrBand1: CostModelItem = {
        costModelId: 12,
        minStops: 1,
        isElectric: false,
      };
      if (!isEmployeeType) {
        const maxStops = safeNumber(frontend.spVsrBand1Stops);
        if (maxStops !== undefined) spVsrBand1.maxStops = maxStops;
      }
      const pricePerStop = safeNumber(frontend.spVsrBand1Rate);
      if (pricePerStop !== undefined) spVsrBand1.pricePerStop = pricePerStop;
      if (frontend.spVsrValidityStartDate) spVsrBand1.validityStartDate = formatDate(frontend.spVsrValidityStartDate);
      if (frontend.spVsrValidityEndDate) spVsrBand1.validityEndDate = formatDate(frontend.spVsrValidityEndDate);
      if (Object.keys(spVsrBand1).length > 1) costModels.push(spVsrBand1);
    }

    // SP_VSR Band 2: minStops = Band1.maxStops + 1
    if (frontend.spVsrBand2Rate || frontend.spVsrBand2Stops || frontend.spVsrValidityStartDate || frontend.spVsrValidityEndDate) {
      const spVsrBand2: CostModelItem = {
        costModelId: 12,
        isElectric: false,
      };
      if (!isEmployeeType) {
        const band1Max = safeNumber(frontend.spVsrBand1Stops);
        spVsrBand2.minStops = band1Max !== undefined ? band1Max + 1 : 1;
        const maxStops = safeNumber(frontend.spVsrBand2Stops);
        if (maxStops !== undefined) spVsrBand2.maxStops = maxStops;
      }
      const pricePerStop = safeNumber(frontend.spVsrBand2Rate);
      if (pricePerStop !== undefined) spVsrBand2.pricePerStop = pricePerStop;
      if (frontend.spVsrValidityStartDate) spVsrBand2.validityStartDate = formatDate(frontend.spVsrValidityStartDate);
      if (frontend.spVsrValidityEndDate) spVsrBand2.validityEndDate = formatDate(frontend.spVsrValidityEndDate);
      if (Object.keys(spVsrBand2).length > 1) costModels.push(spVsrBand2);
    }

    // SP_VSR Band 3: minStops = Band2.maxStops + 1
    if (frontend.spVsrBand3Rate || frontend.spVsrBand3Stops || frontend.spVsrValidityStartDate || frontend.spVsrValidityEndDate) {
      const spVsrBand3: CostModelItem = {
        costModelId: 12,
        isElectric: false,
      };
      if (!isEmployeeType) {
        const band2Max = safeNumber(frontend.spVsrBand2Stops);
        spVsrBand3.minStops = band2Max !== undefined ? band2Max + 1 : 1;
        const maxStops = safeNumber(frontend.spVsrBand3Stops);
        if (maxStops !== undefined) spVsrBand3.maxStops = maxStops;
      }
      const pricePerStop = safeNumber(frontend.spVsrBand3Rate);
      if (pricePerStop !== undefined) spVsrBand3.pricePerStop = pricePerStop;
      if (frontend.spVsrValidityStartDate) spVsrBand3.validityStartDate = formatDate(frontend.spVsrValidityStartDate);
      if (frontend.spVsrValidityEndDate) spVsrBand3.validityEndDate = formatDate(frontend.spVsrValidityEndDate);
      if (Object.keys(spVsrBand3).length > 1) costModels.push(spVsrBand3);
    }

    // SP_VSR Band 4: minStops = Band3.maxStops + 1
    if (frontend.spVsrBand4Rate || frontend.spVsrBand4Stops || frontend.spVsrValidityStartDate || frontend.spVsrValidityEndDate) {
      const spVsrBand4: CostModelItem = {
        costModelId: 12,
        isElectric: false,
      };
      if (!isEmployeeType) {
        const band3Max = safeNumber(frontend.spVsrBand3Stops);
        spVsrBand4.minStops = band3Max !== undefined ? band3Max + 1 : 1;
        const maxStops = safeNumber(frontend.spVsrBand4Stops);
        if (maxStops !== undefined) spVsrBand4.maxStops = maxStops;
      }
      const pricePerStop = safeNumber(frontend.spVsrBand4Rate);
      if (pricePerStop !== undefined) spVsrBand4.pricePerStop = pricePerStop;
      if (frontend.spVsrValidityStartDate) spVsrBand4.validityStartDate = formatDate(frontend.spVsrValidityStartDate);
      if (frontend.spVsrValidityEndDate) spVsrBand4.validityEndDate = formatDate(frontend.spVsrValidityEndDate);
      if (Object.keys(spVsrBand4).length > 1) costModels.push(spVsrBand4);
    }

    // SP_VSR Eletric Band 1: costModelId = 12, isElectric = true - minStops = 1
    if (frontend.spVsrEletricBand1Rate || frontend.spVsrEletricBand1Stops || frontend.spVsrEletricValidityStartDate || frontend.spVsrEletricValidityEndDate) {
      const spVsrEletricBand1: CostModelItem = {
        costModelId: 12,
        minStops: 1,
        isElectric: true,
      };
      if (!isEmployeeType) {
        const maxStops = safeNumber(frontend.spVsrEletricBand1Stops);
        if (maxStops !== undefined) spVsrEletricBand1.maxStops = maxStops;
      }
      const pricePerStop = safeNumber(frontend.spVsrEletricBand1Rate);
      if (pricePerStop !== undefined) spVsrEletricBand1.pricePerStop = pricePerStop;
      if (frontend.spVsrEletricValidityStartDate) spVsrEletricBand1.validityStartDate = formatDate(frontend.spVsrEletricValidityStartDate);
      if (frontend.spVsrEletricValidityEndDate) spVsrEletricBand1.validityEndDate = formatDate(frontend.spVsrEletricValidityEndDate);
      if (Object.keys(spVsrEletricBand1).length > 1) costModels.push(spVsrEletricBand1);
    }

    // SP_VSR Eletric Band 2: minStops = Band1.maxStops + 1
    if (frontend.spVsrEletricBand2Rate || frontend.spVsrEletricBand2Stops || frontend.spVsrEletricValidityStartDate || frontend.spVsrEletricValidityEndDate) {
      const spVsrEletricBand2: CostModelItem = {
        costModelId: 12,
        isElectric: true,
      };
      if (!isEmployeeType) {
        const band1Max = safeNumber(frontend.spVsrEletricBand1Stops);
        spVsrEletricBand2.minStops = band1Max !== undefined ? band1Max + 1 : 1;
        const maxStops = safeNumber(frontend.spVsrEletricBand2Stops);
        if (maxStops !== undefined) spVsrEletricBand2.maxStops = maxStops;
      }
      const pricePerStop = safeNumber(frontend.spVsrEletricBand2Rate);
      if (pricePerStop !== undefined) spVsrEletricBand2.pricePerStop = pricePerStop;
      if (frontend.spVsrEletricValidityStartDate) spVsrEletricBand2.validityStartDate = formatDate(frontend.spVsrEletricValidityStartDate);
      if (frontend.spVsrEletricValidityEndDate) spVsrEletricBand2.validityEndDate = formatDate(frontend.spVsrEletricValidityEndDate);
      if (Object.keys(spVsrEletricBand2).length > 1) costModels.push(spVsrEletricBand2);
    }

    // SP_VSR Eletric Band 3: minStops = Band2.maxStops + 1
    if (frontend.spVsrEletricBand3Rate || frontend.spVsrEletricBand3Stops || frontend.spVsrEletricValidityStartDate || frontend.spVsrEletricValidityEndDate) {
      const spVsrEletricBand3: CostModelItem = {
        costModelId: 12,
        isElectric: true,
      };
      if (!isEmployeeType) {
        const band2Max = safeNumber(frontend.spVsrEletricBand2Stops);
        spVsrEletricBand3.minStops = band2Max !== undefined ? band2Max + 1 : 1;
        const maxStops = safeNumber(frontend.spVsrEletricBand3Stops);
        if (maxStops !== undefined) spVsrEletricBand3.maxStops = maxStops;
      }
      const pricePerStop = safeNumber(frontend.spVsrEletricBand3Rate);
      if (pricePerStop !== undefined) spVsrEletricBand3.pricePerStop = pricePerStop;
      if (frontend.spVsrEletricValidityStartDate) spVsrEletricBand3.validityStartDate = formatDate(frontend.spVsrEletricValidityStartDate);
      if (frontend.spVsrEletricValidityEndDate) spVsrEletricBand3.validityEndDate = formatDate(frontend.spVsrEletricValidityEndDate);
      if (Object.keys(spVsrEletricBand3).length > 1) costModels.push(spVsrEletricBand3);
    }

    // SP_VSR Eletric Band 4: minStops = Band3.maxStops + 1
    if (frontend.spVsrEletricBand4Rate || frontend.spVsrEletricBand4Stops || frontend.spVsrEletricValidityStartDate || frontend.spVsrEletricValidityEndDate) {
      const spVsrEletricBand4: CostModelItem = {
        costModelId: 12,
        isElectric: true,
      };
      if (!isEmployeeType) {
        const band3Max = safeNumber(frontend.spVsrEletricBand3Stops);
        spVsrEletricBand4.minStops = band3Max !== undefined ? band3Max + 1 : 1;
        const maxStops = safeNumber(frontend.spVsrEletricBand4Stops);
        if (maxStops !== undefined) spVsrEletricBand4.maxStops = maxStops;
      }
      const pricePerStop = safeNumber(frontend.spVsrEletricBand4Rate);
      if (pricePerStop !== undefined) spVsrEletricBand4.pricePerStop = pricePerStop;
      if (frontend.spVsrEletricValidityStartDate) spVsrEletricBand4.validityStartDate = formatDate(frontend.spVsrEletricValidityStartDate);
      if (frontend.spVsrEletricValidityEndDate) spVsrEletricBand4.validityEndDate = formatDate(frontend.spVsrEletricValidityEndDate);
      if (Object.keys(spVsrEletricBand4).length > 1) costModels.push(spVsrEletricBand4);
    }

    // FSR: costModelId = 3 - não elétrico
    // Incluir também se houver validity dates
    if (frontend.fsrStopRate || frontend.fsrValidityStartDate || frontend.fsrValidityEndDate) {
      const fsrModel: CostModelItem = {
        costModelId: 3,
        isElectric: false,
      };

      const fixedPrice = safeNumber(frontend.fsrStopRate);
      if (fixedPrice !== undefined) {
        fsrModel.fixedPrice = fixedPrice;
      }

      // Adicionar validity dates
      if (frontend.fsrValidityStartDate) fsrModel.validityStartDate = formatDate(frontend.fsrValidityStartDate);
      if (frontend.fsrValidityEndDate) fsrModel.validityEndDate = formatDate(frontend.fsrValidityEndDate);

      if (Object.keys(fsrModel).length > 1) {
        costModels.push(fsrModel);
      }
    }

    // DR: costModelId = 2 - não elétrico
    // Incluir também se houver validity dates
    if (frontend.drDayRate || frontend.drValidityStartDate || frontend.drValidityEndDate) {
      const drModel: CostModelItem = {
        costModelId: 2,
        isElectric: false,
      };

      const fixedPrice = safeNumber(frontend.drDayRate);
      if (fixedPrice !== undefined) {
        drModel.fixedPrice = fixedPrice;
      }

      // Adicionar validity dates
      if (frontend.drValidityStartDate) drModel.validityStartDate = formatDate(frontend.drValidityStartDate);
      if (frontend.drValidityEndDate) drModel.validityEndDate = formatDate(frontend.drValidityEndDate);

      if (Object.keys(drModel).length > 1) {
        costModels.push(drModel);
      }
    }

    // Hourly (costModelId = 7) - pricePerStop = Hourly Rate, validity dates
    if (frontend.hourlyRate || frontend.hourlyValidityStartDate || frontend.hourlyValidityEndDate) {
      const hourlyModel: CostModelItem = {
        costModelId: 7,
      };
      const pricePerStop = safeNumber(frontend.hourlyRate);
      if (pricePerStop !== undefined) hourlyModel.pricePerStop = pricePerStop;
      if (frontend.hourlyValidityStartDate) hourlyModel.validityStartDate = formatDate(frontend.hourlyValidityStartDate);
      if (frontend.hourlyValidityEndDate) hourlyModel.validityEndDate = formatDate(frontend.hourlyValidityEndDate);
      if (Object.keys(hourlyModel).length > 1) {
        costModels.push(hourlyModel);
      }
    }

    // FSR Eletric (costModelId = 3) - elétrico
    if (frontend.fsrEletricStopRate || frontend.fsrEletricValidityStartDate || frontend.fsrEletricValidityEndDate) {
      const fsrEletricCostModel: CostModelItem = {
        costModelId: 3,
        isElectric: true,
      };
      const fixedPrice = safeNumber(frontend.fsrEletricStopRate);
      if (fixedPrice !== undefined) fsrEletricCostModel.fixedPrice = fixedPrice;
      if (frontend.fsrEletricValidityStartDate) fsrEletricCostModel.validityStartDate = formatDate(frontend.fsrEletricValidityStartDate);
      if (frontend.fsrEletricValidityEndDate) fsrEletricCostModel.validityEndDate = formatDate(frontend.fsrEletricValidityEndDate);
      if (Object.keys(fsrEletricCostModel).length > 1) costModels.push(fsrEletricCostModel);
    }

    // DR Eletric (costModelId = 2) - elétrico
    if (frontend.drEletricDayRate || frontend.drEletricValidityStartDate || frontend.drEletricValidityEndDate) {
      const drEletricCostModel: CostModelItem = {
        costModelId: 2,
        isElectric: true,
      };
      const fixedPrice = safeNumber(frontend.drEletricDayRate);
      if (fixedPrice !== undefined) drEletricCostModel.fixedPrice = fixedPrice;
      if (frontend.drEletricValidityStartDate) drEletricCostModel.validityStartDate = formatDate(frontend.drEletricValidityStartDate);
      if (frontend.drEletricValidityEndDate) drEletricCostModel.validityEndDate = formatDate(frontend.drEletricValidityEndDate);
      if (Object.keys(drEletricCostModel).length > 1) costModels.push(drEletricCostModel);
    }

    // Hourly Eletric (costModelId = 7) - elétrico
    if (frontend.hourlyEletricRate || frontend.hourlyEletricValidityStartDate || frontend.hourlyEletricValidityEndDate) {
      const hourlyEletricCostModel: CostModelItem = {
        costModelId: 7,
        isElectric: true,
      };
      const pricePerStop = safeNumber(frontend.hourlyEletricRate);
      if (pricePerStop !== undefined) hourlyEletricCostModel.pricePerStop = pricePerStop;
      if (frontend.hourlyEletricValidityStartDate) hourlyEletricCostModel.validityStartDate = formatDate(frontend.hourlyEletricValidityStartDate);
      if (frontend.hourlyEletricValidityEndDate) hourlyEletricCostModel.validityEndDate = formatDate(frontend.hourlyEletricValidityEndDate);
      if (Object.keys(hourlyEletricCostModel).length > 1) costModels.push(hourlyEletricCostModel);
    }

    // DAF First Band: costModelId = 1 - não elétrico
    // Lógica: minStops = 1, maSstops = valor do formulário (dafBand1Stops)
    // Incluir também se houver validity dates
    if (frontend.dafBand1Rate || frontend.dafBand1Stops || frontend.dafValidityStartDate || frontend.dafValidityEndDate) {
      const dafFirstBand: CostModelItem = {
        costModelId: 1,
        minStops: 1,
        isElectric: false,
      };

      // Só adicionar maxStops se NÃƒO for Employee
      if (!isEmployeeType) {
        const maxStops = safeNumber(frontend.dafBand1Stops);
        if (maxStops !== undefined) dafFirstBand.maxStops = maxStops;
      }

      const pricePerStop = safeNumber(frontend.dafBand1Rate);
      if (pricePerStop !== undefined) dafFirstBand.fixedPrice = pricePerStop;

      // Adicionar validity dates
      if (frontend.dafValidityStartDate) dafFirstBand.validityStartDate = formatDate(frontend.dafValidityStartDate);
      if (frontend.dafValidityEndDate) dafFirstBand.validityEndDate = formatDate(frontend.dafValidityEndDate);

      if (Object.keys(dafFirstBand).length > 1) { // Mais que apenas costModelId
        costModels.push(dafFirstBand);
      }
    }

    // DAF Second Band: costModelId = 1 - não elétrico
    // Lógica: minStops = maxStops do primeiro band + 1, maSstops = valor do formulário (dafBand2Stops)
    // Incluir também se houver validity dates
    if (frontend.dafBand2Rate || frontend.dafBand2Stops || frontend.dafValidityStartDate || frontend.dafValidityEndDate) {
      const dafSecondBand: CostModelItem = {
        costModelId: 1,
        isElectric: false,
      };

      // Calcular minStops: maxStops do primeiro band + 1
      // Usar o valor do primeiro band do formulário
      const firstBandMaxStops = frontend.dafBand1Stops ? safeNumber(frontend.dafBand1Stops) : undefined;
      if (!isEmployeeType && firstBandMaxStops !== undefined) {
        dafSecondBand.minStops = firstBandMaxStops + 1;
      } else if (!isEmployeeType) {
        // Se não tiver primeiro band, usar 1 como padrão
        dafSecondBand.minStops = 1;
      }

      // maxStops = valor do formulário
      if (!isEmployeeType) {
        const maxStops = safeNumber(frontend.dafBand2Stops);
        if (maxStops !== undefined) dafSecondBand.maxStops = maxStops;
      }

      const pricePerStop = safeNumber(frontend.dafBand2Rate);
      if (pricePerStop !== undefined) dafSecondBand.pricePerStop = pricePerStop;

      // Adicionar validity dates
      if (frontend.dafValidityStartDate) dafSecondBand.validityStartDate = formatDate(frontend.dafValidityStartDate);
      if (frontend.dafValidityEndDate) dafSecondBand.validityEndDate = formatDate(frontend.dafValidityEndDate);

      if (Object.keys(dafSecondBand).length > 1) { // Mais que apenas costModelId
        costModels.push(dafSecondBand);
      }
    }

    // DAF Electric First Band: usar campo separado daf_electric_first_band
    // Lógica: minStops = 1, maSstops = valor do formulário (dafEletricBand1Stops)
    // Incluir também se houver validity dates
    if (frontend.dafEletricBand1Rate || frontend.dafEletricBand1Stops || frontend.dafEletricValidityStartDate || frontend.dafEletricValidityEndDate) {
      const dafEletricFirstBand: CostModelItem = {
        costModelId: 1,
        minStops: 1,
        isElectric: true,
      };

      if (!isEmployeeType) {
        const maxStops = safeNumber(frontend.dafEletricBand1Stops);
        if (maxStops !== undefined) dafEletricFirstBand.maxStops = maxStops;
      }

      const pricePerStop = safeNumber(frontend.dafEletricBand1Rate);
      if (pricePerStop !== undefined) dafEletricFirstBand.fixedPrice = pricePerStop;

      if (frontend.dafEletricValidityStartDate) dafEletricFirstBand.validityStartDate = formatDate(frontend.dafEletricValidityStartDate);
      if (frontend.dafEletricValidityEndDate) dafEletricFirstBand.validityEndDate = formatDate(frontend.dafEletricValidityEndDate);

      // Sempre adicionar se entrou no if (já significa que há algum valor)
      costModels.push(dafEletricFirstBand);
    }

    // DAF Electric Second Band: usar campo separado daf_electric_second_band
    // Lógica: minStops = maxStops do primeiro band elétrico + 1, maSstops = valor do formulário (dafEletricBand2Stops)
    // Incluir também se houver validity dates
    if (frontend.dafEletricBand2Rate || frontend.dafEletricBand2Stops || frontend.dafEletricValidityStartDate || frontend.dafEletricValidityEndDate) {
      const dafEletricSecondBand: CostModelItem = {
        costModelId: 1,
        isElectric: true,
      };

      // Calcular minStops: maxStops do primeiro band elétrico + 1
      // Usar o valor do primeiro band elétrico do formulário
      const firstElectricBandMaxStops = frontend.dafEletricBand1Stops ? safeNumber(frontend.dafEletricBand1Stops) : undefined;
      if (!isEmployeeType && firstElectricBandMaxStops !== undefined) {
        dafEletricSecondBand.minStops = firstElectricBandMaxStops + 1;
      } else if (!isEmployeeType) {
        // Se não tiver primeiro band, usar 1 como padrão
        dafEletricSecondBand.minStops = 1;
      }

      // maxStops = valor do formulário
      if (!isEmployeeType) {
        const maxStops = safeNumber(frontend.dafEletricBand2Stops);
        if (maxStops !== undefined) dafEletricSecondBand.maxStops = maxStops;
      }

      const pricePerStop = safeNumber(frontend.dafEletricBand2Rate);
      if (pricePerStop !== undefined) dafEletricSecondBand.pricePerStop = pricePerStop;

      if (frontend.dafEletricValidityStartDate) dafEletricSecondBand.validityStartDate = formatDate(frontend.dafEletricValidityStartDate);
      if (frontend.dafEletricValidityEndDate) dafEletricSecondBand.validityEndDate = formatDate(frontend.dafEletricValidityEndDate);

      // Sempre adicionar se entrou no if (já significa que há algum valor)
      costModels.push(dafEletricSecondBand);
    }
  } // Fim do else - construção de cost_models baseada no formulário

  // Construir training array conforme TrainingItem interface
  // training_id predefinidos: 1 = Cargo, 2 = Dangerous Goods, 3 = Manual Handling
  const training: TrainingItem[] = [];

  if (frontend.cargoTrainingDate && String(frontend.cargoTrainingDate).trim() !== '') {
    training.push({
      trainingId: 1, // Predefinido: Cargo Operative training
      completedDate: frontend.cargoTrainingDate,
      // vendorTrainingId e userId são opcionais e serão preenchidos pelo backend
    });
  }

  if (frontend.dangerousGoodsTrainingDate && String(frontend.dangerousGoodsTrainingDate).trim() !== '') {
    training.push({
      trainingId: 2, // Predefinido: Dangerous Goods Awareness training
      completedDate: frontend.dangerousGoodsTrainingDate,
    });
  }

  if (frontend.manualHandlingTrainingDate && String(frontend.manualHandlingTrainingDate).trim() !== '') {
    training.push({
      trainingId: 3, // Predefinido: Manual Handling Training
      completedDate: frontend.manualHandlingTrainingDate,
    });
  }

  // Construir objeto removendo campos undefined e garantindo tipos corretos
  const backendData: BackendCreateUpdateDTO = {};

  // Campos comuns
  if (frontend.supplierId) backendData.userCode = frontend.supplierId;
  if (frontend.firstName) backendData.name = frontend.firstName;
  if (frontend.lastName) backendData.lastName = frontend.lastName;
  if (frontend.email) backendData.email = frontend.email;

  // Campos obrigatórios apenas no CreateDTO
  if (isCreate) {
    // createdBy é obrigatório no CreateDTO - usar nome do usuário do token
    const fullName = getFullNameFromToken();
    backendData.createdBy = fullName || 'admin';

    // Campos com defaults conforme NewUserByAdminCreateDTO
    // password não deve ser hardcoded - será gerado pelo backend ou definido pelo usuário
    // companyId será definido pelo backend baseado no contexto do usuário autenticado

    backendData.mainAddress = true; // Default: true
    backendData.isFirstLogin = true; // Default: true
    backendData.active = true; // Default: true
  } else {
    // No UpdateDTO, active é opcional mas pode ser enviado
    if (frontend.status !== undefined) {
      backendData.active = frontend.status === 'Active';
    }
  }

  // Adicionar depositId: prioridade para depot (select value), depois depositId se existir
  const depotVal = frontend.depot != null ? String(frontend.depot).trim() : '';
  const depositIdFromDepot = depotVal !== '' ? safeNumber(depotVal) : undefined;
  const depositIdFromField = (frontend as Partial<Vendor & { depositId?: number }>).depositId;
  const depositId = depositIdFromDepot ?? (depositIdFromField != null && Number.isFinite(Number(depositIdFromField)) ? Number(depositIdFromField) : undefined);
  if (depositId !== undefined && depositId !== null && depositId > 0) {
    backendData.depositId = depositId;
  }

  if (frontend.phone && String(frontend.phone).trim() !== '') {
    backendData.phone = frontend.phone;
  }

  if (frontend.dob && String(frontend.dob).trim() !== '') {
    backendData.dateOfBirth = frontend.dob;
  }

  const vendorTypeId = safeNumber(frontend.vendorType);
  if (vendorTypeId !== undefined) {
    backendData.vendorTypeId = vendorTypeId;
    // For backward compatibility, also set vendorTypeId if backend expects it
    backendData.vendorTypeId = vendorTypeId;
  }

  const userTypeId = safeNumber(frontend.userType);
  if (userTypeId !== undefined) backendData.userTypeId = userTypeId;

  const spId = typeof frontend.servicePartnerId === 'string'
    ? safeNumber(frontend.servicePartnerId)
    : (typeof frontend.servicePartnerId === 'number' ? frontend.servicePartnerId : undefined);
  if (spId !== undefined) backendData.servicePartnerId = spId;

  if (frontend.vat && String(frontend.vat).trim() !== '') {
    backendData.vatNumber = frontend.vat;
  }

  if (frontend.street && String(frontend.street).trim() !== '') {
    backendData.street = frontend.street;
  }

  if (frontend.city && String(frontend.city).trim() !== '') {
    backendData.city = frontend.city;
  }

  if (frontend.postalCode && String(frontend.postalCode).trim() !== '') {
    backendData.postalCode = frontend.postalCode;
  }

  if (frontend.startDate && String(frontend.startDate).trim() !== '') {
    backendData.startDate = frontend.startDate;
  }

  if (frontend.finishDate && String(frontend.finishDate).trim() !== '') {
    backendData.endDate = frontend.finishDate;
  }

  // active já está definido no objeto inicial se for create (default: true)
  // No update, só envia se status foi alterado

  const routeId = safeNumber(frontend.routeIdLink);
  if (routeId !== undefined) backendData.routeId = routeId;

  // routeSortValue como decimal (number)
  if (frontend.routeSortValue && String(frontend.routeSortValue).trim() !== '') {
    const routeSortValue = parseFloat(String(frontend.routeSortValue));
    if (!isNaN(routeSortValue)) {
      backendData.routeSortValue = routeSortValue;
    }
  }

  const vehicleId = safeNumber(frontend.vehicleRegLink);
  if (vehicleId !== undefined) backendData.vehicleId = vehicleId;

  if (costModels.length > 0) {
    backendData.costModels = normalizeCostModel1Bands(costModels);
  }

  // Processar novos cost models para adicionar (apenas em update)
  if (!isCreate) {
    const newCostModels: CostModelItem[] = [];

    // VSR First Band - novo
    if (frontend.newVsrBand1Stops || frontend.newVsrBand1Rate || frontend.newVsrValidityStartDate) {
      const maxStops = safeNumber(frontend.newVsrBand1Stops);
      const pricePerStop = safeNumber(frontend.newVsrBand1Rate);
      if (maxStops !== undefined || pricePerStop !== undefined) {
        newCostModels.push({
          costModelId: 4,
          minStops: 1,
          maxStops: maxStops,
          pricePerStop: pricePerStop,
          validityStartDate: formatDate(frontend.newVsrValidityStartDate),
          validityEndDate: formatDate(frontend.newVsrValidityEndDate),
          isElectric: false,
        });
      }
    }

    // VSR Second Band - novo
    if (frontend.newVsrBand2Stops || frontend.newVsrBand2Rate) {
      const maxStops = safeNumber(frontend.newVsrBand2Stops);
      const pricePerStop = safeNumber(frontend.newVsrBand2Rate);
      const firstBandMaxStops = safeNumber(frontend.newVsrBand1Stops);
      if (maxStops !== undefined || pricePerStop !== undefined) {
        newCostModels.push({
          costModelId: 4,
          minStops: firstBandMaxStops !== undefined ? firstBandMaxStops + 1 : undefined,
          maxStops: maxStops,
          pricePerStop: pricePerStop,
          validityStartDate: formatDate(frontend.newVsrValidityStartDate),
          validityEndDate: formatDate(frontend.newVsrValidityEndDate),
          isElectric: false,
        });
      }
    }

    // VSR Electric First Band - novo
    if (frontend.newVsrEletricBand1Stops || frontend.newVsrEletricBand1Rate || frontend.newVsrEletricValidityStartDate) {
      const maxStops = safeNumber(frontend.newVsrEletricBand1Stops);
      const pricePerStop = safeNumber(frontend.newVsrEletricBand1Rate);
      if (maxStops !== undefined || pricePerStop !== undefined) {
        newCostModels.push({
          costModelId: 4,
          minStops: 1,
          maxStops: maxStops,
          pricePerStop: pricePerStop,
          validityStartDate: formatDate(frontend.newVsrEletricValidityStartDate),
          validityEndDate: formatDate(frontend.newVsrEletricValidityEndDate),
          isElectric: true,
        });
      }
    }

    // VSR Electric Second Band - novo
    if (frontend.newVsrEletricBand2Stops || frontend.newVsrEletricBand2Rate) {
      const maxStops = safeNumber(frontend.newVsrEletricBand2Stops);
      const pricePerStop = safeNumber(frontend.newVsrEletricBand2Rate);
      const firstBandMaxStops = safeNumber(frontend.newVsrEletricBand1Stops);
      if (maxStops !== undefined || pricePerStop !== undefined) {
        newCostModels.push({
          costModelId: 4,
          minStops: firstBandMaxStops !== undefined ? firstBandMaxStops + 1 : undefined,
          maxStops: maxStops,
          pricePerStop: pricePerStop,
          validityStartDate: formatDate(frontend.newVsrEletricValidityStartDate),
          validityEndDate: formatDate(frontend.newVsrEletricValidityEndDate),
          isElectric: true,
        });
      }
    }

    // SP_VSR Eletric Band 1 - novo
    if (frontend.newSpVsrEletricBand1Stops || frontend.newSpVsrEletricBand1Rate || frontend.newSpVsrEletricValidityStartDate) {
      const maxStops = safeNumber(frontend.newSpVsrEletricBand1Stops);
      const pricePerStop = safeNumber(frontend.newSpVsrEletricBand1Rate);
      if (maxStops !== undefined || pricePerStop !== undefined) {
        newCostModels.push({
          costModelId: 12,
          minStops: 1,
          maxStops: maxStops,
          pricePerStop: pricePerStop,
          validityStartDate: formatDate(frontend.newSpVsrEletricValidityStartDate),
          validityEndDate: formatDate(frontend.newSpVsrEletricValidityEndDate),
          isElectric: true,
        });
      }
    }

    // SP_VSR Eletric Band 2 - novo
    if (frontend.newSpVsrEletricBand2Stops || frontend.newSpVsrEletricBand2Rate) {
      const maxStops = safeNumber(frontend.newSpVsrEletricBand2Stops);
      const pricePerStop = safeNumber(frontend.newSpVsrEletricBand2Rate);
      const firstBandMaxStops = safeNumber(frontend.newSpVsrEletricBand1Stops);
      if (maxStops !== undefined || pricePerStop !== undefined) {
        newCostModels.push({
          costModelId: 12,
          minStops: firstBandMaxStops !== undefined ? firstBandMaxStops + 1 : undefined,
          maxStops: maxStops,
          pricePerStop: pricePerStop,
          validityStartDate: formatDate(frontend.newSpVsrEletricValidityStartDate),
          validityEndDate: formatDate(frontend.newSpVsrEletricValidityEndDate),
          isElectric: true,
        });
      }
    }

    // SP_VSR Eletric Band 3 - novo
    if (frontend.newSpVsrEletricBand3Stops || frontend.newSpVsrEletricBand3Rate) {
      const maxStops = safeNumber(frontend.newSpVsrEletricBand3Stops);
      const pricePerStop = safeNumber(frontend.newSpVsrEletricBand3Rate);
      const secondBandMaxStops = safeNumber(frontend.newSpVsrEletricBand2Stops);
      if (maxStops !== undefined || pricePerStop !== undefined) {
        newCostModels.push({
          costModelId: 12,
          minStops: secondBandMaxStops !== undefined ? secondBandMaxStops + 1 : undefined,
          maxStops: maxStops,
          pricePerStop: pricePerStop,
          validityStartDate: formatDate(frontend.newSpVsrEletricValidityStartDate),
          validityEndDate: formatDate(frontend.newSpVsrEletricValidityEndDate),
          isElectric: true,
        });
      }
    }

    // SP_VSR Eletric Band 4 - novo
    if (frontend.newSpVsrEletricBand4Stops || frontend.newSpVsrEletricBand4Rate) {
      const maxStops = safeNumber(frontend.newSpVsrEletricBand4Stops);
      const pricePerStop = safeNumber(frontend.newSpVsrEletricBand4Rate);
      const thirdBandMaxStops = safeNumber(frontend.newSpVsrEletricBand3Stops);
      if (maxStops !== undefined || pricePerStop !== undefined) {
        newCostModels.push({
          costModelId: 12,
          minStops: thirdBandMaxStops !== undefined ? thirdBandMaxStops + 1 : undefined,
          maxStops: maxStops,
          pricePerStop: pricePerStop,
          validityStartDate: formatDate(frontend.newSpVsrEletricValidityStartDate),
          validityEndDate: formatDate(frontend.newSpVsrEletricValidityEndDate),
          isElectric: true,
        });
      }
    }

    // DAF First Band - novo
    if (frontend.newDafBand1Stops || frontend.newDafBand1Rate || frontend.newDafValidityStartDate) {
      const maxStops = safeNumber(frontend.newDafBand1Stops);
      const pricePerStop = safeNumber(frontend.newDafBand1Rate);
      if (maxStops !== undefined || pricePerStop !== undefined) {
        newCostModels.push({
          costModelId: 1,
          minStops: 1,
          maxStops: maxStops,
          fixedPrice: pricePerStop,
          validityStartDate: formatDate(frontend.newDafValidityStartDate),
          validityEndDate: formatDate(frontend.newDafValidityEndDate),
          isElectric: false,
        });
      }
    }

    // DAF Second Band - novo
    if (frontend.newDafBand2Stops || frontend.newDafBand2Rate) {
      const maxStops = safeNumber(frontend.newDafBand2Stops);
      const pricePerStop = safeNumber(frontend.newDafBand2Rate);
      const firstBandMaxStops = safeNumber(frontend.newDafBand1Stops);
      if (maxStops !== undefined || pricePerStop !== undefined) {
        newCostModels.push({
          costModelId: 1,
          minStops: firstBandMaxStops !== undefined ? firstBandMaxStops + 1 : undefined,
          maxStops: maxStops,
          pricePerStop: pricePerStop,
          validityStartDate: formatDate(frontend.newDafValidityStartDate),
          validityEndDate: formatDate(frontend.newDafValidityEndDate),
          isElectric: false,
        });
      }
    }

    // DAF Electric First Band - novo
    if (frontend.newDafEletricBand1Stops || frontend.newDafEletricBand1Rate || frontend.newDafEletricValidityStartDate) {
      const maxStops = safeNumber(frontend.newDafEletricBand1Stops);
      const pricePerStop = safeNumber(frontend.newDafEletricBand1Rate);
      if (maxStops !== undefined || pricePerStop !== undefined) {
        newCostModels.push({
          costModelId: 1,
          minStops: 1,
          maxStops: maxStops,
          fixedPrice: pricePerStop,
          validityStartDate: formatDate(frontend.newDafEletricValidityStartDate),
          validityEndDate: formatDate(frontend.newDafEletricValidityEndDate),
          isElectric: true,
        });
      }
    }

    // DAF Electric Second Band - novo
    if (frontend.newDafEletricBand2Stops || frontend.newDafEletricBand2Rate) {
      const maxStops = safeNumber(frontend.newDafEletricBand2Stops);
      const pricePerStop = safeNumber(frontend.newDafEletricBand2Rate);
      const firstBandMaxStops = safeNumber(frontend.newDafEletricBand1Stops);
      if (maxStops !== undefined || pricePerStop !== undefined) {
        newCostModels.push({
          costModelId: 1,
          minStops: firstBandMaxStops !== undefined ? firstBandMaxStops + 1 : undefined,
          maxStops: maxStops,
          pricePerStop: pricePerStop,
          validityStartDate: formatDate(frontend.newDafEletricValidityStartDate),
          validityEndDate: formatDate(frontend.newDafEletricValidityEndDate),
          isElectric: true,
        });
      }
    }

    // FSR - novo
    if (frontend.newFsrStopRate || frontend.newFsrValidityStartDate) {
      const fixedPrice = safeNumber(frontend.newFsrStopRate);
      if (fixedPrice !== undefined) {
        newCostModels.push({
          costModelId: 3,
          fixedPrice: fixedPrice,
          validityStartDate: formatDate(frontend.newFsrValidityStartDate),
          validityEndDate: formatDate(frontend.newFsrValidityEndDate),
          isElectric: false,
        });
      }
    }

    // DR - novo
    if (frontend.newDrDayRate || frontend.newDrValidityStartDate) {
      const fixedPrice = safeNumber(frontend.newDrDayRate);
      if (fixedPrice !== undefined) {
        newCostModels.push({
          costModelId: 2,
          fixedPrice: fixedPrice,
          validityStartDate: formatDate(frontend.newDrValidityStartDate),
          validityEndDate: formatDate(frontend.newDrValidityEndDate),
          isElectric: false,
        });
      }
    }

    // FSR Eletric - novo
    if (frontend.newFsrEletricStopRate || frontend.newFsrEletricValidityStartDate) {
      const fixedPrice = safeNumber(frontend.newFsrEletricStopRate);
      if (fixedPrice !== undefined) {
        newCostModels.push({
          costModelId: 3,
          fixedPrice: fixedPrice,
          validityStartDate: formatDate(frontend.newFsrEletricValidityStartDate),
          validityEndDate: formatDate(frontend.newFsrEletricValidityEndDate),
          isElectric: true,
        });
      }
    }

    // DR Eletric - novo
    if (frontend.newDrEletricDayRate || frontend.newDrEletricValidityStartDate) {
      const fixedPrice = safeNumber(frontend.newDrEletricDayRate);
      if (fixedPrice !== undefined) {
        newCostModels.push({
          costModelId: 2,
          fixedPrice: fixedPrice,
          validityStartDate: formatDate(frontend.newDrEletricValidityStartDate),
          validityEndDate: formatDate(frontend.newDrEletricValidityEndDate),
          isElectric: true,
        });
      }
    }

    // Hourly Eletric - novo
    if (frontend.newHourlyEletricRate || frontend.newHourlyEletricValidityStartDate) {
      const pricePerStop = safeNumber(frontend.newHourlyEletricRate);
      if (pricePerStop !== undefined) {
        newCostModels.push({
          costModelId: 7,
          pricePerStop: pricePerStop,
          validityStartDate: formatDate(frontend.newHourlyEletricValidityStartDate),
          validityEndDate: formatDate(frontend.newHourlyEletricValidityEndDate),
          isElectric: true,
        });
      }
    }

    // Adicionar newCostModels ao backendData se houver novos cost models
    if (newCostModels.length > 0) {
      backendData.newCostModels = normalizeCostModel1Bands(newCostModels);
    }
  }


  const costModelId = safeNumber(frontend.paymentModel);
  if (costModelId !== undefined) backendData.costModelId = costModelId;

  if (training.length > 0) {
    backendData.training = training;
  }

  // dhlTraining sempre deve ser number (opcional no DTO)
  if (frontend.dhlTrainingNumber !== undefined && frontend.dhlTrainingNumber !== null && frontend.dhlTrainingNumber !== '') {
    const dhlTrainingValue = safeNumber(frontend.dhlTrainingNumber);
    if (dhlTrainingValue !== undefined) {
      backendData.dhlTraining = dhlTrainingValue;
    }
  }

  if (frontend.criminalRecordDate && String(frontend.criminalRecordDate).trim() !== '') {
    backendData.criminalRecordDate = frontend.criminalRecordDate;
  }

  if (frontend.visaValidity && String(frontend.visaValidity).trim() !== '') {
    backendData.visaValidity = frontend.visaValidity;
  }

  if (frontend.dvlaCheckDate && String(frontend.dvlaCheckDate).trim() !== '') {
    backendData.dvlaCheckDate = frontend.dvlaCheckDate;
  }

  if (frontend.licenceExpiringDate && String(frontend.licenceExpiringDate).trim() !== '') {
    backendData.drivingLicenceExpiryDate = frontend.licenceExpiringDate;
  }

  if (frontend.immigrationStatus && String(frontend.immigrationStatus).trim() !== '') {
    backendData.immigrationStatus = frontend.immigrationStatus;
  }

  if (frontend.passportExpiringDate && String(frontend.passportExpiringDate).trim() !== '') {
    backendData.passportExpireDate = frontend.passportExpiringDate;
  }

  return backendData;
};

/**
 * Busca todos os vendors (New Users By Admin)
 * Atualizado para receber dados do DBeaver/Backend com melhor tratamento de diferentes formatos
 */
export const fetchVendors = async (filters?: { servicePartnerId?: number }): Promise<Vendor[]> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    if (!API_BASE_URL) {
      throw new Error("API URL is not configured. Please check your environment variables.");
    }

    const url = new URL(`${API_BASE_URL}/bff/vendor`);
    if (filters?.servicePartnerId) {
      url.searchParams.append('servicePartnerId', String(filters.servicePartnerId));
    }

    const response = await guardedFetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch vendors: ${response.status} ${response.statusText}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Se não conseguir parsear como JSON, usar o texto direto
        if (errorText) {
          errorMessage = `${errorMessage} - ${errorText}`;
        }
      }

      console.error('Vendor fetch error:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });

      throw new Error(errorMessage);
    }

    const rawData = await response.json();


    // Tratar diferentes formatos de resposta do backend/DBeaver
    let vendorsArray: BackendVendorResponse[] = [];

    if (Array.isArray(rawData)) {
      // Se a resposta já é um array direto
      vendorsArray = rawData;
    } else if (rawData && typeof rawData === 'object') {
      // Se a resposta é um objeto, tentar extrair o array
      if ('data' in rawData && Array.isArray(rawData.data)) {
        vendorsArray = rawData.data;
      } else if ('result' in rawData && Array.isArray(rawData.result)) {
        vendorsArray = rawData.result;
      } else if ('vendors' in rawData && Array.isArray(rawData.vendors)) {
        vendorsArray = rawData.vendors;
      } else if ('users' in rawData && Array.isArray(rawData.users)) {
        vendorsArray = rawData.users;
      } else if ('items' in rawData && Array.isArray(rawData.items)) {
        vendorsArray = rawData.items;
      } else {
        // Se não encontrar array, tentar usar o objeto como único item
        console.warn('Unexpected response format from backend. Expected array or object with array property.');
        vendorsArray = [rawData as BackendVendorResponse];
      }
    }

    // Mapear os dados do backend para o formato do frontend
    const mappedVendors = vendorsArray
      .filter((item) => item !== null && item !== undefined)
      .map((backendVendor) => {
        try {
          const mapped = mapBackendToFrontend(backendVendor);
          return mapped;
        } catch (error) {
          console.error('Error mapping vendor:', error, backendVendor);
          // Retornar um vendor vazio ou null para ser filtrado
          return null;
        }
      })
      .filter((vendor): vendor is Vendor => vendor !== null)
      .sort((a, b) => {
        // Ordenar pelo nome (firstName) em ordem crescente (alfabética)
        const nameA = (a.firstName || '').toLowerCase();
        const nameB = (b.firstName || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

    return mappedVendors;
  } catch (error) {
    console.error("Error fetching vendors:", error);

    // Re-throw com mensagem mais clara
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(`Failed to fetch vendors: ${String(error)}`);
  }
};

/**
 * Busca os treinamentos/documentos de um vendor/user específico
 * @param userId - ID do vendor/user (formerly userId)
 */
export const fetchVendorTrainingsByUserId = async (
  userId: number
): Promise<VendorDocumentsDTO> => {
  const emptyResult: VendorDocumentsDTO = {
    userId: userId,
    fullName: null,
    documents: {
      drivingLicenceExpiryDate: null,
      dvlaCheckDate: null,
      criminalRecordDate: null,
      visaValidity: null,
      passportExpireDate: null,
      immigrationStatus: null,
    },
    training: {
      dhlTraining: null,
      vendorTrainings: [],
    },
  };

  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    if (!API_BASE_URL) {
      throw new Error("API URL is not configured. Please check your environment variables.");
    }

    const response = await guardedFetch(
      `${API_BASE_URL}/bff/vendor-trainings/user/${userId}`,
      {
        method: "GET",
        headers: {
          ...getBearerAuthHeader(),
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData && (errorData.message || errorData.error)) ||
        `Failed to fetch vendor trainings (${response.status})`;
      throw new Error(message);
    }

    const raw: unknown = await response.json();
    const rawObj = raw as Record<string, unknown> | null;
    const payload = (rawObj && typeof rawObj === "object" && "data" in rawObj ? rawObj.data : raw) as
      | Partial<VendorDocumentsDTO>
      | undefined;

    const merged: VendorDocumentsDTO = {
      ...emptyResult,
      ...(payload || {}),
      documents: {
        ...emptyResult.documents,
        ...(payload?.documents || {}),
      },
      training: {
        ...emptyResult.training,
        ...(payload?.training || {}),
        vendorTrainings: payload?.training?.vendorTrainings || [],
      },
    };

    return merged;
  } catch (error) {
    console.error("Error fetching vendor trainings:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch vendor trainings: ${String(error)}`);
  }
};


/**
 * Cria um novo vendor (New User By Admin)
 */
export const createVendor = async (vendorData: Omit<Vendor, 'id'>): Promise<Vendor> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    // Buscar vendorTypes para verificar se é Employee
    let vendorTypes: VendorType[] = [];
    try {
      vendorTypes = await fetchVendorTypes();
    } catch (error) {
      console.warn("Could not fetch vendor types, proceeding without Employee check:", error);
    }

    const backendData = mapFrontendToBackend(vendorData, true, vendorTypes); // true = isCreate
    const cleanBackendData = cleanValue(backendData as CleanableValue) as BackendCreateUpdateDTO;

    const response = await guardedFetch(`${API_BASE_URL}/bff/vendor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify(cleanBackendData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      let errorMessage = errorData.error || errorData.message || `Failed to create vendor: ${response.statusText}`;

      // Tratar erro específico de email duplicado
      if (errorMessage.includes('users_email_key') || errorMessage.includes('email') || errorMessage.includes('duplicar')) {
        errorMessage = 'This email is already registered. Please use another email.';
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return mapBackendToFrontend(data);
  } catch (error) {
    console.error("Error creating vendor:", error);
    throw error;
  }
};

/**
 * Atualiza um vendor existente (New User By Admin)
 */
export const updateVendor = async (
  vendorId: number,
  vendorData: Partial<Vendor>
): Promise<Vendor> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    // Buscar vendorTypes para verificar se é Employee
    let vendorTypes: VendorType[] = [];
    try {
      vendorTypes = await fetchVendorTypes();
    } catch (error) {
      console.warn("Could not fetch vendor types, proceeding without Employee check:", error);
    }

    const backendData = mapFrontendToBackend(vendorData, false, vendorTypes); // false = isUpdate
    const cleanBackendData = cleanValue(backendData as CleanableValue) as BackendCreateUpdateDTO;

    const hasDepositOrCostModelChange =
      cleanBackendData.depositId !== undefined ||
      cleanBackendData.costModelId !== undefined ||
      (Array.isArray(cleanBackendData.costModels) && cleanBackendData.costModels.length > 0) ||
      (Array.isArray(cleanBackendData.newCostModels) && cleanBackendData.newCostModels.length > 0);

    if (hasDepositOrCostModelChange) {
      const userId = vendorData.userId ?? vendorData.id ?? vendorId;
      if (Number.isFinite(Number(userId)) && Number(userId) > 0) {
        cleanBackendData.userId = Number(userId);
      }
    }

    const response = await guardedFetch(`${API_BASE_URL}/bff/vendor/${vendorId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify(cleanBackendData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || errorData.message || `Failed to update vendor: ${response.statusText}`);
    }

    const data = await response.json();
    return mapBackendToFrontend(data);
  } catch (error) {
    console.error("Error updating vendor:", error);
    throw error;
  }
};

/**
 * Desativa um vendor definindo active=false no user (PATCH)
 * Não deleta o registro - apenas desativa o usuário.
 */
export const deactivateVendor = async (vendorId: number): Promise<void> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    const response = await guardedFetch(`${API_BASE_URL}/bff/vendor/${vendorId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify({ active: false }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || errorData.message || `Failed to deactivate vendor: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deactivating vendor:", error);
    throw error;
  }
};

// --- Funções para buscar dados dos selects ---

/**
 * Busca os depósitos únicos a partir da lista de vendors (GET /bff/vendor)
 * e enriquece com nomes vindos de GET /bff/deposits.
 * Usado para popular o select de deposit na página de vendor.
 */
export const fetchDepositsFromVendors = async (): Promise<Deposit[]> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    const headers = {
      'Content-Type': 'application/json',
      ...getBearerAuthHeader(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };

    // Buscar vendors e deposits em paralelo
    const [vendorRes, depositsRes] = await Promise.all([
      guardedFetch(`${API_BASE_URL}/bff/vendor`, { method: 'GET', headers, cache: 'no-store' }),
      guardedFetch(`${API_BASE_URL}/bff/deposits`, { method: 'GET', headers, cache: 'no-store' }).catch(() => null),
    ]);

    if (!vendorRes.ok) {
      throw new Error(`Failed to fetch vendors for deposits: ${vendorRes.statusText}`);
    }

    const rawData = await vendorRes.json();
    let vendorsArray: Array<Record<string, unknown>> = [];

    if (Array.isArray(rawData)) {
      vendorsArray = rawData;
    } else if (rawData && typeof rawData === 'object') {
      if (Array.isArray(rawData.data)) vendorsArray = rawData.data;
      else if (Array.isArray(rawData.result)) vendorsArray = rawData.result;
      else if (Array.isArray(rawData.vendors)) vendorsArray = rawData.vendors;
      else if (Array.isArray(rawData.users)) vendorsArray = rawData.users;
      else if (Array.isArray(rawData.items)) vendorsArray = rawData.items;
    }

    // Mapa depositId -> depositName a partir de /bff/deposits
    const nameById = new Map<number, string>();
    if (depositsRes?.ok) {
      try {
        const depData = await depositsRes.json();
        let depArray: Array<Record<string, unknown>> = [];
        if (Array.isArray(depData)) depArray = depData;
        else if (depData?.deposits && Array.isArray(depData.deposits)) depArray = depData.deposits;
        else if (depData?.data && Array.isArray(depData.data)) depArray = depData.data;
        else if (depData?.result && Array.isArray(depData.result)) depArray = depData.result;
        for (const d of depArray) {
          const id = (d.depositId as number) ?? (d.depositId as number);
          const name = (d.depositName as string) ?? (d.depositName as string);
          if (id != null && Number.isFinite(Number(id)) && name && String(name).trim()) {
            nameById.set(Number(id), String(name).trim());
          }
        }
      } catch {
        // ignora se falhar o parse dos deposits
      }
    }

    const seenIds = new Set<number>();
    const deposits: Deposit[] = [];

    for (const item of vendorsArray) {
      const id = (item.depositId as number | undefined) ?? (item.depositId as number | undefined);
      if (id != null && Number.isFinite(Number(id)) && !seenIds.has(Number(id))) {
        seenIds.add(Number(id));
        const numId = Number(id);
        const name = nameById.get(numId) ?? `Deposit ${numId}`;
        deposits.push({
          depositId: numId,
          depositName: name,
        });
      }
    }

    return deposits.sort((a, b) => a.depositId - b.depositId);
  } catch (error) {
    console.error("Error fetching deposits from vendors:", error);
    throw error;
  }
};

/**
 * Busca todos os depósitos (usa /bff/deposits)
 */
export const fetchDeposits = async (): Promise<Deposit[]> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    const response = await guardedFetch(`${API_BASE_URL}/bff/deposits`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch deposits. Status: ${response.status}, Response:`, errorText);
      throw new Error(`Failed to fetch deposits: ${response.statusText}`);
    }

    const data = await response.json();

    // Verificar se a resposta é um array ou se tem uma propriedade com o array
    let depositsArray: Array<Record<string, unknown>> = [];

    if (Array.isArray(data)) {
      depositsArray = data;
    } else if (data && typeof data === 'object' && 'deposits' in data && Array.isArray(data.deposits)) {
      depositsArray = data.deposits as Array<Record<string, unknown>>;
    } else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      depositsArray = data.data as Array<Record<string, unknown>>;
    } else if (data && typeof data === 'object' && 'result' in data && Array.isArray(data.result)) {
      depositsArray = data.result as Array<Record<string, unknown>>;
    }

    // Garantir que os dados estão no formato correto
    const mappedDeposits: Deposit[] = depositsArray.map((deposit: Record<string, unknown>) => ({
      depositId: (deposit.depositId as number) || (deposit.depositId as number) || 0,
      depositName: (deposit.depositName as string) || (deposit.depositName as string) || '',
      description: deposit.description as string | undefined,
      createdBy: deposit.createdBy as string | undefined,
      createdAt: deposit.createdAt as string | undefined,
      updatedAt: deposit.updatedAt as string | undefined,
      customerId: (deposit.customerId as number | undefined) || (deposit.customerId as number | undefined),
      servicePartnerId: deposit.servicePartnerId as number | string | undefined,
    }));

    return mappedDeposits;
  } catch (error) {
    console.error("Error fetching deposits:", error);
    throw error;
  }
};

/**
 * Cria um novo depósito
 */
export const createDeposit = async (depositData: CreateDepositInput): Promise<Deposit> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    const payload: Record<string, unknown> = {
      depositName: depositData.depositName,
    };

    if (depositData.description) payload.description = depositData.description;
    if (depositData.customerId !== undefined) payload.customerId = depositData.customerId;

    const createdBy = depositData.createdBy ?? getFullNameFromToken();
    if (createdBy) payload.createdBy = createdBy;

    const response = await guardedFetch(`${API_BASE_URL}/bff/deposits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to create deposit: ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        // keep fallback message
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    const depositRaw = data?.deposit || data?.data || data?.result || data;

    const mapDeposit = (deposit: Record<string, unknown>): Deposit => ({
      depositId: (deposit.depositId as number) || (deposit.depositId as number) || 0,
      depositName: (deposit.depositName as string) || (deposit.depositName as string) || '',
      description: deposit.description as string | undefined,
      createdBy: deposit.createdBy as string | undefined,
      createdAt: deposit.createdAt as string | undefined,
      updatedAt: deposit.updatedAt as string | undefined,
      customerId: (deposit.customerId as number | undefined) || (deposit.customerId as number | undefined),
      servicePartnerId: deposit.servicePartnerId as number | string | undefined,
    });

    if (Array.isArray(depositRaw)) {
      // Caso o backend retorne array (incomum em criação), pegar o primeiro
      return mapDeposit(depositRaw[0] as Record<string, unknown>);
    }

    if (depositRaw && typeof depositRaw === 'object') {
      return mapDeposit(depositRaw as Record<string, unknown>);
    }

    throw new Error('Unexpected response when creating deposit.');
  } catch (error) {
    console.error("Error creating deposit:", error);
    throw error;
  }
};

/**
 * Busca todos os vendor types (vendor types no backend)
 */
export const fetchVendorTypes = async (): Promise<VendorType[]> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    const response = await guardedFetch(`${API_BASE_URL}/bff/vendor-types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch vendor types: ${response.statusText}`);
    }

    const data = await response.json();

    let vendorTypesArray: Array<Record<string, unknown>> = [];
    if (Array.isArray(data)) {
      vendorTypesArray = data;
    } else if (data && typeof data === 'object' && 'vendorTypes' in data && Array.isArray(data.vendorTypes)) {
      vendorTypesArray = data.vendorTypes as Array<Record<string, unknown>>;
    } else if (data && typeof data === 'object' && 'vendorTypes' in data && Array.isArray(data.vendorTypes)) {
      vendorTypesArray = data.vendorTypes as Array<Record<string, unknown>>;
    } else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      vendorTypesArray = data.data as Array<Record<string, unknown>>;
    }

    // Garantir que os dados estão no formato correto
    return vendorTypesArray.map((dt: Record<string, unknown>): VendorType => ({
      vendorTypeId: (dt.vendorTypeId as number | undefined),
      nameType: (dt.nameType as string | undefined) || (dt.name as string | undefined),
      active: dt.active as boolean | undefined,
    }));
  } catch (error) {
    console.error("Error fetching vendor types:", error);
    throw error;
  }
};

/**
 * Busca todos os user types
 */
export const fetchUserTypes = async (): Promise<UserType[]> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    const response = await guardedFetch(`${API_BASE_URL}/bff/user-types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user types: ${response.statusText}`);
    }

    const data = await response.json();

    let userTypesArray: Array<Record<string, unknown>> = [];
    if (Array.isArray(data)) {
      userTypesArray = data;
    } else if (data && typeof data === 'object' && 'userTypes' in data && Array.isArray(data.userTypes)) {
      userTypesArray = data.userTypes as Array<Record<string, unknown>>;
    } else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      userTypesArray = data.data as Array<Record<string, unknown>>;
    }

    // Garantir que os dados estão no formato correto
    return userTypesArray.map((ut: Record<string, unknown>): UserType => ({
      userTypeId: (ut.userTypeId as number) || 0,
      nameType: (ut.nameType as string) || (ut.name as string) || '',
    }));
  } catch (error) {
    console.error("Error fetching user types:", error);
    throw error;
  }
};

/**
 * Busca todos os service partners
 */
export const fetchServicePartners = async (): Promise<ServicePartner[]> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    const response = await guardedFetch(`${API_BASE_URL}/bff/service-partners`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch service partners: ${response.statusText}`);
    }

    const data = await response.json();

    let servicePartnersArray: Array<Record<string, unknown>> = [];
    if (Array.isArray(data)) {
      servicePartnersArray = data;
    } else if (data && typeof data === 'object' && 'servicePartners' in data && Array.isArray(data.servicePartners)) {
      servicePartnersArray = data.servicePartners as Array<Record<string, unknown>>;
    } else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      servicePartnersArray = data.data as Array<Record<string, unknown>>;
    }

    return servicePartnersArray.map((sp: Record<string, unknown>): ServicePartner => ({
      servicePartnerId: (sp.servicePartnerId as number) || 0,
      partnerName: (sp.partnerName as string) || '',
      companyId: (sp.companyId as number) || 0,
      createdBy: (sp.createdBy as string) || '',
      createdAt: (sp.createdAt as string) || '',
      updatedAt: (sp.updatedAt as string) || '',
    }));
  } catch (error) {
    console.error("Error fetching service partners:", error);
    throw error;
  }
};

/**
 * Busca todas as rotas
 */
export const fetchRoutes = async (): Promise<Route[]> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    const response = await guardedFetch(`${API_BASE_URL}/bff/routes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch routes: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching routes:", error);
    throw error;
  }
};

/**
 * Busca todos os veículos
 */
export const fetchVehicles = async (): Promise<Vehicle[]> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    const response = await guardedFetch(`${API_BASE_URL}/bff/vehicles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch vehicles: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
};

/**
 * Busca todos os cost models (payment models)
 */
export const fetchCostModels = async (): Promise<CostModel[]> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    const response = await guardedFetch(`${API_BASE_URL}/bff/cost-models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cost models: ${response.statusText}`);
    }

    const data = await response.json();

    let costModelsArray: Array<Record<string, unknown>> = [];
    if (Array.isArray(data)) {
      costModelsArray = data;
    } else if (data && typeof data === 'object' && 'costModels' in data && Array.isArray(data.costModels)) {
      costModelsArray = data.costModels as Array<Record<string, unknown>>;
    } else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      costModelsArray = data.data as Array<Record<string, unknown>>;
    }

    // Filtrar costModelId 1, 2, 3, 4 e 7 (Hourly) para seleção no vendor
    return costModelsArray
      .filter((cm: Record<string, unknown>) => {
        const id = (cm.costModelId as number | undefined) || (cm.costModelId as number | undefined);
        return id === 1 || id === 2 || id === 3 || id === 4 || id === 7;
      })
      .map((cm: Record<string, unknown>): CostModel => ({
        costModelId: (cm.costModelId as number | undefined) || (cm.costModelId as number | undefined),
        name: (cm.name as string | undefined) || (cm.costModelName as string | undefined) || (cm.cost_model_name as string | undefined),
        active: cm.active as boolean | undefined,
      }));
  } catch (error) {
    console.error("Error fetching cost models:", error);
    throw error;
  }
};

/**
 * Deleta cost models de um vendor/user
 * @param userId - ID do vendor/user (formerly userId)
 * @param modelEmployeesIds - Array de IDs dos cost models a serem deletados
 */
export const deleteCostModels = async (userId: number, modelEmployeesIds: number[]): Promise<void> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    const response = await guardedFetch(`${API_BASE_URL}/bff/cost-model-employees/vendor/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify({
        modelEmployeesIds: modelEmployeesIds,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete cost models: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting cost models:", error);
    throw error;
  }
};

/**
 * Updates an existing deposit
 */
export const updateDeposit = async (
  depositId: number,
  depositData: Partial<CreateDepositInput>
): Promise<Deposit> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    // Validate depositId
    if (!depositId || depositId <= 0) {
      throw new Error('Invalid deposit ID. Please provide a valid deposit ID.');
    }

    // Prepare payload - only include fields that are provided
    const payload: Record<string, unknown> = {};
    if (depositData.depositName !== undefined && depositData.depositName !== null) {
      payload.depositName = depositData.depositName.trim();
    }
    if (depositData.description !== undefined && depositData.description !== null) {
      payload.description = depositData.description.trim() || null;
    }
    if (depositData.customerId !== undefined && depositData.customerId !== null) {
      payload.customerId = depositData.customerId;
    }

    // Helper function to map deposit response
    const mapDeposit = (deposit: Record<string, unknown>): Deposit => ({
      depositId: (deposit.depositId as number) || (deposit.depositId as number) || 0,
      depositName: (deposit.depositName as string) || (deposit.depositName as string) || '',
      description: deposit.description as string | undefined,
      createdBy: deposit.createdBy as string | undefined,
      createdAt: deposit.createdAt as string | undefined,
      updatedAt: deposit.updatedAt as string | undefined,
      customerId: (deposit.customerId as number | undefined) || (deposit.customerId as number | undefined),
      servicePartnerId: deposit.servicePartnerId as number | string | undefined,
    });

    // Helper function to process response
    const processResponse = (data: Record<string, unknown>): Deposit => {
      const depositRaw = data?.deposit || data?.data || data?.result || data;

      if (Array.isArray(depositRaw)) {
        return mapDeposit(depositRaw[0] as Record<string, unknown>);
      }

      if (depositRaw && typeof depositRaw === 'object') {
        return mapDeposit(depositRaw as Record<string, unknown>);
      }

      throw new Error('Unexpected response when updating deposit.');
    };

    // Try PATCH first
    try {
      const patchResponse = await guardedFetch(`${API_BASE_URL}/bff/deposits/${depositId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getBearerAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      if (patchResponse.ok) {
        const data = await patchResponse.json();
        return processResponse(data);
      }

      // If PATCH returns 404, try PUT
      if (patchResponse.status === 404) {
        console.warn('PATCH endpoint not found (404), trying PUT...');
      } else {
        const errorText = await patchResponse.text();
        let errorMessage = `Failed to update deposit: ${patchResponse.statusText}`;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          // keep fallback message
        }

        if (patchResponse.status === 404) {
          throw new Error(`Deposit with ID ${depositId} not found. The deposit may have been deleted or the ID is incorrect.`);
        }

        throw new Error(errorMessage);
      }
    } catch (patchError) {
      // If PATCH fails with network error, try PUT
      if (patchError instanceof Error && !patchError.message.includes('not found')) {
        console.warn('PATCH method failed, trying PUT...', patchError);
      } else {
        throw patchError;
      }
    }

    // Try PUT as fallback
    const putResponse = await guardedFetch(`${API_BASE_URL}/bff/deposits/${depositId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!putResponse.ok) {
      const errorText = await putResponse.text();
      let finalErrorMessage = `Failed to update deposit: ${putResponse.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        finalErrorMessage = errorJson.message || errorJson.error || finalErrorMessage;
      } catch {
        // keep fallback message
      }

      // If 404, provide more helpful error message
      if (putResponse.status === 404) {
        throw new Error(`Deposit with ID ${depositId} not found. The deposit may have been deleted or the ID is incorrect. Please verify the deposit exists.`);
      }

      throw new Error(finalErrorMessage);
    }

    const data = await putResponse.json();
    return processResponse(data);
  } catch (error) {
    console.error("Error updating deposit:", error);
    throw error;
  }
};

/**
 * Deletes a deposit
 */
export const deleteDeposit = async (depositId: number): Promise<void> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    const response = await guardedFetch(`${API_BASE_URL}/bff/deposits/${depositId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to delete deposit: ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        // keep fallback message
      }

      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Error deleting deposit:", error);
    throw error;
  }
};


