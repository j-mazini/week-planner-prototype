"use client";

import React from "react";
import { INVOICE_HEX } from "../constants/invoiceTheme";

interface ServicePartnerDetailsBlockProps {
  name: string;
  address?: string | null;
  phone?: string | null;
  vatNumber?: string | null;
}

/**
 * Service Partner details block displayed in the invoice header.
 * Shows partner name, address, phone, and VAT number in a branded format.
 * Mirrors the BaExpressHeader styling for consistency.
 */
export function ServicePartnerDetailsBlock({
  name,
  address,
  phone,
  vatNumber,
}: ServicePartnerDetailsBlockProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="leading-snug flex-grow">
        <p className="text-xs font-extrabold mb-1" style={{ color: INVOICE_HEX.navy }}>FROM</p>
        <p className="text-lg font-extrabold tracking-tight" style={{ color: INVOICE_HEX.navy }}>
          {name}
        </p>
        {address && <p className="text-sm text-gray-600 mt-1">{address}</p>}
        {phone && <p className="text-sm text-gray-600">{phone}</p>}
        {vatNumber && <p className="text-sm text-gray-600">VAT: {vatNumber}</p>}
        {!address && !phone && !vatNumber && (
          <p className="text-sm text-gray-400 mt-1">No additional details available</p>
        )}
      </div>
    </div>
  );
}
