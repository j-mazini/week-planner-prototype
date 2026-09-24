"use client";

import React from "react";
import type { ServicePartnerInvoiceItemDTO } from "@/lib/service-partners-api";
import { INVOICE_HEX } from "../constants/invoiceTheme";
import { formatGbp, formatItemDate } from "../utils/format";

interface PartnerInvoiceBlockProps {
  partnerName: string;
  /** Right-aligned label in the header bar (e.g. "BA EXPRESS LIMITED - May 2026"). */
  issuerLabel: string;
  items: ServicePartnerInvoiceItemDTO[];
  subtotal: number;
}

/**
 * A single partner's invoice block: a navy header bar, the per-item table
 * (Route, Note, Stops, Amount, Date) and a light-blue subtotal strip.
 * Mirrors the reference PDF layout.
 */
export function PartnerInvoiceBlock({
  partnerName,
  issuerLabel,
  items,
  subtotal,
}: PartnerInvoiceBlockProps) {
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: INVOICE_HEX.surfaceBorder }}
    >
      {/* Navy header bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5"
        style={{ backgroundColor: INVOICE_HEX.navy }}
      >
        <span className="text-sm font-bold text-white">{partnerName}</span>
        <span className="text-xs font-medium text-blue-100">{issuerLabel}</span>
      </div>

      <div className="bg-white px-5 pb-5 pt-4">
        <div className="max-h-[420px] overflow-y-auto overflow-x-auto rounded-md">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr style={{ backgroundColor: INVOICE_HEX.surface }}>
                <th className="px-3 py-1.5 text-left font-semibold text-slate-600">Route</th>
                <th className="px-3 py-1.5 text-left font-semibold text-slate-600">Note</th>
                <th className="px-3 py-1.5 text-right font-semibold text-slate-600">Stops</th>
                <th className="px-3 py-1.5 text-right font-semibold text-slate-600">Amount</th>
                <th className="px-3 py-1.5 text-left font-semibold text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                    No invoices for this period
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.operationId} className="border-b border-gray-100">
                    <td className="px-3 py-1.5 font-medium text-slate-700">{item.routeName || "-"}</td>
                    <td className="px-3 py-1.5 text-slate-600">{item.note || "—"}</td>
                    <td className="px-3 py-1.5 text-right text-slate-600">{item.totalStops}</td>
                    <td className="px-3 py-1.5 text-right font-medium text-slate-800">{formatGbp(item.amount)}</td>
                    <td className="px-3 py-1.5 text-slate-600">{formatItemDate(item.date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Subtotal strip */}
        <div
          className="mt-4 flex justify-end rounded-lg px-5 py-3"
          style={{ backgroundColor: INVOICE_HEX.surface }}
        >
          <span className="text-sm font-bold" style={{ color: INVOICE_HEX.navy }}>
            Subtotal: {formatGbp(subtotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
