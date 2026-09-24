"use client";

import React from "react";
import { INVOICE_HEX } from "../constants/invoiceTheme";
import { formatGbp } from "../utils/format";

interface GrandTotalBarProps {
  total: number;
  /** Caption under the label (e.g. "1 invoice, 1 item"). */
  caption: string;
}

/** Navy grand-total bar shown at the bottom of the invoice document. */
export function GrandTotalBar({ total, caption }: GrandTotalBarProps) {
  return (
    <div
      className="flex items-center justify-between rounded-xl px-6 py-4"
      style={{ backgroundColor: INVOICE_HEX.navy }}
    >
      <div className="leading-tight">
        <p className="text-base font-bold text-white">Grand Total</p>
        <p className="text-xs text-blue-100">({caption})</p>
      </div>
      <p className="text-2xl font-extrabold text-white">{formatGbp(total)}</p>
    </div>
  );
}
