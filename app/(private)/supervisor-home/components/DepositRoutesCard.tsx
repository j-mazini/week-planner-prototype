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
  return (
    <section className="shp-card">
      <h2>Route summary</h2>
      <p className="shp-card__sub">Previous day · stops, failures and sort per route</p>

      {routes.length === 0 ? (
        <p className="shp-empty">No routes recorded for the previous day.</p>
      ) : (
        routes.map((route) => (
          <div className="shp-route-row" key={route.routeCode}>
            <span className="shp-route-code">{route.routeCode}</span>
            <span className="shp-route-driver">
              <span>{route.driverName}</span>
              <small>
                {route.stops} stops · {route.failed} failure{route.failed === 1 ? "" : "s"} · Sort: {route.sort}
                {route.note ? ` · ${route.note}` : ""}
              </small>
            </span>
            <StatusBadge status={STATUS_BADGE_TYPE[route.status]}>{STATUS_LABEL[route.status]}</StatusBadge>
          </div>
        ))
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
