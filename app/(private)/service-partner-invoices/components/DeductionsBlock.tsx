"use client";

import React from "react";
import type { ServicePartnerInvoiceDeductionDTO } from "@/lib/service-partners-api";
import { INVOICE_HEX } from "../constants/invoiceTheme";
import { formatDeductionReference, formatGbp, formatItemDate } from "../utils/format";

interface DeductionsBlockProps {
  deductions: ServicePartnerInvoiceDeductionDTO[];
  totalDeductions: number;
  totalReimbursements: number;
}

/** Compact deductions/reimbursements table shown below the stops block. */
export function DeductionsBlock({ deductions, totalDeductions, totalReimbursements }: DeductionsBlockProps) {
  if (deductions.length === 0) return null;

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: INVOICE_HEX.surfaceBorder }}
    >
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ backgroundColor: INVOICE_HEX.navy }}
      >
        <span className="text-sm font-bold text-white">Deductions &amp; Reimbursements</span>
      </div>

      <div className="bg-white px-5 pb-5 pt-4">
        <div className="max-h-[280px] overflow-y-auto overflow-x-auto rounded-md">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr style={{ backgroundColor: INVOICE_HEX.surface }}>
                <th className="px-3 py-1.5 text-left font-semibold text-slate-600">Reference</th>
                <th className="px-3 py-1.5 text-left font-semibold text-slate-600">Description</th>
                <th className="px-3 py-1.5 text-left font-semibold text-slate-600">Incident</th>
                <th className="px-3 py-1.5 text-left font-semibold text-slate-600">Entry</th>
                <th className="px-3 py-1.5 text-right font-semibold text-slate-600">Deduction</th>
                <th className="px-3 py-1.5 text-right font-semibold text-slate-600">Reimbursement</th>
              </tr>
            </thead>
            <tbody>
              {deductions.map((d, idx) => (
                <tr key={d.servicePartnerDeductionId || `deduction-${idx}`} className="border-b border-gray-100">
                  <td className="px-3 py-1.5 font-medium text-slate-700">
                    {formatDeductionReference({
                      servicePartnerDeductionId: d.servicePartnerDeductionId,
                      deductionAmount: d.deductionAmount,
                      reimbursementsAmount: d.reimbursementsAmount,
                    })}
                  </td>
                  <td className="px-3 py-1.5 text-slate-600">{d.description || "—"}</td>
                  <td className="px-3 py-1.5 text-slate-600">
                    {d.incidentDate ? formatItemDate(d.incidentDate) : "—"}
                  </td>
                  <td className="px-3 py-1.5 text-slate-600">
                    {d.entryDate ? formatItemDate(d.entryDate) : "—"}
                  </td>
                  <td className="px-3 py-1.5 text-right font-medium text-red-700">
                    {d.deductionAmount > 0 ? formatGbp(d.deductionAmount) : "—"}
                  </td>
                  <td className="px-3 py-1.5 text-right font-medium text-emerald-700">
                    {d.reimbursementsAmount > 0 ? formatGbp(d.reimbursementsAmount) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="mt-4 flex flex-wrap justify-end gap-4 rounded-lg px-5 py-3"
          style={{ backgroundColor: INVOICE_HEX.surface }}
        >
          <span className="text-sm font-bold text-red-700">
            Deductions: {formatGbp(totalDeductions)}
          </span>
          <span className="text-sm font-bold text-emerald-700">
            Reimbursements: {formatGbp(totalReimbursements)}
          </span>
        </div>
      </div>
    </div>
  );
}
