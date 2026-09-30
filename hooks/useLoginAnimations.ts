import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";

type LoginViewId = "login" | "forgot" | "first";

/**
 * GSAP refs and helpers for the login page: view transitions, post-login success sequence,
 * device classes on `body`, and visibility-based timeline sync.
 * Emits no React state; parents combine this with {@link useLoginForm} for state.
 */
export const useLoginAnimations = () => {
  const loginCardRef = useRef<HTMLDivElement>(null);
  const loginViewRef = useRef<HTMLDivElement>(null);
  const forgotViewRef = useRef<HTMLDivElement>(null);
  const firstLoginViewRef = useRef<HTMLDivElement>(null);
  const animationElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (loginCardRef.current && !animationElementRef.current) {
      const animationElement = document.createElement("div");
      animationElement.className = "login-card-animation";
      loginCardRef.current.insertBefore(animationElement, loginCardRef.current.firstChild);
      animationElementRef.current = animationElement;
    }
    return () => {
      if (animationElementRef.current && animationElementRef.current.parentNode) {
        animationElementRef.current.parentNode.removeChild(animationElementRef.current);
        animationElementRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (loginViewRef.current && forgotViewRef.current && firstLoginViewRef.current) {
      gsap.set(loginViewRef.current, { autoAlpha: 1, position: "relative", display: "block" });
      gsap.set([forgotViewRef.current, firstLoginViewRef.current], {
        autoAlpha: 0,
        position: "absolute",
        display: "none",
        top: 0,
        left: 0,
        width: "100%",
      });
    }
  }, []);

  useEffect(() => {
    function detectDevice() {
      const userAgent =
        navigator.userAgent || navigator.vendor || ((window as Window & { opera?: string }).opera ?? "");
      const availW = window.screen.availWidth > 0 ? window.screen.availWidth : window.innerWidth;
      const availH = window.screen.availHeight > 0 ? window.screen.availHeight : window.innerHeight;

      const widthPct = (window.innerWidth / availW) * 100;
      const heightPct = (window.innerHeight / availH) * 100;

      const mobileWMaxPct = Math.min(100, (768 / availW) * 100);
      const mobileHMaxPct = Math.min(100, (1024 / availH) * 100);
      const tabletWLoPct = (768 / availW) * 100;
      const tabletWHiPct = (1024 / availW) * 100;

      const isMobile =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent.toLowerCase()
        ) || (widthPct <= mobileWMaxPct && heightPct <= mobileHMaxPct);

      const isTablet =
        /ipad|android(?!.*mobile)|tablet/i.test(userAgent.toLowerCase()) ||
        (widthPct > tabletWLoPct && widthPct <= tabletWHiPct);

      document.body.classList.remove("mobile-device", "tablet-device", "desktop-device");

      if (isMobile) {
        document.body.classList.add("mobile-device");
      } else if (isTablet) {
        document.body.classList.add("tablet-device");
      } else {
        document.body.classList.add("desktop-device");
      }
    }

    detectDevice();

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let orientationTimer: ReturnType<typeof setTimeout> | null = null;

    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        detectDevice();
      }, 250);
    };

    const onOrientationChange = () => {
      if (orientationTimer) clearTimeout(orientationTimer);
      orientationTimer = setTimeout(() => detectDevice(), 100);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientationChange);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientationChange);
      if (resizeTimer) clearTimeout(resizeTimer);
      if (orientationTimer) clearTimeout(orientationTimer);
    };
  }, []);

  const resetAfterLoginError = useCallback(() => {
    if (loginCardRef.current) {
      gsap.set(loginCardRef.current, { scale: 1, filter: "blur(0px)", autoAlpha: 1 });
    }
  }, []);

  const animateSwitchView = useCallback((activeView: LoginViewId, targetViewName: LoginViewId) => {
    let viewToHide: HTMLDivElement | null = null;
    let viewToShow: HTMLDivElement | null = null;

    if (activeView === "login") viewToHide = loginViewRef.current;
    else if (activeView === "forgot") viewToHide = forgotViewRef.current;
    else if (activeView === "first") viewToHide = firstLoginViewRef.current;

    if (targetViewName === "login") viewToShow = loginViewRef.current;
    else if (targetViewName === "forgot") viewToShow = forgotViewRef.current;
    else if (targetViewName === "first") viewToShow = firstLoginViewRef.current;

    if (!viewToHide || !viewToShow) return;

    const tl = gsap.timeline();

    tl.to(viewToHide, {
      duration: 0.4,
      y: -20,
      filter: "blur(5px)",
      autoAlpha: 0,
      ease: "power2.in",
      onComplete: () => {
        gsap.set(viewToHide, { position: "absolute", display: "none" });
        gsap.set(viewToShow, { position: "relative", display: "block" });
      },
    });

    tl.fromTo(
      viewToShow,
      { y: 20, filter: "blur(5px)", autoAlpha: 0 },
      {
        duration: 0.4,
        y: 0,
        filter: "blur(0px)",
        autoAlpha: 1,
        ease: "power2.out",
      },
      "-=0.2"
    );
  }, []);

  return {
    loginCardRef,
    loginViewRef,
    forgotViewRef,
    firstLoginViewRef,
    animationElementRef,
    animateSwitchView,
    resetAfterLoginError,
  };
};

export default useLoginAnimations;
