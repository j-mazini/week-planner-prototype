"use client";

import React from "react";
import ServicePartnerBadge from "@/components/service-partner-badge";
import { useServicePartnerNameByUserId } from "@/hooks/useServicePartnerNameByUserId";
import { weekPlannerOperationsStyles } from "../../styles";

export type DayOffTableRow = {
  name: string;
  reason: string;
  notes: string;
  userId?: number | null;
};

type Props = {
  selectedDate: string;
  rows: DayOffTableRow[];
  loading: boolean;
};

const DAY_OFF_TABLE_HEADERS = ["Name", "Reason", "Notes"] as const;

export const DayOffTable = React.memo(function DayOffTable({
  selectedDate,
  rows,
  loading,
}: Props) {
  const servicePartnerMap = useServicePartnerNameByUserId();
  const sortedRows = React.useMemo(
    () => [...rows].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
    [rows]
  );

  if (loading && sortedRows.length === 0) {
    return (
      <div className={weekPlannerOperationsStyles.tableContainer} style={{ marginBottom: "1rem" }}>
        <div className="px-4 py-3 border-b border-slate-200/60 bg-slate-50/80">
          <h3 className="text-sm font-semibold text-slate-800">
            Day Off — {selectedDate}
          </h3>
        </div>
        <div className={weekPlannerOperationsStyles.tableLoadingContainer}>
          <div className={weekPlannerOperationsStyles.tableLoadingSpinner} />
          <p className={weekPlannerOperationsStyles.tableLoadingText}>Loading day off entries...</p>
        </div>
      </div>
    );
  }

  if (sortedRows.length === 0) {
    return (
      <div className={weekPlannerOperationsStyles.tableContainer} style={{ marginBottom: "1rem" }}>
        <div className="px-4 py-3 border-b border-slate-200/60 bg-slate-50/80">
          <h3 className="text-sm font-semibold text-slate-800">
            Day Off — {selectedDate}
          </h3>
        </div>
        <div className="m-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-sm text-slate-600">No vendors with day off on this date.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={weekPlannerOperationsStyles.tableContainer} style={{ marginBottom: "1rem" }}>
      <div className="px-4 py-3 border-b border-slate-200/60 bg-slate-50/80">
        <h3 className="text-sm font-semibold text-slate-800">
          Day Off — {selectedDate} ({sortedRows.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className={weekPlannerOperationsStyles.table} style={{ minWidth: "400px" }}>
          <thead className={weekPlannerOperationsStyles.tableThead}>
            <tr>
              {DAY_OFF_TABLE_HEADERS.map((h) => (
                <th key={h} className={weekPlannerOperationsStyles.tableTh}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={weekPlannerOperationsStyles.tableTbody}>
            {sortedRows.map((row, idx) => (
              <tr
                key={idx}
                className={`${weekPlannerOperationsStyles.tableRow} ${idx % 2 === 0 ? weekPlannerOperationsStyles.tableRowEven : weekPlannerOperationsStyles.tableRowOdd}`}
              >
                <td className={weekPlannerOperationsStyles.tableCell}>
                  <span className="inline-flex items-center gap-1.5 flex-wrap">
                    <span>{row.name}</span>
                    {(() => {
                      const spName = row.userId != null ? servicePartnerMap.get(Number(row.userId)) ?? null : null;
                      return spName !== null ? (
                        <ServicePartnerBadge partnerName={spName} size="xs" />
                      ) : null;
                    })()}
                  </span>
                </td>
                <td className={weekPlannerOperationsStyles.tableCell}>{row.reason}</td>
                <td className={weekPlannerOperationsStyles.tableCell}>{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
