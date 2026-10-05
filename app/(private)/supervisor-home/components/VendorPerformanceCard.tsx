import type { VendorPerformanceEntry } from "../types";

function Trend({ current, previous }: { current: number; previous: number }) {
  const delta = current - previous;
  if (Math.abs(delta) < 0.1) return <span className="shp-trend shp-trend--flat">· steady</span>;
  const up = delta > 0;
  return (
    <span className={`shp-trend ${up ? "shp-trend--up" : "shp-trend--down"}`}>
      {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}pt
    </span>
  );
}

function VendorRow({ entry, rank, tone }: { entry: VendorPerformanceEntry; rank: number; tone: "good" | "risk" }) {
  return (
    <div className="shp-vp-row">
      <span className="shp-vp-rank">{String(rank).padStart(2, "0")}</span>
      <span>
        <span className="shp-vp-name">{entry.vendorName}</span>
        <br />
        <small>
          {entry.routeCode}
          {entry.flag ? ` · ${entry.flag}` : ""}
        </small>
      </span>
      <span className="shp-vp-score-wrap">
        <span className={`shp-vp-score shp-vp-score--${tone}`}>{entry.score.toFixed(1)}%</span>
        <Trend current={entry.score} previous={entry.previousScore} />
      </span>
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
      <p className="shp-card__sub">Your deposit · last 7 days vs. the week before</p>

      {!hasData && <p className="shp-empty">No performance data for this period.</p>}

      {topVendors.length > 0 && (
        <div className="shp-vp-list">
          {topVendors.map((entry, i) => (
            <VendorRow entry={entry} rank={i + 1} tone="good" key={entry.vendorName} />
          ))}
        </div>
      )}

      {attentionVendors.length > 0 && (
        <>
          <div className="shp-divider" />
          <p className="shp-card__sub">Needs attention</p>
          <div className="shp-vp-list">
            {attentionVendors.map((entry, i) => (
              <VendorRow entry={entry} rank={topVendors.length + i + 1} tone="risk" key={entry.vendorName} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
