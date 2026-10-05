"use client";

import { useState, useEffect } from "react";
import { DriverRow, PAYMENT_MODE_OPTIONS, SORT_OPTIONS, VEHICLE_OPTIONS } from "../../mockDailyGamePlanData";

type Props = {
  driver: DriverRow;
  onCancel: () => void;
  onSave: (driver: DriverRow) => void;
};

export default function DriverEditModal({ driver, onCancel, onSave }: Props) {
  const [draft, setDraft] = useState<DriverRow>(driver);

  useEffect(() => {
    setDraft(driver);
  }, [driver]);

  return (
    <div className="dgp-modal-overlay" role="dialog" aria-modal="true" aria-label="Edit driver">
      <div className="dgp-modal">
        <div className="dgp-modal__header">
          <h2>Edit driver</h2>
          <button type="button" aria-label="Close edit dialog" className="dgp-icon-btn" onClick={onCancel}>
            ✕
          </button>
        </div>
        <div className="dgp-modal__body">
          <label className="dgp-field">
            <span>Vendor / Driver</span>
            <input
              className="dgp-input"
              aria-label="Vendor / Driver"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </label>
          <label className="dgp-field">
            <span>Route</span>
            <input
              className="dgp-input"
              aria-label="Route"
              placeholder="Enter route..."
              value={draft.route}
              onChange={(e) => setDraft((d) => ({ ...d, route: e.target.value }))}
            />
          </label>
          <div className="dgp-field-row">
            <label className="dgp-field">
              <span>Vehicle</span>
              <select
                className="dgp-select"
                aria-label="Vehicle"
                value={draft.vehicle}
                onChange={(e) => setDraft((d) => ({ ...d, vehicle: e.target.value }))}
              >
                {VEHICLE_OPTIONS.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label className="dgp-field">
              <span>Sort</span>
              <select
                className="dgp-select"
                aria-label="Sort"
                value={draft.sort}
                onChange={(e) => setDraft((d) => ({ ...d, sort: e.target.value as "Yes" | "No" }))}
              >
                {SORT_OPTIONS.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="dgp-field-row">
            <label className="dgp-field">
              <span>Value</span>
              <input
                className="dgp-input"
                type="number"
                step="0.01"
                aria-label="Value"
                value={draft.value}
                onChange={(e) => setDraft((d) => ({ ...d, value: Number(e.target.value) }))}
              />
            </label>
            <label className="dgp-field">
              <span>Payment Mode</span>
              <select
                className="dgp-select"
                aria-label="Payment Mode"
                value={draft.paymentMode}
                onChange={(e) => setDraft((d) => ({ ...d, paymentMode: e.target.value }))}
              >
                {PAYMENT_MODE_OPTIONS.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="dgp-field">
            <span>Notes</span>
            <textarea
              className="dgp-input dgp-textarea"
              aria-label="Notes"
              placeholder="Add any specific instructions or notes..."
              value={draft.notes}
              onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            />
          </label>
        </div>
        <div className="dgp-modal__footer">
          <button type="button" className="dgp-btn dgp-btn--ghost" aria-label="Cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="dgp-btn dgp-btn--primary"
            aria-label="Save driver"
            onClick={() => draft.name.trim() && onSave({ ...draft, name: draft.name.trim() })}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
