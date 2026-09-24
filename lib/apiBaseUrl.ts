/**
 * Central place to resolve the backend base URL for client-side API calls.
 *
 * Priority:
 * - NEXT_PUBLIC_API_URL (existing)
 * - NEXT_PUBLIC_API_BASE_URL (requested)
 * - fallback to http://localhost:3001
 */
import { MOCK_MODE } from "./mock-api";

export function getApiBaseUrl(): string {
  if (MOCK_MODE) return "http://mock.local/api/mock";
  const fromEnv =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

  const trimmed = typeof fromEnv === "string" ? fromEnv.trim() : "";
  return trimmed || "http://localhost:3001";
}


