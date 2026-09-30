import type { RouteCardModel } from "../types";

const STATUS_LABEL: Record<RouteCardModel["status"], string> = {
  pending: "Pending",
  validated: "Validated",
  rebalance: "Rebalance",
};

export default function RouteCard({
  route,
  expanded = false,
  rebalancing = false,
  validated = false,
  onToggleValidation,
  onSeeDetails,
  onSeeAllStops,
  onSeeSpecialDeliveries,
  period = "AM",
  featured = false,
}: {
  route: RouteCardModel;
  expanded?: boolean;
  rebalancing?: boolean;
  validated?: boolean;
  onToggleValidation?: () => void;
  onSeeDetails: (route: RouteCardModel) => void;
  onSeeAllStops: (route: RouteCardModel) => void;
  onSeeSpecialDeliveries: (route: RouteCardModel) => void;
  period?: "AM" | "PM";
  featured?: boolean;
}) {
  const percent = route.stopsTotal > 0 ? Math.min(100, Math.max(0, Math.round((route.stopsCompleted / route.stopsTotal) * 100))) : 0;

  return (
    <article className={`rbf-card ${expanded || featured ? "rbf-card--expanded" : "rbf-card--compact"}${featured ? " rbf-card--featured" : ""}`} aria-label={route.code} data-variant={expanded || featured ? "expanded" : "compact"}>
      <div className="rbf-card-head">
        <span className="code">{route.manifestLabel}</span>
        <span className={`rbf-status ${rebalancing ? (validated ? "validated" : "rebalance") : route.status}`}>{rebalancing ? (validated ? "Validated" : "Review") : STATUS_LABEL[route.status]}</span>
      </div>
      <div className="rbf-card-body">
        <div className="rbf-driver">
          <span>{route.driverName}</span>
          <span className="rbf-vehicle-meta"><span className="rbf-plate">{route.vehiclePlate}</span><span className="rbf-period">{period}</span></span>
        </div>
        {!rebalancing && <div>
          <div className="rbf-stop-summary">
            <div className="rbf-progress-label">{route.stopsCompleted} / {route.stopsTotal} STOPS ({percent}%)</div>
            <div className="rbf-progress-bar" role="progressbar" aria-label={`Stops completed for ${route.code}`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
              <i style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>}
        <div className="rbf-mini-row">
          <span>
            <b>{route.deliveries}</b>Deliveries
          </span>
          <span>
            <b>{route.pickups}</b>Pickups
          </span>
          <span>
            <b>{route.pre12}</b>Pre-12
          </span>
          {rebalancing && <span><b>{route.deliveries + route.pickups}</b>Total</span>}
        </div>
        {featured && !expanded && !rebalancing && (
          <div className="rbf-featured-details" aria-label="Special deliveries summary">
            <div className="rbf-featured-title">SPECIAL DELIVERIES <span aria-hidden="true">✦</span></div>
            <div className="rbf-featured-table"><span>SUBPOSTCODE</span><span>DEL</span><span>PU</span><span>TOTAL</span><b>ME1</b><b>2</b><b>1</b><b>3</b><b>ME2</b><b>4</b><b>1</b><b>5</b></div>
            <div className="rbf-featured-actions"><button type="button" onClick={() => onSeeDetails(route)}>SEE DETAILS</button><button type="button" onClick={() => onSeeAllStops(route)}>SEE ALL STOPS</button></div>
            <div className="rbf-featured-total"><span>DELIVERIES</span><span>PICKUPS</span><span>PRE 12</span><b>{route.deliveries}</b><b>{route.pickups}</b><b>{route.pre12}</b></div>
          </div>
        )}
        <table className="rbf-sd-table" hidden={!expanded}>
          <caption>
            <button
              type="button"
              onClick={() => onSeeSpecialDeliveries(route)}
              style={{ background: "none", border: 0, padding: 0, font: "inherit", color: "inherit", textDecoration: "underline", cursor: "pointer" }}
            >
              Special deliveries
            </button>
          </caption>
          <thead>
            <tr>
              <th>Subpostcode</th>
              <th>Del</th>
              <th>Pu</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {route.specialDeliveries.map((row) => (
              <tr key={row.subpostcode}>
                <td>{row.subpostcode}</td>
                <td>{row.deliveries}</td>
                <td>{row.pickups}</td>
                <td>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <span className="rbf-card-expand" aria-hidden="true">{expanded ? "−" : "+"}</span>
      <div className="rbf-card-foot">
        <button type="button" className="rbf-linkbtn" onClick={() => onSeeDetails(route)}>
          See Details
        </button>
        <button type="button" className="rbf-linkbtn" onClick={() => onSeeAllStops(route)}>
          See All Stops
        </button>
      </div>
      {rebalancing && <div className="rbf-validation">
        <button type="button" className="rbf-validate" aria-label={`Validate ${route.code}`} aria-pressed={validated} onClick={onToggleValidation}>
          {validated ? "Validated ✓" : "Validate"}
        </button>
      </div>}
    </article>
  );
}
