import { syncRefreshedToken } from "./auth";
import { isMockApiRequest, mockResponse } from "./mock-api";

declare global {
  interface Window {
    __logixSphereApiFetchCredentialsInstalled?: boolean;
  }
}

function resolveRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

/**
 * Patches `window.fetch` once so requests to `NEXT_PUBLIC_API_URL` send cookies
 * (`credentials: 'include'`), required for httpOnly JWT sessions on cross-origin API calls.
 */
export function installApiFetchCredentials(): void {
  if (typeof window === "undefined") return;
  if (window.__logixSphereApiFetchCredentialsInstalled) return;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = resolveRequestUrl(input);
    if (isMockApiRequest(url)) {
      const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
      return Promise.resolve(mockResponse(url, method));
    }
    if (apiUrl && url.startsWith(apiUrl)) {
      const headers = new Headers(init?.headers);
      headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
      headers.set("Pragma", "no-cache");
      headers.set("Expires", "0");

      return originalFetch(input, {
        ...init,
        headers,
        cache: "no-store",
        credentials: init?.credentials ?? "include",
      }).then((response) => {
        // Mantém o token client-side em sincronia com o refresh do backend.
        // Ler só o header (não consome o body) é seguro.
        try {
          const newToken = response.headers.get("X-New-Token");
          if (newToken) syncRefreshedToken(newToken);
        } catch {
          // ignore
        }
        return response;
      });
    }
    return originalFetch(input, init);
  };

  window.__logixSphereApiFetchCredentialsInstalled = true;
}
