import type { VendorPerformanceEntry } from "../types";

function VendorRow({ entry, tone }: { entry: VendorPerformanceEntry; tone: "good" | "risk" }) {
  return (
    <div className="shp-vp-row">
      <span>
        <span className="shp-vp-name">{entry.vendorName}</span>
        <br />
        <small>
          {entry.routeCode}
          {entry.flag ? ` · ${entry.flag}` : ""}
        </small>
      </span>
      <span className={`shp-vp-score shp-vp-score--${tone}`}>{entry.score.toFixed(1)}%</span>
    </div>
  );
}

export default function VendorPerformanceCard({
  topVendors,
  attentionVendors,
}: {
  topVendors: VendorPerformanceEntry[];
  attentionVendors: VendorPerformanceEntry[];
}) {
  const hasData = topVendors.length > 0 || attentionVendors.length > 0;

  return (
    <section className="shp-card">
      <h2>Vendor performance</h2>
      <p className="shp-card__sub">Your deposit · last 7 days</p>

      {!hasData && <p className="shp-empty">No performance data for this period.</p>}

      {topVendors.length > 0 && (
        <div className="shp-vp-list">
          {topVendors.map((entry) => (
            <VendorRow entry={entry} tone="good" key={entry.vendorName} />
          ))}
        </div>
      )}

      {attentionVendors.length > 0 && (
        <>
          <div className="shp-divider" />
          <p className="shp-card__sub">Needs attention</p>
          <div className="shp-vp-list">
            {attentionVendors.map((entry) => (
              <VendorRow entry={entry} tone="risk" key={entry.vendorName} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
