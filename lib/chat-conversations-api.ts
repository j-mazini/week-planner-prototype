import { hasAuthSession, getBearerAuthHeader } from "./auth";
import { getApiBaseUrl } from "./apiBaseUrl";
import { guardedFetch } from "@/lib/in-flight-guard";

export interface ChatConversation {
  id: string;
  isGroup: boolean;
  createdBy: number;
  createdAt: string;
  groupName?: string | null;
}

export type ChatMessageType = "text" | "image" | "file";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: number;
  type: ChatMessageType;
  content: string | null;
  fileUrl: string | null;
  createdAt: string;
  read?: boolean;
  readByOthers?: boolean | null;
}

export interface UnreadSummaryItem {
  conversationId: string;
  peerUserId?: number;
  unreadCount: number;
  lastMessage?: ChatMessage;
}

export interface MessageViewer {
  userId: number;
  fullName: string;
  seenAt: string;
}

export const normalizeConversation = (raw: Record<string, unknown>): ChatConversation => ({
  id: String(raw.id ?? ""),
  isGroup: Boolean(raw.isGroup ?? raw.is_group ?? false),
  createdBy: Number(raw.createdBy ?? raw.created_by ?? 0),
  createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
  groupName: raw.groupName ? String(raw.groupName) : raw.group_name ? String(raw.group_name) : null,
});

export const normalizeMessage = (raw: Record<string, unknown>): ChatMessage => ({
  id: String(raw.id ?? raw.messageId ?? raw.message_id ?? ""),
  conversationId: String(raw.conversationId ?? raw.conversation_id ?? ""),
  senderId: Number(raw.senderId ?? raw.sender_id ?? 0),
  type: (raw.type ?? "text") as ChatMessageType,
  content: (raw.content ?? null) as string | null,
  fileUrl: (raw.fileUrl ?? raw.file_url ?? null) as string | null,
  createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
  read: typeof raw.read === "boolean" ? raw.read : undefined,
  readByOthers:
    typeof raw.readByOthers === "boolean" ? raw.readByOthers : typeof raw.read_by_others === "boolean" ? raw.read_by_others : undefined,
});

export const getOrCreateDirectConversation = async (
  peerUserId: number
): Promise<ChatConversation> => {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/chat/conversations/direct`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
    },
    body: JSON.stringify({ 
      peerUserId: peerUserId,
      peer_user_id: peerUserId 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to create conversation (${response.status})`
    );
  }

  const data = await response.json();
  return normalizeConversation(data);
};

export const fetchConversations = async (): Promise<ChatConversation[]> => {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/chat/conversations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch conversations (${response.status})`
    );
  }

  const data = await response.json();
  const list: Array<Record<string, unknown>> = Array.isArray(data.conversations)
    ? data.conversations
    : Array.isArray(data)
      ? data
      : [];
  return list.map(normalizeConversation).filter((conv: ChatConversation) => conv.id);
};

export const getOrCreateGlobalGroupConversation = async (
  allUsers: Array<{ userId: number; userTypeId: number }>
): Promise<ChatConversation> => {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  // Inclui todos os usuários (agora o backend permite múltiplos vendors em grupos)
  const allowedUserIds = allUsers.map((u) => u.userId);

  // Usa o endpoint especial que busca ou cria o grupo "News" e garante que o usuário atual esteja nele
  const response = await guardedFetch(`${API_BASE_URL}/bff/chat/conversations/global-group`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
    },
    body: JSON.stringify({
      userIds: allowedUserIds,
      user_ids: allowedUserIds,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to get or create global group conversation (${response.status})`
    );
  }

  const data = await response.json();
  return normalizeConversation(data);
};

export const fetchConversationMessages = async (
  conversationId: string,
  limit: number = 50,
  before?: string | null
): Promise<ChatMessage[]> => {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (before) params.set("before", before);

  const response = await guardedFetch(
    `${API_BASE_URL}/bff/chat/conversations/${conversationId}/messages?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch messages (${response.status})`
    );
  }

  const data = await response.json();
  const list: Array<Record<string, unknown>> = Array.isArray(data.messages)
    ? data.messages
    : Array.isArray(data)
      ? data
      : [];
  return list.map(normalizeMessage).filter((message: ChatMessage) => message.id);
};

export const fetchUnreadSummary = async (): Promise<UnreadSummaryItem[]> => {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/chat/unread`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch unread summary (${response.status})`
    );
  }

  const data = await response.json();

  const list: Array<Record<string, unknown>> = Array.isArray(data.unread)
    ? data.unread
    : [];

  return list.map((raw) => ({
    conversationId: String(raw.conversationId ?? raw.conversation_id ?? ""),
    peerUserId:
      typeof raw.peerUserId === "number"
        ? raw.peerUserId
        : typeof raw.peer_user_id === "number"
        ? raw.peer_user_id
        : Number(raw.peerUserId ?? raw.peer_user_id ?? 0) || undefined,
    unreadCount: Number(raw.unreadCount ?? 0),
    lastMessage: raw.lastMessage && typeof raw.lastMessage === "object"
      ? normalizeMessage(raw.lastMessage as Record<string, unknown>)
      : undefined,
  }));
};

export const sendConversationMessage = async (
  conversationId: string,
  payload: { type: ChatMessageType; content?: string; fileUrl?: string }
): Promise<ChatMessage> => {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const controller = new AbortController();
  const timeoutMs = 15000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await guardedFetch(`${API_BASE_URL}/bff/chat/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
      body: JSON.stringify({
        type: payload.type,
        content: payload.content,
        fileUrl: payload.fileUrl,
        // Backward compatibility
        message_type: payload.type,
        file_url: payload.fileUrl,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error("Message send timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to send message (${response.status})`
    );
  }

  const data = await response.json();
  return normalizeMessage(data);
};

export const markConversationSeen = async (
  conversationId: string,
  seenAt?: string
): Promise<{ success: boolean; conversationId: string; seenAt: string }> => {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/chat/conversations/${conversationId}/seen`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
    },
    body: JSON.stringify({ 
      seenAt,
      seen_at: seenAt 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to mark conversation seen (${response.status})`
    );
  }

  return response.json();
};

export const getUploadUrl = async (params: {
  conversationId: string;
  mimeType: string;
  kind: "image" | "file";
}): Promise<{ uploadUrl: string; fileUrl: string }> => {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/files/upload-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
    },
    body: JSON.stringify({
      ...params,
      conversation_id: params.conversationId,
      mime_type: params.mimeType
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to get upload URL (${response.status})`
    );
  }

  return response.json();
};

export const uploadFileToGcs = async (uploadUrl: string, file: File): Promise<void> => {
  const response = await guardedFetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file (${response.status})`);
  }
};

export const fetchMessageViewers = async (
  conversationId: string,
  messageCreatedAt: string
): Promise<MessageViewer[]> => {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const params = new URLSearchParams();
  params.set("createdAt", messageCreatedAt);

  const response = await guardedFetch(
    `${API_BASE_URL}/bff/chat/conversations/${conversationId}/messages/viewers?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getBearerAuthHeader(),
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch message viewers (${response.status})`
    );
  }

  const data = await response.json();
  const normalizeViewer = (raw: Record<string, unknown>): MessageViewer => ({
    userId: Number(raw.userId ?? 0),
    fullName: String(raw.fullName ?? ""),
    seenAt: String(raw.seenAt ?? ""),
  });

  const list: Array<Record<string, unknown>> = Array.isArray(data.viewers)
    ? data.viewers
    : Array.isArray(data)
      ? data
      : [];
  return list.map(normalizeViewer).filter((viewer) => viewer.userId > 0);
};

export const fetchUnreadCount = async (): Promise<number> => {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Please check your environment variables.");
  }
  if (!hasAuthSession()) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await guardedFetch(`${API_BASE_URL}/bff/chat/unread/count`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getBearerAuthHeader(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch unread count (${response.status})`
    );
  }

  const data = await response.json();
  return Number(data.count ?? 0);
};


