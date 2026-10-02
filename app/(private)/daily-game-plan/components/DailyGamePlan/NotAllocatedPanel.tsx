"use client";

import { NotAllocatedEntry } from "../../mockDailyGamePlanData";

type Props = {
  entries: NotAllocatedEntry[];
  collapsed: boolean;
  onToggle: () => void;
};

export default function NotAllocatedPanel({ entries, collapsed, onToggle }: Props) {
  return (
    <div className="dgp-side-panel dgp-side-panel--warning">
      <div className="dgp-side-panel__header">
        <div className="dgp-side-panel__title">
          <span className="dgp-side-panel__icon">!</span>
          <button type="button" className="dgp-link-heading" onClick={onToggle}>
            NOT ALLOCATED
          </button>
        </div>
        <div className="dgp-side-panel__tools">
          <span className="dgp-chip">TOTAL: {entries.length}</span>
          <button
            type="button"
            className="dgp-toggle-btn"
            aria-label={collapsed ? "Expand not allocated panel" : "Collapse not allocated panel"}
            onClick={onToggle}
          >
            {collapsed ? "▾" : "▴"}
          </button>
        </div>
      </div>
      {!collapsed && (
        <>
          <div className="dgp-side-panel__subheader">
            {entries.length} vendor{entries.length === 1 ? "" : "s"} standby with no route
          </div>
          <div className="dgp-side-panel__body">
            {entries.map((entry) => (
              <div key={entry.vendorName} className="dgp-vendor-card">
                <div className="dgp-vendor-card__row">
                  <span className="dgp-label">VENDOR NAME:</span>
                  <span className="dgp-value">{entry.vendorName}</span>
                </div>
                <div className="dgp-vendor-card__row">
                  <span className="dgp-label">ASSIGNED HUB:</span>
                  <span className="dgp-chip">{entry.assignedHub}</span>
                </div>
                <div className="dgp-vendor-card__row">
                  <span className="dgp-label">DEFAULT ROUTE:</span>
                  <span className="dgp-value dgp-muted">{entry.defaultRoute}</span>
                </div>
                <div className="dgp-vendor-card__notes">{entry.notes || "Notes..."}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
