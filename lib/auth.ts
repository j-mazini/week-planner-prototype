import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { MOCK_MODE, mockToken } from './mock-api';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    userTypeId: number;
    roles: string[];
    permissions: string[];
    companyId?: number;
    servicePartnerId?: number | null;
  };
}

export interface TokenPayload {
  username?: string;
  fullName?: string;
  userTypeId: number;
  userId: number;
  companyId: number;
  servicePartnerId?: number | null;
  exp?: number;
  iat?: number;
  sub?: string;
  permissao?: string[];
  menu?: string[];
  url?: string[];
}

/** Shape stored in `sessionStorage.auth_user` after login (see `useAuth`). */
export interface AuthUserSession {
  id: number;
  name: string;
  email: string;
  userTypeId: number;
  roles: string[];
  permissions: string[];
  companyId?: number;
  servicePartnerId?: number | null;
}

/**
 * True when the app considers the user signed in.
 *
 * Verifica dois cookies (ambos setados por saveToken após login):
 * - `auth-token`   → presente quando não há conflito com cookie httpOnly do backend (ex: homolog).
 * - `auth-session` → marcador dedicado ao client-side, não conflita com cookies httpOnly.
 *
 * O middleware (server-side) usa `auth-token` independentemente — pode ler httpOnly,
 * então funciona tanto local (cookie httpOnly do backend) quanto homolog (nosso cookie).
 */
export function hasAuthSession(): boolean {
  if (MOCK_MODE) return true;
  if (typeof window === "undefined") return false;
  
  // 1. Check cookies (normal logic)
  const cookies = document.cookie.split(";");
  const hasCookie = cookies.some(
    (c) => c.trim().startsWith("auth-token=") || c.trim().startsWith("auth-session=")
  );
  if (hasCookie) return true;

  // 2. Fallback to sessionStorage (set by useAuth during login)
  // This helps when cookies are httpOnly and not visible to document.cookie,
  // or if there's a slight delay in cookie visibility during redirection.
  try {
    const authUser = sessionStorage.getItem("auth_user");
    if (authUser) return true;
  } catch {
    // ignore
  }

  // 3. Fallback to legacy localStorage token
  const legacyToken = localStorage.getItem("auth-token");
  if (legacyToken && legacyToken.trim().length > 0) return true;

  return false;
}

/** Reads `sessionStorage.auth_user` JSON (set on login). */
export function readAuthUserFromSession(): AuthUserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("auth_user");
    if (!raw) return null;
    return JSON.parse(raw) as AuthUserSession;
  } catch {
    return null;
  }
}

/**
 * Decodes the JWT payload (middle segment) in the browser using `atob`.
 *
 * @param token - Full JWT string (header.payload.signature)
 * @returns Parsed payload object
 * @throws Error if the token is missing, malformed, or not valid JSON
 */
export function decodeJwtPayload(token: string): TokenPayload {
  try {
    if (!token || typeof token !== "string") {
      throw new Error("Token is not a valid string");
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error(`Token does not have 3 parts. Found ${parts.length} parts.`);
    }

    const base64Url = parts[1];
    if (!base64Url) {
      throw new Error("Token payload is missing");
    }

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = window.atob(base64);
    const payload = JSON.parse(decoded) as TokenPayload;
    return payload;
  } catch (error) {
    console.error("Error decoding token:", error);
    console.error("Token received:", token ? `${token.substring(0, 20)}...` : "null/undefined");
    throw new Error(
      `Invalid token format: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  if (MOCK_MODE) {
    return {
      token: mockToken,
      user: {
        id: 101,
        name: 'João Silva',
        email: credentials.email || 'joao@logixsphere.local',
        userTypeId: 1,
        roles: ['admin'],
        permissions: ['all_access'],
        companyId: 1,
        servicePartnerId: null,
      },
    };
  }
  try {
    const apiUrl = getApiBaseUrl();
    if (!apiUrl) {
      throw new Error("API URL is not configured. Please check the environment variables.");
    }

    // `rememberMe` é preferência do frontend; não deve ser enviado ao backend.
    // Alguns backends validam o body de forma estrita e rejeitam campos extras.
    const { rememberMe: _rememberMe, ...authCredentials } = credentials;

    // Adicionar deviceInfo se disponível (se o backend não suportar, remova)
    const deviceInfo = typeof window !== 'undefined'
      ? navigator.userAgent || 'Unknown Device'
      : 'Server';

    const response = await fetch(
      `${apiUrl}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...authCredentials,
          deviceInfo: deviceInfo
        }),
      }
    );

    if (!response.ok) {
      let errorMessage = "Authentication failed";
      const debugResponse = response.clone();
      const debugUrl = `${apiUrl}/auth/login`;
      const debugStatus = response.status;
      const debugStatusText = response.statusText;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;

        if (process.env.NODE_ENV === 'development') {
          const debug = {
            url: debugUrl,
            status: debugStatus,
            statusText: debugStatusText,
            contentType: response.headers.get("content-type"),
            responseBody: errorData,
            requestBody: {
              email: credentials?.email,
              rememberMe: credentials?.rememberMe,
              deviceInfo,
            },
          };
          // Next.js dev overlay intercepta console.error; use warn para não virar "unhandled error"
          console.warn(`Login failed (HTTP ${debugStatus})`, debug);
          console.warn("Login failed debug (copy/paste):", JSON.stringify(debug, null, 2));
        }
      } catch {
        // Em dev, tenta capturar o corpo como texto para debug
        if (process.env.NODE_ENV === 'development') {
          try {
            const rawText = await debugResponse.text();
            const debug = {
              url: debugUrl,
              status: debugStatus,
              statusText: debugStatusText,
              contentType: response.headers.get("content-type"),
              responseBodyText: rawText,
              requestBody: {
                email: credentials?.email,
                rememberMe: credentials?.rememberMe,
                deviceInfo,
              },
            };
            console.warn(`Login failed (HTTP ${debugStatus}, non-JSON)`, debug);
            console.warn("Login failed debug (copy/paste):", JSON.stringify(debug, null, 2));
          } catch {
            // ignore
          }
        }

        // If JSON parsing fails, use a status-based message
        if (response.status === 401) {
          errorMessage = "Invalid email or password";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (response.status === 503) {
          errorMessage = "Service temporarily unavailable";
        } else {
          errorMessage = `Error processing login (${response.status})`;
        }
      }

      // Anexar status HTTP para facilitar diagnóstico (evita ficar preso em mensagens genéricas).
      // Só adiciona se ainda não tiver um "(HTTP NNN)" na string.
      if (!/\(HTTP\s+\d+\)\s*$/.test(errorMessage)) {
        errorMessage = `${errorMessage} (HTTP ${response.status})`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // If it's a network error, provide a clearer message
    if (error instanceof TypeError && typeof error.message === 'string' && error.message.includes('fetch')) {
      throw new Error("Could not connect to the server. Please check your connection.");
    }
    // Re-throw the error with the original message
    throw error;
  }
};

export const saveToken = (token: string, rememberMe: boolean = false): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth-remember-me", rememberMe ? "1" : "0");

    const maxAgePart = rememberMe ? `; max-age=${60 * 60 * 24 * 30}` : "";

    // auth-token: lido pelo middleware (server-side) para autenticar rotas privadas.
    // Em ambientes onde o backend seta auth-token como httpOnly no mesmo domínio (ex: local dev),
    // esta escrita é silenciosamente ignorada pelo browser — o middleware ainda funciona
    // porque lê o cookie httpOnly do backend diretamente.
    document.cookie = `auth-token=${token}; path=/; SameSite=Lax${maxAgePart}`;

    // auth-session: marcador client-side lido por hasAuthSession() / RequireAuthClient.
    // Nome diferente de auth-token para evitar conflito com o cookie httpOnly do backend.
    // Sempre usa max-age mínimo de 1 hora para cobrir o tempo da animação de login (4.5s)
    // e eventuais delays de hidratação, mesmo quando rememberMe=false.
    const sessionMaxAge = rememberMe
      ? `; max-age=${60 * 60 * 24 * 30}`
      : `; max-age=${60 * 60}`; // 1 hora por defeito (sessão curta)
    document.cookie = `auth-session=1; path=/; SameSite=Lax${sessionMaxAge}`;

    try {
      localStorage.removeItem("auth-token");
      sessionStorage.setItem("auth-token", token);
    } catch {
      // ignore
    }
  }
};

/**
 * Sincroniza o token client-side a partir de um refresh do backend (header `X-New-Token`).
 * Mantém o token guardado sempre fresco, evitando enviar um Bearer velho como Authorization —
 * o que faria o backend escopar dados pelo contexto antigo (companyId/depositId/servicePartnerId
 * das claims) e retornar listas vazias. Não mexe no cookie httpOnly do backend (ele já o renova)
 * nem na preferência rememberMe.
 */
export const syncRefreshedToken = (token: string): void => {
  if (typeof window === "undefined") return;
  const clean = (token ?? "").trim();
  if (!clean) return;
  try {
    sessionStorage.setItem("auth-token", clean);
    // Remove o token legado do localStorage para não sobrepor com um valor velho (getToken o lê como fallback).
    localStorage.removeItem("auth-token");
  } catch {
    // ignore (modo privado/quota)
  }
  try {
    const rememberMe = localStorage.getItem("auth-remember-me") === "1";
    const maxAgePart = rememberMe ? `; max-age=${60 * 60 * 24 * 30}` : "";
    document.cookie = `auth-token=${clean}; path=/; SameSite=Lax${maxAgePart}`;
  } catch {
    // ignore
  }
};

/**
 * @deprecated Avoid using getToken() client-side as the token is now in an httpOnly cookie.
 * This remains for broad compatibility during transition but will return null for new sessions.
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;

  let token: string | null = null;
  let source = "";

  // 1. Try sessionStorage (preferred for current session)
  try {
    const fromSession = sessionStorage.getItem("auth-token");
    if (fromSession && fromSession.trim().length > 0) {
      token = fromSession.trim();
      source = "sessionStorage";
    }
  } catch { /* ignore */ }

  // 2. Try localStorage (legacy/remember-me)
  if (!token) {
    try {
      const fromStorage = localStorage.getItem("auth-token");
      if (fromStorage && fromStorage.trim().length > 0) {
        token = fromStorage.trim();
        source = "localStorage";
      }
    } catch { /* ignore */ }
  }

  // 3. Fallback to cookie
  if (!token) {
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((c) => {
      const trimmed = c.trim();
      return trimmed.startsWith("auth-token=") || trimmed.startsWith("authToken=");
    });
    if (tokenCookie) {
      const parts = tokenCookie.split("=");
      if (parts.length >= 2) {
        const raw = parts.slice(1).join("=").trim();
        // Tokens as cookies might be URL encoded (e.g. if set by some backends)
        token = raw.includes("%") ? decodeURIComponent(raw) : raw;
        source = "cookie";
      }
    }
  }

  if (process.env.NODE_ENV === "development" && token) {
    // eslint-disable-next-line no-console
    console.debug(`[Auth] Token found from ${source}: ${token.substring(0, 15)}...`);
  } else if (process.env.NODE_ENV === "development" && !token) {
    console.warn("[Auth] No auth token found in any storage source.");
  }

  return token;
};

/**
 * Optional `Authorization: Bearer …` when a legacy token exists in localStorage.
 * Cookie-only sessions omit the header; rely on `credentials: 'include'` + installApiFetchCredentials.
 */
export function getBearerAuthHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getRememberMePreference = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("auth-remember-me") === "1";
};

/**
 * @deprecated Use useAuth() hook to get user notification and metadata.
 */
export const getFullNameFromToken = (): string | null => {
  try {
    // First try to get from cookie
    if (typeof window !== "undefined") {
      const cookies = document.cookie.split(';');
      const fullNameCookie = cookies.find(cookie => cookie.trim().startsWith('user-fullname='));
      if (fullNameCookie) {
        const fullName = decodeURIComponent(fullNameCookie.split('=')[1]);
        if (fullName && fullName !== 'undefined') {
          return fullName;
        }
      }
    }

    const fromSession = readAuthUserFromSession();
    if (fromSession?.name) {
      return fromSession.name;
    }

    const token = getToken();
    if (!token) {
      return null;
    }

    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload: TokenPayload = JSON.parse(window.atob(base64));

    return payload.fullName || null;
  } catch (error) {
    console.error("Error extracting fullName:", error);
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  if (typeof window !== "undefined") {
    // 1. Call backend to clear httpOnly cookie
    try {
      await fetch(`${getApiBaseUrl()}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Failed to logout from server:", error);
    }

    // 2. Remove from browser storage
    localStorage.removeItem("auth-token");
    try {
      sessionStorage.removeItem("auth-token");
    } catch {
      // Ignore
    }
    localStorage.removeItem("auth-remember-me");

    // 3. Remove client-side non-httpOnly cookies
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "auth-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "user-fullname=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "auth-remember-me=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return hasAuthSession();
};

/**
 * @deprecated Use useAuth() hook.
 */
export const getUserIdFromToken = (): number | null => {
  try {
    const fromSession = readAuthUserFromSession();
    if (fromSession?.id != null) {
      return Number(fromSession.id);
    }

    const token = getToken();
    if (!token) {
      return null;
    }

    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64));

    return payload.userId || null;
  } catch (error) {
    // Silently fail in production
    if (process.env.NODE_ENV === 'development') {
      console.error("Error decoding token:", error);
    }
    return null;
  }
};

/**
 * @deprecated Use useAuth() hook.
 */
export const getUserTypeFromToken = (): number | null => {
  try {
    const fromSession = readAuthUserFromSession();
    if (fromSession?.userTypeId != null) {
      return Number(fromSession.userTypeId);
    }

    const token = getToken();
    if (!token) {
      return null;
    }

    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload: TokenPayload = JSON.parse(window.atob(base64));

    const id = payload.userTypeId ?? (payload as { userTypeId?: number }).userTypeId;
    return id != null ? Number(id) : null;
  } catch (error) {
    // Silently fail in production
    if (process.env.NODE_ENV === 'development') {
      console.error("Error decoding token:", error);
    }
    return null;
  }
};


/** Single-pass read of tenant IDs — sessionStorage first, JWT fallback. */
function readTenantContext(): { companyId: number | null; servicePartnerId: number | null } {
  try {
    const fromSession = readAuthUserFromSession();
    if (fromSession?.companyId != null) {
      return {
        companyId: Number(fromSession.companyId),
        servicePartnerId: fromSession.servicePartnerId != null ? Number(fromSession.servicePartnerId) : null,
      };
    }

    const token = getToken();
    if (!token) return { companyId: null, servicePartnerId: null };

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload: TokenPayload = JSON.parse(window.atob(base64));
    return {
      companyId: payload.companyId != null ? Number(payload.companyId) : null,
      servicePartnerId: payload.servicePartnerId != null ? Number(payload.servicePartnerId) : null,
    };
  } catch {
    return { companyId: null, servicePartnerId: null };
  }
}

/** Reads `companyId` from sessionStorage or JWT. Prefer `useAuth().companyId` in React components. */
export const getCompanyIdFromToken = (): number | null => readTenantContext().companyId;

/** Reads `servicePartnerId` from sessionStorage or JWT. Prefer `useAuth().servicePartnerId` in React components. */
export const getServicePartnerIdFromToken = (): number | null => readTenantContext().servicePartnerId;

export interface RegisterCredentials {
  fullName: string;
  email: string;
  phone: string;
  company: string;
}

export interface RegisterResponse {
  message: string;
}

export const register = async (
  credentials: RegisterCredentials
): Promise<RegisterResponse> => {
  const response = await fetch(
    `${getApiBaseUrl()}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to register user");
  }

  return response.json();
};

export interface ForgotPasswordResponse {
  message: string;
}

export const sendPasswordResetToken = async (
  email: string
): Promise<ForgotPasswordResponse> => {
  const response = await fetch(
    `${getApiBaseUrl()}/auth/send-password-reset-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to send password reset token");
  }

  return response.json();
};
