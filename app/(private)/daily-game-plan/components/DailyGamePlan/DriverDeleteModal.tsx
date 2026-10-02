"use client";

type Props = {
  driverName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DriverDeleteModal({ driverName, onCancel, onConfirm }: Props) {
  return (
    <div className="dgp-modal-overlay" role="dialog" aria-modal="true" aria-label="Delete driver">
      <div className="dgp-modal dgp-modal--small">
        <div className="dgp-modal__header">
          <h2>Remove driver</h2>
        </div>
        <div className="dgp-modal__body">
          <p>
            Are you sure you want to remove <strong>{driverName}</strong> from today&apos;s game plan? This
            action cannot be undone.
          </p>
        </div>
        <div className="dgp-modal__footer">
          <button type="button" className="dgp-btn dgp-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="dgp-btn dgp-btn--danger" onClick={onConfirm}>
            Delete driver
          </button>
        </div>
      </div>
    </div>
  );
}
