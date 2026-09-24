import { hasAuthSession, getBearerAuthHeader } from "./auth";
import { getApiBaseUrl } from "./apiBaseUrl";

export interface ChatUser {
  userId: number;
  fullName: string;
  userTypeId: number;
}

export const fetchChatUsers = async (): Promise<ChatUser[]> => {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not configured.");
    throw new Error("API URL is not configured. Please check your environment variables.");
  }

  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await fetch(`${API_BASE_URL}/bff/chat/users`, {
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch chat users (${response.status})`
    );
  }

  const data = await response.json();
  const normalize = (raw: Record<string, unknown>): ChatUser => ({
    userId: Number(raw.userId ?? raw.user_id ?? 0),
    fullName: String(raw.fullName ?? raw.full_name ?? ""),
    userTypeId: Number(raw.userTypeId ?? raw.user_type_id ?? 0),
  });

  if (data.users && Array.isArray(data.users)) {
    return data.users.map(normalize).filter((u: ChatUser) => u.userId > 0);
  }

  if (Array.isArray(data)) {
    return data.map(normalize).filter((u: ChatUser) => u.userId > 0);
  }

  return [];
};

