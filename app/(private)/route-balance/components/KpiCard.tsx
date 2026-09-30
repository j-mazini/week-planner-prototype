import type { KpiModel } from "../types";

export default function KpiCard({ kpi }: { kpi: KpiModel }) {
  return (
    <div className={`rbf-kpi${kpi.tone === "alert" ? " alert" : ""}`}>
      <div className="lbl">{kpi.label}</div>
      <div className="val">
        <strong>{kpi.value}</strong>
        {kpi.trend && <span>{kpi.trend}</span>}
      </div>
      <div className="helper">{kpi.helper}</div>
    </div>
  );
}
