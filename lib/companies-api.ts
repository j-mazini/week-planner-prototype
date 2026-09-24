import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { hasAuthSession, getBearerAuthHeader } from './auth';

const API_BASE_URL = getApiBaseUrl();

export interface CompanyDTO {
  companyId: number;
  companyName: string;
  active: boolean;
  vatNumber: string | null;
  email: string;
  startDate: Date | string;
  endDate: Date | string | null;
}

const defaultHeaders = () => ({
  'Content-Type': 'application/json',
  ...getBearerAuthHeader(),
});

function assertReady() {
  if (!API_BASE_URL) throw new Error('API URL is not configured. Please check your environment variables.');
  if (!hasAuthSession()) throw new Error('Authentication token not found. Please login again.');
}

async function parseError(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    return data.message || data.error || `${response.status} ${response.statusText}`;
  } catch {
    return text || `${response.status} ${response.statusText}`;
  }
}

export async function fetchCurrentCompany(): Promise<CompanyDTO> {
  assertReady();
  const response = await fetch(`${API_BASE_URL}/bff/companies/me`, {
    method: 'GET',
    headers: defaultHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Failed to fetch current company: ${await parseError(response)}`);
  const raw = await response.json();
  return (raw?.data ?? raw) as CompanyDTO;
}
