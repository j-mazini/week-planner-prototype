import type { VendorPerformanceEntry } from "../types";

/** Scores cluster in the high range, so the scale starts at 75 rather than 0 — a dot
 *  plot on a labeled partial scale, never a bar (a bar must start at zero). */
const SCALE_MIN = 75;
const SCALE_MAX = 100;

function position(score: number): number {
  const clamped = Math.min(Math.max(score, SCALE_MIN), SCALE_MAX);
  return ((clamped - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
}

function Trend({ current, previous }: { current: number; previous: number }) {
  const diff = Number((current - previous).toFixed(1));
  if (diff === 0) return <span className="shp-trend shp-trend--flat">no change</span>;
  const up = diff > 0;
  return (
    <span className={`shp-trend ${up ? "shp-trend--up" : "shp-trend--down"}`}>
      <span aria-hidden="true">{up ? "▲" : "▼"}</span> {Math.abs(diff)}pt
    </span>
  );
}

function VendorRow({
  entry,
  rank,
  tone,
  average,
}: {
  entry: VendorPerformanceEntry;
  rank: number;
  tone: "good" | "risk";
  average: number;
}) {
  return (
    <article className="shp-vendor">
      <span className="shp-vendor__rank">{String(rank).padStart(2, "0")}</span>
      <span className="shp-vendor__id">
        <span className="shp-vendor__name">{entry.vendorName}</span>
        <small>
          {entry.routeCode}
          {entry.flag ? ` · ${entry.flag}` : ""}
        </small>
      </span>
      <span
        className="shp-scale"
        role="img"
        aria-label={`${entry.score}% on a ${SCALE_MIN} to ${SCALE_MAX} scale, deposit average ${average}%`}
        title={`${entry.vendorName}: ${entry.score}% (deposit average ${average}%)`}
      >
        <span className="shp-scale__avg" style={{ left: `${position(average)}%` }} />
        <span className={`shp-scale__dot shp-scale__dot--${tone}`} style={{ left: `${position(entry.score)}%` }} />
      </span>
      <span className="shp-vendor__score">
        <span className={`shp-vendor__value shp-vendor__value--${tone}`}>{entry.score.toFixed(1)}%</span>
        <Trend current={entry.score} previous={entry.previousScore} />
      </span>
    </article>
  );
}

export default function VendorPerformanceCard({
  topVendors,
  attentionVendors,
  average,
  averagePrevious,
}: {
  topVendors: VendorPerformanceEntry[];
  attentionVendors: VendorPerformanceEntry[];
  average: number;
  averagePrevious: number;
}) {
  const hasData = topVendors.length > 0 || attentionVendors.length > 0;

  return (
    <section className="shp-card">
      <header className="shp-card__head">
        <div>
          <p className="shp-card__eyebrow">Last 7 days</p>
          <h2>Vendor performance</h2>
        </div>
        <dl className="shp-headstats">
          <div>
            <dt>Deposit avg</dt>
            <dd>{average.toFixed(1)}%</dd>
          </div>
        </dl>
      </header>

      <p className="shp-card__sub">
        Scored against the week before · deposit average{" "}
        <Trend current={average} previous={averagePrevious} /> · scale {SCALE_MIN}–{SCALE_MAX}%
      </p>

      {!hasData && <p className="shp-empty">No performance data for this period.</p>}

      {topVendors.length > 0 && (
        <>
          <p className="shp-group-label">Top performers</p>
          <div className="shp-vendors">
            {topVendors.map((entry, i) => (
              <VendorRow entry={entry} rank={i + 1} tone="good" average={average} key={entry.vendorName} />
            ))}
          </div>
        </>
      )}

      {attentionVendors.length > 0 && (
        <>
          <div className="shp-divider" />
          <p className="shp-group-label shp-group-label--risk">Needs attention</p>
          <div className="shp-vendors">
            {attentionVendors.map((entry, i) => (
              <VendorRow
                entry={entry}
                rank={topVendors.length + i + 1}
                tone="risk"
                average={average}
                key={entry.vendorName}
              />
            ))}
          </div>
        </>
      )}

      <div className="shp-scale-legend">
        <span />
        <span className="shp-scale-legend__key">
          <span className="shp-scale-legend__avg" aria-hidden="true" /> deposit average
        </span>
        <span className="shp-scale-legend__axis">
          <span>{SCALE_MIN}%</span>
          <span>{SCALE_MAX}%</span>
        </span>
        <span />
      </div>
    </section>
  );
}
