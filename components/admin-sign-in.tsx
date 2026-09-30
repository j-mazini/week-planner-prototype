"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignInAnimations } from "@/hooks/useSignInAnimations";
import "./admin-sign-in.css";

/**
 * Dark sign-in surface, reached from the demo profile menu on the standard login.
 * Presentation only: it holds no session, calls no API and reads no token — submitting
 * plays the exit sequence and opens the workspace.
 */
export function AdminSignIn() {
  const router = useRouter();
  const { rootRef, playExit } = useSignInAnimations();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [revealPassword, setRevealPassword] = useState(false);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    await playExit();
    router.push("/home");
  };

  return (
    <div className="logix-signin" ref={rootRef}>
      <div className="signin-column" data-exit-column>
        <div className="signin-wordmark" data-enter="wordmark">
          <span>LOGIX</span>
          <i aria-hidden="true">/</i>
          <span>SPHERE</span>
        </div>

        <div className="signin-card" data-enter="card">
          <h1>Sign in to LogixSphere</h1>
          <p className="signin-note">Use your work email address.</p>

          <form className="signin-form" onSubmit={handleSubmit} noValidate={false}>
            <span className="signin-draw" data-draw aria-hidden="true">
              <span className="signin-draw__line" data-draw-line />
              <span className="signin-draw__head" data-draw-head />
            </span>

            <span
              className="signin-rail"
              aria-hidden="true"
              data-reached={email.trim() !== ""}
              data-active={focused === "email"}
            >
              <span className="signin-rail__fill" />
              <span className="signin-rail__node" />
            </span>
            <div className="signin-field" data-enter="field-email">
              <label htmlFor="signin-email">Email</label>
              <div className="signin-input-shell">
                <input
                  id="signin-email"
                  type="text"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoComplete="username"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  required
                />
              </div>
            </div>

            <span
              className="signin-rail"
              aria-hidden="true"
              data-reached={password !== ""}
              data-active={focused === "password"}
            >
              <span className="signin-rail__fill" />
              <span className="signin-rail__node" />
            </span>
            <div className="signin-field" data-enter="field-password">
              <label htmlFor="signin-password">Password</label>
              <div className="signin-input-shell">
                <input
                  id="signin-password"
                  type={revealPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  required
                />
                <button
                  type="button"
                  className="signin-reveal"
                  aria-label={revealPassword ? "Hide password" : "Show password"}
                  onClick={() => setRevealPassword((shown) => !shown)}
                >
                  {revealPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <span
              className="signin-rail signin-rail--action"
              aria-hidden="true"
              data-reached={submitting}
              data-active={false}
            >
              <span className="signin-rail__fill" />
              <span className="signin-rail__node" />
            </span>
            <div className="signin-action" data-enter="action">
              <button type="submit" className="signin-go" disabled={submitting}>
                {submitting ? "Opening" : "Sign in"}
              </button>
            </div>
          </form>

          <div className="signin-footer" data-enter="footer">
            <a href="/send-password-reset-token">Reset your password</a>
            <a href="/login">Back to the standard sign-in</a>
          </div>
        </div>
      </div>

      <div className="signin-exit" data-exit-overlay>
        <span className="signin-exit__sweep" data-exit-sweep aria-hidden="true" />
        <p className="signin-exit__text" data-exit-text>Opening your workspace</p>
      </div>
    </div>
  );
}
