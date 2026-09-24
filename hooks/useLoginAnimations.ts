import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useRouter } from "next/navigation";

type LoginViewId = "login" | "forgot" | "first";

/**
 * GSAP refs and helpers for the login page: view transitions, post-login success sequence,
 * device classes on `body`, and visibility-based timeline sync.
 * Emits no React state; parents combine this with {@link useLoginForm} for state.
 */
export const useLoginAnimations = () => {
  const router = useRouter();

  const loginCardRef = useRef<HTMLDivElement>(null);
  const loginViewRef = useRef<HTMLDivElement>(null);
  const forgotViewRef = useRef<HTMLDivElement>(null);
  const firstLoginViewRef = useRef<HTMLDivElement>(null);
  const loadingOverlayRef = useRef<HTMLDivElement>(null);
  const loadingSpinnerRef = useRef<HTMLDivElement>(null);
  const welcomeMessageRef = useRef<HTMLDivElement>(null);
  const welcomeTextRef = useRef<HTMLDivElement>(null);
  const animationElementRef = useRef<HTMLDivElement | null>(null);
  const animationTimelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(null);
  const animationStartTimeRef = useRef<number | null>(null);
  const animationDurationRef = useRef<number>(0);
  const customTickerRef = useRef<(() => void) | null>(null);
  const redirectIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && animationTimelineRef.current && animationStartTimeRef.current) {
        const elapsedTime = Date.now() - animationStartTimeRef.current;
        const elapsedSeconds = elapsedTime / 1000;

        if (elapsedSeconds < animationDurationRef.current) {
          const progress = elapsedSeconds / animationDurationRef.current;
          if (animationTimelineRef.current) {
            animationTimelineRef.current.progress(Math.min(progress, 1));
          }
        } else {
          if (animationTimelineRef.current) {
            animationTimelineRef.current.progress(1);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (redirectIntervalRef.current) {
        clearInterval(redirectIntervalRef.current);
        redirectIntervalRef.current = null;
      }
      if (customTickerRef.current) {
        gsap.ticker.remove(customTickerRef.current);
        customTickerRef.current = null;
      }
      if (animationTimelineRef.current) {
        animationTimelineRef.current.kill();
        animationTimelineRef.current = null;
      }
      animationStartTimeRef.current = null;
    };
  }, []);

  const killInFlightLoginAnimation = useCallback(() => {
    if (redirectIntervalRef.current) {
      clearInterval(redirectIntervalRef.current);
      redirectIntervalRef.current = null;
    }
    if (customTickerRef.current) {
      gsap.ticker.remove(customTickerRef.current);
      customTickerRef.current = null;
    }
    if (animationTimelineRef.current) {
      animationTimelineRef.current.kill();
      animationTimelineRef.current = null;
    }
    animationStartTimeRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("login-attempt-start", killInFlightLoginAnimation);
    return () => {
      window.removeEventListener("login-attempt-start", killInFlightLoginAnimation);
    };
  }, [killInFlightLoginAnimation]);

  const resetAfterLoginError = useCallback(() => {
    if (redirectIntervalRef.current) {
      clearInterval(redirectIntervalRef.current);
      redirectIntervalRef.current = null;
    }
    if (customTickerRef.current) {
      gsap.ticker.remove(customTickerRef.current);
      customTickerRef.current = null;
    }
    animationTimelineRef.current = null;
    animationStartTimeRef.current = null;
    if (loadingOverlayRef.current) {
      loadingOverlayRef.current.classList.remove("show-white");
      gsap.set(loadingOverlayRef.current, { autoAlpha: 0, visibility: "hidden" });
    }
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

  useEffect(() => {
    const onLoginSuccess = (e: Event) => {
      const detail = (e as CustomEvent<{ callbackUrl: string }>).detail;
      const callbackUrl = detail?.callbackUrl ?? "/home";

      const tl = gsap.timeline();
      animationDurationRef.current = 4.5;
      animationTimelineRef.current = tl;
      animationStartTimeRef.current = Date.now();

      const customTicker = () => {
        if (animationTimelineRef.current && animationStartTimeRef.current) {
          const elapsed = Date.now() - animationStartTimeRef.current;
          const elapsedSeconds = elapsed / 1000;
          if (
            elapsedSeconds < animationDurationRef.current &&
            animationTimelineRef.current.isActive()
          ) {
            const progress = elapsedSeconds / animationDurationRef.current;
            if (progress <= 1) {
              animationTimelineRef.current.progress(progress);
            }
          } else if (elapsedSeconds >= animationDurationRef.current) {
            if (animationTimelineRef.current.isActive()) {
              animationTimelineRef.current.progress(1);
            }
            if (customTickerRef.current) {
              gsap.ticker.remove(customTickerRef.current);
              customTickerRef.current = null;
            }
          }
        }
      };

      customTickerRef.current = customTicker;
      gsap.ticker.add(customTicker);

      if (loginCardRef.current) {
        tl.to(loginCardRef.current, {
          duration: 0.5,
          scale: 0.9,
          filter: "blur(10px)",
          autoAlpha: 0,
          ease: "power2.in",
        });
      }

      if (loadingOverlayRef.current) {
        loadingOverlayRef.current.classList.add("show-white");
        tl.set(loadingOverlayRef.current, {
          autoAlpha: 1,
          visibility: "visible",
          clipPath: "circle(150% at 50% 50%)",
        });
      }

      if (loadingSpinnerRef.current) {
        tl.fromTo(
          loadingSpinnerRef.current,
          { scale: 0.5, autoAlpha: 0 },
          { duration: 0.5, scale: 1, autoAlpha: 1, ease: "back.out(1.7)" }
        );
      }

      tl.to({}, { duration: 2.0 });

      if (loadingSpinnerRef.current) {
        tl.to(loadingSpinnerRef.current, {
          duration: 0.2,
          autoAlpha: 0,
          ease: "power2.in",
        });
      }

      if (welcomeTextRef.current && welcomeMessageRef.current) {
        welcomeTextRef.current.textContent = "Welcome";
        tl.set(welcomeMessageRef.current, { autoAlpha: 1 });
      }

      if (welcomeTextRef.current) {
        gsap.set(welcomeTextRef.current, {
          opacity: 0,
          y: 20,
        });
        tl.to(welcomeTextRef.current, {
          duration: 0.3,
          opacity: 1,
          y: 0,
          ease: "power2.out",
        });
      }

      tl.to({}, { duration: 0.8 });

      if (welcomeTextRef.current) {
        tl.to(welcomeTextRef.current, {
          duration: 0.2,
          opacity: 0,
          y: -10,
          ease: "power2.in",
        });
      }

      const performRedirect = () => {
        if (customTickerRef.current) {
          gsap.ticker.remove(customTickerRef.current);
          customTickerRef.current = null;
        }

        if (animationTimelineRef.current) {
          animationTimelineRef.current.kill();
          animationTimelineRef.current = null;
        }

        animationStartTimeRef.current = null;

        if (welcomeMessageRef.current) {
          welcomeMessageRef.current.style.display = "none";
          welcomeMessageRef.current.remove();
        }

        router.push(callbackUrl);

        setTimeout(() => {
          if (loadingOverlayRef.current) {
            gsap.to(loadingOverlayRef.current, {
              duration: 0.3,
              autoAlpha: 0,
              ease: "power2.out",
              onComplete: () => {
                if (loadingOverlayRef.current) {
                  loadingOverlayRef.current.classList.remove("show-white");
                  loadingOverlayRef.current.style.display = "none";
                  loadingOverlayRef.current.remove();
                }
              },
            });
          }
        }, 200);
      };

      redirectIntervalRef.current = setInterval(() => {
        if (animationStartTimeRef.current) {
          const elapsed = Date.now() - animationStartTimeRef.current;
          const elapsedSeconds = elapsed / 1000;

          if (elapsedSeconds >= 4.5) {
            if (redirectIntervalRef.current) {
              clearInterval(redirectIntervalRef.current);
              redirectIntervalRef.current = null;
            }
            performRedirect();
          }
        }
      }, 100);
    };

    window.addEventListener("login-success", onLoginSuccess as EventListener);
    return () => {
      window.removeEventListener("login-success", onLoginSuccess as EventListener);
      if (redirectIntervalRef.current) {
        clearInterval(redirectIntervalRef.current);
        redirectIntervalRef.current = null;
      }
      if (customTickerRef.current) {
        gsap.ticker.remove(customTickerRef.current);
        customTickerRef.current = null;
      }
      if (animationTimelineRef.current) {
        animationTimelineRef.current.kill();
        animationTimelineRef.current = null;
      }
    };
  }, [router]);

  return {
    loginCardRef,
    loginViewRef,
    forgotViewRef,
    firstLoginViewRef,
    loadingOverlayRef,
    loadingSpinnerRef,
    welcomeMessageRef,
    welcomeTextRef,
    animationElementRef,
    animateSwitchView,
    resetAfterLoginError,
  };
};

export default useLoginAnimations;
