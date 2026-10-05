import { StatusBadge } from "@/components/status-badge";
import type { DepositRoute } from "../types";

const STATUS_LABEL: Record<DepositRoute["status"], string> = {
  completed: "Completed",
  incomplete: "Incomplete",
};

const STATUS_BADGE_TYPE: Record<DepositRoute["status"], string> = {
  completed: "active",
  incomplete: "pending",
};

export default function DepositRoutesCard({
  routes,
  notAllocated,
}: {
  routes: DepositRoute[];
  notAllocated: string[];
}) {
  const totalStops = routes.reduce((sum, r) => sum + r.stops, 0);
  const totalFailed = routes.reduce((sum, r) => sum + r.notReceived + r.failedPick, 0);

  return (
    <section className="shp-card">
      <h2>Route summary</h2>
      <p className="shp-card__sub">
        Previous day · {totalStops} stops across {routes.length} routes · {totalFailed} failure
        {totalFailed === 1 ? "" : "s"}
      </p>

      {routes.length === 0 ? (
        <p className="shp-empty">No routes recorded for the previous day.</p>
      ) : (
        routes.map((route) => {
          const completion = route.plannedStops ? Math.round((route.stops / route.plannedStops) * 100) : 0;
          const failed = route.notReceived + route.failedPick;
          return (
            <div className="shp-route-row" key={route.routeCode}>
              <span className="shp-route-code">{route.routeCode}</span>
              <span className="shp-route-body">
                <span className="shp-route-top">
                  <span className="shp-route-driver-name">{route.driverName}</span>
                  <span className="shp-route-stops">
                    {route.stops}/{route.plannedStops} stops
                  </span>
                </span>
                <span className="shp-bar-track">
                  <span className="shp-bar-fill" style={{ width: `${completion}%` }} />
                </span>
                <span className="shp-route-meta">
                  <span>
                    {failed > 0 ? (
                      <>
                        NR {route.notReceived} · FP {route.failedPick}
                      </>
                    ) : (
                      "No failures"
                    )}
                  </span>
                  <span>Sort: {route.sort}</span>
                  {route.note && <span className="shp-route-note">{route.note}</span>}
                </span>
              </span>
              <StatusBadge status={STATUS_BADGE_TYPE[route.status]}>{STATUS_LABEL[route.status]}</StatusBadge>
            </div>
          );
        })
      )}

      {notAllocated.length > 0 && (
        <>
          <div className="shp-divider" />
          <p className="shp-card__sub">Not allocated ({notAllocated.length})</p>
          <div className="shp-chip-row">
            {notAllocated.map((name) => (
              <span className="shp-chip" key={name}>
                {name}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
