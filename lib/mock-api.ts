import { pagePayload } from "./mocks/page-payload";

/** Offline data layer used by the prototype. No request leaves the browser. */
export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE !== "false";

const user = {
  id: 101,
  name: "João Silva",
  email: "joao@logixsphere.local",
  userTypeId: 1,
  roles: ["admin"],
  permissions: ["all_access"],
  companyId: 1,
  servicePartnerId: null,
};

export const mockToken = "mock.local.offline-token";

export function mockPayload(url: string, method = "GET"): unknown {
  const parsed = new URL(url, "http://mock.local");
  const path = parsed.pathname.toLowerCase();
  if (path.includes("/auth/login")) return { token: mockToken, user };
  if (path.includes("/auth/logout")) return { success: true };
  if (method !== "GET") return { success: true, message: "Demo action completed (not persisted)" };
  return pagePayload(parsed) ?? { data: [], items: [], success: true };
}

export function mockResponse(url: string, method = "GET"): Response {
  const payload = mockPayload(url, method);
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json", "X-Logix-Mock": "true" },
  });
}

export function isMockApiRequest(url: string): boolean {
  if (!MOCK_MODE) return false;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && url.startsWith(apiUrl)) return true;
  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      if (parsed.port === "3001" || /api|backend|logix/i.test(parsed.hostname)) return true;
    } catch {
      // Fall through to the path matcher.
    }
  }
  return /\/((api|bff|auth)\/|api\/v1\/|customers(?:\/|\?)|messages(?:\/|\?)|metrics(?:\/|\?)|change-user(?:\/|\?)|monthly-summary(?:\/|\?)|status(?:\/|\?))/i.test(url);
}
