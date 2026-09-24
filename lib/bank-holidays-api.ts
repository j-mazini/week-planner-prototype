import { getApiBaseUrl } from './apiBaseUrl';
import { hasAuthSession, getBearerAuthHeader } from './auth'

/**
 * Busca a lista de feriados bancários para um determinado ano.
 * 
 * @param year - O ano desejado para consulta.
 * @param country - O código do país desejado (atualmente apenas 'UK' é suportado).
 * @returns Uma Promise que resolve em um array de strings de datas (YYYY-MM-DD).
 */
export async function fetchBankHolidays(year: number, country: string = 'UK'): Promise<string[]> {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    console.warn('NEXT_PUBLIC_API_URL is not configured.');
    throw new Error('API URL is not configured. Please check your environment variables.');
  }

  if (!hasAuthSession()) {
    throw new Error('Authentication token not found. Please login again.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/bff/bank-holidays?year=${year}&country=${country}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch bank holidays (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching bank holidays:', error);
    throw error;
  }
}
