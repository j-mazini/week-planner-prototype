"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import "../report-screens.css";

/** Which flow the driver is in. Each one keeps the colour of the button that opened it. */
export type Urgency = "accident" | "issue" | "finish";

/**
 * Shared frame for the driver's report and finish screens: a large back target, the
 * screen title, and a band that names the flow in its own colour.
 */
export function RouteScreen({
  urgency,
  title,
  band,
  onBack,
  children,
}: {
  urgency: Urgency;
  title: string;
  band: string;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <section className="route-screen" data-urgency={urgency}>
      <button type="button" className="route-screen__back" onClick={onBack} aria-label={`Back to route overview from ${title}`}>
        <span className="route-screen__back-arrow" aria-hidden="true">
          <ArrowLeft size={18} />
        </span>
        <h1 className="route-screen__title">{title}</h1>
      </button>

      <p className="route-screen__band">
        <b aria-hidden="true" />
        {band}
      </p>

      <div className="route-screen__body">{children}</div>

      {/* The other four screens in this flow still carry it; dropping it from three
          would split the set. */}
      <footer className="route-screen__footer">© 2026 LOGIXSPHERE OPERATIONAL SYSTEMS</footer>
    </section>
  );
}
