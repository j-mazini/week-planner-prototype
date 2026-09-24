// components/PasswordResetFlow.tsx
/**
 * Password reset flow component used inside the login page.
 *
 * Props are intentionally minimal and passed from the parent
 * (`LoginForm`) which owns the state via `useLoginForm`.
 * The component does **not** import any hooks that would cause
 * circular dependencies.
 */
import React, { type Ref } from "react";

interface PasswordResetFlowProps {
  /** Ref to the container div – used by the animation hook */
  viewRef: Ref<HTMLDivElement>;
  /** Email entered by the user */
  forgotEmail: string;
  /** Setter for the email */
  setForgotEmail: (value: string) => void;
  /** Loading state for the submit button */
  isLoading: boolean;
  /** Error message to display */
  error: string;
  /** Success message to display */
  success: string;
  /** Submit handler (calls the API) */
  onSubmit: (e: React.FormEvent) => void;
  /** Function to switch back to another view (login) */
  switchView: (target: 'login' | 'forgot' | 'first') => void;
}

export const PasswordResetFlow: React.FC<PasswordResetFlowProps> = ({
  viewRef,
  forgotEmail,
  setForgotEmail,
  isLoading,
  error,
  success,
  onSubmit,
  switchView,
}) => {
  return (
    <div id="forgotPasswordView" ref={viewRef} className="form-view">
      <a
        href="#!"
        className="back-link"
        onClick={(e) => {
          e.preventDefault();
          switchView('login');
        }}
      >
        &larr; Back to Login
      </a>
      <div className="login-header">
        <div className="login-title">Reset Password</div>
      </div>
      <form onSubmit={onSubmit}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="mb-3">
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
            Enter your email address and we will send you a link to reset your password.
          </p>
        </div>
        <div className="form-group">
          <label className="form-label">Email address</label>
          <input
            type="email"
            className="form-input"
            placeholder="Enter your email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            required
            disabled={isLoading}
            suppressHydrationWarning
          />
        </div>
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'SEND RESET LINK'}
        </button>
      </form>
    </div>
  );
};
