"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { OPERATION_STAGES } from "../mockSupervisorHomeData";
import type { DailyGamePlan, RouteBalanceSummary } from "../types";

type View = "balance" | "gameplan";

function Stat({ label, hint, value }: { label: string; hint: string; value: string | number }) {
  return (
    <div className="shp-opstat">
      <span className="shp-opstat__value">{value}</span>
      <span className="shp-opstat__label">{label}</span>
      <span className="shp-opstat__hint">{hint}</span>
    </div>
  );
}

export default function OperationStatusCard({
  dayFinalized,
  finalizedAt,
  routeBalance,
  gamePlan,
}: {
  dayFinalized: boolean;
  finalizedAt?: string;
  routeBalance: RouteBalanceSummary;
  gamePlan: DailyGamePlan;
}) {
  // Opens on whichever view matches the day; the switch lets the supervisor
  // look at the other one without leaving the dashboard.
  const [view, setView] = useState<View>(dayFinalized ? "gameplan" : "balance");
  const isGamePlan = view === "gameplan";
  const currentStage = dayFinalized ? OPERATION_STAGES.length - 1 : routeBalance.stage;

  // "OFF" and "NALC" are the Daily Game Plan's own route codes for a driver who
  // is off today and one with no route assigned yet.
  const off = gamePlan.drivers.filter((d) => d.route === "OFF").length;
  const notAllocated = gamePlan.drivers.filter((d) => d.route === "NALC").length;
  const onRoute = gamePlan.drivers.length - off - notAllocated;

  const subtitle = isGamePlan
    ? dayFinalized
      ? `Finalized${finalizedAt ? ` at ${finalizedAt}` : ""} — this is the plan drivers are running.`
      : "Allocation so far — today's plan is not finalized yet."
    : dayFinalized
      ? "Balancing is closed for today."
      : `Routes are still being balanced — last updated ${routeBalance.lastUpdated}.`;

  return (
    <section className="shp-card shp-card--operation">
      <header className="shp-card__head">
        <div>
          <p className="shp-card__eyebrow">Today</p>
          <h2>{isGamePlan ? "Daily Game Plan" : "Route Balance"}</h2>
        </div>
        <StatusBadge status={dayFinalized ? "active" : "pending"}>
          {dayFinalized ? "Finalized" : "In progress"}
        </StatusBadge>
      </header>

      <div className="shp-switch" role="group" aria-label="Operation view">
        <button
          type="button"
          className={`shp-switch__btn${!isGamePlan ? " shp-switch__btn--active" : ""}`}
          aria-pressed={!isGamePlan}
          onClick={() => setView("balance")}
        >
          Route Balance
        </button>
        <button
          type="button"
          className={`shp-switch__btn${isGamePlan ? " shp-switch__btn--active" : ""}`}
          aria-pressed={isGamePlan}
          onClick={() => setView("gameplan")}
        >
          Daily Game Plan
        </button>
      </div>

      <p className="shp-card__sub">{subtitle}</p>

      <ol className="shp-stepper">
        {OPERATION_STAGES.map((name, i) => (
          <li
            key={name}
            className={`shp-step${i < currentStage ? " shp-step--done" : ""}${i === currentStage ? " shp-step--current" : ""}`}
            aria-current={i === currentStage ? "step" : undefined}
          >
            <span className="shp-step__dot" aria-hidden="true" />
            <span className="shp-step__name">{name}</span>
          </li>
        ))}
      </ol>

      {isGamePlan ? (
        <>
          <p className="shp-group-label">
            {onRoute} on route · {off} off · {notAllocated} not allocated
          </p>
          <div className="shp-plan">
            <div className="shp-plan__head" aria-hidden="true">
              <span>Route</span>
              <span>Vendor / Driver</span>
              <span>Sort</span>
              <span>Vehicle</span>
            </div>
            <ul className="shp-plan__list">
              {gamePlan.drivers.map((driver) => (
                <li className="shp-plan__row" key={`${driver.deposit ?? ""}${driver.name}`}>
                  <span className={`shp-plan__route${driver.route === "NALC" ? " shp-plan__route--nalc" : ""}`}>
                    {driver.route}
                  </span>
                  <span className="shp-plan__driver">
                    <span>
                      {driver.name}
                      {driver.deposit && <em className="shp-plan__deposit">{driver.deposit}</em>}
                    </span>
                    {driver.notes && <small>{driver.notes}</small>}
                  </span>
                  <span className={`shp-plan__sort shp-plan__sort--${driver.sort === "Yes" ? "yes" : "no"}`}>
                    {driver.sort}
                  </span>
                  <span className="shp-plan__vehicle">
                    <span className="shp-plan__dot" aria-hidden="true" />
                    {driver.vehicle}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="shp-opstats">
          <Stat
            label="Pending routes"
            hint="Waiting on a final assignment"
            value={routeBalance.pendingRoutes}
          />
          <Stat
            label="Unassigned stops"
            hint="Across all pending routes"
            value={routeBalance.unassignedStops}
          />
        </div>
      )}

      <Link className="shp-cta" prefetch={false} href={isGamePlan ? "/daily-game-plan" : "/route-balance"}>
        {isGamePlan ? "View Daily Game Plan" : "Open Route Balance"}
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
