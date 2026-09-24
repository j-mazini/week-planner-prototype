import { hasAuthSession, getBearerAuthHeader } from './auth'
import { getApiBaseUrl } from './apiBaseUrl';
import { registerDayOff } from './day-off-api';
import { guardedFetch } from "@/lib/in-flight-guard";

export type VendorRequestType = 'DayOff' | 'HolyDay' | 'PrePayment';

export type VendorRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | string;

export type VendorRequest = {
  vendorRequestId: number;
  userId: number;
  requestType: VendorRequestType;
  startDate?: string;
  endDate?: string;
  prePaymentValue?: string;
  notes?: string;
  reason?: string;
  status: VendorRequestStatus;
  createdAt: string;
  updatedAt?: string;
};

export type CreateVendorRequestDTO = {
  userId: number;
  requestType: VendorRequestType;
  startDate?: string;
  endDate?: string;
  prePaymentValue?: string;
  notes?: string;
  reason?: string;
  status?: string;
};

export type FetchVendorRequestsParams = {
  userId?: number;
  servicePartnerId?: number;
  month?: number;
  year?: number;
};

const getAuthHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  ...getBearerAuthHeader(),
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
});

const tryParseJson = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await response.json().catch(() => null);
  }
  return await response.text().catch(() => null);
};

const extractArray = (data: unknown): unknown[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data !== 'object') return [];

  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj.data)) return obj.data;
  if (Array.isArray(obj.requests)) return obj.requests;
  if (Array.isArray(obj.vendorRequests)) return obj.vendorRequests;
  if (Array.isArray(obj.results)) return obj.results;
  return [];
};

const normalizeRequestType = (raw: unknown): VendorRequest['requestType'] => {
  const source = raw as Record<string, unknown> | null | undefined;
  const t = String(
    source?.request_type ??
    (source as { requestType?: unknown } | undefined)?.requestType ??
    ''
  ).trim();
  if (!t) return 'DayOff';
  const lower = t.toLowerCase().replace(/\s+/g, '');
  if (lower === 'pre_payment' || lower === 'prepayment') return 'PrePayment';
  if (lower === 'holyday' || lower === 'holiday') return 'HolyDay';
  if (lower === 'dayoff' || lower === 'day_off') return 'DayOff';
  if (t === 'PrePayment' || t === 'DayOff' || t === 'HolyDay') return t as VendorRequest['requestType'];
  return 'DayOff';
};

const normalize = (raw: unknown): VendorRequest => {
  const source = raw as Record<string, unknown>;
  return {
    vendorRequestId: Number(source.vendorRequestId ?? source.vendorRequestId ?? source.id ?? 0),
    userId: Number(source.userId ?? (source as { userId?: unknown }).userId ?? 0),
    requestType: normalizeRequestType(raw),
    startDate: (source as { startDate?: string; start_date?: string }).startDate ?? (source as { start_date?: string }).start_date,
    endDate: (source as { endDate?: string; end_date?: string }).endDate ?? (source as { end_date?: string }).end_date,
    prePaymentValue:
      (source as { prePaymentValue?: string; pre_payment_value?: string; amount?: string }).prePaymentValue ??
      (source as { pre_payment_value?: string }).pre_payment_value ??
      (source as { amount?: string }).amount,
    notes: (source as { notes?: string; note?: string }).notes ?? (source as { note?: string }).note,
    reason: (source as { reason?: string }).reason,
    status: (source as { status?: VendorRequestStatus }).status ?? 'pending',
    createdAt: String(
      source.createdAt ??
      (source as { createdAt?: string }).createdAt ??
      new Date().toISOString()
    ),
    updatedAt: source.updatedAt
      ? String(source.updatedAt)
      : (source as { updated_at?: string }).updated_at
        ? String((source as { updated_at?: string }).updated_at)
        : undefined,
  };
};

/**
 * Busca todas as vendor requests ou filtra por userId
 */
export async function fetchVendorRequests(
  params: FetchVendorRequestsParams = {}
): Promise<VendorRequest[]> {
  if (!hasAuthSession()) throw new Error('Authentication required');

  const baseUrl = getApiBaseUrl();
  let url = `${baseUrl}/bff/vendor-requests`;

  // Se userId for fornecido, usar o endpoint específico
  if (params.userId) {
    url = `${baseUrl}/bff/vendor-requests/user/${params.userId}`;
  }

  // Adicionar query params (servicePartnerId, month, year)
  const qs = new URLSearchParams();
  if (!params.userId && params.servicePartnerId !== undefined && params.servicePartnerId !== 0) {
    qs.set('servicePartnerId', String(params.servicePartnerId));
  }
  if (params.month !== undefined) {
    qs.set('month', String(params.month));
  }
  if (params.year !== undefined) {
    qs.set('year', String(params.year));
  }
  url = `${url}?${qs.toString()}`;

  const response = await guardedFetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = await tryParseJson(response);
    const message =
      (payload && typeof payload === 'object' && 'message' in payload && String((payload as { message?: unknown }).message)) ||
      (payload && typeof payload === 'object' && 'error' in payload && String((payload as { error?: unknown }).error)) ||
      `Failed to load vendor requests (${response.status})`;
    throw new Error(String(message));
  }

  const payload = await tryParseJson(response);
  const items = extractArray(payload);
  return items.map(normalize);
}

/**
 * Cria uma nova vendor request
 */
export async function createVendorRequest(
  data: CreateVendorRequestDTO
): Promise<VendorRequest> {
  if (!hasAuthSession()) throw new Error('Authentication required');

  const baseUrl = getApiBaseUrl();

  // Garantir que status seja 'pending' se não fornecido
  const requestData: CreateVendorRequestDTO = {
    ...data,
    status: data.status || 'pending',
  };

  const response = await guardedFetch(`${baseUrl}/bff/vendor-requests`, {
    method: 'POST',
    headers: getAuthHeaders(),
    cache: 'no-store',
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const payload = await tryParseJson(response);
    const message =
      (payload && typeof payload === 'object' && 'message' in payload && String((payload as { message?: unknown }).message)) ||
      (payload && typeof payload === 'object' && 'error' in payload && String((payload as { error?: unknown }).error)) ||
      `Failed to create vendor request (${response.status})`;
    throw new Error(String(message));
  }

  const payload = await tryParseJson(response);
  if (payload && typeof payload === 'object') {
    return normalize(payload);
  }

  throw new Error('Resposta inválida do servidor');
}

/**
 * Busca uma vendor request por ID
 */
export async function fetchVendorRequestById(
  vendorRequestId: number
): Promise<VendorRequest> {
  if (!hasAuthSession()) throw new Error('Authentication required');

  const baseUrl = getApiBaseUrl();

  const response = await guardedFetch(`${baseUrl}/bff/vendor-requests/${vendorRequestId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = await tryParseJson(response);
    const message =
      (payload && typeof payload === 'object' && 'message' in payload && String((payload as { message?: unknown }).message)) ||
      (payload && typeof payload === 'object' && 'error' in payload && String((payload as { error?: unknown }).error)) ||
      `Failed to fetch vendor request (${response.status})`;
    throw new Error(String(message));
  }

  const payload = await tryParseJson(response);
  return normalize(payload);
}

/**
 * Update a vendor request
 */
export async function updateVendorRequest(
  vendorRequestId: number,
  data: Partial<CreateVendorRequestDTO>
): Promise<VendorRequest> {
  if (!hasAuthSession()) throw new Error('Authentication required');

  const baseUrl = getApiBaseUrl();

  const response = await guardedFetch(`${baseUrl}/bff/vendor-requests/${vendorRequestId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    cache: 'no-store',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const payload = await tryParseJson(response);
    const message =
      (payload && typeof payload === 'object' && 'message' in payload && String((payload as { message?: unknown }).message)) ||
      (payload && typeof payload === 'object' && 'error' in payload && String((payload as { error?: unknown }).error)) ||
      `Failed to update vendor request (${response.status})`;
    throw new Error(String(message));
  }

  const payload = await tryParseJson(response);
  return normalize(payload);
}

/**
 * Expande start_date até end_date em array de datas YYYY-MM-DD
 */
function expandDateRange(start: string, end: string): string[] {
  if (!start && !end) return [];
  const startStr = start || end || '';
  const endStr = end || start || '';
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return startStr ? [startStr.split('T')[0]] : [];
  }
  const dates: string[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export async function approveVendorRequestWithInsert(
  vendorRequest: VendorRequest,
  scheduleTerms?: string,
  feeValue?: number,
  referenceNumber?: string
): Promise<VendorRequest> {
  const requestType = vendorRequest.requestType;

  // Para DayOff e HolyDay, criar week planners antes de aprovar
  if (requestType === 'DayOff' || requestType === 'HolyDay') {
    const start = vendorRequest.startDate || '';
    const end = vendorRequest.endDate || vendorRequest.startDate || '';
    const dates = expandDateRange(start, end);
    if (dates.length === 0) {
      throw new Error('Data(s) inválida(s) para day off / holiday.');
    }
    await registerDayOff({
      userId: vendorRequest.userId,
      dates,
      reason: vendorRequest.reason || '',
      notes: vendorRequest.notes || '',
    });
  }

  // Para PrePayment, passar scheduleTerms, feeValue e referenceNumber para o backend criar a deduction
  // O backend criará a deduction ao aprovar
  return approveVendorRequest(vendorRequest.vendorRequestId, scheduleTerms, feeValue, referenceNumber);
}

/**
 * Aprova uma vendor request SEM criar registros de day-off / holiday em week-planner.
 * Usa apenas o endpoint de approve da própria vendor request.
 *
 * Use esta função em páginas que não podem chamar /bff/week-planners/day-off.
 */
export async function approveVendorRequestWithoutDayOffInsert(
  vendorRequest: VendorRequest,
  scheduleTerms?: string,
  feeValue?: number,
  referenceNumber?: string,
  startMonth?: string
): Promise<VendorRequest> {
  return approveVendorRequest(vendorRequest.vendorRequestId, scheduleTerms, feeValue, referenceNumber, startMonth);
}

/**
 * Approve a vendor request
 * Para PrePayment requests, pode receber schedule_terms, fee_value, reference_number e start_month no body
 */
export async function approveVendorRequest(
  vendorRequestId: number,
  scheduleTerms?: string,
  feeValue?: number,
  referenceNumber?: string,
  startMonth?: string
): Promise<VendorRequest> {
  if (!hasAuthSession()) throw new Error('Authentication required');

  const baseUrl = getApiBaseUrl();

  // Preparar body com scheduleTerms, feeValue, referenceNumber, startMonth e entryDate se fornecidos
  const body: { scheduleTerms?: string; feeValue?: number; referenceNumber?: string; startMonth?: string; entryDate?: string } = {};
  if (scheduleTerms !== undefined && scheduleTerms !== "") {
    body.scheduleTerms = scheduleTerms;
  }
  if (feeValue !== undefined && feeValue > 0) {
    body.feeValue = feeValue;
  }
  if (referenceNumber !== undefined && referenceNumber !== "") {
    body.referenceNumber = referenceNumber;
  }
  if (startMonth !== undefined && startMonth !== "") {
    body.startMonth = startMonth;
    // Also set entryDate as the first day of the selected month (YYYY-MM-DD format)
    body.entryDate = `${startMonth}-01`;
  }

  const response = await guardedFetch(`${baseUrl}/bff/vendor-requests/${vendorRequestId}/approve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    cache: 'no-store',
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = await tryParseJson(response);
    const message =
      (payload && typeof payload === 'object' && 'message' in payload && String((payload as { message?: unknown }).message)) ||
      (payload && typeof payload === 'object' && 'error' in payload && String((payload as { error?: unknown }).error)) ||
      `Failed to approve vendor request (${response.status})`;
    throw new Error(String(message));
  }

  const payload = await tryParseJson(response);
  return normalize(payload);
}

/**
 * Reproved a vendor request (request update com status reproved)
 */
export async function rejectVendorRequest(
  vendorRequestId: number
): Promise<VendorRequest> {
  return updateVendorRequest(vendorRequestId, { status: 'reproved' });
}



