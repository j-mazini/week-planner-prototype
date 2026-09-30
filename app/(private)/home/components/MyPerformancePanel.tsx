"use client";

import { useToast } from "../../components/Toast";
import type { MyPerformanceModel } from "../types";

const METRICS: { key: keyof Pick<MyPerformanceModel, "spr" | "sporh" | "tw" | "afd">; label: string; hint: string; format: (v: number | null) => string; tone: string }[] = [
  { key: "spr", label: "SPR", hint: "Stops per route", format: (v) => (v == null ? "—" : String(Math.round(v))), tone: "" },
  { key: "sporh", label: "SPOR-H", hint: "Stops per on-road hour", format: (v) => (v == null ? "—" : v.toFixed(1)), tone: "asr" },
  { key: "tw", label: "TW", hint: "On-time time window", format: (v) => (v == null ? "—" : `${v.toFixed(1)}%`), tone: "pre12" },
  { key: "afd", label: "AFD", hint: "Attempted failed deliveries", format: (v) => (v == null ? "—" : `${Math.round(v)}%`), tone: "dsr" },
];

function formatDateLabel(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = months[Number(parts[1]) - 1] ?? parts[1];
  return `${parts[2]} ${monthName} ${parts[0]}`;
}

export default function MyPerformancePanel({ data }: { data: MyPerformanceModel }) {
  const { showToast } = useToast();

  return (
    <section className="hp-panel" aria-label="My Performance">
      <div className="hp-panelhd">
        <div>
          <h2 className="hp-panelttl">My Performance</h2>
          <p className="hp-panelsub">Last operation · {formatDateLabel(data.date)}</p>
        </div>
      </div>
      <div className="hp-panelbd">
        <div className="hp-tiles">
          {METRICS.map(({ key, label, hint, format, tone }) => (
            <div className={`hp-tile${tone ? ` ${tone}` : ""}`} key={key}>
              <span className="hp-tile-lbl">{label}</span>
              <span className="hp-tile-val">{format(data[key])}</span>
              <p className="hp-tile-hint">{hint}</p>
            </div>
          ))}
        </div>
        {data.routes.length > 0 && (
          <p className="hp-panelsub" style={{ maxWidth: "none", whiteSpace: "normal" }}>
            {data.routes.length === 1 ? "Route" : "Routes"}: {data.routes.join(", ")}
          </p>
        )}
        <button type="button" className="hp-linkbtn" onClick={() => showToast("Full performance view — not part of this prototype.")}>
          View full performance →
        </button>
      </div>
    </section>
  );
}
