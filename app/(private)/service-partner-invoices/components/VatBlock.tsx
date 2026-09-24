"use client";

import React from "react";
import { INVOICE_HEX } from "../constants/invoiceTheme";
import { formatGbp } from "../utils/format";

interface VatBlockProps {
  amount: number;
}

/** VAT strip shown below deductions and above the net total — VAT is applied AFTER deductions, mirroring normal invoices. */
export function VatBlock({ amount }: VatBlockProps) {
  if (amount <= 0) return null;

  return (
    <div
      className="flex items-center justify-between rounded-xl border px-5 py-3"
      style={{ backgroundColor: INVOICE_HEX.surface, borderColor: INVOICE_HEX.surfaceBorder }}
    >
      <span className="text-sm font-bold" style={{ color: INVOICE_HEX.navy }}>
        VAT (20%)
      </span>
      <span className="text-sm font-bold" style={{ color: INVOICE_HEX.navy }}>
        {formatGbp(amount)}
      </span>
    </div>
  );
}
