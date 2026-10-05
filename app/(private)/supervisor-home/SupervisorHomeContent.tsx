"use client";

import { useState } from "react";
import DepositRoutesCard from "./components/DepositRoutesCard";
import VendorPerformanceCard from "./components/VendorPerformanceCard";
import OperationStatusCard from "./components/OperationStatusCard";
import KpiStrip from "./components/KpiStrip";
import { mockSupervisorHomeSummary } from "./mockSupervisorHomeData";
import "./styles.css";

/** On phones the three cards become one section at a time — a 4-screen scroll
 *  otherwise. The tab bar is hidden from tablet up, where all three fit side by
 *  side and every panel is shown. */
const TABS = [
  { id: "operation", label: "Today" },
  { id: "routes", label: "Routes" },
  { id: "vendors", label: "Vendors" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SupervisorHomeContent() {
  const data = mockSupervisorHomeSummary;
  const [tab, setTab] = useState<TabId>("operation");

  const panelProps = (id: TabId) => ({
    "data-panel": id,
    "data-active": tab === id ? "true" : "false",
    role: "tabpanel",
    id: `shp-panel-${id}`,
    "aria-labelledby": `shp-tab-${id}`,
  });

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

      <div className="shp-tabs" role="tablist" aria-label="Dashboard sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`shp-tab-${t.id}`}
            aria-controls={`shp-panel-${t.id}`}
            aria-selected={tab === t.id}
            className={`shp-tab${tab === t.id ? " shp-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="shp-grid">
        <div className="shp-grid__routes" {...panelProps("routes")}>
          <DepositRoutesCard routes={data.routes} notAllocated={data.notAllocatedDriverNames} />
        </div>
        <div className="shp-grid__vendors" {...panelProps("vendors")}>
          <VendorPerformanceCard
            topVendors={data.topVendors}
            attentionVendors={data.attentionVendors}
            average={data.depositAverageScore}
            averagePrevious={data.depositAverageScorePrevious}
          />
        </div>
        <div className="shp-grid__operation" {...panelProps("operation")}>
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
