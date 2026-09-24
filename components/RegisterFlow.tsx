import React, { type Ref } from "react";
import type { FirstLoginData } from "@/types/firstLogin";

type LoginViewId = "login" | "forgot" | "first";

/**
 * First-time password setup (“First Login”): collects email, password, and confirmation, then posts to
 * `/auth/set-initial-password`. State and submit logic live in the parent hook (`useLoginForm`).
 */
export interface RegisterFlowProps {
  viewRef: Ref<HTMLDivElement>;
  firstLoginData: FirstLoginData;
  setFirstLoginData: React.Dispatch<React.SetStateAction<FirstLoginData>>;
  isLoading: boolean;
  error: string;
  success: string;
  onSubmit: (e: React.FormEvent) => void;
  switchView: (target: LoginViewId) => void;
}

export function RegisterFlow({
  viewRef,
  firstLoginData,
  setFirstLoginData,
  isLoading,
  error,
  success,
  onSubmit,
  switchView,
}: RegisterFlowProps) {
  return (
    <div id="firstLoginView" ref={viewRef} className="form-view">
      <a
        href="#!"
        className="back-link"
        onClick={(e) => {
          e.preventDefault();
          switchView("login");
        }}
      >
        &larr; Back to Login
      </a>
      <div className="login-header">
        <div className="login-title">First Time Registration</div>
      </div>
      <form onSubmit={onSubmit}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            placeholder="Enter your email"
            value={firstLoginData.email}
            onChange={(e) => setFirstLoginData({ ...firstLoginData, email: e.target.value })}
            required
            disabled={isLoading}
            suppressHydrationWarning
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="Enter your password"
            value={firstLoginData.password}
            onChange={(e) => setFirstLoginData({ ...firstLoginData, password: e.target.value })}
            required
            disabled={isLoading}
            minLength={8}
            suppressHydrationWarning
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="Confirm your password"
            value={firstLoginData.confirmPassword}
            onChange={(e) =>
              setFirstLoginData({ ...firstLoginData, confirmPassword: e.target.value })
            }
            required
            disabled={isLoading}
            minLength={8}
            suppressHydrationWarning
          />
        </div>

        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? "Setting Password..." : "SET PASSWORD"}
        </button>
      </form>
    </div>
  );
}
