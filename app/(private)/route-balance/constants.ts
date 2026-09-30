export const HEADER_ACTIONS = [
  { id: "rebalance", label: "Rebalance" },
  { id: "operations", label: "Operations" },
  { id: "import", label: "Import" },
] as const;

export const DRIVERS = ["Carlos Silva", "Ana Costa", "M. Whitfield", "K. Lennon", "J. Corrigan", "R. Chandran"];
export const VEHICLES = ["YF25 OZL", "LD68 XXS", "Car-001", "BV23 ORE", "KV68 TRD", "LR71 PFA"];
export const ROUTE_CODES = ["A-01", "A-02", "A-03", "B-01", "B-02", "B-03", "C-01", "C-02"];

export const SHIPMENT_TYPES = ["COY", "COY-S1", "COY-S2", "FLY", "NCY", "PAL"];

export const IMPORT_STEP = {
  UPLOAD: "upload",
  PROCESSED: "processed",
  SUCCESS: "success",
} as const;

export type ImportStep = (typeof IMPORT_STEP)[keyof typeof IMPORT_STEP];
