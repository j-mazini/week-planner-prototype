import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import type { RouteBalanceSummary } from "../types";

function RouteBalancePreview({ summary }: { summary: RouteBalanceSummary }) {
  return (
    <>
      <div className="shp-opstatus-row">
        <span>
          <span className="shp-vp-name">Pending routes</span>
          <br />
          <small>Routes still waiting on a final assignment</small>
        </span>
        <span className="shp-opstatus-num">{summary.pendingRoutes}</span>
      </div>
      <div className="shp-opstatus-row">
        <span>
          <span className="shp-vp-name">Unassigned stops</span>
          <br />
          <small>Across all pending routes</small>
        </span>
        <span className="shp-opstatus-num">{summary.unassignedStops}</span>
      </div>
    </>
  );
}

function DailyGamePlanPreview({
  allocatedDrivers,
  totalDrivers,
  notAllocatedCount,
}: {
  allocatedDrivers: number;
  totalDrivers: number;
  notAllocatedCount: number;
}) {
  return (
    <>
      <div className="shp-opstatus-row">
        <span>
          <span className="shp-vp-name">Drivers allocated</span>
          <br />
          <small>Final count for today's operation</small>
        </span>
        <span className="shp-opstatus-num">
          {allocatedDrivers}/{totalDrivers}
        </span>
      </div>
      <div className="shp-opstatus-row">
        <span>
          <span className="shp-vp-name">Not allocated</span>
          <br />
          <small>Left out of the finalized plan</small>
        </span>
        <span className="shp-opstatus-num">{notAllocatedCount}</span>
      </div>
    </>
  );
}

export default function OperationStatusCard({
  dayFinalized,
  routeBalance,
  allocatedDrivers,
  totalDrivers,
  notAllocatedCount,
}: {
  dayFinalized: boolean;
  routeBalance: RouteBalanceSummary;
  allocatedDrivers: number;
  totalDrivers: number;
  notAllocatedCount: number;
}) {
  return (
    <section className="shp-card">
      <div className="shp-opstatus-header">
        <div>
          <h2>{dayFinalized ? "Daily Game Plan" : "Route Balance"}</h2>
          <p className="shp-card__sub">
            {dayFinalized ? "Today's operation is finalized" : "Today's operation is not finalized yet"}
          </p>
        </div>
        <StatusBadge status={dayFinalized ? "active" : "pending"}>
          {dayFinalized ? "Finalized" : "In progress"}
        </StatusBadge>
      </div>

      {dayFinalized ? (
        <DailyGamePlanPreview
          allocatedDrivers={allocatedDrivers}
          totalDrivers={totalDrivers}
          notAllocatedCount={notAllocatedCount}
        />
      ) : (
        <RouteBalancePreview summary={routeBalance} />
      )}

      <div className="shp-divider" />
      <Link
        className="shp-cta"
        prefetch={false}
        href={dayFinalized ? "/daily-game-plan" : "/route-balance"}
      >
        {dayFinalized ? "View Daily Game Plan" : "Open Route Balance"} →
      </Link>
    </section>
  );
}
