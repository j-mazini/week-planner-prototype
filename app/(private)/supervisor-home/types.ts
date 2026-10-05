export type RouteStatus = "completed" | "incomplete";

export type DepositRoute = {
  routeCode: string;
  driverName: string;
  sort: "Yes" | "No";
  status: RouteStatus;
  stops: number;
  failed: number;
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
  /** The previous business day — everything here is a day-after summary, except `vehiclesOut`. */
  date: string;
  vehiclesAsOfDate: string;
  allocatedDrivers: number;
  totalDrivers: number;
  notAllocatedDriverNames: string[];
  sortRatePercent: number;
  routes: DepositRoute[];
  topVendors: VendorPerformanceEntry[];
  attentionVendors: VendorPerformanceEntry[];
  vehiclesOut: VehicleOutOfOperation[];
};
