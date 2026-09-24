import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { hasAuthSession, getBearerAuthHeader } from "@/lib/auth"

const API_BASE_URL = getApiBaseUrl();

/**
 * Interface for DepositDTO from GET /deposits endpoint
 */
export interface DepositDTO {
  depositId: number;
  depositName: string;
  description?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  customerId?: number;
  isPhysical?: boolean;
}

/**
 * Fetches all deposits from the GET /bff/deposits endpoint
 * @returns Promise with array of DepositDTO
 */
export const fetchDeposits = async (): Promise<DepositDTO[]> => {
  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/bff/deposits`, {
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
      // Handle authentication errors specifically
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch deposits (${response.status})`
      );
    }

    const data = await response.json();
    
    let items: DepositDTO[] = [];

    if (Array.isArray(data)) {
      items = data as DepositDTO[];
    } else if (data && typeof data === "object") {
      const dataObj = data as Record<string, unknown>;
      if (Array.isArray(dataObj.deposits)) {
        items = dataObj.deposits as DepositDTO[];
      } else if (Array.isArray(dataObj.data)) {
        items = dataObj.data as DepositDTO[];
      }
    }

    return items;
  } catch (error) {
    console.error("Error fetching deposits:", error);
    throw error;
  }
};

/**
 * Fetches deposits with routes from GET /bff/deposits/with-routes endpoint
 * @returns Promise with array of DepositDTO
 */
export const fetchDepositsWithRoutes = async (): Promise<DepositDTO[]> => {
  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/bff/deposits/with-routes`, {
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
      // Handle authentication errors specifically
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch deposits with routes (${response.status})`
      );
    }

    const data = await response.json();
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data as DepositDTO[];
    }
    
    // If response has a deposits property
    if (data.deposits && Array.isArray(data.deposits)) {
      return data.deposits as DepositDTO[];
    }
    
    // If response has a data property
    if (data.data && Array.isArray(data.data)) {
      return data.data as DepositDTO[];
    }

    // Return empty array if no valid format found
    return [];
  } catch (error) {
    console.error("Error fetching deposits with routes:", error);
    throw error;
  }
};
