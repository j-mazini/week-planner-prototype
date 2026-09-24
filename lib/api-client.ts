import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { getBearerAuthHeader } from "./auth";
import { dedupeInFlight, isMutationMethod, buildMutationKey } from "./in-flight-guard";
import { MOCK_MODE, mockPayload } from "./mock-api";

const API_BASE_URL = getApiBaseUrl();

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Recursive function to convert keys from snake_case to camelCase.
 * Idempotent: if the key is already camelCase (no underscores), it remains unchanged.
 */
function toCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && obj !== undefined && typeof obj === 'object' && (obj as object).constructor === Object) {
    const objRecord = obj as Record<string, unknown>;
    return Object.keys(objRecord).reduce((result, key) => {
      const camelKey = key.replace(/(_\w)/g, (match) => match[1].toUpperCase());
      (result as Record<string, unknown>)[camelKey] = toCamelCase(objRecord[key]);
      return result;
    }, {} as Record<string, unknown>);
  }
  return obj;
}

/**
 * Modern API Client that handles httpOnly cookies automatically and normalizes responses to camelCase.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  if (MOCK_MODE) {
    const mockUrl = new URL(endpoint, `${getApiBaseUrl()}/`);
    Object.entries(options.params ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) mockUrl.searchParams.set(key, String(value));
    });
    return mockPayload(mockUrl.href, String(options.method || "GET").toUpperCase()) as T;
  }
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  const { params, headers, ...rest } = options;

  // Build URL with query parameters
  let url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Use keys exactly as they are provided (expecting camelCase)
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  // Common headers
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  Object.assign(defaultHeaders, getBearerAuthHeader());

  // Executa a request e trata a resposta. Extraído para permitir o dedupe de
  // mutações em voo (evita request duplicado por duplo-clique).
  const doRequest = async (): Promise<T> => {
    const response = await fetch(url, {
    ...rest,
    headers: {
      ...defaultHeaders,
      ...headers,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    cache: "no-store",
    // CRITICAL: Send cookies with request
    credentials: "include",
  });

    if (!response.ok) {
    const status = response.status;
    const statusText = response.statusText;
    let errorMessage = `API Error ${status}: ${statusText} (${url})`;
    
    try {
      const errorData = await response.json();
      console.error(`[API Error] ${status} ${url}:`, errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If not JSON, try to get text
      try {
        const errorText = await response.text();
        if (errorText) {
          console.error(`[API Error Text] ${status} ${url}:`, errorText);
          errorMessage = errorText.substring(0, 100);
        }
      } catch {
        // Fallback to default message
      }
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  // Check content type to skip normalization for non-JSON responses (blobs, streams, etc)
  const contentType = response.headers.get("content-type");
  if (contentType && (contentType.includes("application/json") || contentType.includes("text/plain"))) {
    const data = await response.json();
    return toCamelCase(data) as T;
  }

  // Fallback for other content types
  return response.json() as unknown as T;
  };

  // Rede de segurança contra duplo-clique: mutações idênticas em voo são
  // deduplicadas (mesma URL + método + corpo). GET nunca é deduplicado.
  const method = (rest.method || "GET").toString();
  if (isMutationMethod(method)) {
    return dedupeInFlight(
      buildMutationKey(method, url, rest.body as BodyInit | null | undefined),
      doRequest
    );
  }

  return doRequest();
}

export const api = {
  get: <T>(url: string, options?: RequestOptions) => 
    apiClient<T>(url, { ...options, method: "GET" }),
    
  post: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(url, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),

  put: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(url, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),

  patch: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(url, { ...options, method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
    
  delete: <T>(url: string, options?: RequestOptions) => 
    apiClient<T>(url, { ...options, method: "DELETE" }),
};

export default api;
