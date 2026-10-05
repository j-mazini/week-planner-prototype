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
  gamePlan: {
    entries: [
      { routeCode: "B04", driverName: "Adriano Dutra", vehicle: "YF25 OZL", sort: "Yes" },
      { routeCode: "B07", driverName: "Bruno Ribeiro", vehicle: "LV21 UFT", sort: "No" },
      { routeCode: "B11", driverName: "Marcos Alves", vehicle: "LV22 JHF", sort: "No" },
      { routeCode: "B15", driverName: "Rafael Souza", vehicle: "YF24 MTX", sort: "Yes" },
      { routeCode: "B18", driverName: "Thiago Costa", vehicle: "LV23 KPD", sort: "Yes" },
      { routeCode: "B19", driverName: "Pedro Monte", vehicle: "LV24 RSW", sort: "Yes" },
      { routeCode: "B22", driverName: "Diego Santos", vehicle: "YF26 BLN", sort: "Yes" },
      { routeCode: "B25", driverName: "Cristian Plesu", vehicle: "LV25 TQD", sort: "Yes" },
    ],
    notAllocated: ["GABRIEL LIMA DA SILVA", "LUCAS FERREIRA"],
  },
  allocatedDrivers: 8,
  totalDrivers: 10,
  notAllocatedDriverNames: ["GABRIEL LIMA DA SILVA", "LUCAS FERREIRA"],
  sortRatePercent: 75,
  sortRatePrevious: 60,
  stopsDelivered: 1096,
  stopsDeliveredPrevious: 1081,
  failures: 13,
  failuresPrevious: 16,
  stopsSeries: { labels: WEEK_LABELS, values: [1042, 1064, 1057, 1085, 1071, 1081, 1096] },
  failuresSeries: { labels: WEEK_LABELS, values: [18, 14, 17, 12, 19, 16, 13] },
  sortRateSeries: { labels: WEEK_LABELS, values: [60, 60, 75, 75, 50, 60, 75] },
  routes: [
    { routeCode: "B04", driverName: "Adriano Dutra", vehicle: "YF25 OZL", sort: "Yes", stops: 142, plannedStops: 142, notReceived: 0, failedPick: 0, sph: 17.8, timeWindowPercent: 98.6, departTime: "09:12", arriveTime: "17:04" },
    { routeCode: "B07", driverName: "Bruno Ribeiro", vehicle: "LV21 UFT", sort: "No", stops: 138, plannedStops: 142, notReceived: 3, failedPick: 1, sph: 16.2, timeWindowPercent: 94.2, departTime: "09:05", arriveTime: "17:38" },
    { routeCode: "B11", driverName: "Marcos Alves", vehicle: "LV22 JHF", sort: "No", stops: 126, plannedStops: 130, notReceived: 3, failedPick: 1, sph: 17.4, timeWindowPercent: 81.3, departTime: "10:26", arriveTime: "17:41", note: "Late start" },
    { routeCode: "B15", driverName: "Rafael Souza", vehicle: "YF24 MTX", sort: "Yes", stops: 150, plannedStops: 150, notReceived: 0, failedPick: 0, sph: 18.9, timeWindowPercent: 99.3, departTime: "08:58", arriveTime: "16:52" },
    { routeCode: "B18", driverName: "Thiago Costa", vehicle: "LV23 KPD", sort: "Yes", stops: 128, plannedStops: 130, notReceived: 2, failedPick: 0, sph: 16.1, timeWindowPercent: 95.8, departTime: "09:22", arriveTime: "17:20" },
    { routeCode: "B19", driverName: "Pedro Monte", vehicle: "LV24 RSW", sort: "Yes", stops: 144, plannedStops: 146, notReceived: 1, failedPick: 1, sph: 18.2, timeWindowPercent: 97.1, departTime: "09:02", arriveTime: "16:58" },
    { routeCode: "B22", driverName: "Diego Santos", vehicle: "YF26 BLN", sort: "Yes", stops: 135, plannedStops: 136, notReceived: 1, failedPick: 0, sph: 16.9, timeWindowPercent: 96.7, departTime: "09:18", arriveTime: "17:12" },
    { routeCode: "B25", driverName: "Cristian Plesu", vehicle: "LV25 TQD", sort: "Yes", stops: 133, plannedStops: 133, notReceived: 0, failedPick: 0, sph: 17.1, timeWindowPercent: 98.9, departTime: "09:10", arriveTime: "17:08" },
  ],
  depositAverageScore: 93.1,
  depositAverageScorePrevious: 92.4,
  rankedVendors: 8,
  topVendors: [
    { vendorName: "Rafael Souza", routeCode: "B15", score: 99.2, previousScore: 98.0 },
    { vendorName: "Adriano Dutra", routeCode: "B04", score: 98.1, previousScore: 98.6 },
    { vendorName: "Diego Santos", routeCode: "B22", score: 97.4, previousScore: 95.9 },
  ],
  attentionVendors: [
    { vendorName: "Marcos Alves", routeCode: "B11", score: 87.6, previousScore: 85.2, flag: "Late start" },
    { vendorName: "Bruno Ribeiro", routeCode: "B07", score: 83.1, previousScore: 90.4, flag: "4 failed picks" },
  ],
};
