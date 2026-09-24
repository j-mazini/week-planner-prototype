"use client";

import React from "react";
import { BA_COMPANY } from "../constants/baCompany";
import { INVOICE_HEX } from "../constants/invoiceTheme";

interface BaExpressHeaderProps {
  /** Period label shown inside the action-blue pill (e.g. "MAY 2026"). */
  period: string;
  /** Invoice number (e.g. "SP 000123"). Optional. */
  invoiceNumber?: string;
  /** Invoice date in format MMYYYY or ISO date (e.g. "062026" or "2026-06-30"). Optional. */
  invoiceDate?: string;
}

/**
 * Formats date from various formats to DD/MM/YYYY.
 * @param dateStr Date in MMYYYY format (e.g., "062026") or ISO format (e.g., "2026-06-30")
 */
function formatDateDDMMYYYY(dateStr?: string): string {
  if (!dateStr) return "";

  // Handle MMYYYY format
  if (/^\d{6}$/.test(dateStr)) {
    const mm = dateStr.slice(0, 2);
    const yyyy = dateStr.slice(2);
    return `01/${mm}/${yyyy}`;
  }

  // Handle ISO date format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }

  return dateStr;
}

/**
 * Formats invoice number to SP-INV-XXXXXX format.
 * Extracts numeric ID from input and pads to 6 digits.
 * @param invoiceNumber Invoice number (e.g., "SP 000123" or "123")
 */
function formatInvoiceNumber(invoiceNumber?: string): string {
  if (!invoiceNumber) return "";

  // Extract numeric part from invoice number
  const numericMatch = invoiceNumber.match(/\d+/);
  if (!numericMatch) return invoiceNumber;

  const id = numericMatch[0];
  const paddedId = id.padStart(6, "0");
  return `SP-INV-${paddedId}`;
}

/**
 * BA Express branded header for the invoice document: the BA logo box and
 * company identity on the left, and a light-blue title box with a navy/blue
 * period pill on the right. Mirrors the reference PDF header.
 */
export function BaExpressHeader({ period: _period, invoiceNumber, invoiceDate }: BaExpressHeaderProps) {
  const formattedDate = formatDateDDMMYYYY(invoiceDate);
  const formattedInvoiceNumber = formatInvoiceNumber(invoiceNumber);
  return (
    <div className="flex items-start justify-between gap-6 border-b border-gray-200 pb-6">
      <div className="flex items-start gap-4">
        <div className="leading-snug">
          <p className="text-xs font-extrabold mb-1" style={{ color: INVOICE_HEX.navy }}>TO</p>
          <p className="text-xl font-extrabold tracking-tight" style={{ color: INVOICE_HEX.navy }}>
            {BA_COMPANY.name}
          </p>
          <p className="text-sm text-gray-500">{BA_COMPANY.address}</p>
          <p className="text-sm text-gray-500">{BA_COMPANY.email}</p>
          <p className="text-sm text-gray-500">{BA_COMPANY.vat}</p>
        </div>
      </div>

      <div
        className="min-w-[200px] rounded-xl px-5 py-4 space-y-2"
        style={{ backgroundColor: INVOICE_HEX.surface }}
      >
        {formattedInvoiceNumber && (
          <div>
            <p className="text-xs font-extrabold text-left" style={{ color: INVOICE_HEX.navy }}>
              Invoice Number:
            </p>
            <p className="text-sm font-black text-center" style={{ color: INVOICE_HEX.navy }}>
              {formattedInvoiceNumber}
            </p>
          </div>
        )}
        {formattedDate && (
          <div>
            <p className="text-xs font-extrabold text-left" style={{ color: INVOICE_HEX.navy }}>
              Date:
            </p>
            <p className="text-sm font-black text-center" style={{ color: INVOICE_HEX.navy }}>
              {formattedDate}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
