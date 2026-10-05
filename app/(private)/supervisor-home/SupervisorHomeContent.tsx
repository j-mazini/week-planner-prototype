"use client";

import { useMemo, useState } from "react";
import type { DepositKey } from "@/app/(private)/daily-game-plan/mockDailyGamePlanData";
import { useAuth } from "@/hooks/useAuth";
import { BUSINESS_RULES } from "@/src/constants/businessRules";
import DepositRoutesCard from "./components/DepositRoutesCard";
import VendorPerformanceCard from "./components/VendorPerformanceCard";
import OperationStatusCard from "./components/OperationStatusCard";
import KpiStrip from "./components/KpiStrip";
import { DEPOSIT_KEYS, aggregateDeposits } from "./mockSupervisorHomeData";
import "./styles.css";

/** On phones and tablets the three cards become one section at a time — a
 *  several-screen scroll otherwise. The tab bar is hidden from 1440px, where
 *  all three fit side by side and every panel is shown. */
const TABS = [
  { id: "operation", label: "Today" },
  { id: "routes", label: "Routes" },
  { id: "vendors", label: "Vendors" },
] as const;

type TabId = (typeof TABS)[number]["id"];
type DepositFilter = DepositKey | "ALL";

export default function SupervisorHomeContent() {
  const [tab, setTab] = useState<TabId>("operation");
  const [deposit, setDeposit] = useState<DepositFilter>("ALL");
  const { user } = useAuth();

  // A supervisor is scoped to their own deposit; an admin sees every deposit
  // and can narrow to one.
  const isSupervisor =
    user?.userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR || Boolean(user?.roles?.includes("supervisor"));
  const isDriver =
    user?.userTypeId === BUSINESS_RULES.USER_TYPE.DRIVER || Boolean(user?.roles?.includes("driver"));
  const canPickDeposit = !isSupervisor && !isDriver;

  const data = useMemo(() => {
    // TODO(data): a supervisor's own deposit comes from daily_supervisor_check
    // (lib/daily-supervisor-check.ts); the mock pins them to the first one.
    if (!canPickDeposit) return aggregateDeposits([DEPOSIT_KEYS[0]]);
    return aggregateDeposits(deposit === "ALL" ? DEPOSIT_KEYS : [deposit]);
  }, [canPickDeposit, deposit]);

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
            {canPickDeposit && deposit === "ALL" ? "All deposits" : `Deposit ${data.depositKey}`}
            {data.depositLead ? ` · ${data.depositLead}` : ""}
          </p>
          <h1>Previous day summary</h1>
        </div>
        <span className="shp-meta">{data.date}</span>
      </header>

      {canPickDeposit && (
        <div className="shp-deposits" role="group" aria-label="Deposit">
          <button
            type="button"
            className={`shp-deposit${deposit === "ALL" ? " shp-deposit--active" : ""}`}
            aria-pressed={deposit === "ALL"}
            onClick={() => setDeposit("ALL")}
          >
            All
          </button>
          {DEPOSIT_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={`shp-deposit${deposit === key ? " shp-deposit--active" : ""}`}
              aria-pressed={deposit === key}
              onClick={() => setDeposit(key)}
            >
              {key}
            </button>
          ))}
        </div>
      )}

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
            key={data.depositKey}
            dayFinalized={data.dayFinalized}
            finalizedAt={data.finalizedAt}
            routeBalance={data.routeBalance}
            gamePlan={data.gamePlan}
          />
        </div>
      </div>
    </div>
  );
}
