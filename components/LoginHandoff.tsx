"use client";

import { DEPOTS, LINKS, depot } from "@/lib/delivery-network";
import { useLoginHandoff } from "@/hooks/useLoginHandoff";
import "./login-handoff.css";

/**
 * The screen between signing in and the workspace. The delivery map from the login panel
 * takes over the whole viewport, the routes draw outward, every depot sends a delivery to
 * one point at the centre, and that point opens into the app.
 *
 * Timing and navigation belong to {@link useLoginHandoff}; this is the drawing.
 */
export function LoginHandoff() {
  const { rootRef, active } = useLoginHandoff();

  return (
    <div className="login-handoff" ref={rootRef} hidden={!active} aria-hidden="true">
      <span className="login-handoff__iris" data-handoff="iris" />

      <div className="login-handoff__map">
        <svg className="login-handoff__routes" viewBox="0 0 100 100" preserveAspectRatio="none">
          {LINKS.map(([a, b]) => {
            const A = depot(a);
            const B = depot(b);
            return (
              <line key={`${a}-${b}`} data-handoff="route" x1={A.x} y1={A.y} x2={B.x} y2={B.y} />
            );
          })}
        </svg>

        {DEPOTS.map((d) => (
          <span
            key={d.id}
            className="login-handoff__depot"
            data-handoff="depot"
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
          />
        ))}

        {DEPOTS.map((d) => (
          <span
            key={`parcel-${d.id}`}
            className="login-handoff__parcel"
            data-handoff="parcel"
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
          />
        ))}
      </div>

      <span className="login-handoff__core" data-handoff="core" />
    </div>
  );
}
