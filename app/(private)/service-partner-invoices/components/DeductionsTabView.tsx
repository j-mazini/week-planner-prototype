"use client";

import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { ServicePartnerDeductionDTO } from "@/lib/service-partner-deductions-api";
import { formatDeductionReference, formatGbp, formatItemDate } from "../utils/format";

interface DeductionsTabViewProps {
  deductions: ServicePartnerDeductionDTO[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  canManage: boolean;
  onEdit: (deduction: ServicePartnerDeductionDTO) => void;
  onDelete: (deduction: ServicePartnerDeductionDTO) => void;
}

export function DeductionsTabView({
  deductions,
  isLoading,
  isError,
  error,
  canManage,
  onEdit,
  onDelete,
}: DeductionsTabViewProps) {
  const totalDeductions = deductions.reduce((sum, d) => sum + d.deduction_amount, 0);
  const totalReimbursements = deductions.reduce((sum, d) => sum + d.reimbursements_amount, 0);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center text-gray-400">
        Loading deductions…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-600">
        {error instanceof Error ? error.message : "Failed to load deductions."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Total Deductions</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{formatGbp(totalDeductions)}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Total Reimbursements</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{formatGbp(totalReimbursements)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-white text-left">
                <th className="py-4 pl-6 pr-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Service Partner</th>
                <th className="py-4 px-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Reference</th>
                <th className="py-4 px-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Description</th>
                <th className="py-4 px-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Incident Date</th>
                <th className="py-4 px-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Entry Date</th>
                <th className="py-4 px-3 text-xs font-semibold uppercase tracking-wide text-gray-600 text-right">Deduction</th>
                <th className="py-4 px-3 text-xs font-semibold uppercase tracking-wide text-gray-600 text-right">Reimbursement</th>
                <th className="py-4 px-3 text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
                {canManage && (
                  <th className="py-4 pl-3 pr-6 text-xs font-semibold uppercase tracking-wide text-gray-600 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {deductions.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 9 : 8} className="py-12 text-center text-gray-400">
                    No deductions for this period
                  </td>
                </tr>
              ) : (
                deductions.map((d, idx) => {
                  const isPaid = !!d.service_partner_invoice_id;
                  return (
                    <tr
                      key={d.service_partner_deduction_id || `deduction-${idx}`}
                      className="border-b border-gray-100 last:border-0 hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="py-4 pl-6 pr-3 font-medium text-slate-800">{d.service_partner_name || "—"}</td>
                      <td className="py-4 px-3 text-slate-600">
                        {formatDeductionReference({
                          service_partner_deduction_id: d.service_partner_deduction_id,
                          deduction_amount: d.deduction_amount,
                          reimbursements_amount: d.reimbursements_amount,
                        })}
                      </td>
                      <td className="py-4 px-3 text-slate-600 max-w-xs truncate">{d.description || "—"}</td>
                      <td className="py-4 px-3 text-slate-600">
                        {d.incident_date ? formatItemDate(d.incident_date) : "—"}
                      </td>
                      <td className="py-4 px-3 text-slate-600">
                        {d.entry_date ? formatItemDate(d.entry_date) : "—"}
                      </td>
                      <td className="py-4 px-3 text-right font-semibold text-red-600">
                        {formatGbp(d.deduction_amount)}
                      </td>
                      <td className="py-4 px-3 text-right font-semibold text-emerald-600">
                        {formatGbp(d.reimbursements_amount)}
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {isPaid ? "Paid" : "Pending"}
                        </span>
                      </td>
                      {canManage && (
                        <td className="py-4 pl-3 pr-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onEdit(d)}
                              aria-label="Edit deduction"
                              disabled={isPaid}
                              title={isPaid ? "Paid items cannot be edited" : "Edit deduction"}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(d)}
                              aria-label="Delete deduction"
                              disabled={isPaid}
                              title={isPaid ? "Paid items cannot be deleted" : "Delete deduction"}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
