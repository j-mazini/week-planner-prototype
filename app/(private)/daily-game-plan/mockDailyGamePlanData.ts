/**
 * Mock data for the Daily Game Plan visual-only rebuild.
 * Adapted from the Figma export's `src/state.tsx` demo dataset.
 * Not wired to the real API — see the comment at the top of DailyGamePlanContent.tsx.
 */

export type DriverRow = {
  name: string;
  route: string;
  vehicle: string;
  sort: "Yes" | "No";
  notes: string;
};

export type DepositKey = "BAOP" | "LCY" | "MSE" | "LSE";

export type DepositMock = {
  key: DepositKey;
  lead: string;
  hasData: boolean;
  drivers: DriverRow[];
};

export const VEHICLE_OPTIONS = ["UK OFF", "YF25 OZL", "LV21 UFT", "LV22 JHF"] as const;
export const SORT_OPTIONS = ["Yes", "No"] as const;

export const initialDrivers: DriverRow[] = [
  { name: "PEDRO MONTE", route: "OFF", vehicle: "UK OFF", sort: "No", notes: "MY NOTE" },
  { name: "GABRIEL LIMA DA SILVA", route: "NALC", vehicle: "UK OFF", sort: "No", notes: "" },
  { name: "ADRIANO DUTRA", route: "NALC", vehicle: "UK OFF", sort: "Yes", notes: "" },
  { name: "BRUNO RIBEIRO", route: "NALC", vehicle: "UK OFF", sort: "No", notes: "" },
  { name: "CRISTIAN PLESU", route: "NALC", vehicle: "UK OFF", sort: "No", notes: "" },
];

export const initialDeposits: Record<DepositKey, DepositMock> = {
  BAOP: { key: "BAOP", lead: "LEANDRO DIAS", hasData: true, drivers: initialDrivers },
  LCY: { key: "LCY", lead: "MARLON VALASAN", hasData: false, drivers: [] },
  MSE: { key: "MSE", lead: "JULIO DI GIACONO", hasData: false, drivers: [] },
  LSE: { key: "LSE", lead: "ADRIANO DUTRA", hasData: false, drivers: [] },
};

export type NotAllocatedEntry = {
  vendorName: string;
  assignedHub: string;
  defaultRoute: string;
  notes: string;
};

export const notAllocatedMock: NotAllocatedEntry[] = [
  { vendorName: "Gabriel Lima Da Silva", assignedHub: "BAOP / BACP", defaultRoute: "—", notes: "" },
];

export type VendorOffEntry = {
  vendorName: string;
  assignedHub: string;
  reason: string;
};

export const vendorsOffMock: VendorOffEntry[] = [
  { vendorName: "Pedro Monte", assignedHub: "BAOP / BACP", reason: "Day off" },
  { vendorName: "Cristian Plesu", assignedHub: "BAOP / BACP", reason: "Sick leave" },
];

export const weekLabel = "W34";
export const weekRangeLabel = "13 JUL — 19 JUL 2024";
