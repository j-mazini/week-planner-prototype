"use client";

import DepositRoutesCard from "./components/DepositRoutesCard";
import VendorPerformanceCard from "./components/VendorPerformanceCard";
import OperationStatusCard from "./components/OperationStatusCard";
import KpiStrip from "./components/KpiStrip";
import { mockSupervisorHomeSummary } from "./mockSupervisorHomeData";
import "./styles.css";

export default function SupervisorHomeContent() {
  const data = mockSupervisorHomeSummary;

  return (
    <div className="shp-wrap">
      <header className="shp-header">
        <div>
          <p className="shp-eyebrow">
            Deposit {data.depositKey}
            {data.depositLead ? ` · ${data.depositLead}` : ""}
          </p>
          <h1>Previous day summary</h1>
        </div>
        <span className="shp-meta">{data.date}</span>
      </header>

      <KpiStrip data={data} />

      <div className="shp-grid">
        <div className="shp-grid__routes">
          <DepositRoutesCard routes={data.routes} notAllocated={data.notAllocatedDriverNames} />
        </div>
        <div className="shp-grid__vendors">
          <VendorPerformanceCard
            topVendors={data.topVendors}
            attentionVendors={data.attentionVendors}
            average={data.depositAverageScore}
            averagePrevious={data.depositAverageScorePrevious}
          />
        </div>
        <div className="shp-grid__operation">
          <OperationStatusCard
            dayFinalized={data.dayFinalized}
            finalizedAt={data.finalizedAt}
            routeBalance={data.routeBalance}
            allocatedDrivers={data.allocatedDrivers}
            totalDrivers={data.totalDrivers}
            notAllocatedCount={data.notAllocatedDriverNames.length}
          />
        </div>
      </div>
    </div>
  );
}
