import type { VendorModel } from "../types";

export function formatDateForDisplay(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

export function isExpired(expiryDate: string | null | undefined): boolean {
  if (!expiryDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return expiry < today;
}

export function isExpiringSoon(expiryDate: string | null | undefined): boolean {
  if (!expiryDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return expiry >= today && expiry <= thirtyDaysFromNow;
}

/** Training validity is 2 years from the completed date. */
export function getTrainingExpiryDate(completedDate: string | null | undefined): string | null {
  if (!completedDate) return null;
  const completed = new Date(completedDate);
  const expiry = new Date(completed);
  expiry.setFullYear(completed.getFullYear() + 2);
  return expiry.toISOString().split("T")[0];
}

export function isVendorActive(vendor: VendorModel): boolean {
  if (vendor.status) return vendor.status === "Active";
  return !vendor.finishDate || new Date(vendor.finishDate) > new Date();
}

export function isVendorPending(vendor: VendorModel): boolean {
  return !vendor.criminalRecordDate || !vendor.dvlaCheckDate;
}

export function isVendorExpiringSoon90(vendor: VendorModel): boolean {
  const today = new Date();
  const ninetyDaysFromNow = new Date(today);
  ninetyDaysFromNow.setDate(today.getDate() + 90);
  return [vendor.visaValidity, vendor.licenceExpiringDate, vendor.passportExpiringDate].some(
    (date) => date && new Date(date) <= ninetyDaysFromNow,
  );
}

export type BadgeTone = "active" | "inactive" | "expired" | "expiring" | "pending" | "verified" | "incomplete";

export function getStatusBadge(vendor: VendorModel): { tone: BadgeTone; label: string } {
  return isVendorActive(vendor) ? { tone: "active", label: "Active" } : { tone: "inactive", label: "Inactive" };
}

export function getTrainingBadge(vendor: VendorModel): { tone: BadgeTone; label: string } {
  const isComplete = vendor.cargoTraining && vendor.dangerousGoodsTraining && vendor.manualHandlingTraining;
  if (!isComplete) return { tone: "incomplete", label: "Incomplete" };

  const dates = [vendor.cargoTrainingDate, vendor.dangerousGoodsTrainingDate, vendor.manualHandlingTrainingDate];
  let hasExpired = false;
  let hasExpiringSoon = false;
  for (const date of dates) {
    const expiry = getTrainingExpiryDate(date);
    if (expiry && isExpired(expiry)) { hasExpired = true; break; }
    if (expiry && isExpiringSoon(expiry)) hasExpiringSoon = true;
  }
  if (hasExpired) return { tone: "expired", label: "Expired" };
  if (hasExpiringSoon) return { tone: "expiring", label: "Expiring Soon" };
  return { tone: "active", label: "Complete" };
}

export function getDocumentsBadge(vendor: VendorModel): { tone: BadgeTone; label: string } {
  const isVerified = vendor.criminalRecordDate && vendor.dvlaCheckDate;
  if (!isVerified) return { tone: "pending", label: "Pending" };

  const dates = [vendor.visaValidity, vendor.licenceExpiringDate, vendor.passportExpiringDate];
  let hasExpired = false;
  let hasExpiringSoon = false;
  for (const date of dates) {
    if (date && isExpired(date)) { hasExpired = true; break; }
    if (date && isExpiringSoon(date)) hasExpiringSoon = true;
  }
  if (hasExpired) return { tone: "expired", label: "Expired" };
  if (hasExpiringSoon) return { tone: "expiring", label: "Expiring Soon" };
  return { tone: "verified", label: "Verified" };
}

/** One-line summary of a vendor's current rate, shaped by their payment model's kind. */
export function formatRateSummary(vendor: VendorModel): string {
  const { rate } = vendor;
  if (rate.band1Stops != null) {
    return `Band 1: ≤${rate.band1Stops} stops @ £${rate.band1Rate?.toFixed(2)} · Band 2: £${rate.band2Rate?.toFixed(2)}`;
  }
  if (rate.stopRate != null) return `£${rate.stopRate.toFixed(2)} / stop`;
  if (rate.dayRate != null) return `£${rate.dayRate.toFixed(2)} / day`;
  if (rate.hourlyRate != null) return `£${rate.hourlyRate.toFixed(2)} / hour`;
  return "—";
}
