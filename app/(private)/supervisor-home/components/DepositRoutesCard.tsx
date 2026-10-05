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
  const totalPlanned = routes.reduce((sum, r) => sum + r.plannedStops, 0);
  const totalNotReceived = routes.reduce((sum, r) => sum + r.notReceived, 0);
  const totalFailedPick = routes.reduce((sum, r) => sum + r.failedPick, 0);
  const avgSph = routes.length ? routes.reduce((sum, r) => sum + r.sph, 0) / routes.length : 0;
  const totalCompletion = totalPlanned ? Math.round((totalStops / totalPlanned) * 100) : 0;
  // TW is per delivery, so the deposit figure weighs each route by its stops.
  const depositTw = totalStops
    ? routes.reduce((sum, r) => sum + r.timeWindowPercent * r.stops, 0) / totalStops
    : 0;

  return (
    <section className="shp-card shp-card--routes">
      <header className="shp-card__head">
        <div>
          <p className="shp-card__eyebrow">Previous day</p>
          <h2>Route summary</h2>
        </div>
        <dl className="shp-headstats">
          <div>
            <dt>Stops</dt>
            <dd>
              {totalStops}
              <span className="shp-headstats__of">/{totalPlanned}</span>
            </dd>
          </div>
          <div>
            <dt>Failures</dt>
            <dd>{totalNotReceived + totalFailedPick}</dd>
          </div>
          <div title="Deliveries made inside their time window">
            <dt>TW</dt>
            <dd>{depositTw.toFixed(1)}%</dd>
          </div>
          <div>
            <dt>Avg SPH</dt>
            <dd>{avgSph.toFixed(1)}</dd>
          </div>
        </dl>
      </header>

      {routes.length === 0 ? (
        <p className="shp-empty">No routes recorded for the previous day.</p>
      ) : (
        <div className="shp-routes">
          {routes.map((route) => {
            const completion = route.plannedStops ? Math.round((route.stops / route.plannedStops) * 100) : 0;
            const failed = route.notReceived + route.failedPick;
            return (
              <article className="shp-route" key={route.routeCode}>
                <span className="shp-route__code">{route.routeCode}</span>

                <div className="shp-route__body">
                  <div className="shp-route__top">
                    <span className="shp-route__driver">{route.driverName}</span>
                    <span className="shp-route__vehicle">{route.vehicle}</span>
                    <span className="shp-route__count">
                      {route.stops}
                      <span className="shp-route__of">/{route.plannedStops} stops</span>
                      <span className="shp-route__pct">{completion}%</span>
                    </span>
                  </div>

                  <span
                    className="shp-bar"
                    role="img"
                    aria-label={`${completion}% of planned stops delivered`}
                    title={`${route.stops} of ${route.plannedStops} stops`}
                  >
                    <span
                      className={`shp-bar__fill${completion < 90 ? " shp-bar__fill--short" : ""}`}
                      style={{ width: `${completion}%` }}
                    />
                  </span>

                  <div className="shp-route__meta">
                    {failed === 0 && <span className="shp-tag shp-tag--good">No failures</span>}
                    {route.notReceived > 0 && (
                      <span className="shp-tag shp-tag--risk" title="Not Received">
                        NR {route.notReceived}
                      </span>
                    )}
                    {route.failedPick > 0 && (
                      <span className="shp-tag shp-tag--risk" title="Failed Pick">
                        FP {route.failedPick}
                      </span>
                    )}
                    <span className="shp-tag">Sort {route.sort}</span>
                    <span
                      className={`shp-tag${route.timeWindowPercent < 90 ? " shp-tag--risk" : ""}`}
                      title="Deliveries made inside their time window"
                    >
                      TW {route.timeWindowPercent.toFixed(1)}%
                    </span>
                    <span className="shp-tag">{route.sph.toFixed(1)} SPH</span>
                    <span className="shp-tag">
                      {route.departTime}–{route.arriveTime}
                    </span>
                    {route.note && <span className="shp-route__note">{route.note}</span>}
                  </div>
                </div>

                <StatusBadge status={STATUS_BADGE_TYPE[route.status]}>{STATUS_LABEL[route.status]}</StatusBadge>
              </article>
            );
          })}
        </div>
      )}

      <footer className="shp-route-total">
        <span className="shp-route-total__label">Deposit total</span>
        <span className="shp-bar" role="img" aria-label={`${totalCompletion}% of planned stops delivered across the deposit`}>
          <span className="shp-bar__fill" style={{ width: `${totalCompletion}%` }} />
        </span>
        <span className="shp-route-total__value">{totalCompletion}%</span>
      </footer>

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
