/**
 * Central place to resolve the Socket.IO base URL for client-side connections.
 *
 * Priority:
 * - NEXT_PUBLIC_API_URL
 * - NEXT_PUBLIC_CHAT_SOCKET_URL
 * - empty (skip socket connection)
 */
export function getSocketBaseUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_CHAT_SOCKET_URL;

  const trimmed = typeof fromEnv === "string" ? fromEnv.trim() : "";
  return trimmed || "";
}
