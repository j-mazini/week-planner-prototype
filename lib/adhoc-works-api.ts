import { hasAuthSession, getBearerAuthHeader } from "./auth"
import { getApiBaseUrl } from "./apiBaseUrl";

export interface AdhocWorksOperationDTO {
  operationId: number;
  date: string;
  routeId: number | null;
  routeName: string | null;
  depot: string | null;
}

export interface AdhocWorksAdhocServiceDTO {
  adhocServiceId: number;
  adhocName: string;
  adhocReceivedPayment: number | null;
  adhocVendorPayment: number | null;
}

export interface AdhocWorksCategoryDTO {
  adhocCategoryId: number;
  name: string;
  description: string | null;
}

export interface AdhocWorksDTO {
  userId: number | null;
  fullName: string;
  operation: AdhocWorksOperationDTO;
  adhocService: AdhocWorksAdhocServiceDTO;
  adhocCategory: AdhocWorksCategoryDTO;
  servicePartnerId: number | null;
  servicePartnerName: string | null;
}

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const mapAdhocWorksItem = (item: Record<string, unknown>): AdhocWorksDTO => {
  const operationRaw = (item.operation ?? {}) as Record<string, unknown>;
  const adhocServiceRaw = (item.adhocService ?? {}) as Record<string, unknown>;
  const adhocCategoryRaw = ((item.adhocCategory ?? item.serviceType) ?? {}) as Record<string, unknown>;

  return {
    userId: toNumberOrNull(item.userId),
    fullName: String(item.fullName ?? ""),
    operation: {
      operationId: Number(operationRaw.operationId ?? 0) || 0,
      date: String(operationRaw.date ?? ""),
      routeId: toNumberOrNull(operationRaw.routeId),
      routeName: operationRaw.routeName != null ? String(operationRaw.routeName) : null,
      depot: operationRaw.depot != null ? String(operationRaw.depot) : null,
    },
    adhocService: {
      adhocServiceId: Number(adhocServiceRaw.adhocServiceId ?? 0) || 0,
      adhocName: String(adhocServiceRaw.adhocName ?? ""),
      adhocReceivedPayment: toNumberOrNull(adhocServiceRaw.adhocReceivedPayment),
      adhocVendorPayment: toNumberOrNull(adhocServiceRaw.adhocVendorPayment),
    },
    adhocCategory: {
      adhocCategoryId:
        Number(
          adhocCategoryRaw.adhocCategoryId ??
          adhocCategoryRaw.adhoc_categories_id ??
          adhocCategoryRaw.serviceTypeId ??
          0
        ) || 0,
      name: String(adhocCategoryRaw.name ?? ""),
      description: adhocCategoryRaw.description != null ? String(adhocCategoryRaw.description) : null,
    },
    servicePartnerId: toNumberOrNull(item.servicePartnerId),
    servicePartnerName: item.servicePartnerName != null ? String(item.servicePartnerName) : null,
  };
};

/**
 * Fetch adhoc works from the API
 * GET /bff/adhoc-works?initialDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export async function getAdhocWorks(params: {
  initialDate: string | null;
  endDate: string | null;
  servicePartnerId?: number;
}): Promise<AdhocWorksDTO[]> {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const searchParams = new URLSearchParams();
  if (params.initialDate != null) searchParams.set("initialDate", params.initialDate);
  if (params.endDate != null) searchParams.set("endDate", params.endDate);
  if (params.servicePartnerId !== undefined && params.servicePartnerId !== 0) searchParams.set("servicePartnerId", params.servicePartnerId.toString());
  const query = searchParams.toString();
  const url = `${API_BASE_URL}/bff/adhoc-works${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Invalid token. Try logging in again or contact the administrator."
      );
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch adhoc works (${response.status})`
    );
  }

  const raw: unknown = await response.json();
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((item) => (item && typeof item === "object" ? mapAdhocWorksItem(item as Record<string, unknown>) : null))
    .filter((item): item is AdhocWorksDTO => item !== null);
}

/** Valores aceitos pelo backend: xlsx ou pdf (case insensitive) */
export type AdhocWorksExportFormat = "xlsx" | "pdf";

/**
 * Export adhoc works (download file)
 * GET /bff/adhoc-works/export?initial_date=YYYY-MM-DD&end_date=YYYY-MM-DD&format=xlsx
 * GET /bff/adhoc-works/export?initial_date=YYYY-MM-DD&end_date=YYYY-MM-DD&format=pdf
 */
export async function exportAdhocWorks(params: {
  initialDate: string | null;
  endDate: string | null;
  format?: AdhocWorksExportFormat;
  servicePartnerId?: number;
}): Promise<{ blob: Blob; filename: string }> {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const searchParams = new URLSearchParams();
  if (params.initialDate != null) searchParams.set("initialDate", params.initialDate);
  if (params.endDate != null) searchParams.set("endDate", params.endDate);
  if (params.servicePartnerId !== undefined && params.servicePartnerId !== 0) {
    searchParams.set("servicePartnerId", params.servicePartnerId.toString());
  }
  const formatRaw = (params.format ?? "xlsx").toLowerCase();
  const format = formatRaw === "pdf" ? "pdf" : "xlsx";
  searchParams.set("format", format);
  const url = `${API_BASE_URL}/bff/adhoc-works/export?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...getBearerAuthHeader(),
      Accept:
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    let message = errorText || response.statusText;
    try {
      const json = JSON.parse(errorText) as { message?: string };
      if (json?.message) message = json.message;
    } catch {
      // use errorText as-is
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error("Invalid token. Try logging in again or contact the administrator.");
    }
    if (response.status === 404) {
      throw new Error("No adhoc works found for the given filters.");
    }
    throw new Error(`Failed to download adhoc works (${response.status}): ${message}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength === 0) {
    throw new Error("No data available for download");
  }

  const contentDisposition =
    response.headers.get("content-disposition") || "";
  const ext = format === "pdf" ? "pdf" : "xlsx";
  let filename = `adhoc-works-export.${ext}`;
  if (contentDisposition) {
    const match = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    );
    if (match?.[1]) {
      filename = match[1].replace(/['"]/g, "");
    }
  }

  const contentType = response.headers.get("content-type") || "";
  const isPdf = contentType.includes("pdf");
  const mimeType = isPdf
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  return {
    blob: new Blob([arrayBuffer], { type: mimeType }),
    filename,
  };
}

