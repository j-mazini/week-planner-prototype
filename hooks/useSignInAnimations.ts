import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";

/** `useLayoutEffect` warns during SSR; Next renders client components on the server too. */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Read at call time, not at module load — the operator can flip the OS setting mid-session. */
const prefersReducedMotion = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Motion for the dark sign-in page. The rail is the timeline: a lime head rides down the
 * form's left gutter and each field lands as it passes that field's node. Submitting plays
 * the reverse — the column clears, a panel wipes up and the workspace opens.
 *
 * @returns A ref for the page root and the exit sequence, which resolves when it is safe to navigate.
 */
export const useSignInAnimations = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) {
      gsap.set(root.querySelectorAll("[data-enter]"), { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const draw = root.querySelector<HTMLElement>("[data-draw]");
      const drawHeight = () => draw?.offsetHeight ?? 0;
      const slideIn = (at: number, target: string) =>
        tl.fromTo(target, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.4 }, at);

      // `fromTo`, not `from`: the start state is already painted by the stylesheet,
      // so the timeline must restate it rather than sample whatever is on screen.
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.fromTo("[data-enter='wordmark']", { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.45 }, 0)
        .fromTo("[data-enter='card']", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.2)
        .to("[data-draw-head]", { opacity: 1, duration: 0.15 }, 0.45)
        .to("[data-draw-line]", { scaleY: 1, duration: 0.75, ease: "power1.inOut" }, 0.45)
        .to("[data-draw-head]", { y: drawHeight, duration: 0.75, ease: "power1.inOut" }, 0.45);

      slideIn(0.68, "[data-enter='field-email']");
      slideIn(0.92, "[data-enter='field-password']");
      slideIn(1.14, "[data-enter='action']");

      tl.fromTo("[data-enter='footer']", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.2)
        .to("[data-draw]", { autoAlpha: 0, duration: 0.35 }, 1.32);
    }, root);

    return () => ctx.revert();
  }, []);

  /** Plays the exit sequence; resolves once the overlay has settled and navigation can happen. */
  const playExit = useCallback(
    () =>
      new Promise<void>((resolve) => {
        const root = rootRef.current;
        if (!root || prefersReducedMotion()) {
          resolve();
          return;
        }

        gsap
          .timeline({ onComplete: () => resolve() })
          .to(root.querySelector("[data-exit-column]"), {
            opacity: 0,
            y: -12,
            duration: 0.4,
            ease: "power2.in",
          })
          .set(root.querySelector("[data-exit-overlay]"), { visibility: "visible" })
          .to(root.querySelector("[data-exit-overlay]"), {
            scaleY: 1,
            duration: 0.45,
            ease: "power3.inOut",
          })
          .to(root.querySelector("[data-exit-sweep]"), {
            scaleX: 1,
            duration: 0.4,
            ease: "power2.out",
          }, "-=0.12")
          .to(root.querySelector("[data-exit-text]"), {
            opacity: 1,
            duration: 0.3,
          }, "-=0.18")
          .to({}, { duration: 0.35 });
      }),
    []
  );

  return { rootRef, playExit };
};
