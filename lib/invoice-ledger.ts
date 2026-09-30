import type { Invoice } from "@/app/(private)/mobile-invoice/types";

export interface LedgerMonth {
  /** Sort key, e.g. "2026-08". */
  key: string;
  /** What the driver reads, e.g. "August 2026". */
  label: string;
  total: number;
  invoices: Invoice[];
}

export interface Ledger {
  months: LedgerMonth[];
  /** The most recent payment and the month it covers, or null when there is nothing. */
  latest: { amount: number; period: string } | null;
  count: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** The month an invoice *covers*, which is its reference date — not the day it was issued. */
const coveredMonth = (invoice: Invoice): { key: string; label: string } | null => {
  const date = new Date(invoice.referenceDate);
  if (Number.isNaN(date.getTime())) return null;
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();
  return { key: `${year}-${String(month + 1).padStart(2, "0")}`, label: `${MONTHS[month]} ${year}` };
};

/**
 * Turns a flat invoice list into what the page shows: months newest first, each with its
 * own total, plus the latest payment. Invoices with an unreadable reference date are left
 * out rather than bundled into a month they may not belong to.
 */
export const buildLedger = (invoices: Invoice[]): Ledger => {
  const byMonth = new Map<string, LedgerMonth>();

  for (const invoice of invoices) {
    const month = coveredMonth(invoice);
    if (!month) continue;
    const existing = byMonth.get(month.key);
    if (existing) {
      existing.invoices.push(invoice);
      existing.total += invoice.totalPayment;
    } else {
      byMonth.set(month.key, { ...month, total: invoice.totalPayment, invoices: [invoice] });
    }
  }

  const months = [...byMonth.values()].sort((a, b) => b.key.localeCompare(a.key));
  for (const month of months) {
    month.invoices.sort((a, b) => b.referenceDate.localeCompare(a.referenceDate));
    // Float addition drifts; invoices are money and must not show 350.49999999999994.
    month.total = Math.round(month.total * 100) / 100;
  }

  const newest = months[0]?.invoices[0];
  return {
    months,
    latest: newest ? { amount: newest.totalPayment, period: months[0].label } : null,
    count: months.reduce((sum, month) => sum + month.invoices.length, 0),
  };
};
