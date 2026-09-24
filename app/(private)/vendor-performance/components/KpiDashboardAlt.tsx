"use client";

import { memo, useMemo } from "react";
import { Clock, Route, Gauge, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KpiMetrics {
  avgTw: string;
  avgSpr: string;
  avgSporH: string;
  avgAfd: string;
}

function parsePct(s: string): number {
  if (!s || s === "--:--" || s === "N/A") return 0;
  const n = parseFloat(s.replace("%", "").replace(/[^\d.]/g, ""));
  return isNaN(n) ? 0 : n;
}

function parseNum(s: string): number {
  if (!s || s === "--:--" || s === "N/A") return 0;
  const n = parseFloat(s.replace(/[^\d.]/g, ""));
  return isNaN(n) ? 0 : n;
}

function barColorTw(value: string): string {
  const p = parsePct(value);
  if (p === 0 && (value === "--:--" || value === "N/A")) return "#9CA3AF";
  if (p >= 90) return "#22c55e";
  if (p >= 80) return "#eab308";
  return "#ef4444";
}

function barColorSporH(value: string): string {
  const v = parseNum(value);
  if (v === 0 && (value === "--:--" || value === "N/A")) return "#9CA3AF";
  return v >= 18 ? "#22c55e" : "#ef4444";
}

function barColorNeutral(value: string): string {
  if (!value || value === "--:--" || value === "N/A") return "#9CA3AF";
  return "#6366f1";
}

function percentTw(value: string): number {
  return Math.min(100, parsePct(value));
}
function percentSpr(value: string): number {
  return Math.min(100, (parseNum(value) / 200) * 100);
}
function percentSporH(value: string): number {
  return Math.min(100, (parseNum(value) / 20) * 100);
}
function percentAfd(value: string): number {
  return Math.min(100, parsePct(value));
}

interface KpiCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon: React.ReactNode;
  barPercent: number;
  barColor: string;
  valueClassName?: string;
}

function KpiCard({ label, value, sublabel, icon, barPercent, barColor, valueClassName }: KpiCardProps) {
  const isNA = !value || value === "--:--" || value === "N/A";
  return (
    <div className="rounded-lg border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-slate-400" aria-hidden>{icon}</span>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className={cn("text-lg font-bold tabular-nums", valueClassName ?? (isNA ? "text-slate-400" : "text-slate-800"))}>
        {isNA ? "–" : value}
      </p>
      {sublabel && <p className="text-[10px] text-slate-400 mt-0.5">{sublabel}</p>}
      <div className="mt-2 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${barPercent}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

interface KpiDashboardAltProps {
  metrics: KpiMetrics;
  /** Use short labels (TW, SPR, …) when true, else "Avg TW", etc. */
  shortLabels?: boolean;
  /** Optional class for the grid container */
  className?: string;
}

export const KpiDashboardAlt = memo(function KpiDashboardAlt({
  metrics,
  shortLabels = false,
  className,
}: KpiDashboardAltProps) {
  const cards = useMemo(
    () => [
      {
        key: "tw",
        label: shortLabels ? "TW" : "Avg TW",
        sublabel: "Time window",
        value: metrics.avgTw,
        icon: <Clock className="w-3.5 h-3.5" />,
        barPercent: percentTw(metrics.avgTw),
        barColor: barColorTw(metrics.avgTw),
        valueClassName: undefined,
      },
      {
        key: "spr",
        label: shortLabels ? "SPR" : "Avg SPR",
        sublabel: "Stops per route",
        value: metrics.avgSpr,
        icon: <Route className="w-3.5 h-3.5" />,
        barPercent: percentSpr(metrics.avgSpr),
        barColor: barColorNeutral(metrics.avgSpr),
        valueClassName: undefined,
      },
      {
        key: "sporH",
        label: shortLabels ? "SPOR-H" : "Avg SPOR-H",
        sublabel: "Stops per hour",
        value: metrics.avgSporH,
        icon: <Gauge className="w-3.5 h-3.5" />,
        barPercent: percentSporH(metrics.avgSporH),
        barColor: barColorSporH(metrics.avgSporH),
        valueClassName: undefined,
      },
      {
        key: "afd",
        label: shortLabels ? "AFD" : "Avg AFD",
        sublabel: "Attempted failed deliveries",
        value: metrics.avgAfd,
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        barPercent: percentAfd(metrics.avgAfd),
        barColor: barColorNeutral(metrics.avgAfd),
        valueClassName: "text-blue-600",
      },
    ],
    [metrics, shortLabels]
  );

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3",
        className
      )}
      role="region"
      aria-label="KPIs summary"
    >
      {cards.map((c) => (
        <KpiCard
          key={c.key}
          label={c.label}
          value={c.value}
          sublabel={c.sublabel}
          icon={c.icon}
          barPercent={c.barPercent}
          barColor={c.barColor}
          valueClassName={c.valueClassName}
        />
      ))}
    </div>
  );
});
