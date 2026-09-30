import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useRouter } from "next/navigation";

/** Beats of the handoff, in seconds. They sum to the whole sequence. */
const COVER = 0.35;
const ROUTES = 0.7;
const CONVERGE = 0.8;
const OPEN = 0.35;
export const HANDOFF_SECONDS = COVER + ROUTES + CONVERGE + OPEN;

const prefersReducedMotion = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Owns the post-login handoff: waits for the `login-success` event the login form emits,
 * plays the takeover, and opens the workspace once it has finished. The drawing lives in
 * {@link import("@/components/LoginHandoff").LoginHandoff}; this hook only decides when
 * things happen and where to go next.
 *
 * @returns The root ref the overlay attaches to, and whether the handoff is playing.
 */
export const useLoginHandoff = () => {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const playingRef = useRef(false);

  const build = useCallback((onDone: () => void) => {
    const root = rootRef.current;
    const tl = gsap.timeline({ onComplete: onDone });

    if (!root) {
      // No overlay mounted (or not yet): the handoff still takes its time, so the
      // navigation lands when the caller expects it to.
      tl.to({}, { duration: HANDOFF_SECONDS });
      return tl;
    }

    const q = gsap.utils.selector(root);

    tl.fromTo(q("[data-handoff='iris']"), { scale: 0 }, { scale: 1, duration: COVER, ease: "power3.out" });

    // Each route grows from its first depot to its second. Done by moving the segment's
    // end point rather than by dashing it: the SVG is stretched non-uniformly, so a dash
    // pattern measured in viewBox units renders at the wrong scale on screen.
    q("[data-handoff='route']").forEach((line, i) => {
      const at = (name: string) => Number(line.getAttribute(name) ?? 0);
      const from = { x2: at("x1"), y2: at("y1") };
      const to = { x2: at("x2"), y2: at("y2") };
      tl.fromTo(line, { attr: from }, { attr: to, duration: ROUTES, ease: "power2.out" }, COVER + i * 0.04);
    });

    tl.fromTo(q("[data-handoff='depot']"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)", stagger: 0.05 }, COVER + 0.1)
      .fromTo(q("[data-handoff='parcel']"), { opacity: 0 }, { opacity: 1, duration: 0.2 }, COVER + ROUTES - 0.2)
      .to(q("[data-handoff='parcel']"), { left: "50%", top: "50%", duration: CONVERGE, ease: "power2.inOut", stagger: 0.06 }, COVER + ROUTES)
      .to(q("[data-handoff='core']"), { scale: 1.8, duration: CONVERGE, ease: "power1.in" }, COVER + ROUTES)
      .to(q("[data-handoff='route'], [data-handoff='depot'], [data-handoff='parcel']"), { opacity: 0, duration: 0.2 }, COVER + ROUTES + CONVERGE - 0.1)
      // The point opens in the workspace's own colour, so it reads as the app arriving.
      .to(q("[data-handoff='core']"), { scale: 130, backgroundColor: "#fafaef", duration: OPEN, ease: "power2.in" }, COVER + ROUTES + CONVERGE);

    return tl;
  }, []);

  useEffect(() => {
    const onSuccess = (event: Event) => {
      if (playingRef.current) return;
      playingRef.current = true;

      const detail = (event as CustomEvent<{ callbackUrl?: string }>).detail;
      const callbackUrl = detail?.callbackUrl ?? "/home";
      const go = () => router.push(callbackUrl);

      if (prefersReducedMotion()) {
        setActive(true);
        go();
        return;
      }

      setActive(true);
      // A frame so the overlay is in the DOM before the timeline queries it.
      requestAnimationFrame(() => build(go).play());
    };

    window.addEventListener("login-success", onSuccess as EventListener);
    return () => window.removeEventListener("login-success", onSuccess as EventListener);
  }, [build, router]);

  return { rootRef, active };
};
