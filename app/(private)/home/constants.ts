export const DEPOTS = ["LCY", "MSE", "LSE", "BASP"] as const;

export const VEHICLE_PAGE_SIZES = [3, 5, 10] as const;

export const COMPLIANCE_CATEGORY_LABELS: Record<string, string> = {
  cargo: "Cargo",
  dangerous: "Dangerous Goods",
  manual: "Manual Handling",
};
