"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./Login.css";
import "./login-redesign.css";
import { PasswordResetFlow } from "@/components/PasswordResetFlow";
import { RegisterFlow } from "@/components/RegisterFlow";
import { LoginMainView } from "@/components/LoginMainView";
import { DeliveryNetwork } from "@/components/DeliveryNetwork";
import { LoginHandoff } from "@/components/LoginHandoff";
import { useLoginForm } from "@/hooks/useLoginForm";
import { useLoginAnimations } from "@/hooks/useLoginAnimations";
import { MOCK_MODE } from "@/lib/mock-api";

type DemoProfile = "admin" | "supervisor" | "driver";

type LoginViewId = "login" | "forgot" | "first";

/**
 * Public login surface: particle background, GSAP-driven transitions between login / reset / first-login,
 * and the post-login success sequence. Composes presentational pieces; state lives in {@link useLoginForm}
 * and motion in {@link useLoginAnimations}.
 */
export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [demoProfile, setDemoProfile] = useState<DemoProfile>("admin");

  const {
    loginCardRef,
    loginViewRef,
    forgotViewRef,
    firstLoginViewRef,
    animateSwitchView,
    resetAfterLoginError,
  } = useLoginAnimations();

  const {
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
  } = useLoginForm({ passwordInputRef, onLoginFailed: resetAfterLoginError, demoProfile });

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (emailInputRef.current?.value && !email) {
          setEmail(emailInputRef.current.value);
        }
        if (passwordInputRef.current?.value && !password) {
          setPassword(passwordInputRef.current.value);
        }
      } catch {
        // ignora erros de leitura (ex.: em SSR)
      }
    }, 150);
    return () => clearTimeout(t);
  }, [email, password, setEmail, setPassword]);

  // Sincroniza a visibilidade (GSAP) sempre que a view ativa muda — seja por
  // clique do usuário ou por troca automática (ex.: após "set initial password"
  // ou "forgot password", que chamam switchView via setTimeout). Antes, essas
  // trocas automáticas só alteravam o estado React sem animar, deixando a view
  // anterior com display:block e sobreposta à nova (login + registro juntos).
  const prevViewRef = useRef<LoginViewId>("login");
  useEffect(() => {
    if (prevViewRef.current !== activeView) {
      animateSwitchView(prevViewRef.current, activeView);
      prevViewRef.current = activeView;
    }
  }, [activeView, animateSwitchView]);

  const handleSwitchView = (target: LoginViewId) => {
    switchView(target);
  };

  return (
    <div
      className={`modern-login-wrapper logix-login ${className || ""}`}
      {...props}
      suppressHydrationWarning
    >
      <LoginHandoff />

      <main className="login-layout">
        <section className="login-story" aria-label="LogixSphere operations platform">
          <DeliveryNetwork />
          <div className="login-wordmark"><span>LOGIX</span><i aria-hidden="true">/</i><span>SPHERE</span></div>
          <div className="login-story-copy">
            <p className="login-kicker">OPERATIONS, IN VIEW</p>
            <h1>Keep every<br />route moving.</h1>
            <p className="login-story-description">A clear view of people, plans and performance across your network.</p>
          </div>
          <p className="login-story-foot">LOGIXSPHERE <span>·</span> ONE OPERATIONS VIEW</p>
        </section>

        <div className="login-container">
          <div className="login-card" ref={loginCardRef}>
            <LoginMainView
              loginViewRef={loginViewRef}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              passwordInputRef={passwordInputRef}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              isLoading={isLoading}
              error={error}
              success={success}
              onSubmit={handleLoginSubmit}
              onSwitchView={handleSwitchView}
              showDemoProfile={MOCK_MODE}
              demoProfile={demoProfile}
              onDemoProfileChange={setDemoProfile}
              onOpenNewLogin={() => router.push("/admin-login")}
            />

            <PasswordResetFlow
              viewRef={forgotViewRef}
              forgotEmail={forgotEmail}
              setForgotEmail={setForgotEmail}
              isLoading={isLoading}
              error={error}
              success={success}
              onSubmit={handleForgotPassword}
              switchView={handleSwitchView}
            />

            <RegisterFlow
              viewRef={firstLoginViewRef}
              firstLoginData={firstLoginData}
              setFirstLoginData={setFirstLoginData}
              isLoading={isLoading}
              error={error}
              success={success}
              onSubmit={handleFirstLogin}
              switchView={handleSwitchView}
            />
            <p className="login-security-note"><span aria-hidden="true">◆</span> Your account is protected by secure sign-in.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
