"use client";

import { Pencil, Trash2 } from "lucide-react";
import { DriverRow } from "../../mockDailyGamePlanData";

type Props = {
  drivers: DriverRow[];
  canEdit: boolean;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
};

export default function DriverTable({ drivers, canEdit, onEdit, onDelete }: Props) {
  return (
    <div className="dgp-table-container">
      <table className="dgp-table">
        <thead>
          <tr>
            <th className="dgp-table__col-route">ROUTE</th>
            <th className="dgp-table__col-vendor">VENDOR / DRIVER</th>
            <th className="dgp-table__col-sort">SORT</th>
            <th className="dgp-table__col-vehicle">VEHICLE</th>
            <th>OPS NOTES</th>
            <th className="dgp-table__col-actions">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver, index) => (
            <tr key={driver.name + index}>
              <td>
                <span className="dgp-badge dgp-badge--route">{driver.route || "OFF"}</span>
              </td>
              <td className="dgp-table__name">{driver.name}</td>
              <td>
                <span
                  className={`dgp-badge ${
                    driver.sort === "Yes" ? "dgp-badge--sort-yes" : "dgp-badge--sort-no"
                  }`}
                >
                  {driver.sort.toUpperCase()}
                </span>
              </td>
              <td>
                <span className="dgp-badge dgp-badge--vehicle">
                  <span className="dgp-badge__dot" />
                  {driver.vehicle}
                </span>
              </td>
              <td className="dgp-table__notes">{driver.notes || <span className="dgp-muted">Notes...</span>}</td>
              <td className="dgp-table__actions">
                {canEdit && (
                  <div className="dgp-row-actions">
                    <button
                      type="button"
                      aria-label={`Edit ${driver.name}`}
                      title="Edit"
                      className="dgp-row-action-btn"
                      onClick={() => onEdit(index)}
                    >
                      <Pencil size={15} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${driver.name}`}
                      title="Delete"
                      className="dgp-row-action-btn dgp-row-action-btn--danger"
                      onClick={() => onDelete(index)}
                    >
                      <Trash2 size={15} strokeWidth={2} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {drivers.length === 0 && (
            <tr>
              <td colSpan={6} className="dgp-table__empty">
                No drivers configured for this depot yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
