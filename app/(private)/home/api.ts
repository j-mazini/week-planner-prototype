import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { hasAuthSession, getBearerAuthHeader } from '@/lib/auth'
import { StatusDTO } from './types';

const API_BASE_URL = getApiBaseUrl();



export const fetchStatus = async (): Promise<StatusDTO | null> => {
  if (!API_BASE_URL) {
    console.warn('NEXT_PUBLIC_API_URL is not configured. Cannot fetch status data.');
    return null;
  }

  if (!hasAuthSession()) {
    console.warn('Authentication token not found. Cannot fetch status data.');
    return null;
  }

  try {
    // Get current date for month, year, and day parameters
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed, so add 1
    const year = now.getFullYear().toString();
    const day = now.getDate().toString().padStart(2, '0');
    
    const url = new URL(`${API_BASE_URL}/bff/status`);
    url.searchParams.append('month', month);
    url.searchParams.append('year', year);
    url.searchParams.append('day', day);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Failed to fetch status data', errorData);
      return null;
    }

    const data = (await response.json()) as StatusDTO;
    return data;
  } catch (error) {
    console.warn('Error fetching status data:', error);
    return null;
  }
};
