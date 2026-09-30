"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { DEPOTS, LINKS, depot, neighbours, nextHop, type Depot } from "@/lib/delivery-network";
import "./delivery-network.css";

/** Three run continuously; the rest are held back for deliveries the operator dispatches. */
const CONTINUOUS = 3;
const POOL = 5;
const LEG_SECONDS = 1.1;
const HOLD_SECONDS = 0.35;
/** How close the pointer must come, in px, before a route lights up. */
const NEAR = 140;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The live delivery map behind the login panel: depots joined by routes, with deliveries
 * that drive a leg, land, and carry on. Hovering a depot names it, clicking one sends a
 * delivery out from it, and routes near the pointer brighten.
 */
export function DeliveryNetwork() {
  const rootRef = useRef<HTMLDivElement>(null);
  const flightRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const haloRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  /** Which pooled deliveries are mid-run, so a click never hijacks one already out. */
  const busy = useRef<boolean[]>(Array(POOL).fill(false));
  const stopped = useRef(false);

  const [hovered, setHovered] = useState<Depot | null>(null);

  const pulse = useCallback((id: string) => {
    const halo = haloRefs.current[id];
    if (!halo) return;
    gsap.fromTo(
      halo,
      { opacity: 0.9, scale: 1 },
      { opacity: 0, scale: 4.5, duration: 0.7, ease: "power2.out" }
    );
  }, []);

  /** Drives one delivery from depot to depot. `legs` of null means "keep going forever". */
  const run = useCallback(
    (index: number, from: string, cameFrom: string | undefined, legs: number | null) => {
      const el = flightRefs.current[index];
      if (!el || stopped.current) return;

      if (legs !== null && legs <= 0) {
        gsap.to(el, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            busy.current[index] = false;
          },
        });
        return;
      }

      const to = nextHop(from, cameFrom);
      const target = depot(to);

      gsap.to(el, {
        left: `${target.x}%`,
        top: `${target.y}%`,
        duration: LEG_SECONDS,
        ease: "power1.inOut",
        onComplete: () => {
          if (stopped.current) return;
          pulse(to);
          gsap.delayedCall(HOLD_SECONDS, () =>
            run(index, to, from, legs === null ? null : legs - 1)
          );
        },
      });
    },
    [pulse]
  );

  // Continuous deliveries.
  useEffect(() => {
    stopped.current = false;
    if (prefersReducedMotion()) return;

    const flights = flightRefs.current;
    const starts = ["north", "east", "kilnbrook"];
    starts.slice(0, CONTINUOUS).forEach((start, i) => {
      const el = flightRefs.current[i];
      if (!el) return;
      const origin = depot(start);
      busy.current[i] = true;
      gsap.set(el, { left: `${origin.x}%`, top: `${origin.y}%`, opacity: 1 });
      gsap.delayedCall(i * 0.6, () => run(i, start, undefined, null));
    });

    return () => {
      stopped.current = true;
      gsap.killTweensOf(flights.filter(Boolean) as HTMLSpanElement[]);
    };
  }, [run]);

  // Routes brighten as the pointer passes them.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    let rect = root.getBoundingClientRect();
    const resize = () => {
      rect = root.getBoundingClientRect();
    };

    const paint = (px: number, py: number) => {
      LINKS.forEach(([a, b], i) => {
        const line = lineRefs.current[i];
        if (!line) return;
        const A = depot(a);
        const B = depot(b);
        const mx = ((A.x + B.x) / 2 / 100) * rect.width;
        const my = ((A.y + B.y) / 2 / 100) * rect.height;
        const near = Math.hypot(px - mx, py - my) < NEAR;
        line.style.stroke = near ? "var(--dn-line-near)" : "";
        line.style.strokeOpacity = near ? "1" : "";
      });
    };

    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        paint(event.clientX - rect.left, event.clientY - rect.top);
      });
    };

    const onLeave = () => paint(-9999, -9999);

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", resize);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const dispatchFrom = (id: string) => {
    pulse(id);
    if (prefersReducedMotion()) return;

    const index = busy.current.findIndex((isBusy, i) => i >= CONTINUOUS && !isBusy);
    if (index === -1) return;

    const el = flightRefs.current[index];
    if (!el) return;

    const origin = depot(id);
    busy.current[index] = true;
    gsap.set(el, { left: `${origin.x}%`, top: `${origin.y}%`, opacity: 0 });
    gsap.to(el, { opacity: 1, duration: 0.2 });
    run(index, id, undefined, 2);
  };

  return (
    <div className="delivery-net" ref={rootRef}>
      <svg className="dn-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {LINKS.map(([a, b], i) => {
          const A = depot(a);
          const B = depot(b);
          return (
            <line
              key={`${a}-${b}`}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              x1={A.x}
              y1={A.y}
              x2={B.x}
              y2={B.y}
            />
          );
        })}
      </svg>

      {Array.from({ length: POOL }, (_, i) => (
        <span
          key={i}
          className="dn-flight"
          aria-hidden="true"
          ref={(el) => {
            flightRefs.current[i] = el;
          }}
        />
      ))}

      {DEPOTS.map((d) => (
        <button
          key={d.id}
          type="button"
          className="dn-depot"
          style={{ left: `${d.x}%`, top: `${d.y}%` }}
          onMouseEnter={() => setHovered(d)}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered(d)}
          onBlur={() => setHovered(null)}
          onClick={() => dispatchFrom(d.id)}
          aria-label={`Send a delivery from ${d.name}`}
        >
          <span
            className="dn-halo"
            ref={(el) => {
              haloRefs.current[d.id] = el;
            }}
          />
          <span className="dn-node" />
        </button>
      ))}

      {hovered && (
        <div
          className="dn-label"
          style={{ left: `${hovered.x}%`, top: `${hovered.y}%` }}
          aria-hidden="true"
        >
          <strong>{hovered.name}</strong>
          <span>{neighbours(hovered.id).length} routes</span>
        </div>
      )}
    </div>
  );
}
