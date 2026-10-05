/** A route's day, named the way Daily Operations Insights
 *  (`/daily-operations-reports`) names it: Route, Vendor, VRN, TW %, Depart,
 *  Arrive, Work Hours, Stops, Note. */
export type DepositRoute = {
  routeCode: string;
  vendorName: string;
  /** Vehicle Registration Number. */
  vrn: string;
  sort: "Yes" | "No";
  /** Stops delivered. A route is always run to the end, so the gap against
   *  `plannedStops` is `notReceived + failedPick`, never unattempted stops. */
  stops: number;
  plannedStops: number;
  /** Not Received */
  notReceived: number;
  /** Failed Pick */
  failedPick: number;
  /** Stops per route-hour — "SPOR-H" across the rest of the app. */
  sporH: number;
  /** TW — deliveries made inside their time window, as a percentage
   *  (`route_time_windows.percentage_ot_tw_dl` on the backend). */
  timeWindowPercent: number;
  departTime: string;
  arriveTime: string;
  workHours: string;
  note?: string;
};

/** A vendor's week, carrying the columns `/vendor-performance` breaks a vendor
 *  down by: NR, FP, SPOR-H and RTW. */
export type VendorPerformanceEntry = {
  vendorName: string;
  routeCode: string;
  score: number;
  /** Score for the same period a week before — drives the trend delta. */
  previousScore: number;
  /** Not Received */
  notReceived: number;
  /** Failed Pick */
  failedPick: number;
  sporH: number;
  /** Route Time Window %. */
  rtw: number;
};

/** A metric measured once per business day, oldest first. */
export type DailySeries = {
  /** Short day labels aligned with `values`, e.g. ["Mon", "Tue", …]. */
  labels: string[];
  values: number[];
};

import type { DriverRow } from "@/app/(private)/daily-game-plan/mockDailyGamePlanData";

/** The deposit's Daily Game Plan, taken from that page's own dataset so the
 *  home block shows the same drivers and routes and can never drift from it. */
/** `deposit` is set only when the view spans more than one, since a route code
 *  is depot-prefixed but "OFF" and "NALC" are not. */
export type GamePlanDriver = DriverRow & { deposit?: string };

export type DailyGamePlan = {
  lead: string;
  drivers: GamePlanDriver[];
};

export type RouteBalanceSummary = {
  pendingRoutes: number;
  unassignedStops: number;
  /** Index into OPERATION_STAGES — how far today's operation has progressed. */
  stage: number;
  lastUpdated: string;
};

export type SupervisorHomeSummary = {
  depositKey: string;
  depositLead: string;
  /** The previous business day — everything here is a day-after summary, except the operation status block below. */
  date: string;
  /** Whether today's operation has been finalized in the Daily Game Plan. Drives the bottom block: Route Balance (not yet finalized) vs. Daily Game Plan (finalized). */
  dayFinalized: boolean;
  finalizedAt?: string;
  routeBalance: RouteBalanceSummary;
  /** Today's allocation, listed when the operation block is on the game-plan view. */
  gamePlan: DailyGamePlan;
  allocatedDrivers: number;
  totalDrivers: number;
  /** Drivers who did not run a route. A finished day has no unallocated
   *  driver — either they ran it or they were off. */
  driversOff: string[];
  sortRatePercent: number;
  stopsDelivered: number;
  stopsDeliveredPrevious: number;
  failures: number;
  failuresPrevious: number;
  sortRatePrevious: number;
  stopsSeries: DailySeries;
  failuresSeries: DailySeries;
  sortRateSeries: DailySeries;
  routes: DepositRoute[];
  /** Deposit-wide average used as the reference marker on the vendor scale. */
  depositAverageScore: number;
  depositAverageScorePrevious: number;
  topVendors: VendorPerformanceEntry[];
  attentionVendors: VendorPerformanceEntry[];
};
