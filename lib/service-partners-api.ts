import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { hasAuthSession, getBearerAuthHeader } from './auth';
import { BUSINESS_RULES } from '@/src/constants/businessRules';
import { guardedFetch } from "@/lib/in-flight-guard";

const API_BASE_URL = getApiBaseUrl();

/**
 * Cost model vinculado a um service partner. Para service partner aplica-se
 * apenas o SP_VSR (BUSINESS_RULES.COST_MODEL.SP_VSR = 12), com faixas de stops.
 */
export interface CostModelServicePartnerItem {
  costModelServicePartnerId?: number;
  costModelId: number;
  minStops?: number | null;
  maxStops?: number | null;
  fixedPrice?: number | null;
  pricePerStop?: number | null;
  description?: string | null;
  validityStartDate?: string | null;
  validityEndDate?: string | null;
  isElectric?: boolean | null;
}

/**
 * Form plano das 4 faixas de um período SP_VSR usado no ServicePartnerModal.
 * Elétrico e não-elétrico são tratados como dois grupos de cost model
 * independentes (cada um com seus próprios períodos) em vez de uma flag por
 * período — por isso não há campo `isElectric` aqui.
 */
export interface ServicePartnerSpVsrForm {
  band1MaxStops?: string;
  band1Rate?: string;
  band2MaxStops?: string;
  band2Rate?: string;
  band3MaxStops?: string;
  band3Rate?: string;
  band4MaxStops?: string;
  band4Rate?: string;
  validityStartDate?: string;
  validityEndDate?: string;
}

const SP_VSR_ID = BUSINESS_RULES.COST_MODEL.SP_VSR; // 12

const spNum = (v?: string | number | null): number | undefined => {
  if (v === undefined || v === null || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const spDate = (v?: string | null): string | undefined => {
  if (!v) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
};

/**
 * Converte o form das 4 faixas em uma lista de cost models SP_VSR para o backend.
 * Cada faixa com rate vira um registro (costModelId=12). minStops e derivado:
 * faixa1 comeca em 1; faixaN comeca em (maxStops da faixa anterior + 1).
 * `isElectric` é decidido pelo grupo (SP_VSR vs SP_VSR Electric), não por período.
 */
export function buildSpVsrCostModels(form: ServicePartnerSpVsrForm, isElectric: boolean): CostModelServicePartnerItem[] {
  const bands = [
    { max: form.band1MaxStops, rate: form.band1Rate },
    { max: form.band2MaxStops, rate: form.band2Rate },
    { max: form.band3MaxStops, rate: form.band3Rate },
    { max: form.band4MaxStops, rate: form.band4Rate },
  ];
  const out: CostModelServicePartnerItem[] = [];
  let prevMax = 0;
  for (const b of bands) {
    const rate = spNum(b.rate);
    const max = spNum(b.max);
    if (rate === undefined && max === undefined) continue;
    const minStops = prevMax + 1;
    const maxStops = max ?? minStops;
    out.push({
      costModelId: SP_VSR_ID,
      minStops,
      maxStops,
      pricePerStop: rate ?? 0,
      fixedPrice: 0,
      isElectric,
      validityStartDate: spDate(form.validityStartDate),
      validityEndDate: spDate(form.validityEndDate),
    });
    prevMax = maxStops;
  }
  return out;
}

export interface SpVsrPeriodGroup {
  date: string;
  items: CostModelServicePartnerItem[];
}

/**
 * Agrupa os cost models SP_VSR existentes (de um único grupo: elétrico OU
 * não-elétrico) por validityStartDate (um grupo = um período de até 4 faixas),
 * ordenado do período mais recente para o mais antigo.
 */
export function groupSpVsrPeriods(costModels: CostModelServicePartnerItem[] | undefined, isElectric: boolean): SpVsrPeriodGroup[] {
  if (!costModels || costModels.length === 0) return [];
  const grouped = new Map<string, CostModelServicePartnerItem[]>();
  costModels
    .filter((cm) => Number(cm.costModelId) === SP_VSR_ID && !!cm.isElectric === isElectric)
    .forEach((cm) => {
      const date = spDate(cm.validityStartDate);
      if (!date) return;
      if (!grouped.has(date)) grouped.set(date, []);
      grouped.get(date)!.push(cm);
    });
  return Array.from(grouped.entries())
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    .map(([date, items]) => ({ date, items }));
}

/** Converte as faixas de um único período SP_VSR (do backend) de volta para o form. */
export function parseSpVsrToForm(costModels?: CostModelServicePartnerItem[]): ServicePartnerSpVsrForm {
  const form: ServicePartnerSpVsrForm = {};
  if (!costModels || costModels.length === 0) return form;
  const bands = [...costModels].sort((a, b) => (a.minStops ?? 0) - (b.minStops ?? 0)).slice(0, 4);
  bands.forEach((cm, i) => {
    const n = i + 1;
    (form as unknown as Record<string, string>)[`band${n}MaxStops`] = cm.maxStops != null ? String(cm.maxStops) : '';
    (form as unknown as Record<string, string>)[`band${n}Rate`] = cm.pricePerStop != null ? String(cm.pricePerStop) : '';
    if (cm.validityStartDate) form.validityStartDate = spDate(cm.validityStartDate);
    if (cm.validityEndDate) form.validityEndDate = spDate(cm.validityEndDate);
  });
  return form;
}
export interface ServicePartnerDTO {
  servicePartnerId: number;
  partnerName: string;
  companyId: number;
  companyName?: string;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  address?: string | null;
  phone?: string | null;
  vatNumber?: string | null;
  /** Cost models (SP_VSR) atrelados ao service partner. */
  costModels?: CostModelServicePartnerItem[];
  dailyServiceCharge: number;
  /** Rate used for the automatic Congestion Charge Reimbursement created alongside a Daily ServiceCharge deduction. */
  reimbursement: number;
}

export interface ServicePartnerCreateDTO {
  partnerName: string;
  createdBy: string;
  address?: string;
  phone?: string;
  vatNumber?: string;
  companyId?: number | null;
  /** Cost models (SP_VSR) do service partner. */
  costModels?: CostModelServicePartnerItem[];
  dailyServiceCharge: number;
  reimbursement: number;
}

export interface ServicePartnerUpdateDTO {
  partnerName?: string;
  address?: string;
  phone?: string;
  vatNumber?: string;
  companyId?: number | null;
  /** Cost models (SP_VSR) do service partner. */
  costModels?: CostModelServicePartnerItem[];
  dailyServiceCharge: number;
  reimbursement: number;
}

/** A single vendor's aggregated total within a service partner for a month. */
export interface ServicePartnerMonthlyVendorDTO {
  userId: number | null;
  vendorName: string;
  total: number;
  invoiceCount: number;
}

/** Monthly invoice summary aggregated for a single service partner. */
export interface ServicePartnerMonthlySummaryDTO {
  servicePartnerId: number;
  servicePartnerName: string | null;
  month: number;
  year: number;
  total: number;
  invoiceCount: number;
  vendors: ServicePartnerMonthlyVendorDTO[];
}

/** A single billable operation line within a service partner's monthly invoice. */
export interface ServicePartnerInvoiceItemDTO {
  operationId: number;
  routeId: number;
  routeName: string;
  note: string;
  totalStops: number;
  amount: number;
  date: string;
}

export interface ServicePartnerInvoiceDeductionDTO {
  servicePartnerDeductionId: number;
  referenceNumber: string | null;
  description: string | null;
  deductionAmount: number;
  reimbursementsAmount: number;
  incidentDate: string | null;
  entryDate: string | null;
}

/**
 * A service partner's monthly invoice, item by item. Source: billable
 * operations of the month (backend `getInvoicesByServicePartnerId`).
 */
export interface ServicePartnerInvoiceDTO {
  /** Present once the invoice has been generated/persisted; absent on un-invoiced previews. */
  servicePartnerInvoiceId?: number;
  /** Invoice number (e.g., "SP 000123"). Present once the invoice has been generated. */
  invoiceNumber?: string;
  companyId: number;
  companyName: string;
  servicePartnerId: number;
  servicePartnerName: string;
  /** Service partner details: address, phone, VAT number. */
  servicePartnerAddress?: string | null;
  servicePartnerPhone?: string | null;
  servicePartnerVatNumber?: string | null;
  /** Period stamp formatted as `MMYYYY` by the backend. */
  date: string;
  /** Gross sum of `itens` amounts, before deductions/reimbursements. */
  amountTotal: number;
  /** 20% of (amountTotal - totalDeductions + totalReimbursements), applied AFTER deductions, when the service partner has a VAT number on file. */
  totalVat: number;
  totalDeductions: number;
  totalReimbursements: number;
  /** (amountTotal - totalDeductions + totalReimbursements) + totalVat. */
  netTotal: number;
  itens: ServicePartnerInvoiceItemDTO[];
  deductions: ServicePartnerInvoiceDeductionDTO[];
}

const defaultHeaders = () => ({
  'Content-Type': 'application/json',
  ...getBearerAuthHeader(),
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
});

function assertReady() {
  if (!API_BASE_URL) throw new Error('API URL is not configured. Please check your environment variables.');
  if (!hasAuthSession()) throw new Error('Authentication token not found. Please login again.');
}

async function parseError(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    return data.message || data.error || `${response.status} ${response.statusText}`;
  } catch {
    return text || `${response.status} ${response.statusText}`;
  }
}

function normalizeArray(raw: unknown): ServicePartnerDTO[] {
  let arr: unknown[] = [];

  if (Array.isArray(raw)) {
    arr = raw;
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data)) arr = obj.data;
    else if (Array.isArray(obj.result)) arr = obj.result;
    else if (Array.isArray(obj.items)) arr = obj.items;
  }

  // Convert servicePartnerId to number if it's a string
  return arr.map((item) => {
    const record = item as Record<string, unknown>;
    return {
      ...record,
      servicePartnerId: typeof record.servicePartnerId === 'string'
        ? parseInt(record.servicePartnerId, 10)
        : record.servicePartnerId
    };
  }) as ServicePartnerDTO[];
}

export function invalidateServicePartnersCache() {
  // Kept for existing callers; service partners are no longer cached client-side.
}

export async function fetchServicePartners(): Promise<ServicePartnerDTO[]> {
  assertReady();
  const url = `${API_BASE_URL}/bff/service-partners`;
  const response = await guardedFetch(url, {
    method: 'GET',
    headers: defaultHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Failed to fetch service partners: ${await parseError(response)}`);
  return normalizeArray(await response.json());
}

export async function fetchServicePartnerById(servicePartnerId: number): Promise<ServicePartnerDTO> {
  assertReady();
  const response = await guardedFetch(`${API_BASE_URL}/bff/service-partners/${servicePartnerId}`, {
    method: 'GET',
    headers: defaultHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Failed to fetch service partner: ${await parseError(response)}`);
  const raw = await response.json();
  return (raw?.data ?? raw) as ServicePartnerDTO;
}

/**
 * Fetches the monthly invoice summary (total + per-vendor breakdown) for a
 * single service partner. The aggregation is performed by the backend.
 */
export async function fetchServicePartnerMonthlySummary(
  servicePartnerId: number,
  month: number,
  year: number,
): Promise<ServicePartnerMonthlySummaryDTO> {
  assertReady();
  const qs = new URLSearchParams({ month: String(month), year: String(year) });
  const response = await guardedFetch(
    `${API_BASE_URL}/bff/service-partners/${servicePartnerId}/monthly-summary?${qs.toString()}`,
    { method: 'GET', headers: defaultHeaders(), cache: 'no-store' },
  );
  if (!response.ok) throw new Error(`Failed to fetch service partner monthly summary: ${await parseError(response)}`);
  const raw = await response.json();
  return (raw?.data ?? raw) as ServicePartnerMonthlySummaryDTO;
}

export async function createServicePartner(data: ServicePartnerCreateDTO): Promise<ServicePartnerDTO> {
  assertReady();
  const response = await guardedFetch(`${API_BASE_URL}/bff/service-partners`, {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to create service partner: ${await parseError(response)}`);
  const raw = await response.json();
  invalidateServicePartnersCache();
  return (raw?.data ?? raw) as ServicePartnerDTO;
}

export async function updateServicePartner(servicePartnerId: number, data: ServicePartnerUpdateDTO): Promise<ServicePartnerDTO> {
  assertReady();
  const response = await guardedFetch(`${API_BASE_URL}/bff/service-partners/${servicePartnerId}`, {
    method: 'PATCH',
    headers: defaultHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to update service partner: ${await parseError(response)}`);
  const raw = await response.json();
  invalidateServicePartnersCache();
  return (raw?.data ?? raw) as ServicePartnerDTO;
}

export async function deleteServicePartner(servicePartnerId: number): Promise<void> {
  assertReady();
  const response = await guardedFetch(`${API_BASE_URL}/bff/service-partners/${servicePartnerId}`, {
    method: 'DELETE',
    headers: defaultHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to delete service partner: ${await parseError(response)}`);
  invalidateServicePartnersCache();
}

export interface ServicePartnerInvoiceSummaryDTO {
  companyId: number;
  companyName: string;
  servicePartnerId: number;
  servicePartnerName: string;
  date: string;
  amountTotal: number;
}

export interface GeneratedSPInvoiceDTO {
  service_partner_invoice_id: number;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_stops: number;
  total_stops_value: number;
  total_deductions: number;
  total_reimbursements: number;
  subtotal_deductions: number;
  total_vat: number;
  subtotal: number;
  service_partner_id: number;
  service_partner_name?: string;
  company_id: number;
}

export interface GenerateSPInvoiceResultDTO {
  total: number;
  created: number;
  failed: number;
  invoices: GeneratedSPInvoiceDTO[];
  errors: { service_partner_id: number; error: string }[];
}

export async function fetchServicePartnersWithoutInvoice(
  month: number,
  year: number,
): Promise<ServicePartnerDTO[]> {
  assertReady();
  const response = await guardedFetch(
    `${API_BASE_URL}/bff/service-partners/without-invoice/${month}/${year}`,
    { method: 'GET', headers: defaultHeaders(), cache: 'no-store' },
  );
  if (!response.ok) throw new Error(`Failed to fetch service partners without invoice: ${await parseError(response)}`);
  const raw = await response.json();
  return normalizeArray(Array.isArray(raw) ? raw : (raw?.data ?? raw ?? []));
}

export async function generateServicePartnerInvoices(params: {
  service_partner_ids: number[];
  month: number;
  year: number;
}): Promise<GenerateSPInvoiceResultDTO> {
  assertReady();
  const response = await guardedFetch(`${API_BASE_URL}/bff/service-partner-invoices/generate`, {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error(`Failed to generate invoices: ${await parseError(response)}`);
  return (await response.json()) as GenerateSPInvoiceResultDTO;
}

export async function fetchServicePartnerInvoices(
  month: number,
  year: number,
  servicePartnerId?: number,
): Promise<ServicePartnerInvoiceDTO[]> {
  assertReady();
  const qs = new URLSearchParams({ month: String(month), year: String(year) });
  if (servicePartnerId !== undefined) qs.set('servicePartnerId', String(servicePartnerId));
  const response = await guardedFetch(
    `${API_BASE_URL}/bff/invoices/service-partner?${qs.toString()}`,
    { method: 'GET', headers: defaultHeaders(), cache: 'no-store' },
  );
  if (!response.ok) throw new Error(`Failed to fetch service partner invoices: ${await parseError(response)}`);
  if (response.status === 204) return [];
  const raw = await response.json();
  // API may return a single object or an array (with or without a .data wrapper)
  if (Array.isArray(raw)) return raw as ServicePartnerInvoiceDTO[];
  if (raw?.data !== undefined) {
    const inner = raw.data;
    return (Array.isArray(inner) ? inner : [inner]) as ServicePartnerInvoiceDTO[];
  }
  return (raw && typeof raw === 'object' ? [raw] : []) as ServicePartnerInvoiceDTO[];
}

/**
 * Fetches a single already-generated service partner invoice by its id.
 * Use this (not month/year/servicePartnerId) when viewing an existing
 * invoice, since a partner can have multiple invoices and only the id
 * unambiguously identifies one.
 */
export async function fetchServicePartnerInvoiceById(
  servicePartnerInvoiceId: number,
): Promise<ServicePartnerInvoiceDTO | null> {
  assertReady();
  const qs = new URLSearchParams({ servicePartnerInvoiceId: String(servicePartnerInvoiceId) });
  const response = await guardedFetch(
    `${API_BASE_URL}/bff/invoices/service-partner?${qs.toString()}`,
    { method: 'GET', headers: defaultHeaders(), cache: 'no-store' },
  );
  if (!response.ok) throw new Error(`Failed to fetch service partner invoice: ${await parseError(response)}`);
  if (response.status === 204) return null;
  const raw = await response.json();
  if (Array.isArray(raw)) return (raw[0] ?? null) as ServicePartnerInvoiceDTO | null;
  if (raw?.data !== undefined) {
    const inner = raw.data;
    return (Array.isArray(inner) ? inner[0] ?? null : inner) as ServicePartnerInvoiceDTO | null;
  }
  return (raw && typeof raw === 'object' ? raw : null) as ServicePartnerInvoiceDTO | null;
}
