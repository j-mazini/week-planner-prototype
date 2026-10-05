/**
 * Mock data for the Supervisor Home visual-only build — not wired to the
 * real API yet. Open items before it reads real data:
 * - no backend endpoint returns a 7-day vendor performance ranking scoped
 *   to one deposit yet (/bff/daily-overview returns per-user/day rows);
 * - deposit/supervisor resolution would reuse lib/daily-supervisor-check.ts.
 *
 * Everything here summarizes the previous business day — routes, sort,
 * performance — except `dayFinalized`/`routeBalance`, which reflect
 * today's in-progress operation.
 */
import { initialDeposits } from "@/app/(private)/daily-game-plan/mockDailyGamePlanData";
import type { SupervisorHomeSummary } from "./types";

/** The day's lifecycle in Route Balance, in order. `routeBalance.stage` indexes this. */
export const OPERATION_STAGES = ["Routes imported", "Balanced", "Sent to drivers", "Finalized"] as const;

function previousBusinessDayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  if (d.getDay() === 0) d.setDate(d.getDate() - 2); // Sunday -> Friday
  if (d.getDay() === 6) d.setDate(d.getDate() - 1); // Saturday -> Friday
  return d.toISOString().slice(0, 10);
}

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Mon", "Tue"];

export const mockSupervisorHomeSummary: SupervisorHomeSummary = {
  depositKey: "BAOP",
  depositLead: "Leandro Dias",
  date: previousBusinessDayIso(),
  dayFinalized: false,
  routeBalance: { pendingRoutes: 2, unassignedStops: 14, stage: 1, lastUpdated: "08:42" },
  // Straight from the Daily Game Plan's own dataset — the block is a smaller
  // view of that page, not a second copy of the same plan.
  gamePlan: { lead: initialDeposits.BAOP.lead, drivers: initialDeposits.BAOP.drivers },
  allocatedDrivers: 8,
  totalDrivers: 10,
  notAllocatedDriverNames: ["GABRIEL LIMA DA SILVA", "LUCAS FERREIRA"],
  sortRatePercent: 80,
  sortRatePrevious: 75,
  stopsDelivered: 691,
  stopsDeliveredPrevious: 678,
  failures: 9,
  failuresPrevious: 11,
  stopsSeries: { labels: WEEK_LABELS, values: [642, 664, 657, 685, 671, 678, 691] },
  failuresSeries: { labels: WEEK_LABELS, values: [14, 9, 12, 8, 15, 11, 9] },
  sortRateSeries: { labels: WEEK_LABELS, values: [60, 60, 80, 75, 60, 75, 80] },
  routes: [
    { routeCode: "B04", vendorName: "ADRIANO DUTRA", vrn: "YF25 OZL", sort: "Yes", stops: 142, plannedStops: 142, notReceived: 0, failedPick: 0, sporH: 17.8, timeWindowPercent: 98.6, departTime: "09:12", arriveTime: "17:04", workHours: "7:52" },
    { routeCode: "B07", vendorName: "BRUNO RIBEIRO", vrn: "LV21 UFT", sort: "No", stops: 138, plannedStops: 142, notReceived: 3, failedPick: 1, sporH: 16.2, timeWindowPercent: 94.2, departTime: "09:05", arriveTime: "17:38", workHours: "8:33" },
    { routeCode: "B11", vendorName: "MARCOS ALVES", vrn: "LV22 JHF", sort: "No", stops: 126, plannedStops: 130, notReceived: 3, failedPick: 1, sporH: 17.4, timeWindowPercent: 81.3, departTime: "10:26", arriveTime: "17:41", workHours: "7:15", note: "Late start" },
    { routeCode: "B15", vendorName: "RAFAEL SOUZA", vrn: "YF25 OZL", sort: "Yes", stops: 150, plannedStops: 150, notReceived: 0, failedPick: 0, sporH: 18.9, timeWindowPercent: 99.3, departTime: "08:58", arriveTime: "16:52", workHours: "7:54" },
    { routeCode: "B22", vendorName: "DIEGO SANTOS", vrn: "LV22 JHF", sort: "No", stops: 135, plannedStops: 136, notReceived: 1, failedPick: 0, sporH: 16.9, timeWindowPercent: 96.7, departTime: "09:18", arriveTime: "17:12", workHours: "7:54", note: "Covering B19" },
  ],
  depositAverageScore: 93.1,
  depositAverageScorePrevious: 92.4,
  topVendors: [
    { vendorName: "RAFAEL SOUZA", routeCode: "B15", score: 99.2, previousScore: 98.0, notReceived: 1, failedPick: 0, sporH: 18.4, rtw: 99.1 },
    { vendorName: "ADRIANO DUTRA", routeCode: "B04", score: 98.1, previousScore: 98.6, notReceived: 2, failedPick: 1, sporH: 17.6, rtw: 98.2 },
    { vendorName: "DIEGO SANTOS", routeCode: "B22", score: 97.4, previousScore: 95.9, notReceived: 3, failedPick: 1, sporH: 16.8, rtw: 96.9 },
  ],
  attentionVendors: [
    { vendorName: "MARCOS ALVES", routeCode: "B11", score: 87.6, previousScore: 85.2, notReceived: 7, failedPick: 2, sporH: 16.0, rtw: 84.7 },
    { vendorName: "BRUNO RIBEIRO", routeCode: "B07", score: 83.1, previousScore: 90.4, notReceived: 9, failedPick: 4, sporH: 15.1, rtw: 88.4 },
  ],
};
