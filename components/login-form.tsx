"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "./Login.css";
import { PasswordResetFlow } from "@/components/PasswordResetFlow";
import { RegisterFlow } from "@/components/RegisterFlow";
import { LoginMainView } from "@/components/LoginMainView";
import { LoginLoadingOverlay } from "@/components/LoginLoadingOverlay";
import { useLoginForm } from "@/hooks/useLoginForm";
import { useLoginAnimations } from "@/hooks/useLoginAnimations";

// Carregamento diferido: o fundo de partículas (tsparticles) é puramente visual e
// pesado. Importá-lo dinamicamente o remove do JS inicial da tela de login sem
// alterar o comportamento — apenas é montado no cliente após o paint inicial.
const ParticleBackground = dynamic(
  () =>
    import("@/components/ParticleBackground").then((m) => m.ParticleBackground),
  { ssr: false }
);

type LoginViewId = "login" | "forgot" | "first";

/**
 * Public login surface: particle background, GSAP-driven transitions between login / reset / first-login,
 * and the post-login success sequence. Composes presentational pieces; state lives in {@link useLoginForm}
 * and motion in {@link useLoginAnimations}.
 */
export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const {
    loginCardRef,
    loginViewRef,
    forgotViewRef,
    firstLoginViewRef,
    loadingOverlayRef,
    loadingSpinnerRef,
    welcomeMessageRef,
    welcomeTextRef,
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
  } = useLoginForm({ passwordInputRef, onLoginFailed: resetAfterLoginError });

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
  }, []);

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
      className={`modern-login-wrapper ${className || ""}`}
      {...props}
      suppressHydrationWarning
    >
      <ParticleBackground />

      <LoginLoadingOverlay
        loadingOverlayRef={loadingOverlayRef}
        loadingSpinnerRef={loadingSpinnerRef}
        welcomeMessageRef={welcomeMessageRef}
        welcomeTextRef={welcomeTextRef}
      />

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
        </div>
      </div>
    </div>
  );
}
