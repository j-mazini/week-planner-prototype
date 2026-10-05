import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { OPERATION_STAGES } from "../mockSupervisorHomeData";
import type { RouteBalanceSummary } from "../types";

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
  allocatedDrivers,
  totalDrivers,
  notAllocatedCount,
}: {
  dayFinalized: boolean;
  finalizedAt?: string;
  routeBalance: RouteBalanceSummary;
  allocatedDrivers: number;
  totalDrivers: number;
  notAllocatedCount: number;
}) {
  const currentStage = dayFinalized ? OPERATION_STAGES.length - 1 : routeBalance.stage;
  const href = dayFinalized ? "/daily-game-plan" : "/route-balance";

  return (
    <section className="shp-card shp-card--operation">
      <header className="shp-card__head">
        <div>
          <p className="shp-card__eyebrow">Today</p>
          <h2>{dayFinalized ? "Daily Game Plan" : "Route Balance"}</h2>
        </div>
        <StatusBadge status={dayFinalized ? "active" : "pending"}>
          {dayFinalized ? "Finalized" : "In progress"}
        </StatusBadge>
      </header>

      <p className="shp-card__sub">
        {dayFinalized
          ? `Today's operation was finalized${finalizedAt ? ` at ${finalizedAt}` : ""} — this is the plan drivers are running.`
          : `Routes are still being balanced — last updated ${routeBalance.lastUpdated}.`}
      </p>

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

      <div className="shp-opstats">
        {dayFinalized ? (
          <>
            <Stat
              label="Drivers allocated"
              hint="Final count for today"
              value={`${allocatedDrivers}/${totalDrivers}`}
            />
            <Stat label="Not allocated" hint="Left out of the plan" value={notAllocatedCount} />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      <Link className="shp-cta" prefetch={false} href={href}>
        {dayFinalized ? "View Daily Game Plan" : "Open Route Balance"}
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
