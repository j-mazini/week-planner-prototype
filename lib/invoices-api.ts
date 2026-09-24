import { z } from "zod";
import { getApiBaseUrl } from "./apiBaseUrl";
import { getBearerAuthHeader, hasAuthSession } from "./auth";
import type {
  Invoice,
  InvoiceApiResponse,
} from "@/app/(private)/financial-invoices/types";
import { validateInvoiceData } from "@/app/(private)/financial-invoices/utils";

export const InvoiceListByMonthParams = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  userId: z.number().int().positive().optional(),
  servicePartnerId: z.union([z.number().int().positive(), z.string().min(1)]).optional(),
});
export type InvoiceListByMonthParams = z.infer<typeof InvoiceListByMonthParams>;

export const InvoiceListLast12Params = z.object({
  servicePartnerId: z.union([z.number().int().positive(), z.string().min(1)]).optional(),
});
export type InvoiceListLast12Params = z.infer<typeof InvoiceListLast12Params>;

export const UserIdParam = z.number().int().positive();

function ensureEnv() {
  const base = getApiBaseUrl();
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }
  return base;
}

function headers() {
  return {
    "Content-Type": "application/json",
    ...getBearerAuthHeader(),
  };
}

async function readInvoices(response: Response): Promise<Invoice[]> {
  if (response.status === 404 || response.status === 400 || response.status === 403) {
    return [];
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch invoices: ${response.status}`);
  }
  const data: InvoiceApiResponse[] = await response.json();
  return data.map(validateInvoiceData);
}

export async function fetchInvoicesByMonth(input: InvoiceListByMonthParams): Promise<Invoice[]> {
  const params = InvoiceListByMonthParams.parse(input);
  const base = ensureEnv();

  const qs = new URLSearchParams({
    month: String(params.month),
    year: String(params.year),
  });
  if (params.userId !== undefined) qs.set("userId", String(params.userId));
  if (params.servicePartnerId !== undefined) qs.set("servicePartnerId", String(params.servicePartnerId));

  const response = await fetch(`${base}/bff/invoices?${qs.toString()}`, { headers: headers() });
  return readInvoices(response);
}

export async function fetchInvoicesByUserLast12(userId: number): Promise<Invoice[]> {
  const id = UserIdParam.parse(userId);
  const base = ensureEnv();
  const response = await fetch(`${base}/bff/invoices/user/${id}/last-12-months`, {
    headers: headers(),
  });
  return readInvoices(response);
}

export async function fetchInvoicesLast12(input: InvoiceListLast12Params = {}): Promise<Invoice[]> {
  const params = InvoiceListLast12Params.parse(input);
  const base = ensureEnv();
  const qs = new URLSearchParams();
  if (params.servicePartnerId !== undefined) qs.set("servicePartnerId", String(params.servicePartnerId));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const response = await fetch(`${base}/bff/invoices/last-12-months${suffix}`, {
    headers: headers(),
  });
  return readInvoices(response);
}
