"use client";

import DepositRoutesCard from "./components/DepositRoutesCard";
import VendorPerformanceCard from "./components/VendorPerformanceCard";
import OperationStatusCard from "./components/OperationStatusCard";
import { mockSupervisorHomeSummary } from "./mockSupervisorHomeData";
import "./styles.css";

export default function SupervisorHomeContent() {
  const data = mockSupervisorHomeSummary;

  const kpis = [
    { label: "Allocated drivers", value: `${data.allocatedDrivers}/${data.totalDrivers}`, tone: "good" },
    { label: "Not allocated", value: String(data.notAllocatedDriverNames.length), tone: "risk" },
    { label: "Day status", value: data.dayFinalized ? "Finalized" : "In progress", tone: data.dayFinalized ? "good" : "warn" },
    { label: "Sort rate", value: `${data.sortRatePercent}%`, tone: "neutral" },
  ] as const;

  return (
    <div className="shp-wrap">
      <header className="shp-header">
        <div>
          <p className="shp-eyebrow">
            {data.depositKey}
            {data.depositLead ? ` · ${data.depositLead}` : ""}
          </p>
          <h1>Previous day summary</h1>
        </div>
        <span className="shp-meta">{data.date}</span>
      </header>

      <div className="shp-kpis">
        {kpis.map((kpi) => (
          <div className={`shp-kpi shp-kpi--${kpi.tone}`} key={kpi.label}>
            <span className="shp-kpi__num">{kpi.value}</span>
            <span className="shp-kpi__label">{kpi.label}</span>
          </div>
        ))}
      </div>

      <div className="shp-grid">
        <DepositRoutesCard routes={data.routes} notAllocated={data.notAllocatedDriverNames} />
        <VendorPerformanceCard topVendors={data.topVendors} attentionVendors={data.attentionVendors} />
      </div>

      <div className="shp-grid shp-grid--single">
        <OperationStatusCard
          dayFinalized={data.dayFinalized}
          routeBalance={data.routeBalance}
          allocatedDrivers={data.allocatedDrivers}
          totalDrivers={data.totalDrivers}
          notAllocatedCount={data.notAllocatedDriverNames.length}
        />
      </div>
    </div>
  );
}
