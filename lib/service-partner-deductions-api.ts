import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { hasAuthSession, getBearerAuthHeader } from './auth';
import { guardedFetch } from "@/lib/in-flight-guard";

const API_BASE_URL = getApiBaseUrl();

export interface ServicePartnerDeductionDTO {
  service_partner_deduction_id: number;
  reference_number: string | null;
  description: string | null;
  deduction_amount: number;
  reimbursements_amount: number;
  incident_date: string | null;
  entry_date: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  company_id: number;
  service_partner_id: number;
  service_partner_invoice_id: number | null;
  service_partner_name?: string | null;
  company_name?: string | null;
}

export interface CreateServicePartnerDeductionDTO {
  reference_number?: string;
  description?: string;
  deduction_amount: number;
  reimbursements_amount?: number;
  incident_date?: string;
  entry_date?: string;
  company_id: number;
  service_partner_id: number;
  service_partner_invoice_id?: number;
}

export interface UpdateServicePartnerDeductionDTO {
  reference_number?: string;
  description?: string;
  deduction_amount?: number;
  reimbursements_amount?: number;
  incident_date?: string;
  entry_date?: string;
  service_partner_invoice_id?: number | null;
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

function normalizeArray(raw: unknown): ServicePartnerDeductionDTO[] {
  if (Array.isArray(raw)) return raw as ServicePartnerDeductionDTO[];
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.deductions)) return obj.deductions as ServicePartnerDeductionDTO[];
    if (Array.isArray(obj.data)) return obj.data as ServicePartnerDeductionDTO[];
    if (Array.isArray(obj.result)) return obj.result as ServicePartnerDeductionDTO[];
    if (Array.isArray(obj.items)) return obj.items as ServicePartnerDeductionDTO[];
  }
  return [];
}

export async function fetchServicePartnerDeductions(params: {
  month?: number;
  year?: number;
  servicePartnerId?: number;
} = {}): Promise<ServicePartnerDeductionDTO[]> {
  assertReady();
  const qs = new URLSearchParams();
  if (params.month) qs.set('month', String(params.month));
  if (params.year) qs.set('year', String(params.year));
  if (params.servicePartnerId) qs.set('service_partner_id', String(params.servicePartnerId));
  const response = await guardedFetch(
    `${API_BASE_URL}/bff/service-partner-deductions?${qs.toString()}`,
    { method: 'GET', headers: defaultHeaders(), cache: 'no-store' },
  );
  if (!response.ok) throw new Error(`Failed to fetch service partner deductions: ${await parseError(response)}`);
  if (response.status === 204) return [];
  return normalizeArray(await response.json());
}

export async function fetchServicePartnerDeductionById(
  deductionId: number,
): Promise<ServicePartnerDeductionDTO> {
  assertReady();
  const response = await guardedFetch(
    `${API_BASE_URL}/bff/service-partner-deductions/${deductionId}`,
    { method: 'GET', headers: defaultHeaders(), cache: 'no-store' },
  );
  if (!response.ok) throw new Error(`Failed to fetch service partner deduction: ${await parseError(response)}`);
  const raw = await response.json();
  return (raw?.data ?? raw) as ServicePartnerDeductionDTO;
}

export async function createServicePartnerDeduction(
  data: CreateServicePartnerDeductionDTO,
): Promise<ServicePartnerDeductionDTO> {
  assertReady();
  const response = await guardedFetch(`${API_BASE_URL}/bff/service-partner-deductions`, {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to create service partner deduction: ${await parseError(response)}`);
  const raw = await response.json();
  return (raw?.data ?? raw) as ServicePartnerDeductionDTO;
}

export async function updateServicePartnerDeduction(
  deductionId: number,
  data: UpdateServicePartnerDeductionDTO,
): Promise<ServicePartnerDeductionDTO> {
  assertReady();
  const response = await guardedFetch(`${API_BASE_URL}/bff/service-partner-deductions/${deductionId}`, {
    method: 'PATCH',
    headers: defaultHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to update service partner deduction: ${await parseError(response)}`);
  const raw = await response.json();
  return (raw?.data ?? raw) as ServicePartnerDeductionDTO;
}

export async function deleteServicePartnerDeduction(deductionId: number): Promise<void> {
  assertReady();
  const response = await guardedFetch(`${API_BASE_URL}/bff/service-partner-deductions/${deductionId}`, {
    method: 'DELETE',
    headers: defaultHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to delete service partner deduction: ${await parseError(response)}`);
}
