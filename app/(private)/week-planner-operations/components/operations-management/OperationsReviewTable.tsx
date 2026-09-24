"use client";

import React, { useMemo } from "react";
import { REVIEW_TABLE_HEADERS } from "../../types/operations-management";
import type { FrontendOperationRecord } from "../../types/operations-management";
import VrnPlate from "@/components/vrn-plate";

type Props = {
  data: FrontendOperationRecord[];
  title: string;
  validatedKeys?: Set<string>;
  getItemKey?: (item: FrontendOperationRecord) => string;
};

export const OperationsReviewTable = React.memo(function OperationsReviewTable({
  data,
  title,
  validatedKeys = new Set(),
  getItemKey = (item) => {
    if (item.weekPlannerId != null) return `wp:${item.weekPlannerId}`;
    if (item.operationId != null) return `op:${item.operationId}`;
    return `fallback:${item.Date}|${item.Route}|${item.Name}`;
  },
}: Props) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) =>
      String(a.Route ?? "").localeCompare(String(b.Route ?? ""), undefined, { sensitivity: "base" })
    );
  }, [data]);

  const getBadgeVariant = (fuelType?: string): "blue" | "green" => {
    if (!fuelType) return "blue";
    const v = String(fuelType).trim().toLowerCase();
    return v === "ev" || v.includes("electric") ? "green" : "blue";
  };

  const pendingRows = sortedData.filter((item) => !item.operationId);
  const selectedPendingCount = pendingRows.filter((item) => validatedKeys.has(getItemKey(item))).length;

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-slate-800 mb-3">
        {title} ({sortedData.length})
      </h3>
      <p className="text-sm text-slate-600 mb-3">
        Validated: {selectedPendingCount} / {pendingRows.length}
      </p>
      {sortedData.length === 0 ? (
        <p className="text-slate-500">No records.</p>
      ) : (
        <div className="max-h-[60vh] overflow-auto border border-slate-200/60 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] backdrop-blur-sm">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 via-slate-50 to-slate-100/80 border-b border-slate-200/60 sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Valid.
                </th>
                {REVIEW_TABLE_HEADERS.map((header) => (
                  <th
                    key={header}
                    className="px-5 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {sortedData.map((item, index) => (
                <tr
                  key={index}
                  className={`transition-colors duration-150 ease-out ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  } hover:!bg-slate-200`}
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-700 whitespace-nowrap">
                    {item.operationId ? (
                      <span className="text-slate-400">-</span>
                    ) : validatedKeys.has(getItemKey(item)) ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  {REVIEW_TABLE_HEADERS.map((header) => (
                    <td key={header} className="px-5 py-3.5 text-sm font-medium text-slate-700 whitespace-nowrap">
                      {header === "Vehicle" ? (
                        (() => {
                          const plate = String(item?.Vehicle ?? item?.[header] ?? "").trim();
                          if (!plate) {
                            return <span className="text-slate-400">-</span>;
                          }
                          if (plate.toUpperCase() === "NOVEHICLE") {
                            return <span className="font-semibold text-slate-600">NOVEHICLE</span>;
                          }
                          return (
                            <VrnPlate
                              vrn={plate}
                              size="sm"
                              badgeVariant={getBadgeVariant(item?.vehicleFuelType)}
                            />
                          );
                        })()
                      ) : header === "Sort Value" ? (
                        item.routeSort != null && String(item.routeSort).trim() !== "" ? (
                          String(item.routeSort)
                        ) : (
                          <span className="text-slate-400">-</span>
                        )
                      ) : (
                        item[header] || <span className="text-slate-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});



