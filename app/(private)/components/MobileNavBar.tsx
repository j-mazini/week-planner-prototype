"use client";

import {
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNavigationPending } from "./NavigationPendingContext";
import { BUSINESS_RULES } from "@/src/constants/businessRules";

type Ripple = { id: string; x: number };
type MobileNavPage = {
  href: string;
  label: string;
  icon: string;
  allowedUserTypes: number[];
};

export function MobileNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { setNavigationPending } = useNavigationPending();
  const navRef = useRef<HTMLElement | null>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // Pointer-follow glow (motion values => no rerender on move)
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const glowOpacity = useMotionValue(0);
  const pointerXSpring = useSpring(pointerX, { stiffness: 420, damping: 42, mass: 0.55 });
  const pointerYSpring = useSpring(pointerY, { stiffness: 420, damping: 42, mass: 0.55 });
  const glowXSpring = useSpring(glowX, { stiffness: 380, damping: 38, mass: 0.6 });
  const glowYSpring = useSpring(glowY, { stiffness: 380, damping: 38, mass: 0.6 });
  const glowOpacitySpring = useSpring(glowOpacity, {
    stiffness: 260,
    damping: 30,
    mass: 0.5,
  });

  const { user } = useAuth();
  
  const allPages = useMemo<MobileNavPage[]>(
    () => [
      {
        href: "/daily-performance-insight",
        label: "My Performance",
        icon: "bi-bar-chart-line",
        allowedUserTypes: [BUSINESS_RULES.USER_TYPE.ADMIN, BUSINESS_RULES.USER_TYPE.DRIVER, BUSINESS_RULES.USER_TYPE.SUPERVISOR],
      }, // Admin, Supervisor, vendor — merges Today (/daily-performance-insight) and Month (/current-performance), switch via PerformanceTabs on the page itself
      {
        href: "/subcontractor",
        label: "Profile",
        icon: "bi-person",
        allowedUserTypes: [BUSINESS_RULES.USER_TYPE.ADMIN, BUSINESS_RULES.USER_TYPE.DRIVER, BUSINESS_RULES.USER_TYPE.SUPERVISOR],
      }, // Admin, Supervisor, vendor
      {
        href: "/deductions",
        label: "Deductions",
        icon: "bi-graph-down-arrow",
        allowedUserTypes: [BUSINESS_RULES.USER_TYPE.ADMIN, BUSINESS_RULES.USER_TYPE.DRIVER, BUSINESS_RULES.USER_TYPE.SUPERVISOR],
      }, // Admin, Supervisor, vendor
      {
        href: "/current-month",
        label: "Mês",
        icon: "bi-calendar-event",
        allowedUserTypes: [BUSINESS_RULES.USER_TYPE.ADMIN, BUSINESS_RULES.USER_TYPE.DRIVER, BUSINESS_RULES.USER_TYPE.SUPERVISOR],
      }, // Admin, Supervisor, vendor
      {
        href: "/mobile-invoice",
        label: "Invoice",
        icon: "bi-file-earmark-text",
        allowedUserTypes: [BUSINESS_RULES.USER_TYPE.ADMIN, BUSINESS_RULES.USER_TYPE.DRIVER, BUSINESS_RULES.USER_TYPE.SUPERVISOR],
      }, // Admin, Supervisor, vendor
      {
        href: "/requests",
        label: "Pedidos",
        icon: "bi-inbox",
        allowedUserTypes: [BUSINESS_RULES.USER_TYPE.ADMIN, BUSINESS_RULES.USER_TYPE.DRIVER, BUSINESS_RULES.USER_TYPE.SUPERVISOR],
      }, // Admin, Supervisor, vendor
    ],
    []
  );

  // Filter pages based on user type
  const pages = allPages.filter((page) => {
    if (!user || user.userTypeId === null) return false; // Don't show anything until we know the user type
    return page.allowedUserTypes.includes(user.userTypeId as number);
  });

  // My Performance dock item covers both the daily and monthly performance pages
  const PERFORMANCE_GROUP_HREFS = ["/daily-performance-insight", "/current-performance"];

  // Determines active page - exact comparison or starts with href
  const isActive = (href: string) => {
    if (href === "/daily-performance-insight" && PERFORMANCE_GROUP_HREFS.includes(pathname ?? "")) {
      return true;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Handler: show loading skeleton immediately (same as desktop sidebar), then navigate
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (pathname === href || pathname?.startsWith(href + "/")) return;
    setNavigationPending(href);
    router.push(href);
  };

  const spawnRipple = useCallback((x: number) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const ripple: Ripple = { id, x };
    setRipples((prev) => [...prev, ripple].slice(-6));
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (reduceMotion) return;
      const el = navRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      // Position relative to dock container
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      pointerX.set(x);
      pointerY.set(y);
      glowX.set(x - 90); // center glow (size 180)
      glowY.set(y - 90);
      glowOpacity.set(1);
    },
    [glowOpacity, glowX, glowY, pointerX, pointerY, reduceMotion]
  );

  const handlePointerLeave = useCallback(() => {
    if (reduceMotion) return;
    glowOpacity.set(0);
  }, [glowOpacity, reduceMotion]);

  // Liquid glass layers (specular + chroma tint) driven by pointer springs
  const liquidSpecular = useMotionTemplate`radial-gradient(180px circle at ${pointerXSpring}px ${pointerYSpring}px, rgba(255,255,255,0.34), rgba(255,255,255,0.12) 26%, rgba(255,255,255,0) 62%)`;
  const liquidChroma = useMotionTemplate`radial-gradient(260px circle at ${pointerXSpring}px ${pointerYSpring}px, rgba(59,130,246,0.18), rgba(236,72,153,0.12) 35%, rgba(14,165,233,0.08) 55%, rgba(0,0,0,0) 72%)`;

  // Mobile screens where navbar is shown for Admin/Supervisor (at any window size)
  const mobileScreenPaths = useMemo(
    () => [
      "/daily-performance-insight",
      "/subcontractor",
      "/deductions",
      "/current-month",
      "/current-performance",
      "/mobile-invoice",
      "/requests",
    ],
    []
  );
  const isOnMobileScreen =
    pathname &&
    mobileScreenPaths.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );

  // Admin/Supervisor on mobile screens: show navbar at any window size; Vendor (2): always show
  const isAdminOrSupervisorOnMobileScreen =
    (user?.userTypeId === BUSINESS_RULES.USER_TYPE.ADMIN || user?.userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR) && isOnMobileScreen;

  // IMPORTANT: all hooks must run on every render (no conditional returns before this point)
  const showMobileNav =
    user?.userTypeId === BUSINESS_RULES.USER_TYPE.DRIVER || isAdminOrSupervisorOnMobileScreen;
  if (!showMobileNav) return null;

  // If no pages available for this user type, don't render
  if (pages.length === 0) return null;

  return (
    <motion.nav
      aria-label="Navigation"
      initial={reduceMotion ? false : { y: 18, opacity: 0 }}
      animate={reduceMotion ? undefined : { y: 0, opacity: 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
      }
      className={[
        // keep legacy class selector name to avoid any unexpected external CSS reliance
        "pages-nav",
        "fixed inset-x-0 bottom-0 z-50",
        // Vendor (2): hide navbar on desktop (md+). Admin/Supervisor on mobile pages: show at any window size
        isAdminOrSupervisorOnMobileScreen ? "" : "md:hidden",
        // give breathing room around a floating dock + safe area
        "pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]",
      ].join(" ")}
    >
      <div className="mx-auto w-full max-w-[560px] px-3">
        {/* Outer gradient border (liquid glass rim) */}
        <div className="rounded-2xl bg-gradient-to-br from-white/55 via-primary/25 to-white/10 p-[1px] shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
          <div
            ref={(node) => {
              navRef.current = node;
            }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={(e) => {
              // ripple originates at pointer X inside the dock
              const el = navRef.current;
              if (!el) return;
              const rect = el.getBoundingClientRect();
              spawnRipple(e.clientX - rect.left);
            }}
            className={[
              "relative overflow-hidden",
              "rounded-[1.15rem]",
              "bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55",
              "ring-1 ring-white/10",
            ].join(" ")}
          >
            {/* animated gradient hairline */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-60" />

            {/* liquid glass specular highlight */}
            {!reduceMotion && (
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: liquidSpecular,
                  opacity: glowOpacitySpring,
                  mixBlendMode: "overlay",
                }}
              />
            )}

            {/* chromatic tint */}
            {!reduceMotion && (
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: liquidChroma,
                  opacity: glowOpacitySpring,
                  mixBlendMode: "color-dodge",
                }}
              />
            )}

          {/* pointer-follow glow */}
          {!reduceMotion && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 h-[180px] w-[180px] rounded-full bg-primary/20 blur-2xl"
              style={{
                x: glowXSpring,
                y: glowYSpring,
                opacity: glowOpacitySpring,
              }}
            />
          )}

          {/* ripples */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {ripples.map((r) => (
              <motion.span
                key={r.id}
                className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary/25"
                style={{ left: r.x }}
                initial={{ opacity: 0.25, scale: 0 }}
                animate={{ opacity: 0, scale: 40 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }
                }
                onAnimationComplete={() => {
                  setRipples((prev) => prev.filter((x) => x.id !== r.id));
                }}
              />
            ))}
          </div>

          <div className="flex w-full items-stretch justify-between gap-1 p-1.5">
        {pages.map((page, index) => {
          const active = isActive(page.href);

          return (
            <button
              key={page.href}
              type="button"
              onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                handleClick(e as unknown as React.MouseEvent<HTMLAnchorElement, MouseEvent>, page.href)
              }
              aria-label={page.label}
              aria-current={active ? "page" : undefined}
              className={[
                "relative flex h-12 min-w-0 flex-1 select-none items-center justify-center",
                "rounded-xl px-2",
                "outline-none border-0 bg-transparent cursor-pointer",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active ? "text-foreground" : "text-muted-foreground",
              ].join(" ")}
            >
              {active && (
                <motion.span
                  layoutId="mobile-nav-active"
                  className={[
                    "absolute inset-0 rounded-xl",
                    // base tint + depth
                    "bg-gradient-to-b from-white/20 via-primary/10 to-primary/5",
                    // glass border + subtle glow
                    "ring-1 ring-white/25",
                    "shadow-[0_10px_26px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.30),inset_0_-1px_0_rgba(0,0,0,0.06)]",
                    // a touch of blur to feel liquid (works on modern browsers)
                    "backdrop-blur-[2px]",
                  ].join(" ")}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 520, damping: 36, mass: 0.55 }
                  }
                >
                  {/* shimmer line (liquid highlight) */}
                  {!reduceMotion && (
                    <motion.span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-xl"
                      style={{
                        background:
                          "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.30) 22%, rgba(255,255,255,0.06) 45%, transparent 70%)",
                        maskImage:
                          "radial-gradient(120px 60px at 50% 35%, black 0%, transparent 70%)",
                        WebkitMaskImage:
                          "radial-gradient(120px 60px at 50% 35%, black 0%, transparent 70%)",
                      }}
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 18 }}
                      transition={{
                        duration: 1.2,
                        ease: [0.22, 1, 0.36, 1],
                        repeat: Infinity,
                        repeatType: "mirror",
                      }}
                    />
                  )}
                </motion.span>
              )}

              {active && (
                <motion.span
                  layoutId="mobile-nav-dot"
                  className={[
                    "absolute bottom-1 left-1/2 z-20",
                    "h-1.5 w-1.5 -translate-x-1/2 rounded-full",
                    "bg-primary",
                    "shadow-[0_0_0_4px_rgba(255,255,255,0.12),0_6px_16px_rgba(59,130,246,0.35)]",
                  ].join(" ")}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 520, damping: 34, mass: 0.6 }
                  }
                />
              )}

              <motion.span
                className="relative z-10 flex flex-col items-center justify-center"
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: index * 0.03 }
                }
                whileTap={reduceMotion ? undefined : { scale: 0.94 }}
              >
                <motion.i
                  className={[
                    "bi",
                    page.icon,
                    "leading-none",
                    active ? "text-primary" : "text-muted-foreground",
                    "text-[22px]",
                  ].join(" ")}
                  aria-hidden="true"
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          y: active ? -1 : 0,
                          scale: active ? 1.1 : 1,
                        }
                  }
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 520, damping: 34, mass: 0.6 }
                  }
                />
                <span className="sr-only">{page.label}</span>
              </motion.span>
            </button>
          );
        })}
          </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
