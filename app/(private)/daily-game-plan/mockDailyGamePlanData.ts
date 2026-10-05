/**
 * Mock data for the Daily Game Plan visual-only rebuild.
 * Adapted from the Figma export's `src/state.tsx` demo dataset.
 * Not wired to the real API — see the comment at the top of DailyGamePlanContent.tsx.
 *
 * Route codes: "OFF" means the driver is off today, "NALC" means Not Allocated
 * (no route assigned yet — these drivers also show up in the Not Allocated side
 * panel below), and anything else (e.g. "B04", "L02") is a real assigned route
 * code, depot-prefixed.
 */

export type DriverRow = {
  name: string;
  route: string;
  vehicle: string;
  sort: "Yes" | "No";
  notes: string;
  value: number;
  paymentMode: string;
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
export const PAYMENT_MODE_OPTIONS = ["Bank Transfer", "Cash", "Invoice"] as const;

const baopDrivers: DriverRow[] = [
  { name: "PEDRO MONTE", route: "OFF", vehicle: "UK OFF", sort: "No", notes: "MY NOTE", value: 0, paymentMode: "Bank Transfer" },
  { name: "GABRIEL LIMA DA SILVA", route: "NALC", vehicle: "UK OFF", sort: "No", notes: "", value: 0, paymentMode: "Bank Transfer" },
  { name: "ADRIANO DUTRA", route: "B04", vehicle: "YF25 OZL", sort: "Yes", notes: "", value: 145, paymentMode: "Bank Transfer" },
  { name: "BRUNO RIBEIRO", route: "B07", vehicle: "LV21 UFT", sort: "No", notes: "", value: 130, paymentMode: "Invoice" },
  { name: "CRISTIAN PLESU", route: "OFF", vehicle: "UK OFF", sort: "No", notes: "", value: 0, paymentMode: "Bank Transfer" },
  { name: "MARCOS ALVES", route: "B11", vehicle: "LV22 JHF", sort: "No", notes: "Delayed start", value: 130, paymentMode: "Cash" },
  { name: "RAFAEL SOUZA", route: "B15", vehicle: "YF25 OZL", sort: "Yes", notes: "", value: 150, paymentMode: "Bank Transfer" },
  { name: "THIAGO COSTA", route: "B18", vehicle: "LV21 UFT", sort: "No", notes: "", value: 130, paymentMode: "Invoice" },
  { name: "LUCAS FERREIRA", route: "NALC", vehicle: "UK OFF", sort: "No", notes: "", value: 0, paymentMode: "Bank Transfer" },
  { name: "DIEGO SANTOS", route: "B22", vehicle: "LV22 JHF", sort: "No", notes: "Covering B19", value: 140, paymentMode: "Bank Transfer" },
];

const lcyDrivers: DriverRow[] = [
  { name: "FELIPE ARAUJO", route: "L02", vehicle: "LV21 UFT", sort: "No", notes: "", value: 135, paymentMode: "Bank Transfer" },
  { name: "JOAO PEREIRA", route: "L05", vehicle: "YF25 OZL", sort: "Yes", notes: "", value: 150, paymentMode: "Cash" },
  { name: "ANDRE NASCIMENTO", route: "OFF", vehicle: "UK OFF", sort: "No", notes: "Day off", value: 0, paymentMode: "Bank Transfer" },
  { name: "CARLOS EDUARDO", route: "NALC", vehicle: "UK OFF", sort: "No", notes: "", value: 0, paymentMode: "Bank Transfer" },
];

const mseDrivers: DriverRow[] = [
  { name: "RICARDO GOMES", route: "M03", vehicle: "LV22 JHF", sort: "No", notes: "", value: 130, paymentMode: "Invoice" },
  { name: "VINICIUS ROCHA", route: "M06", vehicle: "YF25 OZL", sort: "No", notes: "", value: 130, paymentMode: "Bank Transfer" },
  { name: "EDUARDO MARTINS", route: "M09", vehicle: "LV21 UFT", sort: "Yes", notes: "", value: 150, paymentMode: "Bank Transfer" },
];

const lseDrivers: DriverRow[] = [
  { name: "ANTONIO BARBOSA", route: "S01", vehicle: "UK OFF", sort: "No", notes: "", value: 135, paymentMode: "Bank Transfer" },
  { name: "SAMUEL TEIXEIRA", route: "S04", vehicle: "LV22 JHF", sort: "No", notes: "", value: 135, paymentMode: "Cash" },
  { name: "GUSTAVO MOURA", route: "NALC", vehicle: "UK OFF", sort: "No", notes: "", value: 0, paymentMode: "Bank Transfer" },
];

/** @deprecated kept for backwards-compat with anything importing the old name; prefer initialDeposits.BAOP.drivers */
export const initialDrivers = baopDrivers;

export const initialDeposits: Record<DepositKey, DepositMock> = {
  BAOP: { key: "BAOP", lead: "LEANDRO DIAS", hasData: true, drivers: baopDrivers },
  LCY: { key: "LCY", lead: "MARLON VALASAN", hasData: true, drivers: lcyDrivers },
  MSE: { key: "MSE", lead: "JULIO DI GIACONO", hasData: true, drivers: mseDrivers },
  LSE: { key: "LSE", lead: "ADRIANO DUTRA", hasData: true, drivers: lseDrivers },
};

export type NotAllocatedEntry = {
  vendorName: string;
  assignedHub: string;
  defaultRoute: string;
  notes: string;
};

export const notAllocatedMock: NotAllocatedEntry[] = [
  { vendorName: "Gabriel Lima Da Silva", assignedHub: "BAOP / BACP", defaultRoute: "—", notes: "" },
  { vendorName: "Lucas Ferreira", assignedHub: "BAOP / BACP", defaultRoute: "B19", notes: "Usually covers B19" },
  { vendorName: "Carlos Eduardo", assignedHub: "LCY / BACP", defaultRoute: "—", notes: "" },
  { vendorName: "Gustavo Moura", assignedHub: "LSE / BACP", defaultRoute: "S07", notes: "Awaiting vehicle swap" },
];

export type VendorOffEntry = {
  vendorName: string;
  assignedHub: string;
  reason: string;
};

export const vendorsOffMock: VendorOffEntry[] = [
  { vendorName: "Pedro Monte", assignedHub: "BAOP / BACP", reason: "Day off" },
  { vendorName: "Cristian Plesu", assignedHub: "BAOP / BACP", reason: "Sick leave" },
  { vendorName: "Andre Nascimento", assignedHub: "LCY / BACP", reason: "Day off" },
];

export const weekLabel = "W34";
export const weekRangeLabel = "13 JUL — 19 JUL 2024";
