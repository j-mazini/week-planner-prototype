import { getApiBaseUrl } from "@/lib/apiBaseUrl";
﻿import { hasAuthSession, getBearerAuthHeader } from "./auth"

const API_BASE_URL = getApiBaseUrl();

/**
 * Interface for CustomerDTO from GET /customers endpoint
 */
export interface CustomerDTO {
  customerId: number;
  customerName: string;
  active: boolean;
  start_date?: string;
  end_date?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Fetches all customers from the GET /customers endpoint
 * @returns Promise with array of CustomerDTO
 */
export const fetchCustomers = async (): Promise<CustomerDTO[]> => {
  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  try {
    // Try /bff/customers first (standard endpoint pattern)
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/bff/customers`, {
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

      // If 404, try /customers as fallback
      if (!response.ok && response.status === 404) {
        console.warn('Endpoint /bff/customers returned 404, trying /customers...');
        response = await fetch(`${API_BASE_URL}/customers`, {
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
      }
    } catch (networkError) {
      // If network error, try fallback endpoint
      console.warn('Error with /bff/customers, trying /customers...', networkError);
      response = await fetch(`${API_BASE_URL}/customers`, {
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
    }

    if (!response.ok) {
      // Handle authentication errors specifically
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Invalid token. Try logging in again or contact the administrator.";
        throw new Error(errorMessage);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch customers (${response.status})`
      );
    }

    const data = await response.json();
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data as CustomerDTO[];
    }
    
    // If response has a customers property
    if (data.customers && Array.isArray(data.customers)) {
      return data.customers as CustomerDTO[];
    }
    
    // If response has a data property
    if (data.data && Array.isArray(data.data)) {
      return data.data as CustomerDTO[];
    }

    // Return empty array if no valid format found
    return [];
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

/**
 * Fetches only active customers from the GET /customers endpoint
 * @returns Promise with array of active CustomerDTO
 */
export const fetchActiveCustomers = async (): Promise<CustomerDTO[]> => {
  const customers = await fetchCustomers();
  return customers.filter(customer => customer.active === true);
};

