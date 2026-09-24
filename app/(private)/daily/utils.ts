// Utility functions for daily page

export const formatMonthLabel = (date: Date): string => {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
};

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export type FailedCodes = "NR" | "FP" | "BA" | "NH" | "SHP" | "CM";

export type FailedData = Record<FailedCodes, number>;

