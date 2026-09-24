/** Formats a numeric amount as GBP currency (e.g. £1,234.50). Tolerates numeric strings from the API. */
export function formatGbp(amount: number): string {
  const parsed = Number(amount);
  const value = Number.isFinite(parsed) ? parsed : 0;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Returns a human-readable month/year label (e.g. "May 2026"). 1-based month. */
export function monthYearLabel(month: number, year: number): string {
  const date = new Date(year, Math.max(0, month - 1), 1);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** Strips the time/timezone from an ISO date string, returning only YYYY-MM-DD. */
export function formatItemDate(dateStr: string): string {
  if (!dateStr) return "—";
  return dateStr.substring(0, 10);
}

interface DeductionReferenceInput {
  servicePartnerDeductionId?: number | null;
  service_partner_deduction_id?: number | null;
  deductionAmount?: number | null;
  deduction_amount?: number | null;
  reimbursementsAmount?: number | null;
  reimbursements_amount?: number | null;
}

/**
 * Standard invoice/reference number for Service Partner Invoices:
 * - SP 000{ID}
 */
export function formatDeductionReference(input: DeductionReferenceInput): string {
  const id = input.servicePartnerDeductionId ?? input.service_partner_deduction_id;
  if (!id) return "—";

  return `SP 000${id}`;
}
