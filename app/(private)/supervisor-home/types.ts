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

export type RouteBalanceSummary = {
  pendingRoutes: number;
  unassignedStops: number;
};

export type SupervisorHomeSummary = {
  depositKey: string;
  depositLead: string;
  /** The previous business day — everything here is a day-after summary, except the operation status block below. */
  date: string;
  /** Whether today's operation has been finalized in the Daily Game Plan. Drives the bottom block: Route Balance (not yet finalized) vs. Daily Game Plan (finalized). */
  dayFinalized: boolean;
  routeBalance: RouteBalanceSummary;
  allocatedDrivers: number;
  totalDrivers: number;
  notAllocatedDriverNames: string[];
  sortRatePercent: number;
  routes: DepositRoute[];
  topVendors: VendorPerformanceEntry[];
  attentionVendors: VendorPerformanceEntry[];
};
