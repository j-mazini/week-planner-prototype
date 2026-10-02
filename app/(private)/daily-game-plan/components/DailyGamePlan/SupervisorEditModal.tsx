"use client";

import { useState } from "react";

type Props = {
  currentLead: string;
  onCancel: () => void;
  onSave: (lead: string) => void;
};

export default function SupervisorEditModal({ currentLead, onCancel, onSave }: Props) {
  const [draft, setDraft] = useState(currentLead);

  return (
    <div className="dgp-modal-overlay" role="dialog" aria-modal="true" aria-label="Edit supervisor">
      <div className="dgp-modal dgp-modal--small">
        <div className="dgp-modal__header">
          <h2>Edit supervisor lead</h2>
        </div>
        <div className="dgp-modal__body">
          <label className="dgp-field">
            <span>Supervisor lead</span>
            <input
              className="dgp-input"
              aria-label="Supervisor lead"
              value={draft}
              onChange={(e) => setDraft(e.target.value.toUpperCase())}
            />
          </label>
        </div>
        <div className="dgp-modal__footer">
          <button type="button" className="dgp-btn dgp-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="dgp-btn dgp-btn--primary"
            onClick={() => draft.trim() && onSave(draft.trim())}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
