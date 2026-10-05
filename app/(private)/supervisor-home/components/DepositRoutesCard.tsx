import Link from "next/link";
import type { DepositRoute } from "../types";

/**
 * A smaller read of Daily Operations Insights (`/daily-operations-reports`):
 * the same columns in the same order — Route, Vendor, VRN, TW %, Depart,
 * Arrive, Work Hours, Stops, Note — for one deposit and one day, so there is
 * no second vocabulary for the supervisor to learn.
 */
export default function DepositRoutesCard({
  routes,
  notAllocated,
}: {
  routes: DepositRoute[];
  notAllocated: string[];
}) {
  const totalStops = routes.reduce((sum, r) => sum + r.stops, 0);
  const totalPlanned = routes.reduce((sum, r) => sum + r.plannedStops, 0);
  const totalFailures = routes.reduce((sum, r) => sum + r.notReceived + r.failedPick, 0);
  const avgSporH = routes.length ? routes.reduce((sum, r) => sum + r.sporH, 0) / routes.length : 0;
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
            <dd>{totalFailures}</dd>
          </div>
          <div title="Deliveries made inside their time window">
            <dt>TW %</dt>
            <dd>{depositTw.toFixed(1)}</dd>
          </div>
          <div title="Stops per route-hour">
            <dt>SPOR-H</dt>
            <dd>{avgSporH.toFixed(1)}</dd>
          </div>
        </dl>
      </header>

      {routes.length === 0 ? (
        <p className="shp-empty">No routes recorded for the previous day.</p>
      ) : (
        <div className="shp-table">
          <div className="shp-table__scroll">
            <table className="shp-ops">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Vendor</th>
                  <th>VRN</th>
                  <th title="Deliveries made inside their time window">TW %</th>
                  <th>Depart</th>
                  <th>Arrive</th>
                  <th>Work hours</th>
                  <th>Stops</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => {
                  const failures = route.notReceived + route.failedPick;
                  return (
                    <tr key={route.routeCode}>
                      <td>
                        <span className="shp-plan__route">{route.routeCode}</span>
                      </td>
                      <td className="shp-ops__vendor">
                        <span>{route.vendorName}</span>
                        {route.note && <small>{route.note}</small>}
                      </td>
                      <td>
                        <span className="shp-plan__vehicle">
                          <span className="shp-plan__dot" aria-hidden="true" />
                          {route.vrn}
                        </span>
                      </td>
                      <td className={route.timeWindowPercent < 90 ? "shp-ops__num shp-ops__num--risk" : "shp-ops__num"}>
                        {route.timeWindowPercent.toFixed(1)}
                      </td>
                      <td className="shp-ops__num">{route.departTime}</td>
                      <td className="shp-ops__num">{route.arriveTime}</td>
                      <td className="shp-ops__num">{route.workHours}</td>
                      <td className="shp-ops__num">
                        {route.stops}
                        <span className="shp-ops__of">/{route.plannedStops}</span>
                        {failures > 0 && (
                          <span className="shp-ops__fail" title={`Not Received ${route.notReceived} · Failed Pick ${route.failedPick}`}>
                            NR {route.notReceived} · FP {route.failedPick}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {notAllocated.length > 0 && (
        <>
          <div className="shp-divider" />
          <p className="shp-group-label shp-group-label--risk">Not allocated ({notAllocated.length})</p>
          <div className="shp-chip-row">
            {notAllocated.map((name) => (
              <span className="shp-chip" key={name}>
                {name}
              </span>
            ))}
          </div>
        </>
      )}

      <Link className="shp-cta" prefetch={false} href="/daily-operations-reports">
        Open Daily Operations Insights
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
