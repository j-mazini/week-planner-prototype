import { getApiBaseUrl } from "@/lib/apiBaseUrl";
﻿import { hasAuthSession, getBearerAuthHeader } from "./auth"

const API_BASE_URL = getApiBaseUrl();

// Invoice Processing Workflow - based on backend structure
export interface InvoiceProcessingItem {
  invoiceId?: number;
  id: number;
  recordId: string;
  invoiceNumber?: string;
  subcontractor: string;
  userCode?: string;
  courier?: string;
  period: string;
  referenceDate?: string;
  amount: number;
  totalPayment?: number;
  status: string;
  createdAt?: string;
  invoiceCreatedOn?: string;
}

// API Response type
export interface InvoiceProcessingApiResponse {
  invoiceId?: number;
  recordId?: string;
  invoiceNumber?: string;
  subcontractor?: string;
  userCode?: string;
  courier?: string;
  period?: string;
  referenceDate?: string;
  amount?: number;
  totalPayment?: number;
  status?: string;
  createdAt?: string;
  invoiceCreatedOn?: string;
}

// Create DTO
export interface InvoiceProcessingCreateDTO {
  subcontractor: string;
  period: string;
  amount?: number;
  status?: string;
}

// Update DTO
export interface InvoiceProcessingUpdateDTO {
  subcontractor?: string;
  period?: string;
  amount?: number;
  status?: string;
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
      if (value !== undefined && value !== null && value !== 'all') {
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

  try {
    const response = await fetch(`${API_BASE_URL}/bff${endpoint}${queryString}`, config);

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `Failed to ${method} ${endpoint} (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      // Handle authentication errors specifically
      if (response.status === 401 || response.status === 403) {
        throw new Error("Invalid token. Try logging in again or contact the administrator.");
      }

      throw new Error(errorMessage);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in API call to ${endpoint}:`, error);
    // Re-throw the error to preserve the original message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unknown error: ${String(error)}`);
  }
};

// Map backend response to frontend format
const mapBackendToFrontend = (backend: InvoiceProcessingApiResponse, index: number): InvoiceProcessingItem => {
  const id = backend.invoiceId || backend.invoiceId || index + 1;

  // Extract period from referenceDate if period is not available
  let period = backend.period || '';
  if (!period && backend.referenceDate) {
    const date = new Date(backend.referenceDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    period = `${year}-${month}`;
  } else if (!period && backend.referenceDate) {
    const date = new Date(backend.referenceDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    period = `${year}-${month}`;
  }

  const recordId = backend.recordId || backend.recordId || backend.invoiceNumber || backend.invoiceNumber || `INV-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`;
  const subcontractor = backend.subcontractor || backend.courier || backend.userCode || backend.userCode || '';
  const amount = backend.amount || backend.totalPayment || backend.totalPayment || 0;
  const status = backend.status || 'Draft';

  return {
    id,
    recordId,
    subcontractor,
    period,
    amount,
    status,
    invoiceId: backend.invoiceId || backend.invoiceId,
    invoiceNumber: backend.invoiceNumber || backend.invoiceNumber,
    userCode: backend.userCode || backend.userCode,
    courier: backend.courier,
    referenceDate: backend.referenceDate || backend.referenceDate,
    totalPayment: backend.totalPayment || backend.totalPayment,
    createdAt: backend.createdAt || backend.createdAt,
    invoiceCreatedOn: backend.invoiceCreatedOn || backend.invoiceCreatedOn,
  };
};

// ==================== Invoice Processing Workflow ====================

/**
 * Fetch invoice processing items with optional filters
 * @param period - Period filter (YYYY-MM format or 'all')
 * @param status - Status filter (Pending, Approved, Rejected, Sent, Draft, or 'all')
 * @param search - Search term for recordId or subcontractor
 */
export const fetchInvoiceProcessingItems = async (
  period?: string,
  status?: string,
  search?: string
): Promise<InvoiceProcessingItem[]> => {
  // If period is 'all', fetch from all last 12 months
  if (period === 'all' || !period) {
    const now = new Date();

    // Fetch invoices from last 12 months
    const promises: Promise<InvoiceProcessingItem[]>[] = [];

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const queryParams: Record<string, string | number | undefined> = {
        year,
        month
      };

      if (status && status !== 'all') {
        queryParams.status = status;
      }

      if (search) {
        queryParams.search = search;
      }

      promises.push(
        apiCall<InvoiceProcessingApiResponse[] | { invoices?: InvoiceProcessingApiResponse[] }>(
          "/invoices",
          "GET",
          undefined,
          queryParams
        ).then((data) => {
          let invoices: InvoiceProcessingApiResponse[] = [];

          if (Array.isArray(data)) {
            invoices = data;
          } else if (data && typeof data === 'object' && 'invoices' in data) {
            invoices = (data as { invoices: InvoiceProcessingApiResponse[] }).invoices || [];
          }

          return invoices.map((invoice, index) => mapBackendToFrontend(invoice, index));
        })
      );
    }

    // Wait for all requests and combine results
    const results = await Promise.all(promises);
    const combined = results.flat();

    // Remove duplicates based on invoice ID
    const uniqueInvoices = combined.filter((invoice, index, self) =>
      index === self.findIndex((i) => i.id === invoice.id)
    );

    return uniqueInvoices;
  }

  // Single period request
  const queryParams: Record<string, string | number | undefined> = {};

  // Parse period to month and year
  const [year, month] = period.split('-');
  if (year && month) {
    queryParams.year = parseInt(year, 10);
    queryParams.month = parseInt(month, 10);
  }

  if (status && status !== 'all') {
    queryParams.status = status;
  }

  if (search) {
    queryParams.search = search;
  }

  const data = await apiCall<InvoiceProcessingApiResponse[] | { invoices?: InvoiceProcessingApiResponse[] }>(
    "/invoices",
    "GET",
    undefined,
    queryParams
  );

  let invoices: InvoiceProcessingApiResponse[] = [];

  if (Array.isArray(data)) {
    invoices = data;
  } else if (data && typeof data === 'object' && 'invoices' in data) {
    invoices = (data as { invoices: InvoiceProcessingApiResponse[] }).invoices || [];
  }

  return invoices.map((invoice, index) => mapBackendToFrontend(invoice, index));
};

/**
 * Fetch invoice processing item by ID
 */
export const fetchInvoiceProcessingItemById = async (
  id: number
): Promise<InvoiceProcessingItem> => {
  const data = await apiCall<InvoiceProcessingApiResponse>(`/invoices/${id}`);
  return mapBackendToFrontend(data, 0);
};

/**
 * Create a new invoice processing item
 */
export const createInvoiceProcessingItem = async (
  data: InvoiceProcessingCreateDTO
): Promise<InvoiceProcessingItem> => {
  const response = await apiCall<InvoiceProcessingApiResponse>(
    "/invoices",
    "POST",
    data
  );
  return mapBackendToFrontend(response, 0);
};

/**
 * Update an invoice processing item
 */
export const updateInvoiceProcessingItem = async (
  id: number,
  data: InvoiceProcessingUpdateDTO
): Promise<InvoiceProcessingItem> => {
  const response = await apiCall<InvoiceProcessingApiResponse>(
    `/invoices/${id}`,
    "PATCH",
    data
  );
  return mapBackendToFrontend(response, 0);
};

/**
 * Delete an invoice processing item
 */
export const deleteInvoiceProcessingItem = async (id: number): Promise<void> => {
  await apiCall(`/invoices/${id}`, "DELETE");
};

/**
 * Create multiple invoice processing items
 */
export const createMultipleInvoiceProcessingItems = async (
  items: InvoiceProcessingCreateDTO[]
): Promise<InvoiceProcessingItem[]> => {
  const response = await apiCall<InvoiceProcessingApiResponse[]>(
    "/invoices/bulk",
    "POST",
    { invoices: items }
  );
  return response.map((item, index) => mapBackendToFrontend(item, index));
};

