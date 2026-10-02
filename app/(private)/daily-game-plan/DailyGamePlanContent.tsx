"use client";

/**
 * Visual-only rebuild of /daily-game-plan, ported from the approved Figma export
 * (daily-game-plan-completo-react, dated 2026-10-02 — 12 desktop states + 6
 * component/modal references, see that export's SCREENS.md).
 *
 * This component is driven entirely by local React state seeded with mock data
 * (see ./mockDailyGamePlanData.ts) adapted from the export's own `src/state.tsx`
 * demo. It intentionally does NOT use ./hooks/useDailyGamePlan.ts or ./api.ts —
 * reconnecting this page to real data is a deliberate, separate follow-up step,
 * not part of this visual rebuild.
 */

import { useMemo, useState } from "react";
import "./styles.css";
import { useAuth } from "@/hooks/useAuth";
import { BUSINESS_RULES } from "@/src/constants/businessRules";
import {
  DepositKey,
  DepositMock,
  DriverRow,
  initialDeposits,
  notAllocatedMock,
  vendorsOffMock,
  weekLabel,
  weekRangeLabel,
} from "./mockDailyGamePlanData";
import DepotAside from "./components/DailyGamePlan/DepotAside";
import DepositBench from "./components/DailyGamePlan/DepositBench";
import NotAllocatedPanel from "./components/DailyGamePlan/NotAllocatedPanel";
import VendorsOffPanel from "./components/DailyGamePlan/VendorsOffPanel";
import DriverEditModal from "./components/DailyGamePlan/DriverEditModal";
import DriverDeleteModal from "./components/DailyGamePlan/DriverDeleteModal";

type EditTarget = { depositKey: DepositKey; index: number } | null;

export default function DailyGamePlanContent() {
  const { user } = useAuth();
  const isAdmin = user?.userTypeId === BUSINESS_RULES.USER_TYPE.ADMIN;

  const [deposits, setDeposits] = useState<Record<DepositKey, DepositMock>>(initialDeposits);
  const [selected, setSelected] = useState<DepositKey>("BAOP");
  const [finished, setFinished] = useState(false);

  const [notAllocatedCollapsed, setNotAllocatedCollapsed] = useState(false);
  const [vendorsOffCollapsed, setVendorsOffCollapsed] = useState(false);

  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<EditTarget>(null);

  const activeDeposit = deposits[selected];

  const editingDriver: DriverRow | null = useMemo(() => {
    if (!editTarget) return null;
    return deposits[editTarget.depositKey].drivers[editTarget.index] ?? null;
  }, [editTarget, deposits]);

  const deletingDriver: DriverRow | null = useMemo(() => {
    if (!deleteTarget) return null;
    return deposits[deleteTarget.depositKey].drivers[deleteTarget.index] ?? null;
  }, [deleteTarget, deposits]);

  function handleSaveDriver(updated: DriverRow) {
    if (!editTarget) return;
    setDeposits((prev) => {
      const next = { ...prev };
      const deposit = next[editTarget.depositKey];
      const drivers = [...deposit.drivers];
      drivers[editTarget.index] = updated;
      next[editTarget.depositKey] = { ...deposit, drivers };
      return next;
    });
    setEditTarget(null);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeposits((prev) => {
      const next = { ...prev };
      const deposit = next[deleteTarget.depositKey];
      const drivers = deposit.drivers.filter((_, i) => i !== deleteTarget.index);
      next[deleteTarget.depositKey] = { ...deposit, drivers };
      return next;
    });
    setDeleteTarget(null);
  }

  function handleRestoreDemo() {
    setDeposits(initialDeposits);
    setSelected("BAOP");
    setFinished(false);
    setNotAllocatedCollapsed(false);
    setVendorsOffCollapsed(false);
    setEditTarget(null);
    setDeleteTarget(null);
  }

  return (
    <div className="dgp-page">
      <div className="dgp-page-title">
        <div>
          <h1 className="dgp-page-title__heading">Daily Game Plan</h1>
          <p className="dgp-page-title__subheading">Manifest validation &amp; physical asset assignments</p>
        </div>
        <div className="dgp-page-title__week">
          <span className="dgp-page-title__week-label">{weekLabel}</span>
          <span className="dgp-page-title__week-range">{weekRangeLabel}</span>
          <button
            type="button"
            className="dgp-icon-btn"
            aria-label="Restore demo data"
            title="Restore demo data"
            onClick={handleRestoreDemo}
          >
            ↺
          </button>
        </div>
      </div>

      <div className="dgp-layout">
        <DepotAside deposits={deposits} selected={selected} onSelect={setSelected} finished={finished} />

        <div className="dgp-center">
          <div className="dgp-bench-col">
            <DepositBench
              deposit={activeDeposit}
              finished={selected === "BAOP" && finished}
              canEdit={!isAdmin}
              onFinish={() => setFinished(true)}
              onEditDriver={(index) => setEditTarget({ depositKey: selected, index })}
              onDeleteDriver={(index) => setDeleteTarget({ depositKey: selected, index })}
            />
          </div>

          <div className="dgp-side-col">
            <VendorsOffPanel
              entries={vendorsOffMock}
              collapsed={vendorsOffCollapsed}
              onToggle={() => setVendorsOffCollapsed((v) => !v)}
            />

            <NotAllocatedPanel
              entries={notAllocatedMock}
              collapsed={notAllocatedCollapsed}
              onToggle={() => setNotAllocatedCollapsed((v) => !v)}
            />
          </div>
        </div>
      </div>

      {editingDriver && (
        <DriverEditModal driver={editingDriver} onCancel={() => setEditTarget(null)} onSave={handleSaveDriver} />
      )}

      {deletingDriver && (
        <DriverDeleteModal
          driverName={deletingDriver.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
