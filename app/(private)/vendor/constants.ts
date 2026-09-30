import type { CostModelKind } from "@/lib/mocks/vendor-fixtures";

export const STATUS_FILTERS = ["all", "active", "inactive", "expiring", "pending"] as const;

export const PAGE_SIZES = [10, 25, 50] as const;

export type FormStep = "personal" | "address" | "employment" | "cost" | "training" | "compliance";

export const FORM_STEPS: { id: FormStep; label: string }[] = [
  { id: "personal", label: "Personal" },
  { id: "address", label: "Address" },
  { id: "employment", label: "Contract" },
  { id: "cost", label: "Cost Model" },
  { id: "training", label: "Training" },
  { id: "compliance", label: "Compliance" },
];

export const IMMIGRATION_STATUSES = ["Citizen", "Pre-Settlement", "Settlement", "Visa"] as const;

export const RATE_FIELD_LABELS: Record<CostModelKind, string> = {
  band: "Two-band rate",
  perStop: "Per stop",
  perDay: "Per day",
  perHour: "Per hour",
};
