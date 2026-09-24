import { getApiBaseUrl } from "@/lib/apiBaseUrl";
﻿import { hasAuthSession, getBearerAuthHeader } from "./auth"

const API_BASE_URL = getApiBaseUrl();

// Fix Damage Deduction - based on backend DTO
export interface FixDamageDeduction {
  fixDamageId: number;
  referenceNumber: string;
  incidentDate: Date | string;
  description?: string;
  repairCost: number;
  totalRepairCost: number;
  amountChargedVendor: number;
  entryDate: Date | string;
  scheduleTerms?: string;
  userId: number;
  vehicleId: number;
  servicePartnerId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Traffic Penalty Deduction - based on backend DTO
export interface TrafficPenaltyDeduction {
  trafficPenaltyId: number;
  referenceNumber: string;
  vehicleId: number;
  pcnRef: string;
  amount: number;
  pcnDate: Date | string;
  issuingAuthority?: string;
  appealStatus?: string;
  paidBy?: string;
  paymentDate: Date | string;
  entryDate: Date | string;
  council?: string;
  userId: number;
  invoiceId?: number;
  servicePartnerId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Helper to parse numeric values from API (backend may return strings)
const toNum = (v: unknown): number | undefined => {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isNaN(n) ? undefined : n;
};

// Pre-Payment Deduction - based on backend DTO
export interface PrePaymentDeduction {
  prePaymentId: number;
  referenceNumber: string;
  paymentDate: Date | string;
  amount: number;
  totalAmount: number;
  feeValue?: number;
  description?: string;
  scheduleTerms?: string;
  entryDate: Date | string;
  userId: number;
  initialPaymentDate?: Date | string;
  servicePartnerId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Liquidation Damage Deduction - based on backend DTO
export interface LiquidationDamageDeduction {
  liquidationDamageId: number;
  referenceNumber: string;
  routeId: number;
  userId: number;
  code?: string;
  description: string;
  amount: number;
  awbBooking?: string;
  liquidationDate: Date | string;
  paymentDate: Date | string;
  entryDate: Date | string;
  failureCode?: string;
  paidBy?: string;
  invoiceId?: number;
  servicePartnerId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  /** Vendor/vendor name (pode vir do backend na listagem) */
  vendor?: string | null;
  vendorName?: string | null;
  /** Vehicle (nome ou identificação) */
  vehicle?: string | null;
  vehicleName?: string | null;
  vehicleId?: number | null;
  /** Termos de pagamento/agendamento */
  scheduleTerms?: string | null;
}

// Other Deduction - based on backend DTO
export interface OtherDeduction {
  otherDeductionId: number;
  referenceNumber: string;
  incidentDate: Date | string;
  description?: string;
  detail?: string;
  totalAmount: number;
  scheduleTerms?: string;
  entryDate: Date | string;
  userId: number;
  servicePartnerId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Create DTOs
export interface FixDamageDeductionCreateDTO {
  referenceNumber: string;
  incidentDate: Date | string;
  description?: string;
  repairCost: number;
  totalRepairCost: number;
  amountChargedVendor: number;
  entryDate?: Date | string;
  /** Data em que a dedução será cobrada. entry_date espelha e as installments começam aqui. */
  paymentDate?: Date | string;
  scheduleTerms?: string;
  userId: number;
  vehicleId: number;
  servicePartnerId?: number;
}

export interface TrafficPenaltyDeductionCreateDTO {
  referenceNumber: string;
  vehicleId: number;
  pcnRef: string;
  amount: number;
  pcnDate: Date | string;
  issuingAuthority?: string;
  appealStatus?: string;
  paidBy?: string;
  paymentDate: Date | string;
  entryDate: Date | string;
  council?: string;
  userId: number;
  servicePartnerId?: number;
}

export interface PrePaymentDeductionCreateDTO {
  referenceNumber: string;
  paymentDate: Date | string;
  amount: number;
  totalAmount: number;
  feeValue?: number;
  description?: string;
  scheduleTerms?: string;
  entryDate: Date | string;
  userId: number;
  initialPaymentDate?: Date | string;
  servicePartnerId?: number;
}

export interface PrePaymentDeductionUpdateDTO {
  referenceNumber?: string;
  paymentDate?: Date | string;
  amount?: number;
  totalAmount?: number;
  feeValue?: number;
  description?: string;
  scheduleTerms?: string;
  entryDate?: Date | string;
  userId?: number;
  initialPaymentDate?: Date | string;
  servicePartnerId?: number;
}

export interface LiquidationDamageDeductionCreateDTO {
  referenceNumber: string;
  routeId: number;
  userId: number;
  code?: string;
  description: string;
  amount: number;
  awbBooking?: string;
  liquidationDate: Date | string;
  paymentDate: Date | string;
  entryDate: Date | string;
  failureCode?: string;
  paidBy?: string;
  servicePartnerId?: number;
}

export interface OtherDeductionCreateDTO {
  referenceNumber: string;
  incidentDate: Date | string;
  description?: string;
  detail?: string;
  totalAmount: number;
  scheduleTerms?: string;
  entryDate: Date | string;
  /** Data em que a dedução será cobrada. entry_date espelha e as installments começam aqui. */
  paymentDate?: Date | string;
  userId: number;
  servicePartnerId?: number;
}

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
      if (value !== undefined && value !== null) {
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
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `Failed to ${method} ${endpoint} (${response.status})`
      );
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in API call to ${endpoint}:`, error);
    throw error;
  }
};

// ==================== Fix Damage Deductions ====================

export const fetchFixDamageDeductions = async (month?: number, year?: number, servicePartnerId?: number): Promise<FixDamageDeduction[]> => {
  const queryParams: Record<string, number | undefined> = {};
  if (month !== undefined) queryParams.month = month;
  if (year !== undefined) queryParams.year = year;
  if (servicePartnerId !== undefined) queryParams.servicePartnerId = servicePartnerId;

  const data = await apiCall<FixDamageDeduction[] | FixDamageInstallment[] | { fixDamageDeductions?: FixDamageDeduction[] }>(
    "/fix-damage-deductions",
    "GET",
    undefined,
    queryParams
  );

  // Check if data is an array of installments (has fixDamageInstallmentsId) or deductions (has fixDamageId)
  if (Array.isArray(data) && data.length > 0) {
    // If first item has fixDamageInstallmentsId, it's installments, return empty array
    if ('fixDamageInstallmentsId' in data[0]) {
      return [];
    }
    // Otherwise, it's deductions
    return data as FixDamageDeduction[];
  }

  if (data && typeof data === 'object' && 'fixDamageDeductions' in data) {
    return (data as { fixDamageDeductions: FixDamageDeduction[] }).fixDamageDeductions || [];
  }
  return [];
};

export const fetchFixDamageDeductionById = async (
  id: number
): Promise<FixDamageDeduction> => {
  return await apiCall<FixDamageDeduction>(`/fix-damage-deductions/${id}`);
};

export const createFixDamageDeduction = async (
  data: FixDamageDeductionCreateDTO
): Promise<FixDamageDeduction> => {
  return await apiCall<FixDamageDeduction>("/fix-damage-deductions", "POST", data);
};

export const updateFixDamageDeduction = async (
  id: number,
  data: Partial<FixDamageDeductionCreateDTO>
): Promise<FixDamageDeduction> => {
  return await apiCall<FixDamageDeduction>(`/fix-damage-deductions/${id}`, "PATCH", data);
};

export const deleteFixDamageDeduction = async (id: number): Promise<void> => {
  await apiCall(`/fix-damage-deductions/${id}`, "DELETE");
};

// ==================== Traffic Penalty Deductions ====================

export const fetchTrafficPenaltyDeductions = async (month?: number, year?: number, servicePartnerId?: number): Promise<TrafficPenaltyDeduction[]> => {
  const queryParams: Record<string, number | undefined> = {};
  if (month !== undefined) queryParams.month = month;
  if (year !== undefined) queryParams.year = year;
  if (servicePartnerId !== undefined) queryParams.servicePartnerId = servicePartnerId;

  const data = await apiCall<TrafficPenaltyDeduction[] | { trafficPenaltyDeductions?: TrafficPenaltyDeduction[] }>(
    "/traffic-penalty-deductions",
    "GET",
    undefined,
    queryParams
  );
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && 'trafficPenaltyDeductions' in data) {
    return (data as { trafficPenaltyDeductions: TrafficPenaltyDeduction[] }).trafficPenaltyDeductions || [];
  }
  return [];
};

export const fetchTrafficPenaltyDeductionById = async (
  id: number
): Promise<TrafficPenaltyDeduction> => {
  return await apiCall<TrafficPenaltyDeduction>(`/traffic-penalty-deductions/${id}`);
};

export const createTrafficPenaltyDeduction = async (
  data: TrafficPenaltyDeductionCreateDTO
): Promise<TrafficPenaltyDeduction> => {
  return await apiCall<TrafficPenaltyDeduction>("/traffic-penalty-deductions", "POST", data);
};

export const updateTrafficPenaltyDeduction = async (
  id: number,
  data: Partial<TrafficPenaltyDeductionCreateDTO>
): Promise<TrafficPenaltyDeduction> => {
  return await apiCall<TrafficPenaltyDeduction>(`/traffic-penalty-deductions/${id}`, "PATCH", data);
};

export const deleteTrafficPenaltyDeduction = async (id: number): Promise<void> => {
  await apiCall(`/traffic-penalty-deductions/${id}`, "DELETE");
};

// ==================== Pre-Payment Deductions ====================

/** Normalize PrePaymentDeduction from API (amount, totalAmount, feeValue may come as strings) */
const normalizePrePaymentDeduction = (raw: PrePaymentDeduction): PrePaymentDeduction => {
  const amount = toNum(raw.amount) ?? toNum(raw.totalAmount) ?? 0;
  const totalAmount = toNum(raw.totalAmount) ?? amount;
  const feeValue = toNum(raw.feeValue);
  return {
    ...raw,
    prePaymentId: Number(raw.prePaymentId) || 0,
    referenceNumber: String(raw.referenceNumber ?? ''),
    paymentDate: raw.paymentDate as Date | string,
    amount,
    totalAmount: totalAmount,
    feeValue: feeValue,
    entryDate: raw.entryDate as Date | string,
    userId: Number(raw.userId) || 0,
    initialPaymentDate: raw.initialPaymentDate as Date | string | undefined,
  } as PrePaymentDeduction;
};

export const fetchPrePaymentDeductions = async (month?: number, year?: number, servicePartnerId?: number): Promise<PrePaymentDeduction[]> => {
  const queryParams: Record<string, number | undefined> = {};
  if (month !== undefined) queryParams.month = month;
  if (year !== undefined) queryParams.year = year;
  if (servicePartnerId !== undefined) queryParams.servicePartnerId = servicePartnerId;

  const data = await apiCall<PrePaymentDeduction[] | PrePaymentInstallment[] | { prePaymentDeductions?: PrePaymentDeduction[] }>(
    "/pre-payment-deductions",
    "GET",
    undefined,
    queryParams
  );

  // Check if data is an array of installments (has prePaymentInstallmentsId) or deductions (has prePaymentId)
  if (Array.isArray(data) && data.length > 0) {
    // If first item has prePaymentInstallmentsId, it's installments, return empty array
    if ('prePaymentInstallmentsId' in data[0]) {
      return [];
    }
    // Otherwise, it's deductions - normalize to ensure feeValue, amount, totalAmount are numbers
    return (data as PrePaymentDeduction[]).map((item) => normalizePrePaymentDeduction(item));
  }

  if (data && typeof data === 'object' && 'prePaymentDeductions' in data) {
    const arr = (data as { prePaymentDeductions: PrePaymentDeduction[] }).prePaymentDeductions || [];
    return arr.map((item) => normalizePrePaymentDeduction(item));
  }
  return [];
};

export const fetchPrePaymentDeductionById = async (
  id: number
): Promise<PrePaymentDeduction> => {
  const data = await apiCall<PrePaymentDeduction>(`/pre-payment-deductions/${id}`);
  return normalizePrePaymentDeduction(data ?? {});
};

export const createPrePaymentDeduction = async (
  data: PrePaymentDeductionCreateDTO
): Promise<PrePaymentDeduction> => {
  return await apiCall<PrePaymentDeduction>("/pre-payment-deductions", "POST", data);
};

export const updatePrePaymentDeduction = async (
  id: number,
  data: PrePaymentDeductionUpdateDTO
): Promise<PrePaymentDeduction> => {
  return await apiCall<PrePaymentDeduction>(`/pre-payment-deductions/${id}`, "PATCH", data);
};

export const deletePrePaymentDeduction = async (id: number): Promise<void> => {
  await apiCall(`/pre-payment-deductions/${id}`, "DELETE");
};

// ==================== Liquidation Damage Deductions ====================

export const fetchLiquidationDamageDeductions = async (month?: number, year?: number, servicePartnerId?: number): Promise<LiquidationDamageDeduction[]> => {
  const queryParams: Record<string, number | undefined> = {};
  if (month !== undefined) queryParams.month = month;
  if (year !== undefined) queryParams.year = year;
  if (servicePartnerId !== undefined) queryParams.servicePartnerId = servicePartnerId;

  const data = await apiCall<LiquidationDamageDeduction[] | { liquidationDamageDeductions?: LiquidationDamageDeduction[] }>(
    "/liquidation-damage-deductions",
    "GET",
    undefined,
    queryParams
  );
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && 'liquidationDamageDeductions' in data) {
    return (data as { liquidationDamageDeductions: LiquidationDamageDeduction[] }).liquidationDamageDeductions || [];
  }
  return [];
};

export const fetchLiquidationDamageDeductionById = async (
  id: number
): Promise<LiquidationDamageDeduction> => {
  return await apiCall<LiquidationDamageDeduction>(`/liquidation-damage-deductions/${id}`);
};

export const createLiquidationDamageDeduction = async (
  data: LiquidationDamageDeductionCreateDTO
): Promise<LiquidationDamageDeduction> => {
  return await apiCall<LiquidationDamageDeduction>("/liquidation-damage-deductions", "POST", data);
};

export const updateLiquidationDamageDeduction = async (
  id: number,
  data: Partial<LiquidationDamageDeductionCreateDTO>
): Promise<LiquidationDamageDeduction> => {
  return await apiCall<LiquidationDamageDeduction>(`/liquidation-damage-deductions/${id}`, "PATCH", data);
};

export const deleteLiquidationDamageDeduction = async (id: number): Promise<void> => {
  await apiCall(`/liquidation-damage-deductions/${id}`, "DELETE");
};

// ==================== Other Deductions ====================

export const fetchOtherDeductions = async (month?: number, year?: number, servicePartnerId?: number): Promise<OtherDeduction[]> => {
  const queryParams: Record<string, number | undefined> = {};
  if (month !== undefined) queryParams.month = month;
  if (year !== undefined) queryParams.year = year;
  if (servicePartnerId !== undefined) queryParams.servicePartnerId = servicePartnerId;

  const data = await apiCall<OtherDeduction[] | OtherInstallment[] | { otherDeductions?: OtherDeduction[] }>(
    "/other-deductions",
    "GET",
    undefined,
    queryParams
  );

  // Check if data is an array of installments (has otherInstallmentsId) or deductions (has otherDeductionId)
  if (Array.isArray(data) && data.length > 0) {
    // If first item has otherInstallmentsId, it's installments, return empty array
    if ('otherInstallmentsId' in data[0]) {
      return [];
    }
    // Otherwise, it's deductions
    return data as OtherDeduction[];
  }

  if (data && typeof data === 'object' && 'otherDeductions' in data) {
    return (data as { otherDeductions: OtherDeduction[] }).otherDeductions || [];
  }
  return [];
};

export const fetchOtherDeductionById = async (id: number): Promise<OtherDeduction> => {
  return await apiCall<OtherDeduction>(`/other-deductions/${id}`);
};

export const createOtherDeduction = async (
  data: OtherDeductionCreateDTO
): Promise<OtherDeduction> => {
  return await apiCall<OtherDeduction>("/other-deductions", "POST", data);
};

export const updateOtherDeduction = async (
  id: number,
  data: Partial<OtherDeductionCreateDTO>
): Promise<OtherDeduction> => {
  return await apiCall<OtherDeduction>(`/other-deductions/${id}`, "PATCH", data);
};

export const deleteOtherDeduction = async (id: number): Promise<void> => {
  await apiCall(`/other-deductions/${id}`, "DELETE");
};

// ==================== Installment Types ====================

export interface FixDamageInstallment {
  fixDamageInstallmentsId: number;
  invoiceId: number | null;
  installmentDate: Date | string;
  installmentValue: string;
  paymentDate: Date | string;
  createdBy: number | null;
  createdAt: Date | string;
  updatedAt: Date | string | null;
  fixDamageId: number;
  referenceNumber: string;
  userId: number;
}

export interface PrePaymentInstallment {
  prePaymentInstallmentsId: number;
  invoiceId: number | null;
  installmentDate: Date | string;
  installmentValue: string;
  paymentDate: Date | string;
  createdBy: number | null;
  createdAt: Date | string;
  updatedAt: Date | string | null;
  prePaymentId: number;
  referenceNumber: string;
  userId: number;
}

export interface OtherInstallment {
  otherInstallmentsId: number;
  invoiceId: number | null;
  installmentDate: Date | string;
  installmentValue: string;
  paymentDate: Date | string;
  createdBy: number | null;
  createdAt: Date | string;
  updatedAt: Date | string | null;
  otherDeductionId: number;
  referenceNumber: string;
  userId: number;
}

// ==================== Installment Fetch Functions ====================

export const fetchFixDamageInstallments = async (month?: number, year?: number, servicePartnerId?: number): Promise<FixDamageInstallment[]> => {
  const queryParams: Record<string, number | undefined> = {};
  if (month !== undefined) queryParams.month = month;
  if (year !== undefined) queryParams.year = year;
  if (servicePartnerId !== undefined) queryParams.servicePartnerId = servicePartnerId;

  const data = await apiCall<FixDamageDeduction[] | FixDamageInstallment[]>(
    "/fix-damage-deductions",
    "GET",
    undefined,
    queryParams
  );

  // Check if data is an array of installments (has fixDamageInstallmentsId) or deductions (has fixDamageId)
  if (Array.isArray(data) && data.length > 0) {
    // If first item has fixDamageInstallmentsId, it's installments
    if ('fixDamageInstallmentsId' in data[0]) {
      return data as FixDamageInstallment[];
    }
    // Otherwise, it's deductions, return empty array
    return [];
  }

  return [];
};

export const fetchPrePaymentInstallments = async (month?: number, year?: number, servicePartnerId?: number): Promise<PrePaymentInstallment[]> => {
  const queryParams: Record<string, number | undefined> = {};
  if (month !== undefined) queryParams.month = month;
  if (year !== undefined) queryParams.year = year;
  if (servicePartnerId !== undefined) queryParams.servicePartnerId = servicePartnerId;

  const data = await apiCall<PrePaymentDeduction[] | PrePaymentInstallment[]>(
    "/pre-payment-deductions",
    "GET",
    undefined,
    queryParams
  );

  // Check if data is an array of installments (has prePaymentInstallmentsId) or deductions (has prePaymentId)
  if (Array.isArray(data) && data.length > 0) {
    // If first item has prePaymentInstallmentsId, it's installments
    if ('prePaymentInstallmentsId' in data[0]) {
      return data as PrePaymentInstallment[];
    }
    // Otherwise, it's deductions, return empty array
    return [];
  }

  return [];
};

export const fetchOtherInstallments = async (month?: number, year?: number, servicePartnerId?: number): Promise<OtherInstallment[]> => {
  const queryParams: Record<string, number | undefined> = {};
  if (month !== undefined) queryParams.month = month;
  if (year !== undefined) queryParams.year = year;
  if (servicePartnerId !== undefined) queryParams.servicePartnerId = servicePartnerId;

  const data = await apiCall<OtherDeduction[] | OtherInstallment[]>(
    "/other-deductions",
    "GET",
    undefined,
    queryParams
  );

  // Check if data is an array of installments (has otherInstallmentsId) or deductions (has otherDeductionId)
  if (Array.isArray(data) && data.length > 0) {
    // If first item has otherInstallmentsId, it's installments
    if ('otherInstallmentsId' in data[0]) {
      return data as OtherInstallment[];
    }
    // Otherwise, it's deductions, return empty array
    return [];
  }

  return [];
};

// ==================== Helper Functions ====================

/**
 * Maps frontend category names to backend deduction types
 */
export const mapCategoryToType = (category: string): string => {
  const mapping: Record<string, string> = {
    "Repairs & Damages": "fix-damage",
    "Traffic Penalties": "traffic-penalty",
    "Pre-Payments": "pre-payment",
    "Liquidation Damages": "liquidation-damage",
    "Other": "other",
  };
  return mapping[category] || category.toLowerCase().replace(/\s+/g, "-");
};

/**
 * Fetches all deductions of all types
 */
export const fetchAllDeductions = async (month?: number, year?: number, servicePartnerId?: number): Promise<{
  fixDamage: FixDamageDeduction[];
  trafficPenalty: TrafficPenaltyDeduction[];
  prePayment: PrePaymentDeduction[];
  liquidationDamage: LiquidationDamageDeduction[];
  other: OtherDeduction[];
}> => {
  const [fixDamage, trafficPenalty, prePayment, liquidationDamage, other] =
    await Promise.all([
      fetchFixDamageDeductions(month, year, servicePartnerId),
      fetchTrafficPenaltyDeductions(month, year, servicePartnerId),
      fetchPrePaymentDeductions(month, year, servicePartnerId),
      fetchLiquidationDamageDeductions(month, year, servicePartnerId),
      fetchOtherDeductions(month, year, servicePartnerId),
    ]);

  return {
    fixDamage,
    trafficPenalty,
    prePayment,
    liquidationDamage,
    other,
  };
};


