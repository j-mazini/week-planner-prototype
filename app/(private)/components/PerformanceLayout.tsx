"use client";

import type { ReactNode } from "react";
import NavbarWrapper from "@/components/navbar-wrapper";
import { PerformanceTabs } from "./PerformanceTabs";
import "./performance.css";

export function PerformanceLayout({ children, period, view }: { children: ReactNode; period?: ReactNode; view: "daily" | "monthly" }) {
  return (
    <NavbarWrapper>
      <main className="my-performance" data-view={view}>
        <header className="performance-heading">
          <div>
            <p className="performance-eyebrow">MY PERFORMANCE</p>
            <h2>{view === "daily" ? "Daily overview" : "Monthly overview"}</h2>
            <p>{view === "daily" ? "Your route, delivery metrics and activity for the selected day." : "Review your monthly averages and daily delivery results."}</p>
          </div>
          <PerformanceTabs />
        </header>
        {period && <div className="performance-toolbar">{period}</div>}
        {children}
      </main>
    </NavbarWrapper>
  );
}
