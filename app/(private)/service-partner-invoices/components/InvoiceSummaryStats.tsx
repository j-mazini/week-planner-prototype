"use client";

import React from "react";
import { INVOICE_HEX } from "../constants/invoiceTheme";

interface StatCard {
  label: string;
  value: string;
  /** When true, the value is rendered in the positive (green) accent. */
  positive?: boolean;
}

interface InvoiceSummaryStatsProps {
  cards: StatCard[];
}

/**
 * The light-blue stat-card strip shown under the "Invoice summary" heading
 * (Generated, Period, Service Partners, Total Items, Total Amount).
 * Presentation only — values are pre-formatted by the caller.
 */
export function InvoiceSummaryStats({ cards }: InvoiceSummaryStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border px-4 py-3"
          style={{ backgroundColor: INVOICE_HEX.surface, borderColor: INVOICE_HEX.surfaceBorder }}
        >
          <p className="text-xs uppercase tracking-wide text-gray-500">{card.label}</p>
          <p
            className="mt-1 text-base font-bold"
            style={{ color: card.positive ? INVOICE_HEX.green : INVOICE_HEX.navy }}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
