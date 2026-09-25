import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useState, useCallback, type RefObject } from "react";
import { useSearchParams } from "next/navigation";
import {
  login,
  saveToken,
  sendPasswordResetToken,
  decodeJwtPayload,
} from "@/lib/auth";
import type { FirstLoginData } from "@/types/firstLogin";
import { useAuth } from "@/hooks/useAuth";
import { MOCK_MODE } from "@/lib/mock-api";
import { BUSINESS_RULES } from "@/src/constants/businessRules";

type DemoProfile = "admin" | "supervisor" | "driver";

export type { FirstLoginData };

export interface UseLoginFormOptions {
  /** Used to read the password field when the browser autofills before React state updates. */
  passwordInputRef: RefObject<HTMLInputElement | null>;
  /** Resets GSAP overlay/card visuals after a failed login attempt. */
  onLoginFailed?: () => void;
  /** Role selector used only by the offline prototype. */
  demoProfile?: DemoProfile;
}

/**
 * Owns all React state and API handlers for the login page (login, forgot password, first login).
 * Success login animation is triggered separately via a `login-success` window event handled by
 * {@link useLoginAnimations}.
 *
 * @param options - Refs and optional callbacks wired from the parent.
 * @returns State and handlers for composing the login UI.
 */
export const useLoginForm = (options: UseLoginFormOptions) => {
  const { passwordInputRef, onLoginFailed, demoProfile = "admin" } = options;
  const searchParams = useSearchParams();
  const auth = useAuth();

  const [activeView, setActiveView] = useState<"login" | "forgot" | "first">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [firstLoginData, setFirstLoginData] = useState<FirstLoginData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const switchView = useCallback((targetViewName: "login" | "forgot" | "first") => {
    setActiveView(targetViewName);
    setError("");
    setSuccess("");
  }, []);

  const handleLoginSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("login-attempt-start"));
      setIsLoading(true);
      setError("");
      setSuccess("");

      try {
        let loginEmail = email;
        let loginPassword = password;
        try {
          if (!loginPassword && passwordInputRef.current?.value) {
            loginPassword = passwordInputRef.current.value;
          }
        } catch {
          // ignore read errors
        }

        const baseResponse = await login({ email: loginEmail, password: loginPassword, rememberMe });
        const demoRole = {
          admin: { userTypeId: BUSINESS_RULES.USER_TYPE.ADMIN, roles: ["admin"], permissions: ["all_access"] },
          supervisor: { userTypeId: BUSINESS_RULES.USER_TYPE.SUPERVISOR, roles: ["supervisor"], permissions: [] },
          driver: { userTypeId: BUSINESS_RULES.USER_TYPE.DRIVER, roles: ["driver"], permissions: [] },
        }[demoProfile];
        const response = MOCK_MODE
          ? { ...baseResponse, user: { ...baseResponse.user, ...demoRole } }
          : baseResponse;
        if (!response || !response.token) {
          throw new Error("Token não recebido do servidor");
        }

        // Extrair companyId e servicePartnerId do JWT (fonte canônica do backend)
        let jwtCompanyId: number | undefined;
        let jwtServicePartnerId: number | null = null;
        try {
          const payload = decodeJwtPayload(response.token);
          jwtCompanyId = payload.companyId;
          jwtServicePartnerId = payload.servicePartnerId ?? null;
        } catch {
          // Falha no decode não bloqueia o login; campos ficarão ausentes na sessão
        }

        const enrichedResponse = {
          ...response,
          user: {
            ...response.user,
            ...(jwtCompanyId != null && { companyId: jwtCompanyId }),
            servicePartnerId: jwtServicePartnerId,
          },
        };

        // Salvar metadados no contexto de autenticação
        auth.login(enrichedResponse);
        saveToken(response.token, rememberMe);

        // Always redirect to /home on login; the middleware will enforce route permissions
        // based on user type and BUSINESS_RULES
        let redirectPath = "/home";

        const callbackUrl =
          (typeof searchParams?.get === "function" ? searchParams.get("callbackUrl") : null) ||
          redirectPath;

        window.dispatchEvent(
          new CustomEvent("login-success", { detail: { callbackUrl } })
        );
      } catch (err: unknown) {
        onLoginFailed?.();
        const errorMessage = err instanceof Error ? err.message : "Email ou senha inválidos";
        setError(errorMessage);
        if (process.env.NODE_ENV === "development") {
          console.warn("Login failed:", err);
        }
        setIsLoading(false);
      }
    },
    [email, password, rememberMe, passwordInputRef, onLoginFailed, searchParams, demoProfile]
  );

  const handleForgotPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");
      setSuccess("");
      try {
        const response = await sendPasswordResetToken(forgotEmail);
        setSuccess(
          response.message ||
            "Password reset link has been sent to your email. Please check your inbox."
        );
        setForgotEmail("");
        setTimeout(() => switchView("login"), 3000);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to send password reset link. Please try again."
        );
        console.error("Forgot password error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [forgotEmail, switchView]
  );

  const handleFirstLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");
      setSuccess("");

      if (firstLoginData.password !== firstLoginData.confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      if (firstLoginData.password.length < 8) {
        setError("Password must be at least 8 characters");
        setIsLoading(false);
        return;
      }

      try {
        const API_BASE_URL = getApiBaseUrl();
        const response = await fetch(`${API_BASE_URL}/auth/set-initial-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: firstLoginData.email,
            password: firstLoginData.password,
            confirmed_password: firstLoginData.confirmPassword,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Failed to set initial password. Please try again."
          );
        }

        const data = await response.json().catch(() => ({}));
        setSuccess(
          data.message ||
            "Password set successfully. You can now login with your credentials."
        );
        setFirstLoginData({
          email: "",
          password: "",
          confirmPassword: "",
        });
        setTimeout(() => switchView("login"), 3000);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to set initial password. Please try again."
        );
        console.error("Set initial password error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [firstLoginData, switchView]
  );

  return {
    activeView,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    isLoading,
    error,
    success,
    forgotEmail,
    setForgotEmail,
    firstLoginData,
    setFirstLoginData,
    switchView,
    handleLoginSubmit,
    handleForgotPassword,
    handleFirstLogin,
  };
};
