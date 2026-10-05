import type { DailySeries } from "../types";

/** Deliberately wide: the SVG scales with the tile, so a flat aspect keeps the
 *  trend a band under the number instead of a block beside it on large displays. */
const VIEW_W = 320;
const VIEW_H = 58;
const PAD_Y = 7;

/**
 * Seven-day trend behind a KPI number. One series, so no legend — the tile's
 * label names it. The last point is emphasized because it is the value the
 * tile shows; every point carries a <title> for hover.
 */
export default function Sparkline({
  series,
  tone = "teal",
  unit = "",
}: {
  series: DailySeries;
  tone?: "teal" | "risk";
  unit?: string;
}) {
  const { labels, values } = series;
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = VIEW_W / (values.length - 1);

  const points = values.map((value, i) => ({
    x: i * stepX,
    y: PAD_Y + (1 - (value - min) / span) * (VIEW_H - PAD_Y * 2),
    value,
    label: labels[i] ?? `Day ${i + 1}`,
  }));

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${VIEW_W} ${VIEW_H} L0 ${VIEW_H} Z`;
  const last = points[points.length - 1];
  const stroke = tone === "risk" ? "#8e3e3e" : "var(--teal)";
  const fill = tone === "risk" ? "#8e3e3e1f" : "#27676c24";

  return (
    <svg
      className="shp-spark"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label={`Last ${values.length} business days, from ${min}${unit} to ${max}${unit}`}
    >
      <path d={area} fill={fill} stroke="none" />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r="3" fill={stroke} stroke="var(--paper)" strokeWidth="1.5" />
      {points.map((p) => (
        <rect
          key={p.label + p.x}
          x={p.x - stepX / 2}
          y="0"
          width={stepX}
          height={VIEW_H}
          fill="transparent"
        >
          <title>{`${p.label}: ${p.value}${unit}`}</title>
        </rect>
      ))}
    </svg>
  );
}
