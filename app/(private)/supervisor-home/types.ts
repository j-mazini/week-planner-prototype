export type RouteStatus = "on-track" | "attention" | "off";

export type DepositRoute = {
  routeCode: string;
  driverName: string;
  sort: "Yes" | "No";
  status: RouteStatus;
  note?: string;
};

export type VendorPerformanceEntry = {
  vendorName: string;
  routeCode: string;
  score: number;
  flag?: string;
};

export type VehicleOutOfOperation = {
  registration: string;
  reason: string;
  since: string;
};

export type SupervisorHomeSummary = {
  depositKey: string;
  depositLead: string;
  date: string;
  allocatedDrivers: number;
  totalDrivers: number;
  notAllocatedDriverNames: string[];
  sortRatePercent: number;
  routes: DepositRoute[];
  topVendors: VendorPerformanceEntry[];
  attentionVendors: VendorPerformanceEntry[];
  vehiclesOut: VehicleOutOfOperation[];
};
