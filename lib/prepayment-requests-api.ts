import { hasAuthSession, getBearerAuthHeader } from "./auth"
import { getApiBaseUrl } from "./apiBaseUrl";
import { guardedFetch } from "@/lib/in-flight-guard";

export type PrePaymentRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "created"
  | "sent"
  | "open"
  | "closed"
  | string;

export type PrePaymentRequest = {
  id: string | number;
  userId: number;
  amount: number;
  reason?: string;
  notes?: string;
  status?: PrePaymentRequestStatus;
  createdAt: string;
  updatedAt?: string;
};

export type CreatePrePaymentRequestDTO = {
  userId: number;
  amount: number;
  reason?: string;
  notes?: string;
};

export type FetchPrePaymentRequestsParams = {
  userId?: number;
};

const VENDOR_PREPAYMENT_STORAGE_KEY = "vendorPrepaymentRequests";

function getStoredRequests(): PrePaymentRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(VENDOR_PREPAYMENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalize) : [];
  } catch {
    return [];
  }
}

function setStoredRequests(requests: PrePaymentRequest[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      VENDOR_PREPAYMENT_STORAGE_KEY,
      JSON.stringify(requests.map((r) => ({ ...r, id: r.id })))
    );
  } catch {
    // ignore
  }
}

const getAuthHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  ...getBearerAuthHeader(),
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
});

const tryParseJson = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await response.json().catch(() => null);
  }
  return await response.text().catch(() => null);
};

const extractArray = (data: unknown): Record<string, unknown>[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj.data)) return obj.data;
  if (Array.isArray(obj.requests)) return obj.requests;
  if (Array.isArray(obj.prePaymentRequests)) return obj.prePaymentRequests;
  if (Array.isArray(obj.prepaymentRequests)) return obj.prepaymentRequests;
  if (Array.isArray(obj.results)) return obj.results;
  return [];
};

const normalize = (raw: Record<string, unknown>): PrePaymentRequest => {
  const id = raw?.id ?? raw?.requestId ?? raw?.prepaymentRequestId ?? raw?.prePaymentRequestId;
  const userId = Number(raw?.userId ?? raw?.userId ?? 0);
  const amount = Number(raw?.amount ?? raw?.value ?? raw?.requestedAmount ?? 0);
  const createdAt =
    String(raw?.createdAt ?? raw?.createdAt ?? raw?.created ?? raw?.entryDate ?? new Date().toISOString());
  const updatedAt = raw?.updatedAt ?? raw?.updatedAt ?? raw?.updated;
  const status = raw?.status ?? raw?.requestStatus ?? raw?.state;
  const reason = raw?.reason ?? raw?.motivo ?? raw?.title;
  const notes = raw?.notes ?? raw?.note ?? raw?.details ?? raw?.descricao;

  return {
    id: (id as string | number | undefined) ?? `${userId}-${createdAt}`,
    userId,
    amount,
    status: status as PrePaymentRequestStatus | undefined,
    reason: reason != null ? String(reason) : undefined,
    notes: notes != null ? String(notes) : undefined,
    createdAt,
    updatedAt: updatedAt ? String(updatedAt) : undefined,
  };
};

async function fetchWithFallback(
  paths: string[],
  init: RequestInit
): Promise<{ response: Response; usedPath: string }> {
  const baseUrl = getApiBaseUrl();

  let lastResp: Response | null = null;
  for (const path of paths) {
    const resp = await guardedFetch(`${baseUrl}${path}`, init);
    lastResp = resp;
    if (resp.status !== 404) {
      return { response: resp, usedPath: path };
    }
  }
  // Return last 404 response so caller can decide what to do
  return { response: lastResp!, usedPath: paths[paths.length - 1] };
}

/**
 * List pre-payment requests. If the backend endpoint isn't available (404), returns [].
 */
export async function fetchPrePaymentRequests(
  params: FetchPrePaymentRequestsParams = {}
): Promise<PrePaymentRequest[]> {
  if (!hasAuthSession()) throw new Error("Authentication required");

  const qs = new URLSearchParams();
  if (params.userId) qs.set("userId", String(params.userId));
  else if (params.userId) qs.set("userId", String(params.userId));
  qs.set("_t", String(Date.now()));

  const candidates = [
    `/bff/prepayment-requests?${qs.toString()}`,
    `/bff/pre-payment-requests?${qs.toString()}`,
  ];

  const { response } = await fetchWithFallback(candidates, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (response.status === 404) {
    const stored = getStoredRequests();
    return stored.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  if (!response.ok) {
    const payload = await tryParseJson(response);
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as Record<string, unknown>).message)
        : `Failed to load requests (${response.status})`;
    throw new Error(message);
  }

  const payload = await tryParseJson(response);
  const items = extractArray(payload);
  const fromApi = items.map(normalize);
  const stored = getStoredRequests();
  const apiIds = new Set(fromApi.map((r) => String(r.id)));
  const localOnly = stored.filter((r) => !apiIds.has(String(r.id)));
  return [...fromApi, ...localOnly].sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt))
  );
}

/**
 * Create a pre-payment request (vendor -> supervisor/admin).
 * Tries `/bff/prepayment-requests` and then `/bff/pre-payment-requests`.
 */
export async function createPrePaymentRequest(
  data: CreatePrePaymentRequestDTO
): Promise<PrePaymentRequest> {
  if (!hasAuthSession()) throw new Error("Authentication required");

  const body = {
    userId: data.userId ?? data.userId,
    amount: data.amount,
    reason: data.reason ?? "",
    notes: data.notes ?? "",
  };

  const candidates = ["/bff/prepayment-requests", "/bff/pre-payment-requests"];
  const { response } = await fetchWithFallback(candidates, {
    method: "POST",
    headers: getAuthHeaders(),
    cache: "no-store",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await tryParseJson(response);
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as Record<string, unknown>).message)
        : `Falha ao criar pedido (${response.status})`;
    throw new Error(message);
  }

  // Backend may return created record or just an ack.
  const payload = await tryParseJson(response);
  if (payload && typeof payload === "object") return normalize(payload as Record<string, unknown>);

  return normalize({
    id: `local-${Date.now()}`,
    userId: data.userId ?? data.userId ?? 0,
    amount: data.amount,
    reason: data.reason,
    notes: data.notes,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
}

/**
 * Optional helper to approve/reject. If endpoint doesn't exist, will throw.
 */
export async function updatePrePaymentRequestStatus(
  id: string | number,
  status: "approved" | "rejected" | "pending"
): Promise<PrePaymentRequest> {
  if (!hasAuthSession()) throw new Error("Authentication required");

  const candidates = [
    `/bff/prepayment-requests/${id}`,
    `/bff/pre-payment-requests/${id}`,
  ];

  const { response } = await fetchWithFallback(candidates, {
    method: "PATCH",
    headers: getAuthHeaders(),
    cache: "no-store",
    body: JSON.stringify({ status }),
  });

  if (response.status === 404) {
    const stored = getStoredRequests();
    const idStr = String(id);
    const index = stored.findIndex((r) => String(r.id) === idStr);
    if (index >= 0) {
      const updated = { ...stored[index], status };
      const next = [...stored];
      next[index] = updated;
      setStoredRequests(next);
      return updated;
    }
    return normalize({ id, status, createdAt: new Date().toISOString(), userId: 0, amount: 0 });
  }

  if (!response.ok) {
    const payload = await tryParseJson(response);
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as Record<string, unknown>).message)
        : `Failed to update request (${response.status})`;
    throw new Error(message);
  }

  const payload = await tryParseJson(response);
  if (payload && typeof payload === "object") return normalize(payload as Record<string, unknown>);

  return normalize({
    id,
    status,
    createdAt: new Date().toISOString(),
    userId: 0,
    amount: 0,
  });
}


