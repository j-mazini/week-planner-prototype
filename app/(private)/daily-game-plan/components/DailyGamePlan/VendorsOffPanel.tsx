"use client";

import { VendorOffEntry } from "../../mockDailyGamePlanData";

type Props = {
  entries: VendorOffEntry[];
  collapsed: boolean;
  onToggle: () => void;
};

export default function VendorsOffPanel({ entries, collapsed, onToggle }: Props) {
  return (
    <div className="dgp-side-panel dgp-side-panel--neutral">
      <div className="dgp-side-panel__header">
        <div className="dgp-side-panel__title">
          <span className="dgp-side-panel__icon dgp-side-panel__icon--neutral">⏻</span>
          <button type="button" className="dgp-link-heading dgp-link-heading--neutral" onClick={onToggle}>
            VENDORS OFF
          </button>
        </div>
        <div className="dgp-side-panel__tools">
          <span className="dgp-chip">TOTAL: {entries.length}</span>
          <button
            type="button"
            className={`dgp-toggle-btn${collapsed ? " dgp-toggle-btn--collapsed" : ""}`}
            aria-label={collapsed ? "Expand vendors off panel" : "Collapse vendors off panel"}
            onClick={onToggle}
          >
            ▴
          </button>
        </div>
      </div>
      <div className={`dgp-side-panel__collapsible${collapsed ? " dgp-side-panel__collapsible--collapsed" : ""}`}>
        <div>
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
                  <span className="dgp-label">REASON:</span>
                  <span className="dgp-value dgp-muted">{entry.reason}</span>
                </div>
              </div>
            ))}
            {entries.length === 0 && <p className="dgp-muted">No vendors off today.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
