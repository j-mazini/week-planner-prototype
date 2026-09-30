import React, { type Ref } from "react";
import Image from "next/image";

type LoginViewId = "login" | "forgot" | "first";

/** Not a role — picking it opens the separate sign-in page instead of switching profile. */
const OPEN_NEW_LOGIN = "open-new-login";

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
  showDemoProfile: boolean;
  demoProfile: "admin" | "supervisor" | "driver";
  onDemoProfileChange: (profile: "admin" | "supervisor" | "driver") => void;
  /** Optional: the duplicated app tree under `Logix-new-front/` reuses this view without a router. */
  onOpenNewLogin?: () => void;
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
  showDemoProfile,
  demoProfile,
  onDemoProfileChange,
  onOpenNewLogin,
  onSubmit,
  onSwitchView,
}: LoginMainViewProps) {
  return (
    <div id="loginView" ref={loginViewRef} className="form-view active">
      <div className="login-header">
        <p className="login-kicker">SECURE WORKSPACE</p>
        <h2>Welcome back</h2>
        <p className="login-subtitle">Sign in to continue to your operations workspace.</p>
      </div>
      <form onSubmit={onSubmit}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {showDemoProfile && (
          <div className="form-group demo-profile-group">
            <label className="form-label" htmlFor="demoProfile">Demo profile</label>
            <div className="demo-profile-select-wrap">
              <select
                id="demoProfile"
                className="form-input demo-profile-select"
                value={demoProfile}
                onChange={(event) => {
                  const picked = event.target.value;
                  if (picked === OPEN_NEW_LOGIN) {
                    // Leaves `demoProfile` untouched, so the select snaps back to the
                    // current role instead of holding a value that is not one.
                    onOpenNewLogin?.();
                    return;
                  }
                  onDemoProfileChange(picked as "admin" | "supervisor" | "driver");
                }}
                disabled={isLoading}
              >
                <optgroup label="Sign in as">
                  <option value="admin">Admin</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="driver">Driver</option>
                </optgroup>
                {onOpenNewLogin && (
                  <optgroup label="Other pages">
                    <option value={OPEN_NEW_LOGIN}>New sign-in page</option>
                  </optgroup>
                )}
              </select>
              <span className="demo-select-chevron" aria-hidden="true">⌄</span>
            </div>
            <span className="demo-profile-hint">Preview a workspace by role. No real access is changed.</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="loginEmail">Email address</label>
          <div className="form-input-icon">
            <input
              id="loginEmail"
              type="text"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
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
          <label className="form-label" htmlFor="loginPassword">Password</label>
          <div className="form-input-icon">
            <input
              id="loginPassword"
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
          <label htmlFor="rememberMe">Keep me signed in</label>
        </div>

        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
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
            Forgot password?
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
