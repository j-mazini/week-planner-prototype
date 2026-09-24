import React, { type Ref } from "react";
import Image from "next/image";

type LoginViewId = "login" | "forgot" | "first";

/**
 * Primary sign-in form: email, password (with visibility toggle), remember-me, and links to other flows.
 */
export interface LoginMainViewProps {
  loginViewRef: Ref<HTMLDivElement>;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  passwordInputRef: Ref<HTMLInputElement>;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (v: boolean) => void;
  isLoading: boolean;
  error: string;
  success: string;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchView: (target: LoginViewId) => void;
}

export function LoginMainView({
  loginViewRef,
  email,
  setEmail,
  password,
  setPassword,
  passwordInputRef,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  isLoading,
  error,
  success,
  onSubmit,
  onSwitchView,
}: LoginMainViewProps) {
  return (
    <div id="loginView" ref={loginViewRef} className="form-view active">
      <div className="login-header">
        <p className="login-subtitle">Access your account</p>
      </div>
      <form onSubmit={onSubmit}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-group">
          <label className="form-label">
            <i className="bi bi-envelope"></i> Email
          </label>
          <div className="form-input-icon">
            <i className="bi bi-envelope"></i>
            <input
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              suppressHydrationWarning
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <i className="bi bi-lock"></i> Password
          </label>
          <div className="form-input-icon">
            <i className="bi bi-lock"></i>
            <input
              ref={passwordInputRef}
              type={showPassword ? "text" : "password"}
              className="form-input"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              style={{ paddingRight: "40px" }}
              suppressHydrationWarning
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              <Image
                src={showPassword ? "/eye-slash.svg" : "/eye.svg"}
                alt={showPassword ? "Ocultar senha" : "Mostrar senha"}
                width={16}
                height={16}
                className="password-toggle-icon"
              />
            </button>
          </div>
        </div>

        <div className="form-checkbox">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
            suppressHydrationWarning
          />
          <label htmlFor="rememberMe">Remember me</label>
        </div>

        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </button>

        <div className="login-footer">
          <a
            href="#!"
            className="forgot-password"
            onClick={(e) => {
              e.preventDefault();
              onSwitchView("forgot");
            }}
          >
            Forgot your password?
          </a>
          <a
            href="#!"
            className="forgot-password"
            onClick={(e) => {
              e.preventDefault();
              onSwitchView("first");
            }}
          >
            First Login
          </a>
        </div>
      </form>
    </div>
  );
}
