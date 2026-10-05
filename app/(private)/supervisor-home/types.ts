export type RouteStatus = "completed" | "incomplete";

export type DepositRoute = {
  routeCode: string;
  driverName: string;
  sort: "Yes" | "No";
  status: RouteStatus;
  stops: number;
  plannedStops: number;
  /** Not Received */
  notReceived: number;
  /** Failed Pick */
  failedPick: number;
  note?: string;
};

export type VendorPerformanceEntry = {
  vendorName: string;
  routeCode: string;
  score: number;
  /** Score for the same period a week before — drives the trend arrow. */
  previousScore: number;
  flag?: string;
};

export type VehicleIssueType = "maintenance" | "unassigned" | "inactive";

export type VehicleOutOfOperation = {
  registration: string;
  issueType: VehicleIssueType;
  reason: string;
  since: string;
  expectedBack?: string;
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
