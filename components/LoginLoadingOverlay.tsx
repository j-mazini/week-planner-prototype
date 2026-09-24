import React, { type Ref } from "react";

/**
 * Full-screen loading layer shown after successful authentication: spinner, then “Welcome” text.
 * GSAP animates these nodes via refs supplied by {@link useLoginAnimations}.
 */
export interface LoginLoadingOverlayProps {
  loadingOverlayRef: Ref<HTMLDivElement>;
  loadingSpinnerRef: Ref<HTMLDivElement>;
  welcomeMessageRef: Ref<HTMLDivElement>;
  welcomeTextRef: Ref<HTMLDivElement>;
}

export function LoginLoadingOverlay({
  loadingOverlayRef,
  loadingSpinnerRef,
  welcomeMessageRef,
  welcomeTextRef,
}: LoginLoadingOverlayProps) {
  return (
    <div id="loadingOverlay" ref={loadingOverlayRef} className="loading-overlay">
      <div className="loading-spinner" ref={loadingSpinnerRef}>
        <div className="modern-spinner">
          <div className="spinner-orbit orbit-1">
            <div className="spinner-dot dot-1"></div>
          </div>
          <div className="spinner-orbit orbit-2">
            <div className="spinner-dot dot-2"></div>
          </div>
          <div className="spinner-orbit orbit-3">
            <div className="spinner-dot dot-3"></div>
          </div>
          <div className="spinner-orbit orbit-4">
            <div className="spinner-dot dot-4"></div>
          </div>
          <div className="spinner-center"></div>
        </div>
      </div>

      <div className="welcome-message" ref={welcomeMessageRef}>
        <div className="welcome-text" ref={welcomeTextRef}>
          Welcome
        </div>
      </div>
    </div>
  );
}
